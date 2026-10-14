// Speaks every line of src/script.ts and writes src/voiceover.generated.ts.
//
//   npm run voiceover                       # offline Kokoro (needs KOKORO_DIR)
//   npm run voiceover -- --engine=edge      # Microsoft Edge TTS (needs `pip install edge-tts`, online)
//
// Options: --voice=<kokoro speaker id | edge voice name>  --speed=<kokoro speed, default 0.95>
// Requires ffmpeg/ffprobe on PATH (silence trimming, loudness, mp3).

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { script } from "../src/script.ts";
import { lineKey } from "../src/timeline.ts";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? "true"]),
);
const engine = args.engine ?? "kokoro";
const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const outDir = here("../public/voiceover/");
const tmp = mkdtempSync(join(tmpdir(), "voiceover-"));
mkdirSync(outDir, { recursive: true });

// What the narrator reads: the subtitle without markup, or the line's `say` override.
const spoken = (line) =>
  (line.say ?? line.text).replace(/[【】]/g, "").replace(/\n/g, "").replace(/——/g, "，");

const jobs = script.flatMap((scene) =>
  scene.lines.map((line, i) => {
    const key = lineKey(scene.id, i);
    return { key, text: spoken(line), raw: join(tmp, `${key}.raw`), out: join(outDir, `${key}.mp3`) };
  }),
);

if (engine === "kokoro") {
  const model = args.model ?? process.env.KOKORO_DIR;
  if (!model) {
    console.error("Set KOKORO_DIR (or --model=) to the extracted kokoro-multi-lang-v1_1 folder. See README.");
    process.exit(1);
  }
  const jobsFile = join(tmp, "jobs.json");
  writeFileSync(jobsFile, JSON.stringify(jobs.map((j) => ({ text: j.text, out: (j.raw += ".wav") }))));
  execFileSync("python3", [here("./tts_kokoro.py"), model, args.voice ?? "60", args.speed ?? "0.95", jobsFile], {
    stdio: "inherit",
  });
} else if (engine === "edge") {
  for (const j of jobs) {
    j.raw += ".mp3";
    execFileSync("edge-tts", ["--voice", args.voice ?? "zh-CN-YunjianNeural", "--rate=-5%", "--text", j.text, "--write-media", j.raw]);
    console.log("spoke", j.key);
  }
} else {
  console.error(`Unknown engine ${engine}`);
  process.exit(1);
}

// Trim leading/trailing silence so timings are tight, then even out loudness.
const FILTER =
  "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.1," +
  "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.1,areverse," +
  "highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11";

const manifest = {};
for (const j of jobs) {
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", j.raw, "-af", FILTER, "-ar", "44100", "-b:a", "128k", j.out]);
  const seconds = Number(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", j.out]).toString(),
  );
  manifest[j.key] = { file: `voiceover/${j.key}.mp3`, seconds: Math.round(seconds * 1000) / 1000 };
  console.log(`${j.key}  ${seconds.toFixed(2)}s  ${j.text}`);
}
rmSync(tmp, { recursive: true, force: true });

writeFileSync(
  here("../src/voiceover.generated.ts"),
  `// Written by \`npm run voiceover\` (${engine}). Empty = no narration; scenes use script.ts timings.\n` +
    `export const voiceover: Record<string, { file: string; seconds: number }> = ${JSON.stringify(manifest, null, 2)};\n`,
);
console.log("wrote src/voiceover.generated.ts — now run `npm run music` so the score matches the new timings.");
