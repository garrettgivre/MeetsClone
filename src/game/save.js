// Saving to localStorage, plus a copy-paste backup code.
import { newGame } from './pet.js';

const KEY = 'meetsclone.save.v1';
export const SAVE_VERSION = 1;

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function save(game) {
  try { localStorage.setItem(KEY, JSON.stringify(game)); return true; } catch { return false; }
}

export function clear() {
  try { localStorage.removeItem(KEY); } catch { /* storage blocked */ }
}

/** Fill in fields added in later versions so old saves keep working. */
export function migrate(g) {
  if (!g || typeof g !== 'object' || !g.version) return null;
  const fresh = newGame(g.simTime || Date.now());
  for (const k of Object.keys(fresh)) if (g[k] === undefined) g[k] = fresh[k];
  g.settings = { ...fresh.settings, ...g.settings };
  if (g.pet) {
    if (g.pet.phenotype && !g.pet.phenotype.outfit) g.pet.phenotype.outfit = 'none';
    if (g.pet.genome && !g.pet.genome.outfit) g.pet.genome.outfit = ['none', 'none'];
  }
  g.version = SAVE_VERSION;
  return g;
}

export function exportCode(game) {
  const json = JSON.stringify(game);
  return btoa(unescape(encodeURIComponent(json)));
}

export function importCode(code) {
  try {
    return migrate(JSON.parse(decodeURIComponent(escape(atob(code.trim())))));
  } catch {
    return null;
  }
}
