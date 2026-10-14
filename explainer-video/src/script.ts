// The whole video is driven by this file: one entry per scene, one entry per
// narration line. `npm run voiceover` speaks every line; each line then lasts
// max(seconds, its clip length + a short pause), and subtitles, animation cues
// and music ducking all re-time themselves from that.
//
// Text wrapped in 【】 is rendered in the accent colour. `\n` breaks the line.
// `say` (optional) overrides what the TTS reads, e.g. to fix a pronunciation.

export type Line = { text: string; seconds: number; say?: string };
export type SceneId = "title" | "twoLoves" | "podium";
export type SceneSpec = { id: SceneId; lines: Line[] };

export const script: SceneSpec[] = [
  {
    id: "title",
    lines: [
      { text: "为什么被人指出错误时，\n我们的第一反应，是反驳？", seconds: 3.6 },
      { text: "这，是七宗罪的第一宗——", seconds: 3.4 },
    ],
  },
  {
    id: "twoLoves",
    lines: [
      { text: "卢梭说，人有两种爱自己。", seconds: 3 },
      { text: "第一种，叫作【自爱心】：\n累了就睡觉，饿了就吃饭。", seconds: 4 },
      { text: "第二种，叫作【自尊心】：\n它只在和别人比较时才存在。", seconds: 4.4 },
    ],
  },
  {
    id: "podium",
    lines: [
      { text: "你要的不是好，", seconds: 2.4 },
      { text: "是【比别人好】。", seconds: 2.6 },
      { text: "也就是我们常说的【优越感】。", seconds: 3.6 },
    ],
  },
];
