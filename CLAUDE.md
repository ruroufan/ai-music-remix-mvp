# 项目约定（每次会话自动加载）

## 16种MBTI系列：两种出片风格

用户会说「以风格1的形式生成」或「以风格2的形式生成」，后面给一篇人格文案（例如「INTP｜为什么……」）。按下面的约定直接出片，不必再问风格细节。

### 风格1：背光观察室 · 动态插画版（Remotion，`explainer-video/`）

范例：`src/episodes/intj/`《INTJ · 正确》、`src/episodes/intp/`《INTP · 想太多》、`src/episodes/entj/`《ENTJ · 赢》。

- **结构**：每期一个文件夹 `src/episodes/<代码小写>/`，包含 `script.ts`、`episode.ts`、`timing.ts`、`index.ts`、`scenes/`，再加一个画面核心组件（例如 blueprint.tsx、study.tsx）。
  - 注册四处：`src/episodes/registry.ts`、`src/Root.tsx`、`src/types.ts` 里的 music 联合类型、`scripts/music.mjs` 里的 SCORES。
- **开头**：第一个场景固定是系列卡 `series`，用 `seriesCard("<代码>")`（`src/episodes/mbti/series.tsx`）。显示「16种MBTI系列之××组（××）<代码>」，并点亮对应的组。
- **场景顺序**：series → hook → title（困境词）→ diagnosis（哲学家档案和引语卡）→ misread（颠覆）→ everyday（三个“为什么”，镜头甩切）→ 哲学家段 → answer → question（TypewriterScene）→ cost → 转折或审视 → ending。
- **冲击层**：每个场景都叠 `src/episodes/mbti/impact.tsx` 的 ImpactBack、ImpactFront 和 keyHits（重点词闪光、冲击波、背景巨字、节拍边缘光）。
- **文案处理**：重点词用 `【【】】` 标出，次重点用 `【】`。没有旁白，只有字幕和音乐。
- **结尾**：必须以频道结束语收尾（`channel.signoff` 作为最后一行，配 EndCard）。
- **画面**：文案里给了「画面」就照做；没给时，自己设计一个贯穿全片的核心意象。
- **配乐**：每期换一种新风格，写成 `scripts/audio/score-<风格>.mjs`。已用过：drive、ambient、clockwork、lofi、cassette、cinematic、guochao、stompclap、afrohouse、futurebass、electroswing、phonk、dembow、acid、breakbeat、frenchhouse、glitchhop、industrial、trance、arenarock。
- **流程**：
  1. 跑 `npx tsc --noEmit --noUnusedLocals`。
  2. 渲染半分辨率草稿，做联系表逐镜检查。
  3. 渲染全片，再做分享版：-14.5 LUFS，真峰值 ≤ -1。
  4. 用 SendUserFile 发给用户，并用中文说明画面、重点词、配乐和响度。
- **package.json**：`render` 指向最新一期，上一期改成 `render:<id>`。README 同步更新。

### 风格2：《文字的顶峰》档案风 · 黑白红文字版（GSAP + Playwright，`intj-video/`）

范例：`intj-video/`《INTJ · 正确》。版式拆解见 `intj-video/STYLE_NOTES.md`，需求原文见 `intj-video/PROMPT.md`。

- **技术**：单页 HTML + GSAP 时间轴（`src/main.js` 按 data.json 的 type 生成镜头）。`render.js` 用 Playwright 逐帧调 `seekTo` 截图，送给 ffmpeg，输出 1920×1080、30fps、H.264、yuv420p、CRF 18。所有随机效果都用帧号做种子。
- **配色**：只用三色 #0B0B0B、#F2F2F2、#C8102E，关键词外发光可以用 #FF5A1F。
  - 禁止：其他颜色、霓虹线框、散景光斑、仪表读数、火柴人、蓝图线框、系列选择网格、品牌口号片尾。
- **字体**：前半句 Noto Serif SC 900（72px）；后半句 Zhi Mang Xing（逐字错落，按 92px 排，视觉上约等于参考帧的 80px）；英文和数字 Bebas Neue；等宽小字 IBM Plex Mono。
- **镜头类型**：series（开头系列卡「16种MBTI系列 / 之 · ××组（××）/ <代码>」，不用网格）、hook、title、card、line、quote、end。
  - 可选字段：strike、reticle、decode、invert、push、strikeTitle。
- **新做一期**：
  1. 复制 `intj-video/` 为新目录。
  2. 按文案改写 data.json（原文一个字都不改）。
  3. 跑 `node scripts/bgm.mjs` 生成配乐。
  4. 跑 `node render.js --stills`，逐张和 reference/ 对照检查。
  5. 跑 `node render.js`。
  6. 把音频做到 -14.5 LUFS，再做一个 CRF 26 的发送版，然后发给用户。
- **缺图兜底**：assets/img/ 缺图时，用纯黑底加该镜头的描边大字代替，并告诉用户缺了哪些图。

## 通用

- 只推送到指定的开发分支，不要建 PR，不要在任何地方写入用户邮箱。
- 提交信息末尾带会话要求的 Co-Authored-By 和 Claude-Session 两行。
- 每次改完都要提交并推送（stop hook 会检查）。
