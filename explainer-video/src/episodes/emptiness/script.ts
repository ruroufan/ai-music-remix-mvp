// 《空虚》— 背光观察室 · 观察 No.21
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
      { text: "为什么好不容易放了假，\n却觉得比上班【【还空】】？", seconds: 4.5 },
      { text: "这，是一种越闲越重的病——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "空虚", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "德国哲学家叔本华\n给出过一个冷酷的比喻：", seconds: 4 },
      { text: "人生就像钟摆，\n在痛苦和无聊之间来回摆动。", seconds: 5.5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对空虚的认知。" },
      { text: "我们通常以为，\n空虚是因为太闲。" },
      { text: "可空虚的人往往并不闲，他们只是\n【【没有一件真正想做的事】】。", seconds: 5.5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么盼了一个月的长假，\n第三天就开始【【无所事事】】？", seconds: 4.5 },
      { text: "为什么把购物车清空了，\n快乐只持续了【【一个下午】】？", seconds: 4.5 },
      { text: "为什么什么都不缺了，\n却【【说不出自己想要什么】】？", seconds: 4.5 },
    ],
  },
  {
    id: "pendulum",
    lines: [
      { text: "叔本华说，欲望得不到满足，\n人就【痛苦】；", seconds: 4 },
      { text: "一旦满足了，\n人就【【无聊】】。", seconds: 3 },
      { text: "欲望一被满足就消失，\n于是钟摆又荡向另一边。", seconds: 4.5 },
      { text: "我们的一生，\n就在这【【两端之间来回】】。", seconds: 4 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么放假了反而更空？", seconds: 3 },
      { text: "因为上班时，\n我们被【【别人的目标】】推着走；", seconds: 4 },
      { text: "一旦停下来，才发现自己手里\n并没有一个【【属于自己的目标】】。", seconds: 5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你会不停地用新的欲望去填空虚：\n买东西，刷手机，找刺激。", seconds: 5 },
      { text: "可钟摆荡得越高，\n【【落下来时就越空】】。", seconds: 4 },
    ],
  },
  {
    id: "way",
    lines: [
      { text: "叔本华给的出路，是去做那些\n【【本身就能带来满足】】的事：", seconds: 4.5 },
      { text: "读书，思考，创造，那些\n【【不需要结果也值得去做】】的事。", seconds: 5 },
    ],
  },
  {
    id: "ending",
    lines: [
      { text: "当你找到一件\n【【真正为自己做的事】】，", seconds: 4 },
      { text: "你就【【不再被钟摆推着走】】。", seconds: 4 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
