// 《控制欲》— 背光观察室 · 观察 No.19
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). 【】 highlights; 【【】】 marks the
// phrase in a line most likely to land with the viewer (components/Kinetic.tsx).
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  {
    id: "hook",
    lines: [
      { text: "为什么事情一不按计划走，\n我们就会【【慌】】？", seconds: 4.5 },
      { text: "这，是一种披着“靠谱”外衣的病——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "控制欲", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "古罗马哲学家爱比克泰德，\n在《手册》的第一句话就写道：" },
      { text: "有些事在我们的掌控之内，\n有些不在。", seconds: 5.5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对控制欲的认知。" },
      { text: "我们通常以为，\n控制欲强是因为能力强。" },
      { text: "可控制欲越强的人，\n往往【【内心越不安】】。", seconds: 4.5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么出门前要反复检查\n【【门有没有锁】】？", seconds: 4.5 },
      { text: "为什么旅行要把\n【【每一个小时都排满】】？", seconds: 4.5 },
      { text: "为什么伴侣晚回十分钟消息，\n我们就要【【问清楚他在干什么】】？", seconds: 5 },
    ],
  },
  {
    id: "epictetus",
    lines: [
      { text: "爱比克泰德出身奴隶，\n人生几乎没有一样东西由自己决定。", seconds: 5 },
      { text: "正是在这样的处境里，\n他想明白了一件事：", seconds: 3.5 },
      { text: "我们能掌控的，只有自己的\n【【判断、选择和行动】】；", seconds: 4.5 },
      { text: "别人的想法、天气、结果、命运，\n【【都不在我们手里】】。", seconds: 5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么事情\n一不按计划走，我们就慌？" },
      { text: "因为我们把不在掌控之内的东西，\n当成了【【自己的责任】】。", seconds: 5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你想抓住的东西越多，\n手就攥得越紧，【【心就越累】】。", seconds: 5 },
      { text: "世界不会按你的计划转，\n你只会【【越来越焦虑】】。", seconds: 4.5 },
    ],
  },
  {
    id: "root",
    lines: [{ text: "在爱比克泰德看来，痛苦的根源，\n就是想控制【【本不属于自己的东西】】。", seconds: 5.5 }],
  },
  {
    id: "ending",
    lines: [
      { text: "做好你能做的，\n【【剩下的交给世界】】。", seconds: 4 },
      { text: "学会放手，\n你才真正【【握住了自己】】。", seconds: 4.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
