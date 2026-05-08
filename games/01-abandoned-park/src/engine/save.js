/* ============================================================
 * SAVE — multi-profile localStorage save system
 * ------------------------------------------------------------
 * One localStorage key holds the whole save state:
 *   { active: <id|null>, profiles: { <id>: {...}, ... } }
 * The inner `profiles` object is keyed by profile ID per spec;
 * the `active` field rides along so we don't need a second key.
 *
 * See ABANDONED_PARK_PLAN.md → "TECH STACK" + "SHAREABILITY".
 * Profile = name + saved progress (cleared stands, tickets,
 * found clues, current night). World state and player state
 * stay separated so multiplayer can layer on later.
 * ============================================================ */

const STORAGE_KEY = 'sloane-park-profiles';

// Gameplay defaults. Meta fields (id/name/createdAt/lastPlayed)
// get filled in by createProfile so they don't appear here.
const DEFAULT_GAME_DATA = {
  currentNight: 1,
  tickets: 30,
  clearedStands: [],
  discoveredClues: [],
  currentZone: 'food',
  totalGhostsCaught: 0,
};

// -- Internal storage helpers --------------------------------

function _read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { active: null, profiles: {} };
    const parsed = JSON.parse(raw);
    return {
      active: parsed.active ?? null,
      profiles: parsed.profiles ?? {},
    };
  } catch {
    // Corrupt JSON — start fresh rather than crash the game.
    return { active: null, profiles: {} };
  }
}

function _write(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function _generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// -- Public API ----------------------------------------------

function getProfiles() {
  const { profiles } = _read();
  return Object.values(profiles)
    .map((p) => ({
      id: p.id,
      name: p.name,
      createdAt: p.createdAt,
      lastPlayed: p.lastPlayed,
    }))
    .sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
}

function createProfile(name) {
  const state = _read();
  const id = _generateId();
  const now = Date.now();
  state.profiles[id] = {
    id,
    name,
    createdAt: now,
    lastPlayed: now,
    ...DEFAULT_GAME_DATA,
  };
  _write(state);
  return id;
}

function loadProfile(id) {
  const { profiles } = _read();
  return profiles[id] || null;
}

function saveProfile(id, data) {
  const state = _read();
  const existing = state.profiles[id];
  if (!existing) return;
  state.profiles[id] = {
    ...existing,
    ...data,
    id: existing.id, // never let the merge clobber identity
    lastPlayed: Date.now(),
  };
  _write(state);
}

function deleteProfile(id) {
  const state = _read();
  delete state.profiles[id];
  if (state.active === id) state.active = null;
  _write(state);
}

function getActiveProfile() {
  return _read().active;
}

function setActiveProfile(id) {
  const state = _read();
  state.active = id;
  _write(state);
}

function resetProfile(id) {
  const state = _read();
  const existing = state.profiles[id];
  if (!existing) return;
  state.profiles[id] = {
    id: existing.id,
    name: existing.name,
    createdAt: existing.createdAt,
    lastPlayed: Date.now(),
    ...DEFAULT_GAME_DATA,
  };
  _write(state);
}

export const Save = {
  getProfiles,
  createProfile,
  loadProfile,
  saveProfile,
  deleteProfile,
  getActiveProfile,
  setActiveProfile,
  resetProfile,
};
