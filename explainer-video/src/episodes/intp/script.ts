// 《INTP · 想太多》— 背光观察室 · 16种MBTI系列 No.02（分析家组 NT）
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). 【】 highlights; 【【】】 marks the
// phrase in a line most likely to land with the viewer (components/Kinetic.tsx).
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  { id: "series", lines: [{ text: "16种MBTI系列之分析家组（NT）INTP", seconds: 3.5 }] }, // the series card, no subtitle
  {
    id: "hook",
    lines: [
      { text: "为什么INTP想了一百种方案，\n却【【一种都没去做】】？", seconds: 4.5 },
      { text: "这，是“逻辑学家”INTP最深的困境——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "想太多", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "歌德在《浮士德》里写过一句话：", seconds: 3.5 },
      { text: "理论是灰色的，\n而生命之树常青。", seconds: 5.5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对INTP的认知。" },
      { text: "我们通常以为，\nINTP只是懒。" },
      { text: "可INTP并不懒，他们的脑子一刻也没停过，\n只是【【从来没有走出脑子】】。", seconds: 6 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么一个创业想法，你能推演到第三年的现金流，\n却【【连第一步都没迈出】】？", seconds: 6 },
      { text: "为什么学一门新技能，你研究了二十种学习方法，\n却【【还没开始学】】？", seconds: 5.5 },
      { text: "为什么喜欢一个人，你分析了所有可能，\n却【【一句话都没说】】？", seconds: 5 },
    ],
  },
  {
    id: "faust",
    lines: [
      { text: "浮士德读遍了\n哲学、法律、医学和神学，", seconds: 4 },
      { text: "却在书房里感到绝望：", seconds: 2.5 },
      { text: "他什么都懂，\n却【【什么都没真正活过】】。", seconds: 4 },
      { text: "直到他走出书房，\n【【生活才真正开始】】。", seconds: 4 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么想了一百种方案，\n却一种都没去做？", seconds: 4 },
      { text: "因为在脑子里，\n所有方案都是【【完美的】】；", seconds: 3.5 },
      { text: "一旦动手，现实就会冒出\n你算不到的变量。", seconds: 4 },
      { text: "你不是在思考，\n是在【【躲避不确定】】。", seconds: 4 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你的理论越来越精密，\n你的生活却【【越来越灰】】。", seconds: 4.5 },
      { text: "别人在试错里长大，\n你【【停在推演里】】。", seconds: 4 },
    ],
  },
  {
    id: "turn",
    lines: [{ text: "理论能告诉你世界是什么样的，\n却【【不能替你活一遍】】。", seconds: 5 }],
  },
  {
    id: "ending",
    lines: [
      { text: "走出那间书房，\n去【【碰一碰真实的东西】】。", seconds: 4.5 },
      { text: "灰色的理论之外，\n那棵生命之树【【一直常青】】。", seconds: 4.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
