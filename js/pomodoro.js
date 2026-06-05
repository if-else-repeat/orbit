// ════════════════════════════════════════════════════════════
//  ORBIT v2 — Pomodoro Module
//  Study timer · Break prompt · Session tracking
// ════════════════════════════════════════════════════════════

const Pomodoro = (() => {

  let studyMins    = 25;
  let breakMins    = 5;
  let taskLabel    = '';
  let sessionCount = 0;

  let timeLeft     = 0;
  let running      = false;
  let interval     = null;
  let onTick       = null;
  let onComplete   = null;
  let minutesStudied = 0;

  // ── Configuration ───────────────────────────────────────────

  function configure(study, brk, task) {
    studyMins = study;
    breakMins = brk;
    taskLabel = task || '';
  }

  function getConfig() {
    return { studyMins, breakMins, taskLabel };
  }

  // ── Timer ───────────────────────────────────────────────────

  function start(callbacks = {}) {
    onTick     = callbacks.onTick;
    onComplete = callbacks.onComplete;

    sessionCount++;
    timeLeft       = studyMins * 60;
    minutesStudied = 0;
    running        = true;

    if (interval) clearInterval(interval);
    interval = setInterval(tick, 1000);
    tick(); // immediate first render
  }

  function tick() {
    if (!running) return;
    timeLeft = Math.max(0, timeLeft - 1);
    minutesStudied = studyMins - Math.ceil(timeLeft / 60);
    onTick && onTick(timeLeft, minutesStudied);

    if (timeLeft <= 0) {
      complete();
    }
  }

  function complete() {
    running = false;
    clearInterval(interval);
    interval = null;
    Storage.recordStudy(studyMins);
    onComplete && onComplete({
      studyMins,
      breakMins,
      sessionCount,
      taskLabel,
    });
  }

  function endEarly() {
    if (!running) return;
    running = false;
    clearInterval(interval); interval = null;
    const done = studyMins - Math.ceil(timeLeft / 60);
    if (done > 0) Storage.recordStudy(done);
    onComplete && onComplete({
      studyMins: done,
      breakMins,
      sessionCount,
      taskLabel,
      early: true,
    });
  }

  function pause()  { running = false; }
  function resume_() { running = true; }
  function getTimeLeft() { return timeLeft; }
  function getSessionCount() { return sessionCount; }
  function isRunning() { return running; }

  return {
    configure, getConfig,
    start, endEarly, pause, resume: resume_,
    getTimeLeft, getSessionCount, isRunning,
  };
})();
