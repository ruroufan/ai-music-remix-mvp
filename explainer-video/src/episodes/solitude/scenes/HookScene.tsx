import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Crowd, CROWD_SIZE, HERO, Person } from "../porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

// The crowd fills in around one person, a few people per beat. Two meters in
// the corner climb together: people around you, and how alone you feel.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const count = Math.min(CROWD_SIZE, Math.floor(frame / BEAT) * 3 + 1);
  const lonely = interpolate(count, [1, CROWD_SIZE], [0.08, 1]);
  const meter = (label: string, value: string, k: number, color: string, y: number) => (
    <div style={{ position: "absolute", left: 1460, top: y, width: 300, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.dim }}>
      {label} <span style={{ color, fontSize: 26, float: "right" }}>{value}</span>
      <div style={{ marginTop: 8, height: 8, background: palette.faint }}>
        <div style={{ width: `${k * 100}%`, height: "100%", background: color }} />
      </div>
    </div>
  );
  return (
    <ObsFrame duration={duration}>
      <Crowd frame={frame} count={count} chatter={frame >= cues[1] ? 1 : 0.6} />
      <Person x={HERO.x} bottom={HERO.bottom} height={HERO.height} glow={0.9 - lonely * 0.6} />
      <div style={{ position: "absolute", left: 1440, top: 150, width: 340, height: 170, background: "rgba(6,8,12,0.8)", border: `1px solid ${palette.faint}` }} />
      {meter("身边的人", String(count * 7), count / CROWD_SIZE, palette.ink, 172)}
      {meter("孤独感", `${Math.round(lonely * 100)}%`, lonely, palette.alert, 246)}
      {Array.from({ length: 8 }, (_, k) => (
        <Sfx key={k} name="step" at={k * BEAT * 2} volume={0.18 + k * 0.03} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
