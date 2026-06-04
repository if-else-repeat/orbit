# ORBIT — A Focus Ritual

> *Relax. Breathe. Return stronger.*

A browser-based kinetic meditation game designed for students to play during Pomodoro breaks. Three minutes of calm orbital motion, synchronized breathing, and micro-learning — then back to the books.

---

## What It Is

Orbit is not a game to get lost in. It exists only to **prepare you for the next study session.**

- **3-minute sessions** — ends automatically, every time
- **No accounts, no ads, no endless mode, no progression traps**
- **Breathing synchronization** — the 4-7-8 pattern lowers heart rate measurably
- **Micro-learning** — every collected fragment surfaces a study insight or science fact
- **Surprise endings** — quotes, challenges, cosmic messages, science facts

---

## How to Play

1. Open `index.html` in a browser (or visit the GitHub Pages URL)
2. Click **Begin Orbit**
3. Follow the breathing guide (optional but recommended)
4. Hold mouse/finger → orbit expands | Release → orbit contracts
5. Collect golden fragments floating in space
6. After 3 minutes, read your reflection card
7. Click **Start Focus Session** and go study

---

## File Structure

```
orbit/
├── index.html          — Main HTML, all screen markup
├── style.css           — Complete stylesheet
├── js/
│   ├── content.js      — 300+ quotes, tips, facts, insights
│   ├── storage.js      — localStorage persistence + achievements
│   ├── audio.js        — Procedural Web Audio API sounds
│   ├── particles.js    — Canvas particle system
│   ├── breathing.js    — 4-7-8 breath engine + sync scoring
│   ├── orbit.js        — Orbital physics + fragment system
│   ├── ui.js           — Screen transitions, HUD, end screen
│   └── game.js         — Main game loop, orchestration
└── README.md
```

---

## Deploying to GitHub Pages

1. Create a new GitHub repository (e.g. `orbit`)
2. Add all files maintaining the folder structure above
3. Go to **Settings → Pages**
4. Set source to **main branch / root**
5. Your game is live at `https://yourusername.github.io/orbit`

---

## Harmony Ranks

| Rank | Harmony Required |
|------|-----------------|
| Drifting Wanderer | 0+ |
| Gentle Explorer | 30+ |
| Focused Navigator | 80+ |
| Orbital Master | 150+ |
| Cosmic Scholar | 250+ |

---

## Achievements

| Achievement | How to Earn |
|-------------|-------------|
| First Orbit | Complete 1 session |
| Five Orbits | Complete 5 sessions |
| Ten Orbits | Complete 10 sessions |
| 25 Sessions | Complete 25 sessions |
| 100 Fragments | Collect 100 total fragments |
| Perfect Breath | Achieve 90%+ breath sync |
| Orbital Master | Reach Orbital Master rank |
| Cosmic Scholar | Reach Cosmic Scholar rank |
| 3-Day Return | Return 3 days in a row |
| 7-Day Return | Return 7 days in a row |
| An Hour in Orbit | Spend 60+ total minutes |

---

## Tech Stack

- **HTML5 Canvas** — rendering engine
- **Vanilla JavaScript** — no frameworks, no dependencies
- **Web Audio API** — procedural ambient sound + chimes
- **CSS3** — animations, glow effects, transitions
- **localStorage** — session history, achievements, streaks

Works offline. No build step. No npm. Just open and play.

---

## Roadmap

- **v2** — Themes (Ocean / Forest / Aurora)
- **v3** — Real Pomodoro integration (25-min session timer)
- **v4** — Multiplayer class-break mode
- **v5** — Community reflection library

---

## Philosophy

Most break games spike dopamine. Students end up playing *one more round.*

Orbit does the opposite. It ends. Every time. On its own.

The game exists to prepare you for the next study session — not to replace it.

---

*Built for students who want to study smarter, not just longer.*
