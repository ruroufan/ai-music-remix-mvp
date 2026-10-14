// The whole video is driven by this file: one entry per scene, one entry per
// subtitle line. Each line stays up long enough to be read (see timeline.ts),
// rounded to whole beats of the music; subtitles, animation cues and the score
// all re-time themselves from that.
//
// Text wrapped in 【】 is rendered in the accent colour. `\n` breaks the line.
// `seconds` (optional) forces a longer hold for a line.
// `say` (optional) is what the TTS reads if you add a voiceover (`npm run voiceover`).

export type Line = { text: string; seconds?: number; say?: string };
export type SceneId =
  | "title"
  | "diagnosis"
  | "misconception"
  | "social"
  | "twoLoves"
  | "podium"
  | "scores"
  | "rebuttal"
  | "question"
  | "cup"
  | "rank"
  | "audience"
  | "standFirm";
export type SceneSpec = { id: SceneId; lines: Line[] };

export const script: SceneSpec[] = [
  {
    id: "title",
    lines: [
      { text: "为什么被人指出错误时，\n我们的第一反应，是反驳？" },
      { text: "这，是七宗罪的第一宗——", seconds: 4.6 },
    ],
  },
  {
    id: "diagnosis",
    lines: [
      { text: "西方哲学史上，\n卢梭曾给出关于傲慢最著名的诊断：" },
      { text: "傲慢的人，最离不开别人。", seconds: 3.4 },
    ],
  },
  {
    id: "misconception",
    lines: [
      { text: "这可能会颠覆你对【傲慢】的认知。" },
      { text: "我们通常认为，\n傲慢就是狂妄自大，谁也不需要。", say: "我们通常认为，傲慢就是狂妄、自大，谁也不需要。" },
      { text: "可傲慢并非不需要别人，\n而是离不开别人。" },
    ],
  },
  {
    id: "social",
    lines: [
      { text: "为什么朋友圈发出去没有点赞，\n我们就想删掉？" },
      { text: "为什么群里你的发言没人回复，\n我们便想着撤回？" },
      { text: "这正是我们太【需要】别人的表现。" },
    ],
  },
  {
    id: "twoLoves",
    lines: [
      { text: "卢梭说，人有两种爱自己。" },
      { text: "第一种，叫作【自爱心】：\n累了就睡觉，饿了就吃饭，\n只管自己过得好不好。" },
      { text: "第二种，叫作【自尊心】：\n它只在和别人比较时才存在。" },
    ],
  },
  {
    id: "podium",
    lines: [
      { text: "你要的不是好，" },
      { text: "是【比别人好】。" },
      { text: "也就是我们常说的【优越感】。" },
    ],
  },
  {
    id: "scores",
    lines: [{ text: "成绩一出来，\n我们会去关注别人的分数。" }],
  },
  {
    id: "rebuttal",
    lines: [
      { text: "那么，为什么被人指出错误时，\n我们的第一反应，是反驳？" },
      { text: "因为认错，就等于承认：\n在这件事上，他比我们强。" },
      { text: "所以，话还没听完，\n反驳已经到了嘴边。" },
      { text: "我们护住的并非对错，\n而是那一点【优越感】。" },
    ],
  },
  {
    id: "question",
    lines: [{ text: "可这样活着，有什么不好？" }],
  },
  {
    id: "cup",
    lines: [
      { text: "卢梭说，自尊心永远不会满足。" },
      { text: "因为它要的，\n是别人把你放在他们自己前面。" },
      { text: "而这，是不可能的。" },
    ],
  },
  {
    id: "rank",
    lines: [
      { text: "考了第一名，\n我们又开始提防第二名。" },
      { text: "傲慢的人，一刻也离不开别人，\n又永远等不到【满足】。" },
    ],
  },
  {
    id: "audience",
    lines: [
      { text: "自爱心却不需要观众：" },
      { text: "一顿饭，一夜好觉，\n一件做到自己满意的事。" },
    ],
  },
  {
    id: "standFirm",
    lines: [
      { text: "当你不再站在别人的目光上，" },
      { text: "你才算第一次【站稳】。", seconds: 5.8 },
    ],
  },
];
