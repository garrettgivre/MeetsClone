import { HEX, RAMP_NAMES } from '../../src/engine/palette.js';
import { sprite, colors, lut, KEY } from '../../src/engine/sprite.js';

const STORE_KEY = 'spriteEditor.v1';
const MAX = 64;
const MAGENTA = [255, 0, 255, 255];
const $ = id => document.getElementById(id);
const blank = n => Array(n).fill('.');
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// ---------------------------------------------------------------- state
// Document: w, h, frames (each an array of w*h single-character strings), cur.
const state = {
  w: 16, h: 16, frames: [blank(256)], cur: 0,
  tool: 'pencil', ch: 'o', mirror: false, onion: false, grid: true, fillShapes: false, allFrames: false,
  zoom: 16, primary: 'slate', secondary: 'cream', eye: 'ink', fps: 4, pscale: 2,
};

// ---------------------------------------------------------------- colours
const RGB = HEX.map(h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)));
const lutSprite = sprite(['.']);
let lutTable = null;
const rgbaCache = new Map();

function invalidateColors() { lutTable = null; rgbaCache.clear(); }

function rgba(ch) {
  let c = rgbaCache.get(ch);
  if (c) return c;
  if (ch === '.' || ch === ' ') c = [0, 0, 0, 0];
  else if (!Object.hasOwn(KEY, ch)) c = MAGENTA;
  else {
    lutTable ??= lut(lutSprite, colors(state.primary, state.secondary, state.eye));
    const idx = lutTable[ch.charCodeAt(0)];
    c = idx ? [...RGB[idx], 255] : [0, 0, 0, 0];
  }
  rgbaCache.set(ch, c);
  return c;
}

const cssColor = ([r, g, b, a]) => (a ? `rgb(${r},${g},${b})` : 'transparent');
const isDark = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b < 128;

// ---------------------------------------------------------------- history
let undoStack = [], redoStack = [];
const snap = () => JSON.stringify({ w: state.w, h: state.h, cur: state.cur, frames: state.frames.map(f => f.join('')) });

function restore(s) {
  const d = JSON.parse(s);
  state.w = d.w; state.h = d.h; state.cur = d.cur;
  state.frames = d.frames.map(f => Array.from(f));
}

function pushHistory() {
  undoStack.push(snap());
  if (undoStack.length > 200) undoStack.shift();
  redoStack = [];
}

function undo() {
  if (!undoStack.length) return;
  redoStack.push(snap());
  restore(undoStack.pop());
  changed();
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push(snap());
  restore(redoStack.pop());
  changed();
}

// ---------------------------------------------------------------- pixel ops
const frame = () => state.frames[state.cur];

function setPx(f, x, y, ch) {
  const { w, h } = state;
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  f[y * w + x] = ch;
  if (state.mirror) f[y * w + (w - 1 - x)] = ch;
}

function lineCells(x0, y0, x1, y1) {
  const out = [];
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    out.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
  return out;
}

function rectCells(x0, y0, x1, y1, filled) {
  const out = [];
  const [xa, xb] = [Math.min(x0, x1), Math.max(x0, x1)];
  const [ya, yb] = [Math.min(y0, y1), Math.max(y0, y1)];
  for (let y = ya; y <= yb; y++) {
    for (let x = xa; x <= xb; x++) {
      if (filled || x === xa || x === xb || y === ya || y === yb) out.push([x, y]);
    }
  }
  return out;
}

function floodFill(x, y, ch) {
  const { w, h } = state;
  const f = frame();
  const target = f[y * w + x];
  if (target === ch) return;
  const stack = [[x, y]];
  while (stack.length) {
    const [cx, cy] = stack.pop();
    if (cx < 0 || cy < 0 || cx >= w || cy >= h || f[cy * w + cx] !== target) continue;
    f[cy * w + cx] = ch;
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
}

function targetFrames() { return state.allFrames ? state.frames : [frame()]; }

function shift(dx, dy) {
  pushHistory();
  const { w, h } = state;
  for (const f of targetFrames()) {
    const src = f.slice();
    f.fill('.');
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < w && ny < h) f[ny * w + nx] = src[y * w + x];
      }
    }
  }
  changed();
}

function flipH() {
  pushHistory();
  const { w, h } = state;
  for (const f of targetFrames()) {
    for (let y = 0; y < h; y++) {
      const row = f.slice(y * w, (y + 1) * w).reverse();
      for (let x = 0; x < w; x++) f[y * w + x] = row[x];
    }
  }
  changed();
}

function resize(nw, nh) {
  nw = clamp(Math.round(nw) || 1, 1, MAX);
  nh = clamp(Math.round(nh) || 1, 1, MAX);
  if (nw === state.w && nh === state.h) return;
  pushHistory();
  state.frames = state.frames.map(f => {
    const n = blank(nw * nh);
    for (let y = 0; y < Math.min(nh, state.h); y++) {
      for (let x = 0; x < Math.min(nw, state.w); x++) n[y * nw + x] = f[y * state.w + x];
    }
    return n;
  });
  state.w = nw; state.h = nh;
  changed();
}

// ---------------------------------------------------------------- rendering
const cv = $('cv'), cx = cv.getContext('2d');
const pv = $('pv'), pcx = pv.getContext('2d');
const off = document.createElement('canvas');

/** Draw a frame into the shared offscreen canvas (w x h) and return it. */
function bitmap(f) {
  const { w, h } = state;
  off.width = w; off.height = h;
  const c = off.getContext('2d');
  const img = c.createImageData(w, h);
  for (let i = 0; i < w * h; i++) img.data.set(rgba(f[i]), i * 4);
  c.putImageData(img, 0, 0);
  return off;
}

function renderMain() {
  const { w, h, zoom: z } = state;
  cv.width = w * z; cv.height = h * z;
  cx.imageSmoothingEnabled = false;
  if (state.onion && state.cur > 0) {
    cx.globalAlpha = 0.3;
    cx.drawImage(bitmap(state.frames[state.cur - 1]), 0, 0, w * z, h * z);
    cx.globalAlpha = 1;
  }
  cx.drawImage(bitmap(frame()), 0, 0, w * z, h * z);
  if (state.grid && z >= 6) {
    cx.strokeStyle = 'rgba(0,0,0,0.15)';
    cx.lineWidth = 1;
    cx.beginPath();
    for (let x = 1; x < w; x++) { cx.moveTo(x * z + 0.5, 0); cx.lineTo(x * z + 0.5, h * z); }
    for (let y = 1; y < h; y++) { cx.moveTo(0, y * z + 0.5); cx.lineTo(w * z, y * z + 0.5); }
    cx.stroke();
  }
}

function renderFrames() {
  const box = $('frames');
  box.replaceChildren();
  const s = Math.max(1, Math.floor(56 / Math.max(state.w, state.h)));
  state.frames.forEach((f, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'frame';
    b.setAttribute('aria-pressed', String(i === state.cur));
    b.setAttribute('aria-label', `Frame ${i + 1}`);
    const c = document.createElement('canvas');
    c.width = state.w; c.height = state.h;
    c.style.width = state.w * s + 'px'; c.style.height = state.h * s + 'px';
    c.getContext('2d').drawImage(bitmap(f), 0, 0);
    const n = document.createElement('span');
    n.textContent = i + 1;
    b.append(c, n);
    b.addEventListener('click', () => { state.cur = i; changed(false); });
    box.append(b);
  });
}

// Preview animation
let pvIndex = 0, pvTimer = null;
function drawPreview() {
  const { w, h } = state;
  if (pv.width !== w) pv.width = w;
  if (pv.height !== h) pv.height = h;
  pv.style.width = w * state.pscale + 'px';
  pv.style.height = h * state.pscale + 'px';
  pvIndex %= state.frames.length;
  pcx.clearRect(0, 0, w, h);
  pcx.drawImage(bitmap(state.frames[pvIndex]), 0, 0);
}
function startPreview() {
  clearInterval(pvTimer);
  pvTimer = setInterval(() => {
    pvIndex = (pvIndex + 1) % state.frames.length;
    drawPreview();
  }, 1000 / state.fps);
}

// ---------------------------------------------------------------- swatches
const swatchBtns = new Map();

function buildSwatches() {
  const box = $('swatches');
  const chars = ['.', ...Object.keys(KEY)];
  for (const ch of chars) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'sw';
    const name = KEY[ch];
    const role = name && /^[PSY]\d$/.test(name);
    if (ch === '.') b.classList.add('clear');
    if (role) b.classList.add('role');
    b.innerHTML = `<b></b><i></i>`;
    b.firstChild.textContent = ch;
    b.lastChild.textContent = ch === '.' ? 'clear' : name;
    b.title = ch === '.' ? 'Transparent' : role ? `Role ${name}` : name;
    b.addEventListener('click', () => { state.ch = ch; if (state.tool === 'eraser' || state.tool === 'eyedropper') setTool('pencil'); changed(false); });
    box.append(b);
    swatchBtns.set(ch, b);
  }
}

function renderSwatches() {
  for (const [ch, b] of swatchBtns) {
    const c = rgba(ch);
    if (ch !== '.') {
      b.style.background = cssColor(c);
      b.style.color = isDark(c) ? '#fff' : '#1b1528';
    }
    b.setAttribute('aria-pressed', String(ch === state.ch));
  }
  $('curBrush').textContent = state.tool === 'eraser' ? '. (eraser)' : state.ch;
}

function renderUnknown() {
  const bad = new Set();
  for (const f of state.frames) for (const ch of f) if (ch !== '.' && !Object.hasOwn(KEY, ch)) bad.add(ch);
  const el = $('unknown');
  el.hidden = !bad.size;
  el.textContent = bad.size ? `Unknown characters kept (shown magenta): ${[...bad].join(' ')}` : '';
}

// ---------------------------------------------------------------- export / import
const esc = s => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const rowsOf = f => {
  const r = [];
  for (let y = 0; y < state.h; y++) r.push(f.slice(y * state.w, (y + 1) * state.w).join(''));
  return r;
};

function exportText() {
  const lines = (f, ind) => rowsOf(f).map(r => `${ind}'${esc(r)}',`).join('\n');
  if (state.frames.length === 1) return `sprite([\n${lines(frame(), '  ')}\n])`;
  return 'sprite([\n' + state.frames.map(f => `  [\n${lines(f, '    ')}\n  ],`).join('\n') + '\n])';
}

/** Returns an array of frames, each an array of row strings; or null if nothing found. */
function parseImport(text) {
  const tok = /\[|\]|'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)"/g;
  const unesc = s => s.replace(/\\(.)/g, '$1');
  const groups = [[]];
  let depth = 0, strings = 0, m;
  while ((m = tok.exec(text))) {
    if (m[0] === '[') {
      if (depth >= 1 && groups[groups.length - 1].length) groups.push([]);
      depth++;
    } else if (m[0] === ']') {
      if (--depth <= 0) break;
    } else if (depth >= 1) {
      groups[groups.length - 1].push(unesc(m[1] ?? m[2]));
      strings++;
    }
  }
  let result;
  if (strings) result = groups.filter(g => g.length);
  else {
    // plain lines; blank lines separate frames
    result = [[]];
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      if (!t) { if (result[result.length - 1].length) result.push([]); }
      else result[result.length - 1].push(t);
    }
    result = result.filter(g => g.length);
  }
  return result.length ? result : null;
}

function importText(text) {
  const frames = parseImport(text);
  if (!frames) return 'Nothing to load.';
  const grids = frames.map(rows => rows.map(r => Array.from(r.replace(/ /g, '.'))));
  const rawW = Math.max(...grids.flat().map(r => r.length));
  const rawH = Math.max(...grids.map(g => g.length));
  const w = clamp(rawW, 1, MAX), h = clamp(rawH, 1, MAX);
  pushHistory();
  state.w = w; state.h = h; state.cur = 0;
  state.frames = grids.map(g => {
    const f = blank(w * h);
    for (let y = 0; y < Math.min(h, g.length); y++) {
      for (let x = 0; x < Math.min(w, g[y].length); x++) f[y * w + x] = g[y][x];
    }
    return f;
  });
  changed();
  const clipped = rawW > MAX || rawH > MAX ? ' (clipped to 64)' : '';
  return `Loaded ${frames.length} frame(s), ${w}x${h}${clipped}.`;
}

let statusTimer;
function say(id, msg) {
  const el = $(id);
  el.textContent = msg;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { el.textContent = ''; }, 3000);
}

async function copyExport() {
  const ta = $('exp');
  try {
    await navigator.clipboard.writeText(ta.value);
  } catch {
    ta.select();
    try { document.execCommand('copy'); } catch { /* ignore */ }
  }
  say('status', 'Copied.');
}

// ---------------------------------------------------------------- persistence
function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      w: state.w, h: state.h, cur: state.cur, frames: state.frames.map(f => f.join('')),
      ch: state.ch, zoom: state.zoom, primary: state.primary, secondary: state.secondary, eye: state.eye,
      fps: state.fps, pscale: state.pscale, mirror: state.mirror, onion: state.onion, grid: state.grid,
    }));
  } catch { /* storage unavailable */ }
}

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(STORE_KEY));
    if (!d || !Array.isArray(d.frames) || !d.frames.length) return;
    const w = clamp(d.w | 0, 1, MAX), h = clamp(d.h | 0, 1, MAX);
    const frames = d.frames.map(s => {
      const f = Array.from(String(s));
      f.length = w * h;
      return Array.from(f, c => c ?? '.');
    });
    state.w = w; state.h = h; state.frames = frames;
    state.cur = clamp(d.cur | 0, 0, frames.length - 1);
    for (const k of ['ch', 'primary', 'secondary', 'eye']) if (typeof d[k] === 'string') state[k] = d[k];
    for (const k of ['zoom', 'fps', 'pscale']) if (Number.isFinite(d[k])) state[k] = d[k];
    for (const k of ['mirror', 'onion', 'grid']) if (typeof d[k] === 'boolean') state[k] = d[k];
    if (!RAMP_NAMES.includes(state.primary)) state.primary = 'slate';
    if (!RAMP_NAMES.includes(state.secondary)) state.secondary = 'cream';
    if (!RAMP_NAMES.includes(state.eye)) state.eye = 'ink';
  } catch { /* ignore corrupt or missing data */ }
}

// ---------------------------------------------------------------- refresh
/** Re-render everything. `dirty` false for pure UI changes that do not touch pixel data. */
function changed(dirty = true) {
  state.cur = clamp(state.cur, 0, state.frames.length - 1);
  renderMain();
  renderFrames();
  renderSwatches();
  renderUnknown();
  drawPreview();
  $('sw').value = state.w;
  $('sh').value = state.h;
  $('undo').disabled = !undoStack.length;
  $('redo').disabled = !redoStack.length;
  $('fDel').disabled = state.frames.length < 2;
  $('fLeft').disabled = state.cur === 0;
  $('fRight').disabled = state.cur === state.frames.length - 1;
  if (dirty || document.activeElement !== $('exp')) $('exp').value = exportText();
  save();
}

function setTool(t) {
  state.tool = t;
  document.querySelectorAll('[data-tool]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tool === t)));
  renderSwatches();
}

// ---------------------------------------------------------------- canvas input
let drag = null;

function cellAt(e) {
  const r = cv.getBoundingClientRect();
  const x = Math.floor((e.clientX - r.left) / r.width * state.w);
  const y = Math.floor((e.clientY - r.top) / r.height * state.h);
  return { x: clamp(x, 0, state.w - 1), y: clamp(y, 0, state.h - 1) };
}

const brush = () => (state.tool === 'eraser' ? '.' : state.ch);

cv.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  e.preventDefault();
  const p = cellAt(e);
  const t = state.tool;
  if (t === 'eyedropper') {
    state.ch = frame()[p.y * state.w + p.x];
    // picked char may be unknown to KEY; keep it as the brush anyway
    setTool('pencil');
    changed(false);
    return;
  }
  pushHistory();
  if (t === 'fill') {
    floodFill(p.x, p.y, brush());
    endEdit();
    return;
  }
  cv.setPointerCapture(e.pointerId);
  drag = { start: p, last: p, base: frame().slice(), id: e.pointerId };
  if (t === 'pencil' || t === 'eraser') setPx(frame(), p.x, p.y, brush());
  else applyShape(p);
  renderMain();
});

cv.addEventListener('pointermove', e => {
  const p = cellAt(e);
  $('coord').textContent = `${p.x}, ${p.y}`;
  if (!drag || e.pointerId !== drag.id) return;
  if (p.x === drag.last.x && p.y === drag.last.y) return;
  if (state.tool === 'pencil' || state.tool === 'eraser') {
    for (const [x, y] of lineCells(drag.last.x, drag.last.y, p.x, p.y)) setPx(frame(), x, y, brush());
  } else {
    applyShape(p);
  }
  drag.last = p;
  renderMain();
});

function applyShape(p) {
  const f = state.frames[state.cur] = drag.base.slice();
  const cells = state.tool === 'line'
    ? lineCells(drag.start.x, drag.start.y, p.x, p.y)
    : rectCells(drag.start.x, drag.start.y, p.x, p.y, state.fillShapes);
  for (const [x, y] of cells) setPx(f, x, y, state.ch);
}

function endDrag(e) {
  if (!drag || e.pointerId !== drag.id) return;
  drag = null;
  endEdit();
}
cv.addEventListener('pointerup', endDrag);
cv.addEventListener('pointercancel', endDrag);

/** Finish an edit; drop the history entry if nothing actually changed. */
function endEdit() {
  if (undoStack.length && undoStack[undoStack.length - 1] === snap()) undoStack.pop();
  changed();
}

// ---------------------------------------------------------------- UI wiring
function fillSelect(id, value) {
  const sel = $(id);
  // 'ink' is the default eye colour (dark navy eyes), not a ramp
  if (id === 'ctxE') sel.add(new Option('ink', 'ink'));
  for (const n of RAMP_NAMES) sel.add(new Option(n, n));
  sel.value = value;
}

function wire() {
  fillSelect('ctxP', state.primary);
  fillSelect('ctxS', state.secondary);
  fillSelect('ctxE', state.eye);
  for (const [id, key] of [['ctxP', 'primary'], ['ctxS', 'secondary'], ['ctxE', 'eye']]) {
    $(id).addEventListener('change', e => { state[key] = e.target.value; invalidateColors(); changed(false); });
  }

  document.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => setTool(b.dataset.tool)));
  setTool(state.tool);

  for (const key of ['mirror', 'onion', 'grid', 'fillShapes', 'allFrames']) {
    const el = $(key);
    el.checked = state[key];
    el.addEventListener('change', () => { state[key] = el.checked; changed(false); });
  }

  const zoom = $('zoom');
  zoom.value = state.zoom;
  zoom.addEventListener('input', () => { state.zoom = +zoom.value; renderMain(); save(); });

  $('undo').addEventListener('click', undo);
  $('redo').addEventListener('click', redo);
  $('resize').addEventListener('click', () => resize(+$('sw').value, +$('sh').value));
  $('flip').addEventListener('click', flipH);
  $('clear').addEventListener('click', () => { pushHistory(); frame().fill('.'); changed(); });
  document.querySelectorAll('[data-shift]').forEach(b => b.addEventListener('click', () => {
    const [dx, dy] = b.dataset.shift.split(',').map(Number);
    shift(dx, dy);
  }));

  // frames
  $('fAdd').addEventListener('click', () => {
    pushHistory();
    state.frames.splice(state.cur + 1, 0, blank(state.w * state.h));
    state.cur++;
    changed();
  });
  $('fDup').addEventListener('click', () => {
    pushHistory();
    state.frames.splice(state.cur + 1, 0, frame().slice());
    state.cur++;
    changed();
  });
  $('fDel').addEventListener('click', () => {
    if (state.frames.length < 2) return;
    pushHistory();
    state.frames.splice(state.cur, 1);
    changed();
  });
  const move = d => {
    const j = state.cur + d;
    if (j < 0 || j >= state.frames.length) return;
    pushHistory();
    [state.frames[state.cur], state.frames[j]] = [state.frames[j], state.frames[state.cur]];
    state.cur = j;
    changed();
  };
  $('fLeft').addEventListener('click', () => move(-1));
  $('fRight').addEventListener('click', () => move(1));

  // preview
  $('fps').value = String(state.fps);
  $('fps').addEventListener('change', e => { state.fps = +e.target.value; startPreview(); save(); });
  $('pscale').value = String(state.pscale);
  $('pscale').addEventListener('change', e => { state.pscale = +e.target.value; drawPreview(); save(); });

  $('copy').addEventListener('click', copyExport);
  $('load').addEventListener('click', () => say('impStatus', importText($('imp').value)));

  document.addEventListener('keydown', e => {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const mod = e.ctrlKey || e.metaKey;
    const k = e.key.toLowerCase();
    if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if (mod && k === 'y') { e.preventDefault(); redo(); }
    else if (!mod && e.key.startsWith('Arrow')) {
      e.preventDefault();
      shift(...{ ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]);
    }
  });
}

load();
buildSwatches();
wire();
changed(false);
startPreview();
