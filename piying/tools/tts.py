#!/usr/bin/env python3
"""用离线 TTS（sherpa-onnx + MeloTTS 中文模型）为分镜脚本生成「预览配音」和逐句 SRT。

正式成片请换成真人配音；这个工具只用于在没有配音时先看节奏和画面。

用法：python3 tools/tts.py <集目录> [--speed 1.0] [--sid 0]
输出：<集目录>/voice.wav、<集目录>/voice.srt
"""
import json
import os
import re
import sys

import numpy as np
import sherpa_onnx
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = os.environ.get("PIYING_TTS_MODEL", os.path.join(ROOT, "models", "vits-melo-tts-zh_en"))
LEAD, GAP_SENT, GAP_SHOT = 0.3, 0.25, 0.45


def sentences(text):
    return [s.strip() for s in re.findall(r"[^。！？!?]+[。！？!?」』”]*", text) if s.strip()]


def fmt(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    ep_dir = sys.argv[1]
    argv = sys.argv[2:]
    opt = lambda k, d: argv[argv.index(k) + 1] if k in argv else d
    ep = json.load(open(os.path.join(ep_dir, "episode.json"), encoding="utf-8"))
    speed = float(opt("--speed", ep.get("ttsSpeed", 1.0)))
    sid = int(opt("--sid", 0))
    repl = ep.get("ttsReplace", {})

    m = MODEL
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                model=f"{m}/model.onnx", lexicon=f"{m}/lexicon.txt", tokens=f"{m}/tokens.txt", dict_dir=f"{m}/dict"),
            num_threads=4),
        rule_fsts=f"{m}/date.fst,{m}/phone.fst,{m}/number.fst,{m}/new_heteronym.fst",
        max_num_sentences=1)
    tts = sherpa_onnx.OfflineTts(cfg)

    sr = None
    chunks, cues, t = [], [], LEAD
    voiced = [s for s in ep["shots"] if s.get("kind") not in ("title", "pause")]
    for si, shot in enumerate(voiced):
        sents = sentences(shot.get("script") or shot.get("text") or "")
        for k, s in enumerate(sents):
            say = s
            for a, b in repl.items():
                say = say.replace(a, b)
            audio = tts.generate(say, sid=sid, speed=speed)
            sr = audio.sample_rate
            if not chunks:
                chunks.append(np.zeros(int(LEAD * sr), dtype=np.float32))
            a = np.asarray(audio.samples, dtype=np.float32)
            chunks.append(a)
            d = len(a) / sr
            cues.append((t, t + d, s))
            gap = GAP_SENT if k < len(sents) - 1 else (GAP_SHOT if si < len(voiced) - 1 else 0.2)
            chunks.append(np.zeros(int(gap * sr), dtype=np.float32))
            t += d + gap
            print(f"{cues[-1][0]:6.2f}s  {s}")
    wav = np.concatenate(chunks)
    wav = wav / max(1e-6, np.abs(wav).max()) * 0.89
    sf.write(os.path.join(ep_dir, "voice.wav"), wav, sr)
    with open(os.path.join(ep_dir, "voice.srt"), "w", encoding="utf-8") as f:
        for i, (a, b, s) in enumerate(cues, 1):
            f.write(f"{i}\n{fmt(a)} --> {fmt(b)}\n{s}\n\n")
    # 逐字时间（句内按字均分）：供 build.mjs 的「@短语」锚点使用，不必再跑 align.py
    per_char = []
    for a0, b0, s in cues:
        cs = [c for c in s if re.match(r"[\u4e00-\u9fffA-Za-z0-9]", c)]
        for k, c in enumerate(cs):
            per_char.append([c.lower(), round(a0 + (b0 - a0) * k / max(1, len(cs)), 3)])
    json.dump(per_char, open(os.path.join(ep_dir, "voice.chars.json"), "w", encoding="utf-8"), ensure_ascii=False)
    print(f"配音 {len(wav) / sr:.2f}s → {ep_dir}/voice.wav, voice.srt, voice.chars.json")


if __name__ == "__main__":
    main()
