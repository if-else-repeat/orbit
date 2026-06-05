// ════════════════════════════════════════════════════════════
//  ORBIT v2 — Audio (upgraded)
//  Ambient · Chimes · Pomodoro bell · Sweet/Void tones
// ════════════════════════════════════════════════════════════

const Audio = (() => {

  let ctx = null;
  let masterGain = null;
  let droneNodes = [];
  let isRunning  = false;
  let breathOsc  = null;
  let breathGain = null;

  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.connect(ctx.destination);
    } catch(e) { console.warn('Orbit: Web Audio unavailable', e); }
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  // ── Ambient Drone ───────────────────────────────────────────

  function startAmbient() {
    if (!ctx || isRunning) return;
    resume(); isRunning = true;

    const layers = [
      { freq: 108,  gain: 0.055, detune: 0  },
      { freq: 144,  gain: 0.038, detune: 3  },
      { freq: 216,  gain: 0.028, detune: -2 },
      { freq: 288,  gain: 0.022, detune: 1  },
      { freq: 432,  gain: 0.016, detune: 0  },
    ];

    droneNodes = layers.map(({ freq, gain, detune }) => {
      const osc    = ctx.createOscillator();
      const gainN  = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.detune.setValueAtTime(detune, ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, ctx.currentTime);
      gainN.gain.setValueAtTime(0, ctx.currentTime);
      gainN.gain.linearRampToValueAtTime(gain, ctx.currentTime + 3.5);

      osc.connect(filter); filter.connect(gainN); gainN.connect(masterGain);
      osc.start();

      const lfo     = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.08 + Math.random() * 0.08, ctx.currentTime);
      lfoGain.gain.setValueAtTime(1.2, ctx.currentTime);
      lfo.connect(lfoGain); lfoGain.connect(osc.detune);
      lfo.start();

      return { osc, gainN, lfo };
    });

    masterGain.gain.linearRampToValueAtTime(0.75, ctx.currentTime + 3.5);
  }

  function stopAmbient(fadeTime = 3) {
    if (!ctx || !isRunning) return;
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeTime);
    setTimeout(() => {
      droneNodes.forEach(({ osc, lfo }) => {
        try { osc.stop(); } catch {}
        try { lfo.stop(); } catch {}
      });
      droneNodes = []; isRunning = false;
    }, fadeTime * 1000 + 100);
  }

  // ── Fragment Chime ──────────────────────────────────────────

  function chime(isPulse = false) {
    if (!ctx) return; resume();
    const notes = isPulse
      ? [741, 852, 963]          // higher for pulse
      : [528, 639, 741, 852];
    const note  = notes[Math.floor(Math.random() * notes.length)];

    const osc    = ctx.createOscillator();
    const gainN  = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, ctx.currentTime);
    filter.type = 'highpass'; filter.frequency.setValueAtTime(250, ctx.currentTime);
    gainN.gain.setValueAtTime(0, ctx.currentTime);
    gainN.gain.linearRampToValueAtTime(isPulse ? 0.2 : 0.13, ctx.currentTime + 0.01);
    gainN.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
    osc.connect(filter); filter.connect(gainN); gainN.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 1.5);

    // Overtone
    const osc2 = ctx.createOscillator();
    const g2   = ctx.createGain();
    osc2.type  = 'sine';
    osc2.frequency.setValueAtTime(note * 2, ctx.currentTime);
    g2.gain.setValueAtTime(0, ctx.currentTime);
    g2.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc2.connect(g2); g2.connect(ctx.destination);
    osc2.start(); osc2.stop(ctx.currentTime + 1);
  }

  // ── Sweet Zone Enter ────────────────────────────────────────

  function sweetEnter() {
    if (!ctx) return; resume();
    const osc   = ctx.createOscillator();
    const gainN = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(528, ctx.currentTime + 0.15);
    gainN.gain.setValueAtTime(0, ctx.currentTime);
    gainN.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.05);
    gainN.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gainN); gainN.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.6);
  }

  // ── Void Zone Enter ─────────────────────────────────────────

  function voidEnter() {
    if (!ctx) return; resume();
    const osc   = ctx.createOscillator();
    const gainN = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.3);
    gainN.gain.setValueAtTime(0, ctx.currentTime);
    gainN.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.05);
    gainN.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(400, ctx.currentTime);
    osc.connect(filter); filter.connect(gainN); gainN.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.5);
  }

  // ── Breath Tone ─────────────────────────────────────────────

  function startBreathTone() {
    if (!ctx || breathOsc) return; resume();
    breathOsc  = ctx.createOscillator();
    breathGain = ctx.createGain();
    breathOsc.type = 'sine';
    breathOsc.frequency.setValueAtTime(175, ctx.currentTime);
    breathGain.gain.setValueAtTime(0, ctx.currentTime);
    breathOsc.connect(breathGain); breathGain.connect(ctx.destination);
    breathOsc.start();
  }

  function breathInhale(duration) {
    if (!ctx || !breathOsc) return;
    breathOsc.frequency.linearRampToValueAtTime(215, ctx.currentTime + duration);
    breathGain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + duration);
  }

  function breathHold() {
    if (!ctx || !breathOsc) return;
    breathOsc.frequency.setValueAtTime(215, ctx.currentTime);
    breathGain.gain.setValueAtTime(0.035, ctx.currentTime);
  }

  function breathExhale(duration) {
    if (!ctx || !breathOsc) return;
    breathOsc.frequency.linearRampToValueAtTime(155, ctx.currentTime + duration);
    breathGain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  }

  function stopBreathTone() {
    if (!breathOsc) return;
    try { breathGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5); } catch {}
    setTimeout(() => {
      try { breathOsc.stop(); } catch {}
      breathOsc = null; breathGain = null;
    }, 600);
  }

  // ── Pomodoro Bell ───────────────────────────────────────────
  // Classic school bell feel — warm, not alarming

  function pomodoroComplete() {
    if (!ctx) return; resume();

    const strikes = [0, 0.6, 1.2];
    strikes.forEach(delay => {
      const osc    = ctx.createOscillator();
      const gainN  = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime + delay);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime + delay);
      filter.Q.setValueAtTime(0.8, ctx.currentTime + delay);

      gainN.gain.setValueAtTime(0, ctx.currentTime + delay);
      gainN.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.02);
      gainN.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 1.8);

      osc.connect(filter); filter.connect(gainN); gainN.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 2);

      // Harmonic
      const osc2 = ctx.createOscillator();
      const g2   = ctx.createGain();
      osc2.type  = 'sine';
      osc2.frequency.setValueAtTime(1320, ctx.currentTime + delay);
      g2.gain.setValueAtTime(0, ctx.currentTime + delay);
      g2.gain.linearRampToValueAtTime(0.1, ctx.currentTime + delay + 0.02);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 1.2);
      osc2.connect(g2); g2.connect(ctx.destination);
      osc2.start(ctx.currentTime + delay);
      osc2.stop(ctx.currentTime + delay + 1.5);
    });
  }

  // ── Completion Chord ────────────────────────────────────────

  function playCompletion() {
    if (!ctx) return; resume();
    const chord = [
      { freq: 261.63, gain: 0.07, delay: 0    },
      { freq: 329.63, gain: 0.055, delay: 0.15 },
      { freq: 392.00, gain: 0.045, delay: 0.30 },
      { freq: 523.25, gain: 0.035, delay: 0.50 },
    ];
    chord.forEach(({ freq, gain, delay }) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      g.gain.setValueAtTime(0, ctx.currentTime + delay);
      g.gain.linearRampToValueAtTime(gain, ctx.currentTime + delay + 0.1);
      g.gain.setValueAtTime(gain, ctx.currentTime + delay + 1.5);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 4.5);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + 5);
    });
  }

  // ── Pulse Wave Sound ────────────────────────────────────────

  function pulseWave() {
    if (!ctx) return; resume();
    const osc   = ctx.createOscillator();
    const gainN = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(480, ctx.currentTime + 0.3);
    gainN.gain.setValueAtTime(0, ctx.currentTime);
    gainN.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
    gainN.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.connect(gainN); gainN.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.9);
  }

  return {
    init, resume,
    startAmbient, stopAmbient,
    chime, sweetEnter, voidEnter, pulseWave,
    startBreathTone, breathInhale, breathHold, breathExhale, stopBreathTone,
    pomodoroComplete, playCompletion,
  };
})();
