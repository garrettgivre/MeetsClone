// The status pages. A or a tap turns the page, C goes back.
//   TODAY   the pet's picture, its hunger and happiness, and today's wishes
//   CARE    how clean, how heavy, how well, and its manners and toilet training
//   SKILLS  the four skills and its job
//   ABOUT   who it is: age, family, favourites
// (Its genes are in the Gene Book and the Pairing Lab, not here.)
import { C } from '../engine/palette.js';
import { W } from '../engine/screen.js';
import { LAYOUT, COL, titleBar, heartRow, text } from '../ui.js';
import { composePet, composeEgg, CANVAS, GROUND } from '../game/render.js';
import { hearts, favouriteToy, MARRY_AFTER, HOUR, canMarry, isChubby, isDirty, MAX_DISCIPLINE, POTTY_TRAINED, SKILLS, SKILL_LABEL, SKILL_MAX, skillLevel } from '../game/pet.js';
import { jobOf, jobRank } from '../game/town.js';
import { TOYS } from '../game/items.js';
import { backdrop } from '../art/town.js';
import { todaysWishes, wishText, WISH_POINTS, WISH_BONUS } from '../game/wishes.js';

const PAGES = ['TODAY', 'CARE', 'SKILLS', 'ABOUT'];
const GRIME = ['SPOTLESS', 'CLEAN', 'GRUBBY', 'DIRTY', 'FILTHY'];

function age(ms) {
  const h = Math.floor(ms / HOUR);
  if (h < 1) return `${Math.floor(ms / 60000)} MIN`;
  if (h < 48) return `${h} HOURS`;
  return `${Math.floor(h / 24)} DAYS`;
}

export class StatusScene {
  constructor(app) { this.app = app; this.page = 0; }
  button(b, dir = 1) {
    if (b === 'A' || b === 'B') { this.page = (this.page + (b === 'A' ? dir : 1) + PAGES.length) % PAGES.length; this.app.sfx('blip'); }
    else if (b === 'C') { this.app.sfx('back'); this.app.pop(); }
  }
  tap(x, y) {
    if (y < LAYOUT.room.y || y >= LAYOUT.room.y + LAYOUT.room.h) return false;
    if (y < LAYOUT.room.y + 12) this.button('C'); else this.button('B');
    return true;
  }
  draw(scr) {
    const game = this.app.game, pet = game.pet, p = pet.phenotype;
    const { y: ry, h: rh } = LAYOUT.room;
    scr.rect(0, ry, W, rh, COL.panel);
    titleBar(scr, `◀ ${PAGES[this.page]}`, ry);
    // which page this is: a row of pips along the bottom
    const pipY = ry + rh - 7;
    PAGES.forEach((_, i) => scr.panel(W / 2 - PAGES.length * 4 + i * 8 + 1, pipY, 5, 5, i === this.page ? COL.accent : COL.mist, COL.ink));

    let y = ry + 17;
    const line = (label, value, color = COL.ink) => {
      text(scr, label, 8, y, COL.gray);
      text(scr, String(value).toUpperCase(), W - 8, y, color, { align: 'right' });
      y += 10;
    };
    const bar = (label, value, max, fill) => { text(scr, label, 8, y + 1, COL.gray); meter(scr, W - 44, y, value, max, fill); y += 11; };
    const head = (label) => { y += 2; text(scr, label, 8, y, COL.accent); scr.rule(8, y + 8, W - 16, COL.silver); y += 12; };
    const egg = pet.stage === 'egg';

    switch (PAGES[this.page]) {
      case 'TODAY': {
        // the pet's picture, with its name and its two needs beside it
        scr.panel(6, ry + 15, 58, 52, C('white'), COL.ink);
        const bm = egg ? composeEgg(pet.generation > 1 ? p : null)
          : composePet(p, pet.stage, { expr: pet.asleep ? 'sleep' : pet.sick ? 'sick' : 'idle', gender: pet.gender, wear: pet.wear, species: pet.species });
        scr.setClip(8, ry + 17, 54, 48);
        scr.bitmap(backdrop('photo0'), -29, ry + 64 - 86); // a portrait, on the studio's meadow backdrop
        scr.bitmap(bm, 35 - CANVAS / 2, ry + 64 - GROUND);
        scr.noClip();
        const cx = 69;
        text(scr, `${pet.name.toUpperCase()} ${pet.gender === 'f' ? '♀' : '♂'}`, cx, ry + 17, COL.ink);
        text(scr, `${pet.stage.toUpperCase()}  G${pet.generation}`, cx, ry + 26, COL.gray);
        text(scr, 'HUNGER', cx, ry + 35, COL.gray); heartRow(scr, cx, ry + 42, hearts(pet.hunger), 'rice');
        text(scr, 'HAPPY', cx, ry + 52, COL.gray); heartRow(scr, cx, ry + 59, hearts(pet.happy));
        // today's wishes
        y = ry + 70;
        head('WISHES');
        const wishes = todaysWishes(game);
        if (!wishes) { text(scr, egg ? 'WAITING TO HATCH...' : 'TOO LITTLE TO WISH YET', 8, y, COL.gray); break; }
        for (const w of wishes.list) {
          scr.panel(8, y - 1, 7, 7, w.done ? COL.good : C('white'), COL.ink); // a box, filled in when the wish has come true
          text(scr, wishText(w).toUpperCase(), 19, y, w.done ? COL.gray : COL.ink);
          if (!w.done) text(scr, `+${WISH_POINTS}`, W - 8, y, COL.shade, { align: 'right' });
          y += 11;
        }
        text(scr, wishes.paid ? 'EVERY WISH GRANTED!' : `ALL THREE: +${WISH_BONUS} MORE`, W / 2, y + 2, wishes.paid ? COL.good : COL.gray, { align: 'center' });
        break;
      }
      case 'CARE':
        line('HEALTH', pet.critical ? 'CRITICAL!' : pet.sick ? pet.sick : 'GOOD', pet.sick ? COL.bad : COL.good);
        line('CLEAN', GRIME[Math.min(4, Math.floor(pet.dirt || 0))], isDirty(pet) ? COL.bad : COL.ink);
        line('WEIGHT', `${pet.weight}G${isChubby(pet) ? ' CHUBBY' : ''}`, isChubby(pet) ? COL.bad : COL.ink);
        line('CARE MISSES', pet.careMistakes, pet.careMistakes > 4 ? COL.bad : COL.ink);
        if (colorHint(pet)) line('TURNING', colorHint(pet));
        head('TRAINING');
        bar('MANNERS', pet.discipline || 0, MAX_DISCIPLINE);
        bar('TOILET', pet.potty || 0, POTTY_TRAINED);
        break;
      case 'SKILLS':
        for (const s of SKILLS) bar(SKILL_LABEL[s].toUpperCase(), skillLevel(pet, s), SKILL_MAX, C('sky.1'));
        if (pet.stage === 'adult') { head('WORK'); line('JOB', `${jobOf(pet).name} ${'★'.repeat(jobRank(pet))}`); }
        else { y += 4; text(scr, 'SCHOOL AND GAMES TEACH THESE', 8, y, COL.gray); }
        break;
      case 'ABOUT':
        line('NAME', `${pet.name} ${pet.gender === 'f' ? '♀' : '♂'}`);
        line(pet.species ? 'KIND' : 'STAGE', pet.species || pet.stage);
        line('AGE', age(pet.ageMs));
        line('GENERATION', pet.generation);
        if (pet.parents) line('PARENTS', pet.parents.join(' + '));
        if (pet.stage === 'adult') line('MARRY', canMarry(pet) ? 'READY!' : `IN ${Math.ceil((MARRY_AFTER - pet.adultMs) / HOUR)}H`, canMarry(pet) ? COL.good : COL.ink);
        head('LIKES');
        line('TASTE', p.taste);
        line('TOY', TOYS[favouriteToy(pet)].name);
        break;
    }
  }
}

/** A row of segments, like the discipline meter on the original device. */
function meter(scr, x, y, value, max, fill = C('gold.2')) {
  const w = Math.floor(35 / max);
  for (let i = 0; i < max; i++) {
    scr.panel(x + i * w, y, w - 1, 6, i < value ? fill : COL.mist, COL.ink);
  }
}

/** The colour its meals are turning it, and how far along: "blue 3/5", or '' if none. */
function colorHint(pet) {
  const entries = Object.entries(pet.colorMeals || {}).filter(([, n]) => n > 0);
  if (!entries.length) return '';
  const [c, n] = entries.sort((a, b) => b[1] - a[1])[0];
  return `${c} ${n}/5`;
}
