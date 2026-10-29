import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "人格 No.13 · SP",
  topic: "沉默",
  topicLatin: "ISTP · THE VIRTUOSO",
};

export const episode: EpisodeData = {
  id: "istp",
  title: "ISTP · 沉默",
  bpm: 120, // 15 frames per beat
  script,
  music: "blues", // its own set of sounds: a slide guitar, a shuffle on brushes and sticks, walking bass, a harmonica — and an overdriven lead
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // E minor → G major. energy: 0 the slide guitar alone · 1 + brushed
  // shuffle, walking bass · 2 + the full shuffle kit, a harmonica · 3 + an
  // overdriven lead with bends. The ending — he hands the glowing part across
  // the bench — settles into G.
  moods: {
    series: { chord: "Em C", energy: 3 },
    hook: { chord: "Em Am Em B", energy: 1 },
    title: { chord: "Em C", energy: 2 },
    diagnosis: { chord: "C D Em Em", energy: 1 },
    misread: { chord: "Em Am Em B", energy: 2 },
    everyday: { chord: "Em Am Em B", energy: 3 },
    hume: { chord: "Am Em C B", energy: 2 },
    answer: { chord: "C D Em B", energy: 2 },
    question: { chord: "Em", energy: 0 },
    cost: { chord: "Am Em C B", energy: 3 },
    turn: { chord: "C D Em Em", energy: 1 },
    ending: { chord: "C D G G", energy: 2 },
  },
};
