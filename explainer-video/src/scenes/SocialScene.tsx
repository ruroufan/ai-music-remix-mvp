import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Frame } from "../components/Frame";
import { Rays } from "../components/Figures";
import { GlowWord, WatchingEyes } from "../components/Stage";
import { Subtitles } from "../components/Subtitles";
import { Sfx } from "../components/Sfx";
import { useRamp, type SceneProps } from "../timing";

const card: React.CSSProperties = {
  position: "absolute",
  background: "linear-gradient(#26231f, #1a1815)",
  border: "1.5px solid rgba(239,233,223,0.18)",
  borderRadius: 14,
  boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
};
const bar = (w: number, o = 0.25): React.CSSProperties => ({ height: 12, width: w, borderRadius: 6, background: `rgba(239,233,223,${o})` });

// A post nobody liked.
const Post: React.FC = () => (
  <div style={{ ...card, left: 960 - 270, top: 150, width: 540, height: 500, padding: 30, boxSizing: "border-box" }}>
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <div style={{ width: 52, height: 52, borderRadius: 8, background: "#d8d4cc" }} />
      <div style={{ display: "grid", gap: 10 }}>
        <div style={bar(120, 0.45)} />
        <div style={bar(320)} />
      </div>
    </div>
    <div style={{ marginTop: 26, height: 250, borderRadius: 6, background: "linear-gradient(#2b201b, #c4653d 70%, #e8a35a)" }} />
    <div style={{ marginTop: 26, display: "flex", justifyContent: "space-between", color: "rgba(239,233,223,0.45)", fontSize: 22 }}>
      <span>10分钟前</span>
      <span>♡ 0</span>
    </div>
  </div>
);

// A group chat: your message hangs there, then gets withdrawn.
const Chat: React.FC<{ withdrawn: number }> = ({ withdrawn }) => (
  <div style={{ ...card, left: 960 - 290, top: 150, width: 580, height: 480, padding: 34, boxSizing: "border-box" }}>
    {[260, 200, 300].map((w, i) => (
      <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 26 }}>
        <div style={{ width: 40, height: 40, borderRadius: 6, background: "rgba(239,233,223,0.18)" }} />
        <div style={{ ...bar(w, 0.12), height: 34, borderRadius: 8 }} />
      </div>
    ))}
    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 14, marginTop: 40, opacity: 1 - withdrawn }}>
      <div style={{ background: "#b8392b", color: "#f6e7e2", fontSize: 26, padding: "12px 20px", borderRadius: 10 }}>周末有人一起吃饭吗？</div>
      <div style={{ width: 40, height: 40, borderRadius: 6, background: "#d8d4cc" }} />
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 104, textAlign: "center", fontSize: 20, color: "rgba(239,233,223,0.45)", opacity: withdrawn }}>
      你撤回了一条消息
    </div>
  </div>
);

export const SocialScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const postIn = useRamp(cues[0] + 4, 16);
  // The unliked post drops away just before the next line ("删掉").
  const postOut = interpolate(frame, [cues[1] - 22, cues[1]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chatIn = useRamp(cues[1] + 4, 16);
  const withdrawn = useRamp(cues[1] + Math.round((cues[2] - cues[1]) * 0.55), 14);
  const chatOut = interpolate(frame, [cues[2] - 10, cues[2] + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const need = useRamp(cues[2] + 2, 22);
  const rays = useRamp(cues[2] + 6, 40);

  return (
    <Frame duration={duration}>
      <WatchingEyes opacity={1 - need * 0.8} />
      <div style={{ opacity: postIn * (1 - postOut), transform: `translateY(${postOut * 160}px) rotate(${postOut * 8}deg) scale(${0.96 + postIn * 0.04})` }}>
        <Post />
      </div>
      <div style={{ opacity: chatIn * (1 - chatOut), transform: `scale(${0.96 + chatIn * 0.04})` }}>
        <Chat withdrawn={withdrawn} />
      </div>
      <div style={{ opacity: need }}>
        <Rays cx={960} cy={440} progress={rays} count={140} />
        <GlowWord text="需要" y={440} size={170} />
      </div>

      <Sfx name="glint" at={cues[0] + 4} volume={0.25} />
      <Sfx name="whoosh" at={cues[1] - 22} volume={0.3} />
      <Sfx name="glint" at={cues[1] + 4} volume={0.25} />
      <Sfx name="whoosh" at={cues[1] + Math.round((cues[2] - cues[1]) * 0.55)} volume={0.2} />
      <Sfx name="boom" at={cues[2] + 2} volume={0.5} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </Frame>
  );
};
