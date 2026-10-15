#!/usr/bin/env python3
"""没有 SRT 时：对配音做带时间戳的语音识别，再与分镜文案逐字对齐，生成逐句 voice.srt。

识别用离线模型（sherpa-onnx）：Silero VAD 切句 + Paraformer 中文模型输出逐字时间戳。
对齐用 difflib 把「文案」和「识别结果」逐字匹配，识别有错字也能对上。

用法：python3 tools/align.py <集目录>
"""
import difflib
import json
import os
import re
import subprocess
import sys

import numpy as np
import sherpa_onnx

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = os.environ.get("PIYING_MODELS", os.path.join(ROOT, "models"))
ASR = os.path.join(MODELS, "sherpa-onnx-paraformer-zh-2024-03-09")
VAD = os.path.join(MODELS, "silero_vad.onnx")
SR = 16000
CHAR_SEC = 0.22  # 识别缺字时按每字时长外推


def norm_chars(s):
    return [c for c in s if re.match(r"[一-鿿A-Za-z0-9]", c)]


def sentences(text):
    return [s.strip() for s in re.findall(r"[^。！？!?]+[。！？!?」』”]*", text) if s.strip()]


def fmt(t):
    ms = int(round(max(0, t) * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def load_audio(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def recognize(samples):
    vcfg = sherpa_onnx.VadModelConfig()
    vcfg.silero_vad.model = VAD
    vcfg.silero_vad.min_silence_duration = 0.2
    vcfg.silero_vad.max_speech_duration = 20
    vcfg.sample_rate = SR
    vad = sherpa_onnx.VoiceActivityDetector(vcfg, buffer_size_in_seconds=int(len(samples) / SR) + 30)
    rec = sherpa_onnx.OfflineRecognizer.from_paraformer(
        paraformer=os.path.join(ASR, "model.int8.onnx" if os.path.exists(os.path.join(ASR, "model.int8.onnx")) else "model.onnx"),
        tokens=os.path.join(ASR, "tokens.txt"), num_threads=4)
    segs = []
    win = vcfg.silero_vad.window_size

    def drain():
        while not vad.empty():
            segs.append((vad.front.start, np.array(vad.front.samples, dtype=np.float32)))
            vad.pop()
    for i in range(0, len(samples), win):
        vad.accept_waveform(samples[i:i + win])
        drain()
    vad.flush()
    drain()
    chars = []  # (字, 秒)
    for start, seg in segs:
        st = rec.create_stream()
        st.accept_waveform(SR, seg)
        rec.decode_stream(st)
        r = st.result
        t0, t1 = start / SR, (start + len(seg)) / SR
        if len(r.timestamps) == len(r.tokens) and r.tokens:
            for tok, tt in zip(r.tokens, r.timestamps):
                for c in norm_chars(tok):
                    chars.append((c, t0 + tt))
        else:
            # 模型不给逐字时间戳时：在 VAD 语音段内按字均分（段≈一句，句级时间仍准确）
            cs = norm_chars(r.text)
            for k, c in enumerate(cs):
                chars.append((c, t0 + (t1 - t0) * k / max(1, len(cs))))
    return chars


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    ep_dir = sys.argv[1]
    ep = json.load(open(os.path.join(ep_dir, "episode.json"), encoding="utf-8"))
    voice = next(os.path.join(ep_dir, f) for f in ("voice.wav", "voice.mp3", "voice.m4a") if os.path.exists(os.path.join(ep_dir, f)))
    samples = load_audio(voice)
    dur = len(samples) / SR
    rec = recognize(samples)
    print("识别：" + "".join(c for c, _ in rec))

    sents = []
    for s in ep["shots"]:
        if s.get("kind") in ("title", "pause"):
            continue
        sents += sentences(s.get("script") or s.get("text") or "")
    A, owner = [], []
    for i, s in enumerate(sents):
        for c in norm_chars(s):
            A.append(c)
            owner.append(i)
    B = [c for c, _ in rec]
    t_of = {}
    for blk in difflib.SequenceMatcher(None, A, B, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            t_of[blk.a + k] = rec[blk.b + k][1]

    cues = []
    for i, s in enumerate(sents):
        idx = [k for k, o in enumerate(owner) if o == i]
        hit = [(k, t_of[k]) for k in idx if k in t_of]
        if hit:
            start = hit[0][1] - (hit[0][0] - idx[0]) * CHAR_SEC
            end = hit[-1][1] + (idx[-1] - hit[-1][0] + 1) * CHAR_SEC
        else:
            start = cues[-1][1] + 0.1 if cues else 0.0
            end = start + len(idx) * CHAR_SEC
        if cues:
            start = max(start, cues[-1][1])
        cues.append([max(0.0, start), min(dur, max(end, start + 0.4)), s])
    for i in range(len(cues) - 1):
        cues[i][1] = min(cues[i][1], cues[i + 1][0])
    with open(os.path.join(ep_dir, "voice.srt"), "w", encoding="utf-8") as f:
        for i, (a, b, s) in enumerate(cues, 1):
            f.write(f"{i}\n{fmt(a)} --> {fmt(b)}\n{s}\n\n")
    matched = len(t_of) / max(1, len(A))
    print(f"对齐完成：{len(cues)} 句，逐字匹配率 {matched:.0%} → {ep_dir}/voice.srt")
    if matched < 0.6:
        print("警告：匹配率偏低，请检查配音是否与文案一致，或直接提供 SRT。")


if __name__ == "__main__":
    main()
