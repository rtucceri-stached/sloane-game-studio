# Local Dev — Abandoned Park

Quick reference for Dad. The everyday stuff is at the top — open this, run the commands, get going. Technical detail is below for when something needs verifying. Landmines section at the bottom grows as we hit things.

---

## Every dev session

You'll usually have **two terminals** open at once: one running the game (Vite), one for Claude Code if you're editing code.

**Terminal 1 — Game (Vite dev server):**

```
cd "E:\AI Projects\Sloane"
npm run dev
```

Wait for it to print a URL like `http://localhost:5173`. Open that in the browser — the game appears.

Vite hot-reloads on save: edit a file in VS Code, save, the browser updates automatically. No refresh needed.

To stop: `Ctrl+C` in this terminal.

**Terminal 2 — Claude Code (only if editing code):**

```
cd "E:\AI Projects\Sloane"
claude
```

That opens Claude Code in the terminal. Paste session prompts here. Claude Code edits files, runs commits, and pushes — you don't run git manually.

To exit: type `exit` or close the terminal.

**Blender + MCP (only if working on assets):** open the Claude Desktop app (separate from Claude Code), go to the Abandoned Park project, chat there. Blender work happens in that chat via the MCP connector. Code work stays in Claude Code; Blender work stays in Claude Desktop.

---

## When the game won't show up

Try in this order:

1. Hard refresh the browser: `Ctrl+Shift+R`
2. Restart the dev server: `Ctrl+C` in the Vite terminal, then `npm run dev`
3. Check the browser console: press `F12`, click **Console**, read any red text
4. Reinstall dependencies: `npm install`, then `npm run dev`
5. Nuclear option: `Remove-Item -Recurse -Force node_modules; npm install; npm run dev`

---

## Common errors

**`'npm' is not recognized`** — Node.js isn't installed or isn't on your PATH. Install the LTS version from [nodejs.org](https://nodejs.org), close and reopen your terminal.

**`ENOENT: no such file or directory, package.json`** — You're in the wrong folder. Run `cd "E:\AI Projects\Sloane"` and try again.

**Page is blank, no errors in the terminal** — A runtime error is failing silently in the browser. Press `F12`, click **Console**, read the red error.

**`Cannot find module '…'` on a fresh clone** — Dependencies aren't installed yet. Run `npm install`, then `npm run dev`.

**Port 5173 is already in use** — Another dev server is already running. Vite auto-bumps to 5174, 5175, etc. — use whatever URL it prints. Or stop the old server first.

**Commit blocked by Husky** — A type error or formatting issue caught before the commit went through. Read the error output, fix what it points to, try the commit again. Claude Code handles this for you when it does the commits — you usually won't see it directly.

**`git lfs` command not found** — Git LFS isn't installed on this machine. Install from [git-lfs.com](https://git-lfs.com), then run `git lfs install` once.

---

## Where things live

| What | Where |
|---|---|
| Project root | `E:\AI Projects\Sloane` |
| GitHub repo | `github.com/rtucceri-stached/sloane-abandoned-park` (private) |
| Live site (paused) | `https://sloane-abandoned-park.netlify.app` |
| Netlify dashboard | `app.netlify.com` |
| Source `.blend` files | `E:\AI Projects\Sloane\blender\` |
| Rendered sprites | `E:\AI Projects\Sloane\public\sprites\` |
| Reference images | `E:\AI Projects\Sloane\assets\design\` |

---

## First-time setup on a new machine

Only needed once per machine.

```
npm install
git lfs install
git lfs pull
```

Install VS Code extensions: **Prettier - Code formatter** and **ESLint**. Then add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

This makes VS Code auto-format and auto-fix lint issues on save.

---

## Technical reference

Below this line is detail for verifying how things work — not daily-use material. Most of these commands get run by Claude Code automatically.

### All npm commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Serve the production build on `:4173` |
| `npm run lint` | ESLint — check for errors and warnings |
| `npm run format` | Prettier — auto-format all `src/` files |
| `npm run build:manifest` | Regenerate `src/assets/manifest.ts` from `public/sprites/` |
| `npm install` | Install / refresh deps |

### Project layout

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

### Git basics (Claude Code handles these)

```
git status                        # see what changed
git add .                         # stage everything
git commit -m "what and why"      # commit with a clear message
git push                          # push to remote

git checkout main                 # switch to main
git merge my-branch               # merge a branch back in
git push
git branch -d my-branch           # delete the branch (cleanup)
```

The pre-commit hook runs `tsc --noEmit` (TypeScript type check) and `lint-staged` (Prettier + ESLint) automatically. Type errors block the commit until fixed. Bypass in emergencies with `git commit --no-verify` (sparingly).

### Git LFS — for `.blend` files

`.blend` files are tracked via Git LFS (configured in `.gitattributes`).

- First-time per machine: `git lfs install`
- Cloning fresh: `git lfs pull` (clone gives you pointer stubs first; this fetches the actual files)
- Adding a new `.blend`: just `git add` and `git commit` — LFS intercepts automatically

### Husky — the pre-commit hook

Husky runs two checks automatically before every commit:

1. `npx tsc --noEmit` — TypeScript type check across the whole project
2. `npx lint-staged` — Prettier + ESLint on staged `.ts` files

If a commit is blocked: read the error, fix the issue, re-stage, try again.

### Asset paths — what works and what doesn't

Vite serves `public/` at the root URL. Anything in `assets/` is NOT served at runtime.

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

### Dev mode vs preview mode

- **Dev (`npm run dev`)** — use 99% of the time. Hot reload, forgiving with paths.
- **Preview (`npm run build && npm run preview`)** — runs the actual production bundle on `:4173`. Use when an asset works in dev but you suspect it'll break in prod.

### Netlify — deploy paused

Auto-deploy is currently disabled. The last live build is at https://sloane-abandoned-park.netlify.app.

To re-enable: Netlify → Site settings → Build & deploy → re-enable on the `main` branch. The `netlify.toml` is configured (`command = "npm run build"`, `publish = "dist"`).

Planned: migrate to Cloudflare Pages for the Food Zone launch.

---

## Blender connector (Claude Desktop)

> **This section is being revised separately.** The placeholder steps below are from an earlier draft and will be replaced once the workflow is settled.

Blender rendering is scripted via a Claude Desktop MCP connector. Setup:

1. Install Claude Desktop and enable MCP.
2. *(Connector-specific setup TBD — fill in when the connector is configured.)*
3. Rendered PNGs land in `public/sprites/{category}/{name}/{animation}/{direction}.png`.
4. After any render run: `npm run build:manifest` to update the typed sprite index.

---

## Landmines (the ones that have already bitten)

This section grows as we hit things. From today's session (2026-05-09):

- **Mixamo accepts FBX, OBJ, and ZIP — not GLB.** AI image-to-3D tools (TRELLIS, Meshy, Tripo) output `.glb`. Convert via Blender export before upload to Mixamo: `File → Export → FBX (.fbx)` with embed textures, `-Z` forward, `Y` up.
- **AI image-to-3D outputs are not in T-pose.** Mixamo's auto-rigger expects T-pose (arms straight out). If markers are placed correctly but rigging still fails, regenerate the source character in T-pose mode in the AI tool.
- **Mixamo's auto-rigger is humanoid-only.** Quadrupeds (Erma the cat) won't go through Mixamo. Options: DeepMotion (paid, supports quadrupeds), manual rigging in Blender via MCP, or the source AI tool's own animation feature.
- **Programmatic Blender modeling via MCP can't produce hero characters.** Stretched primitives produce rough humanoid silhouettes — not Critic 1 with flowing hair. Hero characters come from AI image-to-3D plus Mixamo rigging. Blender pipeline is still right for stands, props, environment.
- **Read the smaller red banner before responding.** Mixamo and similar UIs stack errors — the secondary one is often the actual cause. The "ERROR on mapping character: Unexpected File Type" banner sat above the bigger "Sorry, unable to map your existing skeleton" message and was the actual fix.
