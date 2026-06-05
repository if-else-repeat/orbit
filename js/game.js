// ════════════════════════════════════════════════════════════
//  ORBIT v2 — Main Game Controller
//  Pomodoro flow · Orbit game · Stats · Export
// ════════════════════════════════════════════════════════════

(function () {

  const SESSION_DURATION = 3 * 60;   // 180s orbit break

  let canvas, ctx;
  let raf         = null;
  let lastTs      = null;
  let timeLeft    = SESSION_DURATION;
  let gameRunning = false;
  let ending      = false;

  // Where to return after orbit ends
  let orbitContext = 'landing';  // 'landing' | 'pomodoro'
  let currentSessionStats = null;

  // ── Boot ─────────────────────────────────────────────────────

  function boot() {
    canvas = document.getElementById('game-canvas');
    ctx    = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    UI.initLanding();
    bindAll();
    UI.show('screen-landing');
  }

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    if (gameRunning) Orbit.resize(canvas);
  }

  // ── Bind everything ──────────────────────────────────────────

  function bindAll() {
    bindLanding();
    bindPomoSetup();
    bindStudy();
    bindBreakPrompt();
    bindTutorial();
    bindEnd();
    bindStats();
  }

  // ── Landing ──────────────────────────────────────────────────

  function bindLanding() {
    document.getElementById('btn-pomodoro').onclick = () => {
      Audio.init(); Audio.resume();
      UI.transition('screen-landing', 'screen-pomo-setup');
    };

    document.getElementById('btn-orbit-only').onclick = () => {
      Audio.init(); Audio.resume();
      orbitContext = 'landing';
      UI.transition('screen-landing', 'screen-tutorial', () => UI.startTutorialAnim());
    };

    document.getElementById('btn-view-stats').onclick = () => {
      UI.transition('screen-landing', 'screen-stats', () => Stats.show());
    };
  }

  // ── Pomodoro Setup ───────────────────────────────────────────

  function bindPomoSetup() {
    let studyMins = 25, breakMins = 5;

    const studyVal = document.getElementById('study-val');
    const breakVal = document.getElementById('break-val');

    function update(target, dir) {
      if (target === 'study') {
        studyMins = Math.max(5, Math.min(120, studyMins + dir * 5));
        studyVal.textContent = studyMins;
      } else {
        breakMins = Math.max(3, Math.min(30, breakMins + dir * 1));
        breakVal.textContent = breakMins;
      }
      // Deactivate presets when manually adjusted
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    }

    document.querySelectorAll('.picker-btn').forEach(btn => {
      btn.onclick = () => update(btn.dataset.target, parseInt(btn.dataset.dir));
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.onclick = () => {
        studyMins = parseInt(btn.dataset.study);
        breakMins = parseInt(btn.dataset.break);
        studyVal.textContent = studyMins;
        breakVal.textContent = breakMins;
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
    });

    document.getElementById('btn-begin-study').onclick = () => {
      const task = document.getElementById('task-input').value.trim();
      Pomodoro.configure(studyMins, breakMins, task);
      UI.transition('screen-pomo-setup', 'screen-study', () => startStudyTimer());
    };

    document.getElementById('btn-setup-back').onclick = () => {
      UI.transition('screen-pomo-setup', 'screen-landing');
    };
  }

  // ── Study Timer ──────────────────────────────────────────────

  function startStudyTimer() {
    const cfg = Pomodoro.getConfig();

    // Set task label
    const taskEl = document.getElementById('study-task-label');
    if (taskEl) taskEl.textContent = cfg.taskLabel || '';

    // Session badge
    const badgeEl = document.getElementById('study-session-badge');
    if (badgeEl) badgeEl.textContent = `Session ${Pomodoro.getSessionCount() + 1}`;

    // Set initial timer display
    const m = cfg.studyMins, s = 0;
    const timerEl = document.getElementById('study-timer');
    if (timerEl) timerEl.textContent = `${m}:${s.toString().padStart(2,'0')}`;

    UI.updateStudyTotal();

    Pomodoro.start({
      onTick: (secondsLeft) => {
        UI.updateStudyTimer(secondsLeft, cfg.studyMins);
        UI.updateStudyTotal();
      },
      onComplete: (info) => {
        Audio.pomodoroComplete();
        UI.transition('screen-study', 'screen-break-prompt', () => {
          UI.showBreakPrompt(info);
        });
      },
    });
  }

  function bindStudy() {
    document.getElementById('btn-end-study').onclick = () => {
      Pomodoro.endEarly();
    };
  }

  // ── Break Prompt ─────────────────────────────────────────────

  function bindBreakPrompt() {
    document.getElementById('btn-take-break').onclick = () => {
      orbitContext = 'pomodoro';
      UI.transition('screen-break-prompt', 'screen-tutorial', () => UI.startTutorialAnim());
    };

    document.getElementById('btn-keep-studying').onclick = () => {
      UI.transition('screen-break-prompt', 'screen-study', () => startStudyTimer());
    };
  }

  // ── Tutorial ─────────────────────────────────────────────────

  function bindTutorial() {
    document.getElementById('btn-start-game').onclick = () => {
      UI.stopTutorialAnim();
      UI.transition('screen-tutorial', 'screen-game', () => startGame());
    };

    document.getElementById('btn-skip-tutorial').onclick = () => {
      UI.stopTutorialAnim();
      UI.transition('screen-tutorial', 'screen-game', () => startGame());
    };
  }

  // ── End Screen ───────────────────────────────────────────────

  function bindEnd() {
    document.getElementById('btn-focus-session').onclick = () => {
      stopGame();
      if (orbitContext === 'pomodoro') {
        UI.transition('screen-end', 'screen-study', () => startStudyTimer());
      } else {
        UI.transition('screen-end', 'screen-landing', () => UI.refreshLanding());
      }
    };

    document.getElementById('btn-one-more').onclick = () => {
      UI.transition('screen-end', 'screen-game', () => startGame());
    };

    document.getElementById('btn-save-card').onclick = () => {
      if (currentSessionStats) Export.downloadFromSession(currentSessionStats);
    };
  }

  // ── Stats ────────────────────────────────────────────────────

  function bindStats() {
    document.getElementById('btn-stats-back').onclick = () => {
      UI.transition('screen-stats', 'screen-landing', () => UI.refreshLanding());
    };
  }

  // ── Game Input ───────────────────────────────────────────────

  function bindGameInput() {
    const el = document.getElementById('screen-game');
    el.addEventListener('mousedown',  onStart);
    el.addEventListener('mouseup',    onEnd);
    el.addEventListener('mouseleave', onEnd);
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend',   onEnd);
    el.addEventListener('touchcancel',onEnd);
  }

  function unbindGameInput() {
    const el = document.getElementById('screen-game');
    el.removeEventListener('mousedown',  onStart);
    el.removeEventListener('mouseup',    onEnd);
    el.removeEventListener('mouseleave', onEnd);
    el.removeEventListener('touchstart', onStart);
    el.removeEventListener('touchend',   onEnd);
    el.removeEventListener('touchcancel',onEnd);
  }

  function onStart(e) { e.preventDefault && e.preventDefault(); if (gameRunning && !ending) { Orbit.startHold(); Audio.resume(); } }
  function onEnd()    { if (gameRunning) Orbit.endHold(); }

  // ── Game Lifecycle ───────────────────────────────────────────

  function startGame() {
    timeLeft    = SESSION_DURATION;
    ending      = false;
    gameRunning = true;
    lastTs      = null;
    currentSessionStats = null;

    resizeCanvas();
    Particles.initStarField(canvas.width, canvas.height, 210);

    Orbit.init(canvas, {
      onCollect: (x, y, content) => {
        Particles.addBurst(x, y, '#FFD166', 16);
        Particles.addRipple(x, y, '255, 209, 102', 70);
        UI.showInsight(content);
        Audio.chime();
      },
      onHarmonyChange: (h) => UI.updateHarmony(h),
      onPulseWave: () => {
        const s = Orbit.getState();
        Particles.addPulseRing(canvas.width / 2, canvas.height / 2);
        Particles.addBurst(s.px, s.py, '#FFB347', 8, true);
        UI.showPulseWave();
        Audio.pulseWave();
      },
      onSweetEnter: () => {
        Audio.sweetEnter();
        const s = Orbit.getState();
        Particles.addSweetSparkle(s.px, s.py, 6);
      },
      onVoidEnter: () => {
        Audio.voidEnter();
        const s = Orbit.getState();
        Particles.addBurst(s.px, s.py, '#FF6B6B', 8);
        Particles.addRipple(s.px, s.py, '255, 80, 80', 50);
      },
    });

    Breathing.start({
      onPhaseChange: (phase) => {
        UI.updateBreathHUD(phase);
        switch(phase) {
          case 'inhale': Audio.breathInhale(Breathing.PATTERN.inhale); break;
          case 'hold':   Audio.breathHold();                            break;
          case 'exhale': Audio.breathExhale(Breathing.PATTERN.exhale); break;
        }
      }
    });

    Audio.startAmbient();
    Audio.startBreathTone();
    bindGameInput();

    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  function stopGame() {
    gameRunning = false; ending = false;
    Breathing.stop();
    Audio.stopBreathTone();
    unbindGameInput();
    Particles.clear();
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  // ── Main Loop ────────────────────────────────────────────────

  let endOverlayAlpha = 0;
  let endDelay = 0;

  function loop(ts) {
    if (!gameRunning) return;

    if (!lastTs) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    if (!ending) {
      timeLeft = Math.max(0, timeLeft - dt);
      UI.updateTimer(timeLeft);
      if (timeLeft <= 0) beginEndSequence();
    }

    const breathInfo = Breathing.tick(dt);
    Orbit.update(dt, breathInfo);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Particles.updateAndDraw(ctx, dt, canvas.width, canvas.height);
    Orbit.draw(ctx, breathInfo);

    if (ending) {
      endDelay += dt;
      if (endDelay > 1.2) {
        endOverlayAlpha = Math.min(0.88, endOverlayAlpha + dt * 0.28);
      }
      if (endOverlayAlpha > 0) {
        ctx.fillStyle = `rgba(7, 11, 26, ${endOverlayAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    raf = requestAnimationFrame(loop);
  }

  // ── End sequence ─────────────────────────────────────────────

  function beginEndSequence() {
    if (ending) return;
    ending = true; endOverlayAlpha = 0; endDelay = 0;
    Orbit.triggerEnd();
    Breathing.stop();
    Audio.stopBreathTone();
    Audio.stopAmbient(3);
    Audio.playCompletion();
    Particles.triggerEndDrift(canvas.width, canvas.height, 160);
    setTimeout(showEndScreen, 3600);
  }

  function showEndScreen() {
    const breathSync = Breathing.getBreathSync();
    const state      = Orbit.getState();
    const rankName   = UI.getRank(state.harmony).name;

    Storage.recordOrbit({
      harmony:   state.harmony,
      rank:      rankName,
      fragments: state.collected,
      breathSync,
    });

    currentSessionStats = {
      rank:      rankName,
      harmony:   state.harmony,
      collected: state.collected,
      breathSync,
    };

    UI.showEndScreen({ harmony: state.harmony, collected: state.collected, breathSync });
    stopGame();
    UI.transition('screen-game', 'screen-end');
  }

  // ── Init ─────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
