/* ============================================================
 * FOOD ZONE — scene shell, clean slate for Session D renders
 * ------------------------------------------------------------
 * Atmosphere uses engine classes (FogSystem, FireflySystem,
 * DustMoteSystem). Spirit motes stay inline — they're ghost-
 * mechanic-specific and don't belong in a general engine module.
 * All procedural set pieces stripped; player is a placeholder
 * circle. Blender assets arrive in Session D.
 * ============================================================ */

import { Input } from '../engine/input.js';
import { Juice } from '../engine/juice.js';
import { Sound } from '../engine/sound.js';
import { FogSystem, FireflySystem, DustMoteSystem } from '../engine/atmosphere.js';
import { ColorGrading } from '../engine/color-grading.js';
import { Sprites } from '../assets/manifest.js';

// ---------- Game-object interfaces ----------

interface Camera {
  x: number;
  y: number;
  tx: number;
  ty: number;
}

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  facing: number;
  walkPhase: number;
  speed: number;
  _stepTimer: number;
}

interface BobaStand {
  x: number;
  y: number;
  w: number;
  h: number;
  signGlow: number;
  wrong: number;
  wrongTimer: number;
}

interface SpiritMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
  color: string;
  size: number;
}

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface HUD {
  titleAlpha: number;
  introHintT: number;
}

// ---------- Canvas + world dimensions ----------
const W = 960,
  H = 600;
const WORLD_W = 2400,
  WORLD_H = 1700;

// ---------- PAL — every color in the food zone ----------
const PAL = {
  // Sky
  skyTop: '#070314',
  skyMid: '#160a2c',
  skyBottom: '#2a1644',
  skyHaze: '#3d2458',

  // Ground
  groundFar: '#1a1024',
  groundMid: '#241828',
  groundNear: '#2e1f30',
  groundDark: '#0a0612',

  // Sloane's three loud colors
  pink: '#ff4dc8',
  pinkHi: '#ffb0e0',
  pinkLo: '#c2369a',
  green: '#9bff5e',
  greenHi: '#d8ffb8',
  greenLo: '#5cb838',
  blue: '#a8e0ff',
  blueHi: '#e0f4ff',

  // Horror accents
  sickGreen: '#6dff8a',
  sickGreenD: '#3dc858',
  bloodHi: '#d93450',

  // Lighting
  warmLamp: '#ffd76b',
  warmLampHi: '#fff4c2',
  fireflyGlow: '#ffe4a0',
  spiritPink: '#ff8acc',
  spiritGreen: '#9bff5e',
  spiritPurp: '#c9a8ff',
  spiritBlue: '#a8e0ff',

  // Boba stand
  standWrongGlow: '#6ca85a',
  standNeon: '#ff4dc8',

  // UI
  uiText: '#f5e8ff',
  uiBg: 'rgba(15,8,28,0.92)',
  uiBorder: '#a855ff',
  uiAccent: '#9bff5e',
  uiPink: '#ff4dc8',
  uiDim: '#7a6a8a',

  vignette: 'rgba(0,0,0,0.85)',
};

function clamp(v: number, a: number, b: number): number {
  return v < a ? a : v > b ? b : v;
}

// Sprite render path — dormant until real Critic 1 renders land.
// Flip USE_SPRITE_PLAYER to true after Session E to activate.
const USE_SPRITE_PLAYER = false;
const IDLE_FPS = 8;
const WALK_FPS = 12;
const IDLE_FRAME_COUNT = 6;
const WALK_FRAME_COUNT = 12;
// TODO: tune SPRITE_FRAME_SIZE, FPS, and anchor offset when Critic 1 sprites are first rendered — current values are pre-render guesses
const SPRITE_FRAME_SIZE = 512;

// ============================================================
// FoodZone — scene class
// ============================================================
export class FoodZone {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  camera: Camera;
  player: Player;
  bobaStand: BobaStand;
  bobaHutImage: HTMLCanvasElement | null;
  bobaHutDrawH: number;
  fog: FogSystem;
  flies: FireflySystem;
  dust: DustMoteSystem;
  spiritMotes: SpiritMote[];
  burstParticles: BurstParticle[];
  hud: HUD;
  t: number;
  _criticSprites: Map<string, HTMLImageElement>;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    this.camera = { x: 0, y: 0, tx: 0, ty: 0 };

    this.player = {
      x: 1180,
      y: 1180,
      vx: 0,
      vy: 0,
      r: 18,
      facing: 1,
      walkPhase: 0,
      speed: 2.4,
      _stepTimer: 0,
    };

    this.bobaStand = {
      x: 1100,
      y: 950,
      w: 320,
      h: 200,
      signGlow: 0,
      wrong: 0,
      wrongTimer: 360,
    };

    // White-to-alpha composite for Boba_Hut.png
    this.bobaHutImage = null;
    this.bobaHutDrawH = 0;
    const _bobaImg = new Image();
    _bobaImg.src = '/Boba_Hut.png';
    _bobaImg.onload = () => {
      const c = document.createElement('canvas');
      c.width = _bobaImg.naturalWidth;
      c.height = _bobaImg.naturalHeight;
      const cx = c.getContext('2d')!;
      cx.drawImage(_bobaImg, 0, 0);
      const id = cx.getImageData(0, 0, c.width, c.height);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i],
          g = d[i + 1],
          b = d[i + 2];
        const luma = (r + g + b) / 3;
        if (luma >= 248) {
          d[i + 3] = 0;
        } else if (luma >= 220) {
          d[i + 3] = Math.round(((248 - luma) * 255) / 28);
        }
      }
      cx.putImageData(id, 0, 0);
      this.bobaHutImage = c;
      this.bobaHutDrawH = Math.round(500 * (_bobaImg.naturalHeight / _bobaImg.naturalWidth));
    };

    // Engine atmosphere systems — food zone tunes fog color/parallax
    this.fog = new FogSystem();
    this.fog.init(WORLD_W, WORLD_H, 28, {
      colorBack: 'rgba(110, 90, 150,',
      parallaxBack: 0.85,
      colorFront: 'rgba(180, 160, 220,',
      parallaxFront: 0.85,
    });

    this.flies = new FireflySystem();
    this.flies.init(WORLD_W, WORLD_H, 90);

    this.dust = new DustMoteSystem();
    this.dust.init(WORLD_W, WORLD_H, 130);

    this.spiritMotes = [];
    this.burstParticles = [];
    this.hud = { titleAlpha: 1, introHintT: 600 };
    this.t = 0;
    this._criticSprites = new Map();

    this._buildSpiritMotes();
  }

  _buildSpiritMotes(): void {
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
  }

  // ============================================================
  // UPDATE
  // ============================================================
  update(dt: number): void {
    this.t += dt;
    this._updatePlayer(this.t);
    this._updateCamera();
    this._updateWorld();
    this.fog.update(dt);
    this.flies.update(dt);
    this.dust.update(dt);
    this._updateParticles(this.t);
    Input.endFrame();
  }

  _updatePlayer(_t: number): void {
    let dx = 0,
      dy = 0;
    if (Input.isDown('left')) dx -= 1;
    if (Input.isDown('right')) dx += 1;
    if (Input.isDown('up')) dy -= 1;
    if (Input.isDown('down')) dy += 1;
    if (dx && dy) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    const tx = dx * this.player.speed;
    const ty = dy * this.player.speed;
    this.player.vx = Juice.lerp(this.player.vx, tx, 0.25);
    this.player.vy = Juice.lerp(this.player.vy, ty, 0.25);
    if (dx !== 0) this.player.facing = dx > 0 ? 1 : -1;

    this.player.x += this.player.vx;
    this.player.y += this.player.vy;
    this.player.x = clamp(this.player.x, 60, WORLD_W - 60);
    this.player.y = clamp(this.player.y, 1170, WORLD_H - 80);

    const moving = Math.abs(this.player.vx) + Math.abs(this.player.vy) > 0.4;
    if (moving) {
      this.player.walkPhase += 0.18;
      this.player._stepTimer++;
      if (this.player._stepTimer > 16) {
        if (Sound.play) Sound.play('click');
        this.player._stepTimer = 0;
      }
    } else {
      this.player.walkPhase = 0;
      this.player._stepTimer = 0;
    }
  }

  _updateCamera(): void {
    this.camera.tx = clamp(this.player.x - W / 2, 0, WORLD_W - W);
    this.camera.ty = clamp(this.player.y - H / 2, 0, WORLD_H - H);
    this.camera.x = Juice.lerp(this.camera.x, this.camera.tx, 0.12);
    this.camera.y = Juice.lerp(this.camera.y, this.camera.ty, 0.12);
  }

  _updateWorld(): void {
    const b = this.bobaStand;

    const dx = this.player.x - (b.x + b.w / 2);
    const dy = this.player.y - (b.y + b.h);
    const dist = Math.hypot(dx, dy);
    const target = dist < 260 ? clamp(1 - dist / 260, 0, 1) : 0;
    b.signGlow = Juice.lerp(b.signGlow, target, 0.08);

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

    ColorGrading.update(0);

    if (this.hud.introHintT > 0) this.hud.introHintT--;
  }

  _updateParticles(t: number): void {
    for (const m of this.spiritMotes) {
      m.x += m.vx + Math.sin(t * 0.001 + m.phase) * 0.08;
      m.y += m.vy;
      if (m.y < 200) {
        m.y = WORLD_H - 200;
        m.x = Math.random() * WORLD_W;
      }
      if (m.x < 0) m.x = WORLD_W;
      if (m.x > WORLD_W) m.x = 0;
    }

    this.burstParticles = this.burstParticles.filter((p) => p.life > 0);
    for (const p of this.burstParticles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.vy += 0.05;
      p.life--;
    }
  }

  // ============================================================
  // RENDER — layer order: sky → fog back → stand → player →
  //   light pools → fireflies → spirit motes → burst particles →
  //   fog front → dust motes → color grading → vignette → UI
  // ============================================================
  render(): void {
    const { ctx } = this;
    const t = this.t;

    const sh = Juice.shakeOffset();
    ctx.save();
    ctx.translate(sh.x, sh.y);

    this._drawSkyGradient();
    this.fog.drawBack(ctx, this.camera, t, W, H);
    this._drawBobaStand(t);
    this._drawPlayer(t);
    this._drawLightPools(t);
    this.flies.draw(ctx, this.camera, t, W, H);
    this._drawSpiritMotes(t);
    this._drawBurstParticles();
    this.fog.drawFront(ctx, this.camera, t, W, H);
    this.dust.draw(ctx, this.camera, t, W, H);
    ColorGrading.draw(ctx, W, H);
    this._drawVignette();

    ctx.restore();

    // UI — outside world transform, no atmosphere applied
    this._drawTitle(t);
    this._drawHint(t);
  }

  /* ---------- SKY GRADIENT (camera-relative, world-space) ---------- */
  _drawSkyGradient(): void {
    const ctx = this.ctx;
    const camY = this.camera.y;

    const SKY_BOTTOM = 1000;
    const skyTopScreen = -camY;
    const skyBottomScreen = SKY_BOTTOM - camY;

    if (skyBottomScreen > 0) {
      const g = ctx.createLinearGradient(0, skyTopScreen, 0, skyBottomScreen);
      g.addColorStop(0, PAL.skyTop);
      g.addColorStop(0.45, PAL.skyMid);
      g.addColorStop(0.85, PAL.skyBottom);
      g.addColorStop(1, PAL.skyHaze);
      ctx.fillStyle = g;
      const yStart = Math.max(0, skyTopScreen);
      const yEnd = Math.min(H, skyBottomScreen);
      ctx.fillRect(0, yStart, W, yEnd - yStart);

      // Sickly green horizon tint — atmospheric detail, not a full stand color
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const tintStartScreen = SKY_BOTTOM - 200 - camY;
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

    const GROUND_TOP = 850;
    const BLEED_HEIGHT = 350;
    const bleedTopScreen = GROUND_TOP - camY;
    const bleedBottomScreen = GROUND_TOP + BLEED_HEIGHT - camY;

    if (bleedBottomScreen > 0 && bleedTopScreen < H) {
      const g = ctx.createLinearGradient(0, bleedTopScreen, 0, bleedBottomScreen);
      g.addColorStop(0, 'rgba(58, 36, 88, 0)');
      g.addColorStop(0.18, PAL.groundFar);
      g.addColorStop(0.55, PAL.groundMid);
      g.addColorStop(1, PAL.groundDark);
      ctx.fillStyle = g;
      const yStart = Math.max(0, bleedTopScreen);
      const yEnd = Math.min(H, bleedBottomScreen);
      if (yEnd > yStart) ctx.fillRect(0, yStart, W, yEnd - yStart);
    }

    const solidGroundStartScreen = GROUND_TOP + BLEED_HEIGHT - camY;
    if (solidGroundStartScreen < H) {
      ctx.fillStyle = PAL.groundDark;
      const yStart = Math.max(0, solidGroundStartScreen);
      ctx.fillRect(0, yStart, W, H - yStart);
    }
  }

  /* ---------- BOBA STAND — image-only, no procedural fallback ---------- */
  _drawBobaStand(_t: number): void {
    if (!this.bobaHutImage) return;

    const ctx = this.ctx;
    const b = this.bobaStand;
    const DRAW_W = 500;
    const BOTTOM_Y = 1150;
    const CENTER_X = 1100;
    const drawH = this.bobaHutDrawH;

    const sx = CENTER_X - DRAW_W / 2 - this.camera.x;
    const sy = BOTTOM_Y - drawH - this.camera.y;

    if (sx + DRAW_W < -50 || sx > W + 50) return;

    ctx.drawImage(this.bobaHutImage, sx, sy, DRAW_W, drawH);

    if (b.wrong > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = b.wrong * 0.35;
      ctx.fillStyle = PAL.standWrongGlow;
      ctx.fillRect(sx, sy, DRAW_W, drawH);
      ctx.restore();
    }
  }

  /* ---------- PLAYER — circle placeholder or Blender sprite strip ---------- */
  _drawPlayer(_t: number): void {
    if (USE_SPRITE_PLAYER) {
      this._drawPlayerSprite();
      return;
    }

    const ctx = this.ctx;
    const wx = this.player.x - this.camera.x;
    const wy = this.player.y - this.camera.y;
    const RADIUS = 16;

    ctx.save();

    // Soft shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
    ctx.beginPath();
    ctx.ellipse(wx, wy + RADIUS - 2, RADIUS - 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = PAL.pink;
    ctx.beginPath();
    ctx.arc(wx, wy, RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Facing arrow — small filled triangle on the facing side
    const dir = this.player.facing;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(wx + dir * (RADIUS + 2), wy);
    ctx.lineTo(wx + dir * (RADIUS + 10), wy - 5);
    ctx.lineTo(wx + dir * (RADIUS + 10), wy + 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /* ---------- SPRITE PLAYER — draws from Critic 1 horizontal strip ---------- */
  _drawPlayerSprite(): void {
    // Determine animation + direction from current movement state
    const p = this.player;
    const moving = Math.abs(p.vx) + Math.abs(p.vy) > 0.4;
    const animation: 'idle' | 'walk' = moving ? 'walk' : 'idle';
    const fps = animation === 'walk' ? WALK_FPS : IDLE_FPS;
    const frameCount = animation === 'walk' ? WALK_FRAME_COUNT : IDLE_FRAME_COUNT;

    // Map velocity to 4-way direction; fall back to facing when nearly still
    const absVx = Math.abs(p.vx);
    const absVy = Math.abs(p.vy);
    let direction: 'front' | 'back' | 'left' | 'right';
    if (absVx > absVy) {
      direction = p.facing > 0 ? 'right' : 'left';
    } else if (absVy > 0.1) {
      direction = p.vy > 0 ? 'front' : 'back';
    } else {
      direction = p.facing > 0 ? 'right' : 'left';
    }

    const url = Sprites.characters['critic-1'][animation][direction];

    // Lazy-load the strip image; returns null until the image is ready
    let img = this._criticSprites.get(url);
    if (!img) {
      img = new Image();
      img.src = url;
      this._criticSprites.set(url, img);
    }
    if (!img.complete || img.naturalWidth === 0) return;

    // Index into the horizontal strip: frame 0 leftmost, each frame SPRITE_FRAME_SIZE wide
    const frameIndex = Math.floor((this.t / 60) * fps) % frameCount;
    const sx = frameIndex * SPRITE_FRAME_SIZE;

    const wx = this.player.x - this.camera.x;
    const wy = this.player.y - this.camera.y;

    // Anchor: bottom-center — feet at (wx, wy)
    const drawX = Math.round(wx - SPRITE_FRAME_SIZE / 2);
    const drawY = Math.round(wy - SPRITE_FRAME_SIZE);

    this.ctx.drawImage(
      img,
      sx,
      0,
      SPRITE_FRAME_SIZE,
      SPRITE_FRAME_SIZE,
      drawX,
      drawY,
      SPRITE_FRAME_SIZE,
      SPRITE_FRAME_SIZE
    );
  }

  /* ---------- LIGHT POOLS — boba stand neon + interior ---------- */
  _drawLightPools(t: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Neon sign — pulses and brightens when player is near
    const sx = this.bobaStand.x - this.camera.x + this.bobaStand.w / 2;
    const sy = this.bobaStand.y - this.camera.y - 10;
    const signI = 0.9 + 0.1 * Math.sin(t * 0.006) + this.bobaStand.signGlow * 0.4;
    const signR = 200 + this.bobaStand.signGlow * 60;
    const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, signR);
    sg.addColorStop(0, `rgba(255, 80, 200, ${(0.55 * signI).toFixed(2)})`);
    sg.addColorStop(0.45, `rgba(255, 80, 200, ${(0.18 * signI).toFixed(2)})`);
    sg.addColorStop(1, 'rgba(255, 80, 200, 0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(sx, sy, signR, 0, Math.PI * 2);
    ctx.fill();

    // Interior counter — warm or wrong-green depending on tonal cycle
    const ix = this.bobaStand.x - this.camera.x + this.bobaStand.w / 2;
    const iy = this.bobaStand.y - this.camera.y + 110;
    const wrong = this.bobaStand.wrong;
    const ig = ctx.createRadialGradient(ix, iy, 0, ix, iy, 140);
    if (wrong > 0) {
      ig.addColorStop(0, `rgba(150, 255, 138, ${(0.4 + 0.2 * wrong).toFixed(2)})`);
      ig.addColorStop(0.5, 'rgba(150, 255, 138, 0.12)');
      ig.addColorStop(1, 'rgba(150, 255, 138, 0)');
    } else {
      ig.addColorStop(0, 'rgba(255, 200, 110, 0.40)');
      ig.addColorStop(0.5, 'rgba(255, 180, 90, 0.12)');
      ig.addColorStop(1, 'rgba(255, 180, 90, 0)');
    }
    ctx.fillStyle = ig;
    ctx.beginPath();
    ctx.arc(ix, iy, 140, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /* ---------- SPIRIT MOTES — food-zone-specific ghost wisps ---------- */
  _drawSpiritMotes(t: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const m of this.spiritMotes) {
      const wx = m.x - this.camera.x,
        wy = m.y - this.camera.y;
      if (wx < -40 || wx > W + 40 || wy < -40 || wy > H + 40) continue;
      const pulse = 0.6 + 0.4 * Math.sin(t * m.speed + m.phase);
      const r = 10 + pulse * 8;
      const hex = m.color.replace('#', '');
      const cr = parseInt(hex.slice(0, 2), 16);
      const cg = parseInt(hex.slice(2, 4), 16);
      const cb = parseInt(hex.slice(4, 6), 16);
      const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, r);
      g.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${(0.55 * pulse).toFixed(2)})`);
      g.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(wx, wy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${Math.min(255, cr + 40)}, ${Math.min(255, cg + 40)}, ${Math.min(255, cb + 40)}, ${(pulse * 0.9).toFixed(2)})`;
      ctx.fillRect(wx - m.size / 2, wy - m.size / 2, m.size, m.size);
    }
    ctx.restore();
  }

  /* ---------- BURST PARTICLES ---------- */
  _drawBurstParticles(): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const p of this.burstParticles) {
      const wx = p.x - this.camera.x,
        wy = p.y - this.camera.y;
      const a = p.life / p.maxLife;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillRect(wx - p.size / 2, wy - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /* ---------- VIGNETTE ---------- */
  _drawVignette(): void {
    const ctx = this.ctx;
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.95);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, PAL.vignette);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  /* ---------- UI ---------- */
  _drawTitle(_t: number): void {
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

  _drawHint(_t: number): void {
    if (this.hud.introHintT <= 0) return;
    const a = clamp(this.hud.introHintT / 200, 0, 1);
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = a * 0.85;
    ctx.fillStyle = PAL.uiText;
    ctx.font = '16px "VT323", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('arrows / wasd to walk · SPACE to flicker the stand', 24, 22);
    ctx.restore();
  }
}
