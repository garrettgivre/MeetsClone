// The Gene Book: a collection of every body plan, part and body colour the
// player has seen on their own pets (once grown into their looks) and on the
// partners they married. Each new find earns points; finding every part of a
// founder's line completes that line for a bonus.

import { GENES, FORM_GENES, BASE_GENES, ANCILLARY_GENES, BODY_COLORS, FOUNDERS, LINEAGE, GENE_LABELS } from './genetics.js';

export const BOOK_GENES = [...FORM_GENES, ...BASE_GENES, ...ANCILLARY_GENES, 'color'];
export const FIND_POINTS = 10;
export const LINE_POINTS = 100;

/** Every collectable entry of a gene, in display order. */
export function entries(gene) {
  if (gene === 'color') return BODY_COLORS;
  return Object.keys(GENES[gene]).filter(a => a !== 'none');
}

export const BOOK_SIZE = BOOK_GENES.reduce((n, g) => n + entries(g).length, 0);

export const has = (game, gene, allele) => !!game.book?.[gene]?.includes(allele);
export const found = (game, gene) => entries(gene).filter(a => has(game, gene, a)).length;
export const foundTotal = (game) => BOOK_GENES.reduce((n, g) => n + found(game, g), 0);

/** The parts that make up a founder's line: [{ gene, allele }]. */
export function lineParts(founderName) {
  const out = [];
  for (const [gene, map] of Object.entries(LINEAGE)) {
    for (const [allele, name] of Object.entries(map)) if (name === founderName) out.push({ gene, allele });
  }
  return out;
}
export const lineFound = (game, name) => lineParts(name).filter(({ gene, allele }) => has(game, gene, allele)).length;
export const lineDone = (game, name) => lineFound(game, name) === lineParts(name).length;

/** How a book entry reads: "Fox ears", "Mint body". */
export function entryName(gene, allele) {
  const label = gene === 'color' ? 'colour' : GENE_LABELS[gene].toLowerCase();
  const word = allele[0].toUpperCase() + allele.slice(1);
  return gene === 'form' ? `${word} body plan` : `${word} ${label}`;
}

/**
 * Record what a phenotype shows. New finds earn points and are queued in
 * game.bookNews (one message per call) for the home screen to announce. Returns the new finds.
 */
export function discover(game, phenotype) {
  if (!phenotype) return [];
  game.book ||= {};
  game.bookNews ||= [];
  const doneBefore = new Set(FOUNDERS.filter(f => lineDone(game, f.name)).map(f => f.name));
  const fresh = [];
  for (const gene of BOOK_GENES) {
    const a = phenotype[gene];
    if (!a || a === 'none' || !entries(gene).includes(a) || has(game, gene, a)) continue;
    (game.book[gene] ||= []).push(a);
    fresh.push({ gene, allele: a });
  }
  if (fresh.length) {
    const pts = fresh.length * FIND_POINTS;
    game.points = Math.min(999999, (game.points || 0) + pts);
    // one announcement per discovery, however many parts it turned up
    game.bookNews.push(fresh.length === 1
      ? `New in the Gene Book: ${entryName(fresh[0].gene, fresh[0].allele)}! +${pts}`
      : `${fresh.length} new finds in the Gene Book! +${pts}`);
  }
  for (const f of FOUNDERS) {
    if (doneBefore.has(f.name) || !lineDone(game, f.name)) continue;
    game.points = Math.min(999999, game.points + LINE_POINTS);
    game.bookNews.push(`The ${f.line} line is complete! +${LINE_POINTS}`);
  }
  return fresh;
}
