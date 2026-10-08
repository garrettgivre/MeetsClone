// Care alerts: which simulation event is worth a notification, and what it
// says. Pure logic (no browser APIs) so it can be tested; src/notify.js shows
// the result.

// Most urgent first. Whims and waking up aren't worth an alert.
const ORDER = ['death', 'runaway', 'critical', 'sick', 'attention', 'squirm', 'dirty', 'poop', 'sleep', 'hatch', 'grow'];

const ATTENTION = {
  hungry: (n) => `${n} is hungry!`,
  unhappy: (n) => `${n} is sad and wants to play.`,
  dirty: (n) => `${n} is filthy and needs a bath!`,
  sick: (n) => `${n} feels sick...`,
  lights: (n) => `${n} is asleep with the lights on.`,
};

/** The line for one event, or null if it isn't worth an alert. */
export function alertLine(event, pet) {
  const n = pet?.name || 'Your pet';
  switch (event.type) {
    case 'death': return `${n} has returned to the stars.`;
    case 'runaway': return `${n} ran away...`;
    case 'critical': return `${n} is very sick! It needs medicine now.`;
    case 'sick': return `${n} feels sick...`;
    case 'attention': return ATTENTION[event.reason]?.(n) || null;
    case 'squirm': return `${n} needs the toilet!`;
    case 'dirty': return `${n} is getting dirty.`;
    case 'poop': return `${n} made a mess.`;
    case 'sleep': return `${n} fell asleep. Turn off the lights!`;
    case 'hatch': return `${n} hatched!`;
    case 'grow': return event.stage === 'adult' && pet?.species ? `${n} grew into a ${pet.species}!` : `${n} is now a ${event.stage}!`;
    default: return null;
  }
}

/**
 * One alert for a batch of events: the most urgent one. Returns
 * { title, body, tag } or null. Alerts share a tag, so a newer one replaces
 * the last instead of piling up.
 */
export function alertFor(events, pet) {
  let best = null, rank = ORDER.length;
  for (const e of events) {
    const r = ORDER.indexOf(e.type);
    if (r < 0 || r >= rank) continue;
    const body = alertLine(e, pet);
    if (body) { best = body; rank = r; }
  }
  return best ? { title: 'MeetsClone', body: best, tag: 'care' } : null;
}
