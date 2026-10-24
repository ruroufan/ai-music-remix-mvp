import React from "react";
import { AbsoluteFill, Audio, Sequence, Series, interpolate, staticFile } from "remotion";
import type { Brand, EpisodeData, SceneProps } from "./types";
import { lineKey, sec, VOICE_DELAY, type Timeline } from "./timeline";
import { voiceover } from "./voiceover.generated";
import { EpisodeContext, SceneIndexContext, type EpisodeLook } from "./EpisodeContext";

export type EpisodeDef = {
  data: EpisodeData;
  timeline: Timeline;
  scenes: Record<string, React.FC<SceneProps>>;
  look: EpisodeLook;
  brand: Brand;
};

const DUCK_RAMP = 8; // frames

// Plays an episode: its scenes in order on the beat grid, the generated score
// (public/music/<id>.wav) and, if present, voiceover clips.
export const EpisodeVideo: React.FC<{ ep: EpisodeDef }> = ({ ep }) => {
  const { data, timeline, scenes, look, brand } = ep;
  // Without narration the score carries the video, so it plays louder.
  const full = timeline.hasVoiceover ? 0.55 : 0.7;
  const ducked = 0.14;
  const ranges = timeline.voiceRanges();

  // Music sits at full level between lines and dips under the narration.
  const musicVolume = (f: number) => {
    let level = full;
    for (const [from, to] of ranges) {
      const duck = interpolate(f, [from - DUCK_RAMP, from, to, to + DUCK_RAMP], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      level = Math.min(level, full - (full - ducked) * duck);
    }
    const edges = interpolate(f, [0, 6, timeline.totalFrames - 30, timeline.totalFrames], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return level * edges;
  };

  return (
    <EpisodeContext.Provider value={{ timeline, look, brand }}>
      <AbsoluteFill style={{ background: "#000" }}>
        <Audio src={staticFile(`music/${data.id}.wav`)} volume={musicVolume} />
        <Series>
          {data.script.map((scene, index) => {
            const { starts, end } = timeline.lineStarts(scene);
            const Scene = scenes[scene.id];
            if (!Scene) throw new Error(`No scene component for "${scene.id}" in episode ${data.id}`);
            return (
              <Series.Sequence key={scene.id} durationInFrames={end}>
                <SceneIndexContext.Provider value={index}>
                  <Scene lines={scene.lines} cues={starts} duration={end} />
                </SceneIndexContext.Provider>
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
    </EpisodeContext.Provider>
  );
};
