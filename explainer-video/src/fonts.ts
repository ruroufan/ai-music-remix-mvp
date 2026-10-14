import { continueRender, delayRender } from "remotion";
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/noto-serif-sc/900.css";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/700.css";
import "@fontsource/noto-sans-sc/900.css";
import "@fontsource/jetbrains-mono/400.css";
import { EPISODES } from "./episodes/registry";

// The font is split into many unicode-range files that load lazily. Block the
// first frame until every glyph the videos use is downloaded, otherwise early
// frames render in a fallback font.
const glyphs = Array.from(
  new Set(
    Object.values(EPISODES)
      .flatMap(({ episode, brand }) => [...episode.script.flatMap((s) => s.lines.map((l) => l.text)), ...Object.values(brand)])
      .join("") +
      // words drawn by the scenes themselves
      "自爱心自尊心优越感成绩单我需要满足站稳周末有人一起吃饭吗你撤回了一条消息分钟前对话判决被告人自由名校名表名牌精修照头衔年薪我们当年在毕竟是不经意昨天今天低着头昂着头同一种人藏贴金学试错长大变强显得强确认外卖附近又是它轻食沙拉黄焖鸡米饭麻辣烫寿司拼盘牛肉面螺蛳粉酸菜鱼汉堡套餐烤肉饭云吞面麻辣香锅披萨辞呈",
  ),
).join("");

const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 :·.-/…ÉÀØ✓✕∞≠";
const handle = delayRender("Loading fonts");
Promise.all([
  ...["400", "700", "900"].map((w) => document.fonts.load(`${w} 48px "Noto Serif SC"`, glyphs)),
  ...["400", "700", "900"].map((w) => document.fonts.load(`${w} 48px "Noto Sans SC"`, glyphs)),
  document.fonts.load(`400 20px "JetBrains Mono"`, latin),
])
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
