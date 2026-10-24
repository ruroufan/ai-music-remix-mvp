// 《容貌焦虑》— 背光观察室 · 观察 No.15
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
      { text: "为什么修完图发出去，\n再照镜子会【【更难受】】？", seconds: 4.5 },
      { text: "这，是这个时代最常见的病——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "容貌焦虑", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "法国哲学家鲍德里亚\n提出过一个概念：【拟像】。" },
      { text: "他说，在现代社会，\n【【拟像比真实更真实】】。", seconds: 5.5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对容貌焦虑的认知。" },
      { text: "我们通常以为，\n容貌焦虑是因为不够好看。" },
      { text: "可很多时候，我们比较的对象\n【【根本就不存在】】。", seconds: 4.5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么刷到的每一张脸\n都【【没有毛孔】】？", seconds: 4 },
      { text: "为什么不开美颜，\n我们就【【不敢打视频】】？", seconds: 4 },
      { text: "为什么一张原相机拍的合照，\n能让我们【【难受一整天】】？", seconds: 4.5 },
    ],
  },
  {
    id: "copy",
    lines: [
      { text: "鲍德里亚说，拟像是\n【【没有原本的复制品】】。", seconds: 4.5 },
      { text: "屏幕上那些完美的脸，是滤镜、\n灯光、修图一层层造出来的，", seconds: 5 },
      { text: "现实中从来【【没有人长那样】】。", seconds: 4 },
    ],
  },
  {
    id: "normal",
    lines: [
      { text: "可看久了，\n我们就把它当成了“正常”，", seconds: 4 },
      { text: "反过来觉得\n【【真实的自己才是错的】】。", seconds: 4.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么修完图\n再照镜子更难受？" },
      { text: "因为你在和\n【【自己修出来的那张脸】】比，", seconds: 4.5 },
      { text: "而镜子里的人\n【【永远赢不了它】】。", seconds: 4 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你修得越多，\n【【离自己就越远】】。", seconds: 4 },
      { text: "最后，网上的那个你\n被所有人喜欢，", seconds: 3.5 },
      { text: "镜子前的你\n却【【连自己都不喜欢】】。", seconds: 4.5 },
    ],
  },
  {
    id: "real",
    lines: [
      { text: "真实的脸会老，会累，\n会长痘和细纹，", seconds: 4.5 },
      { text: "可它会哭会笑，\n【【会被一个人记住】】。", seconds: 4.5 },
      { text: "屏幕里的那张脸，\n【【什么都没有】】。", seconds: 4 },
    ],
  },
  {
    id: "ending",
    lines: [
      { text: "当你肯放下滤镜，\n你才会重新看见", seconds: 4 },
      { text: "那张会哭会笑的、\n【【真实的脸】】。", seconds: 4.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
