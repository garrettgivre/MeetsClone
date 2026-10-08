// Hand-drawn double-density faces. Faces are where personality lives, so they
// get native hi-res art instead of the automatic upscale used by other parts.
// Same conventions as parts.js: left eye (mirrored for the right), centred
// mouths, pivot = anchor pixel. Eye roles: E dark, e mid, F light.

import { sprite } from '../engine/sprite.js';
import { EYES, BABY_EYES, LASH, EYE_FX, MOUTHS, MOUTH_FX, CHEEKS, NOSES } from './parts.js';

const N = (part, rows, pivot) => { if (part && typeof part === 'object') part.native = { spr: sprite(rows), pivot, hd: true }; };

// ---------- Eyes ----------
N(EYES.bean, [
  '...kkkk...',
  '.kkkkkkkk.',
  '.kwwwkkkk.',
  'kkwwwwkkkk',
  'kkwwwwkkkk',
  'kkkwwkkkkk',
  'kkkkkkkkkk',
  'kkkkkkkkkk',
  'kkkkkkkkkk',
  'kkkeeeeekk',
  'kkeeFFwwkk',
  '.kkeeFwwk.',
  '..kkkkkk..',
  '....kk....',
], [5, 7]);

N(EYES.button, [
  '..kkkk..',
  '.kkkkkk.',
  'kkwwkkkk',
  'kkwwkkkk',
  'kkkkkkkk',
  'kkkkkkkk',
  'kkkkkwkk',
  '.kkkkkk.',
  '..kkkk..',
], [4, 4]);

N(EYES.dot, [
  '.kk.',
  'kwkk',
  'kkkk',
  'kkkk',
  'kkkk',
  '.kk.',
], [2, 3]);

N(EYES.shiny, [
  '...kkkk...',
  '.kkEEEEkk.',
  'kkwwwEEEkk',
  'kwwwwEEEEk',
  'kwwwweeeEk',
  'kkwweeeeek',
  'keeeeeeeek',
  'keeeeeeeek',
  'keeeFFFeek',
  'keeFFFFFek',
  'keeFFFwwek',
  'kkeeFFwwkk',
  '.kkeeeekk.',
  '...kkkk...',
], [5, 7]);

N(EYES.sparkle, [
  '...kkkk...',
  '.kkkkkkkk.',
  'kkwwwkkkkk',
  'kwwwwkkkwk',
  'kwwwwkkkkk',
  'kkwwkkkkkk',
  'kkkkkkkkkk',
  'kkkEEEEkkk',
  'keeeeeeeek',
  'keeFFFFeek',
  'keFFFFwwek',
  'kkeFFFwwkk',
  '.kkeeeekk.',
  '...kkkk...',
], [5, 7]);

N(EYES.wide, [
  '...kkkk...',
  '.kkwwwwkk.',
  'kwwwwwwwwk',
  'kwwwwwwwwk',
  'kwwwwwwwwk',
  'kwwwwkkkwk',
  'kwwwkkkkkk',
  'kwwwkwkkkk',
  'kwwwkkkkkk',
  'kwwwkkkkkk',
  'kwwwwkkkwk',
  'kwwwwwwwwk',
  '.kkwwwwkk.',
  '...kkkk...',
], [5, 7]);

N(EYES.sleepy, [
  'kkkkkkkkkk',
  'kkkkkkkkkk',
  'kkwwwkkkkk',
  'kwwwkkkkkk',
  'kkkkkkkkkk',
  'kkkkkkkkkk',
  'kkkkkkwwkk',
  '.kkkkkkkk.',
  '...kkkk...',
], [5, 3]);

N(EYES.droopy, [
  '.......kkk',
  '....kkkkkk',
  '.kkkkkkkkk',
  'kkkkkkkkkk',
  'kkwwwkkkkk',
  'kwwwkkkkkk',
  'kkkkkkkkkk',
  'kkkkkkkwkk',
  '.kkkkkkkk.',
  '...kkkk...',
], [5, 5]);

N(EYES.arc, [
  '...kkkk...',
  '.kkkkkkkk.',
  'kkk....kkk',
  'kk......kk',
], [5, 2]);

N(EYES.cat, [
  '...kkkk...',
  '.kkeeeekk.',
  'kwweekkeek',
  'kwweekkeek',
  'keeeekkeek',
  'keeeekkeek',
  'keeeekkeek',
  'keeeekkeek',
  'keFFekkFek',
  'keFFekkFFk',
  'keeFekkFek',
  'kkeeekkekk',
  '.kkeeeekk.',
  '...kkkk...',
], [5, 7]);

N(EYES.star, [
  '....o....',
  '...oYo...',
  '...oYo...',
  'oooYYYooo',
  'oYYYYYYYo',
  '.oYYxYYo.',
  '..oYYYo..',
  '.oYYoYYo.',
  '.oYo.oYo.',
  '.oo...oo.',
], [4, 5]);

N(EYES.gem, [
  '....k....',
  '...kFk...',
  '..kFwFk..',
  '.kFwweek.',
  'kFFweeeek',
  'keeeeeEek',
  'keeeeEEek',
  '.keeeEEk.',
  '..keEEk..',
  '...kEk...',
  '....k....',
], [4, 5]);

N(EYES.heart, [
  '.kkk..kkk.',
  'kqqqkkqqqk',
  'kqQQqqqqqk',
  'kqQqqqqqqk',
  'kqqqqqqqqk',
  '.kqqqqqqk.',
  '..kqqqqk..',
  '...kqqk...',
  '....kk....',
], [5, 4]);

N(BABY_EYES, [
  '.kkk.',
  'kwwkk',
  'kwkkk',
  'kkkkk',
  'kkkwk',
  '.kkk.',
], [2, 3]);

N(LASH, [
  'k...',
  '.kk.',
  '..kk',
], [3, 2]);

// ---------- Expression eyes ----------
N(EYE_FX.closed, [
  'kk......kk',
  '.kk....kk.',
  '..kkkkkk..',
], [5, 1]);
N(EYE_FX.happy, [
  '...kkkk...',
  '.kkkkkkkk.',
  'kkk....kkk',
  'kk......kk',
], [5, 2]);
N(EYE_FX.sad, [
  '.......kk.',
  '....kkkk..',
  '.kkkk.....',
  '..........',
  '..kkkkkk..',
  '.kkkkkkkk.',
  '.kkkkwkkk.',
  '..kkkkkk..',
], [5, 4]);
N(EYE_FX.dizzy, [
  'kk....kk',
  '.kk..kk.',
  '..kkkk..',
  '...kk...',
  '..kkkk..',
  '.kk..kk.',
  'kk....kk',
], [4, 3]);
N(EYE_FX.wink, [
  '..........',
  'kkkkkkkkkk',
  '.kkkkkkkk.',
], [5, 1]);

// ---------- Mouths (pivot = top centre) ----------
N(MOUTHS.smile, [
  'kk......kk',
  '.kk....kk.',
  '..kkkkkk..',
], [5, 0]);
N(MOUTHS.open, [
  'kkkkkkkkkk',
  'kRRRRRRRRk',
  '.kRRRRRRk.',
  '.kRRqqRRk.',
  '..kqqqqk..',
  '...kkkk...',
], [5, 0]);
N(MOUTHS.tiny, [
  'kk..kk',
  '.kkkk.',
], [3, 0]);
N(MOUTHS.cat, [
  'k...kk...k',
  'kk.k..k.kk',
  '.kkk..kkk.',
], [5, 0]);
N(MOUTHS.beak, [
  '.oooooo.',
  'oAAAAAAo',
  'oaaaaaao',
  '.oaaaao.',
  '..oooo..',
], [4, 0]);
N(MOUTHS.fang, [
  'k........k',
  '.kkkkkkkk.',
  '.kwk..kwk.',
  '..k....k..',
], [5, 0]);
N(MOUTHS.blep, [
  'kkkkkkkk',
  '..kqqk..',
  '..kqqk..',
  '...kk...',
], [4, 0]);
N(MOUTHS.ooh, [
  '.kkkk.',
  'kRRRRk',
  'kRqqRk',
  'kRRRRk',
  '.kkkk.',
], [3, 0]);
N(MOUTHS.flat, [
  'kkkkkkkk',
], [4, 0]);
N(MOUTHS.wobble, [
  '.kk...kk..',
  'k..k.k..kk',
  '....k.....',
], [5, 0]);
N(MOUTHS.smirk, [
  '........kk',
  '.......kk.',
  'kk....kk..',
  '.kkkkkk...',
], [5, 0]);

N(MOUTH_FX.open, [
  '..kkkk..',
  '.kRRRRk.',
  'kRRRRRRk',
  'kRRqqRRk',
  'kRqqqqRk',
  '.kqqqqk.',
  '..kkkk..',
], [4, 0]);
N(MOUTH_FX.chew, [
  'kk.kk.kk',
  '.kk.kk.k',
], [4, 0]);
N(MOUTH_FX.sad, [
  '..kkkk..',
  '.kk..kk.',
  'kk....kk',
], [4, 0]);
N(MOUTH_FX.happy, [
  'kkkkkkkkkk',
  'kRRRRRRRRk',
  '.kRRRRRRk.',
  '.kRRqqRRk.',
  '..kqqqqk..',
  '...kkkk...',
], [5, 0]);

// ---------- Cheeks (left cheek; mirrored) ----------
N(CHEEKS.blush, [
  '..ffff..',
  '.fPPfff.',
  'ffffffff',
  '.ffffff.',
], [4, 0]);
N(CHEEKS.dots, [
  'ff..ff',
  'ff..ff',
], [3, 0]);
N(CHEEKS.freckles, [
  'nn..nn',
  'nn..nn',
  '..nn..',
  '..nn..',
], [3, 0]);
N(CHEEKS.hearts, [
  '.pp.pp.',
  'pPpppppp'.slice(0, 7),
  'ppppppp',
  '.ppppp.',
  '..ppp..',
  '...p...',
], [3, 0]);

// ---------- Noses ----------
N(NOSES.dot, [
  'kkkk',
  '.kk.',
], [2, 0]);
N(NOSES.button, [
  '.kkkk.',
  'kqQqqk',
  'kqqqqk',
  '.kkkk.',
], [3, 0]);
