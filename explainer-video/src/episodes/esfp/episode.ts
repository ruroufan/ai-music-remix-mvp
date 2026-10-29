import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "人格 No.16 · SP",
  topic: "热闹",
  topicLatin: "ESFP · THE ENTERTAINER",
};

export const episode: EpisodeData = {
  id: "esfp",
  title: "ESFP · 热闹",
  bpm: 120, // 15 frames per beat
  script,
  music: "samba", // its own set of sounds: a cavaquinho, surdos, a caixa, tamborims, an agogô, a ganzá — and a brass line with a whistle when the party peaks
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // D minor → F major. energy: 0 a nylon guitar alone · 1 + a cavaquinho,
  // a soft surdo, a ganzá · 2 + the caixa, tamborims, an agogô · 3 + the full
  // bateria, brass stabs and a whistle. The ending — bread at a small table
  // in the garden — settles into F, quiet.
  moods: {
    series: { chord: "Dm Bb", energy: 3 },
    hook: { chord: "Dm Gm A Dm", energy: 3 },
    title: { chord: "Dm A", energy: 2 },
    diagnosis: { chord: "Bb C Dm Dm", energy: 1 },
    misread: { chord: "Dm Gm A Dm", energy: 2 },
    everyday: { chord: "Dm Gm C F", energy: 3 },
    epicurus: { chord: "Bb F Gm A", energy: 1 },
    answer: { chord: "Gm A Dm Dm", energy: 2 },
    question: { chord: "Dm", energy: 0 },
    cost: { chord: "Dm Gm C F", energy: 3 },
    turn: { chord: "Bb C Dm Dm", energy: 1 },
    ending: { chord: "Bb C F F", energy: 1 },
  },
};
