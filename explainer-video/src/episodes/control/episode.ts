import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.19",
  topic: "控制欲",
  topicLatin: "THE NEED FOR CONTROL",
};

export const episode: EpisodeData = {
  id: "control",
  title: "控制欲",
  bpm: 120, // 15 frames per beat
  script,
  music: "acid", // its own set of sounds: a rumbling techno kick, a 303 acid line that never stops, tubular bells
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // F minor → A♭ major. energy: 0 tubular bells and a pad · 1 + the acid
  // line, filtered down, a soft kick · 2 + the rumble kick, claps, open hats,
  // the filter opening · 3 + a second acid line, a ride, stabs. The ending —
  // letting go — is the bells alone, in A♭.
  moods: {
    hook: { chord: "Fm Db Eb Cm", energy: 1 },
    title: { chord: "Fm Db", energy: 2 },
    diagnosis: { chord: "Db Eb Fm Fm", energy: 2 },
    misread: { chord: "Fm Db Eb Cm", energy: 2 },
    everyday: { chord: "Fm Db Eb Cm", energy: 3 },
    epictetus: { chord: "Db Ab Eb Fm", energy: 2 },
    answer: { chord: "Db Eb Fm Cm", energy: 3 },
    question: { chord: "Fm", energy: 0 },
    cost: { chord: "Fm Db Eb Cm", energy: 3 },
    root: { chord: "Db Eb Fm Fm", energy: 1 },
    ending: { chord: "Db Eb Ab Ab", energy: 0 },
  },
};
