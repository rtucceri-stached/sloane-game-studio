/* ============================================================
 * SLOANE & DAD SOUND  v0.1  (ES module port)
 * ------------------------------------------------------------
 * Procedural sound effects via Web Audio. NO audio files needed!
 * Every game gets satisfying sounds for free.
 *
 *   import { Sound } from './engine/sound.js';
 *
 * USAGE — built-in presets:
 *   Sound.play('jump');
 *   Sound.play('hit');
 *   Sound.play('coin');
 *   Sound.play('powerup');
 *   Sound.play('explosion');
 *   Sound.play('click');
 *   Sound.play('win');
 *   Sound.play('lose');
 *
 * USAGE — custom beep:
 *   Sound.beep({ freq: 880, freqEnd: 220, duration: 0.15, type: 'square' });
 *
 * Mute everything: Sound.mute = true;
 * ============================================================ */

interface BeepOpts {
  freq?: number;
  freqEnd?: number;
  duration?: number;
  type?: OscillatorType;
  volume?: number;
}

interface NoiseOpts {
  duration?: number;
  volume?: number;
  lowpass?: number;
}

export const Sound = (function () {
  let ctx: AudioContext | null = null;

  // Browsers require a user gesture before playing audio.
  // We lazy-init the AudioContext on first interaction.
  function ensureCtx() {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  ['click', 'keydown', 'touchstart'].forEach((evt) => {
    window.addEventListener(evt, ensureCtx, { once: false, passive: true });
  });

  // -- Tone generator ------------------------------------------
  function beep({
    freq = 440,
    freqEnd,
    duration = 0.1,
    type = 'square' as OscillatorType,
    volume = 0.2,
  }: BeepOpts): void {
    const c = ensureCtx();
    if (!c || api.mute) return;
    const end = freqEnd ?? freq;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    if (end !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, end), c.currentTime + duration);
    }
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration + 0.02);
  }

  // -- Noise burst (for explosions / hits) ---------------------
  function noise({ duration = 0.2, volume = 0.2, lowpass = 2000 }: NoiseOpts): void {
    const c = ensureCtx();
    if (!c || api.mute) return;
    const bufferSize = Math.floor(c.sampleRate * duration);
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(lowpass, c.currentTime);
    const gain = c.createGain();
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
    src.connect(filter).connect(gain).connect(c.destination);
    src.start();
  }

  // -- Built-in presets ----------------------------------------
  const PRESETS: Record<string, (() => void) | undefined> = {
    jump: () => beep({ freq: 300, freqEnd: 700, duration: 0.12, type: 'square' }),
    hit: () => beep({ freq: 200, freqEnd: 80, duration: 0.1, type: 'square' }),
    coin: () => {
      beep({ freq: 800, duration: 0.05 });
      setTimeout(() => beep({ freq: 1200, duration: 0.08 }), 50);
    },
    powerup: () => {
      beep({ freq: 400, freqEnd: 800, duration: 0.08 });
      setTimeout(() => beep({ freq: 800, freqEnd: 1200, duration: 0.12 }), 80);
    },
    explosion: () => noise({ duration: 0.35, volume: 0.3, lowpass: 1200 }),
    click: () => beep({ freq: 1000, duration: 0.03, type: 'square', volume: 0.1 }),
    win: () => {
      [400, 500, 600, 800].forEach((f, i) =>
        setTimeout(() => beep({ freq: f, duration: 0.12 }), i * 80)
      );
    },
    lose: () => {
      [400, 350, 300, 200].forEach((f, i) =>
        setTimeout(() => beep({ freq: f, duration: 0.18 }), i * 100)
      );
    },
  };

  const api = {
    mute: false,
    play(nameOrConfig: string | BeepOpts): void {
      if (typeof nameOrConfig === 'string') {
        const preset = PRESETS[nameOrConfig];
        if (preset) preset();
        else console.warn('Sound: unknown preset:', nameOrConfig);
      } else if (nameOrConfig && typeof nameOrConfig === 'object') {
        beep(nameOrConfig);
      }
    },
    beep,
    noise,
  };

  return api;
})();
