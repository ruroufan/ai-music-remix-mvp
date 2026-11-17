#!/usr/bin/env python3
"""自检：逐句统计 旁白/背景 的响度差，并用语音识别听一遍成片音轨，确认旁白没被盖住。"""
import json, os, sys, re, numpy as np, soundfile as sf
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); ep = sys.argv[1]; bd = os.path.join(ROOT, 'build', ep)
tl = json.load(open(bd + '/timeline.json')); vo = json.load(open(bd + '/vo.json'))
st = {k: sf.read(bd + '/stem_%s.wav' % k)[0] for k in ('vo', 'sfx', 'amb', 'mus')}; SR = 48000
mix, _ = sf.read(bd + '/audio.wav')
db = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
low = []
for ln in tl['lines']:
    a, b = int(ln['start'] * SR), int((ln['start'] + ln['dur']) * SR)
    v = db(st['vo'][a:b]); o = db(st['sfx'][a:b] * .6 + (st['amb'][a:b] * .5 + st['mus'][a:b] * .62) * .55); v += 1.2
    if v - o < 7: low.append((ln['id'], round(v - o, 1)))
print('lines with VO-to-background < 7 dB:', [(a, float(b)) for a, b in low])
try:
    import sherpa_onnx
    md = os.environ.get('KAIDAN_TTS_MODELS', ROOT + '/models') + '/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17/'
    rec = sherpa_onnx.OfflineRecognizer.from_sense_voice(model=md + 'model.int8.onnx', tokens=md + 'tokens.txt', num_threads=4, use_itn=False, language='zh')
    from pypinyin import lazy_pinyin
    py = lambda s: lazy_pinyin(re.sub(r'[^一-鿿]', '', s.replace('戻', '戾')))
    def per(a, b):
        d = list(range(len(b) + 1))
        for i, ca in enumerate(a, 1):
            p = d[:]; d[0] = i
            for j, cb in enumerate(b, 1): d[j] = min(p[j] + 1, d[j - 1] + 1, p[j - 1] + (ca != cb))
        return d[-1] / max(1, len(a))
    tot = 0; bad = []
    solo = []
    for ln in tl['lines']:
        x, sr = sf.read(bd + '/vo/%s.wav' % ln['id'], dtype='float32'); s = rec.create_stream(); s.accept_waveform(sr, x); rec.decode_stream(s)
        if per(py(vo[ln['id']]['text'].replace('地', '的')), py(s.result.text.replace('地', '的'))) > .12: solo.append((ln['id'], s.result.text))
    print('ASR on clean VO, lines > 12%:', solo)
    for ln in tl['lines']:
        a, b = int((ln['start'] - .15) * SR), int((ln['start'] + ln['dur'] + .2) * SR)
        s = rec.create_stream(); s.accept_waveform(SR, mix[a:b].mean(1).astype(np.float32)); rec.decode_stream(s)
        e = per(py(vo[ln['id']]['text']), py(s.result.text)); tot += e
        if e > .12: bad.append((ln['id'], round(e, 2), s.result.text))
    print('ASR on final mix: mean pinyin error %.3f; lines > 12%%:' % (tot / len(tl['lines'])), bad)
except Exception as e: print('ASR check skipped:', e)
