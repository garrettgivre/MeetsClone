// Checking for a newer release. The site has no build step, so its files keep
// the same names from one release to the next and a browser may go on using
// the copies it already has. At start-up (and whenever the game comes back to
// the front) this asks the server which version it is serving; if that isn't
// the one running, the page reloads once. The service worker (sw.js) fetches
// every file fresh, so the reload brings in the whole new release.

import { VERSION } from './version.js';
import { registerWorker } from './notify.js';

const KEY = 'meetsclone.updating'; // 'version@time' of the last reload made for an update (this tab only)
const RETRY_MS = 3 * 60 * 1000;     // how long to wait before reloading for the same version again

/** The version the server has now, or null if it can't be reached. */
export async function latestVersion() {
  const r = await fetch(`src/version.js?t=${Date.now()}`, { cache: 'no-store' });
  if (!r.ok) return null;
  return /VERSION = '([^']+)'/.exec(await r.text())?.[1] || null;
}

/** True if this page load is the reload after an update (asked once). */
export function justUpdated() {
  try {
    const was = (sessionStorage.getItem(KEY) || '').split('@')[0] === VERSION;
    if (was) sessionStorage.removeItem(KEY);
    return was;
  } catch { return false; }
}

/** Wait (briefly) until the service worker is in charge of this page. */
async function workerReady() {
  if (!('serviceWorker' in navigator)) return;
  await registerWorker();
  if (navigator.serviceWorker.controller) return;
  await Promise.race([
    new Promise((done) => navigator.serviceWorker.addEventListener('controllerchange', done, { once: true })),
    new Promise((done) => setTimeout(done, 3000)),
  ]);
}

/**
 * Reload into the newest release if there is one. `beforeReload` runs first
 * (save the game there). Returns true if a reload is under way.
 */
export async function checkForUpdate(beforeReload) {
  try {
    const latest = await latestVersion();
    if (!latest || latest === VERSION) return false;
    // If a reload for this version was made moments ago and the old files came
    // back anyway (the host can lag a little), wait before trying again rather
    // than reloading in a loop.
    const [tried, at] = (sessionStorage.getItem(KEY) || '').split('@');
    if (tried === latest && Date.now() - Number(at) < RETRY_MS) return false;
    sessionStorage.setItem(KEY, `${latest}@${Date.now()}`);
    await workerReady();
    beforeReload?.();
    location.reload();
    return true;
  } catch { return false; } // offline, or storage blocked: carry on with what we have
}
