// ════════════════════════════════════════════════════════════
//  ORBIT — Storage Module
//  Manages all localStorage persistence
// ════════════════════════════════════════════════════════════

const Storage = (() => {

  const KEY = 'orbit_v1';

  const DEFAULTS = {
    sessionsPlayed:   0,
    totalMinutes:     0,
    bestHarmony:      0,
    bestRank:         null,
    lastPlayed:       null,
    streakDays:       0,
    achievements:     [],
    allTimeFragments: 0,
    allTimeBreathSync: 0,
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Orbit: could not save to localStorage', e);
    }
  }

  function get() {
    return load();
  }

  function recordSession({ harmony, rank, fragments, breathSync }) {
    const data = load();
    data.sessionsPlayed += 1;
    data.totalMinutes  += 3;
    data.allTimeFragments += fragments;
    data.allTimeBreathSync = Math.round(
      ((data.allTimeBreathSync * (data.sessionsPlayed - 1)) + breathSync) / data.sessionsPlayed
    );

    if (harmony > data.bestHarmony) {
      data.bestHarmony = harmony;
      data.bestRank    = rank;
    }

    // Streak logic
    const today    = new Date().toDateString();
    const lastDate = data.lastPlayed;
    if (lastDate) {
      const last     = new Date(lastDate);
      const todayD   = new Date(today);
      const diff     = (todayD - last) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        data.streakDays += 1;
      } else if (diff > 1) {
        data.streakDays = 1;
      }
      // same day: keep streak
    } else {
      data.streakDays = 1;
    }
    data.lastPlayed = today;

    save(data);
    return data;
  }

  // ── Achievements ───────────────────────────────────────────

  const ACHIEVEMENTS = [
    { id: 'first_orbit',       label: 'First Orbit',         condition: d => d.sessionsPlayed >= 1 },
    { id: 'five_sessions',     label: 'Five Orbits',         condition: d => d.sessionsPlayed >= 5 },
    { id: 'ten_sessions',      label: 'Ten Orbits',          condition: d => d.sessionsPlayed >= 10 },
    { id: 'twenty_five',       label: '25 Sessions',         condition: d => d.sessionsPlayed >= 25 },
    { id: 'hundred_fragments', label: '100 Fragments',       condition: d => d.allTimeFragments >= 100 },
    { id: 'perfect_breath',    label: 'Perfect Breath',      condition: (d, s) => s && s.breathSync >= 90 },
    { id: 'orbital_master',    label: 'Orbital Master',      condition: (d, s) => s && s.rank === 'Orbital Master' },
    { id: 'cosmic_scholar',    label: 'Cosmic Scholar',      condition: (d, s) => s && s.rank === 'Cosmic Scholar' },
    { id: 'streak_3',          label: '3-Day Return',        condition: d => d.streakDays >= 3 },
    { id: 'streak_7',          label: '7-Day Return',        condition: d => d.streakDays >= 7 },
    { id: 'hour_spent',        label: 'An Hour in Orbit',    condition: d => d.totalMinutes >= 60 },
  ];

  function checkAchievements(sessionData) {
    const data   = load();
    const earned = [];

    for (const ach of ACHIEVEMENTS) {
      if (data.achievements.includes(ach.id)) continue;
      if (ach.condition(data, sessionData)) {
        data.achievements.push(ach.id);
        earned.push(ach.label);
      }
    }

    if (earned.length) save(data);
    return earned;
  }

  return { get, recordSession, checkAchievements };
})();
