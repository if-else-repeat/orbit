// ════════════════════════════════════════════════════════════
//  ORBIT — Main Game Controller
//  Orchestrates all modules into the complete experience
// ════════════════════════════════════════════════════════════

(function () {

  // ── Config ─────────────────────────────────────────────────
  const SESSION_DURATION = 3 * 60;  // 180 seconds

  // ── State ──────────────────────────────────────────────────
  let canvas, ctx;
  let raf         = null;
  let lastTs      = null;
  let timeLeft    = SESSION_DURATION;
  let gameRunning = false;
  let ending      = false;
  let harmonyVal  = 0;
  let collectedCount = 0;

  // ── Boot ───────────────────────────────────────────────────

  function boot() {
    canvas = document.getElementById('game-canvas');
    ctx    = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    UI.initLanding();

    bindLanding();
    bindTutorial();
    bindEnd();

    UI.show('screen-landing');
  }

  // ── Canvas ─────────────────────────────────────────────────

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    if (gameRunning) Orbit.resize(canvas);
  }

  // ── Bindings ───────────────────────────────────────────────

  function bindLanding() {
    document.getElementById('btn-begin').addEventListener('click', () => {
      Audio.init();
      Audio.resume();
      UI.transition('screen-landing', 'screen-tutorial', () => {
        UI.startTutorialAnim();
      });
    });
  }

  function bindTutorial() {
    document.getElementById('btn-start-game').addEventListener('click', () => {
      UI.stopTutorialAnim();
      UI.transition('screen-tutorial', 'screen-game', () => {
        startGame();
      });
    });

    document.getElementById('btn-skip-tutorial').addEventListener('click', () => {
      UI.stopTutorialAnim();
      UI.transition('screen-tutorial', 'screen-game', () => {
        startGame();
      });
    });
  }

  function bindEnd() {
    document.getElementById('btn-focus-session').addEventListener('click', () => {
      // Primary CTA — encourage studying
      UI.transition('screen-end', 'screen-landing', () => {
        UI.refreshLanding();
        stopGame();
      });
    });

    document.getElementById('btn-one-more').addEventListener('click', () => {
      UI.transition('screen-end', 'screen-game', () => {
        startGame();
      });
    });
  }

  // ── Input Binding ──────────────────────────────────────────

  function bindGameInput() {
    const el = document.getElementById('screen-game');

    // Mouse
    el.addEventListener('mousedown', onInputStart);
    el.addEventListener('mouseup',   onInputEnd);
    el.addEventListener('mouseleave', onInputEnd);

    // Touch
    el.addEventListener('touchstart', onInputStart, { passive: true });
    el.addEventListener('touchend',   onInputEnd);
    el.addEventListener('touchcancel',onInputEnd);
  }

  function unbindGameInput() {
    const el = document.getElementById('screen-game');
    el.removeEventListener('mousedown', onInputStart);
    el.removeEventListener('mouseup',   onInputEnd);
    el.removeEventListener('mouseleave', onInputEnd);
    el.removeEventListener('touchstart', onInputStart);
    el.removeEventListener('touchend',   onInputEnd);
    el.removeEventListener('touchcancel', onInputEnd);
  }

  function onInputStart(e) {
    e.preventDefault && e.preventDefault();
    if (!gameRunning || ending) return;
    Orbit.startHold();
    Audio.resume();
  }

  function onInputEnd() {
    if (!gameRunning) return;
    Orbit.endHold();
  }

  // ── Game Lifecycle ─────────────────────────────────────────

  function startGame() {
    timeLeft       = SESSION_DURATION;
    harmonyVal     = 0;
    collectedCount = 0;
    ending         = false;
    gameRunning    = true;
    lastTs         = null;

    resizeCanvas();

    Particles.initStarField(canvas.width, canvas.height, 200);

    Orbit.init(canvas, {
      onCollect: (x, y, content) => {
        Particles.addBurst(x, y, 'rgb(255, 209, 102)', 16);
        Particles.addRipple(x, y);
        collectedCount++;
        UI.showInsight(content);
        Audio.chime();
      },
      onHarmonyChange: (h) => {
        harmonyVal = h;
        UI.updateHarmony(h);
      }
    });

    Breathing.start({
      onPhaseChange: (phase) => {
        UI.updateBreathHUD(phase);
        switch (phase) {
          case 'inhale': Audio.breathInhale(Breathing.PATTERN.inhale);   break;
          case 'hold':   Audio.breathHold();                              break;
          case 'exhale': Audio.breathExhale(Breathing.PATTERN.exhale);   break;
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
    gameRunning = false;
    ending      = false;
    Breathing.stop();
    Audio.stopBreathTone();
    unbindGameInput();
    Particles.clear();
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  // ── Main Loop ──────────────────────────────────────────────

  function loop(ts) {
    if (!gameRunning) return;

    if (!lastTs) lastTs = ts;
    let dt = Math.min((ts - lastTs) / 1000, 0.05); // cap at 50ms
    lastTs = ts;

    // ── Timer ────────────────────────────────────────────
    if (!ending) {
      timeLeft = Math.max(0, timeLeft - dt);
      UI.updateTimer(timeLeft);

      if (timeLeft <= 0) {
        beginEndSequence();
      }
    }

    // ── Breathing ────────────────────────────────────────
    const breathInfo = Breathing.tick(dt);

    // ── Orbit Physics ────────────────────────────────────
    Orbit.update(dt, breathInfo);

    // ── Render ───────────────────────────────────────────
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Orbit.draw(ctx, breathInfo, ts);
    Particles.updateAndDraw(ctx, ts, canvas.width, canvas.height);

    // ── End sequence animation ────────────────────────────
    if (ending) {
      drawEndOverlay(dt);
    }

    raf = requestAnimationFrame(loop);
  }

  // ── End Sequence ───────────────────────────────────────────

  let endOverlayAlpha = 0;
  let endDelay        = 0;

  function beginEndSequence() {
    if (ending) return;
    ending         = true;
    endOverlayAlpha = 0;
    endDelay       = 0;

    Orbit.triggerEnd();
    Breathing.stop();
    Audio.stopBreathTone();
    Audio.stopAmbient(3);
    Audio.playCompletion();

    // Drift particles
    Particles.triggerEndDrift(canvas.width, canvas.height, 150);

    // After visual buildup, show end screen
    setTimeout(() => {
      showEndScreen();
    }, 3500);
  }

  function drawEndOverlay(dt) {
    endDelay += dt;
    if (endDelay > 1) {
      endOverlayAlpha = Math.min(0.85, endOverlayAlpha + dt * 0.3);
    }
    if (endOverlayAlpha > 0) {
      ctx.fillStyle = `rgba(7, 11, 26, ${endOverlayAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  function showEndScreen() {
    const breathSync = Breathing.getBreathSync();
    const state      = Orbit.getState();

    // Record in storage
    const rankName = UI.getRank(state.harmony).name;
    Storage.recordSession({
      harmony:    state.harmony,
      rank:       rankName,
      fragments:  state.collected,
      breathSync,
    });

    UI.showEndScreen({
      harmony:   state.harmony,
      collected: state.collected,
      breathSync,
    });

    stopGame();

    UI.transition('screen-game', 'screen-end');
  }

  // ── Init ───────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
