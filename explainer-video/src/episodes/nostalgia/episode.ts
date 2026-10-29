import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.10",
  topic: "怀旧",
  topicLatin: "NOSTALGIA",
};

export const episode: EpisodeData = {
  id: "nostalgia",
  title: "怀旧",
  bpm: 120, // 15 frames per beat
  script,
  music: "cassette", // its own set of sounds: music box, gated-reverb snare, gallop bass, tom fills, tape stops
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // A major (with its relative minor). energy: 0 music box + warm pad ·
  // 1 + gallop bass and a soft clap · 2 + 80s drums with a big gated snare ·
  // 3 + bright poly-synth stabs. The fog lights up on the last bars: D E A.
  moods: {
    hook: { chord: "A E F#m D", energy: 1 },
    title: { chord: "D E", energy: 2 },
    diagnosis: { chord: "F#m D A E", energy: 2 },
    misread: { chord: "D A E F#m", energy: 2 },
    everyday: { chord: "A E F#m D", energy: 3 },
    ended: { chord: "Bm D A E", energy: 2 },
    answer: { chord: "D E C#m F#m", energy: 3 },
    question: { chord: "F#m", energy: 0 },
    cost: { chord: "Bm F#m D E", energy: 2 },
    quote: { chord: "D A", energy: 1 },
    ending: { chord: "D E A A", energy: 0 },
  },
};
