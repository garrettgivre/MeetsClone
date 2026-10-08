// Tiny square-wave "beeper", like a handheld piezo speaker.
// Sounds are lists of [frequency Hz (0 = rest), length ms].

let ac = null;
let master = null;
export let muted = false;

export function unlockAudio() {
  if (ac) return;
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain();
    master.gain.value = 0.06;
    master.connect(ac.destination);
  } catch { ac = null; }
}

export function setMuted(m) { muted = m; }

const N = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDI note -> Hz

export const SFX = {
  blip:    [[N(84), 30]],
  select:  [[N(79), 40], [N(86), 50]],
  back:    [[N(74), 40], [N(67), 50]],
  nope:    [[N(55), 90], [0, 30], [N(55), 90]],
  eat:     [[N(72), 50], [0, 40], [N(74), 50], [0, 40], [N(76), 60]],
  happy:   [[N(76), 70], [N(79), 70], [N(84), 70], [N(88), 140]],
  alert:   [[N(88), 80], [0, 60], [N(88), 80], [0, 60], [N(88), 80]],
  hatch:   [[N(72), 80], [N(76), 80], [N(79), 80], [N(84), 80], [N(88), 200]],
  sad:     [[N(67), 150], [N(63), 150], [N(60), 300]],
  clean:   [[N(91), 30], [N(86), 30], [N(91), 30], [N(86), 30]],
  coin:    [[N(88), 50], [N(95), 120]],
  jump:    [[N(76), 30], [N(83), 40]],
  fail:    [[N(60), 120], [N(55), 220]],
  wedding: [[N(72), 150], [N(77), 150], [N(77), 75], [N(77), 300], [0, 60], [N(72), 150], [N(79), 150], [N(76), 75], [N(77), 300]],
  left:    [[N(72), 110]],
  right:   [[N(79), 110]],
  grow:    [[N(67), 60], [N(72), 60], [N(76), 60], [N(79), 60], [N(84), 60], [N(91), 200]],
};

export function play(name) {
  if (muted || !ac) return;
  const seq = SFX[name];
  if (!seq) return;
  let t = ac.currentTime + 0.01;
  for (const [f, ms] of seq) {
    const d = ms / 1000;
    if (f) {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'square';
      o.frequency.value = f;
      g.gain.setValueAtTime(1, t);
      g.gain.setValueAtTime(0, t + d * 0.92);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + d);
    }
    t += d;
  }
}
