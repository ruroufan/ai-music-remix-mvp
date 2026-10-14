import { continueRender, delayRender } from "remotion";
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/noto-serif-sc/900.css";
import { script } from "./script";
import { brand } from "./theme";

// The font is split into many unicode-range files that load lazily. Block the
// first frame until every glyph the video uses is downloaded, otherwise early
// frames render in a fallback font.
const glyphs = Array.from(
  new Set(
    script.flatMap((s) => s.lines.map((l) => l.text)).join("") +
      brand.topic + brand.watermark + "自爱心自尊心优越感",
  ),
).join("");

const handle = delayRender("Loading Noto Serif SC");
Promise.all(
  ["400", "700", "900"].map((w) => document.fonts.load(`${w} 48px "Noto Serif SC"`, glyphs)),
)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
