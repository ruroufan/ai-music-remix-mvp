// 背光观察室's palette: cold blue-black, a teal accent, and a warm light that
// always comes from *behind* the subject (the "backlight").
export const palette = {
  bg: "#06080c",
  bgLift: "#0e1522",
  ink: "#e8eef2",
  dim: "rgba(232, 238, 242, 0.45)",
  faint: "rgba(232, 238, 242, 0.14)",
  accent: "#3fe0cf",
  accentRgb: "63, 224, 207",
  halo: "255, 176, 104", // warm backlight, as an rgb triple
  alert: "#ff4d6d",
};

export const fonts = {
  sans: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
  mono: '"JetBrains Mono", "SFMono-Regular", Menlo, monospace',
};

// The accent the shared subtitles use for 【highlighted】 words.
export const backlitLook = { accent: palette.accent, accentGlow: `rgba(${palette.accentRgb},0.6)`, font: fonts.sans };
