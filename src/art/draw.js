// A way of typing props that keeps long rows honest. Rows are typed from the
// left and may be left ragged on the right (defineProp fills them out with
// empty cells). Leaves and wood are typed as letters and renamed to the usual
// digits of props.js, because long runs of digits are where typing slips:
//   o leaf outline (1)   S leaf shade (2)   M leaf (3)   L leaf light (4)
//   p wood dark (5)      Q wood shade (6)   q wood (7)   P wood light (8)
// Everything else is as in props.js.
import { defineProp } from './props.js';

const KEY = { o: '1', S: '2', M: '3', L: '4', p: '5', Q: '6', q: '7', P: '8' };
export const drawn = (name, rows, opts) => defineProp(name, rows.map(r => [...r].map(ch => KEY[ch] || ch).join('')), opts);
