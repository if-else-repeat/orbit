// ════════════════════════════════════════════════════════════
//  ORBIT — Audio Module
//  Procedural audio via Web Audio API — no downloads required
// ════════════════════════════════════════════════════════════

const Audio = (() => {

  let ctx = null;
  let masterGain = null;
  let droneNodes = [];
  let isRunning = false;

  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.connect(ctx.destination);
    } catch (e) {
      console.warn('Orbit: Web Audio not available', e);
    }
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  // ── Ambient Drone ──────────────────────────────────────────
  // Layered sine waves tuned to calming frequencies (432 Hz base)

  function startAmbient() {
    if (!ctx || isRunning) return;
    resume();
    isRunning = true;

    const layers = [
      { freq: 108,  gain: 0.06, detune: 0   },
      { freq: 144,  gain: 0.04, detune: 3   },
      { freq: 216,  gain: 0.03, detune: -2  },
      { freq: 288,  gain: 0.025, detune: 1  },
      { freq: 432,  gain: 0.02, detune: 0   },
    ];

    droneNodes = layers.map(({ freq, gain, detune }) => {
      const osc  = ctx.createOscillator();
      const gain_node = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.detune.setValueAtTime(detune, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      gain_node.gain.setValueAtTime(0, ctx.currentTime);
      gain_node.gain.linearRampToValueAtTime(gain, ctx.currentTime + 3);

      osc.connect(filter);
      filter.connect(gain_node);
      gain_node.connect(masterGain);
      osc.start();

      // Subtle LFO for alive feeling
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.1, ctx.currentTime);
      lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);
      lfo.start();

      return { osc, gain_node, lfo };
    });

    masterGain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 3);
  }

  function stopAmbient(fadeTime = 3) {
    if (!ctx || !isRunning) return;
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeTime);
    setTimeout(() => {
      droneNodes.forEach(({ osc, lfo }) => {
        try { osc.stop(); } catch {}
        try { lfo.stop(); } catch {}
      });
      droneNodes = [];
      isRunning = false;
    }, fadeTime * 1000 + 100);
  }

  // ── Fragment Chime ─────────────────────────────────────────
  // Soft bell-like tone on fragment collection

  function chime() {
    if (!ctx) return;
    resume();

    const notes = [528, 639, 741, 852]; // Solfeggio frequencies
    const note  = notes[Math.floor(Math.random() * notes.length)];

    const osc     = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter  = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, ctx.currentTime);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.3);

    // Harmonic overtone
    const osc2 = ctx.createOscillator();
    const g2   = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(note * 2, ctx.currentTime);
    g2.gain.setValueAtTime(0, ctx.currentTime);
    g2.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc2.connect(g2);
    g2.connect(ctx.destination);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.9);
  }

  // ── Breath Tone ────────────────────────────────────────────
  // Subtle rise/fall tone synchronized to breathing phase

  let breathOsc = null;
  let breathGain = null;

  function startBreathTone() {
    if (!ctx) return;
    resume();
    if (breathOsc) return;

    breathOsc  = ctx.createOscillator();
    breathGain = ctx.createGain();

    breathOsc.type = 'sine';
    breathOsc.frequency.setValueAtTime(180, ctx.currentTime);
    breathGain.gain.setValueAtTime(0, ctx.currentTime);

    breathOsc.connect(breathGain);
    breathGain.connect(ctx.destination);
    breathOsc.start();
  }

  function breathInhale(duration) {
    if (!ctx || !breathOsc) return;
    breathOsc.frequency.linearRampToValueAtTime(220, ctx.currentTime + duration);
    breathGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + duration);
  }

  function breathHold() {
    if (!ctx || !breathOsc) return;
    breathOsc.frequency.setValueAtTime(220, ctx.currentTime);
    breathGain.gain.setValueAtTime(0.04, ctx.currentTime);
  }

  function breathExhale(duration) {
    if (!ctx || !breathOsc) return;
    breathOsc.frequency.linearRampToValueAtTime(160, ctx.currentTime + duration);
    breathGain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  }

  function stopBreathTone() {
    if (!breathOsc) return;
    try { breathGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5); }
    catch {}
    setTimeout(() => {
      try { breathOsc.stop(); } catch {}
      breathOsc  = null;
      breathGain = null;
    }, 600);
  }

  // ── Completion Sound ───────────────────────────────────────
  // A warm, resolved chord for the end sequence

  function playCompletion() {
    if (!ctx) return;
    resume();

    const chord = [
      { freq: 261.63, gain: 0.08, delay: 0    },  // C4
      { freq: 329.63, gain: 0.06, delay: 0.15 },  // E4
      { freq: 392.00, gain: 0.05, delay: 0.30 },  // G4
      { freq: 523.25, gain: 0.04, delay: 0.50 },  // C5
    ];

    chord.forEach(({ freq, gain, delay }) => {
      const osc  = ctx.createOscillator();
      const g    = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      g.gain.setValueAtTime(0, ctx.currentTime + delay);
      g.gain.linearRampToValueAtTime(gain, ctx.currentTime + delay + 0.1);
      g.gain.setValueAtTime(gain, ctx.currentTime + delay + 1.5);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 4);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 4.5);
    });
  }

  return {
    init,
    resume,
    startAmbient,
    stopAmbient,
    chime,
    startBreathTone,
    breathInhale,
    breathHold,
    breathExhale,
    stopBreathTone,
    playCompletion,
  };
})();
