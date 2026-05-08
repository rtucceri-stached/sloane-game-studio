/* ============================================================
 * FOOD ZONE — Phase 0.5b verbatim port of the visual foundation
 * ------------------------------------------------------------
 * Source of truth: ./abandoned-park-visual-foundation.html at the
 * project root. PAL, world content, hero props, particles, draw
 * helpers, render layer order — copied verbatim. Engine modules
 * (Input/Juice/Sound/Canvas in src/engine/) replace the artifact's
 * inlined ones; everything else comes straight from the artifact.
 *
 * The existing top-down food-critic _drawPlayer is preserved and
 * slotted at layer 15 (between the balloon and the light pools)
 * per spec. Stand interaction logic, ticket cost, ghost mechanic,
 * save system — all untouched.
 * ============================================================ */

import { Input } from '../engine/input.js';
import { Juice } from '../engine/juice.js';
import { Sound } from '../engine/sound.js';

// ---------- Canvas + world dimensions (match artifact) ----------
const W = 960, H = 600;
const WORLD_W = 2400, WORLD_H = 1700;

// ---------- PAL — verbatim from the artifact ----------
// Every color in the food zone comes from here. No raw hex elsewhere.
const PAL = {
  // Sky — deep purple-black night, sickly haze near horizon
  skyTop: '#070314', skyMid: '#160a2c', skyBottom: '#2a1644', skyHaze: '#3d2458',

  // Ground — dirt midway
  groundFar: '#1a1024', groundMid: '#241828', groundNear: '#2e1f30', groundDark: '#0a0612',
  concrete: '#2a2832', concreteHi: '#3a3540', concreteCrack: '#100810',
  dirt: '#1f1820', dirtHi: '#2e2528',

  // Sloane's three loud colors
  pink: '#ff4dc8', pinkHi: '#ffb0e0', pinkLo: '#c2369a',
  green: '#9bff5e', greenHi: '#d8ffb8', greenLo: '#5cb838',
  blue: '#a8e0ff', blueHi: '#e0f4ff',

  // Horror accents
  sickGreen: '#6dff8a', sickGreenD: '#3dc858',
  bloodBoba: '#a01828', bloodHi: '#d93450',

  // Distant rides
  rideFar: '#100822', rideMid: '#1c0e30', rideNear: '#2a163e',
  rideStrut: '#3a2a4e', rideRust: '#5a2a1c', rideBeam: '#1a0e26',

  // Lighting
  warmLamp: '#ffd76b', warmLampHi: '#fff4c2',
  fireflyGlow: '#ffe4a0',
  spiritPink: '#ff8acc', spiritGreen: '#9bff5e', spiritPurp: '#c9a8ff', spiritBlue: '#a8e0ff',

  // Boba stand
  standWood: '#3a2818', standWoodHi: '#5a3e28', standWoodLo: '#1f140a',
  standAwningP: '#ff5dbe', standAwningG: '#a8f08a', standAwningD: '#c2369a',
  standCounter: '#1a1014', standCounterHi: '#2a1f24',
  standInterior: '#3a2814', standInteriorHi: '#5e421e',
  standWrong: '#1a3018', standWrongHi: '#2a5028',
  standNeon: '#ff4dc8', standNeonGlow: '#ffaadd',
  standCup: '#e8e0d0', standStraw: '#ff8ac8',
  standPearl: '#1a0e14',

  // Streetlamp (verdigris green like the photo)
  lampPost: '#3e5a4c', lampPostHi: '#6a8674', lampPostLo: '#1f2e26',
  lampBrass: '#8a6a32', lampBrassHi: '#c2a058',
  lampGlass: '#ffe4a0', lampGlassDim: '#a88a48',
  lampHand: '#0a0612',

  // Lantern posts / string lights
  lanternPost: '#2a1f1a', lanternPostHi: '#3e2e26',
  bulbWarm: '#ffa860', bulbPink: '#ff8acc', bulbGreen: '#a8f08a', bulbWire: '#1a1218',

  // Litter
  litterPaper: '#cdb87a', litterCup: '#d8d0c0', litterTicket: '#c47b3a', litterFlyer: '#8a9ab8',
  popcorn: '#f0e8c0',

  // Grass / weeds
  grass: '#3a4a30', grassHi: '#5a6a44', weed: '#4a4838', deadGrass: '#5a4a30',

  // Bench
  benchWood: '#3a2818', benchWoodH: '#5a3e28', benchMetal: '#1a1820', benchMetalH: '#3a3a44',

  // Trash can
  canBody: '#2a2630', canBodyHi: '#444050', canRust: '#5a3a1e', canBag: '#1a1a22',

  // Cone
  coneBase: '#a0501a', coneStripe: '#e8e0d0',

  // Balloon
  balloonPink: '#ff8acc', balloonPinkHi: '#ffd0e8', balloonString: '#c0a0d0',

  // Player (apron girl placeholder — verbatim from artifact)
  hairBase: '#3a2418', hairHi: '#5a3a26', hairLo: '#1f1208',
  skin: '#f0d4b8', skinSh: '#c8a68a',
  shirt: '#4a3020', shirtHi: '#6a4838',
  apron: '#bcb4a8', apronHi: '#dcd4c8', apronLo: '#7a7268',
  jeans: '#3a4a6a', jeansHi: '#5a6a8a', jeansLo: '#243044',
  shoe: '#e8e0d0', shoeLo: '#a8a090',

  // UI
  uiText: '#f5e8ff', uiBg: 'rgba(15,8,28,0.92)', uiBorder: '#a855ff',
  uiAccent: '#9bff5e', uiPink: '#ff4dc8', uiDim: '#7a6a8a',

  vignette: 'rgba(0,0,0,0.85)',

  // ---------- Aliases for the legacy top-down _drawPlayer ----------
  // Top-down food-critic uses these names; resolved against the
  // artifact's apron-girl palette so the colors stay consistent.
  hairBack:    '#3a2010',
  hairFront:   '#5a341a',
  tee:         '#5a3424',
  apronStrap:  '#74686e',
  jeansShade:  '#1f2c40',
  sneakers:    '#f4ece0',
  sneakersDk:  '#bfb8ac',
};

// ---------- Seedable RNG (verbatim from artifact) ----------
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

// ============================================================
// FoodZone class — class shell around the artifact's module-level
// state. `this.ctx` replaces the artifact's `ctx`, all world
// arrays/hero props move to instance fields, and every draw
// function becomes a `_drawX` method. PAL + W/H/WORLD_* stay
// module-level so they read like the artifact.
// ============================================================
export class FoodZone {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.camera = { x: 0, y: 0, tx: 0, ty: 0 };

    // Player — coords from artifact, drawing kept (top-down food critic).
    this.player = {
      x: 1180, y: 1180, vx: 0, vy: 0, r: 18,
      facing: 1, walkPhase: 0, bobPhase: 0,
      speed: 2.4, _stepTimer: 0,
    };

    // World content arrays — populated by _buildWorld() below.
    this.distantRides = [
      { type: 'tent',     x: 280,  y: 360, w: 380, h: 220 },
      { type: 'coaster',  x: 720,  y: 280, w: 980, h: 200 },
      { type: 'carousel', x: 1340, y: 380, r: 110 },
      { type: 'ferris',   x: 1980, y: 400, r: 200, tilt: 0.05 },
    ];
    this.midSilhouettes   = [];
    this.lanternPosts     = [];
    this.stringLightLines = [];
    this.benches          = [];
    this.trashCans        = [];
    this.cones            = [];
    this.concretePatches  = [];
    this.grassTufts       = [];
    this.litter           = [];

    // Hero props (verbatim from artifact)
    this.bobaStand = {
      x: 1100, y: 720, w: 320, h: 200,
      signGlow: 0,
      interiorPhase: 0,
      wrong: 0,        // 0=cozy warm, 1=sickly green
      wrongTimer: 360, // first scheduled tonal flicker
      steamPhase: 0,
    };
    this.streetlamp = {
      x: 1620, y: 1080,
      glow: 1.0,
      handPhase: 0,
      handFade: 0,     // hand silhouette inside glass — fades in/out
    };
    this.balloon = {
      x: 580, y: 760,
      bobPhase: 0,
      shadowOffsetX: -50, shadowOffsetY: 12, // wrong drop-shadow detail
    };

    // Particle systems (verbatim counts)
    this.fireflies     = [];
    this.spiritMotes   = [];
    this.fogPuffsBack  = [];
    this.fogPuffsFront = [];
    this.dustMotes     = [];
    this.burstParticles = [];

    // HUD state
    this.hud = { titleAlpha: 1, introHintT: 600 };

    // t accumulator for animation phases
    this.t = 0;

    this._buildWorld();
    this._buildParticles();
  }

  // ---------- buildWorld — verbatim placements from artifact ----------
  _buildWorld() {
    const r = rng(73);

    // Other food stand silhouettes (the 7 stands not yet built)
    const standSpots = [
      [340, 640], [600, 660], [860, 650], [1500, 660],
      [1740, 640], [1980, 660], [2200, 650],
    ];
    for (const [x, y] of standSpots) {
      this.midSilhouettes.push({
        x, y, w: 150 + r() * 60, h: 110 + r() * 30, accent: r(),
      });
    }

    // Lantern posts (warm pools) — line the path
    const postSpots = [
      [380, 1130], [780, 1300], [1480, 1090], [1820, 1300],
      [2160, 1180], [560, 1480], [1180, 1520], [1660, 1470],
    ];
    for (const p of postSpots) {
      this.lanternPosts.push({ x: p[0], y: p[1], h: 180, sway: r() * Math.PI * 2, hue: r() });
    }
    this.stringLightLines.push([0, 2], [2, 4], [5, 6], [6, 7]);

    // Benches
    this.benches.push({ x: 690,  y: 1240, broken: true,  rot: -0.04 });
    this.benches.push({ x: 1620, y: 1330, broken: false, rot: 0.02 });
    this.benches.push({ x: 460,  y: 1380, broken: false, rot: 0 });
    this.benches.push({ x: 2010, y: 1220, broken: true,  rot: 0.18 });
    this.benches.push({ x: 1380, y: 1450, broken: false, rot: -0.01 });
    this.benches.push({ x: 880,  y: 1500, broken: false, rot: 0.03 });

    // Trash cans (some knocked over)
    this.trashCans.push({ x: 540,  y: 1180, knocked: false });
    this.trashCans.push({ x: 1300, y: 1200, knocked: false });
    this.trashCans.push({ x: 1740, y: 1240, knocked: true });
    this.trashCans.push({ x: 2080, y: 1340, knocked: false });
    this.trashCans.push({ x: 940,  y: 1430, knocked: false });
    this.trashCans.push({ x: 1530, y: 1530, knocked: true });
    this.trashCans.push({ x: 360,  y: 1560, knocked: false });

    // Cones
    for (let i = 0; i < 9; i++) {
      this.cones.push({
        x: 250 + r() * (WORLD_W - 500),
        y: 1180 + r() * 360,
        lean: (r() - 0.5) * 0.4,
      });
    }

    // Concrete patches (cracked tiles in the dirt)
    for (let i = 0; i < 22; i++) {
      this.concretePatches.push({
        x: r() * WORLD_W,
        y: 1080 + r() * (WORLD_H - 1180),
        w: 90 + r() * 160, h: 60 + r() * 90,
        rot: (r() - 0.5) * 0.3,
        cracks: 2 + Math.floor(r() * 4),
      });
    }

    // Grass tufts (mostly dead)
    for (let i = 0; i < 240; i++) {
      this.grassTufts.push({
        x: r() * WORLD_W,
        y: 1060 + r() * (WORLD_H - 1140),
        h: 5 + r() * 9,
        sway: r() * Math.PI * 2,
        lean: (r() - 0.5) * 0.6,
        dead: r() < 0.6,
      });
    }

    // Litter — lots, makes the ground feel lived-in / abandoned
    const litterKinds = ['paper', 'cup', 'ticket', 'flyer', 'popcorn'];
    for (let i = 0; i < 220; i++) {
      this.litter.push({
        x: r() * WORLD_W,
        y: 1080 + r() * (WORLD_H - 1180),
        kind: litterKinds[Math.floor(r() * litterKinds.length)],
        rot: r() * Math.PI * 2,
        size: 0.7 + r() * 0.7,
      });
    }
  }

  _buildParticles() {
    for (let i = 0; i < 90; i++) {
      this.fireflies.push({
        x: Math.random() * WORLD_W,
        y: 200 + Math.random() * (WORLD_H - 350),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.04 + Math.random() * 0.04,
      });
    }

    const spiritColors = [PAL.spiritPink, PAL.spiritGreen, PAL.spiritPurp, PAL.spiritBlue];
    for (let i = 0; i < 50; i++) {
      this.spiritMotes.push({
        x: Math.random() * WORLD_W,
        y: 200 + Math.random() * (WORLD_H - 350),
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.05 - Math.random() * 0.16,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
        color: spiritColors[i % spiritColors.length],
        size: 2 + Math.random() * 2.4,
      });
    }

    for (let i = 0; i < 16; i++) {
      this.fogPuffsBack.push({
        x: Math.random() * WORLD_W,
        y: 280 + Math.random() * 600,
        r: 220 + Math.random() * 260,
        vx: -0.08 - Math.random() * 0.10,
        alpha: 0.06 + Math.random() * 0.06,
      });
    }
    for (let i = 0; i < 12; i++) {
      this.fogPuffsFront.push({
        x: Math.random() * WORLD_W,
        y: 850 + Math.random() * (WORLD_H - 950),
        r: 160 + Math.random() * 220,
        vx: -0.18 - Math.random() * 0.18,
        alpha: 0.05 + Math.random() * 0.04,
      });
    }
    for (let i = 0; i < 130; i++) {
      this.dustMotes.push({
        x: Math.random() * WORLD_W,
        y: Math.random() * WORLD_H,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -0.04 - Math.random() * 0.12,
        life: Math.random() * 200,
        size: 0.5 + Math.random() * 1.2,
      });
    }
  }

  // ============================================================
  // UPDATE
  // ============================================================
  update(dt) {
    this.t += dt;
    this._updatePlayer(this.t);
    this._updateCamera();
    this._updateWorld(this.t, dt);
    this._updateParticles(this.t);
    Input.endFrame();
  }

  _updatePlayer(t) {
    let dx = 0, dy = 0;
    if (Input.isDown('left'))  dx -= 1;
    if (Input.isDown('right')) dx += 1;
    if (Input.isDown('up'))    dy -= 1;
    if (Input.isDown('down'))  dy += 1;
    if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }

    const tx = dx * this.player.speed;
    const ty = dy * this.player.speed;
    this.player.vx = Juice.lerp(this.player.vx, tx, 0.25);
    this.player.vy = Juice.lerp(this.player.vy, ty, 0.25);
    if (dx !== 0) this.player.facing = dx > 0 ? 1 : -1;

    this.player.x += this.player.vx;
    this.player.y += this.player.vy;
    this.player.x = clamp(this.player.x, 60, WORLD_W - 60);
    this.player.y = clamp(this.player.y, 1000, WORLD_H - 80);

    const moving = Math.abs(this.player.vx) + Math.abs(this.player.vy) > 0.4;
    if (moving) {
      this.player.walkPhase += 0.18;
      this.player._stepTimer++;
      if (this.player._stepTimer > 16) {
        if (Sound.play) Sound.play('click'); // tiny tap; engine sound API
        this.player._stepTimer = 0;
      }
    } else {
      this.player.walkPhase = 0;
      this.player._stepTimer = 0;
    }
  }

  _updateCamera() {
    this.camera.tx = clamp(this.player.x - W / 2, 0, WORLD_W - W);
    this.camera.ty = clamp(this.player.y - H / 2, 0, WORLD_H - H);
    this.camera.x = Juice.lerp(this.camera.x, this.camera.tx, 0.12);
    this.camera.y = Juice.lerp(this.camera.y, this.camera.ty, 0.12);
  }

  _updateWorld(t, dt) {
    const b = this.bobaStand;

    // Sign glow brightens when the player is near
    const dx = this.player.x - (b.x + b.w / 2);
    const dy = this.player.y - (b.y + b.h);
    const dist = Math.hypot(dx, dy);
    const target = dist < 260 ? clamp(1 - dist / 260, 0, 1) : 0;
    b.signGlow = Juice.lerp(b.signGlow, target, 0.08);
    b.steamPhase += 0.02;

    // Tonal flicker — every ~30s the stand briefly turns "wrong"
    b.wrongTimer--;
    if (Input.wasPressed('action')) {
      b.wrong = 1;
      b.wrongTimer = 90;
    }
    if (b.wrongTimer === 0 && b.wrong < 0.5) {
      b.wrong = 1;
      b.wrongTimer = 90;
    } else if (b.wrongTimer < 0) {
      b.wrong = Math.max(0, b.wrong - 0.04);
      if (b.wrong <= 0.01) {
        b.wrong = 0;
        b.wrongTimer = 1500 + Math.random() * 800;
      }
    }

    // Streetlamp hand silhouette — fades in/out very subtly
    const s = this.streetlamp;
    s.handPhase += 0.005;
    const targetHand = (Math.sin(s.handPhase * 0.4) > 0.92) ? 0.65 : 0;
    s.handFade = Juice.lerp(s.handFade, targetHand, 0.04);

    // Balloon drift
    this.balloon.x -= 0.08;
    this.balloon.bobPhase += 0.02;
    if (this.balloon.x < -50) this.balloon.x = WORLD_W + 50;

    if (this.hud.introHintT > 0) this.hud.introHintT--;
  }

  _updateParticles(t) {
    for (const f of this.fireflies) {
      f.x += f.vx; f.y += f.vy;
      f.vx += (Math.random() - 0.5) * 0.05;
      f.vy += (Math.random() - 0.5) * 0.05;
      f.vx = clamp(f.vx, -0.6, 0.6);
      f.vy = clamp(f.vy, -0.6, 0.6);
      if (f.x < 0) f.x = WORLD_W;
      if (f.x > WORLD_W) f.x = 0;
      if (f.y < 200) f.y = WORLD_H - 200;
      if (f.y > WORLD_H - 200) f.y = 200;
    }
    for (const m of this.spiritMotes) {
      m.x += m.vx + Math.sin(t * 0.001 + m.phase) * 0.08;
      m.y += m.vy;
      if (m.y < 200) { m.y = WORLD_H - 200; m.x = Math.random() * WORLD_W; }
      if (m.x < 0) m.x = WORLD_W;
      if (m.x > WORLD_W) m.x = 0;
    }
    for (const f of this.fogPuffsBack) {
      f.x += f.vx;
      if (f.x < -f.r) f.x = WORLD_W + f.r;
    }
    for (const f of this.fogPuffsFront) {
      f.x += f.vx;
      if (f.x < -f.r) f.x = WORLD_W + f.r;
    }
    for (const d of this.dustMotes) {
      d.x += d.vx; d.y += d.vy;
      d.life++;
      if (d.life > 240 || d.y < 200) {
        d.x = Math.random() * WORLD_W;
        d.y = WORLD_H - 100;
        d.vx = (Math.random() - 0.5) * 0.18;
        d.vy = -0.04 - Math.random() * 0.12;
        d.life = 0;
      }
    }
    this.burstParticles = this.burstParticles.filter(p => p.life > 0);
    for (const p of this.burstParticles) {
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.92; p.vy *= 0.92; p.vy += 0.05;
      p.life--;
    }
  }

  // ============================================================
  // RENDER — strict 23-step layer order from the artifact
  // ============================================================
  render() {
    const { ctx } = this;
    const t = this.t;

    const sh = Juice.shakeOffset();
    ctx.save();
    ctx.translate(sh.x, sh.y);

    this._drawSkyGradient();              // 1
    this._drawDistantRides(t);            // 2
    this._drawFogBack(t);                 // 3
    this._drawMidSilhouettes(t);          // 4
    this._drawConcretePatches();          // 5
    this._drawGrassTufts(t);              // 6
    this._drawLitter(t);                  // 7
    this._drawCones();                    // 8
    this._drawTrashCans(t);               // 9
    this._drawBenches();                  // 10
    this._drawLanternPosts(t);            // 11
    this._drawBobaStand(t);               // 12
    this._drawStreetlamp(t);              // 13
    this._drawBalloon(t);                 // 14
    this._drawPlayer(t);                  // 15  ← existing player
    this._drawLightPools(t);              // 16
    this._drawFireflies(t);               // 17
    this._drawSpiritMotes(t);             // 18
    this._drawBurstParticles();           // 19
    this._drawFogFront(t);                // 20
    this._drawDustMotes();                // 21
    this._drawVignette();                 // 22

    ctx.restore();

    // 23. UI (no shake, no atmosphere applied)
    this._drawTitle(t);
    this._drawHint(t);
  }

  // ---------- helpers (verbatim from artifact) ----------
  _roundRect(x, y, w, h, r) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  }

  /* ---------- 1. SKY GRADIENT (smooth horizon bleed) ---------- */
  _drawSkyGradient() {
    const ctx = this.ctx;
    const camY = this.camera.y;

    // Sky band — world y = 0 to SKY_BOTTOM (above the walkable area)
    const SKY_BOTTOM = 1000;
    const skyTopScreen = -camY;
    const skyBottomScreen = SKY_BOTTOM - camY;

    if (skyBottomScreen > 0) {
      const g = ctx.createLinearGradient(0, skyTopScreen, 0, skyBottomScreen);
      g.addColorStop(0,    PAL.skyTop);
      g.addColorStop(0.45, PAL.skyMid);
      g.addColorStop(0.85, PAL.skyBottom);
      g.addColorStop(1,    PAL.skyHaze);
      ctx.fillStyle = g;
      const yStart = Math.max(0, skyTopScreen);
      const yEnd = Math.min(H, skyBottomScreen);
      ctx.fillRect(0, yStart, W, yEnd - yStart);

      // Sickly green horizon tint (additive, lower portion of sky band)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const tintStartScreen = (SKY_BOTTOM - 200) - camY;
      if (tintStartScreen < H) {
        const gg = ctx.createLinearGradient(0, tintStartScreen, 0, skyBottomScreen);
        gg.addColorStop(0, 'rgba(0,0,0,0)');
        gg.addColorStop(1, 'rgba(108, 168, 90, 0.18)');
        ctx.fillStyle = gg;
        const tStart = Math.max(0, tintStartScreen);
        const tEnd = Math.min(H, skyBottomScreen);
        if (tEnd > tStart) ctx.fillRect(0, tStart, W, tEnd - tStart);
      }
      ctx.restore();
    }

    // Solid ground fill — world y >= GROUND_TOP, always covers visible ground.
    const GROUND_TOP = 850; // slight overlap with sky bottom for the bleed
    const groundTopScreen = GROUND_TOP - camY;
    if (groundTopScreen < H) {
      ctx.fillStyle = PAL.groundDark;
      const yStart = Math.max(0, groundTopScreen);
      ctx.fillRect(0, yStart, W, H - yStart);
    }

    // Horizon bleed — sits ON TOP of the solid ground for a smooth transition.
    const bleedTopScreen = GROUND_TOP - camY;
    const bleedBottomScreen = (GROUND_TOP + 350) - camY;
    if (bleedBottomScreen > 0 && bleedTopScreen < H) {
      const g = ctx.createLinearGradient(0, bleedTopScreen, 0, bleedBottomScreen);
      g.addColorStop(0,    'rgba(58, 36, 88, 0)');
      g.addColorStop(0.18, PAL.groundFar);
      g.addColorStop(0.55, PAL.groundMid);
      g.addColorStop(1,    PAL.groundDark);
      ctx.fillStyle = g;
      const yStart = Math.max(0, bleedTopScreen);
      const yEnd = Math.min(H, bleedBottomScreen);
      if (yEnd > yStart) ctx.fillRect(0, yStart, W, yEnd - yStart);
    }
  }

  /* ---------- 2. DISTANT RIDES (parallax silhouettes) ---------- */
  _drawDistantRides(t) {
    for (const ride of this.distantRides) {
      const wx = ride.x - this.camera.x * 0.55;
      const wy = ride.y - this.camera.y * 0.45;
      if (ride.type === 'ferris') this._drawFerrisWheel(wx, wy, ride.r, ride.tilt, t);
      else if (ride.type === 'coaster')  this._drawCoaster(wx, wy, ride.w, ride.h, t);
      else if (ride.type === 'tent')     this._drawBigTent(wx, wy, ride.w, ride.h);
      else if (ride.type === 'carousel') this._drawCarousel(wx, wy, ride.r, t);
    }
  }

  _drawFerrisWheel(cx, cy, r, tilt, t) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);

    // Support struts coming up from ground
    ctx.strokeStyle = PAL.rideStrut;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, r + 280);
    ctx.lineTo(0, 0);
    ctx.moveTo(r * 0.8, r + 280);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // Outer ring
    ctx.strokeStyle = PAL.rideMid;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = PAL.rideNear; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, r - 10, 0, Math.PI * 2); ctx.stroke();

    // Spokes
    ctx.strokeStyle = PAL.rideStrut;
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 12; i++) {
      const a = i * (Math.PI * 2 / 12) + t * 0.00006;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.stroke();
    }

    // Cabins
    for (let i = 0; i < 12; i++) {
      const a = i * (Math.PI * 2 / 12) + t * 0.00006;
      const tx = Math.cos(a) * r, ty = Math.sin(a) * r;
      ctx.fillStyle = PAL.rideMid;
      ctx.fillRect(tx - 6, ty + 2, 12, 8);
      if (i % 4 === 0) {
        ctx.fillStyle = 'rgba(255, 138, 204, 0.55)';
        ctx.fillRect(tx - 1, ty - 1, 2, 2);
      }
    }

    // Center hub
    ctx.fillStyle = PAL.rideStrut;
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  _drawCoaster(cx, cy, w, h, t) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);

    // Lattice support beams
    ctx.strokeStyle = PAL.rideBeam;
    ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const x = -w / 2 + i * (w / 8);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (i % 2 === 0 ? 6 : -6), h * 1.4);
      ctx.stroke();
    }

    // Cross-bracing
    ctx.strokeStyle = PAL.rideMid;
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 8; i++) {
      const x = -w / 2 + i * (w / 8);
      ctx.beginPath();
      ctx.moveTo(x, 30);
      ctx.lineTo(x + w / 8, h * 0.6);
      ctx.moveTo(x + w / 8, 30);
      ctx.lineTo(x, h * 0.6);
      ctx.stroke();
    }

    // Wavy track
    ctx.strokeStyle = PAL.rideStrut;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let x = -w / 2; x <= w / 2; x += 6) {
      const localT = (x + w / 2) / w;
      const y = -Math.sin(localT * Math.PI * 1.8) * h * 0.5
              - Math.sin(localT * Math.PI * 4) * h * 0.18;
      if (x === -w / 2) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Inner rail
    ctx.strokeStyle = PAL.rideRust;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = -w / 2; x <= w / 2; x += 6) {
      const localT = (x + w / 2) / w;
      const y = -Math.sin(localT * Math.PI * 1.8) * h * 0.5
              - Math.sin(localT * Math.PI * 4) * h * 0.18 + 6;
      if (x === -w / 2) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.restore();
  }

  _drawBigTent(cx, cy, w, h) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);

    ctx.fillStyle = PAL.rideMid;
    ctx.beginPath();
    ctx.moveTo(-w / 2, h);
    ctx.lineTo(-w / 2, h * 0.4);
    ctx.bezierCurveTo(-w / 4, h * 0.5, -w * 0.1, h * 0.55, 0, h * 0.5);
    ctx.bezierCurveTo(w * 0.1, h * 0.55, w / 4, h * 0.5, w / 2, h * 0.4);
    ctx.lineTo(w / 2, h);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = PAL.rideNear;
    ctx.beginPath();
    ctx.moveTo(-w * 0.42, h * 0.5);
    ctx.lineTo(-w * 0.18, 0);
    ctx.lineTo(0, h * 0.5);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, h * 0.5);
    ctx.lineTo(w * 0.18, 0);
    ctx.lineTo(w * 0.42, h * 0.5);
    ctx.closePath(); ctx.fill();

    ctx.strokeStyle = PAL.rideStrut;
    ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * w * 0.08 - w * 0.18, 0);
      ctx.lineTo(i * w * 0.08 - w * 0.18 - w * 0.04, h * 0.5);
      ctx.stroke();
    }

    ctx.fillStyle = PAL.bloodBoba;
    ctx.beginPath();
    ctx.moveTo(-w * 0.18, 0);
    ctx.lineTo(-w * 0.18, -28);
    ctx.lineTo(-w * 0.10, -22);
    ctx.lineTo(-w * 0.18, -16);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = PAL.rideStrut;
    ctx.fillRect(w * 0.18 - 1, -22, 2, 22);

    ctx.fillStyle = PAL.groundDark;
    ctx.beginPath();
    ctx.moveTo(-14, h);
    ctx.lineTo(-10, h * 0.55);
    ctx.lineTo(10, h * 0.55);
    ctx.lineTo(14, h);
    ctx.closePath(); ctx.fill();

    ctx.restore();
  }

  _drawCarousel(cx, cy, r, t) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);

    ctx.fillStyle = PAL.rideStrut;
    ctx.fillRect(-3, -r * 1.1, 6, r * 2.2);

    ctx.fillStyle = PAL.rideNear;
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(0, -r * 0.9);
    ctx.lineTo(r, 0);
    ctx.closePath(); ctx.fill();

    ctx.strokeStyle = PAL.rideStrut;
    ctx.lineWidth = 0.8;
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * r * 0.2, 0);
      ctx.lineTo(0, -r * 0.9);
      ctx.stroke();
    }

    ctx.fillStyle = PAL.rideMid;
    ctx.fillRect(-r * 1.05, -2, r * 2.1, 6);

    ctx.fillStyle = PAL.rideFar;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.2, r * 0.95, r * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PAL.rideStrut;
    for (let i = 0; i < 6; i++) {
      const a = i * (Math.PI * 2 / 6) + t * 0.0001;
      const px = Math.cos(a) * r * 0.85;
      const py = Math.sin(a) * r * 0.18;
      if (Math.sin(a) > -0.2) {
        ctx.beginPath();
        ctx.ellipse(px, py - 18, 8, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(px - 6, py - 28, 12, 4);
        ctx.fillRect(px - 1, py - 36, 2, 8);
      }
    }
    ctx.strokeStyle = PAL.rideMid;
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const a = i * (Math.PI * 2 / 6) + t * 0.0001;
      if (Math.sin(a) > -0.2) {
        const px = Math.cos(a) * r * 0.85;
        ctx.beginPath();
        ctx.moveTo(px, -2);
        ctx.lineTo(px, r * 0.2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  /* ---------- 3. FOG (back layer) ---------- */
  _drawFogBack(t) {
    const ctx = this.ctx;
    ctx.save();
    for (const f of this.fogPuffsBack) {
      const wx = f.x - this.camera.x * 0.85;
      const wy = f.y - this.camera.y * 0.85;
      if (wx < -300 || wx > W + 300 || wy < -300 || wy > H + 100) continue;
      const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, f.r);
      g.addColorStop(0, `rgba(110, 90, 150, ${f.alpha})`);
      g.addColorStop(1, 'rgba(110, 90, 150, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(wx, wy, f.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  /* ---------- 4. MID SILHOUETTES ---------- */
  _drawMidSilhouettes(t) {
    const ctx = this.ctx;
    for (const s of this.midSilhouettes) {
      const wx = s.x - this.camera.x * 0.85;
      const wy = s.y - this.camera.y * 0.7;
      if (wx + s.w < -50 || wx > W + 50 || wy > H) continue;

      ctx.fillStyle = PAL.rideMid;
      this._roundRect(wx, wy, s.w, s.h, 4); ctx.fill();

      ctx.fillStyle = PAL.rideNear;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        ctx.moveTo(wx + i * (s.w / 5), wy);
        ctx.lineTo(wx + i * (s.w / 5) + s.w / 10, wy - 14);
        ctx.lineTo(wx + (i + 1) * (s.w / 5), wy);
      }
      ctx.fill();

      ctx.fillStyle = PAL.groundDark;
      ctx.fillRect(wx + s.w * 0.15, wy + s.h * 0.3, s.w * 0.7, s.h * 0.25);

      if (s.accent < 0.4) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const accentColor = s.accent < 0.2 ? 'rgba(255, 138, 204,' : 'rgba(168, 240, 138,';
        const g = ctx.createRadialGradient(wx + s.w * 0.5, wy + s.h * 0.4, 0, wx + s.w * 0.5, wy + s.h * 0.4, 60);
        g.addColorStop(0, accentColor + '0.35)');
        g.addColorStop(1, accentColor + '0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(wx + s.w * 0.5, wy + s.h * 0.4, 60, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }
  }

  /* ---------- 5. CONCRETE PATCHES ---------- */
  _drawConcretePatches() {
    const ctx = this.ctx;
    for (const p of this.concretePatches) {
      const wx = p.x - this.camera.x, wy = p.y - this.camera.y;
      if (wx + p.w < -20 || wx > W + 20 || wy + p.h < -20 || wy > H + 20) continue;
      ctx.save();
      ctx.translate(wx + p.w / 2, wy + p.h / 2);
      ctx.rotate(p.rot);
      ctx.fillStyle = PAL.concrete;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.fillStyle = PAL.concreteHi;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, 2);
      ctx.fillRect(-p.w / 2, -p.h / 2, 2, p.h);
      ctx.strokeStyle = PAL.concreteCrack;
      ctx.lineWidth = 1;
      for (let i = 0; i < p.cracks; i++) {
        ctx.beginPath();
        const sx = (Math.sin(i * 17.3 + p.x) - 0.5) * p.w * 0.7;
        const sy = (Math.cos(i * 11.7 + p.y) - 0.5) * p.h * 0.7;
        ctx.moveTo(sx, sy);
        for (let j = 0; j < 4; j++) {
          const nx = sx + (Math.sin(i * 31 + j * 7 + p.x) - 0.5) * p.w * 0.4;
          const ny = sy + (Math.cos(i * 23 + j * 9 + p.y) - 0.5) * p.h * 0.4;
          ctx.lineTo(nx, ny);
        }
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      ctx.ellipse(p.w * 0.1, p.h * 0.1, p.w * 0.18, p.h * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ---------- 6. GRASS TUFTS ---------- */
  _drawGrassTufts(t) {
    const ctx = this.ctx;
    for (const g of this.grassTufts) {
      const wx = g.x - this.camera.x, wy = g.y - this.camera.y;
      if (wx < -10 || wx > W + 10 || wy < -10 || wy > H + 10) continue;
      const sway = Math.sin(t * 0.001 + g.sway) * 1.5 + g.lean;
      ctx.strokeStyle = g.dead ? PAL.deadGrass : PAL.grass;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.quadraticCurveTo(wx + sway, wy - g.h * 0.6, wx + sway * 1.6, wy - g.h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(wx + 1, wy);
      ctx.quadraticCurveTo(wx + 2 + sway * 0.8, wy - g.h * 0.5, wx + 3 + sway * 1.4, wy - g.h * 0.85);
      ctx.stroke();
    }
  }

  /* ---------- 7. LITTER ---------- */
  _drawLitter(t) {
    const ctx = this.ctx;
    for (const l of this.litter) {
      const wx = l.x - this.camera.x, wy = l.y - this.camera.y;
      if (wx < -20 || wx > W + 20 || wy < -20 || wy > H + 20) continue;
      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(l.rot);
      ctx.scale(l.size, l.size);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(1, 2, 7, 2, 0, 0, Math.PI * 2); ctx.fill();
      if (l.kind === 'paper') {
        ctx.fillStyle = PAL.litterPaper;
        ctx.fillRect(-6, -4, 12, 8);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(-6, -4, 12, 1);
      } else if (l.kind === 'cup') {
        ctx.fillStyle = PAL.litterCup;
        ctx.beginPath();
        ctx.moveTo(-5, -4); ctx.lineTo(5, -4); ctx.lineTo(4, 5); ctx.lineTo(-4, 5); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(-4, -4, 8, 1);
        ctx.fillStyle = PAL.standStraw;
        ctx.fillRect(0, -8, 1, 6);
      } else if (l.kind === 'ticket') {
        ctx.fillStyle = PAL.litterTicket;
        ctx.fillRect(-7, -3, 14, 6);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(-3, -3, 1, 6);
        ctx.fillRect(2, -3, 1, 6);
      } else if (l.kind === 'flyer') {
        ctx.fillStyle = PAL.litterFlyer;
        ctx.fillRect(-5, -6, 10, 12);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(-4, -4, 8, 1);
        ctx.fillRect(-4, -1, 6, 1);
      } else if (l.kind === 'popcorn') {
        ctx.fillStyle = PAL.popcorn;
        for (let k = 0; k < 4; k++) {
          ctx.beginPath();
          ctx.arc(Math.sin(k * 1.3) * 3, Math.cos(k * 2.1) * 2, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  /* ---------- 8. CONES ---------- */
  _drawCones() {
    const ctx = this.ctx;
    for (const c of this.cones) {
      const wx = c.x - this.camera.x, wy = c.y - this.camera.y;
      if (wx < -40 || wx > W + 40 || wy < -40 || wy > H + 40) continue;
      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(c.lean);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(2, 4, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PAL.coneBase;
      ctx.beginPath();
      ctx.moveTo(-10, 4); ctx.lineTo(0, -22); ctx.lineTo(10, 4);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = PAL.coneStripe;
      ctx.fillRect(-7, -8, 14, 3);
      ctx.fillStyle = PAL.coneBase;
      ctx.fillRect(-12, 4, 24, 3);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(-12, 6, 24, 1);
      ctx.restore();
    }
  }

  /* ---------- 9. TRASH CANS ---------- */
  _drawTrashCans(t) {
    const ctx = this.ctx;
    for (const c of this.trashCans) {
      const wx = c.x - this.camera.x, wy = c.y - this.camera.y;
      if (wx < -40 || wx > W + 40 || wy < -60 || wy > H + 40) continue;
      ctx.save();
      ctx.translate(wx, wy);
      if (c.knocked) {
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(0, 18, 22, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(0, 16, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = PAL.canBody;
      this._roundRect(-15, -32, 30, 48, 3); ctx.fill();
      ctx.fillStyle = PAL.canBodyHi;
      ctx.fillRect(-13, -30, 3, 44);
      ctx.fillStyle = PAL.canRust;
      ctx.fillRect(-14, 0, 28, 3);
      ctx.fillRect(-12, -20, 6, 1);
      ctx.fillRect(4, -10, 6, 1);
      ctx.fillStyle = PAL.canBodyHi;
      ctx.fillRect(-16, -34, 32, 4);
      ctx.fillStyle = PAL.groundDark;
      ctx.fillRect(-13, -33, 26, 2);
      ctx.fillStyle = PAL.canBag;
      ctx.beginPath();
      ctx.ellipse(2, -34, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(-2, -36, 3, 1);

      if (c.knocked) {
        ctx.fillStyle = PAL.litterPaper;
        ctx.fillRect(20, -8, 8, 4);
        ctx.fillStyle = PAL.litterCup;
        ctx.fillRect(28, -2, 5, 5);
        ctx.fillStyle = PAL.popcorn;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(22 + i * 3, -12 + Math.sin(i) * 2, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  /* ---------- 10. BENCHES ---------- */
  _drawBenches() {
    const ctx = this.ctx;
    for (const b of this.benches) {
      const wx = b.x - this.camera.x, wy = b.y - this.camera.y;
      if (wx < -100 || wx > W + 100 || wy < -40 || wy > H + 40) continue;
      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(b.rot);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 16, 50, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PAL.benchMetal;
      ctx.fillRect(-46, -4, 6, 22);
      ctx.fillRect(40, -4, 6, 22);
      ctx.fillStyle = PAL.benchMetalH;
      ctx.fillRect(-46, -4, 1, 22);
      ctx.fillRect(40, -4, 1, 22);
      if (!b.broken) {
        ctx.fillStyle = PAL.benchWood;
        ctx.fillRect(-50, -8, 100, 6);
        ctx.fillStyle = PAL.benchWoodH;
        ctx.fillRect(-50, -8, 100, 1);
        ctx.fillStyle = PAL.benchWood;
        ctx.fillRect(-46, -28, 92, 5);
        ctx.fillStyle = PAL.benchWoodH;
        ctx.fillRect(-46, -28, 92, 1);
        ctx.fillStyle = PAL.benchMetal;
        ctx.fillRect(-44, -23, 2, 14);
        ctx.fillRect(42, -23, 2, 14);
      } else {
        ctx.fillStyle = PAL.benchWood;
        ctx.fillRect(-50, -8, 60, 6);
        ctx.fillStyle = PAL.benchWoodH;
        ctx.fillRect(-50, -8, 60, 1);
        ctx.fillStyle = PAL.benchWood;
        ctx.beginPath();
        ctx.moveTo(10, -2); ctx.lineTo(20, -10); ctx.lineTo(16, -2); ctx.closePath();
        ctx.fill();
        ctx.fillStyle = PAL.benchMetal;
        ctx.fillRect(20, 0, 18, 2);
      }
      ctx.restore();
    }
  }

  /* ---------- 11. LANTERN POSTS + STRING LIGHTS ---------- */
  _drawLanternPosts(t) {
    const ctx = this.ctx;
    for (const [i, j] of this.stringLightLines) {
      const a = this.lanternPosts[i], b = this.lanternPosts[j];
      if (!a || !b) continue;
      const ax = a.x - this.camera.x, ay = a.y - this.camera.y - a.h + 6;
      const bx = b.x - this.camera.x, by = b.y - this.camera.y - b.h + 6;
      if ((ax < -50 && bx < -50) || (ax > W + 50 && bx > W + 50)) continue;

      const sag = Math.hypot(bx - ax, by - ay) * 0.18;
      ctx.strokeStyle = PAL.bulbWire;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo((ax + bx) / 2, (ay + by) / 2 + sag, bx, by);
      ctx.stroke();

      const bulbCount = 8;
      for (let k = 1; k < bulbCount; k++) {
        const u = k / bulbCount;
        const mx = (1 - u) * (1 - u) * ax + 2 * (1 - u) * u * ((ax + bx) / 2) + u * u * bx;
        const my = (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * ((ay + by) / 2 + sag) + u * u * by;
        const colorPick = (k + i) % 3;
        const color = colorPick === 0 ? PAL.bulbWarm : colorPick === 1 ? PAL.bulbPink : PAL.bulbGreen;
        const flicker = 0.7 + 0.3 * Math.sin(t * 0.003 + k * 1.7 + i);
        ctx.fillStyle = color;
        ctx.globalAlpha = flicker;
        ctx.beginPath();
        ctx.arc(mx, my + 3, 2.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    for (const p of this.lanternPosts) {
      const wx = p.x - this.camera.x, wy = p.y - this.camera.y;
      if (wx < -40 || wx > W + 40 || wy < -p.h - 20 || wy > H + 20) continue;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.ellipse(wx, wy + 2, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PAL.lanternPost;
      ctx.fillRect(wx - 2, wy - p.h, 4, p.h);
      ctx.fillStyle = PAL.lanternPostHi;
      ctx.fillRect(wx - 2, wy - p.h, 1, p.h);
      ctx.fillStyle = PAL.lanternPost;
      ctx.fillRect(wx - 10, wy - p.h, 20, 3);
      const bulbColors = [PAL.bulbWarm, PAL.bulbPink, PAL.bulbGreen];
      const bulb = bulbColors[Math.floor(p.hue * 3)];
      const flicker = 0.85 + 0.15 * Math.sin(t * 0.004 + p.sway);
      ctx.fillStyle = bulb;
      ctx.globalAlpha = flicker;
      ctx.beginPath();
      ctx.arc(wx, wy - p.h - 4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- 12. BOBA STAND ---------- */
  _drawBobaStand(t) {
    const ctx = this.ctx;
    const b = this.bobaStand;
    const wx = b.x - this.camera.x, wy = b.y - this.camera.y;
    if (wx + b.w < -50 || wx > W + 50) return;
    const wrong = b.wrong;

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.ellipse(wx + b.w / 2, wy + b.h + 8, b.w * 0.55, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PAL.standWood;
    this._roundRect(wx, wy + 30, b.w, b.h, 4); ctx.fill();
    ctx.strokeStyle = PAL.standWoodLo;
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(wx + 4, wy + 50 + i * 28);
      ctx.lineTo(wx + b.w - 4, wy + 50 + i * 28 + Math.sin(i) * 4);
      ctx.stroke();
    }
    ctx.fillStyle = PAL.standWoodLo;
    ctx.fillRect(wx, wy + b.h + 26, b.w, 6);
    ctx.fillStyle = PAL.standWoodHi;
    ctx.fillRect(wx, wy + 30, b.w, 2);

    const counterX = wx + 20, counterY = wy + 70, counterW = b.w - 40, counterH = 80;
    ctx.fillStyle = PAL.standCounter;
    ctx.fillRect(counterX - 4, counterY - 4, counterW + 8, counterH + 8);

    const interiorGrad = ctx.createLinearGradient(0, counterY, 0, counterY + counterH);
    if (wrong > 0) {
      interiorGrad.addColorStop(0, PAL.standWrong);
      interiorGrad.addColorStop(0.5, PAL.standWrongHi);
      interiorGrad.addColorStop(1, PAL.standWrong);
    } else {
      interiorGrad.addColorStop(0, PAL.standInterior);
      interiorGrad.addColorStop(0.5, PAL.standInteriorHi);
      interiorGrad.addColorStop(1, PAL.standInterior);
    }
    ctx.fillStyle = interiorGrad;
    ctx.fillRect(counterX, counterY, counterW, counterH);

    ctx.fillStyle = wrong > 0 ? 'rgba(0,40,20,0.5)' : 'rgba(0,0,0,0.45)';
    ctx.fillRect(counterX + 8, counterY + 8, counterW - 16, 4);
    ctx.fillRect(counterX + 8, counterY + 32, counterW - 16, 4);

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(counterX + 16, counterY + 18, 22, 50);
    ctx.fillStyle = PAL.standPearl;
    for (let py = counterY + 30; py < counterY + 66; py += 6) {
      for (let px = counterX + 18; px < counterX + 36; px += 6) {
        ctx.beginPath();
        ctx.arc(px + (py % 12 === 0 ? 0 : 3), py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 5; i++) {
      const cx = counterX + 60 + i * 32;
      ctx.fillStyle = PAL.standCup;
      ctx.fillRect(cx, counterY + 24, 20, 28);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(cx, counterY + 24, 20, 2);
      ctx.fillStyle = i % 2 === 0 ? PAL.standStraw : PAL.green;
      ctx.fillRect(cx + 8, counterY + 14, 2, 14);
    }

    ctx.fillStyle = 'rgba(20,16,28,0.85)';
    ctx.fillRect(counterX + counterW - 36, counterY + 32, 14, 30);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(counterX + counterW - 35, counterY + 33, 2, 26);

    ctx.fillStyle = PAL.standCounterHi;
    ctx.fillRect(counterX - 6, counterY + counterH - 4, counterW + 12, 8);
    ctx.fillStyle = PAL.standWoodLo;
    ctx.fillRect(counterX - 6, counterY + counterH + 4, counterW + 12, 2);

    const awningY = wy + 14;
    const stripes = 8;
    const stripeW = b.w / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? PAL.standAwningP : PAL.standAwningG;
      ctx.beginPath();
      ctx.moveTo(wx + i * stripeW, awningY);
      ctx.lineTo(wx + (i + 1) * stripeW, awningY);
      ctx.lineTo(wx + (i + 1) * stripeW, awningY + 24);
      ctx.lineTo(wx + i * stripeW + stripeW / 2, awningY + 32);
      ctx.lineTo(wx + i * stripeW, awningY + 24);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = PAL.standAwningD;
    ctx.beginPath();
    ctx.moveTo(wx, awningY + 24);
    for (let i = 0; i < stripes; i++) {
      ctx.lineTo(wx + i * stripeW + stripeW / 2, awningY + 32);
      ctx.lineTo(wx + (i + 1) * stripeW, awningY + 24);
    }
    ctx.lineTo(wx + b.w, awningY + 28);
    ctx.lineTo(wx, awningY + 28);
    ctx.closePath();
    ctx.globalAlpha = 0.4; ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(wx, awningY, b.w, 2);

    ctx.fillStyle = PAL.standCounter;
    this._roundRect(wx + b.w * 0.18, wy - 28, b.w * 0.64, 36, 4); ctx.fill();
    const glow = b.signGlow;
    ctx.save();
    ctx.font = 'bold 22px VT323, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = PAL.standNeon;
    ctx.shadowBlur = 20 + glow * 12;
    ctx.fillStyle = PAL.standNeonGlow;
    ctx.fillText('BOBAAAAAH', wx + b.w / 2, wy - 10);
    ctx.shadowBlur = 8 + glow * 6;
    ctx.fillStyle = PAL.standNeon;
    ctx.fillText('BOBAAAAAH', wx + b.w / 2, wy - 10);
    ctx.restore();

    ctx.fillStyle = PAL.standWoodLo;
    ctx.fillRect(wx + b.w * 0.18 - 2, wy - 28, 2, 50);
    ctx.fillRect(wx + b.w * 0.82, wy - 28, 2, 50);

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = wrong > 0 ? 'rgba(168, 240, 138, 0.35)' : 'rgba(255, 220, 180, 0.35)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) {
      const sx = counterX + 30 + i * 70;
      const sy = counterY;
      const off = Math.sin(t * 0.003 + i + b.steamPhase) * 6;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx + off, sy - 16, sx + off / 2, sy - 32);
      ctx.quadraticCurveTo(sx + off + 4, sy - 50, sx + off / 2, sy - 70);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ---------- 13. STREETLAMP (procedural verdigris) ---------- */
  _drawStreetlamp(t) {
    const ctx = this.ctx;
    const s = this.streetlamp;
    const wx = s.x - this.camera.x, wy = s.y - this.camera.y;
    if (wx < -100 || wx > W + 100 || wy < -200 || wy > H + 100) return;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.ellipse(wx, wy + 4, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const postH = 220;
    const postTopY = wy - postH;

    ctx.fillStyle = PAL.lampPost;
    ctx.fillRect(wx - 5, postTopY + 30, 10, postH - 30);
    ctx.fillStyle = PAL.lampPostHi;
    ctx.fillRect(wx - 5, postTopY + 30, 2, postH - 30);
    ctx.fillStyle = PAL.lampPostLo;
    ctx.fillRect(wx + 3, postTopY + 30, 2, postH - 30);

    ctx.fillStyle = PAL.lampPostLo;
    ctx.fillRect(wx - 12, wy - 8, 24, 8);
    ctx.fillStyle = PAL.lampPost;
    ctx.fillRect(wx - 10, wy - 16, 20, 8);
    ctx.fillStyle = PAL.lampPostHi;
    ctx.fillRect(wx - 8, wy - 22, 16, 6);

    ctx.fillStyle = PAL.lampPost;
    ctx.fillRect(wx - 9, postTopY + 110, 18, 5);
    ctx.fillStyle = PAL.lampPostHi;
    ctx.fillRect(wx - 9, postTopY + 110, 18, 1);
    ctx.fillStyle = PAL.lampPost;
    ctx.fillRect(wx - 18, postTopY + 90, 36, 4);
    ctx.fillStyle = PAL.lampPostLo;
    ctx.fillRect(wx - 18, postTopY + 92, 36, 2);
    ctx.fillStyle = PAL.lampBrass;
    ctx.beginPath(); ctx.arc(wx - 18, postTopY + 92, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(wx + 18, postTopY + 92, 3, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = PAL.lampPost;
    ctx.beginPath();
    ctx.moveTo(wx - 6, postTopY + 30);
    ctx.lineTo(wx - 12, postTopY + 12);
    ctx.lineTo(wx + 12, postTopY + 12);
    ctx.lineTo(wx + 6, postTopY + 30);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = PAL.lampPostHi;
    ctx.fillRect(wx - 12, postTopY + 12, 24, 1);

    const lx = wx, ly = postTopY - 20;
    ctx.fillStyle = PAL.lampPostLo;
    ctx.beginPath();
    ctx.moveTo(lx - 14, ly + 32);
    ctx.lineTo(lx - 18, ly);
    ctx.lineTo(lx + 18, ly);
    ctx.lineTo(lx + 14, ly + 32);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = PAL.lampBrass;
    ctx.fillRect(lx - 18, ly - 4, 36, 4);
    ctx.fillRect(lx - 14, ly + 30, 28, 4);

    ctx.fillStyle = PAL.lampGlass;
    ctx.beginPath();
    ctx.moveTo(lx - 12, ly + 28);
    ctx.lineTo(lx - 16, ly + 2);
    ctx.lineTo(lx + 16, ly + 2);
    ctx.lineTo(lx + 12, ly + 28);
    ctx.closePath(); ctx.fill();

    ctx.save();
    ctx.globalAlpha = s.handFade;
    ctx.fillStyle = PAL.lampHand;
    ctx.beginPath();
    ctx.moveTo(lx - 6, ly + 26);
    ctx.lineTo(lx - 6, ly + 14);
    ctx.lineTo(lx - 4, ly + 8);
    ctx.lineTo(lx - 2, ly + 6);
    ctx.lineTo(lx, ly + 6);
    ctx.lineTo(lx + 2, ly + 6);
    ctx.lineTo(lx + 4, ly + 8);
    ctx.lineTo(lx + 6, ly + 14);
    ctx.lineTo(lx + 6, ly + 26);
    ctx.closePath(); ctx.fill();
    ctx.fillRect(lx - 4, ly + 24, 8, 4);
    ctx.restore();

    ctx.strokeStyle = PAL.lampBrass;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(lx - 16, ly + 14); ctx.lineTo(lx + 16, ly + 14);
    ctx.moveTo(lx, ly + 2); ctx.lineTo(lx, ly + 28);
    ctx.stroke();

    ctx.fillStyle = PAL.lampPost;
    ctx.beginPath();
    ctx.moveTo(lx - 16, ly - 4);
    ctx.lineTo(lx - 12, ly - 16);
    ctx.lineTo(lx + 12, ly - 16);
    ctx.lineTo(lx + 16, ly - 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = PAL.lampBrass;
    ctx.fillRect(lx - 2, ly - 22, 4, 8);
    ctx.beginPath(); ctx.arc(lx, ly - 24, 3, 0, Math.PI * 2); ctx.fill();
  }

  /* ---------- 14. BALLOON (wrong-shadow detail) ---------- */
  _drawBalloon(t) {
    const ctx = this.ctx;
    const b = this.balloon;
    const wx = b.x - this.camera.x;
    const wy = b.y - this.camera.y + Math.sin(b.bobPhase) * 6;
    if (wx < -60 || wx > W + 60) return;

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(
      wx + b.shadowOffsetX,
      wy + b.shadowOffsetY + 280,
      18, 5, 0, 0, Math.PI * 2,
    );
    ctx.fill();

    ctx.strokeStyle = PAL.balloonString;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(wx, wy + 22);
    ctx.quadraticCurveTo(wx + Math.sin(t * 0.001) * 6, wy + 80, wx - 4, wy + 140);
    ctx.stroke();

    ctx.fillStyle = PAL.balloonPink;
    ctx.beginPath();
    ctx.ellipse(wx, wy, 18, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.balloonPinkHi;
    ctx.beginPath();
    ctx.ellipse(wx - 6, wy - 8, 5, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.balloonPink;
    ctx.beginPath();
    ctx.moveTo(wx - 3, wy + 20);
    ctx.lineTo(wx, wy + 26);
    ctx.lineTo(wx + 3, wy + 20);
    ctx.closePath();
    ctx.fill();
  }

  /* ---------- 15. PLAYER (existing top-down food critic) ---------- */
  // Existing code preserved verbatim from prior phase. The artifact's
  // procedural placeholder is replaced by this draw at the same layer.
  _drawPlayer(t) {
    const ctx = this.ctx;
    const wx = this.player.x - this.camera.x;
    const wy = this.player.y - this.camera.y;

    const moving = Math.abs(this.player.vx) + Math.abs(this.player.vy) > 0.4;
    const phase = this.player.walkPhase;
    const idleBob = Math.sin(this.player.bobPhase) * 0.8;
    const walkBob = moving ? Math.abs(Math.sin(phase * 2)) * 1.6 : 0;
    const bob = moving ? walkBob : idleBob;

    ctx.save();
    ctx.translate(wx, wy - bob);

    // Drop shadow ellipse
    ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 11, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    const legSwing = moving ? Math.sin(phase) * 3 : 0;
    ctx.fillStyle = PAL.jeansShade;
    ctx.fillRect(-5, 4, 4, 12 - legSwing);
    ctx.fillStyle = PAL.jeans;
    ctx.fillRect(1, 4, 4, 12 + legSwing);
    ctx.fillStyle = PAL.sneakers;
    ctx.fillRect(-6, 14 - legSwing, 5, 4);
    ctx.fillRect(0,  14 + legSwing, 5, 4);
    ctx.fillStyle = PAL.sneakersDk;
    ctx.fillRect(-6, 17 - legSwing, 5, 1);
    ctx.fillRect(0,  17 + legSwing, 5, 1);

    ctx.scale(this.player.facing, 1);

    // Tee
    ctx.fillStyle = PAL.tee;
    ctx.beginPath();
    ctx.moveTo(-7, 4);
    ctx.lineTo(-8, -8);
    ctx.lineTo(8, -8);
    ctx.lineTo(7, 4);
    ctx.closePath();
    ctx.fill();
    // Apron
    ctx.fillStyle = PAL.apron;
    ctx.beginPath();
    ctx.moveTo(-6, 4);
    ctx.lineTo(-7, -4);
    ctx.lineTo(7, -4);
    ctx.lineTo(6, 4);
    ctx.closePath();
    ctx.fill();
    // Apron strap
    ctx.fillStyle = PAL.apronStrap;
    ctx.fillRect(-2, -10, 4, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(-3, -1, 6, 2);

    // Arms
    const armSwing = moving ? Math.sin(phase) * 2 : 0;
    ctx.fillStyle = PAL.tee;
    ctx.fillRect(-9, -6 + armSwing, 3, 8);
    ctx.fillRect( 6, -6 - armSwing, 3, 8);
    ctx.fillStyle = PAL.skin;
    ctx.fillRect(-9, 2 + armSwing, 3, 2);
    ctx.fillRect( 6, 2 - armSwing, 3, 2);

    // Head + hair
    ctx.fillStyle = PAL.hairBack;
    ctx.beginPath();
    ctx.ellipse(0, -14, 8, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.hairFront;
    ctx.beginPath();
    ctx.moveTo(-7, -14);
    ctx.quadraticCurveTo(-9, -6, -6, -2);
    ctx.lineTo(-4, -2);
    ctx.quadraticCurveTo(-5, -8, -3, -14);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(7, -14);
    ctx.quadraticCurveTo(9, -6, 6, -2);
    ctx.lineTo(4, -2);
    ctx.quadraticCurveTo(5, -8, 3, -14);
    ctx.fill();
    ctx.strokeStyle = PAL.hairHi;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-3, -19);
    ctx.quadraticCurveTo(0, -21, 3, -19);
    ctx.stroke();
    ctx.fillStyle = PAL.skin;
    ctx.beginPath();
    ctx.ellipse(2, -10, 2, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /* ---------- 16. LIGHT POOLS (additive) ---------- */
  _drawLightPools(t) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Streetlamp warm pool
    {
      const wx = this.streetlamp.x - this.camera.x;
      const wy = this.streetlamp.y - this.camera.y - 220;
      const r = 220;
      const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, r);
      g.addColorStop(0,    'rgba(255, 220, 130, 0.65)');
      g.addColorStop(0.4,  'rgba(255, 200, 110, 0.22)');
      g.addColorStop(1,    'rgba(255, 180, 90, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(wx, wy, r, 0, Math.PI * 2); ctx.fill();

      const gx = this.streetlamp.x - this.camera.x;
      const gy = this.streetlamp.y - this.camera.y - 30;
      const gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, 140);
      gg.addColorStop(0, 'rgba(255, 200, 110, 0.45)');
      gg.addColorStop(1, 'rgba(255, 180, 90, 0)');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.ellipse(gx, gy, 140, 60, 0, 0, Math.PI * 2); ctx.fill();
    }

    // Boba stand neon sign pool
    {
      const wx = this.bobaStand.x - this.camera.x + this.bobaStand.w / 2;
      const wy = this.bobaStand.y - this.camera.y - 10;
      const intensity = 0.9 + 0.1 * Math.sin(t * 0.006) + this.bobaStand.signGlow * 0.4;
      const r = 200 + this.bobaStand.signGlow * 60;
      const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, r);
      g.addColorStop(0,    `rgba(255, 80, 200, ${0.55 * intensity})`);
      g.addColorStop(0.45, `rgba(255, 80, 200, ${0.18 * intensity})`);
      g.addColorStop(1,    'rgba(255, 80, 200, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(wx, wy, r, 0, Math.PI * 2); ctx.fill();
    }

    // Boba stand interior counter pool (cozy or wrong)
    {
      const wx = this.bobaStand.x - this.camera.x + this.bobaStand.w / 2;
      const wy = this.bobaStand.y - this.camera.y + 110;
      const wrong = this.bobaStand.wrong;
      const r = 140;
      const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, r);
      if (wrong > 0) {
        g.addColorStop(0, `rgba(150, 255, 138, ${0.4 + 0.2 * wrong})`);
        g.addColorStop(0.5, `rgba(150, 255, 138, ${0.12})`);
        g.addColorStop(1, 'rgba(150, 255, 138, 0)');
      } else {
        g.addColorStop(0, 'rgba(255, 200, 110, 0.4)');
        g.addColorStop(0.5, 'rgba(255, 180, 90, 0.12)');
        g.addColorStop(1, 'rgba(255, 180, 90, 0)');
      }
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(wx, wy, r, 0, Math.PI * 2); ctx.fill();
    }

    // Lantern post pools
    for (const p of this.lanternPosts) {
      const wx = p.x - this.camera.x;
      const wy = p.y - this.camera.y - p.h - 4;
      if (wx < -100 || wx > W + 100 || wy < -100 || wy > H + 100) continue;
      const colorMix = Math.floor(p.hue * 3);
      const colors = [
        'rgba(255, 168, 96,',
        'rgba(255, 138, 204,',
        'rgba(168, 240, 138,',
      ];
      const c = colors[colorMix];
      const flicker = 0.85 + 0.15 * Math.sin(t * 0.004 + p.sway);
      const r = 90;
      const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, r);
      g.addColorStop(0,   c + (0.5 * flicker).toFixed(2) + ')');
      g.addColorStop(0.5, c + (0.16 * flicker).toFixed(2) + ')');
      g.addColorStop(1,   c + '0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(wx, wy, r, 0, Math.PI * 2); ctx.fill();
    }

    // Mid silhouette accent pools
    for (const s of this.midSilhouettes) {
      if (s.accent > 0.4) continue;
      const wx = s.x - this.camera.x * 0.85 + s.w * 0.5;
      const wy = s.y - this.camera.y * 0.7 + s.h * 0.4;
      if (wx < -50 || wx > W + 50) continue;
      const c = s.accent < 0.2 ? 'rgba(255, 138, 204,' : 'rgba(168, 240, 138,';
      const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, 80);
      g.addColorStop(0, c + '0.32)');
      g.addColorStop(1, c + '0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(wx, wy, 80, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();
  }

  /* ---------- 17. FIREFLIES ---------- */
  _drawFireflies(t) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const f of this.fireflies) {
      const wx = f.x - this.camera.x, wy = f.y - this.camera.y;
      if (wx < -40 || wx > W + 40 || wy < -40 || wy > H + 40) continue;
      const blink = 0.4 + 0.6 * Math.abs(Math.sin(t * f.speed + f.phase));
      const r = 6 + blink * 6;
      const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, r);
      g.addColorStop(0, `rgba(255, 228, 160, ${0.85 * blink})`);
      g.addColorStop(1, 'rgba(255, 228, 160, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(wx, wy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255, 240, 200, ${blink})`;
      ctx.fillRect(wx - 0.5, wy - 0.5, 1, 1);
    }
    ctx.restore();
  }

  /* ---------- 18. SPIRIT MOTES ---------- */
  _drawSpiritMotes(t) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const m of this.spiritMotes) {
      const wx = m.x - this.camera.x, wy = m.y - this.camera.y;
      if (wx < -40 || wx > W + 40 || wy < -40 || wy > H + 40) continue;
      const pulse = 0.6 + 0.4 * Math.sin(t * m.speed + m.phase);
      const r = 10 + pulse * 8;
      const hex = m.color.replace('#', '');
      const cr = parseInt(hex.slice(0, 2), 16);
      const cg = parseInt(hex.slice(2, 4), 16);
      const cb = parseInt(hex.slice(4, 6), 16);
      const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, r);
      g.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${0.55 * pulse})`);
      g.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(wx, wy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(${cr + 40}, ${cg + 40}, ${cb + 40}, ${pulse * 0.9})`;
      ctx.fillRect(wx - m.size / 2, wy - m.size / 2, m.size, m.size);
    }
    ctx.restore();
  }

  /* ---------- 19. BURST PARTICLES ---------- */
  _drawBurstParticles() {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const p of this.burstParticles) {
      const wx = p.x - this.camera.x, wy = p.y - this.camera.y;
      const a = p.life / p.maxLife;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillRect(wx - p.size / 2, wy - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /* ---------- 20. FOG (front layer) ---------- */
  _drawFogFront(t) {
    const ctx = this.ctx;
    ctx.save();
    for (const f of this.fogPuffsFront) {
      const wx = f.x - this.camera.x;
      const wy = f.y - this.camera.y;
      if (wx < -300 || wx > W + 300 || wy < -300 || wy > H + 300) continue;
      const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, f.r);
      g.addColorStop(0, `rgba(180, 160, 220, ${f.alpha})`);
      g.addColorStop(1, 'rgba(180, 160, 220, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(wx, wy, f.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  /* ---------- 21. DUST MOTES ---------- */
  _drawDustMotes() {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 240, 220, 0.45)';
    for (const d of this.dustMotes) {
      const wx = d.x - this.camera.x, wy = d.y - this.camera.y;
      if (wx < 0 || wx > W || wy < 0 || wy > H) continue;
      ctx.fillRect(wx, wy, d.size, d.size);
    }
    ctx.restore();
  }

  /* ---------- 22. VIGNETTE ---------- */
  _drawVignette() {
    const ctx = this.ctx;
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.95);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, PAL.vignette);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  /* ---------- 23. UI ---------- */
  // Polish fix per spec — moved to bottom-left, italic 22px, so it
  // never overlaps the boba stand at the default camera position.
  _drawTitle(t) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = this.hud.titleAlpha;
    ctx.fillStyle = PAL.uiText;
    ctx.font = 'italic 22px "Cormorant Garamond", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 14;
    ctx.fillText('abandoned midway — food zone', 24, H - 18);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  _drawHint(t) {
    if (this.hud.introHintT <= 0) return;
    const a = clamp(this.hud.introHintT / 200, 0, 1);
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = a * 0.85;
    ctx.fillStyle = PAL.uiText;
    ctx.font = '16px "VT323", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('arrows / wasd to walk · SHIFT to flicker the stand', 24, 22);
    ctx.restore();
  }
}
