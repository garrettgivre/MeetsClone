// Boot: screen, input, the scene stack, the simulation clock and saving.
import { Screen, W, H, lcdCell } from './engine/screen.js';
import { C, COLORS } from './engine/palette.js';
import { setupInput } from './engine/input.js';
import { unlockAudio, play, setMuted } from './engine/audio.js';
import { newGame, advance, needs, MIN } from './game/pet.js';
import * as store from './game/save.js';
import { alertFor } from './game/alerts.js';
import * as notify from './notify.js';
import { checkForUpdate, justUpdated } from './update.js';
import { VERSION } from './version.js';
import { paintButtons } from './art/buttons.js';
import { HomeScene } from './scenes/home.js';
import { dialog, LAYOUT } from './ui.js';

const canvas = document.getElementById('screen');
const scr = new Screen(canvas);
const params = new URLSearchParams(location.search);
const DEV = params.has('dev');

// ----- installing as an app -----
// Chrome offers the install through this event; keeping it lets Settings >
// Install app show Chrome's own install dialog directly. (Chrome's menu can
// refuse with "already installed" when another app from the same site is on
// the phone, and this route doesn't go through that check.)
let installEvent = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvent = e; });
window.addEventListener('appinstalled', () => { installEvent = null; app.toast('Installed! Look for MeetsClone with your apps.', 3600); });
const standalone = () => ['standalone', 'fullscreen'].some(m => window.matchMedia?.(`(display-mode: ${m})`).matches) || navigator.standalone === true;

const app = {
  /** 'app' (running installed), 'ready' (can be installed now) or 'no' (the browser hasn't offered it). */
  get installState() { return standalone() ? 'app' : installEvent ? 'ready' : 'no'; },
  /** Show the browser's install dialog. Resolves to 'accepted', 'dismissed' or 'unavailable'. */
  async install() {
    if (!installEvent) return 'unavailable';
    const e = installEvent;
    installEvent = null; // an event can only be used once
    try { e.prompt(); return (await e.userChoice).outcome; } catch { return 'unavailable'; }
  },
  scr,
  devUrl: DEV,
  // cheats: ?dev in the address, or switched on in Settings > Debug
  get dev() { return DEV || !!this.game?.settings.cheats; },
  /** The LCD screen filter (Settings): the game screen, the buttons and the glass over both. */
  setFilter(on) {
    on = on !== false;
    scr.setFilter(on);
    paintButtons(on);
    document.body.classList.toggle('lcd', on);
    document.documentElement.style.setProperty('--cell', on ? `url(${lcdCell().toDataURL()})` : 'none');
    if (this.sky) this.pageSky(...this.sky);
  },
  /**
   * The page round the screen carries on the sky in the game's bars: its top
   * colour above the screen (a phone's notch), its bottom colour in the strip
   * with the buttons. With the LCD filter on, the screen's colours come out a
   * shade deeper (its own shadow is laid over it), so the page's are too.
   */
  pageSky(top, bottom) {
    this.sky = [top, bottom];
    // (a colour's name, or its palette index)
    const css = (c) => {
      const lcd = document.body.classList.contains('lcd');
      return `rgb(${COLORS[typeof c === 'number' ? c : C(c)].slice(0, 3).map(v => (lcd ? Math.round(v * (0.8 + 0.2 * v / 255)) : v)).join(', ')})`;
    };
    document.getElementById('bezel').style.background = css(top);
    // The page is sky down to where the game's lower bars begin and ground from there on, so that
    // if the screen cannot fill the full width, what shows beside it matches what is next to it.
    const r = canvas.getBoundingClientRect(), split = Math.round(r.top + r.height * LAYOUT.bottom.y / H);
    document.body.style.background = `linear-gradient(to bottom, ${css(top)} 0, ${css(top)} ${split}px, ${css(bottom)} ${split}px, ${css(bottom)} 100%)`;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', css(top));
  },
  game: null,
  scenes: [],
  time: 0,           // ms since start, for animations
  toasts: [],
  get scene() { return this.scenes[this.scenes.length - 1]; },
  push(s) { this.scenes.push(s); s.enter?.(); },
  pop() { if (this.scenes.length > 1) { this.scenes.pop(); this.scene.resume?.(); } },
  popTo(s) { while (this.scenes.length > 1 && this.scene !== s) this.scenes.pop(); this.scene.resume?.(); },
  home() { this.popTo(this.scenes[0]); },
  sfx(name) { if (this.game?.settings.sound) play(name); },
  toast(msg, ms = 2200) { this.toasts = [{ msg, until: this.time + ms }]; },
  save() { if (this.game) { this.game.lastReal = Date.now(); store.save(this.game); } },
  reset() {
    store.clear();
    this.game = newGame(Date.now());
    this.setFilter(this.game.settings.lcd);
    this.scenes = [];
    this.push(new HomeScene(this));
    this.save();
  },
  load(game) {
    this.game = game;
    this.setFilter(game.settings.lcd);
    this.scenes = [];
    this.push(new HomeScene(this));
    this.save();
  },
};

// ----- load or start a game, then catch up on time spent away -----
let game = store.load();
if (!game) game = newGame(Date.now());
else {
  const away = Math.min(Date.now() - (game.lastReal || Date.now()), 60 * 24 * 60 * MIN);
  if (away > 0) {
    const events = advance(game, away);
    app.pendingEvents = events;
    app.awayMs = away;
  }
}
game.lastReal = Date.now();
app.game = game;
setMuted(!game.settings.sound);
app.setFilter(game.settings.lcd);
// the service worker keeps the game's files fresh (and shows care alerts)
notify.registerWorker();
app.push(new HomeScene(app));
// ----- always the newest release: check at start, and again whenever the game comes back to the front -----
if (justUpdated()) app.toast(`Updated to v${VERSION}!`, 2600);
checkForUpdate(() => app.save());
// ...and every few minutes while the game stays open, so a long session picks up a release too
setInterval(() => { if (!document.hidden) checkForUpdate(() => app.save()); }, 5 * 60 * 1000);
if (app.pendingEvents?.length) app.scene.handleEvents(app.pendingEvents, true);


// ----- input -----
setupInput({
  canvas,
  buttons: document.querySelectorAll('.btn'),
  onButton: (b, dir) => app.scene.button?.(b, dir),
  onTap: (x, y) => {
    if (app.scene.tap?.(x, y)) return true;
    // The menu icons above and below the room always work: tapping one from inside
    // another menu closes that menu and opens the one tapped.
    const home = app.scenes[0], { top, bottom } = LAYOUT;
    const onIcons = (y >= top.y && y < top.y + top.h) || (y >= bottom.y && y < bottom.y + bottom.h);
    if (app.scene !== home && onIcons) { app.home(); return home.tap(x, y); }
    return false;
  },
  onSwipe: (dir) => app.scene.swipe?.(dir),
  onFirstGesture: unlockAudio,
});

// ----- sizing: the screen fills the page from the top edge down, as wide as it can go -----
// The buttons come up over the bottom of the screen: the outer two rise BUTTON_LIFT game pixels into the bar that
// names the room (which only has writing in its middle), and the middle one stops just under that writing.
const BUTTON_LIFT = 6;
const BUTTON_ROWS = 36 + 5 - BUTTON_LIFT; // so this is the least the page needs under the screen, in game pixels
function resize() {
  const device = document.getElementById('device');
  const inset = parseFloat(getComputedStyle(document.getElementById('bezel')).paddingTop) || 0; // a phone's notch
  const availW = device.clientWidth;
  const availH = window.innerHeight - inset;
  // The buttons are pixel art at the game's own scale, so the strip under the
  // screen grows with it: BUTTON_ROWS game pixels (a button, the drop of the
  // middle one, and some air) plus a small fixed margin.
  // Whichever runs out first, width or height, the screen takes all of it
  // (so the scale is rarely a whole number; the canvas is double density, which keeps it crisp).
  // (so on any phone tall enough for the buttons the screen runs edge to edge, with nothing beside it)
  const s = Math.max(1, Math.min(availW / W, (availH - 12) / (H + BUTTON_ROWS)));
  canvas.style.width = Math.round(W * s) + 'px';
  canvas.style.height = Math.round(H * s) + 'px';
  document.documentElement.style.setProperty('--px', s + 'px'); // one game pixel, for the buttons
  // with room to spare under the screen, the buttons sit halfway down it
  document.documentElement.style.setProperty('--drop', Math.max(0, (availH - 10 - s * (H + BUTTON_ROWS)) / 2) + 'px');
  if (app.sky) app.pageSky(...app.sky); // the page's colours change over where the screen's do
}
window.addEventListener('resize', resize);
resize();

// ----- main loop: 30 Hz updates, simulation every real second -----
const STEP = 1000 / 30;
let last = performance.now();
let acc = 0;
let simAcc = 0;
let saveAcc = 0;

function frame(now) {
  let dt = Math.min(250, now - last);
  last = now;
  acc += dt;
  while (acc >= STEP) {
    acc -= STEP;
    app.time += STEP;
    simAcc += STEP;
    saveAcc += STEP;
    if (simAcc >= 1000) {
      simAcc -= 1000;
      const speed = app.dev ? (app.game.settings.speed || 1) : 1;
      const events = advance(app.game, 1000 * speed);
      if (events.length) app.scenes[0].handleEvents(events);
    }
    if (saveAcc >= 10000) { saveAcc = 0; app.save(); }
    for (const s of app.scenes) s.tick?.(STEP);
    app.scene.update?.(STEP);
  }
  // The home screen always draws (status and icon bars stay live); the top
  // scene draws over the room area.
  app.scenes[0].draw(scr);
  if (app.scenes.length > 1) app.scene.draw(scr);
  const toast = app.toasts[0];
  if (toast) {
    if (app.time > toast.until) app.toasts = [];
    else dialog(scr, toast.msg, { y: LAYOUT.room.y + 4 });
  }
  scr.present();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ----- in the background -----
// The frame loop stops while the page is hidden, so a slow timer keeps the
// pet's clock running and sends a care alert when something happens. (Browsers
// slow this timer down, and a phone may stop it altogether after a while.)
const TITLE = document.title;
function background() {
  const g = app.game;
  if (!document.hidden || !g) return;
  const away = Date.now() - (g.lastReal || Date.now());
  if (away < 1000) return;
  const events = advance(g, Math.min(away, 60 * 24 * 60 * MIN));
  g.lastReal = Date.now();
  if (events.length) {
    app.awayMs = 0;
    app.scenes[0].handleEvents(events, true);
    const alert = g.settings.alerts && alertFor(events, g.pet);
    if (alert) notify.show(alert);
  }
  const pet = g.pet;
  document.title = pet && !pet.gone && (needs(pet) || pet.squirm) ? `(!) ${pet.name} needs you` : TITLE;
  store.save(g);
}
setInterval(background, 15000);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) app.save();
  else {
    document.title = TITLE;
    notify.clear();
    checkForUpdate(() => app.save());
    // catch up on time spent in the background
    const away = Date.now() - app.game.lastReal;
    if (away > 2000) {
      const events = advance(app.game, Math.min(away, 60 * 24 * 60 * MIN));
      if (events.length) app.scenes[0].handleEvents(events, true);
    }
    app.game.lastReal = Date.now();
  }
});
window.addEventListener('pagehide', () => app.save());

window.app = app; // handy for debugging in the console
