import { PROPS } from './src/art/props.js'; import './src/art/props-decor.js';
for (const n of process.argv.slice(2)) { const p = PROPS[n]; console.log('== ' + n, p.w + 'x' + p.h); for (const r of p.rows) console.log(r); }
