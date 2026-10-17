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
import { DoubleScene } from "./scenes/DoubleScene";
import { AnswerScene } from "./scenes/AnswerScene";
import { PastScene } from "./scenes/PastScene";
import { RemedyScene } from "./scenes/RemedyScene";
import { EndingScene } from "./scenes/EndingScene";

const scenes: Record<string, React.FC<SceneProps>> = {
  hook: HookScene,
  title: TitleScene,
  diagnosis: DiagnosisScene,
  misread: MisreadScene,
  everyday: EverydayScene,
  double: DoubleScene,
  answer: AnswerScene,
  question: TypewriterScene,
  past: PastScene,
  remedy: RemedyScene,
  ending: EndingScene,
};

export const regret = { data: episode, timeline, scenes, look: backlitLook, brand };
