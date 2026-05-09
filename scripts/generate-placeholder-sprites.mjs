/**
 * generate-placeholder-sprites.mjs
 * Writes magenta-and-black checker placeholder PNGs for a character before real renders land.
 * Run once: node scripts/generate-placeholder-sprites.mjs
 * Reuse for future characters by changing CHARACTER_NAME at the top.
 *
 * Zero new npm deps — uses Node.js built-in zlib + raw PNG encoding.
 * Output strip dimensions: idle = 3072×512 (6 frames), walk = 6144×512 (12 frames).
 */

import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');

const CHARACTER_NAME = 'critic-1';
const FRAME_SIZE = 512;
const IDLE_FRAME_COUNT = 6;
const WALK_FRAME_COUNT = 12;
const CHECKER_CELL = 32; // px per checker square side

// 5-wide × 7-tall bitmap font (column-major, bit 0 = topmost row).
// Drawn from the public-domain Adafruit GFX 5x7 glcdfont — only the glyphs we need.
// prettier-ignore
const FONT = {
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00],
  // uppercase — used in "PLACEHOLDER"
  'A': [0x7E, 0x11, 0x11, 0x11, 0x7E],
  'C': [0x3E, 0x41, 0x41, 0x41, 0x22],
  'D': [0x7F, 0x41, 0x41, 0x22, 0x1C],
  'E': [0x7F, 0x49, 0x49, 0x49, 0x41],
  'H': [0x7F, 0x08, 0x08, 0x08, 0x7F],
  'L': [0x7F, 0x40, 0x40, 0x40, 0x40],
  'O': [0x3E, 0x41, 0x41, 0x41, 0x3E],
  'P': [0x7F, 0x09, 0x09, 0x09, 0x06],
  'R': [0x7F, 0x09, 0x19, 0x29, 0x46],
  // lowercase — used in character/animation/direction labels
  'a': [0x20, 0x54, 0x54, 0x54, 0x78],
  'b': [0x7F, 0x44, 0x44, 0x44, 0x38],
  'c': [0x38, 0x44, 0x44, 0x44, 0x20],
  'd': [0x38, 0x44, 0x44, 0x48, 0x7F],
  'e': [0x38, 0x54, 0x54, 0x54, 0x18],
  'f': [0x08, 0x7E, 0x09, 0x01, 0x02],
  'g': [0x0C, 0x52, 0x52, 0x52, 0x3E],
  'h': [0x7F, 0x08, 0x08, 0x08, 0x78],
  'i': [0x00, 0x44, 0x7D, 0x40, 0x00],
  'k': [0x7F, 0x10, 0x28, 0x44, 0x00],
  'l': [0x00, 0x41, 0x7F, 0x40, 0x00],
  'n': [0x7C, 0x04, 0x04, 0x04, 0x78],
  'o': [0x38, 0x44, 0x44, 0x44, 0x38],
  'r': [0x7C, 0x08, 0x08, 0x08, 0x00],
  't': [0x04, 0x3F, 0x44, 0x40, 0x20],
  'u': [0x3C, 0x40, 0x40, 0x40, 0x7C],
  'w': [0x3C, 0x40, 0x30, 0x40, 0x3C],
  // digits and punctuation
  '0': [0x3E, 0x51, 0x49, 0x45, 0x3E],
  '1': [0x00, 0x42, 0x7F, 0x40, 0x00],
  '-': [0x08, 0x08, 0x08, 0x08, 0x08],
  '/': [0x20, 0x10, 0x08, 0x04, 0x02],
};

// ---- CRC32 (ISO 3309 / PNG spec) -----------------------------------------

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.allocUnsafe(4);
  lenBuf.writeUInt32BE(data.length);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// ---- PNG encoder (RGBA, no interlace) ------------------------------------

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function encodePng(width, height, rgba) {
  // Build filter-byte-prefixed scanlines (filter 0 = None for every row)
  const scanlineLen = 1 + width * 4;
  const raw = Buffer.alloc(scanlineLen * height);
  for (let y = 0; y < height; y++) {
    raw[y * scanlineLen] = 0;
    const src = rgba.byteOffset + y * width * 4;
    Buffer.from(rgba.buffer, src, width * 4).copy(raw, y * scanlineLen + 1);
  }

  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA truecolor
  ihdr[10] = ihdr[11] = ihdr[12] = 0;

  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 1 })), // fast compression — placeholder quality
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- Bitmap text renderer ------------------------------------------------

function drawChar(rgba, imgW, imgH, ch, px, py, scale, r, g, b) {
  const cols = FONT[ch] ?? FONT[' '];
  for (let col = 0; col < 5; col++) {
    const colData = cols[col];
    for (let row = 0; row < 7; row++) {
      if (!(colData & (1 << row))) continue;
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const x = px + col * scale + sx;
          const y = py + row * scale + sy;
          if (x < 0 || x >= imgW || y < 0 || y >= imgH) continue;
          const idx = (y * imgW + x) * 4;
          rgba[idx] = r;
          rgba[idx + 1] = g;
          rgba[idx + 2] = b;
          rgba[idx + 3] = 255;
        }
      }
    }
  }
}

function drawText(rgba, imgW, imgH, text, startX, startY, scale, r, g, b) {
  const advance = (5 + 1) * scale;
  for (let i = 0; i < text.length; i++) {
    drawChar(rgba, imgW, imgH, text[i], startX + i * advance, startY, scale, r, g, b);
  }
}

function textWidth(text, scale) {
  return text.length * (5 + 1) * scale;
}

// ---- Placeholder generator -----------------------------------------------

function generatePlaceholder(charName, animation, direction, frameCount) {
  const W = FRAME_SIZE * frameCount;
  const H = FRAME_SIZE;
  const rgba = new Uint8Array(W * H * 4);

  // Magenta (#FF00FF) and black (#000000) checker
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const checker = (Math.floor(x / CHECKER_CELL) + Math.floor(y / CHECKER_CELL)) % 2;
      const idx = (y * W + x) * 4;
      rgba[idx] = checker ? 255 : 0;
      rgba[idx + 1] = 0;
      rgba[idx + 2] = checker ? 255 : 0;
      rgba[idx + 3] = 255;
    }
  }

  // Per-frame label: "PLACEHOLDER" + slot path
  const title = 'PLACEHOLDER';
  const slot = `${charName}/${animation}/${direction}`;
  const scale = 3;

  for (let frame = 0; frame < frameCount; frame++) {
    const cx = frame * FRAME_SIZE + FRAME_SIZE / 2;
    const y1 = Math.floor(H * 0.35);
    const y2 = y1 + 7 * scale + scale * 3;
    drawText(rgba, W, H, title, Math.round(cx - textWidth(title, scale) / 2), y1, scale, 255, 255, 255);
    drawText(rgba, W, H, slot, Math.round(cx - textWidth(slot, scale) / 2), y2, scale, 255, 255, 180);
  }

  return encodePng(W, H, rgba);
}

// ---- Main ----------------------------------------------------------------

const ANIMATIONS = { idle: IDLE_FRAME_COUNT, walk: WALK_FRAME_COUNT };
const DIRECTIONS = ['front', 'back', 'left', 'right'];
const SPRITES_DIR = join(ROOT, 'public', 'sprites', 'characters', CHARACTER_NAME);

let count = 0;
for (const [animation, frameCount] of Object.entries(ANIMATIONS)) {
  const animDir = join(SPRITES_DIR, animation);
  if (!existsSync(animDir)) mkdirSync(animDir, { recursive: true });
  for (const direction of DIRECTIONS) {
    const outPath = join(animDir, `${direction}.png`);
    writeFileSync(outPath, generatePlaceholder(CHARACTER_NAME, animation, direction, frameCount));
    const stripW = FRAME_SIZE * frameCount;
    console.log(`  ${animation}/${direction}.png  (${stripW}×${FRAME_SIZE})`);
    count++;
  }
}
console.log(`\nDone — ${count} placeholder PNGs written to public/sprites/characters/${CHARACTER_NAME}/`);
console.log('Next step: npm run build:manifest');
