// 《ISTJ · 有用》— 背光观察室 · 16种MBTI系列 No.09（守护者组 SJ）
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). 【】 highlights; 【【】】 marks the
// phrase in a line most likely to land with the viewer (components/Kinetic.tsx).
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  { id: "series", lines: [{ text: "16种MBTI系列之守护者组（SJ）ISTJ", seconds: 3.5 }] }, // the series card, no subtitle
  {
    id: "hook",
    lines: [
      { text: "为什么ISTJ把所有事都做对了，\n却【【并不快乐】】？", seconds: 5 },
      { text: "这，是“物流师”ISTJ最深的困境——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "有用", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "两千多年前，\n庄子说过：", seconds: 3 },
      { text: "人皆知有用之用，\n而莫知无用之用也。", seconds: 5.5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对ISTJ的认知。" },
      { text: "我们通常以为，ISTJ靠谱、踏实，\n活得最安稳。", seconds: 4 },
      { text: "可ISTJ的不快乐，\n恰恰藏在这份【【“靠谱”】】里。", seconds: 4.5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么周末休息，\n你也要【【列一张待办清单】】？", seconds: 4.5 },
      { text: "为什么朋友约你去看海，\n你的第一反应是【【“去那里干什么”】】？", seconds: 5 },
      { text: "为什么什么都没做的一天，\n你会觉得【【浪费了】】？", seconds: 4.5 },
    ],
  },
  {
    id: "zhuangzi",
    lines: [
      { text: "庄子讲过一棵大树：\n木匠路过，看都不看一眼，", seconds: 4 },
      { text: "说这木头做船会沉，做棺材会烂，\n做门窗会流脂，【【什么用都没有】】。", seconds: 5.5 },
      { text: "可正因为没用，\n【它才没被砍掉】，", seconds: 3.5 },
      { text: "长成了能为\n【【几千头牛遮荫的大树】】。", seconds: 4.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么把所有事都做对了，\n却不快乐？", seconds: 3.5 },
      { text: "因为你只做【有用的事】。", seconds: 3 },
      { text: "而让人快乐的，往往是那些【【没用的东西】】：\n一次发呆，一场漫无目的的散步，一个没有结果的下午。", seconds: 7 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你把人生过成了一张清单，每一项都打了勾，\n却【【没有一项是为自己打的】】。", seconds: 5.5 },
      { text: "你很有用，\n却很少【【真正活着】】。", seconds: 4 },
    ],
  },
  {
    id: "turn",
    lines: [
      { text: "庄子说：山木自寇也，膏火自煎也。", seconds: 4 },
      { text: "越有用的东西，\n【【越容易被消耗】】。", seconds: 3.5 },
    ],
  },
  {
    id: "ending",
    lines: [
      { text: "给自己留一点\n【【不必有用的时间】】。", seconds: 4 },
      { text: "那些无用的时刻，\n才【【真正属于你自己】】。", seconds: 4.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
