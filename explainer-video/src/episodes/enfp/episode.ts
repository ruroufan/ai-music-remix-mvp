import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "人格 No.08 · NF",
  topic: "新鲜感",
  topicLatin: "ENFP · THE CAMPAIGNER",
};

export const episode: EpisodeData = {
  id: "enfp",
  title: "ENFP · 新鲜感",
  bpm: 120, // 15 frames per beat
  script,
  music: "chiptune", // its own set of sounds: pulse-wave arpeggios, a triangle bass, noise-channel drums — and a square lead
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // B minor → D major. energy: 0 a slow pulse arpeggio with an echo · 1 + the
  // triangle bass, noise hats · 2 + noise kick and snare, 16th arpeggios ·
  // 3 + the square lead with vibrato. The ending — he stays, and the tree
  // grows — opens up in D.
  moods: {
    series: { chord: "Bm G", energy: 3 },
    hook: { chord: "Bm G D A", energy: 2 },
    title: { chord: "Bm G", energy: 3 },
    diagnosis: { chord: "G A Bm Bm", energy: 2 },
    misread: { chord: "Bm G D A", energy: 2 },
    everyday: { chord: "Bm G D A", energy: 3 },
    kierkegaard: { chord: "Em Bm G F#m", energy: 3 },
    answer: { chord: "G A Bm F#m", energy: 2 },
    question: { chord: "Bm", energy: 0 },
    cost: { chord: "Em Bm G F#m", energy: 2 },
    turn: { chord: "G A Bm Bm", energy: 1 },
    ending: { chord: "G A D D", energy: 3 },
  },
};
