// ════════════════════════════════════════════════════════════
//  ORBIT — Breathing Engine
//  4-7-8 breath cycle manager + sync scoring
// ════════════════════════════════════════════════════════════

const Breathing = (() => {

  // 4-7-8 pattern (in seconds)
  const PATTERN = {
    inhale: 4,
    hold:   7,
    exhale: 8,
  };

  const CYCLE_DURATION = PATTERN.inhale + PATTERN.hold + PATTERN.exhale; // 19s

  let elapsed       = 0;  // seconds since start
  let phaseElapsed  = 0;
  let currentPhase  = 'inhale';
  let cycleCount    = 0;
  let syncScore     = 0;
  let syncSamples   = 0;
  let callbacks     = {};
  let running       = false;
  let lastTimestamp = null;

  // For tutorial (separate state)
  let tutElapsed   = 0;
  let tutPhase     = 'inhale';
  let tutCallbacks = {};

  function getPhase(t) {
    const inCycle = t % CYCLE_DURATION;
    if (inCycle < PATTERN.inhale)                            return 'inhale';
    if (inCycle < PATTERN.inhale + PATTERN.hold)             return 'hold';
    return 'exhale';
  }

  function getPhaseProgress(t) {
    const inCycle = t % CYCLE_DURATION;
    if (inCycle < PATTERN.inhale) {
      return { phase: 'inhale', progress: inCycle / PATTERN.inhale, remaining: PATTERN.inhale - inCycle };
    }
    if (inCycle < PATTERN.inhale + PATTERN.hold) {
      const p = inCycle - PATTERN.inhale;
      return { phase: 'hold', progress: p / PATTERN.hold, remaining: PATTERN.hold - p };
    }
    const p = inCycle - PATTERN.inhale - PATTERN.hold;
    return { phase: 'exhale', progress: p / PATTERN.exhale, remaining: PATTERN.exhale - p };
  }

  // ── Scale factor for breathing ring ───────────────────────
  // inhale: 0.5 → 1.0  |  hold: 1.0  |  exhale: 1.0 → 0.5

  function getScale(t) {
    const { phase, progress } = getPhaseProgress(t);
    switch (phase) {
      case 'inhale': return 0.5 + 0.5 * easeInOut(progress);
      case 'hold':   return 1.0;
      case 'exhale': return 1.0 - 0.5 * easeInOut(progress);
      default:       return 0.75;
    }
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  // ── Game Breathing Engine ──────────────────────────────────

  function start(cbs) {
    callbacks    = cbs || {};
    elapsed      = 0;
    phaseElapsed = 0;
    currentPhase = 'inhale';
    cycleCount   = 0;
    syncScore    = 0;
    syncSamples  = 0;
    running      = true;
    lastTimestamp = null;
  }

  function tick(dt) {
    if (!running) return null;

    elapsed      += dt;
    phaseElapsed += dt;

    const info = getPhaseProgress(elapsed);

    // Phase transition
    if (info.phase !== currentPhase) {
      const prev = currentPhase;
      currentPhase = info.phase;
      phaseElapsed = 0;

      if (prev === 'exhale' && currentPhase === 'inhale') {
        cycleCount++;
        callbacks.onCycle && callbacks.onCycle(cycleCount);
      }
      callbacks.onPhaseChange && callbacks.onPhaseChange(currentPhase, info.remaining);
    }

    return {
      phase:     currentPhase,
      scale:     getScale(elapsed),
      progress:  info.progress,
      remaining: Math.ceil(info.remaining),
      elapsed,
    };
  }

  function stop() {
    running = false;
  }

  // ── Sync Scoring ───────────────────────────────────────────
  // Measure how smoothly the player's orbital movement mirrors the breath

  function recordOrbitalDelta(orbitalVelocity, breathPhase) {
    let ideal;
    switch (breathPhase) {
      case 'inhale': ideal =  1; break;  // expanding
      case 'hold':   ideal =  0; break;  // steady
      case 'exhale': ideal = -1; break;  // contracting
      default:       ideal =  0;
    }

    // Normalize velocity to -1..1
    const norm   = Math.max(-1, Math.min(1, orbitalVelocity / 5));
    const delta  = 1 - Math.abs(norm - ideal) / 2;  // 0..1
    syncScore    = (syncScore * syncSamples + delta) / (syncSamples + 1);
    syncSamples++;
  }

  function getBreathSync() {
    return Math.round(syncScore * 100);
  }

  // ── Tutorial Animation ─────────────────────────────────────

  function startTutorial(cbs) {
    tutCallbacks = cbs || {};
    tutElapsed   = 0;
    tutPhase     = 'inhale';
  }

  function tickTutorial(dt) {
    tutElapsed += dt;
    const info = getPhaseProgress(tutElapsed);

    if (info.phase !== tutPhase) {
      tutPhase = info.phase;
      tutCallbacks.onPhaseChange && tutCallbacks.onPhaseChange(tutPhase, info.remaining);
    }

    return {
      phase:     tutPhase,
      scale:     getScale(tutElapsed),
      remaining: Math.ceil(info.remaining),
    };
  }

  return {
    start,
    tick,
    stop,
    getBreathSync,
    recordOrbitalDelta,
    startTutorial,
    tickTutorial,
    PATTERN,
    CYCLE_DURATION,
    getScale,
  };
})();
