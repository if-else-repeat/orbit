// ════════════════════════════════════════════════════════════
//  ORBIT v2 — Particles (upgraded)
//  Longer trails · Pulse ring · Void shatter · End drift
// ════════════════════════════════════════════════════════════

const Particles = (() => {

  // ── Star ────────────────────────────────────────────────────
  class Star {
    constructor(w, h) { this.w = w; this.h = h; this.reset(); }
    reset() {
      this.x      = Math.random() * this.w;
      this.y      = Math.random() * this.h;
      this.r      = Math.random() * 1.4 + 0.3;
      this.alpha  = Math.random() * 0.55 + 0.08;
      this.phase  = Math.random() * Math.PI * 2;
      this.speed  = Math.random() * 0.012 + 0.004;
    }
    update()    { this.phase += this.speed; }
    draw(ctx) {
      const a = this.alpha * (0.65 + 0.35 * Math.sin(this.phase));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${a})`;
      ctx.fill();
    }
  }

  // ── Nebula Dust ─────────────────────────────────────────────
  class NebulaDust {
    constructor(w, h) { this.w = w; this.h = h; this.reset(); }
    reset() {
      this.x     = Math.random() * this.w;
      this.y     = Math.random() * this.h;
      this.r     = Math.random() * 130 + 70;
      this.alpha = Math.random() * 0.05 + 0.01;
      this.hue   = Math.random() < 0.5 ? '210, 100%, 70%' : '270, 80%, 65%';
      this.phase = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 0.003 + 0.001;
      this.dx    = (Math.random() - 0.5) * 0.04;
      this.dy    = (Math.random() - 0.5) * 0.04;
    }
    update() { this.x += this.dx; this.y += this.dy; this.phase += this.speed; }
    draw(ctx, w, h) {
      const a   = this.alpha * (0.6 + 0.4 * Math.sin(this.phase));
      const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
      grd.addColorStop(0, `hsla(${this.hue}, ${a})`);
      grd.addColorStop(1, `hsla(${this.hue}, 0)`);
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();
    }
  }

  // ── Burst Particle ──────────────────────────────────────────
  class BurstParticle {
    constructor(x, y, color, big = false) {
      this.x     = x; this.y = y; this.color = color;
      const ang  = Math.random() * Math.PI * 2;
      const spd  = big ? Math.random() * 4.5 + 1.5 : Math.random() * 3 + 1;
      this.vx    = Math.cos(ang) * spd;
      this.vy    = Math.sin(ang) * spd;
      this.r     = big ? Math.random() * 3.5 + 1.5 : Math.random() * 2.5 + 0.8;
      this.life  = 1;
      this.decay = Math.random() * 0.025 + 0.018;
      this.grav  = 0.035;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      this.vy += this.grav; this.vx *= 0.97; this.vy *= 0.97;
      this.life -= this.decay; this.r *= 0.985;
    }
    get alive() { return this.life > 0 && this.r > 0.2; }
    draw(ctx) {
      const rgb = this.color;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = rgb.includes('rgba') ? rgb : `rgba(${hexToRgb(rgb)}, ${this.life})`;
      ctx.fill();
    }
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `${r}, ${g}, ${b}`;
  }

  // ── Trail Particle (longer, more luminous) ──────────────────
  class TrailParticle {
    constructor(x, y) {
      this.x     = x; this.y = y;
      this.r     = Math.random() * 2.8 + 0.8;
      this.life  = 1;
      this.decay = Math.random() * 0.03 + 0.018;
      this.vx    = (Math.random() - 0.5) * 0.5;
      this.vy    = (Math.random() - 0.5) * 0.5;
    }
    update() { this.x += this.vx; this.y += this.vy; this.life -= this.decay; }
    get alive() { return this.life > 0; }
    draw(ctx) {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r * this.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(110, 231, 255, ${this.life * 0.45})`;
      ctx.fill();
      // Tiny white hot center
      if (this.life > 0.6) {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r * this.life * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${(this.life - 0.6) * 0.8})`;
        ctx.fill();
      }
    }
  }

  // ── Ripple ──────────────────────────────────────────────────
  class Ripple {
    constructor(x, y, color = '110, 231, 255', maxR = 65) {
      this.x = x; this.y = y; this.r = 0;
      this.maxR = maxR; this.life = 1; this.speed = 2.2; this.color = color;
    }
    update() { this.r += this.speed; this.life = 1 - this.r / this.maxR; }
    get alive() { return this.r < this.maxR; }
    draw(ctx) {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${this.color}, ${this.life * 0.6})`;
      ctx.lineWidth = 1.5; ctx.stroke();
    }
  }

  // ── Pulse Ring Expand ───────────────────────────────────────
  class PulseRing {
    constructor(cx, cy) {
      this.cx = cx; this.cy = cy;
      this.r    = 30;
      this.maxR = Math.max(cx, cy) * 1.5;
      this.life = 1;
      this.speed = 200; // px/s
    }
    update(dt) {
      this.r   += this.speed * dt;
      this.life = Math.max(0, 1 - this.r / this.maxR);
    }
    get alive() { return this.life > 0; }
    draw(ctx) {
      ctx.beginPath(); ctx.arc(this.cx, this.cy, this.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 200, 80, ${this.life * 0.5})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      // Second ring slightly behind
      if (this.r > 25) {
        ctx.beginPath(); ctx.arc(this.cx, this.cy, this.r - 20, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 200, 80, ${this.life * 0.2})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // ── Float Text ──────────────────────────────────────────────
  class FloatText {
    constructor(x, y, text, color = '#FFD166') {
      this.x = x; this.y = y; this.text = text; this.color = color;
      this.life = 1; this.vy = -0.7; this.decay = 0.011;
    }
    update() { this.y += this.vy; this.life -= this.decay; }
    get alive() { return this.life > 0; }
    draw(ctx) {
      const size = Math.max(11, 12 * this.life + 9);
      ctx.font      = `italic ${size}px 'Cormorant Garamond', serif`;
      ctx.fillStyle = this.color + Math.round(this.life * 255).toString(16).padStart(2,'0');
      ctx.textAlign = 'center';
      ctx.fillText(this.text, this.x, this.y);
    }
  }

  // ── Sweet Zone Sparkle ──────────────────────────────────────
  class SweetSparkle {
    constructor(x, y) {
      this.x = x; this.y = y;
      this.life = 1; this.decay = Math.random() * 0.04 + 0.03;
      this.r = Math.random() * 2.5 + 0.5;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 1.5;
    }
    update() { this.x += this.vx; this.y += this.vy; this.life -= this.decay; }
    get alive() { return this.life > 0; }
    draw(ctx) {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r * this.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 200, 80, ${this.life * 0.7})`;
      ctx.fill();
    }
  }

  // ── End Drift ───────────────────────────────────────────────
  class EndDrift {
    constructor(w, h) {
      this.x = Math.random() * w; this.y = Math.random() * h;
      this.r = Math.random() * 2 + 0.5; this.alpha = Math.random() * 0.5 + 0.1;
      const a = Math.random() * Math.PI * 2; const s = Math.random() * 0.6 + 0.1;
      this.vx = Math.cos(a) * s; this.vy = Math.sin(a) * s;
      this.life = 1; this.decay = Math.random() * 0.004 + 0.002;
    }
    update() { this.x += this.vx; this.y += this.vy; this.life -= this.decay; }
    get alive() { return this.life > 0; }
    draw(ctx) {
      const hue = Math.random() < 0.6 ? '195,100%,80%' : '265,80%,80%';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, ${this.life * this.alpha})`;
      ctx.fill();
    }
  }

  // ── Manager ─────────────────────────────────────────────────
  let stars       = [];
  let nebulas     = [];
  let bursts      = [];
  let trails      = [];
  let ripples     = [];
  let pulseRings  = [];
  let floatTexts  = [];
  let sparkles    = [];
  let endDrifts   = [];

  let _w = 0, _h = 0;
  let lastDt = 0.016;

  function initStarField(w, h, count = 200) {
    _w = w; _h = h;
    stars   = Array.from({ length: count }, () => new Star(w, h));
    nebulas = Array.from({ length: 7 },   () => new NebulaDust(w, h));
  }

  function addBurst(x, y, color = '#FFD166', count = 14, big = false) {
    for (let i = 0; i < count; i++) bursts.push(new BurstParticle(x, y, color, big));
  }

  function addTrail(x, y) {
    // Spawn 1-2 trail particles per frame
    trails.push(new TrailParticle(x, y));
    if (Math.random() < 0.5) trails.push(new TrailParticle(x, y));
  }

  function addRipple(x, y, color, maxR) {
    ripples.push(new Ripple(x, y, color, maxR));
  }

  function addPulseRing(cx, cy) {
    pulseRings.push(new PulseRing(cx, cy));
  }

  function addFloatText(x, y, text, color) {
    floatTexts.push(new FloatText(x, y, text, color));
  }

  function addSweetSparkle(x, y, count = 4) {
    for (let i = 0; i < count; i++) sparkles.push(new SweetSparkle(x, y));
  }

  function triggerEndDrift(w, h, count = 140) {
    for (let i = 0; i < count; i++) endDrifts.push(new EndDrift(w, h));
  }

  function clear() {
    bursts = []; trails = []; ripples = []; pulseRings = [];
    floatTexts = []; sparkles = []; endDrifts = [];
  }

  function updateAndDraw(ctx, dt, w, h) {
    lastDt = dt || lastDt;

    // Nebulas
    nebulas.forEach(n => { n.update(); n.draw(ctx, w, h); });

    // Stars
    stars.forEach(s => { s.update(); s.draw(ctx); });

    // Pulse rings (need dt)
    pulseRings = pulseRings.filter(r => {
      r.update(lastDt); if (r.alive) r.draw(ctx); return r.alive;
    });

    // Bursts
    bursts = bursts.filter(p => { p.update(); if (p.alive) p.draw(ctx); return p.alive; });

    // Trails
    trails = trails.filter(p => { p.update(); if (p.alive) p.draw(ctx); return p.alive; });

    // Ripples
    ripples = ripples.filter(r => { r.update(); if (r.alive) r.draw(ctx); return r.alive; });

    // Float texts
    floatTexts = floatTexts.filter(f => { f.update(); if (f.alive) f.draw(ctx); return f.alive; });

    // Sparkles
    sparkles = sparkles.filter(s => { s.update(); if (s.alive) s.draw(ctx); return s.alive; });

    // End drifts
    endDrifts = endDrifts.filter(d => { d.update(); if (d.alive) d.draw(ctx); return d.alive; });
  }

  return {
    initStarField,
    addBurst, addTrail, addRipple, addPulseRing,
    addFloatText, addSweetSparkle, triggerEndDrift,
    clear, updateAndDraw,
  };
})();
