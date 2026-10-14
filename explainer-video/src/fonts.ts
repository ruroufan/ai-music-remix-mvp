import { continueRender, delayRender } from "remotion";
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/noto-serif-sc/900.css";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/700.css";
import "@fontsource/noto-sans-sc/900.css";
import "@fontsource/jetbrains-mono/400.css";
import { episode as pride, brand as prideBrand } from "./episodes/pride/episode";
import { episode as pleasing, brand as pleasingBrand } from "./episodes/pleasing/episode";

// The font is split into many unicode-range files that load lazily. Block the
// first frame until every glyph the videos use is downloaded, otherwise early
// frames render in a fallback font.
const glyphs = Array.from(
  new Set(
    [pride, pleasing].flatMap((e) => e.script.flatMap((s) => s.lines.map((l) => l.text))).join("") +
      Object.values(prideBrand).join("") +
      Object.values(pleasingBrand).join("") +
      "自爱心自尊心优越感成绩单我需要满足站稳周末有人一起吃饭吗你撤回了一条消息分钟前",
  ),
).join("");

const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 :·.-/…ÉÀ";
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
