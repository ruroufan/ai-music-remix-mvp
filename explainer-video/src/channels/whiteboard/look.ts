// The whiteboard look: marker on a white board, a handwritten font, and a hand
// that draws everything. Same channel (背光观察室), different medium.
export const ink = {
  board: "#f7f6f1",
  black: "#1f2023",
  grey: "#8a8c91",
  faint: "rgba(31,32,35,0.12)",
  red: "#e0413a",
  blue: "#2d6cdf",
  green: "#21955a",
  orange: "#ef8a1f",
  highlight: "rgba(255, 214, 10, 0.55)",
};

export const hand = {
  font: '"ZCOOL KuaiLe", "Caveat", "Noto Sans SC", sans-serif',
  latin: '"Caveat", "ZCOOL KuaiLe", cursive',
};

// For the shared subtitles: red marker for 【highlights】 and 【【key phrases】】,
// which get a yellow highlighter swipe and a hand-drawn underline.
export const whiteboardLook = { accent: ink.red, accentGlow: "transparent", font: hand.font, fx: true, board: true, key: ink.red, keyGlow: ink.highlight };
