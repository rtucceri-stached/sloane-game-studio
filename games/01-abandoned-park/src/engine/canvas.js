/* ============================================================
 * SLOANE & DAD CANVAS HELPER  v0.1  (ES module port)
 * ------------------------------------------------------------
 * Makes a canvas fit ANY screen (desktop browser, phone,
 * tablet) while keeping a fixed "logical" game size you can
 * code against. The browser scales it up or down for you.
 *
 * USAGE:
 *   import { Canvas } from './engine/canvas.js';
 *   const canvas = document.getElementById('game');
 *   Canvas.fit(canvas, 480, 270);  // logical game size
 *
 *   // Now your game code uses 480 x 270 coordinates,
 *   // no matter how big or small the screen is.
 * ============================================================ */

export const Canvas = (function () {
  let _canvas = null;
  let _logicalW = 0;
  let _logicalH = 0;

  function fit(canvas, logicalW, logicalH) {
    _canvas = canvas;
    _logicalW = logicalW;
    _logicalH = logicalH;
    // The internal pixel grid stays fixed at the logical size.
    canvas.width = logicalW;
    canvas.height = logicalH;
    // The CSS size scales to the window.
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
  }

  function resize() {
    if (!_canvas) return;
    const padding = 16;
    const maxW = window.innerWidth - padding * 2;
    const maxH = window.innerHeight - padding * 2;
    const scale = Math.min(maxW / _logicalW, maxH / _logicalH);
    _canvas.style.width  = Math.floor(_logicalW * scale) + 'px';
    _canvas.style.height = Math.floor(_logicalH * scale) + 'px';
  }

  function logicalSize() {
    return { w: _logicalW, h: _logicalH };
  }

  return { fit, resize, logicalSize };
})();
