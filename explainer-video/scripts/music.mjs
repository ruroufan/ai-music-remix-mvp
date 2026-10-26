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
import { EPISODES as REGISTRY } from "../src/episodes/registry.ts";
import { reseed, writeWav } from "./audio/lib.mjs";
import { makeSfx } from "./audio/sfx.mjs";
import { scoreAmbient } from "./audio/score-ambient.mjs";
import { scoreDrive } from "./audio/score-drive.mjs";
import { scoreClockwork } from "./audio/score-clockwork.mjs";
import { scoreLofi } from "./audio/score-lofi.mjs";
import { scoreCassette } from "./audio/score-cassette.mjs";
import { scoreCinematic } from "./audio/score-cinematic.mjs";
import { scoreGuochao } from "./audio/score-guochao.mjs";
import { scoreStompclap } from "./audio/score-stompclap.mjs";
import { scoreAfrohouse } from "./audio/score-afrohouse.mjs";
import { scoreFuturebass } from "./audio/score-futurebass.mjs";
import { scoreElectroswing } from "./audio/score-electroswing.mjs";
import { scorePhonk } from "./audio/score-phonk.mjs";
import { scoreDembow } from "./audio/score-dembow.mjs";
import { scoreAcid } from "./audio/score-acid.mjs";
import { scoreBreakbeat } from "./audio/score-breakbeat.mjs";
import { scoreFrenchhouse } from "./audio/score-frenchhouse.mjs";
import { scoreGlitchhop } from "./audio/score-glitchhop.mjs";
import { scoreIndustrial } from "./audio/score-industrial.mjs";
import { scoreTrance } from "./audio/score-trance.mjs";
import { scoreArenarock } from "./audio/score-arenarock.mjs";
import { scoreFunk } from "./audio/score-funk.mjs";
import { scoreDreampop } from "./audio/score-dreampop.mjs";
import { scoreBossanova } from "./audio/score-bossanova.mjs";
import { scoreGospel } from "./audio/score-gospel.mjs";
import { scoreChiptune } from "./audio/score-chiptune.mjs";
import { scoreMinimalism } from "./audio/score-minimalism.mjs";
import { scoreTriphop } from "./audio/score-triphop.mjs";
import { scoreMarching } from "./audio/score-marching.mjs";

const EPISODES = Object.fromEntries(Object.entries(REGISTRY).map(([id, e]) => [id, e.episode]));
const SCORES = { ambient: scoreAmbient, drive: scoreDrive, clockwork: scoreClockwork, lofi: scoreLofi, cassette: scoreCassette, cinematic: scoreCinematic, guochao: scoreGuochao, stompclap: scoreStompclap, afrohouse: scoreAfrohouse, futurebass: scoreFuturebass, electroswing: scoreElectroswing, phonk: scorePhonk, dembow: scoreDembow, acid: scoreAcid, breakbeat: scoreBreakbeat, frenchhouse: scoreFrenchhouse, glitchhop: scoreGlitchhop, industrial: scoreIndustrial, trance: scoreTrance, arenarock: scoreArenarock, funk: scoreFunk, dreampop: scoreDreampop, bossanova: scoreBossanova, gospel: scoreGospel, chiptune: scoreChiptune, minimalism: scoreMinimalism, triphop: scoreTriphop, marching: scoreMarching };

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
