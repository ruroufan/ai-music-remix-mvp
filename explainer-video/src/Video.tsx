import React from "react";
import { AbsoluteFill, Audio, Sequence, Series, interpolate, staticFile } from "remotion";
import { script, type SceneId } from "./script";
import { lineKey, lineStarts, sec, totalFrames, voiceRanges, VOICE_DELAY } from "./timeline";
import { voiceover } from "./voiceover.generated";
import type { SceneProps } from "./timing";
import { TitleScene } from "./scenes/TitleScene";
import { DiagnosisScene } from "./scenes/DiagnosisScene";
import { MisconceptionScene } from "./scenes/MisconceptionScene";
import { SocialScene } from "./scenes/SocialScene";
import { TwoLovesScene } from "./scenes/TwoLovesScene";
import { PodiumScene } from "./scenes/PodiumScene";
import { ScoresScene } from "./scenes/ScoresScene";
import { RebuttalScene } from "./scenes/RebuttalScene";
import { QuestionScene } from "./scenes/QuestionScene";
import { CupScene } from "./scenes/CupScene";
import { RankScene } from "./scenes/RankScene";
import { AudienceScene } from "./scenes/AudienceScene";
import { StandFirmScene } from "./scenes/StandFirmScene";

const SCENES: Record<SceneId, React.FC<SceneProps>> = {
  title: TitleScene,
  diagnosis: DiagnosisScene,
  misconception: MisconceptionScene,
  social: SocialScene,
  twoLoves: TwoLovesScene,
  podium: PodiumScene,
  scores: ScoresScene,
  rebuttal: RebuttalScene,
  question: QuestionScene,
  cup: CupScene,
  rank: RankScene,
  audience: AudienceScene,
  standFirm: StandFirmScene,
};

const MUSIC_VOLUME = 0.55;
const MUSIC_DUCKED = 0.14;
const DUCK_RAMP = 8; // frames

// Music sits at full level between lines and dips under the narration.
const musicVolume = (f: number) => {
  let level = MUSIC_VOLUME;
  for (const [from, to] of voiceRanges()) {
    const duck = interpolate(f, [from - DUCK_RAMP, from, to, to + DUCK_RAMP], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    level = Math.min(level, MUSIC_VOLUME - (MUSIC_VOLUME - MUSIC_DUCKED) * duck);
  }
  const edges = interpolate(f, [0, 20, totalFrames - 45, totalFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return level * edges;
};

export const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Audio src={staticFile("music/bgm.wav")} volume={musicVolume} />
    <Series>
      {script.map((scene) => {
        const { starts, end } = lineStarts(scene);
        const Scene = SCENES[scene.id];
        return (
          <Series.Sequence key={scene.id} durationInFrames={end}>
            <Scene lines={scene.lines} cues={starts} duration={end} />
            {scene.lines.map((_, j) => {
              const clip = voiceover[lineKey(scene.id, j)];
              return clip ? (
                <Sequence key={j} from={starts[j] + sec(VOICE_DELAY)} layout="none">
                  <Audio src={staticFile(clip.file)} />
                </Sequence>
              ) : null;
            })}
          </Series.Sequence>
        );
      })}
    </Series>
  </AbsoluteFill>
);
