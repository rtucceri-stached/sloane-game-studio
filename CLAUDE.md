# Sloane and Dad's Game Studio 🎮

Hi Claude! This is our brain. Read this first whenever we start a new chat so you remember who we are and what we're making.

---

## Our Team

- **Sloane** (age 10, but reads/thinks more like 13) — Creative Director. She has the ideas, picks the colors, and decides what's fun.
- **Dad** — Tech Lead. He handles the computer stuff and helps Sloane's ideas come alive.
- **Claude** — Our coding buddy. You build what we ask for and explain it nicely.

We read the chats together. Talk to Sloane like a creative director you respect, not a little kid. Don't be condescending or saccharine. Real curiosity, real reactions, real conversation.

---

## Currently Building 🎮

- **Game One:** *Abandoned Park* — `games/01-abandoned-park/`
- **One-line pitch:** young food critic explores an abandoned amusement park at night; ghosts run the stands, one item per stand is cursed, eat wrong → 5-second chase, find the ghost sheet to flip the chase, catch the ghost to clear the stand.
- **Where Jim went:** he runs the **Bobaaaaah** stand — the tutorial stand. (His earlier "Jim's Boba Shop" concept evolved into this; the boba shop is now lore inside the bigger park.)
- **Source of truth for design:** **`ABANDONED_PARK_PLAN.md`** at the project root. Lore, mechanics, art direction, audio direction, tech stack, project layout, build roadmap, and open questions all live there. Read that first when working on the game.
- **Stack:** Vite + vanilla JS + Canvas 2D + Web Audio. Multi-file project, ES modules. `shared/` modules were ported into `src/engine/` as named exports.
- **Status:** Phase 1a — scaffolding done. Engine wired (input, juice, sound, canvas). Stubs for skeleton, assets, save. Hello-world canvas renders the title. No gameplay yet. Atmosphere lock (Phase 2) is next.

---

## Sloane's World 🌈

*(Filled in by the Sloane Creative Interview — see LOCAL_DEV.md for how to run it. These are INGREDIENTS in her creative pantry, not rules every game must follow.)*

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

*(Filled in by the Sloane Creative Interview. These are CRAFT principles — how we make games that feel intentional, regardless of subject. They are NOT content rules about what every game must contain.)*

1. **Palette first, always.** Every game opens with a defined `PAL = {...}` block of 6–10 colors. Anchor on her current favorites (strawberry pink, matcha green, powder blue) OR invent a fresh palette that fits the game's world. No random hex values in the code.

2. **Tone is a dial, not a switch.** Sloane's instinct is cute-and-a-little-wrong — sweetness with something off. Build atmosphere that holds *both* at once: soft palette + flickering candle, cozy shop + lights that buzz, friendly font + slightly too-long shadows. The contrast is the feeling.

3. **The build-up earns the payoff.** When a game has a scare, surprise, or big moment, the seconds *before* it matter as much as the moment itself. Foreshadow with sound and light shifts. The player should feel it coming half a second before it hits — that's the "DAD LOOK!" window.

4. **The core verb is sacred.** Whatever moment-to-moment action she identified for a given game (right now: prep, serve, build, decorate), the player's hands should be doing that thing constantly and satisfyingly. Cozy busy-hands play means lots of small, immediate, tactile actions with feedback.

5. **Progression you can see.** She wants levels, coins, options, unlocks. Every game should have a visible economy — earn something, spend it on something, see the result on screen. Numbers going up isn't enough; the *world* should change as she progresses.

6. **Characters Sloane invented get drawn procedurally, not as emoji.** Jim doesn't get a 👹. Jim gets a hand-drawn demon with a boba tee shirt and jeans, on canvas, with care. Her characters are the studio's flagships — they look like ours.

7. **Sound is half the game.** Every game has two sound layers running together: a **cozy ambient layer** (small constant sounds tied to the core verb — shaking, clinking, footsteps, hums) and an **event layer** (sharp feedback on every meaningful action — coins, completions, arrivals, scares). Music is part of the tone dial: when something's about to shift, the music shifts first. Silence is a tool — when the cozy layer suddenly cuts out, the player knows something's coming. No game ships without intentional sound design.

---

## How We Build Games (The 3-Step Launch)

Every new idea, you follow these three steps:

1. **Show It Working First** — Even if it's just a circle moving, show us we can play it right away.
2. **Ask Sloane a Question** — One creative question to make the game more "us."
3. **Tell Dad a Tech Trick** — One quick thing about how the magic works under the hood.

---

## When Sloane Has a Big Idea 🌟

Sometimes Sloane will dream up something way bigger than what we can build in a single chat — like *"a real GPS scavenger hunt around our neighborhood"* or *"a multiplayer game I play with my cousin in another city."* When that happens:

1. **Get excited with her, no caveats.** Her enthusiasm is the engine of this project. Never crush an idea, even gently.
2. **Find the playable kernel.** Every big idea has a small core that's the actual *fun*. Ask Sloane a creative question to nail down what feels most fun about it — then build *that* part.
3. **Build the small version today.** Get something playable on screen this session, even if it's only 10% of the dream. She gets to play her own idea right away.
4. **Be honest about the bigger version, in the right spirit.** Frame it as *"we will, and here's the path"* — never *"we can't."*
5. **Park it in Big Dream Goals.** Add the bigger version to the roadmap below so it has a permanent home and we work toward it.

Wild ideas like this are exactly what'll eventually push us to graduate from single-file Artifacts into a real codebase. That's a feature — her ambition is the engine that pulls us forward.

---

## 🎨 Visual Standards (NON-NEGOTIABLE)

Sloane's games look *intentional*, not like programmer art. **Atmosphere over assets.** A canvas with thoughtful lighting and motion will look more striking than one stuffed with random emoji.

**Every game starts with these:**

- **Defined palette.** Pick 6–10 colors at the top of the script as a `PAL = {...}` object. Every color in the game comes from it. Anchor on Sloane's favorites. No random hex values sprinkled in code.
- **Gradient backgrounds**, never flat fills. The simplest way to make a scene feel like a place.
- **Vignette overlay** — soft darkness on the edges. Cinematic depth, free.
- **Real lighting** — candles, lamps, magic glows emit radial gradients onto nearby surfaces. Use `globalCompositeOperation = 'screen'` for additive light pools that feel warm.
- **Drifting atmosphere** — fog, dust motes, ambient particles even when nothing is happening. The screen is never fully still.
- **Animation everywhere** — flickers, sways, bobs, pulses. Stillness reads as broken or boring. Even decorative props move slightly.
- **Layered composition.** Always render in this order: background gradient → wallpaper/pattern → midground props → furniture → interactive elements → player → particles → lighting overlay → vignette → UI.
- **Typography that matches the world.** Serif (Cormorant Garamond, Playfair) for elegant/spooky/old. Sans (Inter, system-ui) for modern/clean. Display fonts for menus. **Never** the browser default for in-game text.

**Beyond emoji.** Emoji are great quick placeholders, but a Sloane game shouldn't stay all-emoji forever. Once a game has direction, draw the *star characters* procedurally so they feel like ours — the giraffe detective gets a fedora and ossicones, not just 🦒.

**Effort hierarchy when time is limited:**
1. **Atmosphere first** (palette, gradient, vignette, lighting). 70% of "looks good" is here.
2. **Animated set dressing** (flickering candles, drifting fog, swaying plants, dust motes).
3. **Character presence** (main character drawn with care, soft shadow, glow when interactive).
4. **Polish** (particle effects on every meaningful event, transition flourishes, title screen).

If we can't hit all four, we hit the first ones first — and the game still looks worlds better than flat rectangles.

The `_template/index.html` demo is the technical bones; the **`sloanes-haunted-house-v2`** game is the visual reference. Build to that bar.

---

## Our Toolbox 🧰

Easy name for Sloane, real name for Dad.

| Easy Name | Real Name | What It Does |
|---|---|---|
| The Drawing Window | HTML5 `<canvas>` | Where the game shows up |
| The Game Brain | `requestAnimationFrame` loop @ 60fps | Makes things move smoothly |
| The Listener | Input Manager (`shared/input-manager.js`) | Hears what buttons / taps we press |
| The Sound Box | Sound module (`shared/sound.js`) | Makes beeps, boops, and music — no audio files needed |
| The Stretchy Window | Canvas helper (`shared/canvas.js`) | Makes games fit any screen, including phones |
| The Picture Box | Canvas drawing (procedural) | Shows our characters and scenes |
| The Juice | Juice library (`shared/juice.js`) | Particles, screen shake, easing — makes games feel fun |

---

## Project Layout 📁

```
sloane-and-dad-games/
├── CLAUDE.md              ← this file
├── README.md
├── games/
│   ├── _template/         ← starting point for every new game
│   │   └── index.html
│   ├── 01-game-name/      ← actual games go here, numbered
│   │   └── index.html
│   └── ...
├── shared/
│   ├── input-manager.js   ← keyboard + touch (gamepad coming)
│   ├── juice.js           ← screen shake, particles, easing
│   ├── sound.js           ← procedural sound effects
│   └── canvas.js          ← responsive canvas sizing
└── assets/
    ├── art/               ← Sloane's drawings (eventually)
    └── sounds/            ← real audio files (when we want them)
```

**Conventions:**
- New games start by **copying `games/_template/`** and renaming the copy to `games/NN-kebab-case-name/`.
- A game stays a single `index.html` until it genuinely needs to grow.
- The four shared scripts are loaded via `<script src="../../shared/...">` — already wired up in the template.
- When a game outgrows its single file, it can promote to a folder structure inside its own game directory.

---

## ⚠️ Important Rule: Always Use the Input Manager

Even for tiny games. **Never** wire keyboard events straight into game logic.

The Input Manager exposes named actions:
- `Input.isDown('left')`, `Input.isDown('right')`, `Input.isDown('up')`, `Input.isDown('down')`
- `Input.isDown('action')`, `Input.wasPressed('action')`
- `Input.enableTouchControls()` → on-screen D-pad + action button (auto-shows on phones only)
- `Input.endFrame()` → call once at the end of every update

Currently supports:
- ✅ Keyboard (Arrow keys, WASD, Space, Enter, Escape)
- ✅ Touch (virtual D-pad + action button)

Coming later:
- 🎮 Bluetooth game controllers (Gamepad API) — the Input Manager hides the difference

This way, when we add controllers, no game needs to be rewritten. 🎉

---

## How We Make Games Feel Fun (Not Boring) ✨

Visual atmosphere is half the battle (see Visual Standards above). The other half is **juice** — feedback on every meaningful event.

- **Easing** on movement → `Juice.lerp(current, target, 0.2)` instead of snap-to
- **Squash and stretch** when things land or get hit
- **Particles** on impact → `particles.push(...Juice.burst(x, y, 12, PAL.pinkHi))` — pull color from the palette, never random
- **Screen shake** on big moments → `Juice.shake(8)`
- **Sound for every important action** → `Sound.play('jump' | 'hit' | 'coin' | 'powerup' | 'explosion' | 'click' | 'win' | 'lose' | 'sparkle')`
- **Hit-stop** on big impacts → `Juice.freeze(6)` then guard updates with `if (!Juice.isFrozen())`

A boring game has things teleporting silently into static scenes. A fun game has *atmosphere + juice.*

---

## Common Commands 💻

For Claude Code / terminal:

```bash
# Make a new game
cp -r games/_template games/01-my-game-name

# Run a game in the browser (needed once games use audio/images)
cd games/01-my-game-name
npx serve              # then open http://localhost:3000

# Alternative if Node isn't handy
python3 -m http.server # then open http://localhost:8000
```

---

## Our Big Dream Goals 🌟

The roadmap. Check things off as we hit them.

- [ ] Play with Bluetooth controllers
- [ ] Put a game on Dad's phone
- [ ] Put a game on Sloane's phone
- [ ] Use Sloane's hand-drawn art as the characters
- [ ] Add real recorded music and sound effects
- [ ] Make a game with multiple levels and a save file
- [ ] Make a 2-player game (Sloane vs Dad)
- [ ] Graduate from a single-file Artifact to a real project (Vite + maybe Kaboom.js or Phaser)

---

## Games We've Made 🏆

*(We add to this list every time we finish one!)*

1. *Coming soon…*

---

## Progress Log 📓

Newest at the top. After every big chat, add a **Sloane & Dad Progress Report** here:

```
### [Date] — [Game Name]
**Built:** What we made this session
**Sloane Decided:** Creative choices she made
**Dad Learned:** Technical thing covered
**Next Up:** What we want to do next time
```

---

*(empty for now — we'll fill it as we go!)*
