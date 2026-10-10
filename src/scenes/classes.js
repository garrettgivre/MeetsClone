// The class games at school: one for each subject. A class is a round of its game, and how the round goes
// (marks: 3 top, 2 fair, 1 poor) is how much the class teaches (`takeClass` in game/town.js).
//   Manners  WAIT FOR IT   a treat on the table: wait for Teacher's bell before taking it
//   Reading  WORD MATCH    match a picture to its word, or a word to its picture
//   Art      COLOUR MIX    two paints go in: which colour comes out (the same mixing pets' colours do)
//   Gym      DASH          a race against Teacher: A and B in turn, as fast as you can
//   Drama    MAKE A FACE   pull the face Teacher is pulling: A changes it, B shows it
// Controls are the minigames': A or a tap on the left, B or a tap on the right, C leaves (a class left
// half way counts as a poor one).
import { C } from '../engine/palette.js';
import { W } from '../engine/screen.js';
import { LAYOUT, COL, text, dialog } from '../ui.js';
import { composePet, CANVAS, GROUND } from '../game/render.js';
import { FOOD_ART } from '../art/icons.js';
import { FOODS } from '../game/items.js';
import { backdrop, propBitmap } from '../art/town.js';
import { drawPlaceSky, skyState } from './room.js';
import { blendColor } from '../game/genetics.js';
import { resident, takeClass } from '../game/town.js';
import { MiniGame } from './minigames.js';

const pick = (list) => list[Math.floor(Math.random() * list.length)];
/** A prop, its bottom middle at (x, y) in screen pixels. */
function put(scr, name, x, y, opts = {}) {
  const bm = propBitmap(name, opts);
  scr.bitmap(bm, x - bm.at[0] / 2, y - (bm.at[1] + 1) / 2);
}
const PAD_H = 14;
/** One of the two answer pads along the bottom of the room: a word, a sprite or a prop's bitmap on it. */
function pad(scr, side, what, { w = 44, fill = C('white') } = {}) {
  const y = LAYOUT.room.y + LAYOUT.room.h - PAD_H - 3, x = side < 0 ? 3 : W - 3 - w, cx = x + w / 2;
  scr.panel(x, y, w, PAD_H, fill, COL.ink);
  if (typeof what === 'string') text(scr, what, Math.floor(cx), y + 5, COL.ink, { align: 'center' });
  else if (what.px) scr.bitmap(what, cx - what.w / 4, y + PAD_H / 2 - what.h / 4);
  else scr.draw(what, Math.floor(cx - what.w / 2), y + Math.floor((PAD_H - what.h) / 2), {});
}
const RIGHT = C('lime.3'), WRONG = C('pink.3'), CHALK = C('white'), CHALK_GOLD = C('gold.3');
/** Marks from a count of right answers: `top` or more is 3, `fair` or more is 2. */
const marksFor = (n, top, fair) => (n >= top ? 3 : n >= fair ? 2 : 1);

/** What the class games share: the classroom, Teacher, chalk on the board, the timer, and the marks at the end. */
class ClassGame extends MiniGame {
  constructor(app, sub, help) {
    super(app, `${sub.name.toUpperCase()} CLASS`, help);
    this.sub = sub;
    this.marks = 0;
    this.teacher = resident('school', app.game);
  }
  get openAir() { return null; } // indoors: the home bars stay
  button(b) {
    if (b === 'C' && this.state === 'play') { this.app.sfx('back'); this.grade(1, 'Left before the bell.'); return; }
    super.button(b);
  }
  /** The class is over: it teaches by its marks. */
  grade(marks, msg) {
    const r = takeClass(this.app.game, this.sub.id, marks);
    this.state = 'over';
    this.t = 0;
    this.marks = marks;
    this.good = marks >= 2;
    this.msg = msg;
    this.learned = r.msg || '';
    this.app.sfx(marks >= 3 ? 'happy' : marks === 2 ? 'coin' : 'fail');
    this.app.save();
  }
  drawPark(scr) { scr.bitmap(backdrop('classroom'), 0, LAYOUT.room.y); }
  /** A line chalked on the blackboard (`row` 0 to 3). */
  chalk(scr, str, row = 0, color = CHALK) { text(scr, str, W / 2, LAYOUT.room.y + 23 + row * 9, color, { align: 'center' }); }
  /** The time left for an answer, as a chalk line under the board's writing (k from 1 down to 0). */
  timer(scr, k) {
    const w = Math.max(0, Math.round(80 * k));
    scr.rect(W / 2 - 40, LAYOUT.room.y + 52, w, 1, k < 0.3 ? WRONG : CHALK);
  }
  drawTeacher(scr, { expr = 'idle', arms = 'down', x = 98, y = this.floor, step = 0 } = {}) {
    const r = this.teacher;
    const bm = composePet(r.phenotype, r.stage || 'adult', { expr, arms, step, gender: r.gender });
    scr.bitmap(bm, Math.round(x - CANVAS / 2), y - GROUND);
  }
  /** How tall Teacher stands, in screen pixels (things held over their head go above this). */
  teacherTall() {
    if (this.tall == null) {
      const r = this.teacher, bm = composePet(r.phenotype, r.stage || 'adult', { gender: r.gender });
      let top = 0;
      while (top < bm.h && !bm.px.subarray(top * bm.w, (top + 1) * bm.w).some(Boolean)) top++;
      this.tall = GROUND - Math.floor(top / 2);
    }
    return this.tall;
  }
  drawDialogs(scr) {
    const ry = LAYOUT.room.y;
    if (this.state === 'ready') dialog(scr, `${this.title}\n${this.help}`, { y: ry + 36 });
    if (this.state === 'over') dialog(scr, `${this.msg}\n${this.learned}`, { y: ry + 36, title: ['', 'KEEP TRYING', 'GOOD WORK', 'TOP MARKS!'][this.marks] });
  }
}

/** Rounds of question and answer: `ask` a question, wait for an answer or the clock, `show` how it went. */
class QuizGame extends ClassGame {
  constructor(app, sub, help, rounds) {
    super(app, sub, help);
    this.rounds = rounds;
    this.round = 0;
    this.wins = 0;
    this.phase = 'ask';
    this.pt = 0;
  }
  start() { this.pt = 0; this.phase = 'ask'; this.ask(); }
  /** Close the question: `right` or not. */
  answer(right) {
    this.right = right;
    if (right) this.wins++;
    this.app.sfx(right ? 'happy' : 'nope');
    this.phase = 'show';
    this.pt = 0;
  }
  tick(dt) {
    this.pt += dt;
    if (this.phase === 'ask' && this.pt >= this.limit) { this.chosen = 0; this.answer(false); }
    else if (this.phase === 'show' && this.pt > 1200) {
      if (++this.round >= this.rounds) return this.done();
      this.phase = 'ask';
      this.pt = 0;
      this.ask();
    }
  }
  get asking() { return this.state === 'play' && this.phase === 'ask'; }
  get showing() { return this.state === 'play' && this.phase === 'show'; }
  /** The pet's face for how the question went, or how the class did. */
  mood() { return this.state === 'over' ? (this.good ? 'happy' : 'sad') : this.showing ? (this.right ? 'happy' : 'sad') : this.t % 3200 < 140 ? 'blink' : 'idle'; }
  /** The colour of an answer pad once the answer is in: the right one green, a wrong pick pink. */
  padFill(side) { return !this.showing ? C('white') : side === this.side ? RIGHT : side === this.chosen ? WRONG : C('white'); }
  roundHud(scr) { this.hud(scr, `ROUND ${Math.min(this.round + 1, this.rounds)}/${this.rounds}`, `RIGHT ${this.wins}`); }
}

// ---------------------------------------------------------------- Manners: Wait For It
const MN_ROUNDS = 5;
const MN_TREATS = ['cookie', 'candy', 'icecream', 'pancake', 'riceball', 'berrypie', 'lemoncake'];

export class MannersScene extends ClassGame {
  constructor(app, sub) {
    super(app, sub, 'A treat is on the table. Wait for the bell, then press A or B. Grabbing early is rude!');
    this.round = 0;
    this.wins = 0;
    this.phase = 'wait'; // wait -> ring -> done
    this.pt = 0;
    this.treat = MN_TREATS[0];
  }
  start() { this.next(); }
  next() {
    this.phase = 'wait';
    this.pt = 0;
    this.out = null;
    this.waitFor = 1500 + Math.random() * 2800;
    // on a long wait Teacher sometimes lifts the bell and does not ring it
    this.feint = this.waitFor > 2600 && Math.random() < 0.7 ? 600 + Math.random() * 900 : -1;
    this.treat = pick(MN_TREATS);
  }
  input() {
    if (this.phase === 'wait') { this.out = 'soon'; this.app.sfx('nope'); }
    else if (this.phase === 'ring') { this.out = 'ok'; this.wins++; this.app.sfx('eat'); }
    else return;
    this.phase = 'done';
    this.pt = 0;
  }
  tick(dt) {
    this.pt += dt;
    if (this.phase === 'wait' && this.pt >= this.waitFor) { this.phase = 'ring'; this.pt = 0; this.app.sfx('alert'); }
    else if (this.phase === 'ring' && this.pt > 1000 - this.round * 80) { this.out = 'slow'; this.phase = 'done'; this.pt = 0; this.app.sfx('sad'); }
    else if (this.phase === 'done' && this.pt > 1300) {
      if (++this.round < MN_ROUNDS) return this.next();
      const n = this.wins;
      this.grade(marksFor(n, 5, 3), n === MN_ROUNDS ? 'Waited every time. Lovely manners!' : `Waited nicely ${n} times out of ${MN_ROUNDS}.`);
    }
  }
  draw(scr) {
    this.drawPark(scr);
    const f = this.floor, ph = this.state === 'play' ? this.phase : '';
    const feint = ph === 'wait' && this.feint > 0 && this.pt > this.feint && this.pt < this.feint + 450;
    const ringing = ph === 'ring', done = ph === 'done', ok = done && this.out === 'ok';
    const over = this.state === 'over';
    this.drawTeacher(scr, { expr: ok || (over && this.good) ? 'happy' : this.t % 4100 < 140 ? 'blink' : 'idle', arms: ringing || feint ? 'up' : 'down' });
    // the bell over Teacher's head: lifted for a feint, shaken to ring
    put(scr, 'handBell', 98 + (ringing ? (Math.floor(this.pt / 60) % 2 ? 1 : -1) : 0), f - this.teacherTall() - 2 - (ringing ? 5 : feint ? 4 : 0), { accent: 'gold' });
    const expr = over ? (this.good ? 'happy' : 'sad') : ok ? (Math.floor(this.pt / 220) % 2 ? 'chew' : 'eat') : done ? 'sad' : this.t % 3200 < 140 ? 'blink' : 'idle';
    this.drawPet(scr, 34, { expr, flip: true, arms: ok ? 'out' : 'down' });
    // the table in front of them, and the treat on its plate until it is eaten or taken away
    put(scr, 'snackTable', 66, f + 5);
    if (!over && !(done && this.pt > 250)) {
      const spr = FOOD_ART[this.treat];
      scr.draw(spr, 66 - Math.floor(spr.w / 2), f + 5 - 13 - spr.h, {});
    }
    if (ph === 'wait') this.chalk(scr, feint ? 'NOT YET...' : 'WAIT...', 1);
    if (ringing) this.chalk(scr, 'NOW!', 1, CHALK_GOLD);
    if (done) this.chalk(scr, { ok: 'THANK YOU!', soon: 'TOO SOON!', slow: 'TOO SLOW!' }[this.out], 1, ok ? RIGHT : WRONG);
    this.hud(scr, `ROUND ${Math.min(this.round + 1, MN_ROUNDS)}/${MN_ROUNDS}`, `POLITE ${this.wins}`);
    if (this.state === 'play') { pad(scr, -1, 'A  PLEASE'); pad(scr, 1, 'B  PLEASE'); }
    this.drawDialogs(scr);
  }
}

// ---------------------------------------------------------------- Reading: Word Match
const RD_ROUNDS = 6;
const RD_WORDS = Object.keys(FOODS).filter(id => FOOD_ART[id] && FOODS[id].name.length <= 11 && id !== 'oddstew');
const wordOf = (id) => FOODS[id].name.toUpperCase();

export class ReadingScene extends QuizGame {
  constructor(app, sub) {
    super(app, sub, 'Match the picture to its word, or the word to its picture: A or tap left, B or tap right.', RD_ROUNDS);
  }
  ask() {
    this.answerId = pick(RD_WORDS);
    // the wrong answer starts with the same letter when one does, so the word has to be read to the end
    const others = RD_WORDS.filter(id => id !== this.answerId);
    const alike = others.filter(id => wordOf(id)[0] === wordOf(this.answerId)[0]);
    this.decoyId = pick(alike.length ? alike : others);
    this.side = Math.random() < 0.5 ? -1 : 1;
    this.words = this.round % 2 === 0; // a picture on the board and two words to choose from; or the other way about
    this.limit = 5200 - this.round * 400;
    this.chosen = 0;
  }
  input(side) {
    if (this.phase !== 'ask') return;
    this.chosen = side;
    this.answer(side === this.side);
  }
  done() {
    const n = this.wins;
    this.grade(marksFor(n, 5, 3), n === RD_ROUNDS ? 'Every word read right!' : `Read ${n} out of ${RD_ROUNDS} right.`);
  }
  draw(scr) {
    this.drawPark(scr);
    const ry = LAYOUT.room.y;
    if (this.state === 'play') {
      if (this.words) {
        this.chalk(scr, 'WHAT IS THIS?', 0);
        // a flash card pinned to the board
        const spr = FOOD_ART[this.answerId];
        scr.panel(W / 2 - 11, ry + 32, 22, 20, C('white'), C('green.1'));
        scr.draw(spr, W / 2 - Math.floor(spr.w / 2), ry + 42 - Math.floor(spr.h / 2), {});
      } else {
        this.chalk(scr, 'WHICH ONE IS', 0);
        this.chalk(scr, wordOf(this.answerId) + '?', 2, CHALK_GOLD);
      }
      if (this.asking) this.timer(scr, 1 - this.pt / this.limit);
      for (const side of [-1, 1]) {
        const id = side === this.side ? this.answerId : this.decoyId;
        pad(scr, side, this.words ? wordOf(id) : FOOD_ART[id], { w: 60, fill: this.padFill(side) });
      }
    }
    this.drawPet(scr, W / 2, { expr: this.mood(), arms: (this.showing && this.right) || (this.state === 'over' && this.good) ? 'up' : 'down' });
    this.roundHud(scr);
    this.drawDialogs(scr);
  }
}

// ---------------------------------------------------------------- Art: Colour Mix
const ART_ROUNDS = 5;
const PAINTS = ['red', 'orange', 'gold', 'lime', 'green', 'mint', 'sky', 'blue', 'violet', 'pink', 'cream'];
const ALWAYS = { chance: () => true }; // (where the mixing rule would toss a coin, class always teaches the same answer)

export class ArtScene extends QuizGame {
  constructor(app, sub) {
    super(app, sub, 'Two paints are mixed. Pick the colour they make: A or tap left, B or tap right. Pets mix colours this way too!', ART_ROUNDS);
  }
  ask() {
    // two paints whose mix is a third colour, and a wrong answer that is not a near neighbour of the right one
    do {
      this.a = pick(PAINTS);
      this.b = pick(PAINTS);
      this.mix = blendColor(this.a, this.b, ALWAYS);
    } while (this.a === this.b || this.mix === this.a || this.mix === this.b);
    const near = (x, y) => { const i = PAINTS.indexOf(x), j = PAINTS.indexOf(y); return i >= 0 && j >= 0 && Math.abs(i - j) <= 1; };
    do this.decoy = pick(PAINTS); while ([this.a, this.b, this.mix].includes(this.decoy) || near(this.decoy, this.mix));
    this.side = Math.random() < 0.5 ? -1 : 1;
    this.limit = 6500 - this.round * 500;
    this.chosen = 0;
  }
  input(side) {
    if (this.phase !== 'ask') return;
    this.chosen = side;
    this.answer(side === this.side);
  }
  done() {
    const n = this.wins;
    this.grade(marksFor(n, 4, 2), n === ART_ROUNDS ? 'Every colour mixed right!' : `Mixed ${n} out of ${ART_ROUNDS} right.`);
  }
  draw(scr) {
    this.drawPark(scr);
    const ry = LAYOUT.room.y, f = this.floor;
    put(scr, 'easel', 98, f + 2);
    if (this.state === 'play') {
      // the sum on the board: a tin, a tin, and what they make
      const y = ry + 48;
      put(scr, 'paintPot', 34, y, { accent: this.a });
      text(scr, '+', 47, y - 7, CHALK, { align: 'center' });
      put(scr, 'paintPot', 60, y, { accent: this.b });
      text(scr, '=', 73, y - 7, CHALK, { align: 'center' });
      if (this.showing) put(scr, 'paintPot', 87, y, { accent: this.mix });
      else text(scr, '?', 87, y - 7, CHALK_GOLD, { align: 'center' });
      this.chalk(scr, this.showing ? (this.right ? 'THAT IS IT!' : 'NOT QUITE') : 'WHAT DO THEY MAKE?', 0, this.showing ? (this.right ? RIGHT : WRONG) : CHALK);
      if (this.asking) this.timer(scr, 1 - this.pt / this.limit);
      // the pet throws its answer at the canvas
      if (this.showing && this.chosen) put(scr, 'paintSplat', 98, f - 24, { accent: this.chosen === this.side ? this.mix : this.decoy });
      for (const side of [-1, 1]) pad(scr, side, propBitmap('paintPot', { accent: side === this.side ? this.mix : this.decoy }), { w: 44, fill: this.padFill(side) });
    }
    this.drawPet(scr, 44, { expr: this.mood(), flip: true, arms: this.showing && this.chosen ? 'out' : 'down' });
    this.roundHud(scr);
    this.drawDialogs(scr);
  }
}

// ---------------------------------------------------------------- Gym: Dash
const DASH_FROM = 28, DASH_TO = 102; // where the runners start and finish (screen x of their middles)
const DASH_KICK = 0.000052, DASH_DRAG = 450; // what a step adds to the speed, and how fast speed drains away (ms)
const DASH_RIVAL = 8600; // how long Teacher takes
const DASH_SET = 1300;   // on your marks...

export class GymScene extends ClassGame {
  constructor(app, sub) {
    super(app, sub, 'Race to the flag! Press A and B in turn, as fast as you can. The same one twice and you trip.');
    this.pos = 0;
    this.v = 0;
    this.rival = 0;
    this.last = 0;
    this.trip = 0;
    this.steps = 0;
    this.rivalAt = 0;
    this.pace = DASH_RIVAL * (0.95 + Math.random() * 0.12);
  }
  get openAir() { return 'gymfield'; }
  input(side) {
    if (this.t < DASH_SET || this.trip > 0 || this.pos >= 1) return;
    if (side === this.last) { this.trip = 550; this.v = 0; this.last = 0; this.app.sfx('fail'); return; }
    this.last = side;
    this.steps++;
    this.v += DASH_KICK;
    this.app.sfx(side < 0 ? 'left' : 'right');
  }
  tick(dt) {
    if (this.t < DASH_SET) return;
    const run = this.t - DASH_SET;
    this.trip = Math.max(0, this.trip - dt);
    this.v *= Math.exp(-dt / DASH_DRAG);
    this.pos = Math.min(1, this.pos + this.v * dt);
    // Teacher keeps a steady pace, with a little wobble in it
    if (this.rival < 1) {
      this.rival = Math.min(1, run / this.pace + Math.sin(run / 700) * 0.012);
      if (this.rival >= 1) this.rivalAt = run;
    }
    if (this.pos >= 1) {
      const behind = this.rival >= 1 ? run - this.rivalAt : -1;
      return this.grade(behind < 0 ? 3 : behind < 2000 ? 2 : 1, behind < 0 ? 'First to the flag!' : behind < 2000 ? 'A close second.' : 'Over the line at last.');
    }
    if (this.rival >= 1 && run - this.rivalAt > 5000) this.grade(1, 'Puffed out before the flag.');
  }
  drawPark(scr) {
    const now = this.app.game.simTime;
    drawPlaceSky(scr, now, this.app.time);
    scr.bitmap(backdrop('gymfield', skyState(new Date(now).getHours())), 0, LAYOUT.room.y);
  }
  draw(scr) {
    this.drawPark(scr);
    const ry = LAYOUT.room.y, over = this.state === 'over', playing = this.state === 'play';
    const at = (k) => DASH_FROM + (DASH_TO - DASH_FROM) * k;
    const stride = (k) => (k > 0 && k < 1 ? (Math.floor(k * 46) % 2 ? 1 : 2) : 0);
    // Teacher in the far lane, your pet in the near one, both facing the flag
    const r = this.teacher;
    const rbm = composePet(r.phenotype, r.stage || 'adult', { expr: this.rival >= 1 ? 'happy' : 'idle', step: stride(this.rival), arms: this.rival >= 1 ? 'up' : 'down', gender: r.gender });
    scr.bitmap(rbm, Math.round(at(this.rival) - CANVAS / 2), ry + 121 - GROUND, true);
    const pet = this.pet;
    const expr = over ? (this.good ? 'happy' : 'sad') : this.trip > 0 ? 'dizzy' : this.v > 0.00005 ? 'happy' : 'idle';
    const bm = composePet(pet.phenotype, pet.stage, { expr, step: this.trip > 0 ? 0 : stride(this.pos), arms: over && this.marks === 3 ? 'up' : 'down', gender: pet.gender, wear: pet.wear, species: pet.species });
    scr.bitmap(bm, Math.round(at(this.pos) - CANVAS / 2), ry + 134 - GROUND + (this.trip > 0 ? 1 : 0), true);
    if (playing) {
      const set = this.t < DASH_SET;
      if (set) text(scr, this.t < DASH_SET * 0.6 ? 'ON YOUR MARKS...' : 'GET SET...', W / 2, ry + 24, COL.ink, { align: 'center' });
      else if (this.t < DASH_SET + 700) text(scr, 'GO!', W / 2, ry + 24, COL.accent, { align: 'center' });
      else if (this.trip > 0) text(scr, 'OOPS!', W / 2, ry + 24, COL.bad, { align: 'center' });
      // the pad to press next is lit
      const next = this.last === 0 ? 0 : -this.last;
      pad(scr, -1, 'A  LEFT', { fill: !set && next <= 0 && !this.trip ? COL.hi : C('white') });
      pad(scr, 1, 'B  RIGHT', { fill: !set && next >= 0 && !this.trip ? COL.hi : C('white') });
    }
    const secs = playing ? Math.max(0, (this.t - DASH_SET) / 1000) : 0;
    this.hud(scr, `TIME ${secs.toFixed(1)}`, `STEPS ${this.steps}`);
    this.drawDialogs(scr);
  }
}

// ---------------------------------------------------------------- Drama: Make a Face
const DR_ROUNDS = 6;
const FACES = [['idle', 'CALM'], ['happy', 'HAPPY'], ['sad', 'SAD'], ['sleep', 'SLEEPY'], ['dizzy', 'DIZZY'], ['wink', 'CHEEKY']];

export class DramaScene extends QuizGame {
  constructor(app, sub) {
    super(app, sub, 'Pull the same face as Teacher! A or tap left changes your face, B or tap right shows it off.', DR_ROUNDS);
    this.face = 0;
    this.want = 0;
  }
  ask() {
    let want;
    do want = Math.floor(Math.random() * FACES.length); while (want === this.want && this.round > 0);
    this.want = want;
    // start a few faces away, so it has to be found
    this.face = (want + 1 + Math.floor(Math.random() * (FACES.length - 1))) % FACES.length;
    this.limit = 6500 - this.round * 500;
  }
  input(side) {
    if (this.phase !== 'ask') return;
    if (side < 0) { this.face = (this.face + 1) % FACES.length; this.app.sfx('blip'); return; }
    this.answer(this.face === this.want);
  }
  done() {
    const n = this.wins;
    this.grade(marksFor(n, 5, 3), n === DR_ROUNDS ? 'Every face spot on. Bravo!' : `${n} faces out of ${DR_ROUNDS} right.`);
  }
  draw(scr) {
    this.drawPark(scr);
    const playing = this.state === 'play', over = this.state === 'over';
    // Teacher pulls the face that is wanted; your pet wears the one it has got to
    this.drawTeacher(scr, { expr: playing ? FACES[this.want][0] : over && this.good ? 'happy' : 'idle', arms: this.showing && this.right ? 'up' : 'down' });
    const expr = playing ? FACES[this.face][0] : over ? (this.good ? 'happy' : 'sad') : 'idle';
    const bow = this.showing ? Math.round(Math.sin(Math.min(1, this.pt / 500) * Math.PI) * 5) : 0;
    this.drawPet(scr, 36, { expr, flip: true, arms: this.showing ? 'up' : 'down', dy: this.showing && this.right ? bow : 0 });
    if (playing) {
      if (this.showing) this.chalk(scr, this.right ? 'BRAVO!' : 'NOT QUITE', 1, this.right ? RIGHT : WRONG);
      else {
        this.chalk(scr, 'SHOW ME...', 0);
        this.chalk(scr, FACES[this.want][1] + '!', 2, CHALK_GOLD);
        this.timer(scr, 1 - this.pt / this.limit);
      }
      pad(scr, -1, 'A  CHANGE');
      pad(scr, 1, 'B  TA-DA!', { fill: this.showing ? (this.right ? RIGHT : WRONG) : C('white') });
    }
    this.roundHud(scr);
    this.drawDialogs(scr);
  }
}

/** The game for each subject, by the subject's id (SUBJECTS in game/town.js). */
export const CLASS_GAMES = { lesson: MannersScene, reading: ReadingScene, art: ArtScene, gym: GymScene, drama: DramaScene };
