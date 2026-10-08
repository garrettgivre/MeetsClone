// Prints how many pixels of each part show in a founder's adult picture: node tools/seen.mjs [Name]
import { FOUNDERS, express, pureGenome } from '../src/game/genetics.js';
import { makeRng } from '../src/engine/rng.js';
import { composePetArt } from '../src/game/pet-art.js';
const want = process.argv[2];
for (const f of FOUNDERS) {
  if (want && f.name !== want) continue;
  const { seen } = composePetArt(express(pureGenome(f.traits), makeRng(1)), 'adult', {});
  console.log(f.name.padEnd(8), Object.entries(seen).map(([k, v]) => `${k} ${v}`).join(' · '));
}
