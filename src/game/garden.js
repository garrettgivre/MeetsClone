// The vegetable bed in the garden: three plots. A seed is bought as it is
// planted; a plant grows a step each day it is watered (once a day counts)
// and is ripe after `days` waterings. Picking it puts its crop in the pantry
// for cooking (cooking.js). No drawing here.
import { grant } from './wishes.js';

export const PLOTS = 3;
export const CROPS = {
  tomato:     { name: 'Tomato',     seed: 15, days: 2, crop: 3 },
  carrot:     { name: 'Carrot',     seed: 15, days: 2, crop: 3 },
  strawberry: { name: 'Strawberry', seed: 20, days: 3, crop: 3 },
  pumpkin:    { name: 'Pumpkin',    seed: 25, days: 3, crop: 2 },
};

const dayOf = (game) => new Date(game.simTime).toDateString();
export const newGarden = () => ({ plots: Array(PLOTS).fill(null) });
/** The garden, repaired if a save has none or the wrong number of plots. */
export function gardenOf(game) {
  const g = (game.garden = game.garden && Array.isArray(game.garden.plots) ? game.garden : newGarden());
  while (g.plots.length < PLOTS) g.plots.push(null);
  g.plots = g.plots.slice(0, PLOTS).map(p => (p && CROPS[p.crop] ? p : null));
  return g;
}

/** How a plot looks: 'empty', 'sprout', 'leafy' or 'ripe'. */
export function stageOf(plot) {
  if (!plot) return 'empty';
  if (plot.growth >= CROPS[plot.crop].days) return 'ripe';
  return plot.growth > 0 ? 'leafy' : 'sprout';
}
export const wateredToday = (game, plot) => !!plot && plot.watered === dayOf(game);

export function plant(game, i, crop) {
  const g = gardenOf(game), c = CROPS[crop];
  if (!c || i < 0 || i >= PLOTS) return { ok: false };
  if (g.plots[i]) return { ok: false, msg: 'Something is growing there!' };
  if (game.points < c.seed) return { ok: false, msg: 'Not enough points!' };
  game.points -= c.seed;
  g.plots[i] = { crop, growth: 0, watered: '' };
  grant(game, 'plant');
  return { ok: true };
}

/** Water one plot, or every plot that wants it (i = null). Returns how many were watered and how many came ripe. */
export function water(game, i = null) {
  const g = gardenOf(game), day = dayOf(game);
  let watered = 0, ripe = 0;
  g.plots.forEach((p, n) => {
    if (!p || (i != null && n !== i) || p.watered === day || stageOf(p) === 'ripe') return;
    p.watered = day;
    p.growth++;
    watered++;
    if (stageOf(p) === 'ripe') ripe++;
  });
  if (!watered) return { ok: false, msg: g.plots.some(p => p) ? 'Watered already today!' : 'Nothing is planted!' };
  grant(game, 'water');
  return { ok: true, watered, ripe };
}

export function harvest(game, i) {
  const g = gardenOf(game), p = g.plots[i];
  if (!p || stageOf(p) !== 'ripe') return { ok: false, msg: 'Not ripe yet!' };
  const c = CROPS[p.crop];
  game.pantry = game.pantry || {};
  game.pantry[p.crop] = (game.pantry[p.crop] || 0) + c.crop;
  g.plots[i] = null;
  grant(game, 'harvest');
  return { ok: true, crop: p.crop, count: c.crop };
}
