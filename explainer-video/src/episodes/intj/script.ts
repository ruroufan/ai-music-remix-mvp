// 《INTJ · 正确》— 背光观察室 · 人格 No.01（分析家组 NT）
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). 【】 highlights; 【【】】 marks the
// phrase in a line most likely to land with the viewer (components/Kinetic.tsx).
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  { id: "series", lines: [{ text: "16种MBTI系列之分析家组（NT）INTJ", seconds: 3.5 }] }, // the series card, no subtitle
  {
    id: "hook",
    lines: [
      { text: "为什么INTJ说的明明是对的，\n别人却【【不愿意听】】？", seconds: 4.5 },
      { text: "这，是“建筑师”INTJ最深的困境——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "正确", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "两千多年前，苏格拉底说过：", seconds: 3.5 },
      { text: "我比别人多知道的只有一件事，\n那就是我知道自己无知。", seconds: 6 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对INTJ的认知。" },
      { text: "我们通常以为，\nINTJ的问题是太冷、太独。" },
      { text: "可INTJ真正的困境，是\n【【太相信自己已经想清楚了】】。", seconds: 5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么开会时，你早就看到了结局，\n却只能看着别人【【绕远路】】？", seconds: 5 },
      { text: "为什么你给朋友的建议句句在理，\n对方却【【越听越沉默】】？", seconds: 5 },
      { text: "为什么你画好了整张蓝图，\n最后还是【【一个人在搭】】？", seconds: 4.5 },
    ],
  },
  {
    id: "socrates",
    lines: [
      { text: "苏格拉底被称为\n雅典最有智慧的人。", seconds: 3.5 },
      { text: "他拜访了政客、诗人、工匠，发现他们\n都【【自以为知道】】，其实并不知道。", seconds: 5.5 },
      { text: "而他唯一的不同，\n是【【承认自己的无知】】。", seconds: 4 },
      { text: "所以他从不宣布答案，只是提问，\n让对方【【自己走到答案面前】】。", seconds: 5.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么你明明是对的，\n别人却不愿意听？", seconds: 4 },
      { text: "因为人们拒绝的\n往往不是你的观点，", seconds: 3.5 },
      { text: "而是那句没说出口的\n【【“我早就想清楚了”】】。", seconds: 4.5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你会越来越确信，\n也【【越来越孤独】】。", seconds: 4 },
      { text: "所有人都在你的推演之外，而你的推演里，\n【【再也进不来新的东西】】。", seconds: 5.5 },
    ],
  },
  {
    id: "examine",
    lines: [
      { text: "苏格拉底说，\n【【未经审视的人生不值得过】】。", seconds: 4 },
      { text: "被审视的，\n也包括【【你自己的正确】】。", seconds: 4 },
    ],
  },
  {
    id: "ending",
    lines: [
      { text: "当你愿意给世界【【留一点空白】】，\n承认自己的无知，", seconds: 4.5 },
      { text: "别人才会\n【【走进你的蓝图】】。", seconds: 4 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
