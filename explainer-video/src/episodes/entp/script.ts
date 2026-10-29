// 《ENTP · 抬杠》— 背光观察室 · 16种MBTI系列 No.04（分析家组 NT）
//
// One entry per scene, one entry per subtitle line (see timeline.ts for how
// lines are timed onto the 120 BPM grid). 【】 highlights; 【【】】 marks the
// phrase in a line most likely to land with the viewer (components/Kinetic.tsx).
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  { id: "series", lines: [{ text: "16种MBTI系列之分析家组（NT）ENTP", seconds: 3.5 }] }, // the series card, no subtitle
  {
    id: "hook",
    lines: [
      { text: "为什么ENTP赢了每一场争论，\n却【【输掉了不少朋友】】？", seconds: 4.5 },
      { text: "这，是“辩论家”ENTP最深的困境——", seconds: 3.5 },
    ],
  },
  { id: "title", lines: [{ text: "抬杠", seconds: 3.5 }] },
  {
    id: "diagnosis",
    lines: [
      { text: "德国哲学家叔本华\n写过一本小书，", seconds: 3.5 },
      { text: "专门总结怎样在争论中\n永远获胜。", seconds: 5 }, // shown as a quote card
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对ENTP的认知。" },
      { text: "我们通常以为，ENTP爱辩论，\n是因为追求真理。", seconds: 4 },
      { text: "可叔本华在书里一针见血：", seconds: 2.5 },
      { text: "人们争论时，关心的往往不是真理，\n而是【【自己是对的】】。", seconds: 5 },
    ],
  },
  {
    id: "everyday",
    lines: [
      { text: "为什么朋友只是随口一说，\n你非要指出【【逻辑漏洞】】？", seconds: 4.5 },
      { text: "为什么别人认同了你的观点，\n你反而【【换到对面去反驳】】？", seconds: 5 },
      { text: "为什么吵赢了，\n心里却【【有点空】】？", seconds: 3.5 },
    ],
  },
  {
    id: "schopenhauer",
    lines: [
      { text: "叔本华说，如果人天生诚实，\n争论就只会是为了真理。", seconds: 4.5 },
      { text: "可人有【虚荣心】，\n不肯承认自己错了，", seconds: 3.5 },
      { text: "于是辩论变成了一场比赛：赢的不一定是对的，\n【【只是更会说的】】。", seconds: 6 },
      { text: "他列出了三十八种取胜的诡计，\n正是为了让人【【认出它们】】。", seconds: 5 },
    ],
  },
  {
    id: "answer",
    lines: [
      { text: "那么，为什么赢了争论，\n却输了朋友？", seconds: 3.5 },
      { text: "因为对方想要的是一次交谈，\n你却给了他【【一场比赛】】。", seconds: 5 },
    ],
  },
  { id: "question", lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }] },
  {
    id: "cost",
    lines: [
      { text: "你的脑子越来越快，能和你说话的人\n却【【越来越少】】。", seconds: 5 },
      { text: "没有人愿意每次一开口，\n就被当成【【对手】】。", seconds: 4 },
    ],
  },
  {
    id: "turn",
    lines: [{ text: "叔本华自己也清楚，这些技巧\n能赢下辩论，却【【赢不来真理】】。", seconds: 5 }],
  },
  {
    id: "ending",
    lines: [
      { text: "下一次，试着在对方说完之后，\n只回一句【【“你说得有道理”】】。", seconds: 5 },
      { text: "放下输赢，\n你才真正【【靠近了真理】】。", seconds: 4.5 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
