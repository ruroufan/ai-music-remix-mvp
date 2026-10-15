// 《怀旧》— 背光观察室 · 观察 No.10
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). Text in 【】 is highlighted.
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  {
    id: "hook",
    lines: [
      { text: "为什么我们总觉得，\n以前更好？" },
      { text: "这，是一种温柔的病——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "怀旧", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "丹麦哲学家克尔凯郭尔在日记里写过：" },
      { text: "人生只能向后理解，\n却必须向前生活。", seconds: 4.5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对怀旧的认知。" },
      { text: "我们通常以为，\n怀旧是因为过去真的更好。" },
      { text: "可我们怀念的往往不是过去，\n而是被记忆【修饰过】的过去。", seconds: 4.5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么一首老歌，\n能让我们突然红了眼？", seconds: 4 },
      { text: "为什么学生时代天天喊累，\n现在却说那是最好的时光？", seconds: 4.5 },
      { text: "为什么回到老家的街道，\n连那家难吃的小店都觉得亲切？", seconds: 4.5 },
    ],
  },
  {
    id: "ended",
    lines: [
      { text: "过去之所以美好，\n是因为它已经结束了。" },
      { text: "结局已定，我们终于能看懂它；\n而当下还在发生，充满了未知和不安。", seconds: 5.5 },
      { text: "回头看清清楚楚，\n往前看却一片模糊。", seconds: 4 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么总觉得以前更好？" },
      { text: "因为那时候一切还没有被定义。", seconds: 3.5 },
      { text: "我们怀念的，\n是那个还有【无数可能】的自己。", seconds: 4.5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你一直回头，\n就会错过正在发生的此刻。", seconds: 4 },
      { text: "而十年后，你最怀念的，\n恰恰会是今天这个你毫不在意的日子。", seconds: 5.5 },
    ],
  },
  { id: "quote", lines: [{ text: "克尔凯郭尔说，人生只能向后理解，\n却必须向前生活。", seconds: 5 }] }, // quote card
  {
    id: "ending",
    lines: [
      { text: "可以回头看，但别停在那里。", seconds: 3.5 },
      { text: "现在的每一天，\n都是未来的旧时光。", seconds: 4 },
      { text: "所以，请继续【向前】。", seconds: 3.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
