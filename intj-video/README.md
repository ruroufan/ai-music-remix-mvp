# 《INTJ · 正确》

一条 16:9 的动态文字视频。先用单页 HTML + GSAP 写成数据驱动的动画模板，再用 Playwright 逐帧确定性渲染，ffmpeg 合成 MP4。视觉风格参照 reference/ 里的《文字的顶峰》，拆解见 STYLE_NOTES.md；需求以 PROMPT.md 为准。

```
data.json          全片分镜（23 个镜头，91.5 秒），文字原样
src/index.html     页面（字体、gsap 都从 node_modules 本地加载）
src/style.css      三色：#0B0B0B / #F2F2F2 / #C8102E（关键词外发光 #FF5A1F）
src/main.js        模板：按 type 生成 hook / title / card / line / quote / end
render.js          静态服务 + Playwright + ffmpeg
assets/img/        图片素材（见 assets/README.md），缺图自动兜底
assets/bgm.mp3     可选，有就混进去，结尾 2 秒淡出
out/               输出
```

## 命令

```bash
npm install                                      # 第一次
node render.js                                   # 全片 → out/INTJ_正确.mp4
node render.js --from 0 --to 30 --out preview.mp4
node render.js --stills                          # 检查用截图 → out/stills/
```

- 改文案：直接改 data.json 的 a / b / key 等字段，再跑 `node render.js`。换行、缩字号会自动处理：后半句超过 14 个字会在逗号或冒号处断开；放不下时先缩小字号，最小到 60px；换行只断在词与词之间。
- 换图：把图片按 assets/README.md 里的文件名放进 assets/img/ 再渲染即可，彩色图也行，模板会统一转成灰度、高对比。`.png` 当作去背肖像放在右侧，`.jpg` 当作场景照铺满全屏，压暗并在左侧加黑色渐变。
- 加音乐：放入 assets/bgm.mp3，再跑 `node render.js`。
- Chromium 路径默认为 /opt/pw-browsers/chromium-1194；在别的机器上，用环境变量 `CHROME_PATH=/path/to/chrome` 指定。
