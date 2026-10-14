// One-shot sound effects, placed by the scenes via <Sfx name="…" />.
import { SR, rand, noise, buffer, biquad, echo, normalize, pianoNote, addMono } from "./lib.mjs";

export const makeSfx = () => {
  const sfx = {};


// Low impact: pitch-dropping sine plus a muffled noise hit.
sfx.boom = (() => {
  const out = buffer(2.5), lp = biquad();
  for (let i = 0; i < out[0].length; i++) {
    const t = i / SR;
    const sub = Math.sin(2 * Math.PI * (32 * t + (40 / 3) * (1 - Math.exp(-t * 3)))) * Math.exp(-t * 2.2);
    const hit = lp(noise(), "lp", 900 * Math.exp(-t * 6) + 80) * Math.exp(-t * 9) * 2;
    out[0][i] = out[1][i] = sub + hit;
  }
  echo(out, 140, 0.25);
  normalize(out, -1);
  return out;
})();

// Breaking glass/stone: a crack, then dozens of tiny high "tinks" scattering.
sfx.shatter = (() => {
  const out = buffer(2.2), hp = biquad();
  for (let i = 0; i < 0.25 * SR; i++) {
    const t = i / SR;
    const v = hp(noise(), "hp", 1800) * Math.exp(-t * 22);
    out[0][i] += v; out[1][i] += v;
  }
  for (let n = 0; n < 40; n++) {
    const t0 = Math.pow(rand(), 1.8) * 0.9, f = 2200 + rand() * 5000, pan = rand();
    const s0 = Math.round(t0 * SR);
    for (let i = 0; i < 0.18 * SR; i++) {
      const t = i / SR;
      const v = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 30) * 0.25;
      out[0][s0 + i] += v * (1 - pan); out[1][s0 + i] += v * pan;
    }
  }
  echo(out, 220, 0.3);
  normalize(out, -2);
  return out;
})();

// Tension riser: noise through a rising band-pass, with a rising tone underneath.
sfx.rise = (() => {
  const dur = 1.6, out = buffer(dur + 0.8), bpL = biquad(), bpR = biquad();
  let ph = 0;
  for (let i = 0; i < dur * SR; i++) {
    const t = i / SR, k = t / dur;
    const env = k * k * (1 - Math.max(0, (k - 0.93) / 0.07));
    const f = 300 + 3500 * k * k;
    ph += (2 * Math.PI * (70 + 150 * k)) / SR;
    const tone = Math.sin(ph) * 0.5;
    out[0][i] = (bpL(noise(), "bp", f, 4) * 3 + tone) * env;
    out[1][i] = (bpR(noise(), "bp", f * 1.05, 4) * 3 + tone) * env;
  }
  normalize(out, -2);
  return out;
})();

// Air movement for scene changes.
sfx.whoosh = (() => {
  const dur = 1.1, out = buffer(dur), bpL = biquad(), bpR = biquad();
  for (let i = 0; i < out[0].length; i++) {
    const t = i / SR, k = t / dur;
    const env = Math.sin(Math.PI * Math.pow(k, 0.7)) ** 2;
    const f = 250 + 750 * Math.sin(Math.PI * k);
    out[0][i] = bpL(noise(), "bp", f, 1.5) * env * (1 - k * 0.6);
    out[1][i] = bpR(noise(), "bp", f, 1.5) * env * (0.4 + k * 0.6);
  }
  normalize(out, -3);
  return out;
})();

// A single glassy bell — mirrors appearing, small reveals.
sfx.glint = (() => {
  const out = buffer(2);
  pianoNote(out, 0, 93, 0.6, 0.5);
  pianoNote(out, 0, 100, 0.25, 0.5);
  echo(out, 260, 0.35);
  normalize(out, -4);
  return out;
})();


  // A footstep in an empty corridor: a dull heel thud and a short room tail.
  sfx.step = (() => {
    const out = buffer(1.2), lp = biquad();
    addMono(out, 0, 0.25, (t) => lp(noise(), "lp", 600) * Math.exp(-t * 30) * 2 + Math.sin(2 * Math.PI * 90 * t) * Math.exp(-t * 40) * 0.6);
    echo(out, 140, 0.35);
    normalize(out, -3);
    return out;
  })();

  // Camera shutter: two clicks a few milliseconds apart.
  sfx.shutter = (() => {
    const out = buffer(0.6), hp = biquad();
    for (const t0 of [0, 0.045]) addMono(out, t0, 0.04, (t) => hp(noise(), "hp", 2500) * Math.exp(-t * 160));
    addMono(out, 0, 0.1, (t) => Math.sin(2 * Math.PI * 1200 * t) * Math.exp(-t * 80) * 0.2);
    normalize(out, -4);
    return out;
  })();

  // Digital glitch: chopped noise bursts and stuttering tones.
  sfx.glitch = (() => {
    const out = buffer(0.9), bp = biquad();
    for (let k = 0; k < 9; k++) {
      const t0 = k * 0.055 + rand() * 0.02, f = 200 + rand() * 3000, pan = rand();
      addMono(out, t0, 0.04, (t) => (bp(noise(), "bp", f, 3) * 2 + Math.sign(Math.sin(2 * Math.PI * f * 0.25 * t)) * 0.3) * Math.exp(-t * 20), 1 - pan, pan);
    }
    normalize(out, -2);
    return out;
  })();

  // A heavy rubber stamp / gavel: a short, dry, low thump with a wooden crack.
  sfx.stamp = (() => {
    const out = buffer(1.2), bp = biquad(), lp = biquad();
    addMono(out, 0, 0.6, (t) => Math.sin(2 * Math.PI * (55 + 90 * Math.exp(-t * 40)) * t) * Math.exp(-t * 9) * 1.2);
    addMono(out, 0, 0.08, (t) => bp(noise(), "bp", 1400, 1.2) * Math.exp(-t * 70) * 1.5);
    addMono(out, 0, 0.3, (t) => lp(noise(), "lp", 300) * Math.exp(-t * 25));
    echo(out, 70, 0.2);
    normalize(out, -1);
    return out;
  })();

  return sfx;
};
