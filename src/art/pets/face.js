// Face parts, shared by every form and drawn in two sizes: S for small faces
// (four-legged and serpent heads) and L for large ones. Each belongs to one
// founder's line (see FOUNDERS in src/game/genetics.js).
// Eyes are the left eye with the glint on the upper left; the right eye is
// drawn the same way round so the light stays consistent ('mirror' flips it).

import { part, ORANGE } from './part.js';

export const EYES = {
  sly: {     // Kitsu: almond eyes with a flick at the outer corner
    S: part(['k....', '.kkk.', 'kwFek', '.kkk.'], { pivot: [2, 2] }),
    L: part(['k.....', '.kkkk.', 'kwFeek', 'kFeEEk', '.kkkk.'], { pivot: [3, 2] }),
  },
  jelly: {   // Gloop: big glossy eyes with two shines
    S: part(['.kk.', 'kwek', 'keek', 'kEwk', '.kk.'], { pivot: [2, 2] }),
    L: part(['.kkk.', 'kwwek', 'kweek', 'keeEk', 'kEEwk', '.kkk.'], { pivot: [2, 3] }),
  },
  sleepy: {  // Fleece: heavy-lidded and content
    S: part(['kkkk', 'kwek', '.kk.'], { pivot: [2, 1] }),
    L: part(['.kkkk.', 'kkkkkk', 'kwFEEk', '.kkkk.'], { pivot: [3, 2] }),
  },
  glow: {    // Glimmer: lantern-light rings, no dark pupil
    S: part(['.ee.', 'eFwe', 'eFFe', '.ee.'], { pivot: [2, 2] }),
    L: part(['.eee.', 'eFFwe', 'eFwFe', 'eFFFe', '.eee.'], { pivot: [2, 2] }),
  },
  bead: {    // Inchy: tiny shiny beads
    S: part(['wk', 'kk'], { pivot: [1, 1] }),
    L: part(['.kk.', 'kwkk', 'kkkk', '.kk.'], { pivot: [2, 2] }),
  },
  owl: {     // Hoolet: huge round irises with a pupil
    S: part(['.kkk.', 'kewek', 'kekEk', 'keEEk', '.kkk.'], { pivot: [2, 2] }),
    L: part(['..kkk..', '.keeek.', 'kewkkek', 'kekkkek', 'keEkEEk', '.kEEEk.', '..kkk..'], { pivot: [3, 3] }),
  },
};
export const BABY_EYES = part(['kk', 'wk', 'kk'], { pivot: [1, 1] });

// Mouths (pivot = top centre)
export const MOUTHS = {
  fang:  { S: part(['k.k.k', '.k.k.', '.w...'], { pivot: [2, 0] }), L: part(['k..k..k', '.kk.kk.', '..w....'], { pivot: [3, 0] }) },  // Kitsu
  o:     { S: part(['.k.', 'kRk', '.k.'], { pivot: [1, 0] }), L: part(['.kk.', 'kRRk', 'kqqk', '.kk.'], { pivot: [2, 0] }) },             // Gloop
  baa:   { S: part(['k...k', '.kRk.'], { pivot: [2, 0] }), L: part(['k.....k', '.kRRRk.', '..kkk..'], { pivot: [3, 0] }) },             // Fleece
  dot:   { S: part(['k'], { pivot: [0, 0] }), L: part(['kk'], { pivot: [1, 0] }) },                                                       // Glimmer
  munch: { S: part(['k...k', 'kwwwk', '.kkk.'], { pivot: [2, 0] }), L: part(['k.....k', 'kwwwwwk', '.kRRRk.', '..kkk..'], { pivot: [3, 0] }) },   // Inchy: a toothy chomp
  beak:  { S: part(['.a.', 'aNb', '.o.'], { pivot: [1, 0], key: ORANGE, bill: true }),                                                   // Hoolet
           L: part(['..a..', '.aNb.', 'aNnnb', '.onb.', '..o..'], { pivot: [2, 0], key: ORANGE, bill: true }) },
};
export const BABY_MOUTH = part(['.k.', 'kRk', '.k.'], { pivot: [1, 0] });

// Forehead marks (pivot = centre)
export const MARKS = {
  flame:  { S: part(['.R.', 'RaR', 'aYa', '.a.'], { pivot: [1, 2] }), L: part(['..R..', '.RaR.', 'RaYaR', '.aYa.', '..a..'], { pivot: [2, 3] }) }, // Kitsu
  heart:  { S: part(['q.q', 'qqq', '.q.'], { pivot: [1, 1] }), L: part(['.q.q.', 'qQqqq', 'qqqqq', '.qqq.', '..q..'], { pivot: [2, 2] }) },        // Gloop
  clover: { S: part(['.L.', 'LlL', '.j.'], { pivot: [1, 1] }), L: part(['.l.l.', 'lLlLl', '.lLl.', '..j..'], { pivot: [2, 2] }) },                // Fleece
  spark:  { S: part(['.Y.', 'YwY', '.Y.'], { pivot: [1, 1] }), L: part(['..Y..', '..Y..', 'YYwYY', '..Y..', '..Y..'], { pivot: [2, 2] }) },        // Glimmer
  dots:   { S: part(['7.7.7'], { pivot: [2, 0] }), L: part(['.7.7.', '7.7.7'], { pivot: [2, 1] }) },                                             // Inchy
  moon:   { S: part(['.YY', 'Y..', '.YY'], { pivot: [1, 1] }), L: part(['..YY', '.Y..', 'Y...', '.Y..', '..YY'], { pivot: [2, 2] }) },             // Hoolet
};

// Noses (pivot = top centre)
export const NOSES = {
  button: { S: part(['Kk'], { pivot: [1, 0] }), L: part(['Kkk', '.k.'], { pivot: [1, 0] }) },                         // Kitsu
  snoot:  { S: part(['ppp', '.p.'], { pivot: [1, 0] }), L: part(['.ppp.', 'ppPpp', '.k.k.'], { pivot: [2, 0] }) },   // Fleece
};

// Where face parts sit relative to the face socket, per face size
export const FACE_LAYOUT = {
  S: { spread: 4, nose: 2, mouth: 3, mark: -5, cheek: 2 },
  L: { spread: 6, nose: 3, mouth: 4, mark: -7, cheek: 3 },
};
