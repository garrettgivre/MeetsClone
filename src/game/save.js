// Saving to localStorage, plus a copy-paste backup code.
import { newGame } from './pet.js';
import { CLOTHES } from './items.js';

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
  if (!Array.isArray(g.wardrobe)) g.wardrobe = [];
  if (g.pet) {
    const pet = g.pet;
    pet.wear = pet.wear || {};
    const fill = { hair: 'none', hairColor: 'brown', aura: 'none' };
    for (const [gene, v] of Object.entries(fill)) {
      if (pet.phenotype && !pet.phenotype[gene]) pet.phenotype[gene] = v;
      if (pet.genome && !pet.genome[gene]) pet.genome[gene] = [v, v];
    }
    // Early builds had clothing as genes. Move it to the wardrobe instead.
    const asClothes = (gene, value) => {
      if (!CLOTHES[value]) return false;
      pet.wear[CLOTHES[value].slot] = pet.wear[CLOTHES[value].slot] || value;
      if (!g.wardrobe.includes(value)) g.wardrobe.push(value);
      return true;
    };
    const p = pet.phenotype || {};
    if (p.outfit && p.outfit !== 'none') asClothes('outfit', p.outfit);
    if (p.face && p.face !== 'none') asClothes('face', p.face);
    if (asClothes('crest', p.crest)) p.crest = 'none';
    if (asClothes('back', p.back)) p.back = 'none';
    if (asClothes('feet', p.feet)) p.feet = 'stubs';
    delete p.outfit; delete p.face;
    if (pet.genome) {
      delete pet.genome.outfit; delete pet.genome.face;
      const fix = { crest: 'none', back: 'none', feet: 'stubs' };
      for (const [gene, def] of Object.entries(fix)) if (pet.genome[gene]) pet.genome[gene] = pet.genome[gene].map(a => CLOTHES[a] ? def : a);
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
