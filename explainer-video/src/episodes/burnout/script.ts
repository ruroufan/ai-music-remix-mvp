// 《倦怠》— 背光观察室 · 观察 No.20
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
      { text: "为什么努力了那么久，\n我们突然【【什么都不想要了】】？", seconds: 4.5 },
      { text: "这，是这个时代的高发病——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "倦怠", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "韩裔德国哲学家韩炳哲\n在《倦怠社会》里给出过一个诊断：", seconds: 4.5 },
      { text: "今天的人是自我剥削者，\n既是施暴者，也是受害者。", seconds: 5.5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对倦怠的认知。" },
      { text: "我们通常以为，\n倦怠是因为别人逼得太紧。" },
      { text: "可韩炳哲说，压垮现代人的往往\n不是“你必须”，而是【【“你可以”】】。", seconds: 5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么下班了\n还在【【学课程、刷干货】】？", seconds: 4.5 },
      { text: "为什么周末休息，\n也要安排得【【“有意义”】】？", seconds: 4.5 },
      { text: "为什么什么都没做的一天，\n会让我们有【【罪恶感】】？", seconds: 4.5 },
    ],
  },
  {
    id: "han",
    lines: [
      { text: "韩炳哲说，过去的社会是规训社会，\n它说【“你不准”】；", seconds: 4.5 },
      { text: "今天的社会是功绩社会，\n它说【【“你能行”】】。", seconds: 4 },
      { text: "没有人拿鞭子逼你，\n可【【你自己举起了鞭子】】。", seconds: 4.5 },
      { text: "你可以更自律，可以更优秀，\n可以再多做一点，", seconds: 4 },
      { text: "而“可以”【【没有尽头】】。", seconds: 3.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么努力了那么久，\n突然什么都不想要了？" },
      { text: "因为一个人不可能永远\n对自己说【【“还不够”】】。", seconds: 4.5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "剥削别人还有底线，\n【【剥削自己却没有】】。", seconds: 4 },
      { text: "你不会罢工，也不会反抗，\n因为【【老板就是你自己】】。", seconds: 4.5 },
      { text: "最后燃尽的，\n【【也是你自己】】。", seconds: 4 },
    ],
  },
  {
    id: "skill",
    lines: [{ text: "韩炳哲认为，我们需要重新学会\n一种能力：【【不做的能力】】。", seconds: 5 }],
  },
  {
    id: "ending",
    lines: [
      { text: "不是每一刻都要有用，\n也不是每一天都要进步。", seconds: 4.5 },
      { text: "允许自己停下，\n你才能【【重新走得动】】。", seconds: 4.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
