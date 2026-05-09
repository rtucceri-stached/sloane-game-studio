/* ============================================================
 * ASSETS — image + audio loader with graceful fallback
 * ------------------------------------------------------------
 * Runtime "loaded at game start" step from ABANDONED_PARK_PLAN.md
 * → ASSET PIPELINE. Loads images and decoded AudioBuffers into a
 * single key→value Map so game code can `Assets.get('jim/head')`
 * without thinking about file types.
 *
 * Failed loads never throw: images fall back to a magenta-and-black
 * checker canvas, audio falls back to a silent AudioBuffer. Both
 * paths report via ErrorOverlay so the failure is visible in-game.
 *
 * USAGE:
 *   import { Assets } from './engine/assets.js';
 *   await Assets.loadAll([
 *     { key: 'streetlamp', type: 'image', path: '/assets/props/streetlamp.png' },
 *     { key: 'wind',       type: 'audio', path: '/assets/audio/ambient/wind.mp3' },
 *   ], audioCtx, (n, total) => console.log(`${n}/${total}`));
 *
 *   const img = Assets.get('streetlamp');
 * ============================================================ */

import { ErrorOverlay } from './error-overlay.js';

export interface AssetItem {
  key: string;
  type: 'image' | 'audio';
  path: string;
}

type CachedAsset = HTMLImageElement | HTMLCanvasElement | AudioBuffer;

const _cache = new Map<string, CachedAsset>();

function _makeChecker(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const cx = c.getContext('2d')!;
  for (let y = 0; y < 64; y += 8) {
    for (let x = 0; x < 64; x += 8) {
      cx.fillStyle = ((x >> 3) + (y >> 3)) % 2 === 0 ? '#ff00ff' : '#000000';
      cx.fillRect(x, y, 8, 8);
    }
  }
  return c;
}

function _loadImageRaw(key: string, path: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      _cache.set(key, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load image "${key}" from ${path}`));
    img.src = path;
  });
}

async function _loadAudioRaw(
  key: string,
  path: string,
  audioCtx: AudioContext
): Promise<AudioBuffer> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching audio "${key}" from ${path}`);
  const arrayBuffer = await res.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  _cache.set(key, audioBuffer);
  return audioBuffer;
}

async function loadImage(key: string, path: string): Promise<HTMLImageElement | HTMLCanvasElement> {
  try {
    return await _loadImageRaw(key, path);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    ErrorOverlay.report(`Image load failed: ${key} — ${msg}`, 'assets');
    const checker = _makeChecker();
    _cache.set(key, checker);
    return checker;
  }
}

async function loadAudio(key: string, path: string, audioCtx: AudioContext): Promise<AudioBuffer> {
  try {
    return await _loadAudioRaw(key, path, audioCtx);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    ErrorOverlay.report(`Audio load failed: ${key} — ${msg}`, 'assets');
    const silent = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
    _cache.set(key, silent);
    return silent;
  }
}

function loadAll(
  manifest: AssetItem[],
  audioCtx: AudioContext,
  onProgress?: (n: number, total: number) => void
): Promise<CachedAsset[]> {
  let loaded = 0;
  const total = manifest.length;
  const tick = (value: CachedAsset): CachedAsset => {
    loaded++;
    if (onProgress) onProgress(loaded, total);
    return value;
  };
  const promises = manifest.map((item) => {
    if (item.type === 'image') return loadImage(item.key, item.path).then(tick);
    if (item.type === 'audio') return loadAudio(item.key, item.path, audioCtx).then(tick);
    return Promise.reject(new Error(`Unknown asset type "${item.type}" for "${item.key}"`));
  });
  return Promise.all(promises);
}

function get(key: string): CachedAsset | null {
  return _cache.has(key) ? (_cache.get(key) as CachedAsset) : null;
}

function isLoaded(key: string): boolean {
  return _cache.has(key);
}

function clear(): void {
  _cache.clear();
}

export const Assets = { loadImage, loadAudio, loadAll, get, isLoaded, clear };
