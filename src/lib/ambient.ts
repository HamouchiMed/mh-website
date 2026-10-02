// Generative ambient music and interface sounds, synthesised live with the
// Web Audio API (no audio files). A slow pad in D cycles through four chords
// with a soft plucked arpeggio and a sub bass; the pointer shapes it:
//  - left/right opens the pad's filter (brighter to the right),
//  - top/bottom changes the amount of reverb,
//  - moving the mouse plays bell notes from the same scale (higher at the
//    top of the screen, panned with the pointer), so the visitor plays along,
//  - hovering and clicking links play notes of the current chord,
//  - scrolling adds a soft wind that follows the scroll speed.

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

const BPM = 70;
const BEAT = 60 / BPM;
const CHORD_LEN = BEAT * 8; // two bars per chord

// Dmaj9 · Bm11 · Gmaj9 · A6sus — all inside D major, so every note fits.
const CHORDS = [
  { bass: 38, notes: [50, 57, 61, 64, 66] },
  { bass: 35, notes: [47, 54, 57, 62, 64] },
  { bass: 31, notes: [43, 50, 54, 57, 61] },
  { bass: 33, notes: [45, 52, 59, 62, 64] },
];

// D major pentatonic from D4 to D6: what the mouse plays.
const SCALE: number[] = [];
for (let o = 0; o <= 2; o++) for (const d of [0, 2, 4, 7, 9]) if (62 + o * 12 + d <= 86) SCALE.push(62 + o * 12 + d);

export class Ambient {
  readonly ctx: AudioContext;
  readonly analyser: AnalyserNode;
  private master: GainNode;
  private padFilter: BiquadFilterNode;
  private padBus: GainNode;
  private pluckBus: GainNode;
  private bassBus: GainNode;
  private wet: GainNode;
  private windGain: GainNode;
  private windFilter: BiquadFilterNode;
  private timer = 0;
  private running = false;
  private chordIdx = 0;
  private current = 0;
  private nextChordAt = 0;
  private nextStepAt = 0;
  private step = 0;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.82;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(comp).connect(this.analyser).connect(ctx.destination);

    // Shared reverb (generated impulse response) and a dotted-eighth echo.
    const reverb = ctx.createConvolver();
    reverb.buffer = this.impulse(3.4, 2.6);
    this.wet = ctx.createGain();
    this.wet.gain.value = 0.35;
    reverb.connect(this.wet).connect(this.master);

    const mix = ctx.createGain();
    const dry = ctx.createGain();
    dry.gain.value = 0.8;
    mix.connect(dry).connect(this.master);
    mix.connect(reverb);

    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = "lowpass";
    this.padFilter.frequency.value = 1100;
    this.padFilter.Q.value = 0.6;
    this.padBus = ctx.createGain();
    this.padBus.connect(this.padFilter).connect(mix);

    this.pluckBus = ctx.createGain();
    this.pluckBus.connect(mix);
    const delay = ctx.createDelay(2);
    delay.delayTime.value = BEAT * 0.75;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 2400;
    this.pluckBus.connect(delay);
    delay.connect(tone).connect(feedback).connect(delay);
    tone.connect(mix);

    this.bassBus = ctx.createGain();
    this.bassBus.gain.value = 0.9;
    this.bassBus.connect(this.master);

    // Wind for scrolling: looped noise through a band-pass, silent at rest.
    const noise = ctx.createBufferSource();
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buf;
    noise.loop = true;
    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = "bandpass";
    this.windFilter.Q.value = 0.9;
    this.windFilter.frequency.value = 500;
    this.windGain = ctx.createGain();
    this.windGain.gain.value = 0;
    noise.connect(this.windFilter).connect(this.windGain).connect(mix);
    noise.start();
  }

  private impulse(seconds: number, decay: number) {
    const rate = this.ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  start() {
    if (this.running) return;
    this.running = true;
    const t = this.ctx.currentTime + 0.05;
    this.nextChordAt = t;
    this.nextStepAt = t + BEAT;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(0.85, t, 0.9);
    this.timer = window.setInterval(() => this.schedule(), 50);
    this.schedule();
  }

  stop() {
    this.running = false;
    window.clearInterval(this.timer);
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(0, t, 0.25);
  }

  private schedule() {
    const ahead = this.ctx.currentTime + 0.3;
    while (this.nextChordAt < ahead) {
      this.chord(this.chordIdx, this.nextChordAt);
      this.current = this.chordIdx;
      this.chordIdx = (this.chordIdx + 1) % CHORDS.length;
      this.nextChordAt += CHORD_LEN;
    }
    while (this.nextStepAt < ahead) {
      this.arp(this.nextStepAt);
      this.nextStepAt += BEAT / 2;
      this.step++;
    }
  }

  private chord(i: number, t: number) {
    const { ctx } = this;
    const c = CHORDS[i];
    const end = t + CHORD_LEN;
    for (const note of c.notes) {
      for (const detune of [-7, 7]) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.value = mtof(note);
        osc.detune.value = detune;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.032, t + 2.4);
        g.gain.setValueAtTime(0.032, end);
        g.gain.linearRampToValueAtTime(0, end + 3);
        osc.connect(g).connect(this.padBus);
        osc.start(t);
        osc.stop(end + 3.1);
      }
    }
    const bass = ctx.createOscillator();
    const bg = ctx.createGain();
    bass.type = "sine";
    bass.frequency.value = mtof(c.bass + 12);
    bg.gain.setValueAtTime(0, t);
    bg.gain.linearRampToValueAtTime(0.11, t + 1.6);
    bg.gain.setValueAtTime(0.11, end);
    bg.gain.linearRampToValueAtTime(0, end + 2.4);
    bass.connect(bg).connect(this.bassBus);
    bass.start(t);
    bass.stop(end + 2.5);
  }

  private arp(t: number) {
    const first = this.step % 16 === 0;
    if (!first && Math.random() > 0.42) return;
    const tones = CHORDS[this.current].notes;
    const midi = tones[Math.floor(Math.random() * tones.length)] + 12;
    this.pluck(t, midi, first ? 0.07 : 0.045, Math.random() - 0.5);
  }

  private pluck(t: number, midi: number, vol: number, pan: number) {
    const { ctx } = this;
    const a = ctx.createOscillator();
    const b = ctx.createOscillator();
    const g = ctx.createGain();
    const gb = ctx.createGain();
    const p = ctx.createStereoPanner();
    a.type = "triangle";
    a.frequency.value = mtof(midi);
    b.type = "sine";
    b.frequency.value = mtof(midi + 12);
    gb.gain.value = 0.3;
    p.pan.value = Math.max(-1, Math.min(1, pan));
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
    a.connect(g);
    b.connect(gb).connect(g);
    g.connect(p).connect(this.pluckBus);
    a.start(t);
    b.start(t);
    a.stop(t + 1.6);
    b.stop(t + 1.6);
  }

  private bell(t: number, midi: number, vol: number, pan: number) {
    const { ctx } = this;
    const g = ctx.createGain();
    const p = ctx.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    g.connect(p).connect(this.pluckBus);
    // A sine plus a quiet inharmonic partial gives a glassy bell.
    for (const [ratio, level] of [
      [1, 1],
      [2.76, 0.18],
    ] as const) {
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.type = "sine";
      o.frequency.value = mtof(midi) * ratio;
      og.gain.value = level;
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + 2.3);
    }
  }

  /** Pointer position, 0–1 on both axes (0,0 = top-left). */
  setPointer(x: number, y: number) {
    const t = this.ctx.currentTime;
    this.padFilter.frequency.setTargetAtTime(450 + Math.pow(x, 1.4) * 2900, t, 0.35);
    this.wet.gain.setTargetAtTime(0.22 + (1 - y) * 0.3, t, 0.5);
  }

  /** A note played by moving the mouse; speed is 0–1. */
  spark(x: number, y: number, speed: number) {
    if (!this.running) return;
    const i = Math.round((1 - y) * (SCALE.length - 1));
    this.bell(this.ctx.currentTime, SCALE[Math.max(0, Math.min(SCALE.length - 1, i))], 0.025 + speed * 0.045, x * 1.6 - 0.8);
  }

  hover() {
    if (!this.running) return;
    const tones = CHORDS[this.current].notes;
    this.bell(this.ctx.currentTime, tones[tones.length - 1] + 12, 0.022, 0);
  }

  click() {
    if (!this.running) return;
    const t = this.ctx.currentTime;
    const root = CHORDS[this.current].notes[0] + 12;
    this.pluck(t, root, 0.08, -0.15);
    this.pluck(t + 0.035, root + 7, 0.06, 0.15);
  }

  /** Scroll speed, 0–1: drives the wind. */
  setScroll(v: number) {
    const t = this.ctx.currentTime;
    this.windGain.gain.setTargetAtTime(this.running ? v * 0.05 : 0, t, 0.12);
    this.windFilter.frequency.setTargetAtTime(380 + v * 1700, t, 0.12);
  }
}
