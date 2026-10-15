// 《报复性熬夜》— 背光观察室 · 观察 No.09
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). Text in 【】 is highlighted.
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  {
    id: "hook",
    lines: [
      { text: "为什么明明已经很困了，\n我们就是不想睡？" },
      { text: "这，是当代年轻人最普遍的病——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "报复性熬夜", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "马克思在《1844年经济学哲学手稿》里写过：" },
      { text: "劳动者只有在劳动之外才感到自在，\n而在劳动之中则感到不自在。", seconds: 5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对熬夜的认知。" },
      { text: "我们通常以为，熬夜是自制力差。" },
      { text: "可熬夜的人并非不想睡，\n而是【不甘心】睡。", seconds: 4 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么到家已经十点，\n还要刷两个小时手机？", seconds: 4 },
      { text: "为什么明知明天要早起，\n还要再看一集剧？", seconds: 4 },
      { text: "为什么躺在床上什么都不做，\n也舍不得关灯？", seconds: 4 },
    ],
  },
  {
    id: "strings",
    lines: [
      { text: "在马克思看来，当一个人的时间被别人支配，\n他在那段时间里就不再是自己。", seconds: 5.5 },
      { text: "白天，你的时间属于工作、\n属于消息、属于别人的要求。", seconds: 4.5 },
      { text: "只有到了深夜，\n才不会有人来找你。", seconds: 4.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么明明很困，\n就是不想睡？" },
      { text: "因为一睡着，这一天就结束了。", seconds: 3.5 },
      { text: "而这一天里，\n还没有一分钟是【属于自己】的。", seconds: 4.5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你用今晚的睡眠补偿白天的失去，\n明天更累，晚上就更不甘心。", seconds: 5 },
      { text: "你从别人手里抢回来的时间，\n最后还是从【自己身上】割下来的。", seconds: 5 },
    ],
  },
  {
    id: "remedy",
    lines: [
      { text: "真正的报复不是熬夜，\n而是在白天也给自己留出一段时间：", seconds: 5 },
      { text: "一顿好好吃的午饭，\n一段不回消息的路。", seconds: 4 },
    ],
  },
  {
    id: "ending",
    lines: [
      { text: "当你不必等到深夜才做回自己，\n每一个小时才都【属于自己】。", seconds: 5.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
