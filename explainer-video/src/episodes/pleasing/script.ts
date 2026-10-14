// 《讨好》— 背光观察室 · 观察 No.02
//
// One entry per scene, one entry per subtitle line. Each line stays up long
// enough to be read, rounded to whole beats (120 BPM), and every scene starts
// on a bar line. Text in 【】 is highlighted; `\n` breaks the line.
import type { SceneSpec } from "../../types.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const script: SceneSpec[] = [
  {
    id: "hook",
    lines: [
      { text: "为什么别人一皱眉，\n我们就开始反思自己？" },
      { text: "这，是这个时代最体面的病——" },
    ],
  },
  {
    id: "title",
    lines: [{ text: "讨好", seconds: 3.5 }], // the title card; the beat drops here
  },
  {
    id: "quote",
    lines: [
      { text: "萨特留下过一句被误读最多的话：" },
      { text: "他人即地狱。", seconds: 3.5 }, // shown as a big quote
    ],
  },
  {
    id: "misread",
    lines: [
      { text: "这可能会颠覆你对这句话的认知。" },
      { text: "我们通常以为，\n它是在说别人很坏。" },
      { text: "可萨特真正想说的是：\n我们只能透过别人的目光，看见自己。" },
    ],
  },
  {
    id: "chat",
    lines: [
      { text: "为什么消息发出去，对方只回了一个“哦”，\n我们就开始逐字检查自己说错了什么？" },
      { text: "为什么领导多看了一眼，\n我们就怀疑今天是不是表现不好？" },
      { text: "我们交出去的不是情绪，\n是对自己的【评判权】。" },
    ],
  },
  {
    id: "keyhole",
    lines: [
      { text: "萨特讲过一个场景：" },
      { text: "一个人趴在门边偷看，\n全神贯注，忘了自己。" },
      { text: "走廊里忽然传来脚步声。", seconds: 3 },
      { text: "那一瞬间，他“看见”了自己：\n一个正在偷看的人。" },
      { text: "【羞耻】就在这一刻诞生。" },
      { text: "别人的目光，\n把我们变成了一个被看的东西。" },
    ],
  },
  {
    id: "mirrorEyes",
    lines: [
      { text: "那么，为什么别人一皱眉，\n我们就开始反思自己？" },
      { text: "因为在那一刻，\n我们把别人的眼睛当成了自己的【镜子】。" },
    ],
  },
  {
    id: "question",
    lines: [{ text: "可这样活着，有什么不好？", seconds: 3 }],
  },
  {
    id: "mirrors",
    lines: [
      { text: "镜子有一千面，\n每一面照出的你都不一样。" },
      { text: "你讨好了这一个，\n又辜负了那一个。" },
      { text: "到最后所有人都满意了，\n只有你不知道自己长什么样。", seconds: 4.5 },
    ],
  },
  {
    id: "verdict",
    lines: [
      { text: "萨特说，人是被判定为自由的，" },
      { text: "你要为自己成为什么【负责】。" },
    ],
  },
  {
    id: "ending",
    lines: [
      { text: "当你不再住在别人的眼睛里，", seconds: 3.5 },
      { text: "那道目光，就只是目光。", seconds: 4 },
      { text: channel.signoff, seconds: 6 }, // end card: the channel sign-off
    ],
  },
];
