import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setCodec("h264");
Config.setCrf(18);

// Remotion downloads its own headless Chrome on first render. If that is not
// possible (offline / sandboxed), point it at an existing Chromium:
//   REMOTION_BROWSER=/path/to/chrome npm run render
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
