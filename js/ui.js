// ════════════════════════════════════════════════════════════
//  ORBIT v2 — UI Module
// ════════════════════════════════════════════════════════════

const UI = (() => {

  // ── Screen transitions ──────────────────────────────────────

  function show(id, cb) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('active');
    el.classList.remove('fade-out');
    if (cb) setTimeout(cb, 50);
  }

  function hide(id, cb) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('fade-out');
    el.classList.remove('active');
    if (cb) setTimeout(cb, 500);
  }

  function transition(fromId, toId, cb) {
    hide(fromId, () => show(toId, cb));
  }

  // ── Landing ─────────────────────────────────────────────────

  function initLanding() {
    generateStarField('landing-stars', 80);
    refreshLanding();
  }

  function refreshLanding() {
    const d = Storage.get();
    const today = d.todayStudyMins || 0;
    setText('stat-today',    today >= 60
      ? Math.floor(today/60) + 'h ' + (today%60) + 'm'
      : today + 'm');
    setText('stat-sessions', d.studySessions || 0);
    setText('stat-streak',   d.streakDays    || 0);
    setText('stat-rank',     d.bestRank      || '—');
  }

  // ── Star Field ──────────────────────────────────────────────

  function generateStarField(containerId, count) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const star  = document.createElement('div');
      star.className = 'star-dot';
      const size  = Math.random() * 1.8 + 0.4;
      const minOp = (Math.random() * 0.15 + 0.04).toFixed(2);
      const maxOp = (parseFloat(minOp) + Math.random() * 0.35 + 0.08).toFixed(2);
      const dur   = (Math.random() * 3 + 2).toFixed(1);
      star.style.cssText = `
        left:${Math.random()*100}%; top:${Math.random()*100}%;
        width:${size}px; height:${size}px;
        --min-op:${minOp}; --max-op:${maxOp}; --dur:${dur}s;
        animation-delay:${(Math.random()*parseFloat(dur)).toFixed(1)}s;
      `;
      el.appendChild(star);
    }
  }

  // ── Tutorial ─────────────────────────────────────────────────

  let tutRaf = null;

  function startTutorialAnim() {
    const ring  = document.getElementById('breath-ring-anim');
    const phase = document.getElementById('breath-phase-label');
    const timer = document.getElementById('breath-timer-label');

    const PHASES = [
      { name:'Inhale', cls:'inhale', color:'#B794F4', dur:4 },
      { name:'Hold',   cls:'hold',   color:'#6EE7FF', dur:7 },
      { name:'Exhale', cls:'exhale', color:'#8AFFC1', dur:8 },
    ];

    Breathing.startTutorial({
      onPhaseChange: (p) => {
        const info = PHASES.find(x => x.cls === p);
        if (info) {
          phase.textContent = info.name;
          phase.style.color = info.color;
          ring.className    = 'breath-ring ' + info.cls;
        }
      }
    });

    let lastT = null;
    function step(ts) {
      if (!lastT) lastT = ts;
      const dt = (ts - lastT) / 1000; lastT = ts;
      const info = Breathing.tickTutorial(dt);
      timer.textContent = info.remaining;
      ring.className    = 'breath-ring ' + info.phase;
      tutRaf = requestAnimationFrame(step);
    }
    tutRaf = requestAnimationFrame(step);
  }

  function stopTutorialAnim() {
    if (tutRaf) { cancelAnimationFrame(tutRaf); tutRaf = null; }
  }

  // ── HUD ──────────────────────────────────────────────────────

  function updateTimer(seconds) {
    const m  = Math.floor(seconds / 60);
    const s  = Math.floor(seconds % 60);
    setText('hud-timer', `${m}:${s.toString().padStart(2,'0')}`);
  }

  function updateHarmony(val) {
    const el = document.getElementById('hud-harmony');
    if (!el) return;
    el.textContent = val;
    el.style.transform = 'scale(1.3)';
    setTimeout(() => { el.style.transform = 'scale(1)'; }, 180);
  }

  function updateBreathHUD(phase) {
    const ring  = document.getElementById('breath-ring-mini');
    const label = document.getElementById('breath-phase-mini');
    if (!ring || !label) return;
    const map = { inhale:'Inhale', hold:'Hold', exhale:'Exhale' };
    ring.className   = 'breath-ring-mini ' + phase;
    label.textContent = map[phase] || phase;
  }

  // ── Insight Toast ────────────────────────────────────────────

  let toastTimer = null;

  function showInsight(text) {
    const el = document.getElementById('insight-toast');
    if (!el) return;
    if (toastTimer) { clearTimeout(toastTimer); el.classList.remove('show'); }
    setTimeout(() => {
      el.textContent = text;
      el.classList.add('show');
      toastTimer = setTimeout(() => { el.classList.remove('show'); toastTimer = null; }, 2600);
    }, 50);
  }

  // ── Pulse Wave Flash ─────────────────────────────────────────

  let pulseTextTimer = null;

  function showPulseWave() {
    const el = document.getElementById('pulse-wave-text');
    if (!el) return;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    if (pulseTextTimer) clearTimeout(pulseTextTimer);
    pulseTextTimer = setTimeout(() => el.classList.remove('show'), 1300);
  }

  // ── End Screen ───────────────────────────────────────────────

  const RANKS = [
    { min:0,   name:'Drifting Wanderer', icon:'◌', color:'#4A6080' },
    { min:30,  name:'Gentle Explorer',   icon:'○', color:'#8AFFC1' },
    { min:80,  name:'Focused Navigator', icon:'◎', color:'#6EE7FF' },
    { min:160, name:'Orbital Master',    icon:'✦', color:'#B794F4' },
    { min:280, name:'Cosmic Scholar',    icon:'✧', color:'#FFD166' },
  ];

  function getRank(harmony) {
    let rank = RANKS[0];
    for (const r of RANKS) if (harmony >= r.min) rank = r;
    return rank;
  }

  function showEndScreen(stats) {
    generateStarField('end-stars', 60);
    const rank = getRank(stats.harmony);

    setText('end-rank-icon',  rank.icon);
    setText('end-rank-title', rank.name);
    setStyle('end-rank-title', 'color', rank.color);

    setText('end-harmony-val', stats.harmony);
    setText('end-frags-val',   stats.collected);
    setText('end-breath-val',  stats.breathSync + '%');

    const card   = CONTENT.getEndingCard();
    setText('reflection-type',   card.label);
    setText('reflection-text',   card.text);
    setText('reflection-author', card.author);

    // Re-trigger card animation
    const cardEl = document.getElementById('reflection-card');
    if (cardEl) { cardEl.style.animation='none'; void cardEl.offsetHeight; cardEl.style.animation=''; }

    // Achievements
    const earned = Storage.checkAchievements({ rank: rank.name, breathSync: stats.breathSync });
    const achEl  = document.getElementById('achievement-pop');
    const achTx  = document.getElementById('ach-text');
    if (earned.length && achEl && achTx) {
      achEl.style.display = 'flex';
      achTx.textContent   = 'Unlocked: ' + earned[0];
      setTimeout(() => { achEl.style.display = 'none'; }, 5000);
    } else if (achEl) {
      achEl.style.display = 'none';
    }

    return rank.name;
  }

  // ── Study screen ─────────────────────────────────────────────

  function updateStudyTimer(secondsLeft, studyMins) {
    const m  = Math.floor(secondsLeft / 60);
    const s  = secondsLeft % 60;
    const el = document.getElementById('study-timer');
    if (!el) return;
    el.textContent = `${m}:${s.toString().padStart(2,'0')}`;
    el.className   = 'study-timer' + (secondsLeft <= 60 ? ' last-min' : '');
  }

  function updateStudyTotal() {
    const mins = Storage.getTodayMins();
    const el   = document.getElementById('study-total-display');
    if (el) el.textContent = mins + ' min studied today';
  }

  // ── Break prompt ─────────────────────────────────────────────

  function showBreakPrompt(info) {
    generateStarField('break-stars', 60);
    setText('break-title',   info.early ? 'Session ended.' : 'Session complete.');
    setText('break-studied', `You studied for ${info.studyMins} minutes.`);
    const total = Storage.get().todayStudyMins || 0;
    setText('break-total', `Total today: ${total} min`);
    setText('break-tip-text', CONTENT.getEndTip());
  }

  // ── Helpers ──────────────────────────────────────────────────

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function setStyle(id, prop, val) {
    const el = document.getElementById(id);
    if (el) el.style[prop] = val;
  }

  return {
    show, hide, transition,
    initLanding, refreshLanding, generateStarField,
    startTutorialAnim, stopTutorialAnim,
    updateTimer, updateHarmony, updateBreathHUD,
    showInsight, showPulseWave,
    showEndScreen, getRank,
    updateStudyTimer, updateStudyTotal,
    showBreakPrompt,
  };
})();
