#!/usr/bin/env python3
"""配音生成：逐句合成旁白 -> build/<ep>/vo/Lxx.wav + vo.json（时长与分句时间点）。

- 引擎：sherpa-onnx + Kokoro v1.1-zh（本地离线，文案不出本机）。
- 若 <ep>/vo_override/Lxx.wav 存在，则直接采用该录音（真人配音/其他 TTS 均可），
  时间轴会按新音频长度自动重排。
用法: python3 tools/tts.py ep01 [--models DIR]
"""
import json, os, re, sys, shutil, argparse
import numpy as np, soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000

def load_engine(mdir):
    import sherpa_onnx
    k = os.path.join(mdir, 'kokoro-multi-lang-v1_1') + '/'
    # 修正词典里个别多音字（拽 zhuài）
    lex = os.path.join(mdir, 'lexicon-zh.patched.txt')
    if not os.path.exists(lex):
        s = open(k + 'lexicon-zh.txt', encoding='utf8').read()
        s = s.replace('\n拽 ㄓ 外 1\n', '\n拽 ㄓ 外 4\n')
        open(lex, 'w', encoding='utf8').write(s)
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
                model=k + 'model.onnx', voices=k + 'voices.bin', tokens=k + 'tokens.txt',
                data_dir=k + 'espeak-ng-data', dict_dir=k + 'dict',
                lexicon=k + 'lexicon-us-en.txt,' + lex),
            num_threads=4),
        rule_fsts=k + 'phone-zh.fst,' + k + 'date-zh.fst,' + k + 'number-zh.fst',
        max_num_sentences=1)
    return sherpa_onnx.OfflineTts(cfg)

def resample(x, sr, to=SR):
    if sr == to: return x
    from scipy.signal import resample_poly
    from math import gcd
    g = gcd(sr, to)
    return resample_poly(x, to // g, sr // g).astype(np.float32)

def envelope(x, sr, win=0.01):
    n = int(sr * win)
    m = len(x) // n
    return np.sqrt((x[:m * n].reshape(m, n) ** 2).mean(1) + 1e-12), win

def trim(x, sr, pad=0.06):
    e, w = envelope(x, sr)
    th = e.max() * 10 ** (-40 / 20)
    idx = np.where(e > th)[0]
    a = max(0, int((idx[0] * w - pad) * sr)); b = min(len(x), int(((idx[-1] + 1) * w + pad) * sr))
    y = x[a:b].copy()
    f = int(0.01 * sr)
    y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    return y

def clauses(text):
    t = re.sub(r'[“”"]', '', text)
    parts = [p for p in re.split(r'[，。？！、；：]|——', t) if p.strip()]
    return parts

def clause_bounds(x, sr, parts):
    """用句内停顿定位分句边界；找不到就按字数比例。返回每个分句的 [start,end]（秒）。"""
    dur = len(x) / sr
    n = len(parts)
    if n == 1: return [[0, dur]]
    e, w = envelope(x, sr)
    th = e.max() * 10 ** (-34 / 20)
    quiet = e < th
    gaps = []; i = 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if i > 5 and j < len(quiet) - 5 and (j - i) * w >= 0.07:
                gaps.append(((j - i) * w, (i + j) / 2 * w))
            i = j
        else: i += 1
    tot = sum(len(p) for p in parts)
    exp = np.cumsum([len(p) for p in parts])[:-1] / tot * dur
    cuts = []
    for x_ in exp:
        near = [g for g in gaps if abs(g[1] - x_) < 0.75 and (not cuts or g[1] > cuts[-1] + 0.25)]
        cuts.append(min(near, key=lambda g: abs(g[1] - x_) - 0.5 * g[0])[1] if near else max(x_, (cuts[-1] + 0.3) if cuts else 0))
    ts = [0] + cuts + [dur]
    return [[round(ts[i], 3), round(ts[i + 1], 3)] for i in range(n)]

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('ep'); ap.add_argument('--models', default=os.environ.get('KAIDAN_TTS_MODELS', os.path.join(ROOT, 'models')))
    a = ap.parse_args()
    sc = json.load(open(os.path.join(ROOT, a.ep, 'script.json'), encoding='utf8'))
    out = os.path.join(ROOT, 'build', a.ep, 'vo'); os.makedirs(out, exist_ok=True)
    ovr = os.path.join(ROOT, a.ep, 'vo_override')
    eng = None; meta = {}
    for ln in sc['lines']:
        o = os.path.join(ovr, ln['id'] + '.wav')
        if os.path.exists(o):
            x, sr = sf.read(o, dtype='float32');
            if x.ndim > 1: x = x.mean(1)
            src = 'override'
        else:
            eng = eng or load_engine(a.models)
            v = sc['voices'][ln['voice']]
            txt = ln.get('tts', ln['text'])
            for k_, r_ in sc.get('tts_replace', {}).items(): txt = txt.replace(k_, r_)
            txt = re.sub(r'[“”"]', '', txt)
            au = eng.generate(txt, sid=v['sid'], speed=v['speed'] * ln.get('speed', 1.0))
            x, sr = np.array(au.samples, dtype=np.float32), au.sample_rate
            src = 'kokoro:%d' % v['sid']
        x = trim(resample(x, sr), SR)
        x = x / max(1e-6, np.abs(x).max()) * 0.9
        sf.write(os.path.join(out, ln['id'] + '.wav'), x, SR, subtype='PCM_16')
        parts = clauses(ln['text'])
        meta[ln['id']] = dict(dur=round(len(x) / SR, 3), voice=ln['voice'], text=ln['text'], src=src,
                              clauses=[dict(text=p, t=b) for p, b in zip(parts, clause_bounds(x, SR, parts))])
    json.dump(meta, open(os.path.join(ROOT, 'build', a.ep, 'vo.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print('lines', len(meta), 'total VO %.1fs' % sum(m['dur'] for m in meta.values()))

if __name__ == '__main__': main()
