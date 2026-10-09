// Saving to localStorage, plus a copy-paste backup code.
import { newGame, BASE_WEIGHT } from './pet.js';
import { GENES } from './genetics.js';
import { discover } from './book.js';
import { fixDecor } from './decor.js';

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
  const seeded = !!g.bookSeeded; // (read before the defaults below fill it in)
  const fresh = newGame(g.simTime || Date.now());
  for (const k of Object.keys(fresh)) if (g[k] === undefined) g[k] = fresh[k];
  g.settings = { ...fresh.settings, ...g.settings };
  if (!Array.isArray(g.wardrobe)) g.wardrobe = [];
  fixDecor(g); // rooms, slots and sets added since this save was made
  if (g.pet) {
    const pet = g.pet;
    pet.wear = pet.wear || {};
    // fields added after this save was made
    if (typeof pet.weight !== 'number') pet.weight = BASE_WEIGHT[pet.stage] ?? BASE_WEIGHT.baby;
    if (typeof pet.discipline !== 'number') pet.discipline = 0;
    if (typeof pet.whim !== 'boolean') pet.whim = false;
    if (typeof pet.whimIn !== 'number') pet.whimIn = 3 * 60 * 60 * 1000;
    if (typeof pet.refusedAt !== 'number') pet.refusedAt = 0;
    if (typeof pet.dirt !== 'number') pet.dirt = 0;
    if (typeof pet.squirm !== 'boolean') pet.squirm = false;
    if (typeof pet.potty !== 'number') pet.potty = 0;
    pet.skills = { smart: 0, creative: 0, fit: 0, charm: 0, ...pet.skills };
    if (pet.job === undefined) pet.job = null;
    // genes added after this save was made: absent ancillaries, a default for the rest
    for (const gene of Object.keys(GENES)) {
      const v = 'none' in GENES[gene] ? 'none' : Object.keys(GENES[gene])[0];
      if (pet.phenotype && !pet.phenotype[gene]) pet.phenotype[gene] = v;
      if (pet.genome && !pet.genome[gene]) pet.genome[gene] = [v, v];
    }
  }
  // a save from before the Gene Book: credit what this family has already seen (quietly)
  if (!seeded) {
    const points = g.points;
    for (const a of g.album || []) { discover(g, a.phenotype); if (a.partner) discover(g, a.partner.phenotype); }
    if (g.pet && (g.pet.stage === 'teen' || g.pet.stage === 'adult')) discover(g, g.pet.phenotype);
    g.points = points;
    g.bookNews = [];
    g.bookSeeded = true;
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
