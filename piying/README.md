# 皮影戏风格历史短视频引擎

按《全局视觉规范·皮影戏风格历史短视频》实现的渲染引擎：每集写一份分镜脚本 `episode.json`，配上配音（和 SRT），一条命令出 1920×1080 / 30fps 的 MP4（H.264 + AAC），也可出 1080×1920 竖屏版。

技术路线是规范里的第二种：HTML Canvas 逐帧渲染（无头 Chromium），再用 ffmpeg 合成配音。

```
piying/
├── renderer/          渲染端（浏览器里运行）
│   ├── rig.js         皮影偶：SVG 分件 + 关节骨架、角色库、姿势库
│   ├── engine.js      舞台、镜头、转场、文字叠层、字幕、竖屏合成
│   └── fonts/         字体（由 fetch 脚本下载，不进 git）
├── tools/
│   ├── build.mjs      编译时间线 → 渲染 → 合成配音
│   ├── tts.py         离线 TTS 生成「预览配音」+ SRT（没有真人配音时先看节奏）
│   ├── align.py       没有 SRT 时：离线语音识别 + 与文案逐字对齐，生成 SRT
│   └── fetch_assets.sh 下载字体与模型
└── episodes/
    └── _example/      引擎示例（覆盖所有功能，也用作回归测试）
```

## 准备

需要 Node ≥ 20、Python ≥ 3.10、ffmpeg。

```bash
cd piying
npm install && npx playwright install chromium   # 渲染用的无头浏览器
bash tools/fetch_assets.sh                        # 字体（必需）
bash tools/fetch_assets.sh --all                  # 另加离线 TTS 与识别模型（可选，约 400MB）
pip install sherpa-onnx soundfile numpy           # 只有用 tts.py / align.py 时需要
```

## 出一集

```bash
mkdir episodes/ep01 && 编辑 episodes/ep01/episode.json
# 放入配音：episodes/ep01/voice.wav（或 .mp3/.m4a），有 SRT 就放 voice.srt
python3 tools/tts.py episodes/ep01                 # 可选：还没有配音时，生成预览配音 + SRT
node tools/build.mjs episodes/ep01 --preview 15    # 先抽帧看画面（每 15 帧一张，写到 preview/）
node tools/build.mjs episodes/ep01                 # 出横屏成片 → episodes/ep01/out.mp4
node tools/build.mjs episodes/ep01 --vertical      # 出竖屏 → out_vertical.mp4
node tools/build.mjs episodes/ep01 --from 20 --to 30   # 只渲染一段，改动后快速检查
```

没有 `voice.srt` 时，`build.mjs` 会自动调用 `align.py`：Silero VAD 切句 + Paraformer 中文识别，再用 difflib 与文案逐字对齐（识别有错字也能对上），生成逐句 SRT。示例上的误差约 0.1 秒/句。

渲染速度：在当前云环境约 6–7 帧/秒，一分钟成片约 5 分钟。

## 时间如何对齐（规范「时间对齐」一节）

- 每个镜头的开始时间 = 它的 `script` 第一句在 SRT 中的开始时间（先精确找，找不到再模糊匹配）。
- 片名镜头（`kind: "title"`）固定 2.5 秒，插在钩子句之后；`kind: "pause"`（停顿）镜头不对应配音，时长由 `duration` 指定。两者插入的时长都会让后面的配音整体顺延（音频里自动补静音）。
- 成片时长 = 配音时长 + 插入时长 + 片尾 2 秒。片尾：配音结束后灯灭（0.5 秒降到 0.15），定格最后画面成剪影。
- 字幕取自 SRT，按标点断句，一行不超过 16 字（超长的均分）；钩子句以大字呈现，不重复出字幕；竖排大字出现期间隐藏字幕。

## episode.json

```jsonc
{
  "series": "一分钟历史", "episode": 1, "title": "鸿门宴",
  "ttsReplace": { "40万": "四十万" },          // 仅 tts.py 用：朗读时的替换
  "shots": [
    { "kind": "hook", "script": "钩子句……", "scene": "hall", "cast": [...] },   // 暗场 + 居中大字
    { "kind": "title" },                                                        // 片名 2.5 秒
    {
      "id": "s1",
      "script": "这个镜头对应的文案（第一句用来对齐时间）。",
      "transition": "dissolve",              // 进入本镜头的转场：dissolve(默认 0.4s) | lights | curtain | scroll | cut
      "scene": "camp",                       // 布景预设：camp | hall | field | blank，可为 null
      "props": [{ "type": "table", "x": 700, "w": 220 }],   // 额外道具
      "light": 1,                            // 全局亮度 0~1（钩子默认 0.15）
      "camera": { "x": 960, "move": "pan", "toX": 1400 },   // 见下
      "cast": [
        { "who": "liubang", "x": 1500, "face": -1, "pose": "stand", "hold": "cup",
          "actions": [ { "do": "walk", "to": 1100, "at": "30%", "dur": 2 }, { "do": "pose", "name": "bow", "at": "80%" } ] }
      ],
      "nameplates": [ { "who": "liubang", "at": 0.5 } ],
      "numbers": [ { "text": "10万", "at": 1.2, "x": 1500, "y": 300 } ],
      "bigText": { "columns": ["项庄舞剑", "意在沛公"], "at": "30%" }
    },
    { "kind": "pause", "duration": 1.2, ... }               // 停顿镜头，字段同普通镜头
  ]
}
```

**时间写法**（任何 `at` 字段）：
- `"@短语"` = 配音念到这个短语的时刻（最贴合「念到 XX 时」这类要求，推荐）；可加偏移 `"@扛起+0.6"`。从本镜头开始处往后找，用 `align.py` 生成的逐字时间 `voice.chars.json`（没有就按整句插值）。
- 数字 = 镜头开始后的秒数；`"40%"` = 镜头时长的百分比；`"end-1.5"` = 镜头结束前 1.5 秒。

**坐标**：舞台世界坐标，镜头 1.0 时与 1920×1080 像素一致；地面线 y=880，`x` 是人物脚下位置。`face`：1 朝右，-1 朝左。

**镜头 `camera`**（只做平移和缩放，无旋转、无透视）：
- `move`：`static`、`pan`（x→toX）、`push`（1.0→1.15）、`fastpush`（0.4 秒推到 1.35）、`pull`（1.15→1.0），可组合如 `"pan+push"`。
- 自定义：`x`/`y`/`zoom` 为起点，`toX`/`toY`/`toZoom` 为终点，`at`/`dur` 指定这段运动的时间（默认整个镜头）。如「推近告示牌 1.0→1.3」。
- 跟随：`follow: { who, dx, at }` 镜头 x 跟着某个人物走。

**角色 `who`**：`qinxiaogong` 秦孝公（冕旒）、`shangyang` 商鞅、`porter` 扛木人、`villager` 百姓（小号 260px）、`xiangyu` 项羽、`liubang` 刘邦、`zhangliang` 张良、`fankuai` 樊哙、`fanzeng` 范增、`xiangzhuang` 项庄、`xiangbo` 项伯、`soldier` 士卒。新角色在 `rig.js` 的 `CHARS` 里加一行：配色（色名或 `#RRGGBB`）、帽子（helmet/crown/tall/liu/scholar/band/mianliu/kerchief/bun/helmetS）、胡须、脸色（light/black/red）、下摆（long/short）、镂空纹样（dots/scale/lattice/huiwen）、袖子（wide/tight）。
单个镜头里还可以：`look` 覆盖外观（如 `{"robe":"#B08F4A","s":0.95}`）；`layer` 调前后层次；`behindDoor: true` 站在客栈门后（身体被门挡住，只有手伸到门外）。同一镜头出现同一角色多次时用 `"id"` 区分（名牌、特效、镜头跟随都用 `id`）。

**姿势 `pose`**：`stand` `kneel` `bow` `kneel_bow` `point` `kneel_point` `angry` `kneel_angry` `raise` `kneel_raise` `kneel_drink` `kneel_silent` `kneel_talk` `kneel_lowhead` `talk` `cheer` `point_up` `carry` `give` `receive` `knock` `shield` `sword_up` `sword_low` `sneak` `mourn` `order` `smash_up` `smash_down` `fist`。新姿势在 `rig.js` 的 `POSES` 里用关节角度定义。

**动作 `actions[].do`**：
- `pose` {name, dur=0.4}：换姿势（ease-in-out 过渡）
- `beat` {name, dur}：短暂换姿势再回来（如三次举玦）
- `walk` / `run` {to, dur}：跳动式前进（每步起伏 6px）
- `turn` {dur=0.3}：转身（皮影翻面）
- `show` / `hide` {dur=0.3}：出场 / 退场
- `hold` {item, hand: near|far}：换手持道具 `sword` `jade` `cup` `dipper`(玉斗) `spear`，`null` 为空手
- `dance` {dur, dx}：舞剑；`lunge` {dur, dx}：前刺
- `carry` {len, on}：把长木横扛在肩上（`on:false` 放下）；`wave` {dur, times}：挥手

**道具 `props[].type`**：`table` `lamp`(油灯，带闪烁) `lampSmall`(案上小灯) `banner`{text,color} `tent` `screen`(屏风) `rack`(兵器架) `hill` `moon` `waves` `reeds`，以及：
- `gate` 城门 {x, w, plaque:"南门", plaqueTo:{text:"北门", at, dur}, alpha}
- `pole` 长木 {x, h=520, rise:{at,dur} 从地面升起, tilt:{at,dur,toX,toY} 倾倒到某处（如肩上）, lying:true 平放}
- `board` 告示牌 {x, cols:[竖排各列], strike:{at,dur} 红线划掉「十金」, stamp:{at,text} 盖红字}
- `map` 七国地图 {x,y,w,h, hang, qin:{at,dur} 秦由灰变黑红, conquer:[{state:"韩",at}, …] 逐块吞并}
- `inn` 客栈 {x, door:[{at, v 0~1, dur}] 门缝开合（带暖光）}

通用字段：`front: true` 画在人物前；`parallax: 0~1` 跟随镜头的程度（背景慢移）；`showAt`/`hideAt` 出现/消失时刻。

**灯光与色调**：`light` 起始亮度；`lightKeys: [{at, to, dur}]` 亮度变化（如「念最后一句时缓慢降到 0.15」）；`tint: {color, opacity}` 整个画面叠色（如夜景冷青滤镜）。灯焰在暗场里仍会发光；暗场里的片名/竖排大字自动换成浅色。

**特效 `effects`**：`{type:"pass", item:"gold", from, to, at, dur}` 物品从一人手中划弧飞到另一人手中；`{type:"sparkle", who, hand, at, dur, color, count}` 手边飘出光点粒子。

**钩子镜头**：`text` 居中显示的钩子句（不写就用整段文案），`textAt` 出现时刻（如 `"@你信吗"`），`subtitles: true` 钩子期间照常出字幕（当居中大字只是文案的一部分时用）。

**叠层**：
- `nameplates`：{who, at, text?, dx?, dy?} 头顶斜上方红底竖牌，弹入后停 2 秒淡出
- `numbers`：{text, at, x, y | who(+anchor:"jade"), dx, dy, size=120, dur=2.2} 红色书法字弹出
- `bigText`：{columns, at, x?, y?, colors?} 右侧竖排 96px，逐字淡入，最后盖印章，停到镜头结束

## 规范中未写明处的默认做法

- 钩子句字体用 Ma Shan Zheng（规范只指定了片名/竖排大字与字幕/名牌的字体）。
- 竖屏：舞台上下为深褐底 `#21140c`，系列名「一分钟历史 · 第N集」在舞台上方；字幕在舞台下方，改为浅色字深色描边（暗底上可读）。
- 竖排大字与片名用同一枚「历史」印章。
- 帷幔、地面线随镜头一起平移缩放（世界坐标），这样平移时能看出镜头在走；规范里的 y 值指镜头 1.0 时。
- 只合成配音，不加背景音乐。

## 预览配音说明

`tts.py` 用离线 MeloTTS（sherpa-onnx）生成，仅供看节奏、调分镜；正式成片请用真人配音（放 `voice.wav`，有 SRT 更好）。
