# Abandoned Park — Project Brain

Read this first in every Claude Code session. It is the authoritative context for this project.

---

## Project Identity

**Abandoned Park** — one project, one game.

A young food critic explores an abandoned amusement park at night. Ghosts run the food stands. One item per stand is cursed — eat the wrong thing and a 5-second chase begins. Find the ghost sheet to flip the chase; catch the ghost to clear the stand. Cute-and-a-little-wrong in tone throughout.

- **Live (paused):** https://sloane-abandoned-park.netlify.app
- **Design source of truth:** `ABANDONED_PARK_PLAN.md` — lore, mechanics, art direction, audio, tech stack, build roadmap. Read it first when working on game logic or design.
- **Stack:** Vite + TypeScript + Canvas 2D + Web Audio. ES modules. Project root IS the npm project.
- **Where Paul shows up:** Paul appears periodically throughout the park, in unexpected places — never as a stand operator. He's a recurring magic-appearance figure (see his entry under Sloane's World below). The earlier "Jim runs the Bobaaaaah stand" framing was character drift; stand operators are ghosts, one per location, each its own per-stand design. The boba shop ghost is a separate future design — TBD who.

---

## How We Work

- **Dad** — sole builder. Engineering-team-quality bar. No timeline pressure.
- **Sloane** — Creative Director. Sets vision, reviews completed zones (Food → Games → Rides → possibly outside-park). Not shown half-built work — she sees finished zones and reacts.
- **Claude** — builds what the prompts specify, to the engineering quality bar below.

Zone reviews generate the next zone's direction. Each zone has a defined scope and finish line before implementation starts.

### Phase Log

- **Phase 0.5 — Visual Foundation.** Atmosphere stack (sky gradient, fog, vignette, dust, fireflies, ground). Food-zone render pipeline ported verbatim from reference artifact. Boba stand: Boba_Hut.png image asset with white-to-alpha pass.
- **Session A — Project Pivot + Tooling Setup.** (2026-05-08) Flattened structure to project root. TypeScript, ESLint, Prettier, Husky, lint-staged, Git LFS, manifest generation script. Rewrote all docs. Session B: code cleanup + typed systems.

---

## Sloane's World

_(These are INGREDIENTS in her creative pantry — not rules every design decision must follow.)_

- **Favorite Colors:** strawberry pink, matcha green, powder blue. Soft, dreamy, cafe-window energy.
- **Aesthetic & Vibes:** kawaii horror, stores, food. Cute-and-a-little-wrong. Think a too-cute shop with something off about it.
- **Stories & Worlds She's Into Right Now:**
  - _Scream_ — Ghostface specifically. The iconic stylish villain.
  - _Scary Boba Shop_ (game) — a boba shop that gets scarier with each order. The escalation structure.
  - _Fear Street_ — the singing demon girl. "She's a creep."
- **Characters She's Invented:**
  - **Paul** — looks exactly like a specific doll Sloane grew up with. On a long road trip when Sloane was little, Dad would stage Paul somewhere ahead each morning so she'd "find" him as they explored — she thought he was magic. In the game, Paul shows up periodically throughout the park, in unexpected places, just like he used to in her life. He is NOT a stand operator. He is visually locked: green knit sweater + shorts with blue star patches, plastic doll proportions, painted-on facial features, bare feet. Future Claude: do not "improve" him toward a more conventionally cel-shaded character — the doll quality is the point. The cute-and-a-little-wrong tone of the project lives inside this character.
- **Creatures She Loves:** Fear Street demons, Ghostface. Stylish horror villains with a specific iconic look — not random monsters.
- **A Moment That Hit Her Hard:** the jumpscares from _The Conjuring_. Specifically the scare itself — the BAM payoff, not the build-up.
- **How She Likes to Play (the core verb):** running a place. Store simulators, building, food prep. Cozy busy-hands play — stocking, serving, arranging.
- **What Makes Games Boring vs "One More":**
  - Boring: no levels, no progression.
  - One More: lots of options to pick from, and coins you earn and spend on stuff.
- **Game Length Preference:** never-ending games. No "the end" screen. Always more to unlock.
- **Sound Tastes:** layered cozy ambience while working — boba being shaken, ice clinking, coins jingling, little customer "thank you" beeps, lo-fi music in the background. For the scares — a low hum that builds, music that suddenly stops, weird whispers, a heartbeat.
- **Things She's Over:** (skipped for now)

---

## Sloane Studio Design Principles

_(CRAFT principles — how we make games feel intentional, regardless of subject. NOT content rules.)_

1. **Palette first, always.** Every world opens with a defined `PAL = {...}` block of 6–10 colors. Anchor on her current favorites (strawberry pink, matcha green, powder blue) OR invent a fresh palette that fits the world. No random hex values in the code.

2. **Tone is a dial, not a switch.** Sloane's instinct is cute-and-a-little-wrong — sweetness with something off. Build atmosphere that holds _both_ at once: soft palette + flickering candle, cozy shop + lights that buzz, friendly font + slightly too-long shadows. The contrast is the feeling.

3. **The build-up earns the payoff.** When a game has a scare, surprise, or big moment, the seconds _before_ it matter as much as the moment itself. Foreshadow with sound and light shifts. The player should feel it coming half a second before it hits — that's the "DAD LOOK!" window.

4. **The core verb is sacred.** Whatever moment-to-moment action she identified for a given zone, the player's hands should be doing that thing constantly and satisfyingly. Cozy busy-hands play means lots of small, immediate, tactile actions with feedback.

5. **Progression you can see.** She wants levels, coins, options, unlocks. Every zone should have a visible economy — earn something, spend it on something, see the result on screen. Numbers going up isn't enough; the _world_ should change as she progresses.

6. **Hero characters come from Blender, not emoji.** The food critic doesn't get a placeholder circle. She gets a rigged Blender model, cel-shaded, rendered at 4 directions. Her characters are the project's flagships — they look like ours. The Blender pipeline spec is in this file.

7. **Sound is half the game.** Every zone has two sound layers running together: a **cozy ambient layer** (small constant sounds tied to the core verb — shaking, clinking, footsteps, hums) and an **event layer** (sharp feedback on every meaningful action — coins, completions, arrivals, scares). Music is part of the tone dial: when something's about to shift, the music shifts first. Silence is a tool — when the cozy layer suddenly cuts out, the player knows something's coming. No zone ships without intentional sound design.

---

## Visual Standards (NON-NEGOTIABLE)

This game looks _intentional_, not like programmer art. **Atmosphere over assets.**

**Every zone starts with these:**

- **Defined palette.** Pick 6–10 colors at the top as a `PAL = {...}` object. Every color in the game comes from it. No random hex values sprinkled in code.
- **Gradient backgrounds**, never flat fills.
- **Vignette overlay** — soft darkness on the edges.
- **Real lighting** — candles, lamps, magic glows emit radial gradients onto nearby surfaces. Use `globalCompositeOperation = 'screen'` for additive light pools.
- **Drifting atmosphere** — fog, dust motes, ambient particles even when nothing is happening. The screen is never fully still.
- **Animation everywhere** — flickers, sways, bobs, pulses. Stillness reads as broken or boring.
- **Layered composition.** Always render strictly back-to-front (see render order below).
- **Typography that matches the world.** Serif (Cormorant Garamond, Playfair) for elegant/spooky/old. Sans (Inter, system-ui) for modern/clean. **Never** the browser default for in-game text.

**Effort hierarchy when time is limited:**

1. Atmosphere first (palette, gradient, vignette, lighting) — 70% of "looks good" is here.
2. Animated set dressing (flickering candles, drifting fog, swaying plants, dust motes).
3. Character presence (main character drawn with care, soft shadow, glow when interactive).
4. Polish (particle effects on every meaningful event, transition flourishes, title screen).

### Visual Foundation — Render Order

All zones share this atmosphere stack and render pipeline:

- **Every zone runs the global atmosphere stack:** sky gradient, fog (back + front), vignette, dust motes, fireflies, ground texture. Defined in `src/engine/atmosphere.ts`.
- **Every glowing prop uses `LightPool`** from that module. No ad-hoc radial gradients — one helper, one look.
- **Render order is strictly back-to-front:**
  1. Sky gradient
  2. Distant silhouettes (backdrop shapes, ride silhouettes)
  3. `FogSystem.drawBack`
  4. Ground texture (gradient + scuff marks, full ground)
  5. Midground silhouettes / ride struts
  6. Benches, trash cans, ground props
  7. Boba stand (or any back-row stand)
  8. Existing ghost sparks (back particles)
  9. Player + any other characters
  10. `LightPool` passes — every glowing prop
  11. `FireflySystem` (additive)
  12. `FogSystem.drawFront`
  13. `DustMoteSystem` (additive)
  14. Vignette
  15. UI / HUD (outside world transform — no atmosphere applied)
- **`reference/bigfoot-and-ghost/index.html`** is the visual + technical reference. When a system needs to look like that, port from there.

---

## Engineering Quality Bar

Every file, every PR must meet these 14 rules:

1. **Error overlay on screen** — runtime errors visible in-game (implemented in Session B).
2. **Module boundaries** — each system in its own file, no engine ↔ game cross-imports.
3. **Tight save-and-commit loop** — every working state gets a Git commit.
4. **One change at a time when debugging** — never stack multiple hypotheses.
5. **File header comments** — top of every file, 2–3 lines on what it does.
6. **Inline comments explain _why_, not _what_** — non-obvious constraints, invariants, workarounds only.
7. **No dead code** — delete, don't comment out.
8. **Graceful asset failures** — fallback + report via overlay (Session B).
9. **No magic numbers** — named constants (`UPPER_SNAKE_CASE`).
10. **Functions stay readable** — if it doesn't fit on one screen or can't be summarized in one sentence, refactor.
11. **Naming:** files `kebab-case`, JS/TS `camelCase`, constants `UPPER_SNAKE_CASE`.
12. **ESLint + Prettier on save** — enforced by Husky pre-commit hook.
13. **TypeScript throughout** — strict mode; `any` only with a `// TODO: type` comment.
14. **Pre-commit hook** — Husky + lint-staged; a broken commit gets blocked.

---

## Blender Pipeline

Hero characters, ghosts, and hero stands are Blender-rendered sprites. The engine handles atmosphere on top — the Blender models use neutral lighting.

### Camera and render settings

- **Camera angle:** 30° isometric tilt (top-down-ish, slight front face)
- **Character directions:** 4 (front, back, left, right) — axis-aligned movement only
- **Scale:** chunky, Cult of the Lamb-ish — characters read at a distance
- **Shading:** cel/toon with neutral, flat lighting — atmosphere (fog, vignette, light pools) is added by the engine at runtime
- **Output:** PNG + alpha, no background

### Frame counts and resolutions

| Asset type      | Idle     | Walk      | Resolution     |
| --------------- | -------- | --------- | -------------- |
| Hero characters | 6 frames | 12 frames | 512 × 512 px   |
| Ghosts          | 6 frames | 12 frames | 512 × 512 px   |
| Hero stands     | static   | —         | 1536 × 1536 px |
| Props           | static   | —         | 384 × 384 px   |

**Frame layout:** frames are concatenated into a horizontal sprite strip in a single PNG per direction per animation (left-to-right, frame 0 leftmost). One PNG = one direction × one animation. The engine indexes into the strip at runtime based on animation time. Strip width = frame_count × 512; strip height = 512.

### Naming and file layout

- **Kebab-case** everywhere: `critic-1`, `paul`, `bobaaaaah-stand`
- **Source `.blend` files:** `blender/characters/`, `blender/ghosts/`, `blender/stands/`, `blender/props/`
- **Rendered PNGs:** `public/sprites/characters/`, `public/sprites/ghosts/`, etc. — mirrored folder structure
- **Sprite anchor:** bottom-center (character's feet = anchor point)
- **Naming pattern:** `{name}/{animation}/{direction}.png` — e.g. `critic-1/walk/front.png`

### Git LFS

`.blend` files are tracked via Git LFS (configured in `.gitattributes`). When cloning fresh, install Git LFS first: `git lfs install && git lfs pull`.

### Claude Desktop connector

Blender rendering is scripted via a Claude Desktop MCP connector. See LOCAL_DEV.md for setup.

### After rendering

Run `npm run build:manifest` to regenerate `src/assets/manifest.ts`. Import from there — never hardcode sprite paths.

---

## Asset Loading Strategy

**Hybrid:** static files served from `public/sprites/`, accessed in code via a typed manifest.

- `public/sprites/` — runtime sprite assets. Served at `/sprites/...` by Vite dev server and copied to `dist/` on build.
- `src/assets/manifest.ts` — auto-generated by `npm run build:manifest`. Typed const object: `Sprites.characters['critic-1'].idle.front`. Import this; never hardcode paths.
- `assets/sprites/` — source-resolution art files (pre-render, design reference). Not served at runtime.
- `assets/audio/` — audio source files. Referenced via ES module imports.
- `assets/design/` — reference images, floor plan sketches. Design use only.

Regenerate manifest any time sprites change.

---

## Two-Character Mechanics

Players can switch between two characters; switching is mostly cosmetic but has light mechanical differences:

- **Character 1 — Critic 1 / Scout-Stealth:** the food critic. Detects clues at longer range; fits into small hide spots Erma can't.
- **Character 2 — Erma / Enforcer:** Sloane's cat. White-and-grey siamese, top hat, monocle — elegant-but-mischievous kawaii-horror energy. Faster while wearing the ghost sheet (a cat in a sheet IS a ghost — shorthand earned), longer reach when catching ghosts. Reference image at `assets/sprites/characters/erma/`. Erma's rig is its own quadruped build, NOT a variant of Critic 1's human rig — different topology, walk cycle, proportions. Plan accordingly when she gets rendered.

Both characters share the same world state, inventory, and stand progression. The switch is a style choice with minor tactical edge, not a hard gate.

---

## Stand Operators

**Stand operators are ghosts.** Every food stand, every game stand, every ride is run by a ghost — one per location, each its own per-stand design. These ghosts are distinct from Paul, who is not a stand operator. The boba shop ghost is the first one we'll need to design, in its own future session.

---

## Project Structure

```
abandoned-park/                    ← project root = npm project
├── CLAUDE.md                      ← this file
├── ABANDONED_PARK_PLAN.md         ← game design doc
├── LOCAL_DEV.md                   ← operational reference for Dad
├── README.md
├── netlify.toml
├── package.json
├── vite.config.js
├── tsconfig.json
├── eslint.config.js
├── .prettierrc.json
├── .gitattributes                 ← Git LFS tracking for .blend
├── index.html
├── src/
│   ├── main.ts                    ← entry, RAF loop
│   ├── assets/
│   │   └── manifest.ts            ← auto-generated sprite manifest
│   ├── engine/                    ← reusable systems
│   │   ├── input.ts               ← keyboard + touch + gamepad
│   │   ├── juice.ts
│   │   ├── sound.ts
│   │   ├── canvas.ts
│   │   ├── atmosphere.ts          ← visual foundation systems
│   │   ├── skeleton.ts
│   │   ├── assets.ts
│   │   └── save.ts
│   ├── world/
│   │   └── food-zone.ts           ← Food Zone scene
│   ├── characters/
│   └── stands/
├── assets/
│   ├── sprites/                   ← source-res art (pre-render, design reference)
│   │   ├── characters/
│   │   ├── stands/
│   │   └── props/
│   ├── audio/
│   │   ├── ambient/
│   │   ├── effects/
│   │   └── music/
│   └── design/                    ← reference images, floor plan sketches
├── public/
│   ├── Boba_Hut.png               ← runtime image (served at /Boba_Hut.png)
│   └── sprites/                   ← runtime sprite assets (served at /sprites/...)
├── blender/                       ← source .blend files (Git LFS)
│   ├── _rigs/
│   ├── characters/
│   ├── ghosts/
│   ├── stands/
│   └── props/
├── reference/                     ← archived single-file prototypes (read-only)
│   ├── bigfoot-and-ghost/
│   ├── abandoned-park-visual-foundation.html
│   └── jims-boba-shop-{v1,v2}.html
└── scripts/
    └── build-manifest.mjs         ← sprite manifest generator
```

---

## Toolbox

| Easy Name           | Real Name                              | What It Does                             |
| ------------------- | -------------------------------------- | ---------------------------------------- |
| The Drawing Window  | HTML5 `<canvas>`                       | Where the game shows up                  |
| The Game Brain      | `requestAnimationFrame` loop @ 60fps   | Makes things move smoothly               |
| The Listener        | `src/engine/input.ts`                  | Keyboard + touch + Bluetooth gamepad     |
| The Sound Box       | `src/engine/sound.ts`                  | Procedural audio — no audio files needed |
| The Stretchy Window | `src/engine/canvas.ts`                 | Makes the game fit any screen            |
| The Picture Box     | Canvas 2D procedural + Blender sprites | Renders scenes and characters            |
| The Juice           | `src/engine/juice.ts`                  | Particles, screen shake, easing          |
| The Sculptor        | Blender + Claude Desktop               | Creates and renders hero characters      |
| The Sprite List     | `src/assets/manifest.ts`               | Typed index of all runtime sprites       |

---

## Big Dream Goals

- [ ] Play with Bluetooth controllers
- [ ] Put the game on Dad's phone
- [ ] Put the game on Sloane's phone
- [x] Use Sloane's artwork as characters (Blender pipeline set up — Session A)
- [ ] Add real recorded music and sound effects
- [ ] Multiple zones with progression and save file
- [x] Graduate from single-file Artifact to a real Vite project (done)
- [x] 2-player design (planned — 2 characters, not 2 screens)
- [ ] Outside-park content if it all plays out well
- [ ] Migrate to Cloudflare Pages when we resume deploys

---

## Progress Log

Newest at the top.

### 2026-05-08 — Session D: Blender Pipeline Setup + Critic 1 Prep

**Built:** Docs sweep — Jim→Paul rename throughout CLAUDE.md and ABANDONED_PARK_PLAN.md. Paul character locked (the real doll Sloane grew up finding on road trips — NOT a stand operator; recurring magic-appearance figure throughout the park). Erma locked as Character 2 (white-and-grey siamese, top hat, monocle; own quadruped rig, NOT a Critic 1 variant). Stand-operators-are-ghosts rule canonized in both docs — boba shop ghost is a separate future TBD design. Blender install walkthrough added to LOCAL_DEV.md (blender.org LTS, Windows defaults, verify splash screen). `blender-mcp` MCP connector walkthrough added (officially Anthropic-supported; `uv`/`uvx` runner, `addon.py` Blender-side addon, `claude_desktop_config.json` registration, smoke test). Frame layout spec locked in CLAUDE.md Blender Pipeline (horizontal strips, frame 0 leftmost, strip width = count × 512). `scripts/generate-placeholder-sprites.mjs` — zero-dep PNG generator (Node.js built-in zlib + raw PNG encoding, inline 5×7 bitmap font); generates magenta-and-black checker strips for `public/sprites/characters/critic-1/` (idle: 6-frame × 4 directions, walk: 12-frame × 4 directions). `npm run build:manifest` → `src/assets/manifest.ts` regenerated with typed critic-1 entries. Dormant sprite render path added to `src/world/food-zone.ts` (`USE_SPRITE_PLAYER = false`; when flipped, `_drawPlayerSprite()` draws from manifest strips at bottom-center anchor, lazy-loads images, indexes frame by game time).
**Sloane Decided:** Critic 1 renders first. Character 2 slot is Erma — Sloane's cat (siamese, top hat, monocle); cat means own quadruped rig, not a Critic 1 variant. Paul replaces Jim entirely — he is the specific doll from road trips, locked visual (green knit sweater, blue star shorts, bare feet, painted face, doll proportions). Paul is NOT a stand operator. Stand operators are ghosts, one per location, each its own per-stand design; boba shop ghost is a separate TBD future design.
**Dad Learned:** `blender-mcp` uses `uvx` as the runner — install `uv` first (PowerShell one-liner), not pip. The Blender addon is a single `addon.py` file installed via Blender's Preferences → Add-ons, not the Extension Store. Sprite strips: all frames in one PNG, engine indexes by `Math.floor((t/60)*fps) % frameCount` — no separate files per frame. `USE_SPRITE_PLAYER = false` pattern keeps dormant code in-tree without any runtime cost — flip to `true` in Session E after real renders land.
**Next Up:** Dad installs Blender + blender-mcp per LOCAL_DEV.md walkthroughs. Drives Claude Desktop with the Blender MCP to build base human rig, model + animate + render Critic 1 (4-direction idle 6-frame and walk 12-frame sprites) into `public/sprites/characters/critic-1/`. Then Session E (small Claude Code session): replace magenta placeholders with real renders, flip `USE_SPRITE_PLAYER` to `true`, tune anchor + scale, ship Critic 1 in-game.

### 2026-05-08 — Session C: Runtime Resilience + Atmosphere Refactor + Set-Piece Strip

**Built:** Error overlay (`src/engine/error-overlay.ts`) — catches `window.onerror` and `unhandledrejection`, draws on canvas, D-key dismiss. Asset loader graceful fallback — failed images return magenta-and-black checker canvas; failed audio returns silent AudioBuffer; both report via ErrorOverlay. Color grading layer (`src/engine/color-grading.ts`) — global tint with eased transitions. FogSystem extended with configurable color + parallax so food-zone can tune without duplicating. Atmosphere refactor — food-zone.ts now uses `FogSystem`, `FireflySystem`, `DustMoteSystem` from engine; zero inline duplication. Spirit motes kept inline (ghost-mechanic-specific, not a general engine concern). Stripped all procedural set pieces: streetlamp, distant rides, mid silhouettes, lantern posts, benches, trash cans, cones, balloon, concrete patches, grass tufts, litter, procedural player draw. Player draw → placeholder circle with facing indicator. PAL reduced from ~100 entries to ~40 (stripped set-piece-only colors, kept design palette). Clean slate ready for Blender.
**Sloane Decided:** (No new creative input this session.)
**Dad Learned:**
**Next Up:** Session D — Blender pipeline setup + first hero asset render (replaces player placeholder).

### 2026-05-08 — Session B: Typing Pass + Code Cleanup

**Built:** Full TypeScript strict-mode pass — zero `tsc --noEmit` errors across all 10 source files. Interfaces added for every major data shape (Player, Camera, Bone, Animation, SaveState, particles, atmosphere primitives, all food-zone scene objects). Dead discriminated-union `DistantRide` type. Magic number audit — all hex values confirmed in PAL, one missing color (`standWrongGlow`) added. Unused param names prefixed `_` to silence ESLint. `tsc --noEmit` added as first step of the Husky pre-commit hook. `LOCAL_DEV.md` expanded: daily workflow steps, common workflow runbooks, richer error recovery.
**Sloane Decided:** (No new creative input this session — pure engineering work.)
**Dad Learned:** TypeScript `strictPropertyInitialization` requires explicit class property declarations; constructor assignments alone don't count. Discriminated unions let TS narrow optional shape fields inside `switch`/`if` branches.
**Next Up:** Session C — runtime resilience, atmosphere refactor, strip procedural set pieces.

### 2026-05-08 — Session A: Project Pivot + Tooling Setup

**Built:** Flattened `games/01-abandoned-park/` to project root. TypeScript conversion (basic, Session B does the real pass). ESLint (flat config, ESLint 10) + Prettier. Husky + lint-staged pre-commit hook. Git LFS for `.blend`. Manifest generation script. Blender source folder scaffolded. Rewrote CLAUDE.md, README.md, LOCAL_DEV.md to project framing.
**Sloane Decided:** (No new creative input this session — pure tooling work.)
**Dad Learned:** ESLint 10 uses flat config (not `.eslintrc`); Windows file locks require PowerShell for stubborn deletions.
**Next Up:** Session B — error overlay, typed engine systems, food zone code cleanup.
