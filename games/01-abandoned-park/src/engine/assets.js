// TODO: Implement image + audio loader.
// See ABANDONED_PARK_PLAN.md → "ASSET PIPELINE" for the flow:
// reference image → PIL chroma cleanup + crop → polygon masks per body part
// (characters) or drop-in (props) → loaded at game start. This module is the
// runtime "loaded at game start" step — preloads images and audio buffers,
// exposes them via Assets.image('player/head') / Assets.sound('coin').

export const Assets = {};
