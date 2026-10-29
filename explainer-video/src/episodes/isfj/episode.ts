import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "人格 No.10 · SJ",
  topic: "忍",
  topicLatin: "ISFJ · THE DEFENDER",
};

export const episode: EpisodeData = {
  id: "isfj",
  title: "ISFJ · 忍",
  bpm: 120, // 15 frames per beat
  script,
  music: "triphop", // its own set of sounds: a dusty half-time break, sub bass, a wobbling Rhodes, vinyl crackle — a gliding lead and strings
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // D minor → F major. energy: 0 the Rhodes alone, crackle · 1 + the
  // half-time beat and sub · 2 + hats, shaker, strings, a bass line · 3 + a
  // heavier beat, a gliding lead, string stabs. The ending — the stones
  // taken out one by one — opens up in F.
  moods: {
    series: { chord: "Dm Bb", energy: 3 },
    hook: { chord: "Dm Bb F C", energy: 1 },
    title: { chord: "Dm Bb", energy: 2 },
    diagnosis: { chord: "Bb C Dm Dm", energy: 1 },
    misread: { chord: "Dm Bb F C", energy: 2 },
    everyday: { chord: "Dm Bb F C", energy: 2 },
    nietzsche: { chord: "Gm Dm Bb A", energy: 3 },
    answer: { chord: "Bb C Dm A", energy: 2 },
    question: { chord: "Dm", energy: 0 },
    cost: { chord: "Gm Dm Bb A", energy: 3 },
    turn: { chord: "Bb C Dm Dm", energy: 1 },
    ending: { chord: "Bb C F F", energy: 2 },
  },
};
