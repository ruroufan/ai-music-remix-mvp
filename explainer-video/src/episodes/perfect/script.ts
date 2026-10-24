// 《完美主义》— 背光观察室 · 观察 No.13 (whiteboard edition)
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
      { text: "为什么我们总想准备好了再开始，\n却【【永远准备不好】】？", seconds: 4.5 },
      { text: "这，是一种看起来很上进的病——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "完美主义", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "法国思想家伏尔泰留下过一句话：" },
      { text: "完美是好的敌人。", seconds: 4 }, // drawn on the board
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对完美主义的认知。" },
      { text: "我们通常以为，\n完美主义是标准高、要求严。" },
      { text: "可完美主义的人往往不是做得最好的人，\n而是【【迟迟不肯动手】】的人。", seconds: 5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么一篇文章，开头改了一个星期，\n还没写到【【第二段】】？", seconds: 4.5 },
      { text: "为什么想学画画，\n非要先把【【工具买齐】】？", seconds: 4 },
      { text: "为什么一份简历调了无数次格式，\n就是【【不投出去】】？", seconds: 4.5 },
    ],
  },
  {
    id: "why",
    lines: [
      { text: "因为只要不开始，作品就永远停留在想象里，\n而想象里的它是【完美】的。", seconds: 5.5 },
      { text: "一旦动手，它就会变成现实：\n有瑕疵，有局限，有我们【【真正的水平】】。", seconds: 5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么总是准备不好？" },
      { text: "因为我们真正在准备的，不是那件事，\n而是一个【【永远不会失败的自己】】。", seconds: 5.5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "完美不会到来，\n时间却一直在走。", seconds: 3.5 },
      { text: "别人用一百个粗糙的作品练出了手艺，\n你还在等【【第一个完美的开头】】。", seconds: 5.5 },
    ],
  },
  {
    id: "quote",
    lines: [
      { text: "伏尔泰说，完美是好的敌人。", seconds: 3.5 },
      { text: "一个做完的“还不错”，\n胜过一百个停在脑子里的“【【完美】】”。", seconds: 5 },
    ],
  },
  {
    id: "ending",
    lines: [
      { text: "允许自己【【做得一般】】，\n你才有机会越做越好。", seconds: 4.5 },
      { text: "所有了不起的事，\n都始于一个【【不完美的开始】】。", seconds: 5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
