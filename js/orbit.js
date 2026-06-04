// ════════════════════════════════════════════════════════════
//  ORBIT — Orbital Physics
//  Player orb, energy fragments, harmony system
// ════════════════════════════════════════════════════════════

const Orbit = (() => {

  // ── Config ─────────────────────────────────────────────────

  const CFG = {
    // Orbit radius
    minRadius:      60,
    maxRadius:      220,
    baseRadius:     120,
    expandSpeed:    50,    // px/s when holding
    contractSpeed:  35,    // px/s when releasing

    // Orbital speed (radians/sec)
    baseAngSpeed:   0.9,
    maxAngSpeed:    1.6,
    minAngSpeed:    0.4,

    // Orb appearance
    orbRadius:      9,
    orbGlowRadius:  18,

    // Star appearance
    starRadius:     14,
    starPulseAmp:   4,
    starPulseSpeed: 1.2,   // cycles/sec

    // Fragment
    fragCount:      6,     // active at once
    fragRadius:     7,
    fragCollectDist:22,
    fragSpawnEdge:  80,    // spawn zone edge distance from orbit path
    fragLifetime:   12,    // seconds before despawn
    fragFadeTime:   2,

    // Harmony
    harmonyPerFrag: 8,
    harmonyDecay:   0,     // no decay — stays honest

    // Colors (cached for reuse)
    colorCyan:    '#6EE7FF',
    colorGold:    '#FFD166',
    colorLavender:'#B794F4',
    colorMint:    '#8AFFC1',
    colorSpace:   '#070B1A',
  };

  // ── State ──────────────────────────────────────────────────

  let cx = 0, cy = 0;                 // canvas center
  let radius       = CFG.baseRadius;  // current orbital radius
  let angle        = 0;               // player angle (radians)
  let angSpeed     = CFG.baseAngSpeed;
  let isHolding    = false;           // input state
  let prevRadius   = CFG.baseRadius;
  let radialVel    = 0;               // current radial velocity for sync

  let starPulse    = 0;               // time accumulator for star pulse
  let bgBrightness = 0;              // 0..1, follows breath

  let harmony      = 0;
  let fragments    = [];
  let collected    = 0;

  let running      = false;
  let endPhase     = false;           // slow-down end sequence
  let endProgress  = 0;              // 0..1

  // Callbacks
  let onCollect    = null;
  let onHarmonyChange = null;

  // ── Init ───────────────────────────────────────────────────

  function init(canvas, callbacks = {}) {
    cx = canvas.width  / 2;
    cy = canvas.height / 2;
    radius    = CFG.baseRadius;
    angle     = -Math.PI / 2;    // start at top
    harmony   = 0;
    collected = 0;
    fragments = [];
    running   = true;
    endPhase  = false;
    endProgress = 0;
    isHolding = false;
    angSpeed  = CFG.baseAngSpeed;
    starPulse = 0;
    bgBrightness = 0;

    onCollect       = callbacks.onCollect;
    onHarmonyChange = callbacks.onHarmonyChange;

    // Pre-spawn fragments
    for (let i = 0; i < CFG.fragCount; i++) {
      spawnFragment(true);
    }
  }

  function resize(canvas) {
    cx = canvas.width  / 2;
    cy = canvas.height / 2;
    // Keep radius sensible
    const maxR = Math.min(cx, cy) - 40;
    CFG.maxRadius = maxR;
    radius = Math.min(radius, maxR);
    // Reposition fragments
    fragments.forEach(f => {
      f.cx = cx;
      f.cy = cy;
    });
  }

  // ── Input ──────────────────────────────────────────────────

  function startHold() { isHolding = true; }
  function endHold()   { isHolding = false; }

  // ── Fragment ───────────────────────────────────────────────

  function spawnFragment(immediate = false) {
    const orbitR    = radius + (Math.random() - 0.5) * CFG.fragSpawnEdge * 2;
    const clampedR  = Math.max(CFG.minRadius - 20, Math.min(CFG.maxRadius + 40, orbitR));
    const fragAngle = Math.random() * Math.PI * 2;

    const offsetR   = clampedR + (Math.random() - 0.5) * 50;
    const fx        = cx + Math.cos(fragAngle) * offsetR;
    const fy        = cy + Math.sin(fragAngle) * offsetR;

    fragments.push({
      x:       fx,
      y:       fy,
      r:       CFG.fragRadius,
      angle:   fragAngle,
      orbitR:  offsetR,
      phase:   Math.random() * Math.PI * 2,
      life:    immediate ? CFG.fragLifetime * Math.random() + 2 : CFG.fragLifetime,
      maxLife: CFG.fragLifetime,
      glow:    0,
      content: CONTENT.getRandomFragment(),
      pulse:   0,
      cx, cy,
    });
  }

  // ── Update ─────────────────────────────────────────────────

  function update(dt, breathInfo) {
    if (!running) return;

    if (endPhase) {
      endProgress = Math.min(1, endProgress + dt / 3);
      const slowFactor = 1 - endProgress * 0.9;
      angle    += angSpeed * slowFactor * dt;
      starPulse += dt;
      return;
    }

    // ── Radius ─────────────────────────────────────────────
    prevRadius = radius;
    if (isHolding) {
      radius = Math.min(CFG.maxRadius, radius + CFG.expandSpeed * dt);
    } else {
      radius = Math.max(CFG.minRadius, radius - CFG.contractSpeed * dt);
    }
    radialVel = (radius - prevRadius) / dt;  // px/s

    // ── Angular speed varies with radius ───────────────────
    // Closer to star = faster orbit (Kepler's 2nd law feel)
    const rNorm  = (radius - CFG.minRadius) / (CFG.maxRadius - CFG.minRadius);
    angSpeed     = CFG.maxAngSpeed - rNorm * (CFG.maxAngSpeed - CFG.minAngSpeed);
    angle       += angSpeed * dt;

    // ── Star pulse & bg brightness ─────────────────────────
    starPulse   += dt;
    if (breathInfo) {
      bgBrightness = (breathInfo.scale - 0.5) * 0.12; // subtle background dim/bright
    }

    // ── Fragment logic ─────────────────────────────────────
    fragments.forEach(f => {
      f.life  -= dt;
      f.pulse += dt * 1.5;
    });

    // Remove expired
    fragments = fragments.filter(f => f.life > 0);

    // Ensure count
    while (fragments.length < CFG.fragCount) spawnFragment();

    // ── Collision ──────────────────────────────────────────
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;

    for (let i = fragments.length - 1; i >= 0; i--) {
      const f  = fragments[i];
      const dx = px - f.x;
      const dy = py - f.y;
      const d  = Math.sqrt(dx * dx + dy * dy);

      if (d < CFG.fragCollectDist) {
        // Collect!
        harmony  += CFG.harmonyPerFrag;
        collected++;
        onHarmonyChange && onHarmonyChange(harmony);
        onCollect && onCollect(f.x, f.y, f.content);
        fragments.splice(i, 1);
        spawnFragment();
      }
    }

    // Sync record
    if (breathInfo) {
      const normalizedVel = radialVel / CFG.expandSpeed;
      Breathing.recordOrbitalDelta(normalizedVel, breathInfo.phase);
    }
  }

  // ── Draw ───────────────────────────────────────────────────

  function draw(ctx, breathInfo, t) {
    if (!running) return;

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // ── Background ─────────────────────────────────────────
    const bgAlpha = 0.92;
    ctx.fillStyle = `rgba(7, 11, 26, ${bgAlpha})`;
    ctx.fillRect(0, 0, w, h);

    // Subtle breath-reactive background glow at center
    if (breathInfo && breathInfo.scale > 0.6) {
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 280);
      const intensity = (breathInfo.scale - 0.5) * 0.06;
      glow.addColorStop(0,   `rgba(110, 100, 220, ${intensity})`);
      glow.addColorStop(0.5, `rgba(40, 80, 180, ${intensity * 0.3})`);
      glow.addColorStop(1,   'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    }

    // ── Orbit path ─────────────────────────────────────────
    drawOrbitPath(ctx);

    // ── Fragments ──────────────────────────────────────────
    fragments.forEach(f => drawFragment(ctx, f));

    // ── Central star ───────────────────────────────────────
    drawStar(ctx, breathInfo);

    // ── Player orb ─────────────────────────────────────────
    const px = cx + Math.cos(angle) * (endPhase ? radius * (1 - endProgress * 0.3) : radius);
    const py = cy + Math.sin(angle) * (endPhase ? radius * (1 - endProgress * 0.3) : radius);
    drawOrb(ctx, px, py);

    // Orb trail
    if (!endPhase) {
      Particles.addTrail(px, py);
    }
  }

  function drawOrbitPath(ctx) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(110, 231, 255, 0.06)`;
    ctx.lineWidth   = 1;
    ctx.stroke();

    // Dashed secondary ring
    ctx.setLineDash([4, 12]);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(183, 148, 244, 0.04)`;
    ctx.lineWidth   = 1;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawStar(ctx, breathInfo) {
    const scale  = breathInfo ? breathInfo.scale : 0.75;
    const r      = CFG.starRadius + Math.sin(starPulse * CFG.starPulseSpeed * Math.PI * 2) * CFG.starPulseAmp * scale;
    const glow1  = r * 3 * scale;
    const glow2  = r * 6 * scale;

    // Outer glow
    let g = ctx.createRadialGradient(cx, cy, 0, cx, cy, glow2);
    g.addColorStop(0,   `rgba(110, 231, 255, ${0.08 * scale})`);
    g.addColorStop(0.4, `rgba(80, 180, 255, ${0.04 * scale})`);
    g.addColorStop(1,   'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, glow2, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // Middle glow
    g = ctx.createRadialGradient(cx, cy, 0, cx, cy, glow1);
    g.addColorStop(0,   `rgba(180, 240, 255, ${0.2 * scale})`);
    g.addColorStop(1,   'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, glow1, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // Core
    g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0,   '#FFFFFF');
    g.addColorStop(0.3, CFG.colorCyan);
    g.addColorStop(1,   'rgba(110, 231, 255, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // Breathing ring around star
    if (breathInfo) {
      const ringR = 30 + 20 * breathInfo.scale;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      const phaseColors = {
        inhale: `rgba(183, 148, 244, ${0.15 * breathInfo.scale})`,
        hold:   `rgba(110, 231, 255, ${0.15 * breathInfo.scale})`,
        exhale: `rgba(138, 255, 193, ${0.10 * breathInfo.scale})`,
      };
      ctx.strokeStyle = phaseColors[breathInfo.phase] || phaseColors.inhale;
      ctx.lineWidth   = 1.5;
      ctx.stroke();
    }
  }

  function drawOrb(ctx, x, y) {
    const r  = CFG.orbRadius;
    const gr = CFG.orbGlowRadius;

    // Outer glow
    let g = ctx.createRadialGradient(x, y, 0, x, y, gr * 2.5);
    g.addColorStop(0,   'rgba(110, 231, 255, 0.12)');
    g.addColorStop(0.5, 'rgba(110, 231, 255, 0.04)');
    g.addColorStop(1,   'transparent');
    ctx.beginPath();
    ctx.arc(x, y, gr * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // Inner glow
    g = ctx.createRadialGradient(x, y, 0, x, y, gr);
    g.addColorStop(0,   'rgba(180, 245, 255, 0.5)');
    g.addColorStop(0.4, 'rgba(110, 231, 255, 0.3)');
    g.addColorStop(1,   'transparent');
    ctx.beginPath();
    ctx.arc(x, y, gr, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // Core
    g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    g.addColorStop(0,   '#FFFFFF');
    g.addColorStop(0.5, CFG.colorCyan);
    g.addColorStop(1,   'rgba(50, 180, 220, 0.8)');
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  function drawFragment(ctx, f) {
    const fade = f.life < CFG.fragFadeTime ? f.life / CFG.fragFadeTime : 1;
    const pulse = 0.8 + 0.2 * Math.sin(f.pulse);
    const r = f.r * pulse;

    // Outer glow
    const g1 = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r * 4);
    g1.addColorStop(0,   `rgba(255, 209, 102, ${0.15 * fade})`);
    g1.addColorStop(1,   'transparent');
    ctx.beginPath();
    ctx.arc(f.x, f.y, r * 4, 0, Math.PI * 2);
    ctx.fillStyle = g1;
    ctx.fill();

    // Core
    const g2 = ctx.createRadialGradient(f.x - r * 0.3, f.y - r * 0.3, 0, f.x, f.y, r);
    g2.addColorStop(0,   `rgba(255, 240, 180, ${fade})`);
    g2.addColorStop(0.5, `rgba(255, 209, 102, ${fade})`);
    g2.addColorStop(1,   `rgba(200, 150, 50, ${fade * 0.6})`);
    ctx.beginPath();
    ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
    ctx.fillStyle = g2;
    ctx.fill();

    // Star shape overlay
    drawStar4(ctx, f.x, f.y, r * 1.4, r * 0.7, fade * 0.6);
  }

  function drawStar4(ctx, x, y, outerR, innerR, alpha) {
    const spikes = 4;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r   = i % 2 === 0 ? outerR : innerR;
      const ang = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 4;
      if (i === 0) ctx.moveTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r);
      else         ctx.lineTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 230, 150, ${alpha})`;
    ctx.fill();
  }

  // ── End Sequence ───────────────────────────────────────────

  function triggerEnd() {
    endPhase = true;
    endProgress = 0;
  }

  // ── Getters ────────────────────────────────────────────────

  function getState() {
    return {
      harmony,
      collected,
      radius,
      angle,
      px: cx + Math.cos(angle) * radius,
      py: cy + Math.sin(angle) * radius,
      endProgress,
      endPhase,
    };
  }

  return {
    init,
    resize,
    startHold,
    endHold,
    update,
    draw,
    triggerEnd,
    getState,
    CFG,
  };
})();
