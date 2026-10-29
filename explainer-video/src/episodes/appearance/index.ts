import type React from "react";
import type { SceneProps } from "../../types";
import { episode, brand } from "./episode";
import { timeline } from "./timing";
import { backlitLookFx } from "../../channels/backlit/look";
import { TypewriterScene } from "../../channels/backlit/TypewriterScene";
import { HookScene } from "./scenes/HookScene";
import { TitleScene } from "./scenes/TitleScene";
import { DiagnosisScene } from "./scenes/DiagnosisScene";
import { MisreadScene } from "./scenes/MisreadScene";
import { EverydayScene } from "./scenes/EverydayScene";
import { CopyScene } from "./scenes/CopyScene";
import { NormalScene } from "./scenes/NormalScene";
import { AnswerScene } from "./scenes/AnswerScene";
import { CostScene } from "./scenes/CostScene";
import { RealScene } from "./scenes/RealScene";
import { EndingScene } from "./scenes/EndingScene";

const scenes: Record<string, React.FC<SceneProps>> = {
  hook: HookScene,
  title: TitleScene,
  diagnosis: DiagnosisScene,
  misread: MisreadScene,
  everyday: EverydayScene,
  copy: CopyScene,
  normal: NormalScene,
  answer: AnswerScene,
  question: TypewriterScene,
  cost: CostScene,
  real: RealScene,
  ending: EndingScene,
};

export const appearance = { data: episode, timeline, scenes, look: backlitLookFx, brand };
