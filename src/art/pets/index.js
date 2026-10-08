// The pet art registry: six body plans (forms), each with its own drawing of
// every part, plus the shared face parts and markings.
//
// To add a part: add the allele to GENES (src/game/genetics.js), give it to a
// founder, and draw it in every form file (tests/art.test.js checks coverage).
// To add a form: add a forms/<name>.js with the same sections and register it here.

import biped from './forms/biped.js';
import blob from './forms/blob.js';
import quad from './forms/quad.js';
import floater from './forms/floater.js';
import serpent from './forms/serpent.js';
import avian from './forms/avian.js';

export const FORMS = { biped, blob, quad, floater, serpent, avian };

// Genes whose art lives in each form file, and the form section that holds it
export const FORM_SECTIONS = { head: 'head', body: 'body', ears: 'ears', tail: 'tail', topper: 'topper', feet: 'feet', wings: 'wings', hair: 'hair' };

export { EYES, MOUTHS, MARKS, NOSES, BABY_EYES, BABY_MOUTH, FACE_LAYOUT } from './face.js';
export { PATTERNS } from './patterns.js';
export { EGG } from './egg.js';
