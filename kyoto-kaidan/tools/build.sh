#!/usr/bin/env bash
# 一键出片：配音 -> 时间轴 -> 混音 -> 并行渲染 -> 合成 mp4 + 封面
# 用法: tools/build.sh ep01 [workers]
set -euo pipefail
cd "$(dirname "$0")/.."
EP=${1:-ep01}; N=${2:-4}; B=build/$EP; mkdir -p "$B" out
[ "${SKIP_TTS:-0}" = 1 ] || python3 tools/tts.py "$EP" 2>&1 | tail -1
python3 tools/timeline.py "$EP" | head -1
python3 tools/audio.py "$EP" 2>&1 | tail -1
F=$(python3 -c "import json;print(json.load(open('$B/timeline.json'))['frames'])")
rm -f "$B"/seg*.mp4; : > "$B/segs.txt"; pids=()
for i in $(seq 0 $((N-1))); do
  a=$((F*i/N)); b=$((F*(i+1)/N))
  node tools/render.mjs "$EP" --from $a --to $b --crf 12 --out "$B/seg$i.mp4" 2> "$B/render$i.log" & pids+=($!)
  echo "file 'seg$i.mp4'" >> "$B/segs.txt"
done
for p in "${pids[@]}"; do wait "$p"; done
# 响度：按实测值做线性增益到 -16 LUFS（不压缩动态，静处仍静），再加限幅防削波
I=$(ffmpeg -hide_banner -nostats -i "$B/audio.wav" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
G=$(python3 -c "print(round(-16.0 - ($I), 2))")
echo "integrated loudness $I LUFS -> gain $G dB"
# 各段是高码率中间文件，这里统一压成发布码率
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$B/segs.txt" -i "$B/audio.wav" \
  -c:v libx264 -preset slow -crf ${CRF:-23} -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -af "volume=${G}dB,alimiter=limit=0.84:attack=5:release=80:level=disabled" -ar 48000 -c:a aac -b:a 256k -movflags +faststart -shortest "out/kyoto-kaidan-$EP.mp4"
node tools/render.mjs "$EP" --scene cover --t 1 --sheet "out/kyoto-kaidan-$EP-cover.jpg" --h 1920
ffprobe -v error -show_entries format=duration,size -of default=nw=1 "out/kyoto-kaidan-$EP.mp4"
