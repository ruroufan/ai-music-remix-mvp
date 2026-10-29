// 《内耗》— 背光观察室 · 观察 No.12
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
      { text: "为什么什么都没做，\n我们却已经【【累了一整天】】？", seconds: 4 },
      { text: "这，是这个时代最隐秘的病——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "内耗", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "五百年前，王阳明说过一句话：" },
      { text: "人须在事上磨，方立得住。", seconds: 4.5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对内耗的认知。" },
      { text: "我们通常以为，内耗是因为事情太多。" },
      { text: "可内耗的人往往不是做得太多，\n而是【【想得太多、做得太少】】。", seconds: 5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么一条消息\n要【【改五遍】】才敢发出去？", seconds: 4 },
      { text: "为什么一个电话\n要在心里【【预演一下午】】？", seconds: 4 },
      { text: "为什么还没发生的事，\n我们已经在脑子里【【输了一百次】】？", seconds: 4.5 },
    ],
  },
  {
    id: "student",
    lines: [
      { text: "王阳明的学生曾问他：静坐时心里很好，\n一遇到事就乱了，怎么办？", seconds: 5.5 },
      { text: "王阳明说：那是因为你只知道在静中养心，\n不在事上用功。", seconds: 5 },
      { text: "遇事便乱，是因为这颗心\n从来没在【【事情里磨过】】。", seconds: 4.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么什么都没做，却已经很累？" },
      { text: "因为我们一直在\n和【【想象中的事情】】打架。", seconds: 4 },
      { text: "现实只有一个，\n想象却有【【一千种】】。", seconds: 4 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "想象中的困难\n永远比【【真实的大】】。", seconds: 4 },
      { text: "你在脑子里打完了所有的仗，\n却【【一步也没往前走】】。", seconds: 4.5 },
    ],
  },
  {
    id: "thief",
    lines: [
      { text: "王阳明还说：\n破山中贼易，破【心中贼】难。", seconds: 4.5 },
      { text: "破心中贼的办法，不是再想一遍，\n而是【【去做】】。", seconds: 4.5 },
    ],
  },
  {
    id: "ending",
    lines: [
      { text: "把那条消息发出去，\n把那个电话打出去。", seconds: 4 },
      { text: "心是在做事的过程中安定下来的，\n这就是【【事上练】】。", seconds: 5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
