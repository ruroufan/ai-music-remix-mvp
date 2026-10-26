// 《ESTJ · 标准》— 背光观察室 · 16种MBTI系列 No.11（守护者组 SJ）
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). 【】 highlights; 【【】】 marks the
// phrase in a line most likely to land with the viewer (components/Kinetic.tsx).
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  { id: "series", lines: [{ text: "16种MBTI系列之守护者组（SJ）ESTJ", seconds: 3.5 }] }, // the series card, no subtitle
  {
    id: "hook",
    lines: [
      { text: "为什么ESTJ总觉得\n【【“按我说的做就对了”】】？", seconds: 5 },
      { text: "这，是“总经理”ESTJ最深的困境——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "标准", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "英国哲学家密尔\n在《论自由》里写过：", seconds: 3.5 },
      { text: "即使全人类只有一个人持不同意见，\n人类也没有理由让他沉默。", seconds: 6 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对ESTJ的认知。" },
      { text: "我们通常以为，\nESTJ控制欲强、爱管人。", seconds: 3.5 },
      { text: "可ESTJ的出发点往往是【【好的】】：\n他们真心相信，自己的方法能让所有人少走弯路。", seconds: 6 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么孩子选专业，\n你一定要【【替他把关】】？", seconds: 4 },
      { text: "为什么同事用自己的方法做事，\n你【【看着就难受】】？", seconds: 4.5 },
      { text: "为什么伴侣洗碗的顺序不对，\n你也【【忍不住要纠正】】？", seconds: 4.5 },
    ],
  },
  {
    id: "mill",
    lines: [
      { text: "密尔说，一个人按自己的方式生活，不是因为这种方式最好，\n而是因为【【这是他自己的方式】】。", seconds: 7 },
      { text: "人不是机器，\n照着一个模子造出来就行；", seconds: 4 },
      { text: "人更像一棵树，需要凭自己的内在力量，\n【【向各个方向生长】】。", seconds: 5.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么总觉得\n按你说的做就对了？", seconds: 3.5 },
      { text: "因为在你眼里，【【正确的路只有一条】】，\n而你恰好知道它在哪里。", seconds: 5.5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你给的路也许是对的，\n可别人走的，就【【不再是自己的人生】】。", seconds: 5 },
      { text: "他们会越来越依赖你，\n或者【【越来越远离你】】。", seconds: 4.5 },
    ],
  },
  {
    id: "turn",
    lines: [{ text: "在密尔看来，一个社会真正的活力，\n来自允许每个人走自己的路，【【哪怕走错】】。", seconds: 6 }],
  },
  {
    id: "ending",
    lines: [
      { text: "放下那把尺子，\n让每个人【【用自己的方式活一次】】。", seconds: 4.5 },
      { text: "你守住的不是秩序，\n而是【【彼此的自由】】。", seconds: 4.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
