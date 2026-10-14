import type React from "react";
import type { SceneProps } from "../../types";
import { episode, brand } from "./episode";
import { timeline } from "./timing";
import { backlitLook } from "../../channels/backlit/look";
import { TypewriterScene } from "../../channels/backlit/TypewriterScene";
import { HookScene } from "./scenes/HookScene";
import { TitleScene } from "./scenes/TitleScene";
import { DiagnosisScene } from "./scenes/DiagnosisScene";
import { FableScene } from "./scenes/FableScene";
import { MisreadScene } from "./scenes/MisreadScene";
import { EverydayScene } from "./scenes/EverydayScene";
import { CrowdScene } from "./scenes/CrowdScene";
import { AnswerScene } from "./scenes/AnswerScene";
import { QuoteScene } from "./scenes/QuoteScene";
import { SolitudeScene } from "./scenes/SolitudeScene";
import { EndingScene } from "./scenes/EndingScene";

const scenes: Record<string, React.FC<SceneProps>> = {
  hook: HookScene,
  title: TitleScene,
  diagnosis: DiagnosisScene,
  fable: FableScene,
  misread: MisreadScene,
  everyday: EverydayScene,
  crowd: CrowdScene,
  answer: AnswerScene,
  question: TypewriterScene,
  quote: QuoteScene,
  solitude: SolitudeScene,
  ending: EndingScene,
};

export const solitude = { data: episode, timeline, scenes, look: backlitLook, brand };
