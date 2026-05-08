# LOCAL_DEV.md — How to actually run our game studio 🛠️

This is Dad's reference card. Sit down, glance at this, get going.

If anything in here is broken or confusing, ask Claude Code about it directly — it can read this file and fix it.

> **⚠️ Heads up about the project path.** Our project lives at `"E:\AI Projects\Sloane"` — the **space** in *"AI Projects"* means PowerShell will choke on `cd E:\AI Projects\Sloane` (it'll think `E:\AI` is the command). **Always wrap the path in double quotes** when you type it: `cd "E:\AI Projects\Sloane"`. The code blocks below already have the quotes — just don't drop them when you adapt one.

---

## Quick Start (every time you sit down)

1. Open a terminal in `"E:\AI Projects\Sloane"`
   - **Easiest way on Windows:** open File Explorer, click into the `Sloane` folder, click the address bar, type `pwsh` (or `powershell`), press Enter. Boom — terminal opens already in the right folder, no `cd` needed.
   - **Or in VS Code:** open the folder, then `` Ctrl + ` `` (backtick) to open the integrated terminal.
2. Type `claude` and press Enter to start Claude Code.
3. Ask it whatever you need. It already knows the project (it auto-reads `CLAUDE.md`).

That's the whole loop.

---

## Starting Claude Code

```powershell
cd "E:\AI Projects\Sloane"
claude
```

**First-time-ever:** It'll ask you to log in. A browser window opens — sign in with your Claude account.

**Helpful keys inside Claude Code:**
- `Esc` → interrupt Claude if it's going down the wrong path
- `Ctrl + C` then `Ctrl + C` → cancel
- `exit` or `Ctrl + D` → leave Claude Code
- `/help` → show all built-in slash commands
- `/clear` → start fresh in the same session
- `/config` → tweak settings (diff tool, model, etc.)

**Pro tip:** keep two terminals open side by side. One running Claude Code, one for you to run things like `npx serve` or `git status`.

---

## 🌟 Day One: The Sloane Creative Interview (in chat with Claude)

**Do this once, with Sloane next to you, before we build any games.**

The interview happens in a **fresh chat with Claude on claude.ai** (not Claude Code) — it's a real conversation where Claude asks Sloane questions about her aesthetic, references, what would wow her friends, etc. Takes ~15–20 minutes.

When the interview is done, Claude will hand you a **single copy-paste prompt** that you take to Claude Code, which will update `CLAUDE.md` and add a new "Sloane Studio Design Principles" section based on her answers.

**Open a fresh chat in claude.ai with Sloane next to you, then paste this:**

```
Hi Claude! Sloane is here next to me. We're doing the Sloane Creative Interview — this sets up her studio profile AND figures out what game we're going to build first.

About her: she's 10 but reads/thinks more like 13. Skip cheerleader energy ("wow that's so cool!!!"). Aim for "got it — that totally tracks" or "interesting, say more about that one." Real curiosity, not performance.

HOW TO RUN THE INTERVIEW:
- ONE question at a time, conversationally. Wait for her answer before moving on.
- ALWAYS pull on one-word answers. If she says just "ghosts" or just "purple," follow up: "say more — ghosts how? Casper friendly, Stranger Things creepy, Beetlejuice chaotic?" Don't let one-word answers become canon.
- If something surprises you, ask ONE small follow-up. Don't dig forever — keep momentum.
- If she's stuck or shrugs, mark "(skipped for now)" and move on. Zero pressure.
- BEFORE PART D: play back what you've heard in your own words ("so the picture so far is... did I get that right?"). She gets to correct misreads in real time. This is mission-critical — without it I'll over-extract again.

CRITICAL FRAMING — read this and hold it the whole interview:
Her answers are INGREDIENTS for a creative pantry, not RULES every future game must follow. If she says she loves ghosts, ghosts are an ingredient she loves — it does NOT mean every game we make has ghosts. The studio's design principles are about CRAFT (how we make games feel intentional, regardless of subject), not CONTENT (what's in every game). Hold that distinction firmly through to the synthesis at the end.

———

THE QUESTIONS:

PART A — WHAT YOU'RE INTO

1. Three favorite colors right now — and tell me what each one FEELS like. ("Pink that's glittery" vs "pink that's bubblegum" — the texture matters.)

2. What worlds or vibes pull you in right now? If she's stuck, offer some to react to: cottagecore, dark academia, y2k sparkle, whimsigoth, cozy cabin, mall goth, eerie cute, fairycore, post-apocalyptic, vaporwave, kawaii horror — she can pick multiple, mash them together, or invent.

3. Top 3 stories/games/shows/movies you're obsessed with right now — AND for each one, the SPECIFIC thing that hooks you. Not "Stranger Things" — "the 80s vibe" or "the friend group" or "the monsters" or "the mystery." Push for the actual hook.

4. Tell me about a moment from anything — game, show, movie, song, book, YouTube video — that hit you HARD. Chills, big laugh, tears, surprise, anything strong. What happened? Why did it stick?

PART B — WHAT'S YOURS

5. Characters you've invented yourself — even tiny ones, even joke ones. ALL of them. For each, get as much detail as she'll give: name, what they look like, what they sound like, what their deal is. These go in the permanent vault — make it feel that way.

6. Animals, creatures, or beings you love. Real, mythical, made-up — anything you're a fan of, even if you didn't invent them. (Different from #5: this is what you're a fan of, not what you made.)

→ Optional check-in here if her answers have been rich: "Quick gut check — here's what I'm picking up so far..." Let her correct you.

PART C — HOW YOU LIKE TO PLAY

7. In games, what's the part your hands actually LOVE doing? The moment-to-moment fun. If stuck, offer examples: solving mysteries by looking around / fighting enemies with timing / building and customizing / collecting and trading / running, jumping, dodging / talking to characters and making choices / exploring without pressure. She can pick more than one.

8. What makes you go "this is BORING, I'm done"? And separately, what makes you go "ugh okay ONE more"?

9. Short games you'd replay 50 times, OR long adventures with a real ending? Or both depending on mood?

———

REQUIRED PLAYBACK BEFORE PART D:
"Okay — before I ask you what we're building, here's the picture I have of you so far: [give a 4-6 sentence summary in your own words, hitting colors, vibes, the things she's a fan of, characters she invented, the kind of play she loves]. Sound right? Anything off?"

Adjust based on her corrections before going to Part D.

———

PART D — GAME ONE (what we're making FIRST)

10. Out of EVERYTHING you've told me, what's the ONE thing you want us to build FIRST? Not the biggest idea — the one you'd most want to play tomorrow.

11. Set the opening shot. What does the player see in the very first second of the game? Where are we, who's there, what's the mood?

12. THE "DAD LOOK!" MOMENT. Picture the moment in this game where you grab my arm and yell "DAD LOOK!" — what's happening on screen? That moment is the one I'm going to build the rest of the game around.

———

WHEN THE INTERVIEW IS DONE, generate a SINGLE copy-paste prompt I can take to Claude Code that does the following four things:

(1) Replaces the "Sloane's World 🌈" section in CLAUDE.md with a FAITHFUL capture of her actual answers, under these subheadings:
  • Favorite Colors (with her descriptions of each)
  • Aesthetic & Vibes
  • Stories & Worlds She's Into Right Now
  • Characters She's Invented
  • Creatures She Loves
  • A Moment That Hit Her Hard
  • How She Likes to Play (the core verb)
  • What Makes Games Boring vs "One More"
  • Game Length Preference
  • Things She's Over (only if she said any)

  Use her actual phrasing. Do not tidy it into corporate language. These are INGREDIENTS in her pantry, not directives.

(2) Replaces the "Sloane Studio Design Principles" section with 5–7 CRAFT principles — how we make games that feel intentional, regardless of subject.

  Examples of the RIGHT kind of principle:
  • "Every game starts from a defined palette — drawn from her favorites or invented fresh for that game."
  • "Atmosphere before mechanics — a scene should feel like a place before it asks for a button press."
  • "Characters Sloane invented get drawn procedurally, not as emoji."
  • "Every meaningful event has feedback — sound, particles, screen shake."
  • "The core verb she identified is present in every game — that's her way of having fun."
  • "Mystery/quiet/discovery beats jump-scares" (or whatever the equivalent is from her actual answers).

  Examples of the WRONG kind of principle (do not produce these — these are content rules disguised as principles):
  • "Every game lives in [her current favorite world]."
  • "The main characters are always [the crew she invented]."
  • "Every game must include [specific creature/setting]."

  Her tastes will evolve. The principles must outlast any single phase of what she's into.

(3) Adds a "Currently Building 🎮" section (replacing the "What We're Making Right Now" placeholder) with the GAME ONE SEED, a concrete spec we can start coding from:
  • Working title (or "Untitled" if she didn't name it)
  • Protagonist(s) — drawn from her invented characters or created for this game
  • Setting / opening shot (from Q11)
  • Core verb — what the player does moment-to-moment (from Q7)
  • The "DAD LOOK!" signature moment we're aiming for (from Q12)
  • Art direction notes (palette + vibe from Q1, Q2, character look from Q5)
  • Anything she said is non-negotiable for THIS game

(4) If this folder is already a git repo, commits with a friendly message. If git isn't initialized yet, just saves and shows me a diff — I'll handle the very first commit myself.

———

Start with question 1 and let's go.
```

After Claude finishes the interview and gives you the Claude Code prompt, switch over, paste it in, and you're set forever. ✨

---

## Playing a Game

### The fast way (works for most of our games)

Open File Explorer, go to `games\NN-game-name\`, **double-click `index.html`**. It opens in your default browser. Done.

This works because our games:
- Use procedural sound (no sound files to load)
- Use canvas drawing or emoji (no image files to load)
- Load shared scripts via relative paths

### When you need a local server

The moment a game uses real **image** or **audio files** from the `assets/` folder, browsers block direct file access for security. You'll need a tiny local server. Two options:

```powershell
# Option A: Node (most common)
cd "E:\AI Projects\Sloane\games\01-my-game"
npx serve
# → opens http://localhost:3000

# Option B: Python (if you have it)
cd "E:\AI Projects\Sloane\games\01-my-game"
python -m http.server
# → opens http://localhost:8000
```

Leave that terminal running while playing. `Ctrl + C` to stop it.

---

## Testing on Sloane's (or your) Phone 📱

This is how you check that touch controls feel right.

1. Make sure phone and computer are on the **same Wi-Fi**.
2. Start a local server in the game folder (see above), but use Python's because it binds to all network interfaces by default:
   ```powershell
   cd "E:\AI Projects\Sloane\games\01-my-game"
   python -m http.server
   ```
3. Find your computer's local IP. In a new terminal:
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" under your Wi-Fi adapter — usually starts with `192.168.` or `10.`.
4. On the phone's browser, go to `http://YOUR-IP:8000` (e.g. `http://192.168.1.42:8000`).
5. The virtual D-pad and action button should appear. Test away.

**If it doesn't load:** Windows Firewall is probably blocking the port. First time you run `python -m http.server`, Windows should pop up a permission dialog — click "Allow on private networks."

---

## Git Basics (do this once, then sprinkle in)

### One-time setup, the very first session

Heads up: keep this first init/commit deliberate. Most prompts in this doc assume the repo already exists, so if you run them before this step you may see Claude Code try to init the repo as a side effect — that's fine to decline and come back here first.

```powershell
cd "E:\AI Projects\Sloane"
git init
git add .
git commit -m "Initial scaffold — Sloane & Dad's game studio is alive"
```

### After every meaningful change

```powershell
git add .
git commit -m "Added smiley wizard game with bouncing fireballs"
```

Use a real description — future-you and grown-up Sloane will love reading these.

### Useful "what changed?" commands

```powershell
git status           # what files have I changed since last commit?
git diff             # show me the actual changes
git log --oneline    # one-line history of every commit
```

### Made a mistake? Want to undo?

Honestly? Just ask Claude Code: *"I broke `games/01-cat/index.html`. Can you help me revert it to the last commit?"* It'll handle the git command for you.

---

## Saving an Artifact From a Chat Into the Project

When Sloane and I build something in chat that she loves, the workflow:

1. **Click the copy button on the Artifact** to grab the full HTML.
2. In Claude Code, paste this prompt (then paste the code on the next line):

   > Save the code I'm pasting below as `games/NN-game-name/index.html`. The shared library blocks (`const Input = ...`, `const Juice = ...`, `const Sound = ...`, `const Canvas = ...`) are inlined — convert them back to `<script src="../../shared/...">` tags so this game uses the project's shared libraries. Then commit it with a friendly message.

3. Claude Code will create the folder, save the file, do the swap, and commit. You're done.

---

## Useful Claude Code Prompts (Copy & Paste) 📋

Steal liberally. These are pre-tuned for our project.

### 🔍 Get oriented

> Read CLAUDE.md and give me a 5-bullet summary of what this project is, what we've built so far, and what's next.

> Show me what every file in `shared/` does, in plain language a 10-year-old can follow.

### 🎮 Start a new game from the template

> Copy `games/_template/` to `games/NN-cat-platformer/`. Open the new index.html and update the `<title>` to "Cat Platformer". Don't change anything else — Sloane and I will design it from there.

### 💾 Save a game from chat

> Save the code I'm pasting below as `games/NN-game-name/index.html`. The shared library blocks are inlined — convert them back to `<script src="../../shared/...">` tags. Then `git add` and commit with a friendly message.

### 🌈 Add new stuff to Sloane's World (use over time!)

Whenever Sloane invents a new character, picks a new favorite color, or discovers a new theme she loves — use a prompt like this so it gets saved permanently.

> Sloane just told me she invented a new character: a sleepy purple dragon named "Toaster" who hoards cinnamon rolls. Add Toaster to the "Characters She's Invented or Identifies With" list in CLAUDE.md. Keep it brief and fun.

> Sloane has a new favorite color: glittery teal. Add it to her favorite colors list in CLAUDE.md.

### 🔧 Make a change Sloane asked for

> In `games/01-cat/index.html`, the cat moves too slowly. Change the player.maxSpeed to 4 instead of 2.5. Also, when the cat catches a fish, play `Sound.play('coin')` and add 12 yellow particles via `Juice.burst`.

### 🪲 Debug something that broke

> The game in `games/02-spaceship/index.html` won't load. Open it, find the bug, fix it, and explain to me what was wrong in one sentence Sloane could understand.

### 🎨 Refactor as a game grows up

> The game in `games/03-dungeon/index.html` is getting big. Split it into separate files inside its folder: `index.html` (page + script tags), `game.js` (main logic), and `levels.js` (the level data). Don't change behavior — just reorganize.

### 📓 Write a Progress Report

> We just finished a session where we built a bouncy ball game. Sloane chose pink and turquoise as the colors and named the ball "Bouncy McBounceface". Add a Sloane & Dad Progress Report to the bottom of CLAUDE.md using the template at the top of the Progress Log section. Keep it short and warm.

### 🧪 Test on a phone

> Start a local server for `games/01-cat/` using `python -m http.server`. Then tell me my computer's local IP address so I can open the game on Sloane's phone.

### 🆕 Update the shared libraries

> I have an updated version of `shared/sound.js` to drop in. After I paste it, look at every game in `games/` (skip `_template`) and tell me if any of them use sound features that will break. Then commit the change.

### 🧹 Clean up

> List every game in `games/` along with its file size and last-modified date. Suggest which ones (if any) are abandoned experiments we could move into a `games/_archive/` folder.

---

## When to use Chat (with Sloane) vs Claude Code (Dad solo)

| Use **chat with me** when… | Use **Claude Code** when… |
|---|---|
| Sloane is here and wants to play | Dad is alone working on a save/refactor |
| Brainstorming a new game idea | Saving a game from chat into the project |
| Building a quick playable Artifact to test a concept | Splitting a single-file game into multiple files |
| Sloane wants to tweak colors / characters / feel | Debugging weird behavior across files |
| Naming things, picking themes | Anything involving git |
| Asking "what should we add?" | Anything that has to actually touch files on disk |
| **The Sloane Creative Interview** (Day One!) | Applying the interview answers to CLAUDE.md (after) |

**The translation between them:** when chat-Claude makes something Sloane loves, Dad takes it to Claude-Code-Claude to make it permanent.

---

## When Something Breaks 🚨

Default move: **ask Claude Code about it.**

```
> Something is broken: [describe what you tried, what happened, what you expected].
> Look at the relevant files and figure out what's wrong.
```

Common issues you might hit:

- **`E:\AI : The term 'E:\AI' is not recognized...`** → you forgot to wrap the path in double quotes. PowerShell needs `cd "E:\AI Projects\Sloane"`, not `cd E:\AI Projects\Sloane`. (See heads-up at the top of this doc.)
- **Game opens but is blank / broken** → check the browser DevTools console (F12 in most browsers). It usually tells you exactly which line broke. Paste that into Claude Code.
- **No sound** → Web Audio needs a user gesture first. Click the page or press a key. If still silent, check `Sound.mute` is `false`.
- **Touch controls don't show on phone** → only show on actual touch devices. They won't appear in your desktop browser even with DevTools "mobile view." Test on a real phone.
- **`claude` command not found** → restart your terminal. If still missing, the Claude Code install needs a PATH fix (search "Claude Code Windows PATH" or just ask Claude.ai chat for help).
- **Local server says "port already in use"** → another server is running. Either stop it (`Ctrl + C` in its terminal) or use a different port: `npx serve -p 4000`.

---

## Final tip 💡

You don't need to memorize any of this. The point of having it written down is so you can **glance, copy, paste, go.** And whenever you're not sure what to do, just describe the situation to Claude Code (or me!) in plain English and we'll handle it.

Have fun. Build cool stuff with your kid. 🎮
