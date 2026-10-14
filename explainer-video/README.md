# explainer-video — 暗房剧场风科普视频模板（Remotion）

复刻“七宗罪·傲慢”那类科普视频的做法：**画面全部用代码画**（SVG/CSS 剪影、聚光灯、粒子、碎裂文字），用 Remotion 逐帧渲染成 MP4。

完整复刻了原片的 13 个分镜（约 2 分 18 秒），带中文配音、背景音乐和音效：

| # | 分镜 | 文件 | 画面 |
|---|---|---|---|
| 1 | 开场 | `TitleScene` | 被指出错误的石膏头像（红色激光、面部开裂）→ 头像立在众人的目光上，“傲慢”碎片飞入拼合 |
| 2 | 诊断 | `DiagnosisScene` | 头像倒地碎裂；卢梭的诊断“傲慢的人，最离不开别人”像光束一样落下 |
| 3 | 误解 | `MisconceptionScene` | 头像立在柱子上，柱子升高（“谁也不需要”）→ 柱子消失，真正托住它的是众人的目光 |
| 4 | 社交 | `SocialScene` | 零赞的朋友圈坠落、群聊消息被撤回 →“需要”放射金线 |
| 5 | 两种爱自己 | `TwoLovesScene` | 分屏：暖光房间（自爱心）vs 镜子房间（自尊心） |
| 6 | 优越感 | `PodiumScene` | 人群仰望，基座升起，烙上“优越感” |
| 7 | 成绩单 | `ScoresScene` | 第 3 名的目光一路滑向 98 和 95 |
| 8 | 反驳 | `RebuttalScene` | 激光与裂痕重现 → 高台上的他与站在“优越感”上的我们，声波与红色反驳线 → 推近 |
| 9 | 发问 | `QuestionScene` | 只有一句话，缓慢推近 |
| 10 | 漏杯 | `CupScene` | 有裂缝的石膏杯：光点不断倒入、不断漏走 → 七个人都想站到别人前面 |
| 11 | 名次 | `RankScene` | 第一名回头提防第二名 →“满足”化为尘埃 |
| 12 | 无需观众 | `AudienceScene` | 空座位下的一盏灯、一张桌：一碗饭、一扇夜窗、一只纸鹤 |
| 13 | 站稳 | `StandFirmScene` | 站在目光上的人，目光闭合散去，落到真实的石头地面上 —“站稳” |

> 原片没有旁白，只有字幕和配乐；这里的配音是额外加的。文案按原片字幕，个别字句为了 TTS 读准做了微调（见 `script.ts`）。

## 运行

```bash
cd explainer-video
npm install
npm run studio     # 浏览器里实时预览、拖时间轴
npm run render     # 输出 out/explainer.mp4
```

仓库里已带好示例配音（`public/voiceover/*.mp3`）。背景音乐和音效由代码合成，`studio` / `render` 前会自动生成（也可手动 `npm run music`）。

Remotion 首次渲染会自动下载 headless Chrome。下载不了时指定本机浏览器：

```bash
npx remotion render src/index.ts Explainer out/explainer.mp4 --browser-executable=/path/to/chrome
```

## 改成你自己的视频

1. **文案**：改 `src/script.ts`。每个分镜是一组旁白行，`【】` 里的字标红，`\n` 换行；`seconds` 是这一句的最短停留时间，`say` 可以让配音读一个和字幕不同的写法（修发音用）。
2. **配音**：`npm run voiceover`（见下节），每句的时长会变成 `max(seconds, 配音长度 + 0.45s 停顿)`，字幕、动画（都挂在 `cues[i]` 即第 i 句的起始帧上）、背景音乐的闪避都会自动重新对齐。
3. **品牌**：`src/theme.ts` 里的 `brand`（左上主题、右上水印）和配色。
4. **新分镜**：在 `src/scenes/` 新建组件（接收 `lines / cues / duration`），注册到 `src/Video.tsx` 的 `SCENES`，再在 `script.ts` 里引用它的 `id`。

## 配音与音乐

### 配音：`npm run voiceover`

读取 `src/script.ts` 的每一句 → TTS → 用 ffmpeg 裁掉首尾静音、响度统一到 -16 LUFS → 写入 `public/voiceover/<场景>-<序号>.mp3` 和 `src/voiceover.generated.ts`（时长清单）。需要本机有 ffmpeg/ffprobe。两种引擎：

- **Edge TTS（在线，最省事）**
  ```bash
  pip install edge-tts
  npm run voiceover -- --engine=edge                         # 默认 zh-CN-YunjianNeural（低沉男声）
  npm run voiceover -- --engine=edge --voice=zh-CN-YunxiNeural
  ```
- **Kokoro（离线，示例配音用的就是它）**
  ```bash
  pip install sherpa-onnx soundfile
  curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_1.tar.bz2
  tar xjf kokoro-multi-lang-v1_1.tar.bz2
  KOKORO_DIR=$PWD/kokoro-multi-lang-v1_1 npm run voiceover   # 默认男声 60，语速 0.95
  ```
  可用 `--voice=<0-102>` 换音色（58 以后是中文男声）、`--speed=0.9` 调语速。

某个词读不准时，在那一行加 `say` 换个写法，或者直接改文案——示例里“七宗罪之首”被读错，就改成了“七宗罪的第一宗”。

### 背景音乐与音效：`npm run music`

`scripts/music.mjs` 纯代码合成，不含任何第三方音频素材：

- `public/music/bgm.wav` — 暗色氛围底：每个分镜一个和弦、紧张段落有轻微心跳声、稀疏的高音钢琴点缀；结尾“站稳”解决到 D 大调。分镜的情绪在 `scripts/music.mjs` 的 `MOODS` 里配置（新分镜不配置也能用，会自动轮换小调和弦）。时长按分镜时间轴生成，所以**改完配音后要重新跑一次**（`render` 前会自动跑）。
- `public/sfx/` — `boom`（低频冲击）、`shatter`（碎裂）、`rise`（上升张力）、`whoosh`（转场风声）、`glint`（玻璃叮声）。

音效在分镜代码里紧挨着对应动画放置，时间轴变化时会一起移动：

```tsx
<Sfx name="boom" at={cues[2] + 10} volume={0.7} />   // 与“优越感”烙印动画同一帧
```

背景音乐在 `src/Video.tsx` 里有旁白时自动压低（`MUSIC_DUCKED`），句间恢复（`MUSIC_VOLUME`）。想换成自己的配乐，把文件放到 `public/music/bgm.wav` 并去掉 `package.json` 里的 `prerender` / `prestudio` 即可。

## 可复用组件

- `Frame` — 黑底、暗角、胶片颗粒、页眉水印、场景淡入淡出
- `Subtitles` / `RichText` — 按旁白时间显示字幕，`【关键词】` 自动高亮
- `Silhouette` — 带轮廓光的剪影小人（整部片的“演员”）
- `Spotlight` — 顶光光锥 + 地面光斑
- `ShatterTitle` — 文字切成三角碎片后飞入拼合
- `Rays` — 随机放射线（适合“需要”“满足”这类关键词特写）
- `Sfx` — 在某一帧播放一个音效
- `Bust` — 石膏颅相学头像（侧面），可开裂、射出激光、平躺
- `GazeField` / `WatchingEyes` — 透视地面上凝视某一点的眼睛阵列 / 黑暗中闭着的眼睛
- `Pedestal` / `Floor` — 白色基座（可烙字）/ 舞台地面
- `GlowWord` / `Dust` — 金色关键词 / 让一块区域化为粒子散落

## 让 Claude Code 做下一期的提示词示例

> 用 explainer-video 模板做七宗罪的第二期“嫉妒”：先写 12 个分镜左右的文案到 script.ts（钩子提问 → 哲学家的诊断 → 生活中的例子 → 落点），每个分镜写一个新的 scene 组件，复用 Bust / Silhouette / Spotlight / GazeField / Pedestal 等组件，保持暗房剧场风格；然后跑 voiceover、render。

字体使用 Noto Serif SC（SIL OFL），通过 `@fontsource/noto-serif-sc` 本地打包，渲染前会等待所有用到的字形加载完成。
