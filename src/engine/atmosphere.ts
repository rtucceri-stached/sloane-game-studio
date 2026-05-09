/* ============================================================
 * ATMOSPHERE — reusable visual systems
 * ------------------------------------------------------------
 * Every world (food zone, future games/rides zones) runs the same
 * stack: sky → fog (back) → ground texture → … → fireflies → fog
 * (front) → dust motes → vignette. Mixed-media art (illustrated,
 * photoreal, procedural) is unified by these passes — not by
 * matching art styles.
 *
 * Technical reference: games/bigfoot-and-ghost-ep1.html.
 * Bigfoot uses 60 fireflies / 16 fog / 80 dust motes for a
 * 2400×1700 world; we scale ~1.44× by area for 2880×2040.
 * ============================================================ */

interface FogPuff {
  x: number;
  y: number;
  r: number;
  vx: number;
  alpha: number;
  phase: number;
}

interface AtmDustMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  phase: number;
}

interface AtmFirefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
  depth: number;
}

interface GroundMark {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rot: number;
  color: string;
}

interface SkyPalette {
  skyTop?: string;
  skyUpper?: string;
  skyMid?: string;
  skyLow?: string;
  horizonBleed?: string;
}

interface Cam {
  x: number;
  y: number;
}

// -- SkyGradient --------------------------------------------
// Top-to-bottom palette gradient with a horizon bleed band so
// the sky-to-ground transition is soft, not a hard seam.
export const SkyGradient = {
  draw(ctx: CanvasRenderingContext2D, palette: SkyPalette, W: number, H: number): void {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, palette.skyTop || '#030108');
    g.addColorStop(0.33, palette.skyUpper || '#0a0415');
    g.addColorStop(0.66, palette.skyMid || '#120630');
    g.addColorStop(1, palette.skyLow || '#1e0a42');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Horizon bleed — fade from sky-low into ground tone over the
    // bottom 45% of the canvas. Eliminates the hard seam.
    if (palette.horizonBleed) {
      const hg = ctx.createLinearGradient(0, H * 0.55, 0, H);
      hg.addColorStop(0, 'rgba(0, 0, 0, 0)');
      hg.addColorStop(1, palette.horizonBleed);
      ctx.fillStyle = hg;
      ctx.fillRect(0, H * 0.55, W, H * 0.45);
    }
  },
};

// -- Vignette -----------------------------------------------
// Radial dark overlay. Drawn last in world space, before UI.
export const Vignette = {
  draw(ctx: CanvasRenderingContext2D, W: number, H: number, intensity: number = 0.78): void {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.85);
    g.addColorStop(0, 'rgba(0, 0, 0, 0)');
    g.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  },
};

// -- LightPool ----------------------------------------------
// Additive radial gradient using globalCompositeOperation='screen'.
// THE helper every glowing prop should use — no ad-hoc radials.
export const LightPool = {
  draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
    intensity: number = 1.0
  ): void {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.55 * intensity})`);
    grad.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, ${0.18 * intensity})`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};

interface FogConfig {
  colorBack?: string;
  colorFront?: string;
  parallaxBack?: number;
  parallaxFront?: number;
}

// -- FogSystem ----------------------------------------------
// Two layers — back fog (denser, slower) sits behind midground;
// front fog (lighter, faster) sits in front of player. Each puff
// has its own breathing phase. Color and parallax are configurable
// so each scene can tune the look without duplicating the system.
export class FogSystem {
  back: FogPuff[];
  front: FogPuff[];
  worldW: number;
  worldH: number;
  colorBack: string;
  colorFront: string;
  parallaxBack: number;
  parallaxFront: number;

  constructor() {
    this.back = [];
    this.front = [];
    this.worldW = 0;
    this.worldH = 0;
    this.colorBack = 'rgba(180, 160, 220,';
    this.colorFront = 'rgba(180, 160, 220,';
    this.parallaxBack = 0.92;
    this.parallaxFront = 0.85;
  }

  init(worldW: number, worldH: number, count: number = 24, config?: FogConfig): void {
    this.worldW = worldW;
    this.worldH = worldH;
    if (config?.colorBack) this.colorBack = config.colorBack;
    if (config?.colorFront) this.colorFront = config.colorFront;
    if (config?.parallaxBack !== undefined) this.parallaxBack = config.parallaxBack;
    if (config?.parallaxFront !== undefined) this.parallaxFront = config.parallaxFront;

    const backN = Math.round(count * 0.66);
    const frontN = count - backN;

    this.back = [];
    for (let i = 0; i < backN; i++) {
      this.back.push({
        x: Math.random() * worldW,
        y: 700 + Math.random() * (worldH - 800),
        r: 240 + Math.random() * 320,
        vx: -0.06 - Math.random() * 0.1,
        alpha: 0.06 + Math.random() * 0.05,
        phase: Math.random() * Math.PI * 2,
      });
    }

    this.front = [];
    for (let i = 0; i < frontN; i++) {
      this.front.push({
        x: Math.random() * worldW,
        y: 800 + Math.random() * (worldH - 900),
        r: 160 + Math.random() * 220,
        vx: -0.18 - Math.random() * 0.2,
        alpha: 0.025 + Math.random() * 0.035,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  update(_dt: number): void {
    for (const f of this.back) {
      f.x += f.vx;
      if (f.x < -f.r) f.x = this.worldW + f.r;
    }
    for (const f of this.front) {
      f.x += f.vx;
      if (f.x < -f.r) f.x = this.worldW + f.r;
    }
  }

  drawBack(ctx: CanvasRenderingContext2D, cam: Cam, t: number, visW: number, visH: number): void {
    this._drawLayer(ctx, this.back, cam, t, this.parallaxBack, visW, visH, this.colorBack);
  }
  drawFront(ctx: CanvasRenderingContext2D, cam: Cam, t: number, visW: number, visH: number): void {
    this._drawLayer(ctx, this.front, cam, t, this.parallaxFront, visW, visH, this.colorFront);
  }
  _drawLayer(
    ctx: CanvasRenderingContext2D,
    list: FogPuff[],
    cam: Cam,
    t: number,
    parallax: number,
    visW: number,
    visH: number,
    color: string
  ): void {
    ctx.save();
    for (const f of list) {
      const wx = f.x - cam.x * parallax;
      const wy = f.y - cam.y * parallax;
      if (wx < -f.r * 1.5 || wx > visW + f.r * 1.5) continue;
      if (wy < -f.r * 1.5 || wy > visH + f.r * 1.5) continue;
      const breathe = 0.85 + 0.15 * Math.sin(t * 0.0009 + f.phase);
      const r = f.r * breathe;
      const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, r);
      g.addColorStop(0, `${color} ${f.alpha})`);
      g.addColorStop(1, `${color} 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(wx, wy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// -- DustMoteSystem -----------------------------------------
// Tiny 1–2px sparks drifting up + sideways. ~120 motes for our
// 2880×2040 world. Recycle when they exit the world bounds.
export class DustMoteSystem {
  motes: AtmDustMote[];
  worldW: number;
  worldH: number;

  constructor() {
    this.motes = [];
    this.worldW = 0;
    this.worldH = 0;
  }

  init(worldW: number, worldH: number, count: number = 120): void {
    this.worldW = worldW;
    this.worldH = worldH;
    this.motes = [];
    for (let i = 0; i < count; i++) {
      this.motes.push({
        x: Math.random() * worldW,
        y: 100 + Math.random() * (worldH - 200),
        vx: (Math.random() - 0.5) * 0.18,
        vy: -0.05 - Math.random() * 0.13,
        life: Math.random() * 240,
        size: 0.5 + Math.random() * 1.0,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  update(_dt: number): void {
    for (const m of this.motes) {
      m.x += m.vx;
      m.y += m.vy;
      m.life++;
      if (
        m.life > 240 + Math.random() * 100 ||
        m.x < 0 ||
        m.x > this.worldW ||
        m.y < 50 ||
        m.y > this.worldH - 50
      ) {
        m.x = Math.random() * this.worldW;
        m.y = 100 + Math.random() * (this.worldH - 200);
        m.vx = (Math.random() - 0.5) * 0.18;
        m.vy = -0.05 - Math.random() * 0.13;
        m.life = 0;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, cam: Cam, t: number, visW: number, visH: number): void {
    ctx.save();
    for (const m of this.motes) {
      const wx = m.x - cam.x;
      const wy = m.y - cam.y;
      if (wx < -10 || wx > visW + 10 || wy < -10 || wy > visH + 10) continue;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.004 + m.phase));
      ctx.fillStyle = `rgba(240, 220, 200, ${0.45 * tw})`;
      ctx.fillRect(wx, wy, m.size, m.size);
    }
    ctx.restore();
  }
}

// -- FireflySystem ------------------------------------------
// Warm yellow additive motes (~80) at varying depth, blinking
// via sin(t * speed + phase), wandering vx/vy. Renders at layer
// 11 (after lights, before front fog). Ports the Bigfoot pattern.
export class FireflySystem {
  flies: AtmFirefly[];
  worldW: number;
  worldH: number;

  constructor() {
    this.flies = [];
    this.worldW = 0;
    this.worldH = 0;
  }

  init(worldW: number, worldH: number, count: number = 80): void {
    this.worldW = worldW;
    this.worldH = worldH;
    this.flies = [];
    for (let i = 0; i < count; i++) {
      this.flies.push({
        x: Math.random() * worldW,
        y: 200 + Math.random() * (worldH - 400),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.04 + Math.random() * 0.04,
        depth: 0.55 + Math.random() * 0.45,
      });
    }
  }

  update(_dt: number): void {
    for (const f of this.flies) {
      f.x += f.vx;
      f.y += f.vy;
      f.vx += (Math.random() - 0.5) * 0.05;
      f.vy += (Math.random() - 0.5) * 0.05;
      if (f.vx > 0.6) f.vx = 0.6;
      if (f.vx < -0.6) f.vx = -0.6;
      if (f.vy > 0.6) f.vy = 0.6;
      if (f.vy < -0.6) f.vy = -0.6;
      if (f.x < 0) f.x = this.worldW;
      if (f.x > this.worldW) f.x = 0;
      if (f.y < 200) f.y = this.worldH - 200;
      if (f.y > this.worldH - 200) f.y = 200;
    }
  }

  draw(ctx: CanvasRenderingContext2D, cam: Cam, t: number, visW: number, visH: number): void {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const f of this.flies) {
      const wx = f.x - cam.x;
      const wy = f.y - cam.y;
      if (wx < -40 || wx > visW + 40 || wy < -40 || wy > visH + 40) continue;
      const blink = 0.4 + 0.6 * Math.abs(Math.sin(t * f.speed + f.phase));
      const r = (5 + blink * 5) * f.depth;
      const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, r);
      g.addColorStop(0, `rgba(255, 215, 107, ${0.85 * blink})`);
      g.addColorStop(1, 'rgba(255, 215, 107, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(wx, wy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 240, 180, ${blink})`;
      ctx.fillRect(wx - 0.5, wy - 0.5, 1, 1);
    }
    ctx.restore();
  }
}

// -- GroundTexture ------------------------------------------
// Faint scuff marks / ambient occlusion blobs distributed across
// the entire walkable area + a soft camera-centered radial darken
// so the player's footing reads. Stable layout via seeded RNG.
export class GroundTexture {
  marks: GroundMark[];
  worldW: number;
  worldH: number;

  constructor() {
    this.marks = [];
    this.worldW = 0;
    this.worldH = 0;
  }

  init(worldW: number, worldH: number, count: number = 200): void {
    this.worldW = worldW;
    this.worldH = worldH;
    this.marks = [];
    const colors = [
      'rgba(40, 30, 20, 0.40)',
      'rgba(70, 55, 45, 0.32)',
      'rgba(100, 80, 70, 0.22)',
      'rgba(60, 45, 35, 0.30)',
    ];
    let seed = 5151;
    const rng = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = 0; i < count; i++) {
      this.marks.push({
        x: rng() * worldW,
        y: 600 + rng() * (worldH - 700),
        rx: 14 + rng() * 32,
        ry: 4 + rng() * 8,
        rot: rng() * Math.PI * 2,
        color: colors[Math.floor(rng() * colors.length)],
      });
    }
  }

  draw(ctx: CanvasRenderingContext2D, cam: Cam, visW: number, visH: number): void {
    ctx.save();
    for (const m of this.marks) {
      const wx = m.x - cam.x;
      const wy = m.y - cam.y;
      if (wx < -60 || wx > visW + 60 || wy < -30 || wy > visH + 30) continue;
      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(m.rot);
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, m.rx, m.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Camera-centered radial darken — softens the visible footing.
    ctx.save();
    const cx = visW / 2;
    const cy = visH * 0.65;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, visH * 0.6);
    g.addColorStop(0, 'rgba(50, 35, 28, 0.18)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, visW, visH);
    ctx.restore();
  }
}
