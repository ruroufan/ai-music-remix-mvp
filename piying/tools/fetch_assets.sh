#!/usr/bin/env bash
# 下载字体与离线模型（体积大，不进 git）
#   bash tools/fetch_assets.sh          只下字体（渲染必需）
#   bash tools/fetch_assets.sh --tts    + 离线中文 TTS（MeloTTS，约 170MB，生成预览配音用）
#   bash tools/fetch_assets.sh --asr    + VAD 与 Paraformer 中文识别（约 230MB，无 SRT 时自动对齐用）
#   bash tools/fetch_assets.sh --all    全部
set -euo pipefail
cd "$(dirname "$0")/.."
FONTS=renderer/fonts; MODELS=models; mkdir -p "$FONTS" "$MODELS"
REL=https://github.com/k2-fsa/sherpa-onnx/releases/download
get() { [ -s "$2" ] && { echo "已存在 $2"; return; }; echo "下载 $2"; curl -fL --retry 3 -o "$2.part" "$1" && mv "$2.part" "$2"; }

get "https://raw.githubusercontent.com/google/fonts/main/ofl/mashanzheng/MaShanZheng-Regular.ttf" "$FONTS/MaShanZheng.ttf"
get "https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf" "$FONTS/NotoSerifSC.ttf"
get "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf" "$FONTS/NotoSansSC.ttf"

want() { for a in "$@"; do for x in "${ARGS[@]}"; do [ "$x" = "$a" ] || [ "$x" = "--all" ] && return 0; done; done; return 1; }
ARGS=("$@")
if [ ${#ARGS[@]} -gt 0 ] && want --tts; then
  [ -d "$MODELS/vits-melo-tts-zh_en" ] || { get "$REL/tts-models/vits-melo-tts-zh_en.tar.bz2" "$MODELS/melo.tar.bz2"; tar xjf "$MODELS/melo.tar.bz2" -C "$MODELS"; rm "$MODELS/melo.tar.bz2"; }
fi
if [ ${#ARGS[@]} -gt 0 ] && want --asr; then
  get "$REL/asr-models/silero_vad.onnx" "$MODELS/silero_vad.onnx"
  [ -d "$MODELS/sherpa-onnx-paraformer-zh-2024-03-09" ] || { get "$REL/asr-models/sherpa-onnx-paraformer-zh-2024-03-09.tar.bz2" "$MODELS/para.tar.bz2"; tar xjf "$MODELS/para.tar.bz2" -C "$MODELS"; rm "$MODELS/para.tar.bz2"; }
fi
echo "完成"
