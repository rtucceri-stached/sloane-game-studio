/* ============================================================
 * COLOR GRADING — global tint overlay for per-scene mood
 * ------------------------------------------------------------
 * Eases current intensity toward a target color/intensity.
 * Draw just before the vignette pass, after all world geometry.
 * Default state: fully transparent (no tint).
 * ============================================================ */

import { Juice } from './juice.js';

let _targetColor = '#000000';
let _targetIntensity = 0;
let _currentIntensity = 0;

function _hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export const ColorGrading = {
  setGrade(color: string, intensity: number): void {
    _targetColor = color;
    _targetIntensity = intensity;
  },

  update(_dt: number): void {
    _currentIntensity = Juice.lerp(_currentIntensity, _targetIntensity, 0.05);
  },

  draw(ctx: CanvasRenderingContext2D, W: number, H: number): void {
    if (_currentIntensity < 0.005) return;
    const [r, g, b] = _hexToRgb(_targetColor);
    ctx.save();
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${_currentIntensity.toFixed(3)})`;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  },
};
