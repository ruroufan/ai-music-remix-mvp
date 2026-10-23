import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "人格 No.03 · NT",
  topic: "赢",
  topicLatin: "ENTJ · THE COMMANDER",
};

export const episode: EpisodeData = {
  id: "entj",
  title: "ENTJ · 赢",
  bpm: 120, // 15 frames per beat
  script,
  music: "arenarock", // its own set of sounds: distorted power chords, a rock kit, gang claps — and a clean guitar
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // B minor → D major. energy: 0 a clean guitar picking alone · 1 + palm-
  // muted chugs, a kick · 2 + the full kit, open power chords, gang claps on
  // 2 and 4 · 3 + double-time chugs, crash on every bar, a lead line. The
  // ending — down off the stage, level with everyone — is the clean guitar.
  moods: {
    series: { chord: "Bm G", energy: 3 },
    hook: { chord: "Bm G D A", energy: 1 },
    title: { chord: "Bm G", energy: 2 },
    diagnosis: { chord: "G A Bm Bm", energy: 2 },
    misread: { chord: "Bm G D A", energy: 2 },
    everyday: { chord: "Bm G D A", energy: 3 },
    hegel: { chord: "Em Bm G F#", energy: 3 },
    answer: { chord: "G A Bm F#", energy: 2 },
    question: { chord: "Bm", energy: 0 },
    cost: { chord: "Em Bm G F#", energy: 3 },
    equal: { chord: "G A Bm Bm", energy: 1 },
    ending: { chord: "G A D D", energy: 0 },
  },
};
