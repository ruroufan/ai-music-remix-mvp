import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.08",
  topic: "拖延",
  topicLatin: "PROCRASTINATION",
};

export const episode: EpisodeData = {
  id: "procrastination",
  title: "拖延",
  bpm: 120, // 15 frames per beat; calendar pages tear on the beat
  script,
  music: "clockwork", // its own set of sounds: clock ticks, pizzicato, half-time drums, bells
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // B minor. energy: 0 pad + ticking clock · 1 tick-tock + pizzicato + piano bass ·
  // 2 + half-time drums · 3 + 16th pizzicato and bells.
  // Peak on the deadline night; the last page (今天) resolves to B major.
  moods: {
    hook: { chord: "Bm Bm G A", energy: 1 },
    title: { chord: "Bm G", energy: 2 },
    diagnosis: { chord: "G A Bm Bm", energy: 2 },
    misread: { chord: "Bm G D A", energy: 2 },
    everyday: { chord: "Bm G D A", energy: 3 },
    free: { chord: "Em G D A", energy: 2 },
    answer: { chord: "G A Bm Bm", energy: 3 },
    question: { chord: "Bm", energy: 0 },
    debt: { chord: "Em Bm G A", energy: 2 },
    quote: { chord: "G D", energy: 1 },
    ending: { chord: "G D A B", energy: 0 },
  },
};
