import React from "react";
import { AbsoluteFill, Audio, Sequence, Series, staticFile } from "remotion";
import { script, type SceneId } from "./script";
import { lineStarts, sceneFrames, type SceneProps } from "./timing";
import { TitleScene } from "./scenes/TitleScene";
import { TwoLovesScene } from "./scenes/TwoLovesScene";
import { PodiumScene } from "./scenes/PodiumScene";

const SCENES: Record<SceneId, React.FC<SceneProps>> = {
  title: TitleScene,
  twoLoves: TwoLovesScene,
  podium: PodiumScene,
};

export const totalFrames = script.reduce((sum, s) => sum + sceneFrames(s), 0);

export const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Series>
      {script.map((scene, i) => {
        const { starts, end } = lineStarts(scene.lines);
        const Scene = SCENES[scene.id];
        return (
          <Series.Sequence key={i} durationInFrames={end}>
            <Scene lines={scene.lines} cues={starts} duration={end} />
            {scene.lines.map((l, j) =>
              l.audio ? (
                <Sequence key={j} from={starts[j]}>
                  <Audio src={staticFile(l.audio)} />
                </Sequence>
              ) : null,
            )}
          </Series.Sequence>
        );
      })}
    </Series>
  </AbsoluteFill>
);
