// 《恋爱脑》— 背光观察室 · 观察 No.18
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
      { text: "为什么越爱一个人，\n我们越害怕【【失去自己】】？", seconds: 4.5 },
      { text: "这，是一种常被说成“深情”的病——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "恋爱脑", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "法国哲学家波伏娃\n在《第二性》里写过：" },
      { text: "总有一天，女人可以用她的强大，\n而不是她的软弱去爱。", seconds: 6 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对恋爱脑的认知。" },
      { text: "我们通常以为，\n恋爱脑是爱得太多。" },
      { text: "可很多时候，不是爱得太多，\n而是【【自己太少】】。", seconds: 4.5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么对方半天没回消息，\n我们就【【什么都做不下去】】？", seconds: 5 },
      { text: "为什么恋爱以后，朋友越来越少，\n【【爱好也越来越少】】？", seconds: 5 },
      { text: "为什么明明受了委屈，\n还要先替他想【【是不是有苦衷】】？", seconds: 5 },
    ],
  },
  {
    id: "beauvoir",
    lines: [
      { text: "在波伏娃看来，软弱的爱，\n是把对方当成【全世界】，", seconds: 4.5 },
      { text: "把自己存在的全部意义都交出去，", seconds: 3.5 },
      { text: "好像只有被爱着，\n【【自己才存在】】。", seconds: 4 },
      { text: "这样的爱看起来深情，\n其实是一种【【逃避】】：", seconds: 4 },
      { text: "逃避为自己的人生负责。", seconds: 3.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么越爱一个人，\n越害怕失去自己？" },
      { text: "因为你早已\n【【先把自己交了出去】】。", seconds: 4 },
      { text: "害怕失去他，其实是害怕失去\n那个【【靠他才存在的自己】】。", seconds: 5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你把全部重量压在一个人身上，\n【【他累，你也怕】】。", seconds: 5 },
      { text: "爱一旦变成依赖，\n就再也【【轻松不起来】】。", seconds: 4.5 },
    ],
  },
  {
    id: "note",
    lines: [{ text: "这句话不只写给女人，也写给每一个\n【【在爱里弄丢了自己的人】】。", seconds: 5.5 }],
  },
  {
    id: "ending",
    lines: [
      { text: "真正的爱，是\n【【两个完整的人站在一起】】。", seconds: 4.5 },
      { text: "先成为一个完整的人，\n你才能【【用强大去爱】】。", seconds: 5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
