// 《INFJ · 不被懂》— 背光观察室 · 16种MBTI系列 No.05（外交家组 NF）
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). 【】 highlights; 【【】】 marks the
// phrase in a line most likely to land with the viewer (components/Kinetic.tsx).
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  { id: "series", lines: [{ text: "16种MBTI系列之外交家组（NF）INFJ", seconds: 3.5 }] }, // the series card, no subtitle
  {
    id: "hook",
    lines: [
      { text: "为什么INFJ能看穿所有人，\n却从来【【没人真正懂TA】】？", seconds: 5 },
      { text: "这，是“提倡者”INFJ最深的困境——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "不被懂", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "奥地利哲学家维特根斯坦\n写过一句话：", seconds: 3.5 },
      { text: "我的语言的界限，\n意味着我的世界的界限。", seconds: 5.5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对INFJ的认知。" },
      { text: "我们通常以为，INFJ不被懂，\n是因为太复杂、太深。", seconds: 4 },
      { text: "可很多时候，不是别人看不懂你，\n是你【【从来没让别人看】】。", seconds: 5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么朋友一个眼神，你就知道他今天不开心，\n可你自己难过时只说【【“没事”】】？", seconds: 6 },
      { text: "为什么你能为别人的问题想好答案，\n却【【从不提起自己的】】？", seconds: 4.5 },
      { text: "为什么失望攒够了，你会突然\n【【一言不发地切断一段关系】】？", seconds: 5 },
    ],
  },
  {
    id: "wittgenstein",
    lines: [
      { text: "维特根斯坦还说：凡是可以说的，都能说清楚；\n对于不可说的，【必须保持沉默】。", seconds: 6 },
      { text: "INFJ总觉得自己的感受太复杂、说不清，\n于是选择了【沉默】。", seconds: 4.5 },
      { text: "可别人看到的，只是你世界的边界：\n【【一堵安静又礼貌的墙】】。", seconds: 5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么能看穿所有人，\n却没人懂你？", seconds: 3.5 },
      { text: "因为你在别人的世界里来去自如，\n却从没给过别人【【一把通往你世界的钥匙】】。", seconds: 6 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你会一直等一个\n【【“不用说就懂我”】】的人。", seconds: 4 },
      { text: "可这样的人几乎不存在，你只会一次次失望，\n又一次次【【关上门】】。", seconds: 5.5 },
    ],
  },
  {
    id: "turn",
    lines: [{ text: "被理解从来不是被看穿，\n而是【【被告诉】】。", seconds: 4.5 }],
  },
  {
    id: "ending",
    lines: [
      { text: "哪怕说得笨拙、说得不完整，\n也请把那句话【【说出口】】。", seconds: 5 },
      { text: "你的世界，\n才第一次【【有人走得进来】】。", seconds: 4.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
