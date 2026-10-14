# explainer-video — 用代码做“踩点”科普视频（Remotion）

画面全部用代码绘制（SVG/CSS 剪影、光、粒子、文字动画），字幕和动作卡在音乐拍子上，背景音乐和音效也由代码合成，没有任何第三方素材。

现在有六期：

| 合成 ID | 期 | 风格 | 节奏 | 时长 |
|---|---|---|---|---|
| `Solitude` | **背光观察室 · 观察 No.06《孤独》**（叔本华“豪猪困境”） | 同频道风格；核心意象：雪地里的豪猪靠近、刺痛、分开；热闹人群里所有人轮廓清晰，只有主角是半透明的虚线；结尾他一个人坐在窗边，轮廓重新变清晰 | 120 BPM “drive”，F 小调 | ~1:50 |
| `Regret` | **背光观察室 · 观察 No.05《后悔》**（斯宾诺莎“后悔的人是双重的不幸”） | 同频道风格；核心意象：深夜的卧室，放映机把同一个片段循环投到墙上，片段越播越多、层层叠叠，最后放映机关掉、窗外天亮 | 120 BPM “drive”，C 小调 | ~1:54 |
| `Anxiety` | **背光观察室 · 观察 No.04《焦虑》**（克尔凯郭尔“焦虑是自由的眩晕”） | 同频道风格；核心意象：悬崖下无数条发光的岔路，俯拍、旋转、红蓝重影制造眩晕，最后踏上其中一条、其余熄灭 | 120 BPM “drive”，D 小调 | ~1:46 |
| `Inferiority` | **背光观察室 · 观察 No.03《自卑》**（阿德勒“优越感是对自卑的补偿”） | 同频道风格；核心意象：人物身上贴满金色标签，标签下透出被背光照亮的裂纹，结尾标签剥落、裂纹愈合 | 120 BPM “drive”，E 小调 | ~1:48 |
| `Pleasing` | **背光观察室 · 观察 No.02《讨好》**（萨特“他人即地狱”） | 冷蓝黑底、青色强调、光从人物**背后**打来；取景框、REC、时间码 | 120 BPM，“drive”配乐：鼓组 + 抽吸低音 + 琶音，段落间军鼓滚奏推进，A 小调 | ~1:48 |
| `Pride` | 《傲慢》——拆解参考视频结构的练习 | 暖黑底、顶光、石膏头像 | 72 BPM，“ambient”配乐 | ~1:58 |

## 运行

```bash
cd explainer-video
npm install
npm run studio          # 浏览器里预览所有期
npm run render          # 《孤独》→ out/solitude.mp4
npm run render:regret   # 《后悔》→ out/regret.mp4
npm run render:anxiety  # 《焦虑》→ out/anxiety.mp4
npm run render:inferiority # 《自卑》→ out/inferiority.mp4
npm run render:pleasing # 《讨好》→ out/pleasing.mp4
npm run render:pride    # 《傲慢》→ out/pride.mp4
```

渲染前会自动生成配乐和音效（`npm run music`）。Remotion 首次渲染会下载 headless Chrome，下载不了时加 `--browser-executable=/path/to/chrome`。

## 目录

```
src/
  channels/backlit/      背光观察室频道共用：
    channel.ts           频道名、片尾签名「这里是背光观察室，我们观察那些不被看见的部分。」
    look.ts              配色和字体
    ObsFrame.tsx         画框：取景框四角、REC、时间码、频道标识、切镜闪光
    parts.tsx            视觉零件：背光人物、巨眼、取景框、镜子、视线
    figure.tsx           三种姿势的人物剪影（自然 / 昂头 / 低头）
    TypewriterScene.tsx  打字机式单句分镜（“可这样活着，有什么不好？”）
    EndCard.tsx          片尾卡：频道名 + 逐字打出的签名
  episodes/
    registry.ts          所有期的数据登记表（配乐、配音、字体预加载都从这里读）
    solitude/            观察 No.06《孤独》（porcupine.tsx：雪地豪猪、人群与半透明的主角、窗边座位）
    regret/              观察 No.05《后悔》（projector.tsx：深夜卧室、放映机、循环播放的片段）
    anxiety/             观察 No.04《焦虑》（paths.tsx：发光岔路网、悬崖、眩晕镜头）
    inferiority/         观察 No.03《自卑》
      script.ts          文案（每个分镜一组字幕；最后一行是片尾签名）
      episode.ts         期号、BPM、每个分镜的音乐情绪
      gilded.tsx         这一期的核心意象：贴满金标签、带裂纹的人物，可剥落、可愈合
      scenes/*.tsx       分镜
    pleasing/            观察 No.02《讨好》
    pride/               《傲慢》（参考练习，不属于本频道）
  timeline.ts            节拍网格：每句字幕从拍点开始、每个分镜从小节线开始
  EpisodeVideo.tsx       通用播放器：按顺序播放分镜 + 配乐（+ 可选配音）
  components/            通用组件：字幕、音效、剪影、石膏头像、碎裂标题…
scripts/
  music.mjs              生成 public/music/<期>.wav 和 public/sfx/*.wav
  audio/score-drive.mjs  “drive”配乐（《讨好》）
  audio/score-ambient.mjs“ambient”配乐（《傲慢》）
  audio/sfx.mjs          音效：boom / shatter / rise / whoosh / glint / step / shutter / glitch / stamp
  voiceover.mjs          可选配音
```

## 改文案 / 做新一期

1. **文案**：改 `src/episodes/<期>/script.ts`。`【】` 里的字高亮，`\n` 换行。每句的停留时间按阅读速度自动算（每秒 7 字 + 0.8 秒），取整到整拍；某句需要多停一会儿，加 `seconds`。
2. **节拍**：`episode.ts` 里的 `bpm` 必须让一拍是整数帧（30fps 下 72 / 90 / 100 / 120 都可以）。分镜里用 `BEAT`、`HALF_BEAT`、`onBeat()` 把动作和音效对在拍上，`<Sfx>` 会自动对齐到最近的半拍。
3. **音乐**：`episode.ts` 的 `moods` 给每个分镜写和弦进行（每小节一个和弦，循环）和能量：
   - `0` 只有铺底（留白、结尾）
   - `1` 加低音脉冲和踩镲
   - `2` 加底鼓、军鼓/拍手、16 分踩镲，进段落时有镲片
   - `3` 再加琶音和开镲（高潮）

   能量升到 2 以上之前的一小节自动做军鼓滚奏 + 上升音；进能量 0 之前自动“急停”。
4. **新一期**：复制 `episodes/solitude`，改文案、分镜、`episode.ts`（期号、和弦、能量），在 `src/episodes/registry.ts` 和 `src/Root.tsx` 各登记一行。文案最后一行保留 `channel.signoff`，片尾签名就会自动出现。

## 可选：配音

默认没有配音（字幕 + 音乐）。需要时：

```bash
pip install edge-tts
npm run voiceover -- --episode=pleasing --engine=edge      # 在线，Edge TTS
# 或离线 Kokoro：pip install sherpa-onnx soundfile，下载 kokoro-multi-lang-v1_1 后
KOKORO_DIR=/path/to/kokoro-multi-lang-v1_1 npm run voiceover -- --episode=pleasing
```

有配音时每句时长会让位给配音长度，背景音乐在旁白处自动压低。想换回无配音，清空 `src/voiceover.generated.ts`。

## 版权说明

- 代码、画面、配乐、音效都是本项目原创生成的。
- 《傲慢》的文案来自参考视频的字幕，只作为结构练习；公开发布请用自己的文案（如《讨好》）。

字体：Noto Serif SC / Noto Sans SC / JetBrains Mono（均为 SIL OFL），通过 `@fontsource` 本地打包。
