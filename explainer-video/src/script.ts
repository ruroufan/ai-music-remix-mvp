// The whole video is driven by this file: one entry per scene, one entry per
// narration line. Scene length = sum of its line durations, so once you have a
// voiceover, replace `seconds` with the real clip lengths and everything
// (subtitles, animation cues) re-times itself.
//
// Text wrapped in 【】 is rendered in the accent colour. `\n` breaks the line.
// `audio` (optional) is a file under public/, e.g. "voiceover/01.mp3".

export type Line = { text: string; seconds: number; audio?: string };
export type SceneId = "title" | "twoLoves" | "podium";
export type SceneSpec = { id: SceneId; lines: Line[] };

export const script: SceneSpec[] = [
  {
    id: "title",
    lines: [
      { text: "为什么被人指出错误时，\n我们的第一反应，是反驳？", seconds: 3.6 },
      { text: "这，是七宗罪之首——", seconds: 3.4 },
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
