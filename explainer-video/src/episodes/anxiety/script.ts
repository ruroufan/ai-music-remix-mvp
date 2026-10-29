// 《焦虑》— 背光观察室 · 观察 No.04
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). Text in 【】 is highlighted.
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  {
    id: "hook",
    lines: [
      { text: "为什么选择越多，\n我们越不敢选？" },
      { text: "这，是现代人最熟悉的情绪——" },
    ],
  },
  { id: "title", lines: [{ text: "焦虑", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "丹麦哲学家克尔凯郭尔，\n给出过关于焦虑最著名的诊断：" },
      { text: "焦虑，是自由的眩晕。", seconds: 4 }, // shown as a big quote
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对焦虑的认知。" },
      { text: "我们通常以为，\n焦虑是因为没得选。" },
      { text: "可克尔凯郭尔说恰恰相反：\n焦虑，是因为你【可以选】。", seconds: 4 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么外卖软件翻了二十分钟，\n最后还是点了常吃的那家？", seconds: 4 },
      { text: "为什么机会摆在面前，\n我们却一夜一夜睡不着？" },
      { text: "为什么明明可以辞职，\n递辞呈的手却在抖？" },
    ],
  },
  {
    id: "cliff",
    lines: [
      { text: "克尔凯郭尔打过一个比方：" },
      { text: "一个人站在悬崖边往下看，会头晕。", seconds: 3.5 },
      { text: "让他头晕的不只是深渊，\n还有他自己的眼睛，", seconds: 3.5 },
      { text: "因为他知道，只要愿意，\n他就可以跳下去。", seconds: 3.5 },
      { text: "焦虑，就是看见“一切皆有可能”时的\n那一阵【眩晕】。", seconds: 4 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么选择越多，越不敢选？" },
      { text: "因为每选一条路，\n就等于亲手放弃了其他所有的可能。", seconds: 4.5 },
      { text: "我们怕的不是选错，是【失去】。", seconds: 3.5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "edge",
    lines: [
      { text: "不选看起来很安全，\n其实你只是一直站在悬崖边。" },
      { text: "所有可能都还在，\n可你一步也没有走。", seconds: 4 },
    ],
  },
  {
    id: "quote",
    lines: [{ text: "克尔凯郭尔说，学会正确地焦虑，\n就是学会了最重要的事。", seconds: 4.5 }],
  },
  {
    id: "ending",
    lines: [
      { text: "眩晕不会消失。", seconds: 3 },
      { text: "可当你迈出第一步，\n脚下的才是真正的自由。", seconds: 6 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
