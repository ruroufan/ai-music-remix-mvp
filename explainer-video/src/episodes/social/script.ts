// 《社恐》— 背光观察室 · 观察 No.16
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
      { text: "为什么出门前演练了十遍对话，\n见了面还是【【想逃】】？", seconds: 4.5 },
      { text: "这，是年轻人最爱给自己贴的标签——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "社恐", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "心理学家吉洛维奇提出过\n一个著名的概念：【聚光灯效应】。" },
      { text: "我们总是【【高估别人对自己的关注】】。", seconds: 5 }, // shown as a card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对社恐的认知。" },
      { text: "我们通常以为，\n社恐是害怕别人。" },
      { text: "可社恐的人真正害怕的，\n是【【被看见】】。", seconds: 4 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么进电梯碰到熟人，\n我们宁愿【【假装看手机】】？", seconds: 4.5 },
      { text: "为什么开会想发言，\n话到嘴边又【【咽了回去】】？", seconds: 4.5 },
      { text: "为什么说错一个字，回家还要\n【【反复回想对方的表情】】？", seconds: 5 },
    ],
  },
  {
    id: "experiment",
    lines: [
      { text: "吉洛维奇做过一个实验：" },
      { text: "让大学生穿上一件印着过气歌星头像、\n有点尴尬的T恤，走进一间教室。", seconds: 5.5 },
      { text: "穿T恤的人以为，\n大约【一半的人】会注意到。", seconds: 4 },
      { text: "结果真正注意到的，\n只有【【四分之一左右】】。", seconds: 4.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么见了面还是想逃？" },
      { text: "因为我们以为头顶有一盏聚光灯，", seconds: 3.5 },
      { text: "每一个动作都会被放大、\n被审视、【【被记住】】。", seconds: 4.5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你在一场【【根本没人看的演出】】里，\n紧张了一辈子。", seconds: 5 },
      { text: "每个人都忙着担心自己，\n【【没有人在专心看你】】。", seconds: 4.5 },
    ],
  },
  {
    id: "relief",
    lines: [{ text: "这不是一个让人失落的事实，\n而是一种【【解脱】】。", seconds: 4.5 }],
  },
  {
    id: "ending",
    lines: [
      { text: "当你发现那盏灯\n从来没有打在你身上，", seconds: 4 },
      { text: "你才终于可以走出聚光灯，\n【【自在地走进人群】】。", seconds: 5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
