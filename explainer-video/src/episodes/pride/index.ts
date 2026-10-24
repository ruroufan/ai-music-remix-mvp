import type React from "react";
import type { SceneProps } from "../../types";
import { defaultLook } from "../../EpisodeContext";
import { episode, brand } from "./episode";
import { timeline } from "./timing";
import { TitleScene } from "./scenes/TitleScene";
import { DiagnosisScene } from "./scenes/DiagnosisScene";
import { MisconceptionScene } from "./scenes/MisconceptionScene";
import { SocialScene } from "./scenes/SocialScene";
import { TwoLovesScene } from "./scenes/TwoLovesScene";
import { PodiumScene } from "./scenes/PodiumScene";
import { ScoresScene } from "./scenes/ScoresScene";
import { RebuttalScene } from "./scenes/RebuttalScene";
import { QuestionScene } from "./scenes/QuestionScene";
import { CupScene } from "./scenes/CupScene";
import { RankScene } from "./scenes/RankScene";
import { AudienceScene } from "./scenes/AudienceScene";
import { StandFirmScene } from "./scenes/StandFirmScene";

const scenes: Record<string, React.FC<SceneProps>> = {
  title: TitleScene,
  diagnosis: DiagnosisScene,
  misconception: MisconceptionScene,
  social: SocialScene,
  twoLoves: TwoLovesScene,
  podium: PodiumScene,
  scores: ScoresScene,
  rebuttal: RebuttalScene,
  question: QuestionScene,
  cup: CupScene,
  rank: RankScene,
  audience: AudienceScene,
  standFirm: StandFirmScene,
};

export const pride = { data: episode, timeline, scenes, look: defaultLook, brand };
