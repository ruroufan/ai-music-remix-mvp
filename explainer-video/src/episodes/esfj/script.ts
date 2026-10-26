// 《ESFJ · 被喜欢》— 背光观察室 · 16种MBTI系列 No.12（守护者组 SJ）
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). 【】 highlights; 【【】】 marks the
// phrase in a line most likely to land with the viewer (components/Kinetic.tsx).
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  { id: "series", lines: [{ text: "16种MBTI系列之守护者组（SJ）ESFJ", seconds: 3.5 }] }, // the series card, no subtitle
  {
    id: "hook",
    lines: [
      { text: "为什么ESFJ那么在意\n【【别人怎么看自己】】？", seconds: 5 },
      { text: "这，是“执政官”ESFJ最深的困境——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "被喜欢", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "英国思想家亚当·斯密\n在《道德情操论》里写过：", seconds: 3.5 },
      { text: "人天生不仅渴望被爱，\n还渴望值得被爱。", seconds: 5.5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对ESFJ的认知。" },
      { text: "我们通常以为，ESFJ在意别人的看法，\n是因为虚荣。", seconds: 4 },
      { text: "可ESFJ在意的其实是【【关系本身】】：\n大家好，自己才好。", seconds: 5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么群里有人不说话，\n你会担心是不是【【自己说错了什么】】？", seconds: 4.5 },
      { text: "为什么聚会结束后，\n你要回想【【每个人有没有玩得开心】】？", seconds: 4.5 },
      { text: "为什么一个人对你冷淡，你会【【难过好几天】】，\n哪怕你根本不了解他？", seconds: 5 },
    ],
  },
  {
    id: "smith",
    lines: [
      { text: "亚当·斯密说，每个人心里都住着一个\n【【“公正的旁观者”】】。", seconds: 4.5 },
      { text: "别人的称赞让我们开心；但真正让我们安心的，\n是那个旁观者也点了头：我配得上这份称赞。", seconds: 7 },
      { text: "被爱，和值得被爱，\n【【是两回事】】。", seconds: 3.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么那么在意\n别人怎么看？", seconds: 3.5 },
      { text: "因为你把心里那个旁观者，交给了身边的每一个人，\n而【【不是留给自己】】。", seconds: 6 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "外面的声音太多，\n你【【永远不可能让所有人满意】】。", seconds: 4.5 },
      { text: "你越想被每一个人喜欢，\n就越【【听不见自己心里的那个声音】】。", seconds: 5 },
    ],
  },
  {
    id: "turn",
    lines: [{ text: "亚当·斯密说，智慧的人想要的不只是称赞，\n更是【【值得被称赞】】。", seconds: 5.5 }],
  },
  {
    id: "ending",
    lines: [
      { text: "别人的喜欢会来也会走。", seconds: 3.5 },
      { text: "当你心里的那个旁观者点了头，\n你就知道【【自己值得】】。", seconds: 5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
