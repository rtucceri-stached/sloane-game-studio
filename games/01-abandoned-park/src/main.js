/* ============================================================
 * ABANDONED PARK — main entry
 * ------------------------------------------------------------
 * Sets up canvas + RAF loop, hands frames to the FoodZone scene.
 * Future zones (games, rides) will get their own modules under
 * src/world/ and route through here.
 * ============================================================ */

import { Canvas } from './engine/canvas.js';
import { Input } from './engine/input.js';
import { FoodZone } from './world/food-zone.js';

// Pre-load engine stubs so Vite tracks them for the next phases.
import './engine/skeleton.js';
import './engine/assets.js';
import './engine/save.js';

const CANVAS_W = 800;
const CANVAS_H = 500;

const canvas = document.getElementById('game');
Canvas.fit(canvas, CANVAS_W, CANVAS_H);

const scene = new FoodZone(canvas);

Input.enableTouchControls();

let lastT = performance.now();
function frame(now) {
  const dt = Math.min(33, now - lastT);
  lastT = now;
  scene.update(dt);
  scene.render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
