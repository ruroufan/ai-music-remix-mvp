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
import { StoicScene } from "./scenes/StoicScene";
import { AnswerScene } from "./scenes/AnswerScene";
import { CostScene } from "./scenes/CostScene";
import { EmperorScene } from "./scenes/EmperorScene";
import { EndingScene } from "./scenes/EndingScene";

const scenes: Record<string, React.FC<SceneProps>> = {
  hook: HookScene,
  title: TitleScene,
  diagnosis: DiagnosisScene,
  misread: MisreadScene,
  everyday: EverydayScene,
  stoic: StoicScene,
  answer: AnswerScene,
  question: TypewriterScene,
  cost: CostScene,
  emperor: EmperorScene,
  ending: EndingScene,
};

export const glass = { data: episode, timeline, scenes, look: backlitLookFx, brand };
