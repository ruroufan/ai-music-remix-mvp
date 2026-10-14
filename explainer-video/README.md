# explainer-video — 暗房剧场风科普视频模板（Remotion）

复刻“七宗罪·傲慢”那类科普视频的做法：**画面全部用代码画**（SVG/CSS 剪影、聚光灯、粒子、碎裂文字），用 Remotion 逐帧渲染成 MP4。

示例包含 3 个分镜（约 32 秒），带中文配音、背景音乐和音效：

| 分镜 | 文件 | 画面 |
|---|---|---|
| 开场 | `src/scenes/TitleScene.tsx` | 透视地面上一排排眼睛，视线汇聚到台上的人 →“傲慢”碎片飞入拼合 |
| 两种爱自己 | `src/scenes/TwoLovesScene.tsx` | 分屏：暖光房间（自爱心）vs 镜子房间（自尊心），焦点随旁白切换 |
| 优越感 | `src/scenes/PodiumScene.tsx` | 人群仰望，中间的人脚下基座升起，烙上“优越感” |

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

- `public/music/bgm.wav` — 暗色氛围底：每个分镜换一个和弦（Dm → B♭ → Gm → A）、第二幕起有轻微心跳声、稀疏的高音钢琴点缀。时长按分镜时间轴生成，所以**改完配音后要重新跑一次**（`render` 前会自动跑）。
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

## 让 Claude Code 继续扩写的提示词示例

> 在 explainer-video 里新增一个分镜 `cup`：旁白“卢梭说，自尊心永远不会满足。”画面是聚光灯下一只石膏酒杯，杯底有裂缝，倒进去的光点不断从裂缝漏走。复用 Frame / Subtitles / Spotlight，风格与现有分镜一致。

字体使用 Noto Serif SC（SIL OFL），通过 `@fontsource/noto-serif-sc` 本地打包，渲染前会等待所有用到的字形加载完成。
