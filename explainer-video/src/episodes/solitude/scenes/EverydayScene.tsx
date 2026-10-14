import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Crowd, HERO, Person } from "../porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const CONTACTS = ["阿杰", "安安", "包子", "陈经理", "大学室友", "刁老师", "房东", "健身教练", "快递小哥", "老张", "李医生", "刘姐", "妈妈", "前同事", "球友", "物业", "小林", "小周", "表哥", "装修师傅", "Amy", "Kevin"];
const GROUP = ["哈哈哈哈哈", "笑死我了", "周末走起！", "+1", "+1", "谁带零食", "我我我", "哈哈哈", "冲！", "在路上了"];

// 1 · the party, loud — then a hard cut to the empty street on the way home.
// 2 · a contact list hundreds long, scrolling at 2 a.m.; nobody gets picked.
// 3 · a busy group chat; you type a real sentence, delete it, send a sticker.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const seg = (i: number) => frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]);
  const segIn = (i: number) => interpolate(frame, [cues[i], cues[i] + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // 1
  const cut = cues[0] + 4 * BEAT;
  const walk = interpolate(frame, [cut, cues[1]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 2
  const t2 = frame - cues[1];
  const scroll = interpolate(t2, [0, 6 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - (1 - t) ** 3 });
  // 3
  const t3 = frame - cues[2];
  const msgs = Math.max(0, Math.min(GROUP.length, Math.floor(t3 / HALF_BEAT) + 1));
  const DRAFT = "其实我最近有点……";
  const typeStart = 5 * BEAT;
  const typed = t3 < typeStart ? 0 : t3 < typeStart + 2 * BEAT ? Math.floor((t3 - typeStart) / 3) : Math.max(0, DRAFT.length - Math.floor((t3 - typeStart - 2 * BEAT) / 2));
  const sentAt = typeStart + 4 * BEAT;
  const sent = t3 >= sentAt;

  return (
    <ObsFrame duration={duration}>
      {seg(0) && frame < cut && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(0) }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 40%, rgba(255,120,180,${0.12 + 0.08 * Math.sin(frame / 3)}), transparent 60%)` }} />
          <Crowd frame={frame} chatter={1} beat={HALF_BEAT} />
          <Person x={HERO.x} bottom={HERO.bottom} height={HERO.height} pose="proud" glow={1} />
          <div style={{ position: "absolute", left: HERO.x + 30, top: HERO.bottom - 330, padding: "8px 18px", borderRadius: 16, background: palette.accent, color: "#06080c", fontSize: 40, fontWeight: 900, transform: `scale(${1 + 0.08 * Math.sin((frame / BEAT) * Math.PI * 2)})` }}>哈哈哈哈哈！</div>
          {Array.from({ length: 40 }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: random(`cf-${i}`) * 1920, top: ((random(`cy-${i}`) * 900 + frame * (3 + random(`cs-${i}`) * 4)) % 900) + 100, width: 10, height: 5, background: ["#ffd166", "#3fe0cf", "#ff4d6d", "#e8eef2"][i % 4], transform: `rotate(${frame * 9 + i * 40}deg)`, opacity: 0.7 }} />
          ))}
        </div>
      )}
      {seg(0) && frame >= cut && (
        <div style={{ position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", left: 0, top: 760, width: 1920, height: 320, background: "#090c12", borderTop: `1px solid ${palette.faint}` }} />
          {[300, 800, 1300, 1800].map((x, i) => (
            <React.Fragment key={x}>
              <div style={{ position: "absolute", left: x, top: 300, width: 6, height: 460, background: "#1e2632" }} />
              <div style={{ position: "absolute", left: x - 90, top: 290, width: 190, height: 470, background: `radial-gradient(ellipse at 50% 0%, rgba(${palette.halo},0.22), transparent 70%)` }} />
              <div style={{ position: "absolute", left: x - 14, top: 290, width: 34, height: 10, borderRadius: 4, background: `rgb(${palette.halo})`, opacity: 0.8 + 0.2 * Math.sin(frame + i) }} />
            </React.Fragment>
          ))}
          <Person x={420 + walk * 900} bottom={760} height={200} pose="hunch" glow={0.35} />
          <div style={{ position: "absolute", right: 200, top: 170, fontFamily: fonts.mono, fontSize: 56, color: palette.dim }}>00:47</div>
          <div style={{ position: "absolute", right: 200, top: 240, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 6, color: palette.dim }}>散场 · 回家的路</div>
        </div>
      )}

      {seg(1) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(1) }}>
          <div style={{ position: "absolute", left: 960 - 210, top: 120, width: 420, height: 680, borderRadius: 36, background: "#0b0f16", border: `2px solid ${palette.faint}`, overflow: "hidden" }}>
            <div style={{ padding: "26px 28px 10px", fontSize: 30, fontWeight: 700, display: "flex", justifyContent: "space-between" }}>
              通讯录 <span style={{ fontFamily: fonts.mono, fontSize: 20, color: palette.dim, marginTop: 8 }}>386 位联系人</span>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 90, transform: `translateY(${-scroll * 2400}px)` }}>
              {Array.from({ length: 60 }, (_, i) => {
                const name = CONTACTS[(i * 7) % CONTACTS.length];
                return (
                  <div key={i} style={{ height: 66, display: "flex", alignItems: "center", gap: 18, padding: "0 28px", borderBottom: `1px solid ${palette.faint}`, fontSize: 28 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 21, background: `hsl(${(i * 47) % 360} 25% 30%)` }} />
                    {name}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ position: "absolute", left: 220, top: 380, fontFamily: fonts.mono, fontSize: 72, color: palette.alert }}>02:13</div>
          <div style={{ position: "absolute", left: 1360, top: 410, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: scroll > 0.98 ? 1 : 0 }}>拨号：— — —</div>
        </div>
      )}

      {seg(2) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(2) }}>
          <div style={{ position: "absolute", left: 960 - 330, top: 110, width: 660, height: 700, borderRadius: 24, background: "#0b0f16", border: `2px solid ${palette.faint}`, overflow: "hidden" }}>
            <div style={{ padding: "20px 26px", fontSize: 28, fontWeight: 700, borderBottom: `1px solid ${palette.faint}` }}>
              相亲相爱一家人（128） <span style={{ float: "right", fontFamily: fonts.mono, fontSize: 18, color: palette.alert, marginTop: 8 }}>99+</span>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 110, display: "flex", flexDirection: "column", gap: 12, padding: "0 26px" }}>
              {GROUP.slice(0, msgs).map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: `hsl(${(i * 67) % 360} 30% 34%)` }} />
                  <div style={{ padding: "8px 16px", borderRadius: 12, background: "#1c2330", fontSize: 26 }}>{m}</div>
                </div>
              ))}
              {sent && (
                <div style={{ alignSelf: "flex-end", width: 110, height: 110, borderRadius: 16, background: "#ffd166", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${Math.min(1, (t3 - sentAt) / 4)})` }}>
                  <svg width={80} height={80} viewBox="-40 -40 80 80">
                    <circle r={34} fill="#ffe8a3" stroke="#3a2608" strokeWidth={3} />
                    <path d="M-16 -6 q4 -6 8 0 M8 -6 q4 -6 8 0" fill="none" stroke="#3a2608" strokeWidth={3} strokeLinecap="round" />
                    <path d="M-14 10 q14 14 28 0" fill="none" stroke="#3a2608" strokeWidth={3} strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
            <div style={{ position: "absolute", left: 20, right: 20, bottom: 20, height: 64, borderRadius: 12, background: "#151b25", border: `1px solid ${typed ? palette.accent : palette.faint}`, padding: "0 18px", display: "flex", alignItems: "center", fontSize: 28, color: palette.ink }}>
              {DRAFT.slice(0, typed)}
              <span style={{ width: 3, height: 32, marginLeft: 4, background: palette.accent, opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }} />
            </div>
          </div>
          {sent && <div style={{ position: "absolute", left: 1330, top: 600, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim }}>[表情] 已发送</div>}
        </div>
      )}

      {[0, 1, 2, 3].map((k) => (
        <Sfx key={k} name="glint" at={k * BEAT} volume={0.15} />
      ))}
      <Sfx name="whoosh" at={cut} volume={0.4} />
      <Sfx name="step" at={cut + BEAT} volume={0.35} />
      <Sfx name="step" at={cut + 2 * BEAT} volume={0.3} />
      <Sfx name="step" at={cut + 3 * BEAT} volume={0.25} />
      <Sfx name="whoosh" at={cues[1]} volume={0.3} />
      {Array.from({ length: GROUP.length }, (_, k) => (
        <Sfx key={`m${k}`} name="shutter" at={cues[2] + k * HALF_BEAT} volume={0.12} />
      ))}
      <Sfx name="glitch" at={cues[2] + typeStart + 2 * BEAT} volume={0.25} />
      <Sfx name="stamp" at={cues[2] + sentAt} volume={0.4} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
