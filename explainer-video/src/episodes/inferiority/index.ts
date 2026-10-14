import type React from "react";
import type { SceneProps } from "../../types";
import { episode, brand } from "./episode";
import { timeline } from "./timing";
import { backlitLook } from "../../channels/backlit/look";
import { TypewriterScene } from "../../channels/backlit/TypewriterScene";
import { HookScene } from "./scenes/HookScene";
import { TitleScene } from "./scenes/TitleScene";
import { DiagnosisScene } from "./scenes/DiagnosisScene";
import { TwoFacesScene } from "./scenes/TwoFacesScene";
import { ShowoffScene } from "./scenes/ShowoffScene";
import { ChildScene } from "./scenes/ChildScene";
import { ForkScene } from "./scenes/ForkScene";
import { AnswerScene } from "./scenes/AnswerScene";
import { PitScene } from "./scenes/PitScene";
import { YesterdayScene } from "./scenes/YesterdayScene";
import { EndingScene } from "./scenes/EndingScene";

const scenes: Record<string, React.FC<SceneProps>> = {
  hook: HookScene,
  title: TitleScene,
  diagnosis: DiagnosisScene,
  twoFaces: TwoFacesScene,
  showoff: ShowoffScene,
  child: ChildScene,
  fork: ForkScene,
  answer: AnswerScene,
  question: TypewriterScene,
  pit: PitScene,
  yesterday: YesterdayScene,
  ending: EndingScene,
};

export const inferiority = { data: episode, timeline, scenes, look: backlitLook, brand };
