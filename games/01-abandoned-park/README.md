# Abandoned Park

Game One of Sloane and Dad's Game Studio. A young food critic explores an abandoned amusement park at night, where ghosts have taken over the food stands. Most food is fine — but exactly one item per stand is cursed, and eating the wrong thing kicks off a five-second chase.

This folder is the Vite project that will eventually become the full game. Right now it's just the scaffolding: engine modules wired up, a canvas drawn in the dark sky color, a placeholder title on screen.

## How to Run

```bash
cd games/01-abandoned-park
npm install
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`). Open it and you should see "Abandoned Park — coming soon" centered on a dark navy canvas.

Other scripts:
- `npm run build` — production build into `dist/`
- `npm run preview` — preview the production build

## Layout

```
01-abandoned-park/
├── index.html              ← canvas + module entry
├── package.json
├── vite.config.js
├── src/
│   ├── main.js             ← game loop
│   ├── engine/             ← input / juice / sound / canvas (ported from shared/)
│   │                          + skeleton, assets, save (stubs for now)
│   ├── world/              ← scenes (empty)
│   ├── characters/         ← player + ghosts (empty)
│   └── stands/             ← food stands (empty)
└── assets/
    ├── characters/  stands/  props/
    └── audio/{ambient, effects, music}
```

## Source of Truth for Design

All design decisions, lore, mechanics, art direction, audio direction, and the build roadmap live in [`../../ABANDONED_PARK_PLAN.md`](../../ABANDONED_PARK_PLAN.md) at the project root. Read that first.
