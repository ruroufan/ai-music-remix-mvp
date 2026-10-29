import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "人格 No.09 · SJ",
  topic: "有用",
  topicLatin: "ISTJ · THE LOGISTICIAN",
};

export const episode: EpisodeData = {
  id: "istj",
  title: "ISTJ · 有用",
  bpm: 120, // 15 frames per beat
  script,
  music: "minimalism", // its own set of sounds: interlocking marimbas, a tremolo vibraphone, a pulsing piano, a bass clarinet — and an organ swell
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // F minor → A♭ major. energy: 0 the vibraphone alone · 1 + the marimba
  // ostinato · 2 + pulsing piano, bass clarinet, a soft kick · 3 + a second
  // marimba out of phase, an organ swell. The ending — he puts the list
  // down under the old tree — settles into A♭.
  moods: {
    series: { chord: "Fm Db", energy: 3 },
    hook: { chord: "Fm Db Ab Eb", energy: 1 },
    title: { chord: "Fm Db", energy: 2 },
    diagnosis: { chord: "Db Eb Fm Fm", energy: 1 },
    misread: { chord: "Fm Db Ab Eb", energy: 2 },
    everyday: { chord: "Fm Db Ab Eb", energy: 3 },
    zhuangzi: { chord: "Bbm Fm Db Cm", energy: 2 },
    answer: { chord: "Db Eb Fm Cm", energy: 3 },
    question: { chord: "Fm", energy: 0 },
    cost: { chord: "Bbm Fm Db Cm", energy: 2 },
    turn: { chord: "Db Eb Fm Fm", energy: 1 },
    ending: { chord: "Db Eb Ab Ab", energy: 1 },
  },
};
