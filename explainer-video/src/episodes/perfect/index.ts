import type React from "react";
import type { SceneProps } from "../../types";
import { episode, brand } from "./episode";
import { timeline } from "./timing";
import { whiteboardLook } from "../../channels/whiteboard/look";
import { BoardQuestion } from "../../channels/whiteboard/BoardQuestion";
import { HookScene } from "./scenes/HookScene";
import { TitleScene } from "./scenes/TitleScene";
import { DiagnosisScene } from "./scenes/DiagnosisScene";
import { MisreadScene } from "./scenes/MisreadScene";
import { EverydayScene } from "./scenes/EverydayScene";
import { WhyScene } from "./scenes/WhyScene";
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
  why: WhyScene,
  answer: AnswerScene,
  question: BoardQuestion,
  cost: CostScene,
  quote: QuoteScene,
  ending: EndingScene,
};

// whiteboard edition: hand-drawn on a board, with the kinetic subtitles
export const perfect = { data: episode, timeline, scenes, look: whiteboardLook, brand };
