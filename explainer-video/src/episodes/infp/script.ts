// 《INFP · 理想》— 背光观察室 · 16种MBTI系列 No.06（外交家组 NF）
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). 【】 highlights; 【【】】 marks the
// phrase in a line most likely to land with the viewer (components/Kinetic.tsx).
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  { id: "series", lines: [{ text: "16种MBTI系列之外交家组（NF）INFP", seconds: 3.5 }] }, // the series card, no subtitle
  {
    id: "hook",
    lines: [
      { text: "为什么INFP在想象里活得很好，\n一回到现实就【【寸步难行】】？", seconds: 5 },
      { text: "这，是“调停者”INFP最深的困境——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "理想", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "法国作家罗曼·罗兰\n写过一句话：", seconds: 3.5 },
      { text: "世界上只有一种真正的英雄主义，\n那就是在认清生活的真相之后，依然热爱生活。", seconds: 7 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对INFP的认知。" },
      { text: "我们通常以为，INFP太天真，\n看不清现实。", seconds: 4 },
      { text: "可INFP往往比谁都看得清，\n正因为看清了，才【【不敢走进去】】。", seconds: 5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么你能在脑子里写完一部小说，\n真正动笔却【【写不满一页】】？", seconds: 4.5 },
      { text: "为什么你对未来有无数美好的想象，\n却害怕【【投出一份简历】】？", seconds: 4.5 },
      { text: "为什么一点点粗鲁和冷漠，\n就能让你【【缩回自己的世界好几天】】？", seconds: 5 },
    ],
  },
  {
    id: "clean",
    lines: [
      { text: "INFP心里有一块干净的地方，\n装着理想、善良和美。", seconds: 4 },
      { text: "而现实是嘈杂的、粗糙的，\n会妥协，会讨价还价。", seconds: 4 },
      { text: "INFP怕的不是失败，\n而是现实【【弄脏了心里那块干净的地方】】。", seconds: 5 },
      { text: "所以宁愿把理想留在想象里，\n【完好无损】。", seconds: 4 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么在想象里活得很好，\n在现实里却寸步难行？", seconds: 4 },
      { text: "因为想象从不会让你失望，\n【【现实会】】。", seconds: 4 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "被保护得最好的理想，\n也是【【从没被实现过的理想】】。", seconds: 4.5 },
      { text: "你守住了它的纯粹，\n也让它【【永远只是一场梦】】。", seconds: 4.5 },
    ],
  },
  {
    id: "turn",
    lines: [{ text: "罗曼·罗兰说的英雄，不是没见过黑暗的人，\n而是见过了黑暗，【【还愿意点灯的人】】。", seconds: 6 }],
  },
  {
    id: "ending",
    lines: [
      { text: "带着你的理想走进现实吧。", seconds: 3.5 },
      { text: "会受伤，会妥协，\n但那才是【【真正的热爱】】。", seconds: 5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
