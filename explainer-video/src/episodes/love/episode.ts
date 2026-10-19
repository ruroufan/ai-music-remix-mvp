import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.18",
  topic: "恋爱脑",
  topicLatin: "LOVESICK",
};

export const episode: EpisodeData = {
  id: "love",
  title: "恋爱脑",
  bpm: 120, // 15 frames per beat
  script,
  music: "dembow", // its own set of sounds: the dembow beat, timbales, a sub, marimba, nylon guitar, a synth pluck lead
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // E minor → G major. energy: 0 a nylon-string guitar alone · 1 + marimba,
  // a soft kick on every beat, shaker · 2 + the dembow snare, the sub, a
  // pluck stab · 3 + the pluck lead, claps, timbale fills. The ending — two
  // people standing on their own feet — turns to G major.
  moods: {
    hook: { chord: "Em C G D", energy: 1 },
    title: { chord: "Em C", energy: 2 },
    diagnosis: { chord: "C D Em Em", energy: 2 },
    misread: { chord: "Em C G D", energy: 2 },
    everyday: { chord: "Em C G D", energy: 3 },
    beauvoir: { chord: "Am Em C D", energy: 2 },
    answer: { chord: "C D Em B", energy: 3 },
    question: { chord: "Em", energy: 0 },
    cost: { chord: "Am Em C B", energy: 2 },
    note: { chord: "C D Em Em", energy: 1 },
    ending: { chord: "C D G G", energy: 0 },
  },
};
