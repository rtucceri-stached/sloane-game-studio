/* ============================================================
 * ABANDONED PARK — main entry
 * ------------------------------------------------------------
 * Scaffolding-only hello-world. Proves the Vite + ES-module
 * engine wiring works end to end. Real game scenes get added
 * on top of this loop in later phases — see
 * ABANDONED_PARK_PLAN.md → "BUILD ORDER / ROADMAP".
 * ============================================================ */

import { Canvas } from './engine/canvas.js';
import { Input } from './engine/input.js';
import { Juice } from './engine/juice.js';
import { Sound } from './engine/sound.js';

// Imported so Vite tracks them and they're ready for the next phase.
// (No-op while their bodies are stubs.)
import './engine/skeleton.js';
import './engine/assets.js';
import './engine/save.js';

// Logical resolution — pixel-art bar from the Bigfoot game.
// Real coordinate space the rest of the codebase will reason in.
const LOGICAL_W = 480;
const LOGICAL_H = 270;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

Canvas.fit(canvas, LOGICAL_W, LOGICAL_H);

function frame() {
  // -- update --
  Input.endFrame();
  Juice.tickFreeze();

  // -- draw --
  ctx.fillStyle = '#0a0518';
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

  ctx.fillStyle = '#f4eaff';
  ctx.font = "600 28px 'Cormorant Garamond', serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Abandoned Park — coming soon', LOGICAL_W / 2, LOGICAL_H / 2);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

// Touch quietly enables itself on phones; harmless on desktop.
Input.enableTouchControls();

// Reference Sound so tree-shaking can't drop it before we use it.
void Sound;
