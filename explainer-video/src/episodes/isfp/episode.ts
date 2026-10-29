import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "人格 No.14 · SP",
  topic: "回避",
  topicLatin: "ISFP · THE ADVENTURER",
};

export const episode: EpisodeData = {
  id: "isfp",
  title: "ISFP · 回避",
  bpm: 120, // 15 frames per beat
  script,
  music: "folk", // its own set of sounds: a fingerpicked steel-string guitar, a stomp and shaker, a cello, a glockenspiel — and a whistled tune
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // B minor → D major. energy: 0 the guitar alone · 1 + a soft stomp, a
  // shaker, the bass · 2 + a cello, a glockenspiel, a tambourine · 3 + a
  // whistled tune and a mandolin tremolo. The ending — he turns round and
  // steps across the crack — settles into D.
  moods: {
    series: { chord: "Bm G", energy: 3 },
    hook: { chord: "Bm G D A", energy: 1 },
    title: { chord: "Bm G", energy: 2 },
    diagnosis: { chord: "G A Bm Bm", energy: 1 },
    misread: { chord: "Bm G D A", energy: 2 },
    everyday: { chord: "Bm G D A", energy: 3 },
    buber: { chord: "G D A Bm", energy: 2 },
    answer: { chord: "Em G A A", energy: 2 },
    question: { chord: "Bm", energy: 0 },
    cost: { chord: "G D Em A", energy: 3 },
    turn: { chord: "G A Bm Bm", energy: 1 },
    ending: { chord: "G A D D", energy: 2 },
  },
};
