import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "人格 No.15 · SP",
  topic: "停不下来",
  topicLatin: "ESTP · THE ENTREPRENEUR",
};

export const episode: EpisodeData = {
  id: "estp",
  title: "ESTP · 停不下来",
  bpm: 120, // 15 frames per beat
  script,
  music: "surf", // its own set of sounds: a twangy guitar drenched in spring reverb, a driving floor-tom beat, a picked bass, a combo organ — and a tremolo-picked lead
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // A minor → C major. energy: 0 the reverb guitar alone · 1 + floor toms,
  // a picked bass · 2 + the full kit, a rhythm-guitar chop, an organ · 3 + a
  // tremolo-picked lead racing in sixteenths. The ending — he sits in an
  // empty room beside his own shadow — settles into C.
  moods: {
    series: { chord: "Am F", energy: 3 },
    hook: { chord: "Am F G E", energy: 3 },
    title: { chord: "Am E", energy: 2 },
    diagnosis: { chord: "Dm Am E E", energy: 1 },
    misread: { chord: "Am F G E", energy: 2 },
    everyday: { chord: "Am F G E", energy: 3 },
    pascal: { chord: "Dm Am F E", energy: 2 },
    answer: { chord: "F G Am E", energy: 2 },
    question: { chord: "Am", energy: 0 },
    cost: { chord: "Am F G E", energy: 3 },
    turn: { chord: "F G Am E", energy: 2 },
    ending: { chord: "F G C C", energy: 1 },
  },
};
