// Hand-drawn double-density body parts: feet, arms and the most visible
// toppers. Parts without an entry here are upscaled automatically.
// Roles: 1-4 body ramp (dark..highlight), 5-8 accent ramp, o/k ink outline.

import { sprite } from '../engine/sprite.js';
import { FEET, ARMS, CRESTS } from './parts.js';

const N = (part, rows, pivot) => { if (part && typeof part === 'object') part.native = { ...part, spr: sprite(rows), pivot, hd: true }; };

// ---------- Feet (pivot = top centre where the leg meets the body) ----------
N(FEET.stubs, [
  '..oooooo..',
  '.o344333o.',
  'o33333333o',
  'o22222222o',
  '.oooooooo.',
], [5, 0]);

// paws with little toe lines and a soft pad colour
N(FEET.paws, [
  '..oooooo..',
  '.o788777o.',
  'o77777777o',
  'o7o77o77oo',
  'o67o67o67o',
  '.oooooooo.',
], [5, 0]);

N(FEET.legs, [
  '..o33o..',
  '..o33o..',
  '..o33o..',
  '..o32o..',
  '.oo333o.',
  'o334333o',
  'o2222222o',
  '.ooooooo.',
], [4, 0]);

N(FEET.flippers, [
  '...o33o.....',
  '..ooaaoo....',
  '.oaAAAaaoo..',
  'oaAAaaaaaaoo',
  'oaaaaaaaaaao',
  'oaoaaaoaaaoo',
  '.o.ooo.ooo..',
], [5, 0]);

N(FEET.tiny, [
  '.oooo.',
  'o3443o',
  'o2222o',
  '.oooo.',
], [3, 0]);

N(FEET.shoes, [
  '..o33o....',
  '..o33o....',
  '.oo666oo..',
  'o6687666oo',
  'o666666666o',
  'oGGGGGGGGGo',
  '.ooooooooo.',
], [4, 0]);

// ---------- Arms (left arm; pivot = shoulder) ----------
N(ARMS.down, [
  '......ooo',
  '.....o334',
  '....o3333',
  '...o3333o',
  '..o3333o.',
  '.o3333o..',
  'o33333o..',
  'o22233o..',
  'o2222o...',
  '.oooo....',
], [7, 0]);

N(ARMS.out, [
  '...oooooo',
  '.oo333334',
  'o33333333',
  'o22233333',
  'o2222oooo',
  '.oooo....',
], [7, 2]);

N(ARMS.up, [
  '.ooo.....',
  'o3444o...',
  'o33333o..',
  '.o33333o.',
  '..o33333o',
  '...o3332o',
  '....oooo.',
], [7, 6]);

// ---------- Toppers ----------
N(CRESTS.flame, [
  '.....o......',
  '....oao.....',
  '....oAao....',
  '...oaAAo.o..',
  '..oaAyAaoao.',
  '..oAyYyAaAo.',
  '.oaAyYYyAAo.',
  '.oAyYYYYyAo.',
  'oaAyYYYYyAao',
  'oaAyyYYyyAao',
  '.oaAyyyyAao.',
  '..ooaaaaoo..',
], [6, 11]);

N(CRESTS.sprout, [
  '..ooo.....ooo..',
  '.olllo...olllo.',
  'ollllLo.oLllllo',
  'oLllLLooLLlllLo',
  '.oLLLLooLLLLLo.',
  '..ooooLLoooo...',
  '......oLo......',
  '......oLo......',
  '......oLo......',
], [7, 8]);

N(CRESTS.star, [
  '.....oo.....',
  '....oYYo....',
  '....oYYo....',
  'ooooYYYYoooo',
  'oYYYYYYYYYyo',
  '.oYYYYYYYyo.',
  '..oYYxxYyo..',
  '..oYYYYYyo..',
  '.oYYYooyYyo.',
  '.oYyo..oyyo.',
  'oyyo....oyyo',
  'ooo......ooo',
], [6, 11]);

N(CRESTS.tuft, [
  '....ooo.',
  '...o344o',
  '..o33oo.',
  '..o3o...',
  '.o33o...',
  '.o33o...',
  'o333o...',
  'o3333o..',
], [3, 7]);

N(CRESTS.curl, [
  '..oooo..',
  '.o3443o.',
  'o33oo33o',
  'o3o..o3o',
  'o3o.oo3o',
  '.oo.o33o',
  '....o3o.',
  '...o33o.',
  '..o333o.',
], [4, 8]);
