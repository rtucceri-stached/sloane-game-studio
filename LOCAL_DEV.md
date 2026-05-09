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

## Daily workflow

Every coding session follows the same four steps:

1. Open a terminal and `cd` to `E:\AI Projects\Sloane`
2. Run `npm run dev` — the dev server starts and prints a URL like `http://localhost:5173`
3. Open that URL in your browser — the game canvas appears
4. Edit code in VS Code → Vite hot-reloads automatically — no page refresh needed
5. Stop the server when done: press **Ctrl+C** in the terminal

---

## Common workflows

### Starting fresh after being away

```bash
cd "E:\AI Projects\Sloane"
git status           # see what changed
git pull             # get latest from remote (if working with a remote)
npm install          # pick up any new packages
npm run dev          # start the game
```

### Committing your work

```bash
git status                        # see which files changed
git add src/world/food-zone.ts    # stage specific files (or use . for all)
git commit -m "what and why"      # write a clear message
git push                          # push to remote
```

The pre-commit hook runs `tsc --noEmit` (TypeScript type check) and then `lint-staged` (Prettier + ESLint) automatically. If the commit is blocked, read the error and fix it before trying again.

### Merging a branch to main

```bash
git checkout main          # switch to main
git merge my-branch        # merge your work in
git push                   # push the updated main
git branch -d my-branch    # delete the branch (optional cleanup)
```

---

## Commands

| Command                  | What it does                                               |
| ------------------------ | ---------------------------------------------------------- |
| `npm run dev`            | Dev server with hot reload                                 |
| `npm run build`          | Build production bundle to `dist/`                         |
| `npm run preview`        | Serve the production build on `:4173`                      |
| `npm run lint`           | ESLint — check for errors and warnings                     |
| `npm run format`         | Prettier — auto-format all `src/` files                    |
| `npm run build:manifest` | Regenerate `src/assets/manifest.ts` from `public/sprites/` |
| `npm install`            | Install / refresh deps                                     |

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

Husky runs two checks automatically before every commit:

1. **`npx tsc --noEmit`** — TypeScript type check across the whole project. If there are type errors anywhere, the commit is blocked.
2. **`npx lint-staged`** — runs Prettier (auto-format) and ESLint on all staged `.ts` files.

Both must pass for the commit to go through.

- **If a commit is blocked:** read the error output, fix the issue, re-stage, and try again.
- **To bypass in an emergency:** `git commit --no-verify` (use sparingly — this skips both checks).

---

## Blender connector (Claude Desktop)

Blender rendering is scripted via a Claude Desktop MCP connector. The connector is **blender-mcp** — officially supported by Anthropic, actively maintained. It gives Claude Desktop ~18 tools that can create objects, apply materials, set up cameras, and render — all inside a running Blender session.

The workflow is: Blender runs on your machine → Claude Desktop talks to it via the MCP connector → you describe what you want and Claude Desktop does the modeling and rendering.

---

### Step 1 — Install Blender

1. Go to **[blender.org/download](https://www.blender.org/download/)**. Download the **Windows Installer** for the current LTS release (4.x as of 2026). The `.msi` or `.exe` file will be around 250–350 MB.

2. Run the installer. Accept all defaults. It will install to:

   ```
   C:\Program Files\Blender Foundation\Blender 4.x\
   ```

   You don't need to change this.

3. **Verify it installed correctly:** open Blender from the Start menu. A splash screen appears with the version number (e.g., "4.2.0"). Close the splash screen and the default scene appears — a grey cube, a camera, and a light. That's success. Close Blender for now.

   > **Why it matters:** Blender ships with its own bundled Python runtime (`C:\Program Files\Blender Foundation\Blender 4.x\4.x\python\`). This is completely separate from any Python you may have installed for other things. Never run `pip install` against Blender's Python — it doesn't work that way, and you don't need to.

**Common Windows install issues:**

| Symptom                                  | Fix                                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Installer asks for admin permission      | Click Yes — normal for `C:\Program Files` installs                                                     |
| Blender opens but flickers or goes black | Right-click Blender shortcut → Properties → Compatibility → uncheck "Disable fullscreen optimizations" |
| "This app can't run on your PC"          | You downloaded the wrong architecture. Download the x64 build (the default on the main download page)  |
| Blender won't open at all                | Make sure your GPU drivers are up to date — Blender requires reasonably modern drivers                 |

---

### Step 2 — Install the blender-mcp addon in Blender

The Blender side of the connector is a single Python file called `addon.py`.

1. **Download `addon.py`:**
   - Go to: [https://github.com/ahujasid/blender-mcp/blob/main/addon.py](https://github.com/ahujasid/blender-mcp/blob/main/addon.py)
   - Click the **Raw** button (top-right of the code view)
   - Right-click anywhere → **Save as** → save the file as `addon.py` somewhere easy to find (e.g., your Downloads folder)

2. **Install it in Blender:**
   - Open Blender
   - Go to **Edit → Preferences → Add-ons**
   - Click **Install** (top-right of the Add-ons panel)
   - Navigate to your `addon.py` file and select it
   - After install, search for **"blender mcp"** in the Add-ons search box
   - Check the box next to **"Blender MCP"** to enable it

3. **Start the connector server inside Blender:**
   - In the Blender main window, look in the top-right area for a panel called **"MCP Server"** — it appears in the 3D Viewport's N panel (press **N** to toggle it if you don't see it)
   - Click **"Start MCP Server"**
   - The status should change to something like `Running on port 9000`
   - Leave Blender open and the server running

   > Blender must stay open and the server must be running for Claude Desktop to talk to it. You'll start the server at the beginning of each modeling session.

---

### Step 3 — Install `uv` (the MCP server runner)

The MCP server that talks between Claude Desktop and Blender runs via `uv`, a fast Python package runner. You install it once on your machine.

1. Open **PowerShell** (search "PowerShell" in Start menu)
2. Run:
   ```powershell
   powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```
3. Close and reopen PowerShell when it finishes
4. Verify it installed: `uv --version` — should print a version number like `uv 0.x.x`

   > **What is `uv`?** It's a package manager for Python tools. `blender-mcp` uses it as its launcher — it handles downloading and running the server automatically, no separate Python install required.

---

### Step 4 — Register blender-mcp in Claude Desktop

Claude Desktop has a config file that tells it which MCP servers to connect to. You need to add one entry.

1. **Find the config file.** In File Explorer, navigate to:

   ```
   %APPDATA%\Claude\
   ```

   (Paste that path directly into the address bar — `%APPDATA%` is a shortcut Windows resolves automatically.) The file is called `claude_desktop_config.json`.

   > If the file doesn't exist yet: open Notepad, create it yourself at that path. Make sure to save it as `claude_desktop_config.json` with "All files" selected (not `.txt`).

2. **Add the blender-mcp server entry.** Open the file and add (or merge into existing content):

   ```json
   {
     "mcpServers": {
       "blender": {
         "command": "uvx",
         "args": ["blender-mcp"]
       }
     }
   }
   ```

   If you already have other MCP servers in the file, add `"blender"` as a new key inside the existing `"mcpServers"` block — don't replace what's already there.

3. **Save the file and restart Claude Desktop** (quit completely and reopen).

---

### Step 5 — Smoke test

1. Open Blender, start the MCP Server (Step 2, step 3)
2. Open Claude Desktop
3. Start a new conversation
4. Look for a **hammer icon** (🔨) near the chat input — it means Claude Desktop detected at least one MCP tool. If it's not there, check the troubleshooting section below.
5. Type: **"Create a default cube in Blender and move it up 2 units on the Z axis."**
6. Claude Desktop will use the Blender tools — you should see it report what it did, and the cube should move in the Blender viewport

That's the full setup verified. From here, Dad drives Claude Desktop with prompts like "rig a human character with 4 directional renders" and it does the Blender work.

**Troubleshooting:**

| Symptom                                                | Fix                                                                                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Hammer icon missing in Claude Desktop                  | `uv` may not be on PATH — close and reopen Claude Desktop after installing `uv`. If still missing, restart your machine.       |
| "Connection refused" or "Could not connect to Blender" | Blender's MCP Server isn't running. Open Blender → N panel → Start MCP Server.                                                 |
| `uvx` not found                                        | `uv` didn't install correctly. Re-run the install command, then close/reopen PowerShell.                                       |
| Claude Desktop shows Blender tool errors               | Make sure the `addon.py` version matches the `blender-mcp` package version — re-download `addon.py` from the repo if in doubt. |

---

### After each render run

Once Claude Desktop has rendered sprite PNGs into `public/sprites/`:

```bash
npm run build:manifest
```

This regenerates `src/assets/manifest.ts` with the new sprite paths typed correctly. Run it any time sprites change.

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

**`'npm' is not recognized`**
Node.js isn't installed or isn't on your PATH.
Fix: install the LTS version from [nodejs.org](https://nodejs.org), then close and reopen your terminal.

**`ENOENT: no such file or directory, package.json`**
You're in the wrong folder.
Fix: `cd "E:\AI Projects\Sloane"` and try again.

**Page is blank, no errors in the terminal**
A runtime error is silently failing in the browser.
Fix: press **F12** to open DevTools, click the **Console** tab, and read the red error. Common causes: TypeScript syntax error, a missing `import`, or an asset 404.

**`Cannot find module '…'` on a fresh clone**
Dependencies aren't installed yet.
Fix: `npm install`, then `npm run dev`.

**Port 5173 is already in use**
Another dev server is already running.
Fix: Vite auto-bumps to 5174, 5175, etc. — just use whatever URL the terminal prints. Or stop the old server first (find the terminal running it and press Ctrl+C).

**Commit blocked by Husky**
The pre-commit hook caught a TypeScript type error, lint error, or formatting issue.
Fix: read the error output carefully, fix the problem in the file it names, `git add` that file again, then `git commit` again. Common sub-cases:

- _TS error_ — fix the type mismatch the error describes
- _ESLint error_ — fix the rule violation (usually an unused variable or wrong equality operator)
- _Prettier_ — run `npm run format` to auto-fix, then re-stage

**`git lfs` command not found**
Git LFS isn't installed on this machine.
Fix: install from [git-lfs.com](https://git-lfs.com), then run `git lfs install` once, then `git lfs pull`.

---

## Working with Claude Code

Two files are most important as context:

- **`CLAUDE.md`** — project brain, design principles, engineering quality bar, Blender pipeline
- **`ABANDONED_PARK_PLAN.md`** — game design doc

Claude Code auto-reads these. If a major decision changes (visual style, feature pivot, new system), update `CLAUDE.md` so future sessions inherit it.

For most changes: edit code → save → Vite hot-reloads → see it in browser.
