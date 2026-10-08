// Wardrobe: dress your pet in clothes you own, with a live preview.
import { C } from '../engine/palette.js';
import { colors } from '../engine/sprite.js';
import { W } from '../engine/screen.js';
import { ListMenu, LAYOUT, COL, text } from '../ui.js';
import { composePet, CANVAS, GROUND } from '../game/render.js';
import { CLOTHES, SLOTS, SLOT_LABEL } from '../game/items.js';
import { toggleWear, canDress } from '../game/pet.js';
import { CRESTS, FACE, BOWTIE, TIE } from '../art/parts.js';

const PREVIEW_H = 58;

/** A small icon sprite for a clothing item, when one exists. */
export function clothesIcon(id) {
  const c = CLOTHES[id];
  const spr = CRESTS[id]?.spr || FACE[id]?.cheek?.spr || (id === 'bowtie' ? BOWTIE.spr : id === 'tie' ? TIE.spr : null);
  return spr && spr.h <= 12 ? { icon: spr, iconCtx: colors('cream', c.color, 'ink', 'brown') } : {};
}

function sortedWardrobe(game) {
  return [...game.wardrobe].filter(id => CLOTHES[id])
    .sort((a, b) => SLOTS.indexOf(CLOTHES[a].slot) - SLOTS.indexOf(CLOTHES[b].slot) || CLOTHES[a].name.localeCompare(CLOTHES[b].name));
}

export class WardrobeScene extends ListMenu {
  constructor(app) {
    const game = app.game;
    const build = () => [
      ...sortedWardrobe(game).map(id => ({
        id,
        label: CLOTHES[id].name,
        get right() { return game.pet.wear?.[CLOTHES[id].slot] === id ? 'ON' : SLOT_LABEL[CLOTHES[id].slot]; },
        ...clothesIcon(id),
        action: () => {
          const r = toggleWear(game, id);
          if (!r.ok) { app.sfx('nope'); if (r.msg) app.toast(r.msg); return; }
          app.sfx(r.worn ? 'happy' : 'back');
          this.bounce = app.time;
          app.save();
        },
      })),
      { label: 'Take it all off', action: () => { game.pet.wear = {}; app.sfx('back'); app.save(); } },
    ];
    super(app, 'WARDROBE', build(), { footer: () => `${game.wardrobe.length} ITEMS  -  MORE IN THE SHOP` });
    this.top = LAYOUT.room.y + 13 + PREVIEW_H;
    this.rows = Math.floor((LAYOUT.room.h - 13 - PREVIEW_H - 10) / this.rowH);
    this.bounce = -9999;
  }
  draw(scr) {
    super.draw(scr);
    const pet = this.app.game.pet;
    const { y: ry } = LAYOUT.room;
    const py = ry + 13;
    scr.rect(0, py, W, PREVIEW_H, C('sky.3'));
    scr.hline(0, py + PREVIEW_H - 1, W, COL.ink);
    scr.rect(0, py + PREVIEW_H - 9, W, 8, C('cream.2'));
    const since = this.app.time - this.bounce;
    const happy = since < 700;
    const bm = composePet(pet.phenotype, pet.stage, {
      gender: pet.gender, wear: pet.wear, t: this.app.time,
      expr: happy ? 'happy' : 'idle', arms: happy ? 'up' : 'down',
    });
    const hop = happy ? Math.round(Math.sin(since / 700 * Math.PI) * 4) : 0;
    scr.setClip(0, py, W, PREVIEW_H - 1);
    scr.bitmap(bm, W / 2 - CANVAS / 2, py + PREVIEW_H - 4 - GROUND - hop);
    scr.noClip();
    if (!canDress(pet)) text(scr, 'TOO LITTLE FOR CLOTHES', W / 2, py + 3, COL.bad, { align: 'center' });
  }
}
