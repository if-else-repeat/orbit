// ════════════════════════════════════════════════════════════
//  ORBIT — UI Module
//  Screen management, landing stats, tutorial, end screen
// ════════════════════════════════════════════════════════════

const UI = (() => {

  // ── Screen transitions ─────────────────────────────────────

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
    if (cb) setTimeout(cb, 600);
  }

  function transition(fromId, toId, cb) {
    hide(fromId, () => {
      show(toId, cb);
    });
  }

  // ── Landing Screen ─────────────────────────────────────────

  function initLanding() {
    generateStarField('landing-stars', 80);

    const data = Storage.get();
    document.getElementById('stat-sessions').textContent = data.sessionsPlayed;
    document.getElementById('stat-minutes').textContent  = data.totalMinutes;
    document.getElementById('stat-harmony').textContent  = data.bestRank || '—';

    const streakEl = document.getElementById('streak-display');
    const streakTx = document.getElementById('streak-text');
    if (data.streakDays >= 2) {
      streakEl.style.display = 'flex';
      streakTx.textContent   = `${data.streakDays}-day streak`;
    }
  }

  function refreshLanding() {
    const data = Storage.get();
    document.getElementById('stat-sessions').textContent = data.sessionsPlayed;
    document.getElementById('stat-minutes').textContent  = data.totalMinutes;
    document.getElementById('stat-harmony').textContent  = data.bestRank || '—';
  }

  // ── Star Field Generator (HTML) ────────────────────────────

  function generateStarField(containerId, count) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star-dot';
      const size  = Math.random() * 2 + 0.5;
      const minOp = (Math.random() * 0.2 + 0.05).toFixed(2);
      const maxOp = (parseFloat(minOp) + Math.random() * 0.4 + 0.1).toFixed(2);
      const dur   = (Math.random() * 3 + 2).toFixed(1);
      star.style.cssText = `
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        width:${size}px; height:${size}px;
        --min-op:${minOp}; --max-op:${maxOp};
        --dur:${dur}s;
        animation-delay:${(Math.random() * dur).toFixed(1)}s;
      `;
      el.appendChild(star);
    }
  }

  // ── Tutorial ───────────────────────────────────────────────

  let tutRaf   = null;
  let tutStart = null;

  function startTutorialAnim() {
    const ring  = document.getElementById('breath-ring-anim');
    const phase = document.getElementById('breath-phase-label');
    const timer = document.getElementById('breath-timer-label');

    const PHASES = [
      { name: 'Inhale',  dur: 4,  cls: 'inhale',  color: '#B794F4' },
      { name: 'Hold',    dur: 7,  cls: 'hold',    color: '#6EE7FF' },
      { name: 'Exhale',  dur: 8,  cls: 'exhale',  color: '#8AFFC1' },
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
      const dt = (ts - lastT) / 1000;
      lastT = ts;

      const info = Breathing.tickTutorial(dt);
      timer.textContent = info.remaining;

      // CSS transition handles ring scale (set via class)
      ring.className = 'breath-ring ' + info.phase;

      tutRaf = requestAnimationFrame(step);
    }
    tutRaf = requestAnimationFrame(step);
  }

  function stopTutorialAnim() {
    if (tutRaf) { cancelAnimationFrame(tutRaf); tutRaf = null; }
  }

  // ── HUD Updates ────────────────────────────────────────────

  function updateTimer(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const el = document.getElementById('hud-timer');
    if (el) el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  }

  function updateHarmony(val) {
    const el = document.getElementById('hud-harmony');
    if (el) {
      el.textContent = val;
      el.style.transform = 'scale(1.3)';
      setTimeout(() => { el.style.transform = 'scale(1)'; }, 200);
    }
  }

  function updateBreathHUD(phase) {
    const ring  = document.getElementById('breath-ring-mini');
    const label = document.getElementById('breath-phase-mini');
    if (!ring || !label) return;

    const phaseMap = {
      inhale: { cls: 'inhale', text: 'Inhale' },
      hold:   { cls: 'hold',   text: 'Hold'   },
      exhale: { cls: 'exhale', text: 'Exhale' },
    };
    const info = phaseMap[phase];
    if (info) {
      ring.className  = 'breath-ring-mini ' + info.cls;
      label.textContent = info.text;
    }
  }

  // ── Insight Toast ──────────────────────────────────────────

  let toastTimer = null;

  function showInsight(text) {
    const el = document.getElementById('insight-toast');
    if (!el) return;

    if (toastTimer) { clearTimeout(toastTimer); el.classList.remove('show'); }

    setTimeout(() => {
      el.textContent = text;
      el.classList.add('show');
      toastTimer = setTimeout(() => {
        el.classList.remove('show');
        toastTimer = null;
      }, 2800);
    }, 50);
  }

  // ── End Screen ─────────────────────────────────────────────

  const RANKS = [
    { min: 0,   name: 'Drifting Wanderer', icon: '◌',  color: '#4A6080' },
    { min: 30,  name: 'Gentle Explorer',   icon: '○',  color: '#8AFFC1' },
    { min: 80,  name: 'Focused Navigator', icon: '◎',  color: '#6EE7FF' },
    { min: 150, name: 'Orbital Master',    icon: '✦',  color: '#B794F4' },
    { min: 250, name: 'Cosmic Scholar',    icon: '✧',  color: '#FFD166' },
  ];

  function getRank(harmony) {
    let rank = RANKS[0];
    for (const r of RANKS) {
      if (harmony >= r.min) rank = r;
    }
    return rank;
  }

  function showEndScreen(stats) {
    generateStarField('end-stars', 60);

    const rank = getRank(stats.harmony);

    // Badge
    document.getElementById('end-rank-icon').textContent  = rank.icon;
    document.getElementById('end-rank-title').textContent = rank.name;
    document.getElementById('end-rank-title').style.color = rank.color;

    // Stats
    document.getElementById('end-harmony-val').textContent = stats.harmony;
    document.getElementById('end-frags-val').textContent   = stats.collected;
    document.getElementById('end-breath-val').textContent  = stats.breathSync + '%';

    // Reflection card
    const card = CONTENT.getEndingCard();
    document.getElementById('reflection-type').textContent = card.label;
    document.getElementById('reflection-text').textContent = card.text;
    document.getElementById('reflection-author').textContent = card.author;

    // Animate card
    const cardEl = document.getElementById('reflection-card');
    cardEl.style.animation = 'none';
    cardEl.offsetHeight; // reflow
    cardEl.style.animation = '';

    // End tip
    document.getElementById('end-tip-text').textContent = CONTENT.getEndTip();

    // Achievements
    const earned = Storage.checkAchievements({ rank: rank.name, breathSync: stats.breathSync });
    if (earned.length) {
      const achEl = document.getElementById('achievement-pop');
      const achTx = document.getElementById('ach-text');
      achEl.style.display = 'flex';
      achTx.textContent   = 'Achievement: ' + earned[0];
      setTimeout(() => { achEl.style.display = 'none'; }, 5000);
    }

    return rank.name;
  }

  return {
    show,
    hide,
    transition,
    initLanding,
    refreshLanding,
    startTutorialAnim,
    stopTutorialAnim,
    updateTimer,
    updateHarmony,
    updateBreathHUD,
    showInsight,
    showEndScreen,
    getRank,
  };
})();
