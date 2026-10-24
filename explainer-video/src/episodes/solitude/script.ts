// 《孤独》— 背光观察室 · 观察 No.06
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). Text in 【】 is highlighted.
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  {
    id: "hook",
    lines: [
      { text: "为什么人越多的地方，\n我们越觉得孤独？" },
      { text: "这，是这个时代最拥挤的情绪——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "孤独", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "叔本华讲过一个著名的寓言：" },
      { text: "豪猪困境。", seconds: 3.5 }, // shown as a big title card
    ],
  },
  {
    id: "fable",
    lines: [
      { text: "冬天，一群豪猪为了取暖挤在一起，\n却被彼此的刺扎痛；", seconds: 4.5 },
      { text: "分开，又冷得受不了。" },
      { text: "它们反复靠近、又反复退开，", seconds: 3.5 },
      { text: "最后找到一个\n不太冷、也不太痛的距离。", seconds: 4 },
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "我们通常以为，\n孤独是因为身边没人。" },
      { text: "可叔本华看到的是：\n孤独，常常发生在【挤在一起】的时候。", seconds: 4.5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么聚会上笑得最大声，\n散场的路上却最空？", seconds: 4 },
      { text: "为什么通讯录里几百个人，\n深夜想说句话却不知道找谁？", seconds: 4.5 },
      { text: "为什么群里热热闹闹，\n我们却只敢回一个表情包？", seconds: 4 },
    ],
  },
  {
    id: "crowd",
    lines: [
      { text: "因为在人群里，我们收起了自己的刺，\n也收起了自己。", seconds: 4.5 },
      { text: "合群的那个人在场，\n真正的你却【缺席】了。", seconds: 4 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么人越多越孤独？" },
      { text: "因为我们用陪伴逃避孤独，\n却在陪伴里丢了自己。", seconds: 4.5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "quote",
    lines: [
      { text: "你一刻也不敢一个人待着，\n就永远见不到自己。", seconds: 4 },
      { text: "叔本华说：\n人只有在独处时，才能成为自己；", seconds: 4 },
      { text: "谁不热爱独处，\n谁也就不热爱【自由】。", seconds: 4 },
    ],
  },
  {
    id: "solitude",
    lines: [
      { text: "孤独是被剩下，\n独处是自己选。", seconds: 3.5 },
      { text: "当你敢一个人吃饭、一个人散步、\n一个人待一整个下午，", seconds: 4.5 },
    ],
  },
  {
    id: "ending",
    lines: [
      { text: "你会发现，把你从孤独里救出来的，\n恰恰是【独处】。", seconds: 5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
