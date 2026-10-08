// Status pages: profile, needs, personality, genes. A / tap = next page.
import { C } from '../engine/palette.js';
import { W } from '../engine/screen.js';
import { LAYOUT, COL, titleBar, heartRow, text } from '../ui.js';
import { composePet, composeEgg, CANVAS, GROUND } from '../game/render.js';
import { hearts, favouriteToy, MARRY_AFTER, HOUR, canMarry } from '../game/pet.js';
import { TOYS } from '../game/items.js';
import { carried, GENE_LABELS } from '../game/genetics.js';

const PAGES = ['PROFILE', 'NEEDS', 'PERSONALITY', 'LOOKS', 'HIDDEN GENES'];

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
    const pet = this.app.game.pet;
    const { y: ry, h: rh } = LAYOUT.room;
    scr.rect(0, ry, W, rh, COL.panel);
    titleBar(scr, `◀ ${PAGES[this.page]}  ${this.page + 1}/${PAGES.length}`, ry);
    // portrait
    scr.panel(W / 2 - 30, ry + 15, 60, 52, C('sky.3'), COL.ink);
    const bm = pet.stage === 'egg' ? composeEgg(pet.generation > 1 ? pet.phenotype : null)
      : composePet(pet.phenotype, pet.stage, { expr: pet.asleep ? 'sleep' : pet.sick ? 'sick' : 'idle', gender: pet.gender, wear: pet.wear });
    scr.setClip(W / 2 - 29, ry + 16, 58, 50);
    scr.bitmap(bm, W / 2 - CANVAS / 2, ry + 64 - GROUND);
    scr.noClip();

    let y = ry + 72;
    const line = (label, value, color = COL.ink) => {
      text(scr, label, 8, y, COL.gray);
      text(scr, String(value).toUpperCase(), W - 8, y, color, { align: 'right' });
      y += 9;
    };
    const p = pet.phenotype;
    switch (PAGES[this.page]) {
      case 'PROFILE':
        line('NAME', `${pet.name} ${pet.gender === 'f' ? '♀' : '♂'}`);
        line('GENERATION', pet.generation);
        line('STAGE', pet.stage);
        if (pet.species) line('KIND', pet.species);
        line('AGE', age(pet.ageMs));
        if (pet.parents) line('PARENTS', pet.parents.join(' + '));
        if (pet.stage === 'adult') line('MARRY', canMarry(pet) ? 'READY!' : `IN ${Math.ceil((MARRY_AFTER - pet.adultMs) / HOUR)}H`, canMarry(pet) ? COL.good : COL.ink);
        break;
      case 'NEEDS':
        text(scr, 'HUNGER', 8, y + 1, COL.gray); heartRow(scr, W - 44, y, hearts(pet.hunger), 'rice'); y += 12;
        text(scr, 'HAPPY', 8, y + 1, COL.gray); heartRow(scr, W - 44, y, hearts(pet.happy)); y += 12;
        line('HEALTH', pet.critical ? 'CRITICAL!' : pet.sick ? pet.sick : 'GOOD', pet.sick ? COL.bad : COL.good);
        line('CARE MISSES', pet.careMistakes, pet.careMistakes > 4 ? COL.bad : COL.ink);
        line('MEALS TO TINT', colorHint(pet));
        break;
      case 'PERSONALITY':
        line('APPETITE', p.appetite);
        line('ENERGY', p.energy);
        line('FAVE TASTE', p.taste);
        line('FAVE TOY', TOYS[favouriteToy(pet)].name);
        break;
      case 'LOOKS':
        if (pet.stage === 'egg') { line('???', 'HATCH FIRST!'); break; }
        for (const [k, label] of [['shape', 'HEAD'], ['eyes', 'EYES'], ['hair', 'HAIR'], ['ears', 'EARS'], ['crest', 'TOP'], ['back', 'BACK'], ['feet', 'FEET'], ['size', 'SIZE'], ['color', 'COLOUR']]) {
          if (y > ry + rh - 8) break;
          line(label, p[k]);
        }
        break;
      case 'HIDDEN GENES': {
        // recessive alleles this pet carries and could pass on
        if (pet.stage === 'egg') { line('???', 'HATCH FIRST!'); break; }
        const hidden = carried(pet.genome, p);
        if (!hidden.length) { text(scr, 'NOTHING HIDDEN:', W / 2, y, COL.gray, { align: 'center' }); y += 9; text(scr, 'WHAT YOU SEE IS', W / 2, y, COL.gray, { align: 'center' }); y += 9; text(scr, 'WHAT IT PASSES ON', W / 2, y, COL.gray, { align: 'center' }); break; }
        for (const h of hidden) {
          if (y > ry + rh - 8) { text(scr, `+${hidden.length - hidden.indexOf(h)} MORE`, W / 2, y, COL.gray, { align: 'center' }); break; }
          line(GENE_LABELS[h.gene].toUpperCase(), h.allele, C('violet.1'));
        }
        break;
      }
    }
  }
}

function colorHint(pet) {
  const entries = Object.entries(pet.colorMeals || {}).filter(([, n]) => n > 0);
  if (!entries.length) return '-';
  const [c, n] = entries.sort((a, b) => b[1] - a[1])[0];
  return `${c} ${n}/5`;
}
