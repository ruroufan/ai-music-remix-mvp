// 《ISTP · 沉默》— 背光观察室 · 16种MBTI系列 No.13（探险家组 SP）
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). 【】 highlights; 【【】】 marks the
// phrase in a line most likely to land with the viewer (components/Kinetic.tsx).
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  { id: "series", lines: [{ text: "16种MBTI系列之探险家组（SP）ISTP", seconds: 3.5 }] }, // the series card, no subtitle
  {
    id: "hook",
    lines: [
      { text: "为什么ISTP什么都能修好，\n却【【说不出自己的感受】】？", seconds: 5 },
      { text: "这，是“鉴赏家”ISTP最深的困境——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "沉默", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "苏格兰哲学家休谟\n写过一句话：", seconds: 3 },
      { text: "理性是，并且只应当是\n激情的奴隶。", seconds: 5.5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对ISTP的认知。" },
      { text: "我们通常以为，\nISTP冷静、理性、感情淡。", seconds: 3.5 },
      { text: "可在休谟看来，没有人真的只靠理性活着，\n【【感受一直在幕后掌舵】】。", seconds: 6 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么朋友哭着来找你，\n你的第一反应是【【帮他分析怎么解决】】？", seconds: 5 },
      { text: "为什么伴侣问你“你爱我吗”，\n你只想去【【把家里坏掉的灯修好】】？", seconds: 5 },
      { text: "为什么心里不舒服，你宁愿一个人去骑车、打游戏，\n也【【不愿意说一句】】？", seconds: 6 },
    ],
  },
  {
    id: "hume",
    lines: [
      { text: "ISTP相信看得见、摸得着、\n能修好的东西。", seconds: 3.5 },
      { text: "一台机器坏了，\n拆开就能找到原因。", seconds: 3.5 },
      { text: "可感受不一样：它没有说明书，拆不开，也修不好。\n于是你把它放在一边，【【假装它不存在】】。", seconds: 7 },
      { text: "可休谟说，理性只能告诉你怎么做，\n却【决定不了你想要什么】。", seconds: 5 },
      { text: "那些被你放在一边的感受，\n一直在【【悄悄替你做选择】】。", seconds: 4.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么什么都能修好，\n却说不出自己的感受？", seconds: 3.5 },
      { text: "因为感受不是用来修的，是用来被说出来、被听见的，\n而你【【只擅长修】】。", seconds: 6.5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "身边的人会以为你冷漠，\n你自己也以为【【自己没事】】。", seconds: 4.5 },
      { text: "直到某一天，那些没说出口的东西，\n比一台坏掉的机器【【更难收拾】】。", seconds: 5 },
    ],
  },
  {
    id: "turn",
    lines: [{ text: "承认感受，\n并【【不会让一个人变得不理性】】。", seconds: 4.5 }],
  },
  {
    id: "ending",
    lines: [
      { text: "有些事不需要解决，\n只需要【【被说出来】】。", seconds: 4.5 },
      { text: "下一次，试着用一句话，\n【【说出你的感受】】。", seconds: 4.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
