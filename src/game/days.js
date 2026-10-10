// Special days. Certain dates of each month, and the night of the full moon,
// change a rule for the day. (They were days of the week at first; the owner
// found a calendar of identical columns dull: "make them certain days of the
// month".) This file only reads the clock (it imports nothing), so pet.js,
// town.js and wishes.js can all ask it what today is.
//   market    the 3rd, 13th and 23rd: everything in the shops is a fifth off
//   games     the 7th, 17th and 27th: games pay double
//   visiting  the 10th, 20th and 30th: a chat counts double toward friendship
//   moon      the full moon: granting every wish pays double

export const SPECIAL = {
  market:   { name: 'Market day',   what: 'Everything in the shops is a fifth off.' },
  games:    { name: 'Games day',    what: 'Games pay double points.' },
  visiting: { name: 'Visiting day', what: 'A chat counts double toward friendship.' },
  moon:     { name: 'Full moon',    what: 'Granting every wish pays double.' },
};
export const MARKET_OFF = 0.2;
/** The dates of the month each special day falls on. */
export const DATES = { market: [3, 13, 23], games: [7, 17, 27], visiting: [10, 20, 30] };

const DAY = 24 * 60 * 60 * 1000;
const MOON = 29.530588 * DAY, NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

/** Is the moon full on the day of this time? (The day whose noon is nearest the moment it is full.) */
export function fullMoon(time) {
  const d = new Date(time), noon = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12).getTime();
  const phase = (((noon - NEW_MOON) % MOON) + MOON) % MOON / MOON; // 0 new, 0.5 full
  return Math.abs(phase - 0.5) < 0.5 * DAY / MOON;
}

/** The special days that fall on the day of this time: a list of the names above. */
export function specialDays(time) {
  const date = new Date(time).getDate(), out = [];
  for (const [kind, dates] of Object.entries(DATES)) if (dates.includes(date)) out.push(kind);
  if (fullMoon(time)) out.push('moon');
  return out;
}
export const isDay = (time, kind) => specialDays(time).includes(kind);

/** What something costs today (a fifth off on market day). */
export const priceToday = (time, price) => (isDay(time, 'market') ? Math.round(price * (1 - MARKET_OFF)) : price);
