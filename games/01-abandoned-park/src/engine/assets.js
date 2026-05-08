/* ============================================================
 * ASSETS — image + audio loader
 * ------------------------------------------------------------
 * Runtime "loaded at game start" step from ABANDONED_PARK_PLAN.md
 * → ASSET PIPELINE. Loads images and decoded AudioBuffers into a
 * single key→value Map so game code can `Assets.get('jim/head')`
 * without thinking about file types.
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

const _cache = new Map();

function loadImage(key, path) {
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

async function loadAudio(key, path, audioCtx) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to fetch audio "${key}" from ${path}: HTTP ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  _cache.set(key, audioBuffer);
  return audioBuffer;
}

function loadAll(manifest, audioCtx, onProgress) {
  let loaded = 0;
  const total = manifest.length;
  const tick = (value) => {
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

function get(key) {
  return _cache.has(key) ? _cache.get(key) : null;
}

function isLoaded(key) {
  return _cache.has(key);
}

function clear() {
  _cache.clear();
}

export const Assets = { loadImage, loadAudio, loadAll, get, isLoaded, clear };
