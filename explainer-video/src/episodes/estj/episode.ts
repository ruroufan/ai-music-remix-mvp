import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "人格 No.11 · SJ",
  topic: "标准",
  topicLatin: "ESTJ · THE EXECUTIVE",
};

export const episode: EpisodeData = {
  id: "estj",
  title: "ESTJ · 标准",
  bpm: 120, // 15 frames per beat
  script,
  music: "marching", // its own set of sounds: a drumline, a tuba, a brass chorale — glockenspiel and piccolo on top
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // G minor → B♭ major. energy: 0 the brass chorale alone · 1 + bass drum,
  // a light snare, the tuba · 2 + the full drumline, trumpets on the tune ·
  // 3 + glockenspiel, piccolo, crashes. The ending — the ruler put down, the
  // saplings growing every which way — opens up in B♭.
  moods: {
    series: { chord: "Gm Eb", energy: 3 },
    hook: { chord: "Gm Eb Bb F", energy: 2 },
    title: { chord: "Gm Eb", energy: 2 },
    diagnosis: { chord: "Eb F Gm Gm", energy: 1 },
    misread: { chord: "Gm Eb Bb F", energy: 2 },
    everyday: { chord: "Gm Eb Bb F", energy: 3 },
    mill: { chord: "Cm Gm Eb D", energy: 2 },
    answer: { chord: "Eb F Gm D", energy: 2 },
    question: { chord: "Gm", energy: 0 },
    cost: { chord: "Cm Gm Eb D", energy: 2 },
    turn: { chord: "Eb F Gm Gm", energy: 1 },
    ending: { chord: "Eb F Bb Bb", energy: 3 },
  },
};
