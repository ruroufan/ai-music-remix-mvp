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
import { CliffScene } from "./scenes/CliffScene";
import { AnswerScene } from "./scenes/AnswerScene";
import { EdgeScene } from "./scenes/EdgeScene";
import { QuoteScene } from "./scenes/QuoteScene";
import { EndingScene } from "./scenes/EndingScene";

const scenes: Record<string, React.FC<SceneProps>> = {
  hook: HookScene,
  title: TitleScene,
  diagnosis: DiagnosisScene,
  misread: MisreadScene,
  everyday: EverydayScene,
  cliff: CliffScene,
  answer: AnswerScene,
  question: TypewriterScene,
  edge: EdgeScene,
  quote: QuoteScene,
  ending: EndingScene,
};

export const anxiety = { data: episode, timeline, scenes, look: backlitLook, brand };
