// 《ISFP · 回避》— 背光观察室 · 16种MBTI系列 No.14（探险家组 SP）
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). 【】 highlights; 【【】】 marks the
// phrase in a line most likely to land with the viewer (components/Kinetic.tsx).
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  { id: "series", lines: [{ text: "16种MBTI系列之探险家组（SP）ISFP", seconds: 3.5 }] }, // the series card, no subtitle
  {
    id: "hook",
    lines: [
      { text: "为什么ISFP那么温柔，\n却总是【【一声不响地离开】】？", seconds: 6 },
      { text: "这，是“探险家”ISFP最深的困境——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "回避", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "哲学家马丁·布伯在《我与你》里\n写过：", seconds: 3 },
      { text: "一切真实的生活，\n都是相遇。", seconds: 5.5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对ISFP的认知。" },
      { text: "我们通常以为，\nISFP温和随性，和谁都处得来。", seconds: 4 },
      { text: "可ISFP的随和背后，\n往往藏着【【一个随时准备离开的自己】】。", seconds: 6 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么一段关系里有了摩擦，\n你不吵，只是【【慢慢不回消息】】？", seconds: 5 },
      { text: "为什么不喜欢一份工作，你不说，\n只是某天【【突然递了辞职信】】？", seconds: 5 },
      { text: "为什么别人问你“你到底怎么了”，\n你只说【【“没什么”】】？", seconds: 5 },
    ],
  },
  {
    id: "buber",
    lines: [
      { text: "布伯说，人和人之间\n有两种关系：", seconds: 3 },
      { text: "一种是“我与它”，把对方当成一个对象，\n保持距离，【各自安好】；", seconds: 6 },
      { text: "另一种是“我与你”，全然地面对对方，\n也【【让对方面对你】】。", seconds: 6 },
      { text: "只有在后一种关系里，\n人才【【真正相遇】】。", seconds: 4.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么那么温柔，\n却总是一声不响地离开？", seconds: 3.5 },
      { text: "因为冲突会逼你走进“我与你”，\n而离开，只需要【退回“我与它”】。", seconds: 6 },
      { text: "你保护了自己的边界，\n也【【错过了真正的相遇】】。", seconds: 5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你走过很多地方，见过很多人，\n却【【很少有人真正认识你】】。", seconds: 5.5 },
      { text: "离开总是轻的，\n可【【留下来的遗憾很重】】。", seconds: 5 },
    ],
  },
  {
    id: "turn",
    lines: [{ text: "布伯说，人是通过“你”，\n才【【成为“我”】】的。", seconds: 5 }],
  },
  {
    id: "ending",
    lines: [
      { text: "下一次想离开的时候，\n试着【【先留下来，说一句真话】】。", seconds: 6 },
      { text: "那一刻，\n才是【【真正的相遇】】。", seconds: 4.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
