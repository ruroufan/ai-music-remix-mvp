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
import { TwiceScene } from "./scenes/TwiceScene";
import { AnswerScene } from "./scenes/AnswerScene";
import { TiredScene } from "./scenes/TiredScene";
import { ScaleScene } from "./scenes/ScaleScene";
import { EndingScene } from "./scenes/EndingScene";

const scenes: Record<string, React.FC<SceneProps>> = {
  hook: HookScene,
  title: TitleScene,
  diagnosis: DiagnosisScene,
  misread: MisreadScene,
  everyday: EverydayScene,
  twice: TwiceScene,
  answer: AnswerScene,
  question: TypewriterScene,
  tired: TiredScene,
  scale: ScaleScene,
  ending: EndingScene,
};

export const humility = { data: episode, timeline, scenes, look: backlitLook, brand };
