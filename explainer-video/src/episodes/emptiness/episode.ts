import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.21",
  topic: "空虚",
  topicLatin: "EMPTINESS",
};

export const episode: EpisodeData = {
  id: "emptiness",
  title: "空虚",
  bpm: 120, // 15 frames per beat
  script,
  music: "frenchhouse", // its own set of sounds: a filtered disco loop that pumps, a slap bass, a music box over a ticking pendulum
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // E minor → G major. energy: 0 a music box over a pendulum's tick-tock ·
  // 1 + the disco loop behind a closed filter, a soft kick · 2 + the full kick,
  // claps, open hats, the slap bass, the filter open and pumping · 3 + the
  // loop chopped in 16ths, a shaker, a rising string line. The ending — off
  // the pendulum, at the desk — is the music box alone, in G.
  moods: {
    hook: { chord: "Em C G D", energy: 1 },
    title: { chord: "Em C", energy: 2 },
    diagnosis: { chord: "C D Em Em", energy: 2 },
    misread: { chord: "Em C G D", energy: 2 },
    everyday: { chord: "Em C G D", energy: 3 },
    pendulum: { chord: "Am Em C B", energy: 3 },
    answer: { chord: "C D Em B", energy: 2 },
    question: { chord: "Em", energy: 0 },
    cost: { chord: "Am Em C B", energy: 3 },
    way: { chord: "C D Em Em", energy: 1 },
    ending: { chord: "C D G G", energy: 0 },
  },
};
