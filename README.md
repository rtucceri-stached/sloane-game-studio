# Sloane and Dad's Game Studio

A father-daughter game development project. Sloane (10) is Creative Director, Dad is Tech Lead, Claude is the coding buddy.

## Start here

If this is your first time, in this order:

1. **`CLAUDE.md`** — the project brain. Who we are, what we're building, our toolbox, visual standards, the roadmap.
2. **`LOCAL_DEV.md`** — Dad's operational reference. Commands, prompts, day-to-day workflow, troubleshooting.
3. **Run the Day One Creative Interview** (instructions in `LOCAL_DEV.md`). It's a 15-minute chat with Sloane that captures her tastes — colors, aesthetic, references, what she'd want to wow her friends with — so every game we build feels like hers from the start.

## Playing a game

Each game lives in `games/NN-game-name/index.html`. Most games can just be opened directly in a browser by double-clicking the file.

Once a game uses real audio or image files from `assets/`, browsers block local file access — you'll need a tiny local server:

```bash
cd games/your-game-name
npx serve
# OR if you prefer Python:
python3 -m http.server
```

Then open the URL it prints (usually `http://localhost:3000` or `http://localhost:8000`).

## Folder layout

```
games/      → one folder per game (start each new game by copying _template/)
shared/     → reusable code: Input Manager, Juice, Sound, Canvas helpers
assets/     → art and sound files (Sloane's drawings eventually go in art/)
```

## Workflow

1. **Brainstorm + build with Sloane in chat with Claude** → playable Artifact in seconds.
2. **Save it** into `games/NN-game-name/` via Claude Code when she loves it.
3. **Polish** (refactoring, debugging, multi-file growth) → Claude Code in this directory. It auto-reads `CLAUDE.md` and knows the project conventions.
4. **Repeat.** Every new game is a new chat with Sloane.

The whole thing is designed so creative work happens in chat (where it's fun for Sloane) and file work happens in Claude Code (where it's clean for Dad).
