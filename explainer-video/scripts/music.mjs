// Synthesises each episode's score and the shared sound effects from scratch,
// so the template ships with no third-party audio. Scores follow the scene
// timings, so they are regenerated before every studio/render.
//
//   npm run music                # every episode + sound effects
//   npm run music -- pleasing    # one episode
//
//   public/music/<episode>.wav  — "ambient" or "drive" score (see scripts/audio/)
//   public/sfx/*.wav            — one-shots placed by the scenes (<Sfx name="…" />)

import { mkdirSync } from "node:fs";
import { FPS } from "../src/theme.ts";
import { createTimeline } from "../src/timeline.ts";
import { episode as pride } from "../src/episodes/pride/episode.ts";
import { episode as pleasing } from "../src/episodes/pleasing/episode.ts";
import { reseed, writeWav } from "./audio/lib.mjs";
import { makeSfx } from "./audio/sfx.mjs";
import { scoreAmbient } from "./audio/score-ambient.mjs";
import { scoreDrive } from "./audio/score-drive.mjs";

const EPISODES = { pride, pleasing };
const SCORES = { ambient: scoreAmbient, drive: scoreDrive };

const root = new URL("../public/", import.meta.url);
mkdirSync(new URL("music/", root), { recursive: true });
mkdirSync(new URL("sfx/", root), { recursive: true });

const wanted = process.argv.slice(2).filter((a) => !a.startsWith("-"));
for (const id of wanted.length ? wanted : Object.keys(EPISODES)) {
  const ep = EPISODES[id];
  if (!ep) throw new Error(`Unknown episode "${id}" (have: ${Object.keys(EPISODES).join(", ")})`);
  reseed(7);
  const tl = createTimeline(ep.script, ep.bpm, ep.timing);
  writeWav(new URL(`music/${ep.id}.wav`, root), SCORES[ep.music](ep, tl, FPS));
}

reseed(11);
for (const [name, buf] of Object.entries(makeSfx())) writeWav(new URL(`sfx/${name}.wav`, root), buf);
