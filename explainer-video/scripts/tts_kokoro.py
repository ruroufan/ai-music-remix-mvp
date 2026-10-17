"""Offline Chinese TTS with sherpa-onnx + Kokoro v1.1.

Usage: python3 tts_kokoro.py <model_dir> <speaker_id> <speed> <jobs.json>
jobs.json: [{"text": "...", "out": "/abs/path.wav"}, ...]
"""
import json
import sys

import sherpa_onnx
import soundfile as sf

model_dir, sid, speed, jobs_path = sys.argv[1], int(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
m = model_dir.rstrip("/")
tts = sherpa_onnx.OfflineTts(
    sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
                model=f"{m}/model.onnx",
                voices=f"{m}/voices.bin",
                tokens=f"{m}/tokens.txt",
                data_dir=f"{m}/espeak-ng-data",
                dict_dir=f"{m}/dict",
                lexicon=f"{m}/lexicon-us-en.txt,{m}/lexicon-zh.txt",
            ),
            num_threads=4,
        ),
    )
)
for job in json.load(open(jobs_path, encoding="utf-8")):
    audio = tts.generate(job["text"], sid=sid, speed=speed)
    sf.write(job["out"], audio.samples, audio.sample_rate)
    print("spoke", job["out"], flush=True)
