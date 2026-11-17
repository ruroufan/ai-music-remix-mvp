#!/usr/bin/env python3
"""混音：旁白 + 环境声 + 音效 + 配乐 -> build/<ep>/audio.wav
旁白出现时自动压低音乐/环境（侧链闪避）。用法: python3 tools/audio.py ep01"""
import json, os, sys, importlib.util
import numpy as np, soundfile as sf, scipy.signal as sg
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import synth as S
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SR = S.SR

class Mix:
    def __init__(self, tl, ep):
        self.tl = tl; self.ep = ep; self.n = int((tl['duration'] + .05) * SR)
        self.bus = {k: np.zeros((self.n, 2)) for k in ('vo', 'sfx', 'amb', 'mus')}
        self.M = tl['marks']; self.shot = {s['id']: s for s in tl['shots']}
    def add(self, bus, x, t, gain=1.0, pan=0.0, fin=0.0, fout=0.0):
        if x.ndim == 1: x = S.stereo(x, pan)
        x = x * gain
        if fin or fout: x = np.stack([S.fade(x[:, 0], fin, fout), S.fade(x[:, 1], fin, fout)], 1)
        s = int(round(t * SR))
        if s < 0: x = x[-s:]; s = 0
        e = min(self.n, s + len(x))
        if e > s: self.bus[bus][s:e] += x[:e - s]
    def bed(self, bus, x, pts):
        """整段铺底：pts=[(时间, 音量), ...] 线性插值成包络"""
        if x.ndim == 1: x = S.stereo(x)
        t0 = pts[0][0]; n = min(len(x), self.n - int(t0 * SR)); tt_ = t0 + np.arange(n) / SR
        env = np.interp(tt_, [p[0] for p in pts], [p[1] for p in pts], left=0, right=0)
        self.bus[bus][int(t0 * SR):int(t0 * SR) + n] += x[:n] * env[:, None]
    def st(self, sid): return self.shot[sid]['start']
    def en(self, sid): return self.shot[sid]['end']

def vo_chain(x, kind):
    x = S.hp(x, 75); x = x + .25 * S.bp(x, 2200, 5200)          # 去低频轰鸣，提一点齿音清晰度
    # 简易压缩
    env = np.sqrt(sg.lfilter([1 - np.exp(-1 / (.01 * SR))], [1, -np.exp(-1 / (.01 * SR))], x ** 2) + 1e-9)
    g = np.minimum(1, (.16 / np.maximum(env, 1e-4)) ** .45); x = x * g
    x = x / max(1e-6, np.sqrt((x ** 2).mean())) * .1
    if kind == 'woman': return S.reverb(S.lp(x, 9000), S.IR_HALL, .1, 1.0)
    if kind == 'granny': return S.reverb(S.lp(x, 7500), S.IR_ROOM, .16, 1.0)
    return S.reverb(x, S.IR_ROOM, .07, 1.0)

def main():
    ep = sys.argv[1]; bd = os.path.join(ROOT, 'build', ep)
    tl = json.load(open(os.path.join(bd, 'timeline.json'), encoding='utf8'))
    m = Mix(tl, ep)
    for ln in tl['lines']:
        x, sr = sf.read(os.path.join(bd, 'vo', ln['id'] + '.wav'), dtype='float64')
        m.add('vo', vo_chain(x, ln['voice']), ln['start'], 1.0)
    spec = importlib.util.spec_from_file_location('cues', os.path.join(ROOT, ep, 'cues.py')); cues = importlib.util.module_from_spec(spec); spec.loader.exec_module(cues)
    cues.build(m, S)
    # 侧链：旁白响时压低音乐与环境
    vo = np.abs(m.bus['vo']).max(1); a = np.exp(-1 / (.03 * SR)); r = np.exp(-1 / (.45 * SR))
    env = np.empty_like(vo); e = 0.0
    blk = 64; vb = vo[:len(vo) // blk * blk].reshape(-1, blk).max(1); eb = np.empty_like(vb)
    ab, rb = a ** blk, r ** blk
    for i, v in enumerate(vb): e = v + (e - v) * (ab if v > e else rb); eb[i] = e
    env = np.repeat(eb, blk); env = np.pad(env, (0, len(vo) - len(env)), mode='edge')
    duck = 1 - np.clip(env / .12, 0, 1) * .5
    out = m.bus['vo'] * 1.15 + m.bus['sfx'] * (.5 + .5 * duck[:, None]) * .8 + (m.bus['amb'] * .5 + m.bus['mus'] * .62) * duck[:, None]
    out = np.tanh(out * 2.2) / 2.2 * 1.9                                  # 软限幅
    pk = np.abs(out).max(); out = out / max(pk, 1e-6) * .89
    n = int(tl['duration'] * SR); out = out[:n]; f = int(.02 * SR); out[-f:] *= np.linspace(1, 0, f)[:, None]
    sf.write(os.path.join(bd, 'audio.wav'), out, SR, subtype='PCM_24')
    for k, v in m.bus.items(): sf.write(os.path.join(bd, 'stem_%s.wav' % k), np.clip(v, -1, 1), SR, subtype='PCM_16')
    rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
    print('audio %.2fs  peak %.2f  rms: ' % (len(out) / SR, pk) + '  '.join('%s %.1fdB' % (k, rms(v)) for k, v in m.bus.items()))
if __name__ == '__main__': main()
