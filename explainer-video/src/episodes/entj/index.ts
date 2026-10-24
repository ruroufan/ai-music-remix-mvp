import type React from "react";
import type { SceneProps } from "../../types";
import { episode, brand } from "./episode";
import { timeline } from "./timing";
import { backlitLookFx } from "../../channels/backlit/look";
import { TypewriterScene } from "../../channels/backlit/TypewriterScene";
import { seriesCard } from "../mbti/series";
import { HookScene } from "./scenes/HookScene";
import { TitleScene } from "./scenes/TitleScene";
import { DiagnosisScene } from "./scenes/DiagnosisScene";
import { MisreadScene } from "./scenes/MisreadScene";
import { EverydayScene } from "./scenes/EverydayScene";
import { HegelScene } from "./scenes/HegelScene";
import { AnswerScene } from "./scenes/AnswerScene";
import { CostScene } from "./scenes/CostScene";
import { EqualScene } from "./scenes/EqualScene";
import { EndingScene } from "./scenes/EndingScene";

const scenes: Record<string, React.FC<SceneProps>> = {
  series: seriesCard("ENTJ"),
  hook: HookScene,
  title: TitleScene,
  diagnosis: DiagnosisScene,
  misread: MisreadScene,
  everyday: EverydayScene,
  hegel: HegelScene,
  answer: AnswerScene,
  question: TypewriterScene,
  cost: CostScene,
  equal: EqualScene,
  ending: EndingScene,
};

export const entj = { data: episode, timeline, scenes, look: backlitLookFx, brand };
