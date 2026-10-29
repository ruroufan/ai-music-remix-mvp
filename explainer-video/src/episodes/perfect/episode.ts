import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.13",
  topic: "完美主义",
  topicLatin: "PERFECTIONISM",
};

export const episode: EpisodeData = {
  id: "perfect",
  title: "完美主义",
  bpm: 120, // 15 frames per beat
  script,
  music: "stompclap", // its own set of sounds: strummed guitar, stomps, claps, snaps, glockenspiel, upright bass
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // G major (with E minor). energy: 0 picked guitar + glock · 1 + snaps, bass,
  // 8th strums · 2 + stomps and claps · 3 + glock melody, shaker, 16th strums.
  moods: {
    hook: { chord: "Em C G D", energy: 1 },
    title: { chord: "G D", energy: 2 },
    diagnosis: { chord: "C D Em Em", energy: 2 },
    misread: { chord: "Em C G D", energy: 2 },
    everyday: { chord: "G D Em C", energy: 3 },
    why: { chord: "Am C G D", energy: 2 },
    answer: { chord: "C D Em Em", energy: 3 },
    question: { chord: "Em", energy: 0 },
    cost: { chord: "Am Em C D", energy: 2 },
    quote: { chord: "C G D Em", energy: 3 },
    ending: { chord: "C D G G", energy: 0 },
  },
};
