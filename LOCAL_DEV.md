# Local Dev — Abandoned Park

Operational reference for Dad. Quick commands, setup notes, troubleshooting.

---

## TL;DR — start the game

```bash
npm run dev
```

Open **http://localhost:5173**. Stop with Ctrl+C.

---

## First-time setup

```bash
# 1. Install Node deps
npm install

# 2. If you have .blend files to pull (or just cloned fresh)
git lfs install
git lfs pull
```

---

## Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Serve the production build on `:4173` |
| `npm run lint` | ESLint — check for errors and warnings |
| `npm run format` | Prettier — auto-format all `src/` files |
| `npm run build:manifest` | Regenerate `src/assets/manifest.ts` from `public/sprites/` |
| `npm install` | Install / refresh deps |

---

## Project layout

```
abandoned-park/                  ← project root = npm project
├── src/                         ← all TypeScript source
│   ├── main.ts                  ← entry + RAF loop
│   ├── assets/manifest.ts       ← auto-generated sprite index
│   ├── engine/                  ← reusable systems (input, sound, juice, …)
│   └── world/food-zone.ts       ← Food Zone scene
├── assets/                      ← source art (not served at runtime)
│   ├── sprites/                 ← source-res renders
│   ├── audio/                   ← audio files (ambient, effects, music)
│   └── design/                  ← reference images, floor plan sketches
├── public/                      ← served at root URL by Vite
│   └── sprites/                 ← runtime sprite PNGs (→ /sprites/…)
├── blender/                     ← .blend source files (Git LFS)
├── reference/                   ← archived single-file prototypes (read-only)
└── scripts/build-manifest.mjs   ← manifest generator
```

---

## VS Code — format on save

Install the **Prettier - Code formatter** extension, then add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

ESLint extension: install **ESLint** (dbaeumer.vscode-eslint). Auto-fixes will run on save alongside Prettier.

---

## Git LFS

`.blend` files are tracked via Git LFS (configured in `.gitattributes`).

- **First-time on a machine:** `git lfs install` (once per machine), then `git lfs pull` to fetch any existing blends.
- **Committing a new .blend:** just `git add` and `git commit` as normal — LFS intercepts automatically.
- **Cloning fresh:** `git clone` will give you LFS pointer stubs; run `git lfs pull` to download the actual files.

---

## Husky — pre-commit linting

Husky runs `npx lint-staged` before every commit. lint-staged runs Prettier + ESLint on all staged `.ts` files.

- **If a commit is blocked:** read the error output, fix the issue, re-stage, and try again.
- **To bypass in an emergency:** `git commit --no-verify` (use sparingly — this skips the quality gate).

---

## Blender connector (Claude Desktop)

Blender rendering is scripted via a Claude Desktop MCP connector. Setup:

1. Install Claude Desktop and enable MCP.
2. *(Connector-specific setup TBD — fill in when the connector is configured.)*
3. Rendered PNGs land in `public/sprites/{category}/{name}/{animation}/{direction}.png`.
4. After any render run: `npm run build:manifest` to update the typed sprite index.

---

## Netlify — deploy paused

Auto-deploy is currently disabled. The last live build is at https://sloane-abandoned-park.netlify.app.

To re-enable: go to Netlify → Site settings → Build & deploy → re-enable auto-deploy on the `main` branch.

The `netlify.toml` at project root is already configured (`command = "npm run build"`, `publish = "dist"`).

**Planned:** migrate to Cloudflare Pages for the Food Zone launch (faster deploys, no build-minute limits).

---

## Asset paths — what works and what doesn't

Vite serves `public/` at the root URL. Anything else in `assets/` is NOT served at runtime.

```ts
// ✅ Runtime image in public/
const img = new Image();
img.src = '/Boba_Hut.png';

// ✅ Runtime sprite via manifest
import { Sprites } from './assets/manifest';
img.src = Sprites.characters['critic-1'].idle.front;

// ✅ ES module import (Vite hashes the path at build time)
import bobaHutSrc from '../public/Boba_Hut.png';

// ❌ Direct path into assets/ — not served
img.src = '/assets/sprites/characters/critic-1.png';
```

---

## Dev mode vs preview mode

**Dev (`npm run dev`)** — use 99% of the time. Hot reload, forgiving with paths.

**Preview (`npm run build && npm run preview`)** — serves the actual production bundle on `:4173`. Use when:
- An asset works in dev but you suspect it'll break in prod
- You want to test exactly what Netlify/Cloudflare will see

---

## When changes aren't showing up

1. Hard refresh: `Ctrl+Shift+R`
2. Disable cache while DevTools is open: F12 → Network → "Disable cache"
3. Restart dev server: Ctrl+C, then `npm run dev`
4. Nuclear option: `Remove-Item -Recurse -Force node_modules; npm install; npm run dev`

---

## Common errors

**`'npm' is not recognized`** — Node.js not on PATH. Install LTS from nodejs.org, restart terminal.

**`ENOENT: no such file, package.json`** — wrong folder. Run commands from the project root (`E:\AI Projects\Sloane`).

**Page blank, no terminal errors** — open browser console (F12). Usually a JS syntax error, missing import, or asset 404.

**`Module not found` on fresh clone** — run `npm install`.

**Port 5173 in use** — Vite auto-bumps to 5174, 5175, etc. Use whatever the terminal prints.

**Commit blocked by Husky** — lint or format error. Read the output, fix and re-stage.

**`git lfs` command not found** — install Git LFS from https://git-lfs.com, then `git lfs install`.

---

## Working with Claude Code

Two files are most important as context:
- **`CLAUDE.md`** — project brain, design principles, engineering quality bar, Blender pipeline
- **`ABANDONED_PARK_PLAN.md`** — game design doc

Claude Code auto-reads these. If a major decision changes (visual style, feature pivot, new system), update `CLAUDE.md` so future sessions inherit it.

For most changes: edit code → save → Vite hot-reloads → see it in browser.
