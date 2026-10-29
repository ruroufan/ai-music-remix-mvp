import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.20",
  topic: "倦怠",
  topicLatin: "BURNOUT",
};

export const episode: EpisodeData = {
  id: "burnout",
  title: "倦怠",
  bpm: 120, // 15 frames per beat
  script,
  music: "breakbeat", // its own set of sounds: a chopped break, a growling reese bass, stabs, a harp
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // D minor → F major. energy: 0 a harp alone · 1 + a sub pulse, a light
  // break · 2 + the full chopped break, the reese bass · 3 + brass-like
  // stabs, a siren lead, the break doubled up. The ending — stopping — is the
  // harp alone, in F.
  moods: {
    hook: { chord: "Dm Bb F C", energy: 1 },
    title: { chord: "Dm Bb", energy: 2 },
    diagnosis: { chord: "Bb C Dm Dm", energy: 2 },
    misread: { chord: "Dm Bb F C", energy: 2 },
    everyday: { chord: "Dm Bb F C", energy: 3 },
    han: { chord: "Gm Dm Bb A", energy: 3 },
    answer: { chord: "Bb C Dm A", energy: 2 },
    question: { chord: "Dm", energy: 0 },
    cost: { chord: "Gm Dm Bb A", energy: 3 },
    skill: { chord: "Bb C Dm Dm", energy: 1 },
    ending: { chord: "Bb C F F", energy: 0 },
  },
};
