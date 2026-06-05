// ════════════════════════════════════════════════════════════
//  ORBIT v2 — Storage (upgraded)
//  Tracks study time · orbit sessions · streaks · achievements
// ════════════════════════════════════════════════════════════

const Storage = (() => {

  const KEY = 'orbit_v2';

  const DEFAULTS = {
    // Study
    studySessions:    0,
    totalStudyMins:   0,
    todayStudyMins:   0,
    weekStudyMins:    0,
    lastStudyDate:    null,

    // Orbit
    orbitSessions:    0,
    totalOrbitMins:   0,
    bestHarmony:      0,
    bestRank:         null,
    allTimeFragments: 0,

    // Streak
    streakDays:       0,
    lastActiveDate:   null,

    // Achievements
    achievements:     [],

    // Meta
    schemaVersion:    2,
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw);
      // Migrate from v1 if needed
      if (!parsed.schemaVersion || parsed.schemaVersion < 2) {
        return { ...DEFAULTS, streakDays: parsed.streakDays || 0 };
      }
      return { ...DEFAULTS, ...parsed };
    } catch { return { ...DEFAULTS }; }
  }

  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch(e) { console.warn('Orbit: localStorage save failed', e); }
  }

  function get() { return load(); }

  // ── Study session recording ──────────────────────────────────

  function recordStudy(minutes) {
    const data    = load();
    const today   = new Date().toDateString();
    const lastDay = data.lastStudyDate;

    data.studySessions    += 1;
    data.totalStudyMins   += minutes;

    // Today reset
    if (lastDay !== today) {
      data.todayStudyMins = 0;
    }
    data.todayStudyMins += minutes;
    data.lastStudyDate   = today;

    // Week (simple: last 7 days rolling — stored as daily log)
    data.weekStudyMins = (data.weekStudyMins || 0) + minutes;

    updateStreak(data, today);
    save(data);
    return data;
  }

  // ── Orbit session recording ──────────────────────────────────

  function recordOrbit({ harmony, rank, fragments, breathSync }) {
    const data  = load();
    const today = new Date().toDateString();

    data.orbitSessions    += 1;
    data.totalOrbitMins   += 3;
    data.allTimeFragments  = (data.allTimeFragments || 0) + fragments;

    if (harmony > data.bestHarmony) {
      data.bestHarmony = harmony;
      data.bestRank    = rank;
    }

    updateStreak(data, today);
    save(data);
    return data;
  }

  function updateStreak(data, today) {
    const last = data.lastActiveDate;
    if (last) {
      const diff = (new Date(today) - new Date(last)) / (1000 * 60 * 60 * 24);
      if (diff === 1)      data.streakDays += 1;
      else if (diff > 1)   data.streakDays  = 1;
      // same day: keep streak unchanged
    } else {
      data.streakDays = 1;
    }
    data.lastActiveDate = today;
  }

  // ── Today's study minutes (live read) ───────────────────────

  function getTodayMins() {
    const data  = load();
    const today = new Date().toDateString();
    if (data.lastStudyDate !== today) return 0;
    return data.todayStudyMins || 0;
  }

  // ── Achievements ─────────────────────────────────────────────

  const ALL_ACHIEVEMENTS = [
    { id: 'first_orbit',     label: 'First Orbit',       icon: '◌', condition: d => d.orbitSessions >= 1 },
    { id: 'five_orbits',     label: 'Five Orbits',        icon: '○', condition: d => d.orbitSessions >= 5 },
    { id: 'ten_orbits',      label: 'Ten Orbits',         icon: '◎', condition: d => d.orbitSessions >= 10 },
    { id: 'first_study',     label: 'First Session',      icon: '✦', condition: d => d.studySessions >= 1 },
    { id: 'five_study',      label: 'Five Sessions',      icon: '✦', condition: d => d.studySessions >= 5 },
    { id: 'hour_studied',    label: 'One Hour Studied',   icon: '◈', condition: d => d.totalStudyMins >= 60 },
    { id: 'five_hours',      label: 'Five Hours Studied', icon: '◈', condition: d => d.totalStudyMins >= 300 },
    { id: 'hundred_frags',   label: '100 Fragments',      icon: '✧', condition: d => d.allTimeFragments >= 100 },
    { id: 'orbital_master',  label: 'Orbital Master',     icon: '✦', condition: (d,s) => s && s.rank === 'Orbital Master' },
    { id: 'cosmic_scholar',  label: 'Cosmic Scholar',     icon: '✧', condition: (d,s) => s && s.rank === 'Cosmic Scholar' },
    { id: 'perfect_breath',  label: 'Perfect Breath',     icon: '◉', condition: (d,s) => s && s.breathSync >= 88 },
    { id: 'streak_3',        label: '3-Day Streak',       icon: '⬡', condition: d => d.streakDays >= 3 },
    { id: 'streak_7',        label: '7-Day Streak',       icon: '⬡', condition: d => d.streakDays >= 7 },
    { id: 'streak_14',       label: '14-Day Streak',      icon: '⬡', condition: d => d.streakDays >= 14 },
    { id: 'hour_in_orbit',   label: 'Hour in Orbit',      icon: '◌', condition: d => d.totalOrbitMins >= 60 },
    { id: 'two_hours_study', label: '2h in One Day',      icon: '◈', condition: d => d.todayStudyMins >= 120 },
  ];

  function getAllAchievements() { return ALL_ACHIEVEMENTS; }

  function checkAchievements(sessionData) {
    const data  = load();
    const earned = [];
    for (const ach of ALL_ACHIEVEMENTS) {
      if (data.achievements.includes(ach.id)) continue;
      if (ach.condition(data, sessionData)) {
        data.achievements.push(ach.id);
        earned.push(ach.label);
      }
    }
    if (earned.length) save(data);
    return earned;
  }

  return {
    get, save: (d) => save(d),
    recordStudy, recordOrbit, getTodayMins,
    getAllAchievements, checkAchievements,
  };
})();
