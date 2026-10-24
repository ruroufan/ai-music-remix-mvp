// 《ENFP · 新鲜感》— 背光观察室 · 16种MBTI系列 No.08（外交家组 NF）
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). 【】 highlights; 【【】】 marks the
// phrase in a line most likely to land with the viewer (components/Kinetic.tsx).
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  { id: "series", lines: [{ text: "16种MBTI系列之外交家组（NF）ENFP", seconds: 3.5 }] }, // the series card, no subtitle
  {
    id: "hook",
    lines: [
      { text: "为什么ENFP开始了一百件事，\n却很少【【坚持到最后】】？", seconds: 5 },
      { text: "这，是“竞选者”ENFP最深的困境——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "新鲜感", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "丹麦哲学家克尔凯郭尔\n在《非此即彼》里描写过一种人：", seconds: 4 },
      { text: "他们活在“审美阶段”，\n一生都在追逐新鲜和有趣。", seconds: 5.5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对ENFP的认知。" },
      { text: "我们通常以为，ENFP是三分钟热度、\n不够自律。", seconds: 4 },
      { text: "可ENFP缺的不是热情，\n而是【【承诺】】。", seconds: 4.5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么报了吉他课，\n学到第三周就开始【【想学滑板】】？", seconds: 4.5 },
      { text: "为什么新工作的第一个月干劲十足，\n半年后就开始【【看别的机会】】？", seconds: 5 },
      { text: "为什么一段感情过了热恋期，\n你就开始怀疑【【是不是不爱了】】？", seconds: 5 },
    ],
  },
  {
    id: "kierkegaard",
    lines: [
      { text: "克尔凯郭尔说，审美的人【最怕无聊】。", seconds: 3.5 },
      { text: "他们像轮种庄稼一样，不断更换生活的内容，\n用新鲜感对抗厌倦。", seconds: 5 },
      { text: "可新鲜总会变旧，\n于是【【只能不停地换】】。", seconds: 4 },
      { text: "他说人生还有另一个阶段：【伦理阶段】。", seconds: 3.5 },
      { text: "在那里，人不再追逐可能性，\n而是【【选定一件事，并为它负责】】。", seconds: 5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么开始了一百件事，\n却很少坚持到最后？", seconds: 3.5 },
      { text: "因为每一次深入，都意味着放弃其他所有的可能，\n而你【【舍不得那些可能】】。", seconds: 6 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你尝遍了所有的开头，\n却从没见过【【一件事最深处的风景】】。", seconds: 5 },
      { text: "热情能让你出发，\n只有承诺能让你【【到达】】。", seconds: 4.5 },
    ],
  },
  {
    id: "turn",
    lines: [{ text: "在克尔凯郭尔看来，\n一个人是【【在选择中成为自己】】的。", seconds: 5 }],
  },
  {
    id: "ending",
    lines: [
      { text: "当你愿意为一件事留下来，你会发现，", seconds: 4 },
      { text: "比新鲜更好的，\n是【【承诺】】。", seconds: 4.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
