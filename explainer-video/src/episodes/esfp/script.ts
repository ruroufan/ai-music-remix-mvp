// 《ESFP · 热闹》— 背光观察室 · 16种MBTI系列 No.16（探险家组 SP）
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). 【】 highlights; 【【】】 marks the
// phrase in a line most likely to land with the viewer (components/Kinetic.tsx).
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  { id: "series", lines: [{ text: "16种MBTI系列之探险家组（SP）ESFP", seconds: 3.5 }] }, // the series card, no subtitle
  {
    id: "hook",
    lines: [
      { text: "为什么ESFP总是全场最快乐的人，\n散场后却【【最孤单】】？", seconds: 6 },
      { text: "这，是“表演者”ESFP最深的困境——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "热闹", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "古希腊哲学家伊壁鸠鲁是快乐主义的代表人物，\n可他说过：", seconds: 4 },
      { text: "在智慧为一生幸福所准备的一切之中，\n最重要的是友谊。", seconds: 6 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对ESFP的认知。" },
      { text: "我们通常以为，\nESFP最会享受快乐。", seconds: 3.5 },
      { text: "可伊壁鸠鲁说的快乐，和ESFP追逐的热闹，\n【【并不是一回事】】。", seconds: 5.5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么每次聚会你都是气氛担当，\n回家路上却【【突然安静下来】】？", seconds: 5.5 },
      { text: "为什么通讯录里有几百个“好朋友”，\n难过的时候却【【不知道该打给谁】】？", seconds: 5.5 },
      { text: "为什么你永远在笑，\n却很少有人问你【【“你真的开心吗”】】？", seconds: 5 },
    ],
  },
  {
    id: "epicurus",
    lines: [
      { text: "伊壁鸠鲁的名字后来成了“享乐”的代名词，\n可他本人过着【极简朴的生活】：", seconds: 6 },
      { text: "面包、清水，\n一小罐奶酪就算【【盛宴】】。", seconds: 4.5 },
      { text: "他在雅典城外买下一座花园，和朋友们住在一起，\n聊天、吃饭、思考。", seconds: 6.5 },
      { text: "对他来说，快乐不是狂欢，\n而是【【身体无痛苦、灵魂无纷扰】】。", seconds: 6 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么全场最快乐，\n散场后却最孤单？", seconds: 3.5 },
      { text: "因为热闹需要的是观众，\n而友谊需要一个【【能看见你不快乐的人】】。", seconds: 6 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你一直在给别人带去快乐，\n自己却【【越来越不敢不快乐】】。", seconds: 5 },
      { text: "你成了所有人的开心果，\n却【【没有人见过你的眼泪】】。", seconds: 5 },
    ],
  },
  {
    id: "turn",
    lines: [{ text: "伊壁鸠鲁说：我们需要的与其说是朋友的帮助，\n不如说是【【相信朋友会帮助我们】】。", seconds: 6.5 }],
  },
  {
    id: "ending",
    lines: [
      { text: "少去几场热闹，\n留住一个【【能陪你安静吃饭的人】】。", seconds: 5.5 },
      { text: "那个人，\n才是你【【真正的朋友】】。", seconds: 4.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
