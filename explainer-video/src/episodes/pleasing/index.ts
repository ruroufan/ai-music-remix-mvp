import type React from "react";
import type { SceneProps } from "../../types";
import { episode, brand } from "./episode";
import { timeline } from "./timing";
import { backlitLook } from "../../channels/backlit/look";
import { HookScene } from "./scenes/HookScene";
import { TitleScene } from "./scenes/TitleScene";
import { QuoteScene } from "./scenes/QuoteScene";
import { MisreadScene } from "./scenes/MisreadScene";
import { ChatScene } from "./scenes/ChatScene";
import { KeyholeScene } from "./scenes/KeyholeScene";
import { MirrorEyesScene } from "./scenes/MirrorEyesScene";
import { TypewriterScene } from "../../channels/backlit/TypewriterScene";
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
  question: TypewriterScene,
  mirrors: MirrorsScene,
  verdict: VerdictScene,
  ending: EndingScene,
};

export const pleasing = {
  data: episode,
  timeline,
  scenes,
  look: backlitLook,
  brand,
};
