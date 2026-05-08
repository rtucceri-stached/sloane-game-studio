/* ============================================================
 * SLOANE & DAD JUICE LIBRARY  v0.1
 * ------------------------------------------------------------
 * Tiny helpers to make games feel alive instead of boring.
 * ============================================================ */

const Juice = {

  // -- Easing -------------------------------------------------
  // Smoothly move `a` toward `b`. Use in update loops:
  //   player.x = Juice.lerp(player.x, target.x, 0.2);
  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  // Map a value from one range to another.
  //   const alpha = Juice.map(life, 0, 60, 0, 1);
  map(v, inMin, inMax, outMin, outMax) {
    return outMin + (outMax - outMin) * ((v - inMin) / (inMax - inMin));
  },

  // -- Screen shake -------------------------------------------
  // Call Juice.shake(8) on impact. Then in your draw():
  //   const s = Juice.shakeOffset();
  //   ctx.translate(s.x, s.y);
  shakeAmount: 0,
  shake(intensity) {
    if (intensity > this.shakeAmount) this.shakeAmount = intensity;
  },
  shakeOffset() {
    if (this.shakeAmount < 0.1) {
      this.shakeAmount = 0;
      return { x: 0, y: 0 };
    }
    const x = (Math.random() - 0.5) * this.shakeAmount * 2;
    const y = (Math.random() - 0.5) * this.shakeAmount * 2;
    this.shakeAmount *= 0.85; // decay
    return { x, y };
  },

  // -- Particles ----------------------------------------------
  // Returns an array of particle objects. Push them into your
  // game's particle list; update + draw them each frame.
  //   particles.push(...Juice.burst(x, y, 12, '#ffcc00'));
  //
  // Update each particle:
  //   p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= 1;
  // Remove when p.life <= 0.
  //
  // Draw:
  //   ctx.globalAlpha = p.life / p.maxLife;
  //   ctx.fillStyle = p.color;
  //   ctx.fillRect(p.x, p.y, p.size, p.size);
  burst(x, y, count = 12, color = '#ffcc00') {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      const life = 30 + Math.random() * 20;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        color,
        size: 2 + Math.random() * 3,
      });
    }
    return particles;
  },

  // -- Hit-stop -----------------------------------------------
  // Tiny time freeze on big impacts. Wrap your update loop with:
  //   if (!Juice.isFrozen()) { /* normal update */ }
  //   Juice.tickFreeze();
  // Trigger with: Juice.freeze(6);  // freeze for 6 frames
  _freezeFrames: 0,
  freeze(frames) { this._freezeFrames = Math.max(this._freezeFrames, frames); },
  isFrozen() { return this._freezeFrames > 0; },
  tickFreeze() { if (this._freezeFrames > 0) this._freezeFrames--; },

};
