// 《谦虚》— 背光观察室 · 观察 No.07
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). Text in 【】 is highlighted.
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  {
    id: "hook",
    lines: [
      { text: "为什么有的人越谦虚，\n你越不舒服？" },
      { text: "这，是傲慢最高级的形态——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "伪装的谦虚", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "法国作家拉罗什福科一生只写格言，\n被称为“人性的解剖师”。", seconds: 4.5 },
      { text: "他说：谦虚常常只是一种假装的顺从，\n用来让别人臣服；", seconds: 4.5 }, // shown as a quote card
      { text: "它是骄傲的计谋，\n放低自己，是为了抬高自己。", seconds: 4.5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对谦虚的认知。" },
      { text: "我们通常以为，\n谦虚的反面是骄傲。" },
      { text: "可拉罗什福科说，\n很多谦虚，本身就是【骄傲】。", seconds: 4 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么考了满分的同学说“这次全靠运气”，\n你反而更难受？", seconds: 4.5 },
      { text: "为什么有人一边说“我随便弄弄”，\n一边等着你夸？", seconds: 4 },
      { text: "为什么被夸的时候，\n我们会下意识地说“哪里哪里”？", seconds: 4 },
    ],
  },
  {
    id: "twice",
    lines: [
      { text: "拉罗什福科还有一句更刻薄的：" },
      { text: "拒绝赞美，\n是希望被赞美【两次】。", seconds: 4.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么有人越谦虚，\n你越不舒服？" },
      { text: "因为你感觉到了：那份谦虚不是给你的，\n是给他自己的。", seconds: 4.5 },
      { text: "它在等一个【回应】。", seconds: 3 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "tired",
    lines: [
      { text: "伪装的谦虚比直接的骄傲更累。", seconds: 3.5 },
      { text: "你要贬低自己，\n还要确认别人没有当真。", seconds: 4 },
    ],
  },
  {
    id: "scale",
    lines: [
      { text: "真正的谦虚，不是说自己不好，\n而是根本不需要把自己放上【天平】。", seconds: 5.5 },
      { text: "被夸了，说一句“谢谢”就够了。", seconds: 3.5 },
    ],
  },
  {
    id: "ending",
    lines: [
      { text: "当你不再等别人看穿你的谦虚，\n你才真正放下了那层伪装。", seconds: 5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
