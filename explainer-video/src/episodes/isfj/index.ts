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
import { NietzscheScene } from "./scenes/NietzscheScene";
import { AnswerScene } from "./scenes/AnswerScene";
import { CostScene } from "./scenes/CostScene";
import { TurnScene } from "./scenes/TurnScene";
import { EndingScene } from "./scenes/EndingScene";

const scenes: Record<string, React.FC<SceneProps>> = {
  series: seriesCard("ISFJ"),
  hook: HookScene,
  title: TitleScene,
  diagnosis: DiagnosisScene,
  misread: MisreadScene,
  everyday: EverydayScene,
  nietzsche: NietzscheScene,
  answer: AnswerScene,
  question: TypewriterScene,
  cost: CostScene,
  turn: TurnScene,
  ending: EndingScene,
};

export const isfj = { data: episode, timeline, scenes, look: backlitLookFx, brand };
