// 《自我怀疑》— 背光观察室 · 观察 No.14
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
      { text: "为什么被人夸了，\n我们的第一反应是【【“他们看错了”】】？", seconds: 4.5 },
      { text: "这，是越优秀越容易得的病——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "自我怀疑", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "英国哲学家罗素写过一句很尖锐的话：" },
      { text: "这个世界的问题在于，愚蠢的人总是很确信，\n聪明的人却满是怀疑。", seconds: 6 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对自我怀疑的认知。" },
      { text: "我们通常以为，\n怀疑自己是因为不够好。" },
      { text: "可很多时候，\n恰恰是因为你【【知道得够多】】。", seconds: 4 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么升职了，\n第一个念头是【【“我是不是运气好”】】？", seconds: 4.5 },
      { text: "为什么报告被表扬，\n我们却只记得【【那一处小错】】？", seconds: 4.5 },
      { text: "为什么考了高分，还担心下一次\n会被人发现【【“其实我不行”】】？", seconds: 5 },
    ],
  },
  {
    id: "circle",
    lines: [
      { text: "知识像一个圆：圆越大，\n它碰到的【【未知边界】】就越长。", seconds: 5 },
      { text: "懂得少的人，看见的世界很小，\n所以很【笃定】；", seconds: 4.5 },
      { text: "懂得多的人，看见的未知更多，\n所以更谦卑，也【【更不安】】。", seconds: 5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么被夸了\n还觉得是别人看错了？" },
      { text: "因为你拿自己的【【全部缺点】】，\n去比别人展示出来的全部优点。", seconds: 5.5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你会一次次放弃\n【【本该属于你的机会】】，", seconds: 4 },
      { text: "把位置让给那些\n从不怀疑自己的人。", seconds: 4 },
    ],
  },
  {
    id: "russell",
    lines: [
      { text: "罗素这句话还有另一层意思：" },
      { text: "怀疑是清醒的代价，\n但不该成为【【停下的理由】】。", seconds: 4.5 },
    ],
  },
  {
    id: "ending",
    lines: [
      { text: "请保留你的怀疑，\n但别用它否定自己，", seconds: 4 },
      { text: "用它去看见【【更大的世界】】。", seconds: 4.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
