# Abandoned Park — Planning Doc (Working Draft)

> Living document. Sloane and Dad fill in blanks together. Updated as decisions get made.

**Live URL:** https://sloane-abandoned-park.netlify.app — auto-deploys from `main`.

---

## The Game in One Paragraph

You play a young food critic exploring an abandoned amusement park at night. The park is overrun by ghosts who have taken over the food stands, the game stands, and the broken rides. Most of the food is fine, but at every stand exactly one item is haunted — eat the wrong thing and the ghost behind the counter leaves their booth and chases you. Five seconds to escape: hide in a trashcan or a bush, or find a hidden ghost sheet, put it on, and turn the chase around — five seconds to catch the ghost. Catch it, and that stand is cleared. Clear all stands in a zone, and the next zone unlocks. Each night, the cursed items shuffle. Each night, the park is a little more alive than the night before.

---

## Studio Pillars (Non-Negotiable)

1. **Atmosphere over assets.** Build the look of the park *first*, before any gameplay. Dark sky, broken neon, fog, lamp glow, silhouettes. Every visual standard from CLAUDE.md applied at the start, not retrofitted at the end.
2. **Sloane's drawn art is the game's art.** Important characters and stands come from her hand or curated reference she provides, processed through our PIL pipeline like the streetlamp.
3. **Tone dial: cute-and-melancholy with horror beats.** Cozy ambient most of the time. Sharp scares earned by careful build-up.
4. **Never-ending.** No "you win" screen. The park keeps growing, the haunts keep shifting, the long arc is the park slowly coming back to life.
5. **The core verb is sacred.** Eating, exploring, hiding, chasing — those are the player's hands. Always present, always responsive, always feedback-rich.

---

## Player Character

**The Food Critic.** Long wavy brown hair, brown tee, gray apron, jeans, sneakers. Reference image already in project knowledge. She's serious-faced — not cheerful — because she takes food seriously. She walks with intent.

The "food critic" framing is the *narrative engine*: it explains why she's at every stand trying everything, why she's confident enough to wander into an abandoned park alone, and why every haunted bite has weight. Her job is on the line. Every meal counts.

She animates via 2D skeletal animation (described below), so her personality reads through movement, not just art.

---

## World Structure

**Hub-and-spoke.** The food zone is the central hub. Two paths exit it — one to games, one to rides — but both are blocked until the food zone is fully cleared. The blockers are *visible but inaccessible* (a locked turnstile, a fallen ride banner, ghost-tape across an entrance). The player can *see* what's coming. They just can't reach it yet.

Once the food zone is cleared, both other zones become accessible from the food hub. The player returns to the hub between sessions and zones.

---

## Time of Day

**Always night, for now.** Dark navy/purple sky like the Bigfoot game (`#0a0518 → #291647`). Eventually we may add day variants for the "park slowly coming back to life" arc — but v1 ships nighttime only.

---

## Why the Park Is Abandoned (Lore)

The park's rides broke down years ago. Maintenance stopped. The owners left. But the ghosts — former stand workers, former ride operators — stayed. They're bound to the park they died working at. They still run the stands. They still try to operate the rides. They aren't malicious by default. They're stuck, lonely, snack-hungry. The food critic is the first living person they've seen in a long time. Some are excited. Some are wary.

One specific food item per ghost is *cursed* — something they died near, or something tied to their last bad day. Serving that item to a real human shakes them out of routine and into a chase.

We don't dump this lore on the player. They feel it through the atmosphere.

---

## Where Jim Fits

**Jim runs the Bobaaaaah stand.** It is literally his old boba shop, transplanted into the park.

Lore in one sentence: *"Jim ran the only boba shop in town until the park opened and stole his business. Then the park got abandoned. Now Jim haunts his old stand."*

Bobaaaaah is the **tutorial stand** — Jim is the gentlest ghost, his cursed item is the most obvious, his chase is the most forgiving. He's how the player learns the mechanic against a soft opponent.

Jim's design carries forward from earlier work: tall, thin, scary-looking *man*. Pale skin. Smile too wide. Eyes that don't blink. Wears a Bobaaaaah tee shirt and jeans. Warmth-with-something-off — the calm before every other stand's chaos.

---

## ZONE 1 — THE FOOD STANDS (v1 SHIP)

### Layout

Eight stand slots arranged around the food zone — four on one side, three on the other, plus one empty slot for a future arrival. The empty slot is *visible and intentional*. Players ask "what's going there?" That's part of the long arc.

The seven starting stands:
- **Bobaaaaah** (Jim's stand — tutorial)
- **Whaaaamburger**
- **Taaaahco**
- **Ice Scream**
- **Bakery**
- **Soooooshi**
- **Pizza**

The elongated naming is part of the kawaii-horror voice. Every stand sign reads slightly *wrong*.

### Core Loop (per stand)

1. Player approaches stand. Ghost behind the counter greets them.
2. Stand has 4 items on its menu. Each costs a few tickets.
3. **One item is cursed.** Which one is *fixed* (puzzle, not random) — the player figures out which through clues found around the food zone.
4. Player buys an item. Eats it.
5. **If safe:** ghost is friendly, hands them food, gives them a small ticket tip. Player can try again or move on.
6. **If cursed:** ghost's eyes go black, smile goes wrong, music drops. **Five seconds before the ghost leaves the booth.**
7. Player has to find a hide spot (trashcan or bush — fixed locations) OR find the ghost sheet (hidden new each round) and put it on.
8. With the sheet on, the chase reverses: **five seconds to catch the ghost.**
9. Catch it → stand cleared. Ghost is freed and joins the player's roster of cleared NPCs serving safe food and paying tickets.
10. Clear all seven stands → games zone unlocks.

### Tickets (Economy)

- **Source:** small starting bundle (~30 tickets) + tickets scattered around the park (find by exploring) + ticket reward when catching a ghost (~50 tickets, big bundle).
- **Sink:** every food purchase.
- **Player can never get permanently stuck:** if tickets run low, scattered tickets and ghost-catches refill the wallet. But every wasted purchase still stings, so figuring out the cursed item matters.

### Clues (Puzzle Layer)

Around the food zone, clues hint at which item is cursed at each stand:
- A ghost's diary entry left on a bench
- A torn menu nailed to a tree, with one item circled
- A drawing in chalk on the pavement
- A shadow play visible only when a streetlamp flickers
- An NPC ghost (an already-cleared one) gossiping about another's "bad day"

Some clues are obvious. Some require multiple visits. The player can always brute-force by trying every item, but the puzzle layer rewards exploration.

### Hiding

Two fixed hide spots in the food zone: **trashcan** (one location) and **bush** (one location). Both visually present from the start so the player learns where they are. When a chase starts, the player has 5 seconds to reach one. Hiding lasts as long as the player stays still — the ghost wanders, looks, eventually goes back to its booth.

Hiding is *defensive*. It saves you from the chase. The stand is not cleared. You have to come back and try again — but now the ghost is suspicious and reads slightly differently.

### Ghost Sheet (The Twist)

Hidden somewhere new each round. After the first chase, the player learns: there's a sheet *somewhere* that lets them turn the tables. Finding it is the actual game.

Once the sheet is on:
- Player looks like a ghost.
- Real ghosts mistake them for one of their own.
- Five seconds to chase down whichever ghost is currently active.
- Catching them → stand cleared.

The sheet vanishes after use. Next round it spawns somewhere new.

### Win Condition for Zone

All seven stands cleared. The blocked exits to games and rides open. The player can now access either zone freely.

But the food zone doesn't go static — it persists, and stands re-haunt on subsequent nights with shuffled cursed items.

### Never-Ending Loop

- **Night cycles:** Each "night" the player plays, cursed items shuffle at every stand. Same ghosts, new puzzles.
- **The empty 8th slot:** Over time, a new stand arrives. A new ghost. A new pattern. The park is slowly coming back to life. This is the long arc.
- **The other zones** (when unlocked) have their own re-shuffling loops. The player rotates between zones.

---

## ZONE 2 — THE GAMES (Future)

Eight mini-game stands. Each is its own small game. Each operated by a ghost. Each "broken" in some kawaii-horror way. Specific games and ghosts: Sloane's call.

Brainstorm pool: ring toss, balloon pop, claw machine, shooting gallery, dunk tank, fortune teller, whack-a-ghost, milk bottle pyramid, skee-ball, basketball hoop, hammer/strength tester, spinning wheel.

---

## ZONE 3 — THE RIDES (Future)

Eight rides, all broken. Each holds a ghost. Each "broken" differently. Player gameplay TBD — repair? operate? ride at your own risk?

Brainstorm pool: carousel, Ferris wheel, bumper cars, swinging ship, tilt-a-whirl, haunted house, log flume, roller coaster, tea cups, drop tower.

---

## VISUAL DIRECTION

Match the Bigfoot game's bar. The lessons that worked there apply here.

### Palette

Anchored on **deep night sky** (`#0a0518 → #291647` range, may shift toward navy/teal to differentiate from the forest). Sloane's three favorite colors (strawberry pink, matcha green, powder blue) used **only as glowing accents** — neon signs, ghost glows, food-stand lights — never as base fills. Plus accent broken-neon hues (sickly green, washed pink, dim cyan) for the abandoned-but-still-flickering vibe.

### Lighting

Every glowing thing uses `globalCompositeOperation = 'screen'`. Streetlamps (the cleaned verdigris ones) cast warm pools on the pavement. Neon signs cast colored halos onto stand surfaces. Each light has its **own pulse phase** — the park breathes, never strobes.

### Layered Depth

Backgrounds layered via **value, not just position.** Distant ride silhouettes back, midground stands, foreground props. Each layer slightly brighter and sharper than the one behind it.

### Stands as Buildings

Each stand styled like the storefront from project knowledge — small, weathered, signage hand-painted, lamp glow nearby. Each has a distinct silhouette and signature accent color so they read at a glance.

### Atmosphere Always Moving

Drifting fog, dust motes, distant lightning, "ghostflies" (tiny floating ghost specks instead of fireflies?), peeling paper signs flapping. Never still.

### Vignette and Letterbox

Cinematic. Every scene gets the vignette overlay. Letterbox bars optional for big moments.

---

## CHARACTER ANIMATION SYSTEM

**2D skeletal (cutout) animation.** Each important character is one source image, cut into ~13 parts (head, torso, upper/lower arms, hands, hips, upper/lower legs, feet) with defined pivot points. A skeleton structure connects them. Animations are keyframe data on bones — interpolated smoothly at runtime.

### Engine

`engine/skeleton.js` — about 250 lines. Supports:
- Parent-child bone hierarchy
- Forward kinematics (bone transforms cascade)
- Keyframe animation with smooth interpolation (cubic ease)
- Animation state machine (idle → walk → run → hide → sheet-on → gasp → victory)
- Per-bone overrides (e.g., head looks at cursor independent of body)

Reusable for every character — player, ghosts, Jim, stand operators.

### Pipeline (Per Character)

1. Sloane provides reference image.
2. PIL chroma cleanup + crop (we did this with the lamp).
3. Manual polygon masks per body part → ~13 PNG parts.
4. Skeleton JSON: bone names, parent-child, pivot points.
5. Animation JSONs: per-animation keyframe data.
6. Loaded by the engine, animated at runtime.

### Default Animation Set (Player)

- `idle` — subtle breathing, hip weight-shift, hair sway
- `walk` — full leg cycle, opposing arm swing, slight torso bob
- `run` — faster, deeper bob, arms pumping
- `crouch` — for hiding
- `sheet-on` — putting on the ghost sheet (one-shot)
- `gasp` — reaction to ghost reveal
- `victory` — after catching a ghost

Each maybe 4–8 keyframes. Smooth, expressive.

### Graduation Path

If we hit a wall (face/expression rigs, mesh deformation, IK), graduate to **Rive** (free tier, modern, native web export) or **Spine** (paid, industry standard). Vanilla first because we own everything.

---

## ASSET PIPELINE

The same flow we used for the streetlamp:

1. Reference image provided (drawing, photo, web image)
2. Chroma cleanup + crop (PIL script)
3. Connected component analysis (kill stray speckles)
4. For characters: polygon masks per body part
5. For props: drop into `assets/props/`
6. Loaded at game start via asset loader

The image processing is mostly automatable. Manual cleanup is needed for joint segmentation on characters.

---

## AUDIO DIRECTION

### Two-Layer Ambience (always running)

- **Cozy layer:** distant carousel music (slow, slightly off-key), wind through broken rides, footsteps on gravel, ghost fire crackle, faint laughter on the wind.
- **Tension layer:** fades in before scares, hum that builds, music drops out (silence as the cue), heartbeat, weird whisper.

### Event Sounds

Ticket pickup, food purchase, eating bite, hiding (rustle), sheet-on (whoosh), ghost transformation (scare hit), catch (chime/pop).

### Sources

- [freesound.org](https://freesound.org) — CC0 and CC-BY
- [OpenGameArt.org](https://opengameart.org) — game-licensed
- [Pixabay audio](https://pixabay.com/sound-effects/) — royalty-free

We curate a sound list per zone, download, embed in `assets/audio/`.

---

## TECH STACK

- **Build tool:** Vite (fast dev server, hot reload, simple bundling)
- **Language:** Vanilla JavaScript (no React, no TypeScript — keep it readable)
- **Rendering:** Canvas 2D
- **Audio:** Web Audio API + loaded audio files
- **Input:** Custom Input Manager (keyboard, touch, gamepad)
- **Save:** `localStorage` with profile slots
- **Hosting:** Netlify or Vercel, auto-deploy on git push

### Project Layout (Multi-File)

```
abandoned-park/
├── index.html
├── src/
│   ├── main.js                 ← game loop, top-level state
│   ├── engine/
│   │   ├── input.js            ← keyboard + touch + gamepad
│   │   ├── juice.js            ← shake, particles, easing
│   │   ├── sound.js            ← procedural + loaded audio
│   │   ├── canvas.js           ← responsive sizing
│   │   ├── skeleton.js         ← 2D skeletal animation
│   │   ├── assets.js           ← image/audio loader
│   │   └── save.js             ← localStorage profiles
│   ├── world/
│   │   ├── park.js             ← scene management, hub, zone gating
│   │   ├── food-zone.js
│   │   ├── games-zone.js       (later)
│   │   └── rides-zone.js       (later)
│   ├── characters/
│   │   ├── player.js
│   │   ├── ghost.js            ← shared ghost class
│   │   └── jim.js              ← Jim's specific behavior
│   └── stands/
│       ├── boba.js
│       ├── burger.js
│       └── ...
├── assets/
│   ├── characters/
│   │   ├── player/             ← parts + skeleton.json + animations.json
│   │   └── ghosts/
│   ├── stands/
│   ├── props/                  ← lamps, trashcan, bush, etc.
│   └── audio/
│       ├── ambient/
│       ├── effects/
│       └── music/
└── package.json
```

---

## SHAREABILITY

### Phase 1: Show Mom (Day 1)

Deploy to **Netlify** (or Vercel) connected to the project's git repo. **Auto-deploy on every push** — no manual build, no upload. Sloane gets a stable URL like `sloane-park.netlify.app` that works on any device with a browser. Show Mom on her phone, no install.

Setup is one-time, ~15 minutes:
1. Push project to GitHub
2. Connect Netlify to the repo
3. Set build command (`npm run build`) and publish directory (`dist/`)
4. Done. Every commit auto-deploys.

The URL is live from Day 1 of the build, so every time she makes progress she can refresh on Mom's phone and see it.

### Phase 2: Share with Friends

Same URL. Add **profile slots** so multiple players on the same device have separate save states. Profile = name + saved progress (cleared stands, tickets, found clues, current night).

Sloane's existing "Profile button" design becomes the entry to a profile picker on game start.

When the game's polished, optional **itch.io page** — a real game page with screenshots, a description, and her studio name. Indie-game-feeling, with actual community there. Free.

### Phase 3 (Future): Multiplayer

Architectural notes for now:
- **Save state should be per-profile from day 1** (we're doing this anyway).
- **World state and player state stay separated** so two players could share a world later without rewrites.
- **Network layer added later** via Firebase, Supabase (free tiers), or peer-to-peer WebRTC.
- **Mode TBD:** co-op (two players exploring same park) vs competitive (two food critics racing to clear stands first) vs async (Sloane leaves a haunting move, friend plays the response).

We do not need to build any of this now. We just need to not paint ourselves into corners.

---

## CONTROLLER SUPPORT

Built-in browser **Gamepad API** — no external library needed. Works with most Bluetooth controllers.

### Compatibility

- **XInput** (Xbox controllers, most modern Bluetooth gamepads): natively supported
- **DualShock / DualSense** (PlayStation): supported via the Standard Gamepad mapping
- **Switch Pro Controller**: works in Chrome with quirks
- **Generic Bluetooth gamepads**: usually work via Standard Gamepad mapping

### Pairing Flow (User Side)

1. User pairs the controller with their device via OS Bluetooth settings (one-time).
2. Open the game in browser.
3. Press any button on the controller.
4. Game detects it via `navigator.getGamepads()`.
5. Done — controls now route through the controller.

### Implementation

Add to `engine/input.js`:
- Poll `navigator.getGamepads()` each frame
- Read button states + axis values
- Map XInput layout to game actions:
  - Left stick / D-pad → movement
  - A → action / interact
  - B → cancel / back
  - X → hide (alternative to button)
  - Y → menu
  - Triggers → run (eventually)
- Input Manager exposes the same `Input.isDown('action')` API regardless of source. Game code never knows if input came from keyboard, touch, or controller.

Roughly 100–150 lines added to the existing Input Manager.

### Rumble (Future)

Force Feedback API for subtle rumble on chase moments. Stretch goal.

---

## BUILD ORDER / ROADMAP

### Phase 1 — Foundation
- Multi-file project setup with Vite
- Input Manager updated with gamepad support
- Asset loader engine
- Skeleton animation engine
- Save system (profiles)
- Netlify auto-deploy live (Sloane has a URL on Day 1)

### Phase 2 — Atmosphere Lock
- The dark park scene built and polished — sky, silhouettes, fog, lighting, streetlamps, ambient sound layer, vignette
- *No mechanics yet* — just the look
- Sloane reacts to the look. We iterate until it feels right. **Then we build on top.**

### Phase 3 — Player Character
- Sloane's character image cut into parts
- Skeleton rigged
- Idle + walk animations
- She walks around the empty park, exploring it, just to test feel

### Phase 4 — Food Zone v1
- All 7 stands built (visuals + signs + ghost designs)
- Ghost roulette mechanic working end-to-end
- Tickets, hide spots, sheet, chase, catch
- Save state across nights
- Real audio for the food zone
- Sloane plays the full loop

### Phase 5 — Polish + Share
- Animation polish (gasp, victory, sheet-on)
- Audio mix
- Tutorial pass (Jim's Bobaaaaah stand teaches the mechanic)
- Sloane shows Mom

### Phase 6 — Games Zone (eventually)
- 8 mini-games designed with Sloane
- Each its own small build
- Same skeletal pipeline for new ghosts

### Phase 7 — Rides Zone (eventually)
- 8 rides, broken in unique ways
- Repair/operate mechanics

### Phase 8 and beyond
- New stands fill the empty 8th slot
- New nights, new content drops
- Multiplayer architecture (when we want it)
- itch.io release

---

## OPEN QUESTIONS / PENDING DECISIONS

Things we still need to decide before we build (or while we build):

1. **Items per stand.** 3? 4? 5? More items = more guesswork. Fewer = puzzle is too quick. Working assumption: 4.
2. **Specific clue mechanic.** What does a clue look like in-world? Where do clues appear? Are clues stand-specific or zone-wide hints?
3. **Each ghost's specific design.** Jim is locked. The other 6 ghosts need visual + behavioral concepts. Sloane's call.
4. **Stand operator visibility.** Are ghosts visible inside/behind the stand at all times? Or only revealed on the cursed bite?
5. **Save profile UX.** How does the profile picker look? How does Sloane create a new profile?
6. **Sound list per zone.** Curate 10–15 specific sounds we'd license/download.
7. **Multiplayer mode.** Co-op vs competitive vs async. Defer until food zone ships.
8. **The "DAD LOOK!" moment.** What's the one moment we're building everything around? Working guess: the first time the player puts on the ghost sheet and the chase reverses. Sloane's call.

---

*Working draft. Fill in blanks together. Update as decisions get made.*
