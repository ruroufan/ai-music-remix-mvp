import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "人格 No.05 · NF",
  topic: "不被懂",
  topicLatin: "INFJ · THE ADVOCATE",
};

export const episode: EpisodeData = {
  id: "infj",
  title: "INFJ · 不被懂",
  bpm: 120, // 15 frames per beat
  script,
  music: "dreampop", // its own set of sounds: a music box, a chorused clean guitar through a dotted-8th delay, a half-time kit — and a shoegaze wall
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // E minor → G major. energy: 0 a music box alone · 1 + the chorus guitar
  // arpeggio, a soft kick · 2 + the half-time kit, 8th-note bass, a
  // tambourine · 3 + the shoegaze wall, 16th tambourine, a glockenspiel. The
  // ending — the lamp carried into his own room — settles in G.
  moods: {
    series: { chord: "Em C", energy: 3 },
    hook: { chord: "Em C G D", energy: 1 },
    title: { chord: "Em C", energy: 2 },
    diagnosis: { chord: "C D Em Em", energy: 2 },
    misread: { chord: "Em C G D", energy: 2 },
    everyday: { chord: "Em C G D", energy: 3 },
    wittgenstein: { chord: "Am Em C Bm", energy: 3 },
    answer: { chord: "C D Em Bm", energy: 2 },
    question: { chord: "Em", energy: 0 },
    cost: { chord: "Am Em C Bm", energy: 3 },
    turn: { chord: "C D Em Em", energy: 1 },
    ending: { chord: "C D G G", energy: 0 },
  },
};
