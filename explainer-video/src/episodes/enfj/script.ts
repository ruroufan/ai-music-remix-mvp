// 《ENFJ · 付出》— 背光观察室 · 16种MBTI系列 No.07（外交家组 NF）
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). 【】 highlights; 【【】】 marks the
// phrase in a line most likely to land with the viewer (components/Kinetic.tsx).
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  { id: "series", lines: [{ text: "16种MBTI系列之外交家组（NF）ENFJ", seconds: 3.5 }] }, // the series card, no subtitle
  {
    id: "hook",
    lines: [
      { text: "为什么ENFJ照顾了所有人，\n却【【没有人来照顾TA】】？", seconds: 5 },
      { text: "这，是“主人公”ENFJ最深的困境——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "付出", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "德国哲学家康德\n写过一条著名的道德律令：", seconds: 3.5 },
      { text: "永远把人，无论是你自己还是任何他人，\n当作目的，而不仅仅当作手段。", seconds: 7 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对ENFJ的认知。" },
      { text: "我们通常以为，\nENFJ的问题是太热心。", seconds: 3.5 },
      { text: "可ENFJ真正的盲点，藏在康德这句话的中间：\n【【无论是你自己】】。", seconds: 5.5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么聚会冷场，\n你总是【【第一个站出来活跃气氛】】？", seconds: 4.5 },
      { text: "为什么朋友深夜崩溃，你陪到天亮，\n自己累到发烧却【【不告诉任何人】】？", seconds: 5 },
      { text: "为什么别人问你“你还好吗”，\n你的第一反应是【【把话题转回对方】】？", seconds: 5 },
    ],
  },
  {
    id: "kant",
    lines: [
      { text: "ENFJ把每一个人都当作值得被关心的目的，\n唯独把自己当成了【【手段】】：", seconds: 5 },
      { text: "一个照顾别人的工具，\n一个让大家都好起来的方法。", seconds: 4 },
      { text: "你记得所有人的生日，\n却忘了【【自己也是一个人】】。", seconds: 4.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么照顾了所有人，\n却没人照顾你？", seconds: 3.5 },
      { text: "因为你从来没让别人看见，\n【【你也需要被照顾】】。", seconds: 4.5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你给出去的每一份温暖，\n都是【【从自己身上取的】】。", seconds: 4.5 },
      { text: "总有一天你会被掏空，\n还会【【怪自己不够好】】。", seconds: 4.5 },
    ],
  },
  {
    id: "turn",
    lines: [{ text: "在康德的道德律令里，\n“你自己”和“他人”【【写在同一行】】。", seconds: 5 }],
  },
  {
    id: "ending",
    lines: [
      { text: "照顾别人之前，\n先把自己【【放回那一行】】。", seconds: 4 },
      { text: "你也是目的，也值得被好好对待，\n【【包括被你自己】】。", seconds: 5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
