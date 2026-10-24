import type React from "react";
import type { SceneProps } from "../../types";
import { episode, brand } from "./episode";
import { timeline } from "./timing";
import { backlitLook } from "../../channels/backlit/look";
import { TypewriterScene } from "../../channels/backlit/TypewriterScene";
import { HookScene } from "./scenes/HookScene";
import { TitleScene } from "./scenes/TitleScene";
import { DiagnosisScene } from "./scenes/DiagnosisScene";
import { MisreadScene } from "./scenes/MisreadScene";
import { EverydayScene } from "./scenes/EverydayScene";
import { EndedScene } from "./scenes/EndedScene";
import { AnswerScene } from "./scenes/AnswerScene";
import { CostScene } from "./scenes/CostScene";
import { QuoteScene } from "./scenes/QuoteScene";
import { EndingScene } from "./scenes/EndingScene";

const scenes: Record<string, React.FC<SceneProps>> = {
  hook: HookScene,
  title: TitleScene,
  diagnosis: DiagnosisScene,
  misread: MisreadScene,
  everyday: EverydayScene,
  ended: EndedScene,
  answer: AnswerScene,
  question: TypewriterScene,
  cost: CostScene,
  quote: QuoteScene,
  ending: EndingScene,
};

export const nostalgia = { data: episode, timeline, scenes, look: backlitLook, brand };
