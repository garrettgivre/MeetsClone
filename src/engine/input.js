// Three device buttons (A = next, B = select, C = back) from keyboard, the
// on-screen buttons, and direct taps on the screen (mobile-first).

import { W, H } from './screen.js';

const KEYS = {
  ArrowLeft: 'A', ArrowUp: 'A', z: 'A', a: 'A',
  ArrowRight: 'A2', ArrowDown: 'A2',
  Enter: 'B', ' ': 'B', x: 'B', b: 'B',
  Escape: 'C', Backspace: 'C', c: 'C',
};

export function setupInput({ canvas, buttons, onButton, onTap, onSwipe, onFirstGesture }) {
  let gestured = false;
  const first = () => { if (!gestured) { gestured = true; onFirstGesture?.(); } };
  const buzz = () => { try { navigator.vibrate?.(6); } catch { /* not supported */ } };

  window.addEventListener('keydown', e => {
    if (e.target instanceof HTMLInputElement) return;
    const b = KEYS[e.key] || KEYS[e.key.toLowerCase?.()];
    if (!b) return;
    e.preventDefault();
    first();
    // Right/Down cycle forward, Left/Up cycle backward.
    onButton(b === 'A2' ? 'A' : b, b === 'A' && e.key.startsWith('Arrow') ? -1 : 1);
  });

  for (const el of buttons) {
    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      first();
      buzz();
      el.classList.add('down');
      onButton(el.dataset.btn, 1);
    });
    const up = () => el.classList.remove('down');
    el.addEventListener('pointerup', up);
    el.addEventListener('pointerleave', up);
    el.addEventListener('pointercancel', up);
  }

  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    first();
    const r = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - r.left) / r.width * W);
    const y = Math.floor((e.clientY - r.top) / r.height * H);
    if (onTap(x, y)) buzz();
    down = { x: e.clientX, y: e.clientY, w: r.width };
  });
  // a sideways drag across a good part of the screen is a swipe: -1 to the left, 1 to the right
  let down = null;
  const lift = (e) => {
    if (!down) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y, far = down.w * 0.2;
    down = null;
    if (Math.abs(dx) > far && Math.abs(dx) > Math.abs(dy) * 2) onSwipe?.(Math.sign(dx));
  };
  canvas.addEventListener('pointerup', lift);
  canvas.addEventListener('pointercancel', () => { down = null; });
}
