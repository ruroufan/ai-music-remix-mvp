// Shared shapes for every episode.

// One subtitle line. `seconds` forces a longer hold; `say` is what the TTS reads
// if you add a voiceover (`npm run voiceover`).
export type Line = { text: string; seconds?: number; say?: string };
export type SceneSpec = { id: string; lines: Line[] };
export type SceneProps = { lines: Line[]; cues: number[]; duration: number };

// Music direction for one scene: the pad chord, and how hard the track drives
// (0 = ambient only … 3 = everything playing).
export type Mood = { chord: string; energy: number };

// Everything about an episode that Node scripts (music, voiceover) also need —
// plain data, no React.
export type EpisodeData = {
  id: string;
  title: string;
  bpm: number;
  script: SceneSpec[];
  music: "ambient" | "drive" | "clockwork" | "lofi" | "cassette" | "cinematic" | "guochao" | "stompclap" | "afrohouse" | "futurebass" | "electroswing" | "phonk" | "dembow" | "acid" | "breakbeat" | "frenchhouse" | "glitchhop" | "industrial";
  moods: Record<string, Mood>;
  timing?: TimingOptions;
};

export type TimingOptions = {
  readCharsPerSec?: number; // subtitle reading speed
  readPadding?: number; // seconds added to every line
  minSeconds?: number; // shortest a line may stay up
  sceneUnitBeats?: number; // scenes are padded to a multiple of this many beats
};

// What the frame/chrome prints on every scene. Channels use the fields they need.
export type Brand = {
  topic: string;
  topicLatin?: string;
  channel?: string;
  channelLatin?: string;
  series?: string;
  watermark?: string;
  signoff?: string;
};
