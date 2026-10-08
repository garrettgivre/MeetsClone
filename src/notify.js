// Care alerts as browser notifications. What to say is decided in
// src/game/alerts.js; this file only talks to the browser.
//
// There is no server, so alerts can only be sent while the game is still open
// somewhere: a background tab, a minimised window or the installed app. A
// service worker (sw.js) shows them, which phones require, and brings the
// game to the front when one is tapped. (The same worker keeps the game's
// files up to date, so it is registered at start-up whether alerts are on or not.)

let registration = null;

export const supported = () => typeof Notification !== 'undefined';

/** 'granted' | 'denied' | 'default' | 'unsupported' */
export function permission() { return supported() ? Notification.permission : 'unsupported'; }

export async function registerWorker() {
  if (registration || !('serviceWorker' in navigator)) return registration;
  try { registration = await navigator.serviceWorker.register('sw.js'); } catch { registration = null; }
  return registration;
}

/** Ask for permission if it hasn't been asked yet. Returns the permission. */
export async function enable() {
  if (!supported()) return 'unsupported';
  let p = Notification.permission;
  if (p === 'default') { try { p = await Notification.requestPermission(); } catch { p = 'denied'; } }
  if (p === 'granted') await registerWorker();
  return p;
}

/** Show an alert: { title, body, tag }. Returns whether it was sent. */
export async function show({ title, body, tag = 'care' }) {
  if (permission() !== 'granted') return false;
  const opts = { body, tag, renotify: true, icon: 'assets/icon.svg' };
  try {
    const reg = await registerWorker();
    if (reg?.showNotification) { await reg.showNotification(title, opts); return true; }
  } catch { /* fall through to a plain notification */ }
  try {
    const n = new Notification(title, opts);
    n.onclick = () => { window.focus(); n.close(); };
    return true;
  } catch { return false; }
}

/** Take down any alert still showing (the player is back). */
export async function clear(tag = 'care') {
  try { for (const n of await registration?.getNotifications({ tag }) || []) n.close(); } catch { /* nothing to clear */ }
}
