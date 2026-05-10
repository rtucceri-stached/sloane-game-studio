# Abandoned Park — Project Brain

Read this first in every Claude Code session. It is the authoritative context for this project.

---

## Project Identity

**Abandoned Park** — one project, one game.

A young food critic explores an abandoned amusement park at night. Ghosts run the food stands. One item per stand is cursed — eat the wrong thing and a 5-second chase begins. Find the ghost sheet to flip the chase; catch the ghost to clear the stand. Cute-and-a-little-wrong in tone throughout.

- **Live (paused):** https://sloane-abandoned-park.netlify.app
- **Design source of truth:** `ABANDONED_PARK_PLAN.md` — lore, mechanics, art direction, audio, tech stack, build roadmap. Read it first when working on game logic or design.
- **Working agreement:** `WORKING_WITH_ME.md` — interaction rules, response format, project landmines. Read every session.
- **Stack:** Vite + TypeScript + Canvas 2D + Web Audio. ES modules. Project root IS the npm project.
- **Where Jim went:** he was Sloane's earlier-conceived demon character running a boba shop. The boba stand is now Bobaaaaah, run by a ghost (per "stand operators are ghosts" lock-in). Jim's Boba Shop is lore inside the bigger park.

---

## How We Work

- **Dad** — sole builder. Engineering-team-quality bar. No timeline pressure.
- **Sloane** — Creative Director. Sets vision, reviews completed zones (Food → Games → Rides → possibly outside-park). Not shown half-built work — she sees finished zones and reacts.
- **Claude** — builds what the prompts specify, to the engineering quality bar below.

Zone reviews generate the next zone's direction. Each zone has a defined scope and finish line before implementation starts.

### Phase Log

- **Phase 0.5 — Visual Foundation.** Atmosphere stack (sky gradient, fog, vignette, dust, fireflies, ground). Food-zone render pipeline ported verbatim from reference artifact. Boba stand: Boba_Hut.png image asset with white-to-alpha pass.
- **Sessions A–D — Tooling, code quality, atmosphere refactor, Blender pipeline scaffolding.** (2026-05-08) See Progress Log below for per-session detail.
- **Phase 1 — Asset Pipeline Pivot.** (2026-05-09) Programmatic Blender modeling via MCP proven not viable for hero characters. Pipeline updated: AI image-to-3D (TRELLIS) for source meshes → Mixamo for humanoid rigging → Blender for import + sprite render. Doc files updated (CLAUDE.md, README.md, LOCAL_DEV.md restructured, WORKING_WITH_ME.md created).

### Locked-in characters

- **Critic 1** — the food critic. Long wavy brown hair, brown tee, gray apron, jeans, sneakers. Walks; needs idle + walk animations. Reference image at `assets/sprites/characters/critic-1/reference.png`.
- **Erma** — Sloane's cat in-game. White-and-grey siamese with top hat + monocle. Quadruped (Mixamo's auto-rigger is humanoid-only — needs a separate rig path: DeepMotion, manual rig in Blender, or the source AI tool's animation feature). Reference at `assets/sprites/characters/erma/reference.png`.
- **Paul** — recurring-appearance figure, NOT a stand operator. 3D static mesh, no rig, no animation. Engine code places him periodically in unexpected world positions to recreate a "magic appearance" experience. Green knit sweater + shorts with blue star patches, plastic doll proportions, bare feet. Reference at `assets/sprites/characters/paul/reference.png`.
- **Stand operators are ghosts** — locked rule. Boba shop ghost (separate design from Paul) runs the Bobaaaaah stand. Each stand has its own ghost.

---

## Sloane's World

*(These are INGREDIENTS in her creative pantry — not rules every design decision must follow.)*

- **Favorite Colors:** strawberry pink, matcha green, powder blue. Soft, dreamy, cafe-window energy.
- **Aesthetic & Vibes:** kawaii horror, stores, food. Cute-and-a-little-wrong. Think a too-cute shop with something off about it.
- **Stories & Worlds She's Into Right Now:**
  - *Scream* — Ghostface specifically. The iconic stylish villain.
  - *Scary Boba Shop* (game) — a boba shop that gets scarier with each order. The escalation structure.
  - *Fear Street* — the singing demon girl. "She's a creep."
- **Characters She's Invented:**
  - **Jim** — a scary demon who wears an old boba tee shirt and jeans. Name's Jim. The mundane name + dad-clothes against the demon part is the whole joke. Looks like he might work there.
- **Creatures She Loves:** Fear Street demons, Ghostface. Stylish horror villains with a specific iconic look — not random monsters.
- **A Moment That Hit Her Hard:** the jumpscares from *The Conjuring*. Specifically the scare itself — the BAM payoff, not the build-up.
- **How She Likes to Play (the core verb):** running a place. Store simulators, building, food prep. Cozy busy-hands play — stocking, serving, arranging.
- **What Makes Games Boring vs "One More":**
  - Boring: no levels, no progression.
  - One More: lots of options to pick from, and coins you earn and spend on stuff.
- **Game Length Preference:** never-ending games. No "the end" screen. Always more to unlock.
- **Sound Tastes:** layered cozy ambience while working — boba being shaken, ice clinking, coins jingling, little customer "thank you" beeps, lo-fi music in the background. For the scares — a low hum that builds, music that suddenly stops, weird whispers, a heartbeat.
- **Things She's Over:** (skipped for now)

---

## Sloane Studio Design Principles

*(CRAFT principles — how we make games feel intentional, regardless of subject. NOT content rules.)*

1. **Palette first, always.** Every world opens with a defined `PAL = {...}` block of 6–10 colors. Anchor on her current favorites (strawberry pink, matcha green, powder blue) OR invent a fresh palette that fits the world. No random hex values in the code.

2. **Tone is a dial, not a switch.** Sloane's instinct is cute-and-a-little-wrong — sweetness with something off. Build atmosphere that holds *both* at once: soft palette + flickering candle, cozy shop + lights that buzz, friendly font + slightly too-long shadows. The contrast is the feeling.

3. **The build-up earns the payoff.** When a game has a scare, surprise, or big moment, the seconds *before* it matter as much as the moment itself. Foreshadow with sound and light shifts. The player should feel it coming half a second before it hits — that's the "DAD LOOK!" window.

4. **The core verb is sacred.** Whatever moment-to-moment action she identified for a given zone, the player's hands should be doing that thing constantly and satisfyingly. Cozy busy-hands play means lots of small, immediate, tactile actions with feedback.

5. **Progression you can see.** She wants levels, coins, options, unlocks. Every zone should have a visible economy — earn something, spend it on something, see the result on screen. Numbers going up isn't enough; the *world* should change as she progresses.

6. **Hero characters and stands come from a 3D pipeline, not procedural code.** Source meshes from AI image-to-3D (TRELLIS, Meshy, Tripo, etc.) generated from Sloane's reference images, rigged in Mixamo for humanoids, then imported into Blender for sprite rendering. Her characters are the project's flagships — they look like ours. The full pipeline spec is below.

7. **Sound is half the game.** Every zone has two sound layers running together: a **cozy ambient layer** (small constant sounds tied to the core verb — shaking, clinking, footsteps, hums) and an **event layer** (sharp feedback on every meaningful action — coins, completions, arrivals, scares). Music is part of the tone dial: when something's about to shift, the music shifts first. Silence is a tool — when the cozy layer suddenly cuts out, the player knows something's coming. No zone ships without intentional sound design.

---

## Visual Standards (NON-NEGOTIABLE)

This game looks *intentional*, not like programmer art. **Atmosphere over assets.**

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
6. **Inline comments explain *why*, not *what*** — non-obvious constraints, invariants, workarounds only.
7. **No dead code** — delete, don't comment out.
8. **Graceful asset failures** — fallback + report via overlay (Session B).
9. **No magic numbers** — named constants (`UPPER_SNAKE_CASE`).
10. **Functions stay readable** — if it doesn't fit on one screen or can't be summarized in one sentence, refactor.
11. **Naming:** files `kebab-case`, JS/TS `camelCase`, constants `UPPER_SNAKE_CASE`.
12. **ESLint + Prettier on save** — enforced by Husky pre-commit hook.
13. **TypeScript throughout** — strict mode; `any` only with a `// TODO: type` comment.
14. **Pre-commit hook** — Husky + lint-staged; a broken commit gets blocked.

---

## Asset Pipeline

Hero characters, stands, props, and any other 3D-sourced asset go through this chain. Blender's role is **import + render**, not modeling.

### Pipeline overview

1. **Source mesh generation** — AI image-to-3D (TRELLIS local install preferred; Meshy / Tripo / similar as alternatives) takes a 2D reference image and produces a textured 3D mesh as `.glb`. For Mixamo compatibility, generate the character in T-pose where the source AI tool supports it.
2. **Rigging (humanoid characters only)** — Convert `.glb` to `.fbx` via Blender export (Mixamo accepts FBX/OBJ/ZIP, not GLB). Upload to Mixamo, place markers (chin, wrists, elbows, knees, groin), auto-rig, browse animation library, download as FBX with animations baked in.
3. **Render** — Blender (driven by Claude Desktop via the MCP connector) imports the rigged FBX, sets up cameras + neutral lighting, and renders sprite strips to PNG.
4. **Manifest** — `npm run build:manifest` regenerates `src/assets/manifest.ts` so the engine can find the new sprites.

### Camera and render settings (in Blender)

- **Camera angle:** 30° isometric tilt (top-down-ish, slight front face)
- **Character directions:** 4 (front, back, left, right) — axis-aligned movement only
- **Lighting:** neutral, flat — atmosphere (fog, vignette, light pools) is added by the engine at runtime
- **Output:** PNG + alpha, no background

### Frame counts and resolutions

| Asset type | Idle | Walk | Resolution |
|---|---|---|---|
| Hero characters | 6 frames | 12 frames | 512 × 512 px |
| Ghosts | 6 frames | 12 frames | 512 × 512 px |
| Hero stands | static | — | 1536 × 1536 px |
| Props | static | — | 384 × 384 px |

### Special cases

- **Erma (quadruped):** Mixamo's auto-rigger is humanoid-only. Erma needs a separate rig path: DeepMotion (paid, supports quadrupeds), manual rigging in Blender via MCP, or the source AI tool's animation feature if it supports quadrupeds.
- **Paul (3D static):** No animation, no rig. AI image-to-3D mesh imported into Blender and rendered as a static sprite from the right angle(s). Engine code places him at varying world positions to recreate the periodic-appearance experience.
- **Stands and props:** No rig needed. AI image-to-3D mesh → Blender import → render at the resolution above.

### Naming and file layout

- **Kebab-case** everywhere: `critic-1`, `erma`, `paul`, `bobaaaaah-stand`
- **`.blend` source files:** `blender/characters/`, `blender/ghosts/`, `blender/stands/`, `blender/props/` (Git LFS)
- **Source `.glb`/`.fbx` files from AI tools:** path TBD — decide once we're moving real characters through and can see what we want versioned
- **Rendered PNGs:** `public/sprites/characters/`, `public/sprites/ghosts/`, etc. — mirrored folder structure
- **Sprite anchor:** bottom-center (character's feet = anchor point)
- **Naming pattern:** `{name}/{animation}/{direction}.png` — e.g. `critic-1/walk/front.png`

### Git LFS

`.blend` files are tracked via Git LFS (configured in `.gitattributes`). When cloning fresh, install Git LFS first: `git lfs install && git lfs pull`.

### Claude Desktop connector

Blender rendering is scripted via a Claude Desktop MCP connector (Anthropic's official Blender connector). See `LOCAL_DEV.md` for installation; the Blender connector section there is being revised separately.

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

- **Character 1 — Scout/Stealth:** detects clues at longer range; fits into small hide spots that Character 2 cannot.
- **Character 2 — Enforcer:** moves faster while wearing the ghost sheet; has longer reach when catching ghosts.

Both characters share the same world state, inventory, and stand progression. The switch is a style choice with minor tactical edge, not a hard gate.

---

## Project Structure

```
abandoned-park/                    ← project root = npm project
├── CLAUDE.md                      ← this file
├── WORKING_WITH_ME.md             ← interaction rules + landmines
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

| Easy Name | Real Name | What It Does |
|---|---|---|
| The Drawing Window | HTML5 `<canvas>` | Where the game shows up |
| The Game Brain | `requestAnimationFrame` loop @ 60fps | Makes things move smoothly |
| The Listener | `src/engine/input.ts` | Keyboard + touch + Bluetooth gamepad |
| The Sound Box | `src/engine/sound.ts` | Procedural audio — no audio files needed |
| The Stretchy Window | `src/engine/canvas.ts` | Makes the game fit any screen |
| The Picture Box | Canvas 2D procedural + 3D-rendered sprites | Renders scenes and characters |
| The Juice | `src/engine/juice.ts` | Particles, screen shake, easing |
| The Mesh Generator | TRELLIS (or Meshy / Tripo) | Turns Sloane's reference images into 3D meshes |
| The Rigger | Mixamo (web service) | Auto-rigs humanoid meshes + provides animation library |
| The Renderer | Blender + Claude Desktop (MCP) | Imports rigged meshes and renders sprite strips |
| The Sprite List | `src/assets/manifest.ts` | Typed index of all runtime sprites |

---

## Big Dream Goals

- [ ] Play with Bluetooth controllers
- [ ] Put the game on Dad's phone
- [ ] Put the game on Sloane's phone
- [x] Use Sloane's artwork as characters (pipeline pivoted to AI image-to-3D + Mixamo + Blender — Phase 1)
- [ ] Add real recorded music and sound effects
- [ ] Multiple zones with progression and save file
- [x] Graduate from single-file Artifact to a real Vite project (done)
- [x] 2-player design (planned — 2 characters, not 2 screens)
- [ ] Outside-park content if it all plays out well
- [ ] Migrate to Cloudflare Pages when we resume deploys

---

## Progress Log

Newest at the top.

### 2026-05-09 — Phase 2: TRELLIS 2 Pipeline Validation + Critic 1 v1 Test Render

**Built:** ComfyUI Easy-Install (Tavris1 distribution, MIT) installed at `E:\ComfyUI-Easy-Install\` on Windows 11, RTX 5070 (Blackwell). Torch swapped from default cu130 to 2.8.0+cu128 (Trellis2 requires cu128 on Blackwell). Trellis2 custom nodes installed; DINOv3 (1.18 GB) auto-fetched to `ComfyUI\models\facebook\dinov3-vitl16-pretrain-lvd1689m\`. FlashAttention add-on installed (required — first generation failed with `flash_attn_func` returning None). Critic 1 generated via `MeshWithTexturing.json` workflow from Dad-prepared T-pose source `Critic1source.jpg` (`remove_background=true`; source was JPG with no alpha); mesh export changed from `glb` to `obj`, output `ComfyUI\output\critic-1_Textured_00001_.obj` (44 MB). Auto-rigged in Mixamo — OBJ uploaded directly, no Blender conversion step needed; idle animation applied; downloaded FBX Binary (30 FPS, with skin). FBX imported into Blender; animation plays end-to-end. Game-spec test render via Blender MCP: 512×512 PNG, transparent background, orthographic camera at 30° isometric tilt, neutral world lighting, Eevee; output committed at `blender/test-renders/` (4 directions + 6-frame idle strip) and `test_renders/critic-1-test.png`. Bug discovered + fixed during render setup: at character's ~10mm world scale, Blender's default `clip_start` of 0.1m clipped the subject entirely; fixed with `camera.data.clip_start = 0.001`. Pipeline simplification discovered: originally planned GLB → Blender export → FBX → Mixamo; actual working path is OBJ direct from Trellis2 → Mixamo → FBX → Blender, skipping Blender as a conversion step entirely. Critic 1 v1 quality assessment: flat platform/base under feet (silhouette artifact), cat-like face from anime-proportion mesh quality, and gray-tinted skin from baked-in source-image shadows are visible at sprite scale and won't wash out. Blob hands (no finger separation) and shoulder/upper-arm distortion from T-pose rigging washed out at sprite scale — acceptable as-is. Hair shape, apron knot and logo, and overall silhouette read correctly as "kid in apron." Conclusion: Critic 1 v1 not game-ready; pipeline is validated.

**Sloane Decided:** (No new creative input this session.)

**Dad Learned:** Tavris1 Easy-Install handled all Blackwell cu128 dependencies automatically (~2–4 hours saved vs. manual wheel install). T-pose is an INPUT requirement for Trellis2 — mesh inherits source pose; it's not a generation toggle. For tiny-scale Blender scenes (~10mm meshes), default camera near-clip silently clips the subject; always set `clip_start` proportional to scene scale. Trellis2 weak spots: faces (anime stylization), thin separated geometry (fingers, separated feet), ground-plane silhouette artifacts. Mixamo accepts OBJ directly — no GLB→Blender→FBX step needed. Source image lighting bakes into texture permanently — neutral even lighting on the source matters.

**Next Up:** Critic 1 v2 with improved source image: clean cutout (no ground/base visible), neutral even lighting (no baked skin shadows), feet clearly apart, T-pose with separated fingers. If v2 face quality still fails, evaluate alternative image-to-3D models or Blender face sculpting. Erma is a separate quadruped path (DeepMotion, manual Blender rig, or AI quadruped tool).

### 2026-05-09 — Phase 1: Asset Pipeline Pivot + Documentation Day

**Built:** Verified the official Anthropic Blender MCP connector with a smoke test. Determined that programmatic Blender modeling via MCP cannot produce hero characters (output reads as "balding bearded blob guy" rather than Critic 1 — primitive joining can't approximate hair, faces, or organic shape). Pipeline updated to AI image-to-3D (TRELLIS) for source meshes → Mixamo for rigging humanoids → Blender for import + render. Erma confirmed quadruped (no Mixamo path). Paul confirmed 3D static. WORKING_WITH_ME.md created. README.md updated to add WORKING_WITH_ME link + Sloane credit line. LOCAL_DEV.md restructured: daily-use stuff at top, technical reference below, landmines section seeded with today's hits. CLAUDE.md updated to reflect the new pipeline.

**Sloane Decided:** (No new creative input this session.)

**Dad Learned:** GLB vs FBX (Mixamo accepts FBX/OBJ/ZIP, not GLB; Blender exports FBX). T-pose is required for Mixamo's auto-rigger; AI image-to-3D outputs default to casual standing pose. Mixamo's auto-rigger is humanoid-only.

**Next Up:** Get TRELLIS 2 running locally on the RTX 5070. Generate Critic 1 in T-pose. Run her through Mixamo for the first rigged + animated render.

### 2026-05-08 — Session D: Blender Pipeline Scaffolding

**Built:** Sprite manifest generation via `scripts/generate-placeholder-sprites.mjs`. Dormant sprite render path in `src/world/food-zone.ts` behind `USE_SPRITE_PLAYER` flag (currently `false`). LOCAL_DEV.md expanded with Blender install + MCP connector setup walkthrough. Frame layout spec: 6 frames idle (3072×512), 12 frames walk (6144×512), horizontal strip per direction.

**Sloane Decided:** (No new creative input this session.)

**Dad Learned:** Frame layout for sprite strips. The difference between Claude Code (CLI) and Claude Desktop (chat with MCP).

**Next Up:** Render the first character through the pipeline.

### 2026-05-08 — Housekeeping

**Built:** Added `.claude/` to `.gitignore`. Prettier sweep cleared 1522 ESLint warnings to 0. Added `* text=auto eol=lf` to `.gitattributes` (durable line-ending fix; Git's `autocrlf` would have re-converted to CRLF without it).

**Next Up:** Continue character pipeline work.

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
