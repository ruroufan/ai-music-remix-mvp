// 《ENTJ · 赢》— 背光观察室 · 16种MBTI系列 No.03（分析家组 NT）
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). 【】 highlights; 【【】】 marks the
// phrase in a line most likely to land with the viewer (components/Kinetic.tsx).
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  { id: "series", lines: [{ text: "16种MBTI系列之分析家组（NT）ENTJ", seconds: 3.5 }] }, // the series card, no subtitle
  {
    id: "hook",
    lines: [
      { text: "为什么ENTJ赢了所有人，\n却总觉得【【身边没人】】？", seconds: 4.5 },
      { text: "这，是“指挥官”ENTJ最深的困境——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "赢", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "德国哲学家黑格尔\n讲过一个著名的故事：", seconds: 4 },
      { text: "主人与奴隶。", seconds: 5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对ENTJ的认知。" },
      { text: "我们通常以为，\nENTJ要的是权力和结果。" },
      { text: "可ENTJ真正想要的，\n其实是【【被承认】】。", seconds: 4.5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么项目做成了，团队里\n却【【没有一个人想和你庆祝】】？", seconds: 5.5 },
      { text: "为什么你说一不二，\n家里却【【越来越安静】】？", seconds: 4.5 },
      { text: "为什么你站上了最高处，却找不到\n【【一个能说真话的人】】？", seconds: 5.5 },
    ],
  },
  {
    id: "hegel",
    lines: [
      { text: "黑格尔说，两个人相遇，\n都想得到对方的【承认】，", seconds: 4.5 },
      { text: "于是展开一场斗争。\n赢的人成了主人，输的人成了奴隶。", seconds: 5 },
      { text: "可主人很快发现：承认他的，\n是一个【【被他压服的人】】。", seconds: 5 },
      { text: "奴隶的服从\n并不是真正的承认。", seconds: 3.5 },
      { text: "主人赢了一切，\n却得不到他【【最想要的东西】】。", seconds: 4.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么赢了所有人，\n却总觉得身边没人？", seconds: 4 },
      { text: "因为你想要的是【【被尊重】】，\n得到的却只是被服从。", seconds: 5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你越强，\n身边的人就【【越小心】】；", seconds: 3.5 },
      { text: "你赢得越多，\n听到的【【真话就越少】】。", seconds: 3.5 },
      { text: "最后你站在一群点头的人中间，\n【【没有一个人真正看着你】】。", seconds: 5 },
    ],
  },
  {
    id: "equal",
    lines: [{ text: "在黑格尔看来，真正的承认，\n只能来自一个【【和你平等的人】】。", seconds: 5 }],
  },
  {
    id: "ending",
    lines: [
      { text: "放下一次输赢，\n让别人有机会【【站到你身边】】。", seconds: 4.5 },
      { text: "被平等相待的那一刻，\n你才【【第一次被承认】】。", seconds: 4.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
