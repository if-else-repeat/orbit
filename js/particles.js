// ════════════════════════════════════════════════════════════
//  ORBIT — Particles Module
//  Manages all canvas-based particle effects
// ════════════════════════════════════════════════════════════

const Particles = (() => {

  // ── Star Field ─────────────────────────────────────────────

  class Star {
    constructor(w, h) {
      this.reset(w, h);
    }
    reset(w, h) {
      this.x     = Math.random() * w;
      this.y     = Math.random() * h;
      this.r     = Math.random() * 1.5 + 0.3;
      this.alpha = Math.random() * 0.6 + 0.1;
      this.speed = Math.random() * 0.3 + 0.05;
      this.phase = Math.random() * Math.PI * 2;
      this.twinklespeed = Math.random() * 0.015 + 0.005;
    }
    update(t) {
      this.phase += this.twinklespeed;
    }
    draw(ctx) {
      const a = this.alpha * (0.7 + 0.3 * Math.sin(this.phase));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${a})`;
      ctx.fill();
    }
  }

  // ── Nebula Dust ────────────────────────────────────────────

  class NebulaDust {
    constructor(w, h) {
      this.reset(w, h);
    }
    reset(w, h) {
      this.x     = Math.random() * w;
      this.y     = Math.random() * h;
      this.r     = Math.random() * 120 + 60;
      this.alpha = Math.random() * 0.04 + 0.01;
      this.hue   = Math.random() < 0.5 ? '210, 100%, 70%' : '270, 80%, 65%';
      this.phase = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 0.003 + 0.001;
      this.dx    = (Math.random() - 0.5) * 0.05;
      this.dy    = (Math.random() - 0.5) * 0.05;
    }
    update() {
      this.x    += this.dx;
      this.y    += this.dy;
      this.phase += this.speed;
    }
    draw(ctx, w, h) {
      const a = this.alpha * (0.6 + 0.4 * Math.sin(this.phase));
      const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
      grd.addColorStop(0, `hsla(${this.hue}, ${a})`);
      grd.addColorStop(1, `hsla(${this.hue}, 0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }
  }

  // ── Burst Particle ─────────────────────────────────────────

  class BurstParticle {
    constructor(x, y, color) {
      this.x     = x;
      this.y     = y;
      this.color = color;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.vx    = Math.cos(angle) * speed;
      this.vy    = Math.sin(angle) * speed;
      this.r     = Math.random() * 3 + 1;
      this.life  = 1;
      this.decay = Math.random() * 0.03 + 0.02;
      this.gravity = 0.04;
    }
    update() {
      this.x   += this.vx;
      this.y   += this.vy;
      this.vy  += this.gravity;
      this.vx  *= 0.97;
      this.life -= this.decay;
      this.r   *= 0.98;
    }
    get alive() { return this.life > 0 && this.r > 0.3; }
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color.replace(')', `, ${this.life})`).replace('rgb', 'rgba');
      ctx.fill();
    }
  }

  // ── Trail Particle ─────────────────────────────────────────

  class TrailParticle {
    constructor(x, y) {
      this.x     = x;
      this.y     = y;
      this.r     = Math.random() * 2 + 0.5;
      this.life  = 0.8;
      this.decay = Math.random() * 0.04 + 0.02;
      this.vx    = (Math.random() - 0.5) * 0.4;
      this.vy    = (Math.random() - 0.5) * 0.4;
    }
    update() {
      this.x   += this.vx;
      this.y   += this.vy;
      this.life -= this.decay;
    }
    get alive() { return this.life > 0; }
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * this.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(110, 231, 255, ${this.life * 0.4})`;
      ctx.fill();
    }
  }

  // ── Ripple ─────────────────────────────────────────────────

  class Ripple {
    constructor(x, y) {
      this.x     = x;
      this.y     = y;
      this.r     = 0;
      this.maxR  = 60;
      this.life  = 1;
      this.speed = 2;
    }
    update() {
      this.r    += this.speed;
      this.life  = 1 - this.r / this.maxR;
    }
    get alive() { return this.r < this.maxR; }
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(110, 231, 255, ${this.life * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  // ── Float Text ─────────────────────────────────────────────

  class FloatText {
    constructor(x, y, text) {
      this.x    = x;
      this.y    = y;
      this.text = text;
      this.life = 1;
      this.vy   = -0.6;
      this.decay = 0.012;
    }
    update() {
      this.y   += this.vy;
      this.life -= this.decay;
    }
    get alive() { return this.life > 0; }
    draw(ctx) {
      ctx.font        = `italic ${12 * this.life + 10}px 'Cormorant Garamond', serif`;
      ctx.fillStyle   = `rgba(255, 209, 102, ${this.life})`;
      ctx.textAlign   = 'center';
      ctx.fillText(this.text, this.x, this.y);
    }
  }

  // ── End Sequence Particles ─────────────────────────────────

  class EndDrift {
    constructor(w, h) {
      this.w = w;
      this.h = h;
      this.reset();
    }
    reset() {
      this.x     = Math.random() * this.w;
      this.y     = Math.random() * this.h;
      this.r     = Math.random() * 2 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.5 + 0.1;
      this.vx    = Math.cos(angle) * speed;
      this.vy    = Math.sin(angle) * speed;
      this.life  = 1;
      this.decay = Math.random() * 0.005 + 0.002;
    }
    update() {
      this.x   += this.vx;
      this.y   += this.vy;
      this.life -= this.decay;
    }
    get alive() { return this.life > 0; }
    draw(ctx) {
      const hue = Math.random() < 0.6 ? '195, 100%, 80%' : '265, 80%, 80%';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, ${this.life * this.alpha})`;
      ctx.fill();
    }
  }

  // ── Manager ────────────────────────────────────────────────

  let stars      = [];
  let nebulas    = [];
  let bursts     = [];
  let trails     = [];
  let ripples    = [];
  let floatTexts = [];
  let endDrifts  = [];

  function initStarField(w, h, count = 180) {
    stars   = Array.from({ length: count }, () => new Star(w, h));
    nebulas = Array.from({ length: 6 }, () => new NebulaDust(w, h));
  }

  function addBurst(x, y, color = 'rgb(255, 209, 102)', count = 14) {
    for (let i = 0; i < count; i++) bursts.push(new BurstParticle(x, y, color));
  }

  function addTrail(x, y) {
    trails.push(new TrailParticle(x, y));
  }

  function addRipple(x, y) {
    ripples.push(new Ripple(x, y));
  }

  function addFloatText(x, y, text) {
    floatTexts.push(new FloatText(x, y, text));
  }

  function triggerEndDrift(w, h, count = 120) {
    for (let i = 0; i < count; i++) {
      endDrifts.push(new EndDrift(w, h));
    }
  }

  function clear() {
    bursts = []; trails = []; ripples = []; floatTexts = []; endDrifts = [];
  }

  function updateAndDraw(ctx, t, w, h) {
    // Nebulas
    nebulas.forEach(n => { n.update(); n.draw(ctx, w, h); });

    // Stars
    stars.forEach(s => { s.update(t); s.draw(ctx); });

    // Bursts
    bursts = bursts.filter(p => { p.update(); if (p.alive) p.draw(ctx); return p.alive; });

    // Trails
    trails = trails.filter(p => { p.update(); if (p.alive) p.draw(ctx); return p.alive; });

    // Ripples
    ripples = ripples.filter(r => { r.update(); if (r.alive) r.draw(ctx); return r.alive; });

    // Float texts
    floatTexts = floatTexts.filter(f => { f.update(); if (f.alive) f.draw(ctx); return f.alive; });

    // End drifts
    endDrifts = endDrifts.filter(d => { d.update(); if (d.alive) d.draw(ctx); return d.alive; });
  }

  return {
    initStarField,
    addBurst,
    addTrail,
    addRipple,
    addFloatText,
    triggerEndDrift,
    clear,
    updateAndDraw,
  };
})();
