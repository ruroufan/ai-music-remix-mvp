// 《玻璃心》— 背光观察室 · 观察 No.17
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
      { text: "为什么一句玩笑，\n能让我们【【难受好几天】】？", seconds: 4.5 },
      { text: "这，是一种很难说出口的病——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "玻璃心", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "罗马皇帝马可·奥勒留\n在《沉思录》里写过：" },
      { text: "选择不受伤害，你就不会觉得受了伤害；\n不觉得受伤害，你就没有受伤害。", seconds: 6.5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对玻璃心的认知。" },
      { text: "我们通常以为，\n玻璃心是因为别人说话太重。" },
      { text: "可很多时候，伤人的不是那句话，\n而是我们【【对那句话的理解】】。", seconds: 5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么同事一句“你今天气色不好”，\n我们能【【琢磨一下午】】？", seconds: 5 },
      { text: "为什么朋友没回消息，我们就开始想\n是不是【【自己哪里做错了】】？", seconds: 5 },
      { text: "为什么一条差评，\n能【【盖过一百条好评】】？", seconds: 4.5 },
    ],
  },
  {
    id: "stoic",
    lines: [
      { text: "斯多葛哲学认为，一件事的发生，\n和我们对这件事的判断，【是两回事】。", seconds: 5.5 },
      { text: "别人说了一句话，这是【事实】；", seconds: 3.5 },
      { text: "“他看不起我”，\n是我们【【自己加上去的判断】】。", seconds: 4.5 },
      { text: "真正刺痛我们的，往往是后者。", seconds: 3.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么一句玩笑\n能让我们难受好几天？" },
      { text: "因为我们不只是听见了它，\n还【【相信了它】】。", seconds: 4.5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你把【【评价自己的权力】】，\n交给了每一个路过的人。", seconds: 5 },
      { text: "谁随口一句，\n都能让你【【一整天过不好】】。", seconds: 4.5 },
    ],
  },
  {
    id: "emperor",
    lines: [
      { text: "马可·奥勒留是一个帝国的皇帝，\n每天面对无数指责和背叛，", seconds: 5 },
      { text: "却在写给自己的笔记里一遍遍提醒：", seconds: 3.5 },
      { text: "【【别人的话，只是别人的话】】。", seconds: 4.5 }, // written into the notebook
    ],
  },
  {
    id: "ending",
    lines: [
      { text: "在一句话和一道伤口之间，\n还隔着【【你的选择】】。", seconds: 8 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
