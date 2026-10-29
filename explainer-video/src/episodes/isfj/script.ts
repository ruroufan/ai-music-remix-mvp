// 《ISFJ · 忍》— 背光观察室 · 16种MBTI系列 No.10（守护者组 SJ）
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). 【】 highlights; 【【】】 marks the
// phrase in a line most likely to land with the viewer (components/Kinetic.tsx).
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  { id: "series", lines: [{ text: "16种MBTI系列之守护者组（SJ）ISFJ", seconds: 3.5 }] }, // the series card, no subtitle
  {
    id: "hook",
    lines: [
      { text: "为什么ISFJ总说“没关系”，\n心里却【【很有关系】】？", seconds: 5 },
      { text: "这，是“守卫者”ISFJ最深的困境——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "忍", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "德国哲学家尼采\n提出过一个概念：怨恨。", seconds: 3.5 },
      { text: "当一个人无法用行动回应，\n那些被压下去的情绪，就会在心里慢慢发酵。", seconds: 6.5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对ISFJ的认知。" },
      { text: "我们通常以为，\nISFJ脾气好、不计较。", seconds: 3.5 },
      { text: "可ISFJ不是不计较，\n是把计较都【【咽了下去】】。", seconds: 4.5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么同事把活推给你，\n你说【【“没事我来”】】？", seconds: 4 },
      { text: "为什么家人忘了你的生日，\n你笑着说【【“不重要”】】？", seconds: 4.5 },
      { text: "为什么被人误会了，你宁愿自己委屈，\n也【【不肯解释一句】】？", seconds: 5 },
    ],
  },
  {
    id: "nietzsche",
    lines: [
      { text: "尼采说，如果一个人能直接回应，\n情绪来了也就过去了；", seconds: 4.5 },
      { text: "可如果它被压下去，就不会消失，而是转向内心，\n一遍遍反刍、积攒，", seconds: 5.5 },
      { text: "最后变成一种\n【【说不出口的苦】】。", seconds: 3.5 },
      { text: "每一个咽下去的“没关系”都没有消失，\n只是【【被存了起来】】。", seconds: 5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么嘴上说没关系，\n心里却很有关系？", seconds: 3.5 },
      { text: "因为你不是真的不在意，\n而是【【不敢在意】】。", seconds: 4 },
      { text: "你怕说出来会伤了和气，\n会让别人不舒服。", seconds: 4 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "攒下的委屈不会自己消失。它会在某一天，\n因为一件很小的事【【突然爆发】】，连你自己都吓一跳；", seconds: 7 },
      { text: "或者一点点变成疲惫，\n让你对所有人都【【淡了下来】】。", seconds: 4.5 },
    ],
  },
  {
    id: "turn",
    lines: [{ text: "真正的温柔，不是一直退让，\n而是让别人知道【【你的边界在哪里】】。", seconds: 5.5 }],
  },
  {
    id: "ending",
    lines: [
      { text: "下一次，试着把那句“没关系”\n【【换成真话】】。", seconds: 4.5 },
      { text: "说出有关系，\n关系才能【【真正长久】】。", seconds: 4.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
