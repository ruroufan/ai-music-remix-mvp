import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.11",
  topic: "年龄焦虑",
  topicLatin: "AGE ANXIETY",
};

export const episode: EpisodeData = {
  id: "age",
  title: "年龄焦虑",
  bpm: 120, // 15 frames per beat
  script,
  music: "cinematic", // its own set of sounds: spiccato strings, taiko, braams, Shepard tone, piano
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // C# minor → E major. energy: 0 piano · 1 spiccato 8ths + taiko heartbeat ·
  // 2 + 16ths, taiko pattern, braam · 3 + Shepard tone. The runner's scenes
  // peak; stepping off the timeline resolves to E.
  moods: {
    hook: { chord: "C#m C#m A B", energy: 1 },
    title: { chord: "C#m A", energy: 2 },
    diagnosis: { chord: "A B C#m C#m", energy: 2 },
    misread: { chord: "C#m A E B", energy: 2 },
    everyday: { chord: "C#m A E B", energy: 3 },
    they: { chord: "F#m C#m A B", energy: 3 },
    answer: { chord: "A B C#m C#m", energy: 2 },
    question: { chord: "C#m", energy: 0 },
    cost: { chord: "F#m A C#m B", energy: 3 },
    own: { chord: "A B E E", energy: 1 },
    ending: { chord: "A B E E", energy: 0 },
  },
};
