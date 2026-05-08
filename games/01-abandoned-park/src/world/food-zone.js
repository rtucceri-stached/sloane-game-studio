/* ============================================================
 * FOOD ZONE — Phase 2/3 atmosphere lock + player + Jim
 * ------------------------------------------------------------
 * Structural reference: games/bigfoot-and-ghost-ep1.html
 *   • Camera: clamp-to-world target, lerp toward it
 *   • Layered render order with screen-blend additive lights
 *   • Per-light pulse phases — never strobe in unison
 *   • Procedural drop-shadow ellipses + walk-phase characters
 *
 * See ABANDONED_PARK_PLAN.md → "ZONE 1 — THE FOOD STANDS" and
 * "VISUAL DIRECTION".
 * ============================================================ */

import { Input } from '../engine/input.js';
import { Juice } from '../engine/juice.js';

const WORLD_W = 2880;
const WORLD_H = 2040;
const CANVAS_W = 800;
const CANVAS_H = 500;

const LETTERBOX_H = 30;

const PAL = {
  // Sky
  skyTop: '#030108',
  skyMid: '#0a0518',
  skyLow: '#160a2e',

  // Ground
  ground:      '#1a1410',
  groundTint:  '#2a1f18',
  groundCrack: 'rgba(40, 28, 22, 0.55)',

  // Stand (weathered sage green carnival booth)
  standBack:    '#3d4f3a',
  standBackD:   '#2a3a2a',
  standRoof:    '#1a1208',
  standRoofHi:  '#332620',
  standTrim:    '#0e0908',
  standCounter: '#241a14',
  standSignBg:  '#0c0a14',
  standInside:  'rgba(255, 200, 120, 0.22)',

  // Bobaaaaah neon
  jimNeon:      '#ff4dc8',
  jimNeonHi:    '#ffb0e2',
  jimNeonD:     '#9a2a86',

  // Carnival accents (glow only — never base fills)
  matcha: '#9bff5e',
  blue:   '#a8d8ff',

  // Jim
  jimSkin:  '#d4cabb',
  jimSkinD: '#9a907f',
  jimHair:  '#0e0814',
  jimEye:   '#020003',
  jimShirt: '#181018',

  // Player (food critic)
  hairBack:    '#3a2010',
  hairFront:   '#5a341a',
  hairHi:      '#7a4a26',
  tee:         '#5a3424',
  apron:       '#8a8085',
  apronStrap:  '#74686e',
  jeans:       '#2f3e5a',
  jeansShade:  '#1f2c40',
  sneakers:    '#f4ece0',
  sneakersDk:  '#bfb8ac',
  skin:        '#e7c8a8',

  // Atmosphere
  fogTint:    'rgba(180, 160, 220, 0.10)',
  vignette:   'rgba(0, 0, 0, 0.78)',
  rideOutline:'rgba(20, 12, 36, 0.92)',
  farTree:    'rgba(14, 8, 22, 0.95)',
  debrisTk:   'rgba(255, 200, 130, 0.55)',
  debrisPpr:  'rgba(220, 210, 200, 0.45)',
};

// -- Tiny seedable RNG so layout is stable across reloads ----
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

export class FoodZone {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.t = 0; // running ms

    this.camera = { x: 0, y: 0, tx: 0, ty: 0 };

    // Player — food critic, top-down RPG
    this.player = {
      x: 400, y: 1050,
      vx: 0, vy: 0,
      facing: 1,
      walkPhase: 0,
      bobPhase: Math.random() * Math.PI * 2,
    };

    // Five lamps — placements per spec, each its own pulse phase
    this.lamps = [
      { x: 380,  y: 1050 },
      { x: 820,  y: 780 },
      { x: 1440, y: 1100 },
      { x: 2060, y: 820 },
      { x: 2550, y: 1020 },
    ].map((p) => ({
      ...p,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.025 + Math.random() * 0.02,
      flicker: Math.random() * Math.PI * 2,
      flickerSpeed: 0.07 + Math.random() * 0.05,
    }));

    // Bobaaaaah stand — back row, Jim's
    this.standJim = { x: 680, y: 480, w: 130, h: 80 };
    this.jimSway  = Math.random() * Math.PI * 2;

    this._buildAtmosphere();
  }

  _buildAtmosphere() {
    // -- Distant ride silhouettes (deep parallax) --
    // Ferris wheel left, roller coaster right — drawn each frame
    // procedurally, no array storage needed.

    // -- Far atmospheric tree/shape silhouettes at world edges --
    const rng = mulberry32(1337);
    this.farShapes = [];
    for (let i = 0; i < 22; i++) {
      const onLeft = rng() < 0.5;
      this.farShapes.push({
        x: onLeft ? rng() * 220 : WORLD_W - rng() * 220,
        y: 380 + rng() * 220,
        w: 30 + rng() * 50,
        h: 80 + rng() * 110,
      });
    }

    // -- Cracked pavement texture lines on the midway floor --
    const rngC = mulberry32(99);
    this.cracks = [];
    for (let i = 0; i < 110; i++) {
      this.cracks.push({
        x: rngC() * WORLD_W,
        y: 640 + rngC() * 1000,
        len: 22 + rngC() * 70,
        ang: rngC() * Math.PI * 2,
        bend: (rngC() - 0.5) * 0.6,
      });
    }

    // -- Scattered debris on the midway floor --
    const rngD = mulberry32(7);
    this.debris = [];
    for (let i = 0; i < 130; i++) {
      this.debris.push({
        x: 60 + rngD() * (WORLD_W - 120),
        y: 700 + rngD() * 880,
        type: rngD() < 0.4 ? 'ticket' : 'paper',
        rot: rngD() * Math.PI * 2,
        size: 4 + rngD() * 5,
      });
    }

    // -- Drifting fog wisps along the ground plane --
    this.fogPuffs = [];
    for (let i = 0; i < 22; i++) {
      this.fogPuffs.push({
        x: Math.random() * WORLD_W,
        y: 720 + Math.random() * 880,
        r: 130 + Math.random() * 220,
        vx: -0.10 - Math.random() * 0.16,
        alpha: 0.05 + Math.random() * 0.06,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // -- Dust motes rising slowly with independent phases --
    this.dustMotes = [];
    for (let i = 0; i < 90; i++) {
      this.dustMotes.push({
        x: Math.random() * WORLD_W,
        y: 600 + Math.random() * 1300,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -0.05 - Math.random() * 0.13,
        life: Math.random() * 240,
        size: 0.5 + Math.random() * 1.0,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  // --------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------
  update(dt) {
    this.t += dt;

    // Movement input → target velocity, lerped for smooth feel
    let dx = 0, dy = 0;
    if (Input.isDown('left'))  dx -= 1;
    if (Input.isDown('right')) dx += 1;
    if (Input.isDown('up'))    dy -= 1;
    if (Input.isDown('down'))  dy += 1;
    if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }

    const speed = 2.8;
    this.player.vx = Juice.lerp(this.player.vx, dx * speed, 0.22);
    this.player.vy = Juice.lerp(this.player.vy, dy * speed, 0.22);
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    // Clamp to walkable midway band
    this.player.x = clamp(this.player.x, 60, WORLD_W - 60);
    this.player.y = clamp(this.player.y, 620, 1620);

    if (Math.abs(this.player.vx) > 0.15) {
      this.player.facing = this.player.vx > 0 ? 1 : -1;
    }
    const moving = Math.abs(this.player.vx) + Math.abs(this.player.vy) > 0.4;
    if (moving) {
      this.player.walkPhase += 0.18;
    } else {
      this.player.walkPhase = 0;
      this.player.bobPhase += 0.04;
    }

    // Camera follow with smooth lerp, clamped to world bounds
    this.camera.tx = clamp(this.player.x - CANVAS_W / 2, 0, WORLD_W - CANVAS_W);
    this.camera.ty = clamp(this.player.y - CANVAS_H / 2, 0, WORLD_H - CANVAS_H);
    this.camera.x = Juice.lerp(this.camera.x, this.camera.tx, 0.1);
    this.camera.y = Juice.lerp(this.camera.y, this.camera.ty, 0.1);

    // Fog drift — wraps east-to-west on world boundary
    for (const p of this.fogPuffs) {
      p.x += p.vx;
      if (p.x < -p.r) p.x = WORLD_W + p.r;
    }
    // Dust motes rise + respawn near the ground
    for (const d of this.dustMotes) {
      d.x += d.vx;
      d.y += d.vy;
      d.life++;
      if (d.life > 240 + Math.random() * 100 || d.y < 420) {
        d.x = Math.random() * WORLD_W;
        d.y = 1700 + Math.random() * 200;
        d.vx = (Math.random() - 0.5) * 0.18;
        d.vy = -0.05 - Math.random() * 0.13;
        d.life = 0;
      }
    }

    Juice.tickFreeze();
    Input.endFrame();
  }

  // --------------------------------------------------------
  // RENDER — back to front, mirroring Bigfoot's layer order
  // --------------------------------------------------------
  render() {
    const { ctx } = this;
    const t = this.t;

    // Camera shake (used sparingly later — kept consistent w/ Bigfoot)
    const sh = Juice.shakeOffset();
    ctx.save();
    ctx.translate(sh.x, sh.y);

    // 1. sky gradient
    this._drawSky();

    // 2. distant ride silhouettes (deep parallax)
    this._drawRideSilhouettes(t);

    // 3. far atmospheric silhouettes at world edges
    this._drawFarShapes();

    // 4. ground
    this._drawGround();

    // 5. debris on the midway
    this._drawDebris();

    // 6+7+8. y-sorted: stand, lamps, player
    this._drawYSorted(t);

    // 9. fog wisps
    this._drawFog(t);

    // 10. dust motes
    this._drawDustMotes(t);

    // 11. lamp glow overlays (additive — screen blend)
    this._drawLampGlows(t);

    // 12. vignette
    this._drawVignette();

    ctx.restore(); // end shake transform

    // 13. letterbox bars (no shake — screen-space framing)
    this._drawLetterbox();

    // 14. caption in top letterbox
    this._drawCaption();
  }

  // ---------- world → screen helpers ----------------------
  _wx(x) { return x - this.camera.x; }
  _wy(y) { return y - this.camera.y; }

  // ---------- Sky -----------------------------------------
  _drawSky() {
    const { ctx } = this;
    // Sky band at top of world; only visible if camera is high enough.
    // We draw the gradient as a fixed canvas-wide band, parallax 0.
    // The gradient extends from the top of the canvas down through ~2/3,
    // so even when the camera scrolls into the midway, we still see a
    // hint of dark sky behind the back row. Bigfoot used the same trick.
    const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    g.addColorStop(0,    PAL.skyTop);
    g.addColorStop(0.55, PAL.skyMid);
    g.addColorStop(1,    PAL.skyLow);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  // ---------- Distant ride silhouettes (parallax 0.3) -----
  _drawRideSilhouettes(t) {
    const { ctx } = this;
    const px = this.camera.x * 0.3;

    // Ferris wheel — left side of the park
    const fwx = 460 - px;
    const fwy = 300 - this.camera.y * 0.3;
    ctx.save();
    ctx.strokeStyle = PAL.rideOutline;
    ctx.fillStyle   = PAL.rideOutline;
    ctx.lineWidth   = 1.5;
    // hub
    ctx.beginPath();
    ctx.arc(fwx, fwy, 4, 0, Math.PI * 2);
    ctx.fill();
    // rim — slow rotation gives the wheel barely-perceptible life
    const spin = t * 0.00006;
    ctx.beginPath();
    ctx.arc(fwx, fwy, 70, 0, Math.PI * 2);
    ctx.stroke();
    // spokes
    for (let i = 0; i < 8; i++) {
      const a = spin + i * (Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(fwx, fwy);
      ctx.lineTo(fwx + Math.cos(a) * 70, fwy + Math.sin(a) * 70);
      ctx.stroke();
    }
    // gondolas
    for (let i = 0; i < 8; i++) {
      const a = spin + i * (Math.PI / 4);
      const gx = fwx + Math.cos(a) * 70;
      const gy = fwy + Math.sin(a) * 70;
      ctx.fillRect(gx - 4, gy - 1, 8, 6);
    }
    // tower legs
    ctx.beginPath();
    ctx.moveTo(fwx - 30, fwy + 110);
    ctx.lineTo(fwx, fwy);
    ctx.lineTo(fwx + 30, fwy + 110);
    ctx.stroke();
    ctx.restore();

    // Roller coaster — right side
    const rx = 2380 - px;
    const ry = 360 - this.camera.y * 0.3;
    ctx.save();
    ctx.strokeStyle = PAL.rideOutline;
    ctx.lineWidth   = 2;
    // a couple swooping arcs
    ctx.beginPath();
    ctx.moveTo(rx - 200, ry + 60);
    ctx.bezierCurveTo(rx - 120, ry - 80, rx + 20, ry - 30, rx + 100, ry + 40);
    ctx.bezierCurveTo(rx + 160, ry + 80, rx + 220, ry + 20, rx + 280, ry + 70);
    ctx.stroke();
    // a second track parallel below
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(rx - 200, ry + 70);
    ctx.bezierCurveTo(rx - 120, ry - 70, rx + 20, ry - 20, rx + 100, ry + 50);
    ctx.bezierCurveTo(rx + 160, ry + 90, rx + 220, ry + 30, rx + 280, ry + 80);
    ctx.stroke();
    // support pillars
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const sx = rx - 200 + i * 96;
      const sy = ry + 50 + Math.sin(i) * 20;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx, sy + 140);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---------- Far atmospheric silhouettes -----------------
  _drawFarShapes() {
    const { ctx } = this;
    const px = this.camera.x * 0.5;
    const py = this.camera.y * 0.5;
    ctx.fillStyle = PAL.farTree;
    for (const s of this.farShapes) {
      const sx = s.x - px;
      const sy = s.y - py;
      if (sx < -120 || sx > CANVAS_W + 120) continue;
      // jagged dark blob — like distant tree clusters/tents
      ctx.beginPath();
      ctx.moveTo(sx - s.w * 0.5, sy);
      ctx.quadraticCurveTo(sx, sy - s.h, sx + s.w * 0.5, sy);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ---------- Ground --------------------------------------
  _drawGround() {
    const { ctx } = this;

    // Base fill — dark compacted dirt the moment the sky stops.
    // We fill the canvas region that maps to world y >= 580.
    const gy = 580 - this.camera.y;
    if (gy < CANVAS_H) {
      ctx.fillStyle = PAL.ground;
      ctx.fillRect(0, Math.max(0, gy), CANVAS_W, CANVAS_H - Math.max(0, gy));

      // Soft tint vignette on the floor — center is slightly warmer
      ctx.save();
      ctx.globalAlpha = 0.55;
      const g = ctx.createRadialGradient(
        CANVAS_W * 0.5, CANVAS_H * 0.85, 0,
        CANVAS_W * 0.5, CANVAS_H * 0.85, CANVAS_H * 0.95,
      );
      g.addColorStop(0, 'rgba(60, 40, 30, 0.18)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.restore();
    }

    // Cracks
    ctx.save();
    ctx.strokeStyle = PAL.groundCrack;
    ctx.lineWidth = 1;
    for (const c of this.cracks) {
      const wx = this._wx(c.x), wy = this._wy(c.y);
      if (wx < -80 || wx > CANVAS_W + 80 || wy < -40 || wy > CANVAS_H + 40) continue;
      const dx = Math.cos(c.ang) * c.len;
      const dy = Math.sin(c.ang) * c.len * 0.5;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.quadraticCurveTo(wx + dx * 0.5 + c.bend * 12, wy + dy * 0.5 - c.bend * 6, wx + dx, wy + dy);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---------- Debris (tickets + paper) --------------------
  _drawDebris() {
    const { ctx } = this;
    for (const d of this.debris) {
      const wx = this._wx(d.x), wy = this._wy(d.y);
      if (wx < -20 || wx > CANVAS_W + 20 || wy < -20 || wy > CANVAS_H + 20) continue;
      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(d.rot);
      ctx.fillStyle = d.type === 'ticket' ? PAL.debrisTk : PAL.debrisPpr;
      ctx.fillRect(-d.size * 0.7, -d.size * 0.4, d.size * 1.4, d.size * 0.8);
      if (d.type === 'ticket') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(-d.size * 0.5, -d.size * 0.2, d.size, 1);
      }
      ctx.restore();
    }
  }

  // ---------- Y-sorted entities ---------------------------
  _drawYSorted(t) {
    const items = [];
    // Stand foot (front edge sits at y + h)
    items.push({
      y: this.standJim.y + this.standJim.h,
      draw: () => this._drawStand(t),
    });
    // Player feet
    items.push({
      y: this.player.y,
      draw: () => this._drawPlayer(t),
    });
    // Lamps — base of the post is at lamp.y
    for (const lamp of this.lamps) {
      items.push({
        y: lamp.y,
        draw: () => this._drawLamp(lamp, t),
      });
    }
    items.sort((a, b) => a.y - b.y);
    for (const it of items) it.draw();
  }

  // ---------- Bobaaaaah stand + Jim -----------------------
  _drawStand(t) {
    const { ctx } = this;
    const s = this.standJim;
    const wx = this._wx(s.x);
    const wy = this._wy(s.y);
    if (wx < -200 || wx > CANVAS_W + 200) return;

    const w = s.w, h = s.h;

    // Roof slab — slight overhang toward viewer
    ctx.fillStyle = PAL.standRoof;
    ctx.beginPath();
    ctx.moveTo(wx - 8,     wy - 6);
    ctx.lineTo(wx + w + 8, wy - 6);
    ctx.lineTo(wx + w + 4, wy + 6);
    ctx.lineTo(wx - 4,     wy + 6);
    ctx.closePath();
    ctx.fill();
    // Roof front face
    ctx.fillStyle = PAL.standRoofHi;
    ctx.fillRect(wx - 4, wy + 6, w + 8, 4);

    // Sign band (dark backing for the neon)
    const sigY = wy + 12;
    const sigH = 22;
    ctx.fillStyle = PAL.standSignBg;
    ctx.fillRect(wx, sigY, w, sigH);
    // Trim above + below sign
    ctx.fillStyle = PAL.standTrim;
    ctx.fillRect(wx - 2, sigY - 2, w + 4, 2);
    ctx.fillRect(wx - 2, sigY + sigH, w + 4, 2);

    // BOBAAAAAH neon lettering — first the additive halo, then the strokes
    ctx.save();
    ctx.font = "italic 600 16px 'Cormorant Garamond', serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const cx = wx + w / 2;
    const cy = sigY + sigH / 2;

    ctx.globalCompositeOperation = 'screen';
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
    halo.addColorStop(0, 'rgba(255, 77, 200, 0.55)');
    halo.addColorStop(0.5, 'rgba(255, 77, 200, 0.18)');
    halo.addColorStop(1, 'rgba(255, 77, 200, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Neon strokes on top (regular blend for definition)
    ctx.save();
    ctx.font = "italic 600 16px 'Cormorant Garamond', serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // dim outer shadow
    ctx.fillStyle = PAL.jimNeonD;
    ctx.fillText('BOBAAAAAH', cx + 1, cy + 1);
    // hot pink fill
    ctx.fillStyle = PAL.jimNeon;
    ctx.fillText('BOBAAAAAH', cx, cy);
    // tiny glint
    ctx.fillStyle = PAL.jimNeonHi;
    ctx.globalAlpha = 0.8 + 0.2 * Math.sin(t * 0.005);
    ctx.fillText('BOBAAAAAH', cx, cy - 0.5);
    ctx.restore();

    // Back wall behind counter (sage green weathered)
    const wallY = sigY + sigH + 2;
    const wallH = h - (wallY - wy);
    ctx.fillStyle = PAL.standBackD;
    ctx.fillRect(wx, wallY, w, wallH);
    ctx.fillStyle = PAL.standBack;
    ctx.fillRect(wx + 4, wallY, w - 8, wallH - 4);
    // weathered paint streaks
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = PAL.standBackD;
    for (let i = 0; i < 6; i++) {
      const stx = wx + 8 + i * (w - 16) / 6 + (i % 2) * 3;
      ctx.fillRect(stx, wallY + 2, 2, wallH - 8);
    }
    ctx.restore();

    // Service window — cut a darker hole into the wall, warm light spills out
    const winX = wx + 16;
    const winY = wallY + 8;
    const winW = w - 32;
    const winH = wallH - 22;
    ctx.fillStyle = PAL.standCounter;
    ctx.fillRect(winX, winY, winW, winH);
    // Interior warm light wash (additive)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const ig = ctx.createLinearGradient(winX, winY, winX, winY + winH);
    ig.addColorStop(0, 'rgba(255, 200, 110, 0.32)');
    ig.addColorStop(1, 'rgba(255, 140, 70, 0.06)');
    ctx.fillStyle = ig;
    ctx.fillRect(winX, winY, winW, winH);
    ctx.restore();

    // Jim — silhouetted in the service window
    this._drawJim(winX + winW / 2, winY + winH * 0.78, t);

    // Counter front — drawn LAST so it overlaps Jim's lower half
    const ctY = wy + h - 14;
    ctx.fillStyle = PAL.standTrim;
    ctx.fillRect(wx - 2, ctY, w + 4, 14);
    ctx.fillStyle = PAL.standCounter;
    ctx.fillRect(wx, ctY + 2, w, 10);

    // Hand-painted price boards (tiny — sits on the counter front)
    ctx.save();
    ctx.font = "10px 'Cormorant Garamond', serif";
    ctx.fillStyle = 'rgba(255, 220, 200, 0.55)';
    ctx.textAlign = 'left';
    ctx.fillText('boba…3t', wx + 6, ctY + 9);
    ctx.fillText('iced…4t', wx + 50, ctY + 9);
    ctx.fillText('???…?', wx + 95, ctY + 9);
    ctx.restore();

    // Soft drop shadow on the ground at base
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(wx + w / 2, wy + h + 6, w * 0.55, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---------- Jim — pale demon behind the counter ----------
  _drawJim(cx, baseY, t) {
    const { ctx } = this;
    const sway = Math.sin(t * 0.0015 + this.jimSway) * 2;

    ctx.save();
    ctx.translate(cx + sway, baseY);

    // Tee shirt (dark, narrow)
    ctx.fillStyle = PAL.jimShirt;
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.lineTo(-11, -22);
    ctx.lineTo(11, -22);
    ctx.lineTo(9, 0);
    ctx.closePath();
    ctx.fill();
    // collar v
    ctx.fillStyle = PAL.jimSkinD;
    ctx.beginPath();
    ctx.moveTo(-3, -22);
    ctx.lineTo(0, -18);
    ctx.lineTo(3, -22);
    ctx.closePath();
    ctx.fill();

    // Neck
    ctx.fillStyle = PAL.jimSkin;
    ctx.fillRect(-3, -28, 6, 8);

    // Head — pale, long oval
    ctx.fillStyle = PAL.jimSkin;
    ctx.beginPath();
    ctx.ellipse(0, -38, 9, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // shading on the right side
    ctx.fillStyle = PAL.jimSkinD;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.ellipse(3, -38, 5, 10, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Flat dark hair — cap on top of the head
    ctx.fillStyle = PAL.jimHair;
    ctx.beginPath();
    ctx.moveTo(-9, -42);
    ctx.quadraticCurveTo(0, -52, 9, -42);
    ctx.lineTo(9, -36);
    ctx.lineTo(-9, -36);
    ctx.closePath();
    ctx.fill();

    // Hollow eye sockets — black voids
    ctx.fillStyle = PAL.jimEye;
    ctx.beginPath();
    ctx.ellipse(-3.5, -38, 1.6, 2.4, 0, 0, Math.PI * 2);
    ctx.ellipse(3.5,  -38, 1.6, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    // tiny glint? no — pure void.

    // Smile too wide — quadratic from cheek to cheek
    ctx.strokeStyle = PAL.jimEye;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-7, -32);
    ctx.quadraticCurveTo(0, -27, 7, -32);
    ctx.stroke();

    ctx.restore();
  }

  // ---------- Player (food critic) ------------------------
  _drawPlayer(t) {
    const { ctx } = this;
    const wx = this._wx(this.player.x);
    const wy = this._wy(this.player.y);

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

    // Legs — visible from RPG overhead, slight swing
    const legSwing = moving ? Math.sin(phase) * 3 : 0;
    // Back leg (drawn first)
    ctx.fillStyle = PAL.jeansShade;
    ctx.fillRect(-5, 4, 4, 12 - legSwing);
    // Front leg
    ctx.fillStyle = PAL.jeans;
    ctx.fillRect(1,  4, 4, 12 + legSwing);
    // Sneakers
    ctx.fillStyle = PAL.sneakers;
    ctx.fillRect(-6, 14 - legSwing, 5, 4);
    ctx.fillRect(0,  14 + legSwing, 5, 4);
    ctx.fillStyle = PAL.sneakersDk;
    ctx.fillRect(-6, 17 - legSwing, 5, 1);
    ctx.fillRect(0,  17 + legSwing, 5, 1);

    // Body — brown tee under gray apron
    ctx.scale(this.player.facing, 1);

    // Tee (back panel)
    ctx.fillStyle = PAL.tee;
    ctx.beginPath();
    ctx.moveTo(-7, 4);
    ctx.lineTo(-8, -8);
    ctx.lineTo(8, -8);
    ctx.lineTo(7, 4);
    ctx.closePath();
    ctx.fill();
    // Apron (gray, on top of tee)
    ctx.fillStyle = PAL.apron;
    ctx.beginPath();
    ctx.moveTo(-6, 4);
    ctx.lineTo(-7, -4);
    ctx.lineTo(7, -4);
    ctx.lineTo(6, 4);
    ctx.closePath();
    ctx.fill();
    // Apron strap up around neck
    ctx.fillStyle = PAL.apronStrap;
    ctx.fillRect(-2, -10, 4, 4);
    // Apron pocket detail
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(-3, -1, 6, 2);

    // Arm swing — short stubs visible at the sides
    const armSwing = moving ? Math.sin(phase) * 2 : 0;
    ctx.fillStyle = PAL.tee;
    ctx.fillRect(-9, -6 + armSwing, 3, 8);
    ctx.fillRect( 6, -6 - armSwing, 3, 8);
    // Hands
    ctx.fillStyle = PAL.skin;
    ctx.fillRect(-9, 2 + armSwing, 3, 2);
    ctx.fillRect( 6, 2 - armSwing, 3, 2);

    // Head + hair (top-down view: mostly hair, tiny cheek/face hint)
    // Hair back layer
    ctx.fillStyle = PAL.hairBack;
    ctx.beginPath();
    ctx.ellipse(0, -14, 8, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    // Wavy strands (cascade past shoulders slightly)
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
    // Highlight strand
    ctx.strokeStyle = PAL.hairHi;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-3, -19);
    ctx.quadraticCurveTo(0, -21, 3, -19);
    ctx.stroke();
    // Tiny cheek visible at the front edge of the hair
    ctx.fillStyle = PAL.skin;
    ctx.beginPath();
    ctx.ellipse(2, -10, 2, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ---------- Lamp post -----------------------------------
  _drawLamp(lamp, t) {
    const { ctx } = this;
    const wx = this._wx(lamp.x);
    const wy = this._wy(lamp.y);
    if (wx < -40 || wx > CANVAS_W + 40 || wy < -120 || wy > CANVAS_H + 40) return;

    // Pole (dark verdigris-gray)
    ctx.save();
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(wx - 1.5, wy - 90, 3, 90);
    // base flange
    ctx.fillRect(wx - 5, wy - 4, 10, 4);
    // arm bracket near top
    ctx.fillRect(wx - 6, wy - 84, 12, 3);
    // lamp head (housing)
    ctx.fillStyle = '#1a1a18';
    ctx.beginPath();
    ctx.moveTo(wx - 6, wy - 84);
    ctx.lineTo(wx - 8, wy - 96);
    ctx.lineTo(wx + 8, wy - 96);
    ctx.lineTo(wx + 6, wy - 84);
    ctx.closePath();
    ctx.fill();
    // bulb glow surface
    const flicker = 0.85 + 0.15 * Math.sin(t * lamp.flickerSpeed + lamp.flicker);
    ctx.fillStyle = `rgba(255, 210, 130, ${0.85 * flicker})`;
    ctx.beginPath();
    ctx.ellipse(wx, wy - 90, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // soft core
    ctx.fillStyle = `rgba(255, 240, 200, ${0.95 * flicker})`;
    ctx.beginPath();
    ctx.arc(wx, wy - 90, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---------- Lamp glow overlays --------------------------
  // Drawn after everything in the world but before vignette.
  // Each lamp throws a warm pool on the ground, pulsing with its own phase.
  _drawLampGlows(t) {
    const { ctx } = this;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const lamp of this.lamps) {
      const wx = this._wx(lamp.x);
      const wy = this._wy(lamp.y);
      const pulse = 0.85 + 0.15 * Math.sin(t * lamp.pulseSpeed + lamp.pulse);
      const flicker = 0.92 + 0.08 * Math.sin(t * lamp.flickerSpeed + lamp.flicker);
      const r = 90 * pulse * flicker;

      // Ground pool (wide, low) — at the base of the post
      const gp = ctx.createRadialGradient(wx, wy + 4, 0, wx, wy + 4, r);
      gp.addColorStop(0,    `rgba(255, 200, 110, ${0.55 * flicker})`);
      gp.addColorStop(0.45, `rgba(255, 170, 90, ${0.18 * flicker})`);
      gp.addColorStop(1,    'rgba(255, 170, 90, 0)');
      ctx.fillStyle = gp;
      ctx.beginPath();
      ctx.ellipse(wx, wy + 4, r, r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bulb halo (compact, at the top of the post)
      const hr = 38 * pulse * flicker;
      const bg = ctx.createRadialGradient(wx, wy - 90, 0, wx, wy - 90, hr);
      bg.addColorStop(0, `rgba(255, 230, 160, ${0.7 * flicker})`);
      bg.addColorStop(1, 'rgba(255, 200, 120, 0)');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(wx, wy - 90, hr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ---------- Fog -----------------------------------------
  _drawFog(t) {
    const { ctx } = this;
    ctx.save();
    for (const f of this.fogPuffs) {
      // Slight parallax — fog drifts a touch slower than the world
      const wx = f.x - this.camera.x * 0.92;
      const wy = f.y - this.camera.y * 0.92;
      if (wx < -300 || wx > CANVAS_W + 300 || wy < -200 || wy > CANVAS_H + 200) continue;
      const breathe = 0.85 + 0.15 * Math.sin(t * 0.0009 + f.phase);
      const r = f.r * breathe;
      const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, r);
      g.addColorStop(0, `rgba(180, 160, 220, ${f.alpha})`);
      g.addColorStop(1, 'rgba(180, 160, 220, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(wx, wy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ---------- Dust motes ----------------------------------
  _drawDustMotes(t) {
    const { ctx } = this;
    ctx.save();
    for (const d of this.dustMotes) {
      const wx = this._wx(d.x), wy = this._wy(d.y);
      if (wx < -10 || wx > CANVAS_W + 10 || wy < -10 || wy > CANVAS_H + 10) continue;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.004 + d.phase));
      ctx.fillStyle = `rgba(240, 220, 200, ${0.45 * tw})`;
      ctx.fillRect(wx, wy, d.size, d.size);
    }
    ctx.restore();
  }

  // ---------- Vignette ------------------------------------
  _drawVignette() {
    const { ctx } = this;
    const g = ctx.createRadialGradient(
      CANVAS_W / 2, CANVAS_H / 2, CANVAS_H * 0.32,
      CANVAS_W / 2, CANVAS_H / 2, CANVAS_H * 0.85,
    );
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, PAL.vignette);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  // ---------- Letterbox -----------------------------------
  _drawLetterbox() {
    const { ctx } = this;
    ctx.fillStyle = PAL.letterbox || '#000';
    ctx.fillRect(0, 0, CANVAS_W, LETTERBOX_H);
    ctx.fillRect(0, CANVAS_H - LETTERBOX_H, CANVAS_W, LETTERBOX_H);
  }

  // ---------- Caption -------------------------------------
  _drawCaption() {
    const { ctx } = this;
    ctx.save();
    ctx.font = "italic 14px 'Cormorant Garamond', serif";
    ctx.fillStyle = 'rgba(220, 200, 220, 0.65)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('abandoned midway — food zone', 14, LETTERBOX_H / 2);
    ctx.restore();
  }
}
