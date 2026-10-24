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
import { BeauvoirScene } from "./scenes/BeauvoirScene";
import { AnswerScene } from "./scenes/AnswerScene";
import { CostScene } from "./scenes/CostScene";
import { NoteScene } from "./scenes/NoteScene";
import { EndingScene } from "./scenes/EndingScene";

const scenes: Record<string, React.FC<SceneProps>> = {
  hook: HookScene,
  title: TitleScene,
  diagnosis: DiagnosisScene,
  misread: MisreadScene,
  everyday: EverydayScene,
  beauvoir: BeauvoirScene,
  answer: AnswerScene,
  question: TypewriterScene,
  cost: CostScene,
  note: NoteScene,
  ending: EndingScene,
};

export const love = { data: episode, timeline, scenes, look: backlitLookFx, brand };
