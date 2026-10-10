// What is going on, day by day, for the News screen and its calendar. Nothing
// here changes the game: it reads the special days (days.js), the town's clock
// (who retires and who is born when: town.js), the pet, the garden and the
// news already filed, and says what falls on a given day.
//   an entry: { kind, title, text }
//   kinds: market, games, visiting, moon (special days), retire, baby (the town, to come),
//          marry (the pet), news (something that has happened)
import { SPECIAL, specialDays, priceToday } from './days.js';
import { LOCATIONS, LOCATION, AGELESS, TENURE, HEIR_AT, townState, turnsOf, resident, saleOfDay, salePrice, dishOfDay } from './town.js';
import { FOODS, TOYS, CLOTHES } from './items.js';
import { MARRY_AFTER, canMarry } from './pet.js';
import { gardenOf, stageOf, wateredToday, CROPS } from './garden.js';
import { todaysWishes } from './wishes.js';

const DAY = 24 * 60 * 60 * 1000;
export const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
const startOf = (time) => { const d = new Date(time); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };

/** Everything that falls on the day of `time`: special days, what the town has planned, the pet's own dates, and news from that day. */
export function eventsOn(game, time) {
  const out = [], t = townState(game), from = startOf(time), to = from + DAY;
  for (const k of specialDays(time)) out.push({ kind: k, title: SPECIAL[k].name, text: SPECIAL[k].what });
  // the town, from today on: which of your friends hands over, and whose child is born (the town's clock is fixed, so these are known)
  if (to > game.simTime) {
    for (const loc of LOCATIONS) {
      if (AGELESS.includes(loc.id) || !(t.friends[loc.id] > 0)) continue; // (only keepers you have made friends with: the rest is not your news)
      const { retire, baby } = turnsOf(game, loc.id);
      const who = resident(loc.id, game);
      if (retire >= from && retire < to && retire > game.simTime) out.push({ kind: 'retire', title: `${who.name} retires`, text: `${loc.name}: ${who.heir ? who.heir.name + ' takes over.' : 'their child takes over.'}` });
      if (baby !== null && baby >= from && baby < to && baby > game.simTime) out.push({ kind: 'baby', title: 'A baby is due', text: `${loc.name}: ${who.name} is expecting.` });
    }
  }
  // the pet: the day it is old enough to marry
  const pet = game.pet;
  if (pet && !pet.gone && pet.stage === 'adult' && !canMarry(pet)) {
    const at = game.simTime + (MARRY_AFTER - pet.adultMs);
    if (at >= from && at < to) out.push({ kind: 'marry', title: `${pet.name} comes of age`, text: 'Old enough to marry. The matchmaker is at the Wedding Chapel.' });
  }
  // what has happened
  for (const n of t.news) if (n.at >= from && n.at < to) out.push({ kind: 'news', title: 'In town', text: n.msg });
  return out;
}

/**
 * Today, in sections for the News screen: [{ head, items: [{ kind, text }] }]. Special days, what the shops
 * have on, what has happened in town today, and things at home worth a look.
 */
export function today(game) {
  const now = game.simTime, out = [];
  const special = specialDays(now).map(k => ({ kind: k, text: `${SPECIAL[k].name}! ${SPECIAL[k].what}` }));
  const planned = eventsOn(game, now).filter(e => ['retire', 'baby', 'marry'].includes(e.kind)).map(e => ({ kind: e.kind, text: `${e.title}. ${e.text}` }));
  if (special.length || planned.length) out.push({ head: 'TODAY', items: [...special, ...planned] });

  const [kind, id] = saleOfDay(game), item = kind === 'toy' ? TOYS[id] : CLOTHES[id];
  const owned = (kind === 'toy' ? game.toys : game.wardrobe).includes(id);
  const shops = [{ kind: 'dish', text: `Cafe: ${FOODS[dishOfDay(game)].name} is the dish of the day.` }];
  if (!owned) shops.push({ kind: 'market', text: `Department Store: ${item.name} for ${salePrice(item.price)}, down from ${item.price}.` });
  out.push({ head: 'IN THE SHOPS', items: shops });

  const news = townState(game).news.filter(n => sameDay(n.at, now)).map(n => ({ kind: n.kind || 'news', text: n.msg })).reverse();
  if (news.length) out.push({ head: 'IN TOWN', items: news });

  const home = [], pet = game.pet;
  const plots = gardenOf(game).plots;
  for (const p of plots) if (p && stageOf(p) === 'ripe') home.push({ kind: 'garden', text: `The ${CROPS[p.crop].name.toLowerCase()} is ripe for picking.` });
  if (plots.some(p => p && stageOf(p) !== 'ripe' && !wateredToday(game, p))) home.push({ kind: 'garden', text: 'The vegetable bed wants watering.' });
  const wishes = pet && todaysWishes(game);
  if (wishes) { const left = wishes.list.filter(w => !w.done).length; home.push({ kind: 'wish', text: left ? `${pet.name} has ${left} ${left === 1 ? 'wish' : 'wishes'} left today.` : 'Every wish granted today!' }); }
  if (pet && pet.stage === 'adult' && canMarry(pet)) home.push({ kind: 'marry', text: `${pet.name} is old enough to marry.` });
  if (home.length) out.push({ head: 'AT HOME', items: home });
  return out;
}

/** The days of the month `time` falls in: { year, month, first (weekday of the 1st, 0 Sunday), days: [{ date, time, kinds }] }. */
export function monthOf(game, time) {
  const d = new Date(time), year = d.getFullYear(), month = d.getMonth();
  const count = new Date(year, month + 1, 0).getDate(), days = [];
  for (let date = 1; date <= count; date++) {
    const at = new Date(year, month, date, 12).getTime();
    days.push({ date, time: at, kinds: [...new Set(eventsOn(game, at).map(e => e.kind))] });
  }
  return { year, month, first: new Date(year, month, 1).getDay(), days };
}

export { priceToday };
