import type React from "react";
import type { SceneProps } from "../../types";
import { episode } from "./episode";
import { timeline } from "./timing";
import { fonts, palette } from "./look";
import { HookScene } from "./scenes/HookScene";
import { TitleScene } from "./scenes/TitleScene";
import { QuoteScene } from "./scenes/QuoteScene";
import { MisreadScene } from "./scenes/MisreadScene";
import { ChatScene } from "./scenes/ChatScene";
import { KeyholeScene } from "./scenes/KeyholeScene";
import { MirrorEyesScene } from "./scenes/MirrorEyesScene";
import { QuestionScene } from "./scenes/QuestionScene";
import { MirrorsScene } from "./scenes/MirrorsScene";
import { VerdictScene } from "./scenes/VerdictScene";
import { EndingScene } from "./scenes/EndingScene";

const scenes: Record<string, React.FC<SceneProps>> = {
  hook: HookScene,
  title: TitleScene,
  quote: QuoteScene,
  misread: MisreadScene,
  chat: ChatScene,
  keyhole: KeyholeScene,
  mirrorEyes: MirrorEyesScene,
  question: QuestionScene,
  mirrors: MirrorsScene,
  verdict: VerdictScene,
  ending: EndingScene,
};

export const pleasing = {
  data: episode,
  timeline,
  scenes,
  look: { accent: palette.accent, accentGlow: `rgba(${palette.accentRgb},0.6)`, font: fonts.sans },
};
