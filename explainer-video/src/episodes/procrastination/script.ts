// 《拖延》— 背光观察室 · 观察 No.08
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). Text in 【】 is highlighted.
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  {
    id: "hook",
    lines: [
      { text: "为什么越重要的事，\n我们越要拖到最后一刻？" },
      { text: "这，是每个人都犯过的病——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "拖延", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "两千年前，罗马哲学家塞涅卡写过：" },
      { text: "生活最大的障碍是期待，\n它寄望于明天，却失去了今天。", seconds: 5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对拖延的认知。" },
      { text: "我们通常以为，拖延就是懒。" },
      { text: "可懒的人什么都不想，\n拖延的人却一直【惦记】着那件事。", seconds: 4.5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么报告下周交，\n这周却把房间收拾得一尘不染？", seconds: 4.5 },
      { text: "为什么说好明天开始健身，\n明天又变成了下周一？", seconds: 4.5 },
      { text: "为什么到了截止前一晚，\n我们才突然效率惊人？", seconds: 4 },
    ],
  },
  {
    id: "free",
    lines: [
      { text: "塞涅卡说，人们对待时间，\n就像对待一样不花钱的东西。", seconds: 4.5 },
      { text: "钱被借走会心疼，\n时间被拿走却毫无知觉。", seconds: 4 },
      { text: "我们总以为，\n明天还有一整个自己可以用。", seconds: 4 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么越重要的事，\n越要拖到最后？" },
      { text: "因为越重要，就越怕做不好。", seconds: 3.5 },
      { text: "只要不开始，就永远不用面对\n“我只能做到这样”。", seconds: 4.5 },
      { text: "拖延保护的，\n是一个想象中【更好的自己】。", seconds: 4.5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "debt",
    lines: [
      { text: "明天的你不会更勇敢，只会更着急。", seconds: 3.5 },
      { text: "你把今天抵押给明天，\n明天又抵押给后天，", seconds: 4 },
      { text: "最后拿来还债的，\n是你的【整个人生】。", seconds: 4 },
    ],
  },
  { id: "quote", lines: [{ text: "塞涅卡说：\n不是生命太短，是我们浪费得太多。", seconds: 5 }] }, // shown as a quote card
  {
    id: "ending",
    lines: [
      { text: "最好的时机从来不在明天。", seconds: 3.5 },
      { text: "现在开始的这一分钟，\n才真正属于【今天】。", seconds: 4.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
