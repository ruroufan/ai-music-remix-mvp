import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "人格 No.02 · NT",
  topic: "想太多",
  topicLatin: "INTP · THE LOGICIAN",
};

export const episode: EpisodeData = {
  id: "intp",
  title: "INTP · 想太多",
  bpm: 120, // 15 frames per beat
  script,
  music: "trance", // its own set of sounds: a rolling off-beat bass, gated supersaw arps, a big riser — and a wooden flute
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // E minor → G major. energy: 0 a wooden flute alone · 1 + a plucked arp, a
  // soft kick · 2 + the four-on-the-floor kick, the rolling bass, open hats,
  // a gated supersaw · 3 + the supersaw lead in full, a second arp an octave
  // up. The ending — out of the study, under the green tree — is the flute.
  moods: {
    series: { chord: "Em C", energy: 3 },
    hook: { chord: "Em C G D", energy: 1 },
    title: { chord: "Em C", energy: 2 },
    diagnosis: { chord: "C D Em Em", energy: 2 },
    misread: { chord: "Em C G D", energy: 2 },
    everyday: { chord: "Em C G D", energy: 3 },
    faust: { chord: "Am Em C B", energy: 3 },
    answer: { chord: "C D Em B", energy: 2 },
    question: { chord: "Em", energy: 0 },
    cost: { chord: "Am Em C B", energy: 3 },
    turn: { chord: "C D Em Em", energy: 1 },
    ending: { chord: "C D G G", energy: 0 },
  },
};
