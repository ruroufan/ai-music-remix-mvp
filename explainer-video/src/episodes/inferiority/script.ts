// 《自卑》— 背光观察室 · 观察 No.03
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). Text in 【】 is highlighted.
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  {
    id: "hook",
    lines: [
      { text: "为什么最爱炫耀的人，\n往往最自卑？" },
      { text: "这，是藏得最深的一种情绪——" },
    ],
  },
  { id: "title", lines: [{ text: "自卑", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "心理学家阿德勒\n给出过一个反常识的诊断：" },
      { text: "优越感，是对自卑的补偿。", seconds: 4 }, // shown as a big quote
    ],
  },
  {
    id: "twoFaces",
    lines: [
      { text: "我们通常以为，\n自卑的人低着头，炫耀的人昂着头，是两种人。" },
      { text: "可阿德勒说，他们是同一种人：" },
      { text: "一个在藏伤口，\n一个在给伤口【贴金】。", seconds: 4 },
    ],
  },
  {
    id: "showoff",
    lines: [
      { text: "为什么有人三句话不离自己的名校？" },
      { text: "为什么刚买的表，\n要在饭桌上“不经意”地露出来？" },
      { text: "为什么朋友圈的每张照片，\n都要修到看不出原样？" },
      { text: "越用力证明的地方，\n往往越是心里【没底】的地方。", seconds: 4 },
    ],
  },
  {
    id: "child",
    lines: [
      { text: "阿德勒说，自卑感本身不是病。" },
      { text: "每个人都曾是一个\n仰头看大人的孩子，", seconds: 3.5 },
      { text: "正是这种“不够”，\n推着我们去学、去长大。", seconds: 4 },
    ],
  },
  {
    id: "fork",
    lines: [
      { text: "问题出在另一条路上：" },
      { text: "不去【变强】，而是去【显得强】。", seconds: 4 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么最爱炫耀的人\n往往最自卑？" },
      { text: "因为真正拥有的东西，\n不需要被反复确认。", seconds: 4 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "pit",
    lines: [
      { text: "补偿是一个无底洞。" },
      { text: "你用名牌盖住了一个洞，\n又露出另一个。", seconds: 3.5 },
      { text: "你越想让别人仰视你，\n就越害怕被【看穿】。", seconds: 4 },
    ],
  },
  {
    id: "yesterday",
    lines: [{ text: "在阿德勒看来，健康的追求，\n是和昨天的自己比，而不是和别人比。", seconds: 5 }],
  },
  {
    id: "ending",
    lines: [
      { text: "当你开始只跟自己较劲，", seconds: 4 },
      { text: "你就不再需要任何补偿。", seconds: 5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
