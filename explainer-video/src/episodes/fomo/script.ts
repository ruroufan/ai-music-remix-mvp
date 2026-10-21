// 《信息焦虑》— 背光观察室 · 观察 No.22
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
      { text: "为什么一会儿不看手机，\n我们就【【怕错过什么】】？", seconds: 4.5 },
      { text: "这，是一种连名字都很新的病——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "信息焦虑", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "两千年前，塞涅卡\n在写给朋友的信里说：", seconds: 4 },
      { text: "处处都在的人，\n哪里都不在。", seconds: 5.5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对信息焦虑的认知。" },
      { text: "我们通常以为，看得越多，\n知道得越多，就越不会落后。", seconds: 5 },
      { text: "可信息焦虑的人，\n【【看得越多反而越慌】】。", seconds: 4.5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么【【吃饭时】】\n也要开着视频？", seconds: 4 },
      { text: "为什么一觉醒来，第一件事\n是看【【有没有错过什么】】？", seconds: 4.5 },
      { text: "为什么收藏了几百篇“必读干货”，\n却【【一篇都没读完】】？", seconds: 5 },
    ],
  },
  {
    id: "seneca",
    lines: [
      { text: "塞涅卡那封信说的其实是读书。", seconds: 3.5 },
      { text: "今天读这本，明天读那本，\n就像一个总在旅行的人，", seconds: 4.5 },
      { text: "到处都有熟人，\n却【【没有一个朋友】】。", seconds: 4 },
      { text: "就像吃下去的东西还没消化就吐掉，\n【【不会给身体带来任何营养】】。", seconds: 5.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么一会儿不看手机，\n就怕错过？", seconds: 4 },
      { text: "因为我们以为，世界上正在发生的\n【【每一件事都和自己有关】】。", seconds: 5.5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你知道了全世界的新闻，却记不清\n【【今天晚饭是什么味道】】。", seconds: 5 },
      { text: "你一直在别处，\n就【【一直不在这里】】。", seconds: 4 },
    ],
  },
  {
    id: "turn",
    lines: [{ text: "我们怕错过世界，\n却一直在【【错过眼前】】。", seconds: 4.5 }],
  },
  {
    id: "ending",
    lines: [
      { text: "放下手机，好好吃一顿饭，\n【【听完一个人说的话】】。", seconds: 4.5 },
      { text: "所谓活着，\n不过是此时此刻的【【在场】】。", seconds: 4.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
