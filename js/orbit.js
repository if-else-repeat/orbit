// ════════════════════════════════════════════════════════════
//  ORBIT v2 — Orbital Physics (complete rewrite)
//  Sweet spot ring · Moving fragments · Void zones · Pulse waves
// ════════════════════════════════════════════════════════════

const Orbit = (() => {

  const CFG = {
    minRadius:       55,
    maxRadius:       230,
    baseRadius:      120,
    expandSpeed:     55,
    contractSpeed:   38,
    baseAngSpeed:    0.85,
    maxAngSpeed:     1.55,
    minAngSpeed:     0.38,

    orbRadius:       9,
    orbGlowRadius:   20,

    starRadius:      13,
    starPulseAmp:    5,
    starPulseSpeed:  1.1,

    // Sweet spot band
    sweetBandWidth:  38,      // px either side of ideal radius
    sweetIdealBase:  120,     // tracks breath

    // Fragments
    fragCount:       5,
    fragRadius:      7,
    fragCollectDist: 24,
    fragLifetime:    11,
    fragFadeTime:    2.5,
    fragDriftSpeed:  22,      // px/s drift

    // Pulse wave
    pulseFragCount:  4,
    pulseFragLife:   4.5,

    // Void zones
    voidCount:       3,
    voidRadius:      36,
    voidDriftSpeed:  14,

    // Harmony
    harmonyPerFrag:        10,
    harmonyPerSecInSweet:  2.5,   // per second in sweet spot
    harmonyDrainVoid:      3,     // per second in void

    colorCyan:    '#6EE7FF',
    colorGold:    '#FFD166',
    colorLavender:'#B794F4',
    colorMint:    '#8AFFC1',
  };

  let cx = 0, cy = 0;
  let radius       = CFG.baseRadius;
  let angle        = -Math.PI / 2;
  let angSpeed     = CFG.baseAngSpeed;
  let isHolding    = false;
  let prevRadius   = CFG.baseRadius;
  let radialVel    = 0;

  let starPulse    = 0;
  let harmony      = 0;
  let fragments    = [];
  let voidZones    = [];
  let collected    = 0;
  let running      = false;
  let endPhase     = false;
  let endProgress  = 0;

  // Sweet spot state
  let sweetRadius  = CFG.sweetIdealBase;
  let inSweet      = false;
  let sweetTime    = 0;    // time spent in sweet zone this session
  let sweetFlash   = 0;    // 0..1 flash on entry

  // Void state
  let inVoid       = false;
  let voidFlash    = 0;

  // Pulse wave
  let lastBreathPhase = 'exhale';
  let pulseWavePending = false;
  let pulseWaveCooldown = 0;

  // Constellation lines between fragments
  let constellationAlpha = 0;

  let onCollect        = null;
  let onHarmonyChange  = null;
  let onPulseWave      = null;
  let onSweetEnter     = null;
  let onVoidEnter      = null;

  // ── Init ────────────────────────────────────────────────────

  function init(canvas, callbacks = {}) {
    cx = canvas.width  / 2;
    cy = canvas.height / 2;

    radius       = CFG.baseRadius;
    angle        = -Math.PI / 2;
    harmony      = 0;
    collected    = 0;
    fragments    = [];
    voidZones    = [];
    running      = true;
    endPhase     = false;
    endProgress  = 0;
    isHolding    = false;
    angSpeed     = CFG.baseAngSpeed;
    starPulse    = 0;
    inSweet      = false;
    sweetTime    = 0;
    sweetFlash   = 0;
    inVoid       = false;
    voidFlash    = 0;
    lastBreathPhase = 'exhale';
    pulseWavePending = false;
    pulseWaveCooldown = 0;
    constellationAlpha = 0;

    CFG.maxRadius = Math.min(230, Math.min(cx, cy) - 50);
    sweetRadius   = CFG.baseRadius;

    onCollect       = callbacks.onCollect;
    onHarmonyChange = callbacks.onHarmonyChange;
    onPulseWave     = callbacks.onPulseWave;
    onSweetEnter    = callbacks.onSweetEnter;
    onVoidEnter     = callbacks.onVoidEnter;

    for (let i = 0; i < CFG.fragCount; i++) spawnFragment(true);
    for (let i = 0; i < CFG.voidCount; i++) spawnVoid();
  }

  function resize(canvas) {
    cx = canvas.width  / 2;
    cy = canvas.height / 2;
    CFG.maxRadius = Math.min(230, Math.min(cx, cy) - 50);
    radius = Math.min(radius, CFG.maxRadius);
  }

  // ── Input ───────────────────────────────────────────────────

  function startHold() { isHolding = true; }
  function endHold()   { isHolding = false; }

  // ── Fragment ────────────────────────────────────────────────

  function spawnFragment(immediate = false, isPulse = false) {
    const orbitBand  = isPulse ? sweetRadius : sweetRadius + (Math.random() - 0.5) * 90;
    const clampedR   = Math.max(CFG.minRadius - 15, Math.min(CFG.maxRadius + 30, orbitBand));
    const fragAngle  = Math.random() * Math.PI * 2;

    // Give each fragment its own slow drift direction
    const driftAngle = Math.random() * Math.PI * 2;
    const driftSpeed = CFG.fragDriftSpeed * (0.5 + Math.random());

    fragments.push({
      x:         cx + Math.cos(fragAngle) * clampedR,
      y:         cy + Math.sin(fragAngle) * clampedR,
      orbitR:    clampedR,
      angle:     fragAngle,
      dvx:       Math.cos(driftAngle) * driftSpeed,
      dvy:       Math.sin(driftAngle) * driftSpeed,
      r:         CFG.fragRadius,
      life:      immediate ? CFG.fragLifetime * (0.4 + Math.random() * 0.6) : CFG.fragLifetime,
      maxLife:   isPulse ? CFG.pulseFragLife : CFG.fragLifetime,
      isPulse,
      phase:     Math.random() * Math.PI * 2,
      content:   CONTENT.getRandomFragment(),
    });
  }

  // ── Void Zone ───────────────────────────────────────────────

  function spawnVoid() {
    const r     = CFG.minRadius + Math.random() * (CFG.maxRadius - CFG.minRadius);
    const a     = Math.random() * Math.PI * 2;
    const driftA = Math.random() * Math.PI * 2;

    voidZones.push({
      x:    cx + Math.cos(a) * r,
      y:    cy + Math.sin(a) * r,
      r:    CFG.voidRadius * (0.7 + Math.random() * 0.6),
      dvx:  Math.cos(driftA) * CFG.voidDriftSpeed * (0.5 + Math.random()),
      dvy:  Math.sin(driftA) * CFG.voidDriftSpeed * (0.5 + Math.random()),
      alpha: 0,     // fade in
      life: 1,
      pulse: 0,
    });
  }

  // ── Update ──────────────────────────────────────────────────

  function update(dt, breathInfo) {
    if (!running) return;

    if (endPhase) {
      endProgress = Math.min(1, endProgress + dt / 3);
      angle += angSpeed * (1 - endProgress * 0.92) * dt;
      starPulse += dt;
      return;
    }

    // ── Radius ───────────────────────────────────────────
    prevRadius = radius;
    if (isHolding) {
      radius = Math.min(CFG.maxRadius, radius + CFG.expandSpeed * dt);
    } else {
      radius = Math.max(CFG.minRadius, radius - CFG.contractSpeed * dt);
    }
    radialVel = (radius - prevRadius) / dt;

    // ── Angle speed ──────────────────────────────────────
    const rNorm  = (radius - CFG.minRadius) / (CFG.maxRadius - CFG.minRadius);
    angSpeed     = CFG.maxAngSpeed - rNorm * (CFG.maxAngSpeed - CFG.minAngSpeed);
    angle       += angSpeed * dt;

    // ── Sweet spot: track ideal radius via breath scale ───
    if (breathInfo) {
      sweetRadius = CFG.minRadius + (CFG.maxRadius - CFG.minRadius) * (0.35 + breathInfo.scale * 0.3);
    }

    // ── Player position ──────────────────────────────────
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;

    // ── Sweet spot check ─────────────────────────────────
    const distFromSweet = Math.abs(radius - sweetRadius);
    const wasInSweet    = inSweet;
    inSweet = distFromSweet < CFG.sweetBandWidth;

    if (inSweet) {
      sweetTime += dt;
      harmony   += CFG.harmonyPerSecInSweet * dt;
      onHarmonyChange && onHarmonyChange(Math.floor(harmony));
      if (!wasInSweet) {
        sweetFlash = 1;
        onSweetEnter && onSweetEnter();
      }
    }
    if (sweetFlash > 0) sweetFlash = Math.max(0, sweetFlash - dt * 2);

    // ── Star pulse & breath ───────────────────────────────
    starPulse += dt;

    // ── Pulse wave trigger on inhale peak ────────────────
    if (breathInfo) {
      pulseWaveCooldown = Math.max(0, pulseWaveCooldown - dt);

      const phase = breathInfo.phase;
      if (lastBreathPhase === 'inhale' && phase === 'hold' && pulseWaveCooldown <= 0) {
        triggerPulseWave();
        pulseWaveCooldown = Breathing.CYCLE_DURATION;
      }
      lastBreathPhase = phase;
    }

    // ── Fragments update ─────────────────────────────────
    fragments.forEach(f => {
      f.x    += f.dvx * dt;
      f.y    += f.dvy * dt;
      f.life -= dt;
      f.phase += dt * 1.8;

      // Gentle pull toward sweet ring (prevents full escape)
      const fdist  = Math.sqrt((f.x - cx) ** 2 + (f.y - cy) ** 2);
      const fangle = Math.atan2(f.y - cy, f.x - cx);
      const pull   = (sweetRadius - fdist) * 0.015;
      f.dvx += Math.cos(fangle) * pull * dt * 60;
      f.dvy += Math.sin(fangle) * pull * dt * 60;

      // Dampen drift slightly
      f.dvx *= 0.995;
      f.dvy *= 0.995;
    });
    fragments = fragments.filter(f => f.life > 0);
    while (fragments.filter(f => !f.isPulse).length < CFG.fragCount) spawnFragment();

    // ── Collision ─────────────────────────────────────────
    for (let i = fragments.length - 1; i >= 0; i--) {
      const f  = fragments[i];
      const dx = px - f.x;
      const dy = py - f.y;
      if (dx * dx + dy * dy < CFG.fragCollectDist ** 2) {
        harmony  += CFG.harmonyPerFrag;
        collected++;
        onHarmonyChange && onHarmonyChange(Math.floor(harmony));
        onCollect && onCollect(f.x, f.y, f.content);
        fragments.splice(i, 1);
        if (!f.isPulse) spawnFragment();
      }
    }

    // ── Void zones update ─────────────────────────────────
    let playerInVoid = false;
    voidZones.forEach(v => {
      v.x     += v.dvx * dt;
      v.y     += v.dvy * dt;
      v.pulse += dt * 0.8;
      v.alpha  = Math.min(1, v.alpha + dt * 0.3);

      // Bounce off canvas edges softly
      const margin = 60;
      if (v.x < margin || v.x > cx * 2 - margin) v.dvx *= -1;
      if (v.y < margin || v.y > cy * 2 - margin) v.dvy *= -1;

      const dx = px - v.x;
      const dy = py - v.y;
      if (Math.sqrt(dx * dx + dy * dy) < v.r + CFG.orbRadius) {
        playerInVoid = true;
      }
    });

    const wasInVoid = inVoid;
    inVoid = playerInVoid;
    if (inVoid) {
      harmony = Math.max(0, harmony - CFG.harmonyDrainVoid * dt);
      onHarmonyChange && onHarmonyChange(Math.floor(harmony));
      if (!wasInVoid) {
        voidFlash = 1;
        onVoidEnter && onVoidEnter();
      }
    }
    if (voidFlash > 0) voidFlash = Math.max(0, voidFlash - dt * 1.5);

    // Breath sync record
    if (breathInfo) {
      const normalized = radialVel / CFG.expandSpeed;
      Breathing.recordOrbitalDelta(normalized, breathInfo.phase);
    }
  }

  // ── Pulse Wave ──────────────────────────────────────────────

  function triggerPulseWave() {
    for (let i = 0; i < CFG.pulseFragCount; i++) spawnFragment(false, true);
    onPulseWave && onPulseWave();
  }

  // ── Draw ────────────────────────────────────────────────────

  function draw(ctx, breathInfo) {
    if (!running) return;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Background
    ctx.fillStyle = 'rgba(7, 11, 26, 0.93)';
    ctx.fillRect(0, 0, w, h);

    // Breath-reactive center glow
    if (breathInfo) {
      const intensity = (breathInfo.scale - 0.5) * 0.08;
      if (intensity > 0) {
        const phaseHue = { inhale:'183,60%,68%', hold:'195,100%,80%', exhale:'150,70%,60%' };
        const hue = phaseHue[breathInfo.phase] || phaseHue.inhale;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 260);
        g.addColorStop(0,   `hsla(${hue}, ${intensity})`);
        g.addColorStop(0.5, `hsla(${hue}, ${intensity * 0.3})`);
        g.addColorStop(1,   'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    }

    // Void flash (red screen edge)
    if (voidFlash > 0) {
      const g = ctx.createRadialGradient(cx, cy, Math.min(cx,cy)*0.5, cx, cy, Math.max(cx,cy)*1.2);
      g.addColorStop(0,   'transparent');
      g.addColorStop(1,   `rgba(255, 80, 80, ${voidFlash * 0.18})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // Sweet flash (gold screen edge)
    if (sweetFlash > 0) {
      const g = ctx.createRadialGradient(cx, cy, sweetRadius * 0.6, cx, cy, Math.max(cx,cy));
      g.addColorStop(0,   'transparent');
      g.addColorStop(1,   `rgba(255, 200, 80, ${sweetFlash * 0.12})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // Particles drawn from game.js (via Particles.updateAndDraw)

    // Sweet spot ring
    drawSweetRing(ctx, breathInfo);

    // Constellation lines
    drawConstellation(ctx);

    // Orbit path
    drawOrbitPath(ctx);

    // Void zones
    voidZones.forEach(v => drawVoid(ctx, v));

    // Fragments
    fragments.forEach(f => drawFragment(ctx, f));

    // Central star
    drawStar(ctx, breathInfo);

    // Player orb
    const ef   = endPhase ? 1 - endProgress * 0.35 : 1;
    const px   = cx + Math.cos(angle) * radius * ef;
    const py   = cy + Math.sin(angle) * radius * ef;
    drawOrb(ctx, px, py);

    if (!endPhase) Particles.addTrail(px, py);
  }

  function drawSweetRing(ctx, breathInfo) {
    const inner = sweetRadius - CFG.sweetBandWidth;
    const outer = sweetRadius + CFG.sweetBandWidth;
    const alpha  = inSweet ? 0.22 : 0.09;
    const color  = inSweet
      ? `rgba(255, 195, 80, ${alpha})`
      : `rgba(255, 180, 60, ${alpha})`;

    // Fill band
    ctx.beginPath();
    ctx.arc(cx, cy, outer, 0, Math.PI * 2);
    ctx.arc(cx, cy, inner, 0, Math.PI * 2, true);
    ctx.fillStyle = color;
    ctx.fill();

    // Inner edge line
    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 195, 80, ${inSweet ? 0.5 : 0.18})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Outer edge line
    ctx.beginPath();
    ctx.arc(cx, cy, outer, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 195, 80, ${inSweet ? 0.5 : 0.18})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Pulsing ideal ring
    const pulse = 0.5 + 0.5 * Math.sin(starPulse * 1.5);
    ctx.beginPath();
    ctx.arc(cx, cy, sweetRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 200, 100, ${0.15 + pulse * 0.2})`;
    ctx.lineWidth = inSweet ? 1.5 : 0.8;
    ctx.stroke();
  }

  function drawConstellation(ctx) {
    if (fragments.length < 2) return;
    const maxDist = 130;
    ctx.lineWidth = 0.6;
    for (let i = 0; i < fragments.length; i++) {
      for (let j = i + 1; j < fragments.length; j++) {
        const dx   = fragments[i].x - fragments[j].x;
        const dy   = fragments[i].y - fragments[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const a = (1 - dist / maxDist) * 0.18;
          ctx.beginPath();
          ctx.moveTo(fragments[i].x, fragments[i].y);
          ctx.lineTo(fragments[j].x, fragments[j].y);
          ctx.strokeStyle = `rgba(255, 209, 102, ${a})`;
          ctx.stroke();
        }
      }
    }
  }

  function drawOrbitPath(ctx) {
    ctx.setLineDash([3, 14]);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(110, 231, 255, 0.07)';
    ctx.lineWidth   = 1;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawVoid(ctx, v) {
    const pulse   = 0.7 + 0.3 * Math.sin(v.pulse);
    const baseAlpha = v.alpha * 0.55;

    const g = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, v.r * pulse);
    g.addColorStop(0,   `rgba(10, 5, 20, ${baseAlpha})`);
    g.addColorStop(0.5, `rgba(80, 20, 60, ${baseAlpha * 0.5})`);
    g.addColorStop(0.8, `rgba(180, 50, 80, ${baseAlpha * 0.18})`);
    g.addColorStop(1,   'transparent');
    ctx.beginPath();
    ctx.arc(v.x, v.y, v.r * pulse * 1.2, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // Edge ring
    ctx.beginPath();
    ctx.arc(v.x, v.y, v.r * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(200, 60, 80, ${v.alpha * 0.3})`;
    ctx.lineWidth   = 0.8;
    ctx.stroke();
  }

  function drawStar(ctx, breathInfo) {
    const scale = breathInfo ? breathInfo.scale : 0.75;
    const r     = CFG.starRadius + Math.sin(starPulse * CFG.starPulseSpeed * Math.PI * 2) * CFG.starPulseAmp * scale;

    // Outermost glow
    let g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 9 * scale);
    g.addColorStop(0,   `rgba(110,231,255,${0.07 * scale})`);
    g.addColorStop(0.4, `rgba(80,180,255,${0.03 * scale})`);
    g.addColorStop(1,   'transparent');
    ctx.beginPath(); ctx.arc(cx, cy, r * 9 * scale, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();

    // Middle glow
    g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 4);
    g.addColorStop(0,   `rgba(180,240,255,${0.18 * scale})`);
    g.addColorStop(1,   'transparent');
    ctx.beginPath(); ctx.arc(cx, cy, r * 4, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();

    // Core
    g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0,   '#FFFFFF');
    g.addColorStop(0.3, CFG.colorCyan);
    g.addColorStop(1,   'rgba(110,231,255,0)');
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();

    // Breath ring
    if (breathInfo) {
      const ringR = 28 + 22 * breathInfo.scale;
      const phaseColor = {
        inhale: `rgba(183,148,244,${0.18 * breathInfo.scale})`,
        hold:   `rgba(110,231,255,${0.2  * breathInfo.scale})`,
        exhale: `rgba(138,255,193,${0.14 * breathInfo.scale})`,
      };
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = phaseColor[breathInfo.phase] || phaseColor.inhale;
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      // Star rays during hold phase
      if (breathInfo.phase === 'hold') {
        const rayAlpha = breathInfo.scale * 0.2;
        for (let i = 0; i < 8; i++) {
          const ra = (i / 8) * Math.PI * 2 + starPulse * 0.3;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ra) * (r + 2), cy + Math.sin(ra) * (r + 2));
          ctx.lineTo(cx + Math.cos(ra) * (r + 22), cy + Math.sin(ra) * (r + 22));
          ctx.strokeStyle = `rgba(110,231,255,${rayAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function drawOrb(ctx, x, y) {
    const r  = CFG.orbRadius;
    const gr = CFG.orbGlowRadius;

    // Outer glow — gold tint if in sweet, red if in void
    const glowColor = inVoid
      ? `rgba(255, 80, 80, 0.15)`
      : inSweet
        ? `rgba(255, 200, 100, 0.15)`
        : `rgba(110, 231, 255, 0.12)`;

    let g = ctx.createRadialGradient(x, y, 0, x, y, gr * 2.8);
    g.addColorStop(0, glowColor);
    g.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(x, y, gr * 2.8, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();

    // Inner glow
    g = ctx.createRadialGradient(x, y, 0, x, y, gr);
    g.addColorStop(0,   'rgba(200,248,255,0.55)');
    g.addColorStop(0.4, 'rgba(110,231,255,0.35)');
    g.addColorStop(1,   'transparent');
    ctx.beginPath(); ctx.arc(x, y, gr, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();

    // Core
    g = ctx.createRadialGradient(x - r*0.3, y - r*0.3, 0, x, y, r);
    g.addColorStop(0,   '#FFFFFF');
    g.addColorStop(0.5, CFG.colorCyan);
    g.addColorStop(1,   'rgba(50,180,220,0.85)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
  }

  function drawFragment(ctx, f) {
    const fade  = f.life < CFG.fragFadeTime ? f.life / CFG.fragFadeTime : 1;
    const pulse = 0.82 + 0.18 * Math.sin(f.phase);
    const r     = f.r * pulse;
    const isPulse = f.isPulse;
    const col   = isPulse ? '255, 180, 80' : '255, 209, 102';

    // Outer glow
    const g1 = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r * 4.5);
    g1.addColorStop(0,   `rgba(${col}, ${0.18 * fade})`);
    g1.addColorStop(1,   'transparent');
    ctx.beginPath(); ctx.arc(f.x, f.y, r * 4.5, 0, Math.PI * 2);
    ctx.fillStyle = g1; ctx.fill();

    // Core
    const g2 = ctx.createRadialGradient(f.x - r*0.3, f.y - r*0.3, 0, f.x, f.y, r);
    g2.addColorStop(0,   `rgba(255, 248, 200, ${fade})`);
    g2.addColorStop(0.5, `rgba(${col}, ${fade})`);
    g2.addColorStop(1,   `rgba(200, 140, 40, ${fade * 0.6})`);
    ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
    ctx.fillStyle = g2; ctx.fill();

    // 4-point star overlay
    drawStar4(ctx, f.x, f.y, r * 1.5, r * 0.65, fade * 0.55, col);

    // Pulse ring on pulse fragments
    if (isPulse) {
      ctx.beginPath(); ctx.arc(f.x, f.y, r * 2.2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 180, 80, ${fade * 0.35})`;
      ctx.lineWidth   = 1;
      ctx.stroke();
    }
  }

  function drawStar4(ctx, x, y, outerR, innerR, alpha, col = '255,209,102') {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const r2  = i % 2 === 0 ? outerR : innerR;
      const ang = (i / 8) * Math.PI * 2 - Math.PI / 4;
      i === 0
        ? ctx.moveTo(x + Math.cos(ang) * r2, y + Math.sin(ang) * r2)
        : ctx.lineTo(x + Math.cos(ang) * r2, y + Math.sin(ang) * r2);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(${col}, ${alpha})`;
    ctx.fill();
  }

  // ── End Sequence ────────────────────────────────────────────

  function triggerEnd() {
    endPhase    = true;
    endProgress = 0;
  }

  // ── Getters ─────────────────────────────────────────────────

  function getState() {
    return {
      harmony:     Math.floor(harmony),
      collected,
      radius,
      angle,
      endProgress,
      endPhase,
      sweetTime:   Math.floor(sweetTime),
      inSweet,
      inVoid,
    };
  }

  return { init, resize, startHold, endHold, update, draw, triggerEnd, getState, CFG };
})();
