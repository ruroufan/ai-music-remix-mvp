# explainer-video — 暗房剧场风科普视频模板（Remotion）

复刻“七宗罪·傲慢”那类科普视频的做法：**画面全部用代码画**（SVG/CSS 剪影、聚光灯、粒子、碎裂文字），用 Remotion 逐帧渲染成 MP4。

示例包含 3 个分镜（约 27 秒）：

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

Remotion 首次渲染会自动下载 headless Chrome。下载不了时指定本机浏览器：

```bash
npx remotion render src/index.ts Explainer out/explainer.mp4 --browser-executable=/path/to/chrome
```

## 改成你自己的视频

1. **文案**：改 `src/script.ts`。每个分镜是一组旁白行，`seconds` 决定时长，`【】` 里的字标红，`\n` 换行。
2. **配音**：把 TTS 生成的音频放进 `public/voiceover/`，在对应行写 `audio: "voiceover/01.mp3"`，并把 `seconds` 改成音频真实时长——字幕和动画会自动重新对齐（场景内的动画都挂在 `cues[i]`，即第 i 句旁白的起始帧上）。
3. **品牌**：`src/theme.ts` 里的 `brand`（左上主题、右上水印）和配色。
4. **新分镜**：在 `src/scenes/` 新建组件（接收 `lines / cues / duration`），注册到 `src/Video.tsx` 的 `SCENES`，再在 `script.ts` 里引用它的 `id`。

## 可复用组件

- `Frame` — 黑底、暗角、胶片颗粒、页眉水印、场景淡入淡出
- `Subtitles` / `RichText` — 按旁白时间显示字幕，`【关键词】` 自动高亮
- `Silhouette` — 带轮廓光的剪影小人（整部片的“演员”）
- `Spotlight` — 顶光光锥 + 地面光斑
- `ShatterTitle` — 文字切成三角碎片后飞入拼合
- `Rays` — 随机放射线（适合“需要”“满足”这类关键词特写）

## 让 Claude Code 继续扩写的提示词示例

> 在 explainer-video 里新增一个分镜 `cup`：旁白“卢梭说，自尊心永远不会满足。”画面是聚光灯下一只石膏酒杯，杯底有裂缝，倒进去的光点不断从裂缝漏走。复用 Frame / Subtitles / Spotlight，风格与现有分镜一致。

字体使用 Noto Serif SC（SIL OFL），通过 `@fontsource/noto-serif-sc` 本地打包，渲染前会等待所有用到的字形加载完成。
