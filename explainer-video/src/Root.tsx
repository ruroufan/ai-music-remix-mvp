import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { Video, totalFrames } from "./Video";
import { FPS, HEIGHT, WIDTH } from "./theme";

export const Root: React.FC = () => (
  <Composition id="Explainer" component={Video} durationInFrames={totalFrames} fps={FPS} width={WIDTH} height={HEIGHT} />
);
