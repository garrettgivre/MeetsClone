// Saving to localStorage, plus a copy-paste backup code.
import { newGame } from './pet.js';
import { GENES } from './genetics.js';

const KEY = 'meetsclone.save.v2';
export const SAVE_VERSION = 2;

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

/**
 * Bring a save up to date. Saves from before the form rebuild (v0.9) are
 * retired: their pets used a different set of genes, so the game starts fresh.
 * From v2 on, newly added genes are filled in so pets keep working.
 */
export function migrate(g) {
  if (!g || typeof g !== 'object' || !g.version || g.version < SAVE_VERSION) return null;
  const fresh = newGame(g.simTime || Date.now());
  for (const k of Object.keys(fresh)) if (g[k] === undefined) g[k] = fresh[k];
  g.settings = { ...fresh.settings, ...g.settings };
  if (!Array.isArray(g.wardrobe)) g.wardrobe = [];
  if (g.pet) {
    const pet = g.pet;
    pet.wear = pet.wear || {};
    // genes added after this save was made: absent ancillaries, a default for the rest
    for (const gene of Object.keys(GENES)) {
      const v = 'none' in GENES[gene] ? 'none' : Object.keys(GENES[gene])[0];
      if (pet.phenotype && !pet.phenotype[gene]) pet.phenotype[gene] = v;
      if (pet.genome && !pet.genome[gene]) pet.genome[gene] = [v, v];
    }
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
