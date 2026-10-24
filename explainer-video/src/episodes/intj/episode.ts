import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "人格 No.01 · NT",
  topic: "正确",
  topicLatin: "INTJ · THE ARCHITECT",
};

export const episode: EpisodeData = {
  id: "intj",
  title: "INTJ · 正确",
  bpm: 120, // 15 frames per beat
  script,
  music: "industrial", // its own set of sounds: a sequenced 16th-note bass, a distorted kick, metal hits, a cold lead — and a felt piano
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // C minor → E♭ major. energy: 0 a felt piano alone · 1 + the sequencer
  // ticking behind a closed filter, a soft kick · 2 + the distorted kick,
  // gated snare, metal clanks, the sequencer open · 3 + a second sequence an
  // octave up, a cold detuned lead, the clanks doubled. The ending — leaving a
  // blank in the plan — is the piano alone, in E♭.
  moods: {
    series: { chord: "Cm Ab", energy: 3 },
    hook: { chord: "Cm Ab Eb Bb", energy: 1 },
    title: { chord: "Cm Ab", energy: 2 },
    diagnosis: { chord: "Ab Bb Cm Cm", energy: 2 },
    misread: { chord: "Cm Ab Eb Bb", energy: 2 },
    everyday: { chord: "Cm Ab Eb Bb", energy: 3 },
    socrates: { chord: "Fm Cm Ab G", energy: 3 },
    answer: { chord: "Ab Bb Cm G", energy: 2 },
    question: { chord: "Cm", energy: 0 },
    cost: { chord: "Fm Cm Ab G", energy: 3 },
    examine: { chord: "Ab Bb Cm Cm", energy: 1 },
    ending: { chord: "Ab Bb Eb Eb", energy: 0 },
  },
};
