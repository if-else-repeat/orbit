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

1. Visit the GitHub Pages URL
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


## Tech Stack

- **HTML5 Canvas** — rendering engine
- **Vanilla JavaScript** — no frameworks, no dependencies
- **Web Audio API** — procedural ambient sound + chimes
- **CSS3** — animations, glow effects, transitions
- **localStorage** — session history, achievements, streaks

Works offline. No build step. No npm. Just open and play.

---

## Philosophy

Most break games spike dopamine. Students end up playing *one more round.*

Orbit does the opposite. It ends. Every time. On its own.

The game exists to prepare you for the next study session — not to replace it.

---

*Built for students who want to study smarter, not just longer.*
