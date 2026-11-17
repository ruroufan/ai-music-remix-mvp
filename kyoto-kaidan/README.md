# 京都怪谈 · 代码渲染短视频系列

用代码把一段文案渲染成 9:16 竖屏短视频：画面（Canvas 2D 逐帧绘制）、配音（本地离线 TTS）、
音效与配乐（numpy 合成）全部由程序生成，不依赖任何图片、视频或音频素材。

| 期数 | 标题 | 成片 |
|---|---|---|
| 第一夜 | 一条戻桥：第六夜的敲门声 | `out/kyoto-kaidan-ep01.mp4`、封面 `out/kyoto-kaidan-ep01-cover.jpg` |

## 一键出片

```bash
tools/build.sh ep01        # 配音 -> 时间轴 -> 混音 -> 并行渲染 -> 合成 mp4 + 封面
```

流程分五步，每一步都可以单独重跑：

| 步骤 | 命令 | 产物 |
|---|---|---|
| 配音 | `python3 tools/tts.py ep01` | `build/ep01/vo/Lxx.wav`、`vo.json`（每句时长与分句时间点） |
| 时间轴 | `python3 tools/timeline.py ep01` | `build/ep01/timeline.json`（镜头起止、字幕、声音标记） |
| 混音 | `python3 tools/audio.py ep01` | `build/ep01/audio.wav` 及四条分轨 |
| 自检 | `python3 tools/check_audio.py ep01` | 用语音识别“听”一遍成片，确认旁白发音正确、没被音乐盖住 |
| 渲染 | `node tools/render.mjs ep01 --out x.mp4` | 逐帧画面（1080×1920，30fps） |

**镜头长度完全由配音的实际长度推出。** 改文案、换声线、换语速后重跑即可，画面、字幕、音效会自动对位。

## 换成真人配音

把录好的句子放进 `ep01/vo_override/`，文件名用句子编号（`L01.wav` … `L31.wav`，编号见 `ep01/script.json`）。
存在的句子用录音，缺的句子仍用 TTS；然后 `tools/build.sh ep01`。

## 目录

```
ep01/script.json   文案：逐句文本、角色声线、语速
ep01/shots.json    分镜：每个镜头用哪个场景、挂哪几句旁白、停顿多久、转场方式
ep01/cues.py       声音提示表：哪个音效/乐句落在哪个标记上
web/lib.js         引擎基础：噪声、纸纹、光效、摄像机、竖排文字
web/main.js        主循环：取镜头 -> 画场景 -> 转场 -> 纸纹/颗粒/暗角 -> 字幕
web/art/           造型库（全片统一）：人物 chars.js、全身像 figures.js、道具 props.js
web/scenes/        场景：室内 room.js、夜桥 outdoor.js、登门与结尾 house.js
tools/synth.py     声音合成库：敲门、流水、马蹄、刀声、破屋顶、筝、尺八、太鼓、磬……
```

## 连续性（已固化在造型库里）

- 渡边纲：折乌帽子、藏青直垂、朱白衣领、三星一文字家纹、白柄朱缠太刀佩于左腰，全片同一套函数绘制。
- 木箱与封绳：同一只箱（铁角、符纸“封 / 鬼腕”、十字草绳），片头、封箱、六夜、开箱、空箱都是它。
- 女子变鬼保留被衣；祖母变鬼保留紫灰和服。
- 断臂固定为**右臂**。祖母登门时只见左手拄杖，抓臂用的也是左手。
- 敲门声：片头与第六夜使用同一段三连敲。
- 落版“京都怪谈 · 第 X 夜”：`endcard` 场景读取 `script.json` 里的 `night`，后续各期直接复用。

## 做下一期

1. 复制 `ep01/` 为 `ep02/`，改 `script.json`（文案）与 `shots.json`（分镜）。
2. 能复用的场景直接引用；新场景写在 `web/scenes/` 并在 `index.js` 注册。
3. `tools/build.sh ep02`。

## 环境

- Node 22 + Playwright（Chromium）、ffmpeg
- Python 3：`pip install sherpa-onnx soundfile numpy scipy pypinyin`
- 字体：`apt-get install fonts-noto-cjk fonts-noto-cjk-extra`（思源宋体 / 思源黑体）
- 配音模型（约 350 MB，不入库）：从 sherpa-onnx 的 `tts-models` 发布页下载 `kokoro-multi-lang-v1_1.tar.bz2`，
  解压到 `models/`（或用环境变量 `KAIDAN_TTS_MODELS` 指向所在目录）。
  自检另需 `asr-models` 发布页的 `sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17`。
