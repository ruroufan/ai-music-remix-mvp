import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "人格 No.07 · NF",
  topic: "付出",
  topicLatin: "ENFJ · THE PROTAGONIST",
};

export const episode: EpisodeData = {
  id: "enfj",
  title: "ENFJ · 付出",
  bpm: 120, // 15 frames per beat
  script,
  music: "gospel", // its own set of sounds: a Hammond organ with a Leslie, gospel piano, handclaps, a shuffled kit, bass — and a choir
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // G minor → B♭ major. energy: 0 the organ alone, swelling · 1 + piano and
  // soft claps · 2 + the kit and bass · 3 + the choir, tambourine, organ
  // stabs. The ending — he pours a cup for himself, and sits down with the
  // others — opens up in B♭.
  moods: {
    series: { chord: "Gm Eb", energy: 3 },
    hook: { chord: "Gm Eb Bb F", energy: 1 },
    title: { chord: "Gm Eb", energy: 2 },
    diagnosis: { chord: "Eb F Gm Gm", energy: 2 },
    misread: { chord: "Gm Eb Bb F", energy: 2 },
    everyday: { chord: "Gm Eb Bb F", energy: 3 },
    kant: { chord: "Cm Gm Eb D", energy: 3 },
    answer: { chord: "Eb F Gm D", energy: 2 },
    question: { chord: "Gm", energy: 0 },
    cost: { chord: "Cm Gm Eb D", energy: 2 },
    turn: { chord: "Eb F Gm Gm", energy: 1 },
    ending: { chord: "Eb F Bb Bb", energy: 3 },
  },
};
