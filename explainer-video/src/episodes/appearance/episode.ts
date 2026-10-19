import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.15",
  topic: "容貌焦虑",
  topicLatin: "APPEARANCE ANXIETY",
};

export const episode: EpisodeData = {
  id: "appearance",
  title: "容貌焦虑",
  bpm: 120, // 15 frames per beat
  script,
  music: "futurebass", // its own set of sounds: supersaw chords that pump, half-time drums, vocal chops, a felt piano
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // B♭ minor → D♭ major. energy: 0 a felt piano alone (no filter on it) ·
  // 1 + plucks, a soft kick, hats · 2 + half-time drums, pumping supersaw
  // chords, sub · 3 + vocal chops, chord wobble, claps. The ending — the
  // screen goes dark, only the mirror is left — is the piano alone, in D♭.
  moods: {
    hook: { chord: "Bbm F# Db Ab", energy: 1 },
    title: { chord: "Bbm F#", energy: 2 },
    diagnosis: { chord: "F# Ab Bbm Bbm", energy: 2 },
    misread: { chord: "Bbm F# Db Ab", energy: 2 },
    everyday: { chord: "Bbm F# Db Ab", energy: 3 },
    copy: { chord: "F# Db Ab Bbm", energy: 3 },
    normal: { chord: "Bbm F# Db Ab", energy: 2 },
    answer: { chord: "F# Ab Bbm Fm", energy: 3 },
    question: { chord: "Bbm", energy: 0 },
    cost: { chord: "F# Db Ab Fm", energy: 2 },
    real: { chord: "Bbm F# Db Ab", energy: 1 },
    ending: { chord: "F# Ab Db Db", energy: 0 },
  },
};
