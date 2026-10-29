// 《ESTP · 停不下来》— 背光观察室 · 16种MBTI系列 No.15（探险家组 SP）
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). 【】 highlights; 【【】】 marks the
// phrase in a line most likely to land with the viewer (components/Kinetic.tsx).
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  { id: "series", lines: [{ text: "16种MBTI系列之探险家组（SP）ESTP", seconds: 3.5 }] }, // the series card, no subtitle
  {
    id: "hook",
    lines: [
      { text: "为什么ESTP总在追求刺激，\n一停下来就【【浑身难受】】？", seconds: 5.5 },
      { text: "这，是“企业家”ESTP最深的困境——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "停不下来", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "法国哲学家帕斯卡写过：", seconds: 3 },
      { text: "人类所有的不幸，都源于一件事：\n不能安静地待在一个房间里。", seconds: 6.5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对ESTP的认知。" },
      { text: "我们通常以为，\nESTP爱冒险，是因为胆子大、精力足。", seconds: 4 },
      { text: "可帕斯卡看到的是：不停地追逐，\n往往是为了【【不必面对自己】】。", seconds: 5.5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么周末一定要排满，\n【【空一天就觉得白过了】】？", seconds: 5 },
      { text: "为什么刚完成一个挑战，\n马上就要【【找下一个】】？", seconds: 5 },
      { text: "为什么一个人安静地坐上十分钟，\n你就【【忍不住拿起手机】】？", seconds: 5 },
    ],
  },
  {
    id: "pascal",
    lines: [
      { text: "帕斯卡说，人们追逐打猎、赌博、战争，\n并不是真的想要那只兔子、那笔钱。", seconds: 6 },
      { text: "如果你直接把兔子送给猎人，\n他反而【不高兴】。", seconds: 4.5 },
      { text: "他要的不是猎物，\n而是【【追逐本身】】，", seconds: 4 },
      { text: "因为追逐能让他\n【【不去想自己的处境】】。", seconds: 4.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么一停下来就难受？", seconds: 3 },
      { text: "因为一安静下来，那些被速度甩在身后的问题，\n就会【【追上来】】。", seconds: 6.5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "刺激会越来越不够用，\n你只能【【越跑越快】】。", seconds: 4.5 },
      { text: "你见过了最远的风景，\n却【【从没见过最近的自己】】。", seconds: 5 },
    ],
  },
  {
    id: "turn",
    lines: [
      { text: "帕斯卡把这一切称为“消遣”：", seconds: 3 },
      { text: "它让我们开心，也让我们不知不觉走向终点，\n却从不让我们【【停下来想一想】】。", seconds: 7 },
    ],
  },
  {
    id: "ending",
    lines: [
      { text: "试着在一个房间里，\n【【安静地坐一会儿】】。", seconds: 4.5 },
      { text: "当你不再害怕安静，\n你才【【真正自由】】。", seconds: 4.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
