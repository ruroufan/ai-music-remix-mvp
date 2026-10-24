// 《年龄焦虑》— 背光观察室 · 观察 No.11
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). 【】 highlights; 【【】】 marks the
// phrase in a line most likely to land with the viewer — it arrives last,
// bigger and in gold (see components/Kinetic.tsx).
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  {
    id: "hook",
    lines: [
      { text: "为什么才二十五岁，\n我们就开始【【害怕变老】】？", seconds: 4 },
      { text: "这，是一种越来越早到来的病——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "年龄焦虑", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "德国哲学家海德格尔有一个著名的概念：" },
      { text: "向死而生。", seconds: 4 }, // shown as a title card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对衰老的认知。" },
      { text: "我们通常以为，\n意识到时间有限是一件悲观的事。" },
      { text: "可海德格尔说，人恰恰是因为【有限】，\n才能【【真正地活】】。", seconds: 4.5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么看到同龄人结婚买房，\n我们就【【开始慌】】？", seconds: 4 },
      { text: "为什么过一次生日，\n就像被【【宣判】】了一次？", seconds: 4 },
      { text: "为什么那张“30岁前必须做完的10件事”，\n我们【【一条一条】】地对照？", seconds: 4.5 },
    ],
  },
  {
    id: "they",
    lines: [
      { text: "海德格尔说，大多数人活在“常人”之中：\n别人怎么活，我就怎么活。", seconds: 5 },
      { text: "别人几岁结婚、几岁买房、几岁升职，\n我就照着【同一张时间表】走。", seconds: 4.5 },
      { text: "我们怕的往往不是时间本身，\n而是【【落后于】】那张别人写好的时间表。", seconds: 5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么才二十五岁就害怕变老？" },
      { text: "因为我们不怕时间流逝，\n怕的是时间【【白白流逝】】。", seconds: 4.5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你忙着追别人的进度，\n就没有时间问【【自己想要什么】】。", seconds: 4.5 },
      { text: "焦虑会让你跑得更快，\n却不会告诉你【【方向】】。", seconds: 4.5 },
    ],
  },
  {
    id: "own",
    lines: [
      { text: "在海德格尔看来，只有正视自己的【有限】，\n人才会从“常人”里走出来，", seconds: 5 },
      { text: "去过【【只属于自己的一生】】。", seconds: 4 },
    ],
  },
  {
    id: "ending",
    lines: [
      { text: "时间不会因为你焦虑而变慢。", seconds: 3.5 },
      { text: "正因为它有限，\n才更要用来【【活成你自己】】。", seconds: 5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
