// 《后悔》— 背光观察室 · 观察 No.05
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). Text in 【】 is highlighted.
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  {
    id: "hook",
    lines: [
      { text: "为什么一件小事，\n我们能反刍一整晚？" },
      { text: "这，是最安静的一种自我折磨——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "后悔", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "斯宾诺莎在《伦理学》里\n留下过一句冷酷的诊断：" },
      { text: "后悔的人，是双重的不幸。", seconds: 4 }, // shown as a big quote
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对后悔的认知。" },
      { text: "我们通常以为，后悔是在反省，\n说明我们有良心、会成长。", seconds: 4 },
      { text: "可斯宾诺莎说，后悔不是【美德】。", seconds: 3.5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么白天开会说错一句话，\n晚上躺在床上还在脑子里重播？", seconds: 4.5 },
      { text: "为什么十年前没选的那条路，\n一到深夜就跳出来？" },
      { text: "为什么明知道回不去，\n还是忍不住想：如果当时……", seconds: 4 },
    ],
  },
  {
    id: "double",
    lines: [
      { text: "斯宾诺莎把后悔拆成两层：" },
      { text: "第一层，\n是那件事本身带来的损失；" },
      { text: "第二层，是我们一遍遍回到那里，\n再痛一次。", seconds: 4 },
      { text: "事情只发生了一次，\n我们却让它发生了【一百次】。", seconds: 4.5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么一件小事\n能反刍一整晚？" },
      { text: "因为我们以为，只要想得足够多，\n就能把它改回来。", seconds: 4.5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "past",
    lines: [
      { text: "反省是看着过去，为了走向未来；", seconds: 3.5 },
      { text: "后悔是看着过去，然后留在了那里。", seconds: 3.5 },
      { text: "你一边惩罚昨天的自己，\n一边耽误着今天的自己。", seconds: 4 },
    ],
  },
  {
    id: "remedy",
    lines: [
      { text: "斯宾诺莎给的解药是【理解】：", seconds: 3 },
      { text: "当你明白一件事在当时为什么会那样发生，\n它对你的支配就少了一分。", seconds: 5 },
      { text: "那个说错话的你、选错路的你，\n当时也只是尽力了。", seconds: 4.5 },
    ],
  },
  {
    id: "ending",
    lines: [
      { text: "让它只发生一次就够了。", seconds: 4 },
      { text: "放过它，也放过你自己。", seconds: 5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
