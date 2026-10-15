#!/usr/bin/env python3
"""按时间线生成「卡点」背景音乐（民乐风格 folk / 轻快流行 pop，全部合成，无外部素材）。

卡点方式：
- 弹性节拍网格：每个镜头按目标速度切成整数拍，镜头切换点一定落在强拍上（速度在镜头间微调）。
- 画面事件重音：名牌、数字弹出、盖章、竖排大字落印、地图逐块吞并、金饼落手、门开、长木升起……
  在画面发生的同一帧给鼓/锣/铃。
- 情绪随镜头：钩子 dark、片名 title、普通 calm、舞剑等 tense、欢呼 bright、地图吞并 epic、
  冷青夜景 sad，片尾 ending；也可在分镜里用 "music": "tense" 指定。

用法：python3 tools/bgm.py <timeline.json> <输出.wav>
"""
import json
import sys

import numpy as np

SR = 44100
rng = np.random.default_rng(2026)

# ---------- 音色 ----------
def tt(d):
    return np.arange(int(SR * d)) / SR


def lp(x, a):
    # 一阶低通：指数核卷积，核长取到衰减到万分之一为止
    n = min(len(x), int(np.log(1e-4) / np.log(1 - a)) + 1)
    k = a * (1 - a) ** np.arange(n)
    return np.convolve(x, k)[:len(x)]


def cached(fn):
    # 同参数的音色只合成一次（v 是音量，不参与缓存）
    store = {}
    def wrap(*args, v=1.0, **kw):
        key = (args, tuple(sorted(kw.items())))
        if key not in store:
            store[key] = fn(*args, **kw)
        return store[key]
    return wrap


@cached
def drum(f=110, d=0.5):        # 堂鼓
    s = tt(d)
    body = np.sin(2 * np.pi * (f + 55 * np.exp(-s * 28)) * s) * np.exp(-s * 9)
    skin = lp(rng.standard_normal(len(s)), 0.25) * np.exp(-s * 45) * 0.35
    return (body + skin)


@cached
def block():                      # 梆子
    s = tt(0.12)
    return (np.sin(2 * np.pi * 1850 * s) * np.exp(-s * 70) + 0.5 * np.sin(2 * np.pi * 2750 * s) * np.exp(-s * 90))


@cached
def xiaoluo():                    # 小锣：音高上挑
    s = tt(1.0)
    ph = 2 * np.pi * np.cumsum(820 * (1 + 0.12 * (1 - np.exp(-s * 12)))) / SR
    return (np.sin(ph) + 0.4 * np.sin(ph * 2.3) + 0.2 * np.sin(ph * 3.1)) * np.exp(-s * 3.4) * np.minimum(1, s * 300) / 1.6


@cached
def gong(f=150, d=4.0):         # 大锣
    s = tt(d)
    ph = 2 * np.pi * np.cumsum(f * (1 - 0.04 * (1 - np.exp(-s * 3)))) / SR
    return sum(a * np.sin(ph * r) for r, a in [(1, 1), (1.48, .6), (2.03, .45), (2.74, .3), (3.6, .2)]) * np.exp(-s * 1.1) * np.minimum(1, s * 200) / 2.5


@cached
def cymbal(d=1.2):              # 铙钹
    s = tt(d)
    n = rng.standard_normal(len(s))
    return (n - lp(n, 0.3)) * np.exp(-s * 4.5) * 0.5


@cached
def chime(f=1760, d=1.6):       # 铃
    s = tt(d)
    return sum(a * np.sin(2 * np.pi * f * r * s) * np.exp(-s * dd) for r, a, dd in [(1, 1, 2.5), (2.76, .45, 4), (5.4, .2, 6)]) / 1.7


@cached
def boom():
    s = tt(1.8)
    return np.sin(2 * np.pi * (40 + 28 * np.exp(-s * 6)) * s) * np.exp(-s * 2.2)


@cached
def whoosh(d=0.5, rise=False):
    s = tt(d)
    n = rng.standard_normal(len(s))
    env = (s / d) ** 2 if rise else np.sin(np.pi * s / d) ** 2
    return lp(n, 0.3) * env * 0.7


def ks(freq, d=1.6, bright=0.62, decay=0.995):   # 拨弦（琵琶/筝）
    n = int(SR * d)
    L = max(2, int(SR / freq))
    y = np.zeros(n)
    y[:L] = rng.uniform(-1, 1, L)
    for i in range(L, n):
        y[i] = decay * (bright * y[i - L] + (1 - bright) * y[i - L - 1])
    y *= np.exp(-np.arange(n) / SR * 1.6)
    return y / (np.abs(y).max() + 1e-9)


NOTE = {}
for name, semi in [('C', -9), ('D', -7), ('E', -5), ('F', -4), ('F#', -3), ('G', -2), ('A', 0), ('B', 2)]:
    for octv in range(1, 7):
        NOTE[f'{name}{octv}'] = 440 * 2 ** ((semi + 12 * (octv - 4)) / 12)
BANK = {}


def pluck(note, v=1.0, d=1.6):
    key = (note, d)
    if key not in BANK:
        BANK[key] = ks(NOTE[note], d)
    return BANK[key] * v


@cached
def bass(note, d=0.9):
    s = tt(d)
    f = NOTE[note]
    return (np.sin(2 * np.pi * f * s) + 0.3 * np.sin(4 * np.pi * f * s)) * np.exp(-s * 2.5) * np.minimum(1, s * 80)


@cached
def lead(note, d=1.6):          # 箫一类的长音
    s = tt(d)
    f = NOTE[note] * (1 + 0.004 * np.sin(2 * np.pi * 5 * s) * np.minimum(1, s * 2))
    ph = 2 * np.pi * np.cumsum(f) / SR
    breath = lp(rng.standard_normal(len(s)), 0.08) * 0.08
    env = np.minimum(1, s * 4) * np.minimum(1, (d - s) * 3)
    return (np.sin(ph) + 0.15 * np.sin(2 * ph) + breath) * env


# 和声：D 宫五声（D E F# A B），四小节一循环
PROG = [('D', ['D4', 'F#4', 'A4', 'D5', 'A4', 'F#4', 'E4', 'A4']),
        ('B', ['B3', 'D4', 'F#4', 'B4', 'F#4', 'D4', 'E4', 'F#4']),
        ('E', ['E4', 'A4', 'B4', 'E5', 'B4', 'A4', 'F#4', 'A4']),
        ('A', ['A3', 'D4', 'E4', 'A4', 'E4', 'D4', 'B3', 'E4'])]
SAD = [('B', ['B3', 'D4', 'F#4', 'B4']), ('E', ['E4', 'F#4', 'B4', 'D5']), ('A', ['A3', 'D4', 'E4', 'A4']), ('F#', ['F#3', 'A3', 'B3', 'D4'])]
BPM = {'dark': 66, 'title': 96, 'calm': 92, 'tense': 112, 'bright': 104, 'epic': 120, 'sad': 70, 'ending': 76}


# ================= 轻快流行风（生活类扁平模板） =================
@cached
def kick():
    s = tt(0.35)
    return np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-s * 30)) / SR) * np.exp(-s * 9)


@cached
def clap():
    s = tt(0.25)
    n = rng.standard_normal(len(s))
    n = n - lp(n, 0.2)
    env = sum(np.exp(-np.maximum(0, s - d) * 60) * (s >= d) for d in (0, 0.012, 0.024)) / 3
    return n * env * 0.8


@cached
def hat(open_=False):
    s = tt(0.18 if open_ else 0.06)
    n = rng.standard_normal(len(s))
    return (n - lp(n, 0.5)) * np.exp(-s * (18 if open_ else 70)) * 0.5


@cached
def marimba(note, d=0.6):
    s = tt(d)
    f = NOTE[note]
    return (np.sin(2 * np.pi * f * s) + 0.35 * np.sin(2 * np.pi * f * 4 * s) * np.exp(-s * 25)) * np.exp(-s * 7) * np.minimum(1, s * 400)


@cached
def pbass(note, d=0.4):
    s = tt(d)
    f = NOTE[note]
    ph = 2 * np.pi * f * s
    return (np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.1 * np.sin(3 * ph)) * np.exp(-s * 5) * np.minimum(1, s * 200)


@cached
def blip(f0=500, f1=1300, d=0.09):
    s = tt(d)
    return np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f1, len(s))) / SR) * np.exp(-s * 25)


@cached
def buzz():
    s = tt(0.22)
    return np.sign(np.sin(2 * np.pi * 140 * s)) * np.exp(-s * 12) * 0.35


POP_PROG = [('C', ['C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'D4', 'G4']), ('A', ['A3', 'C4', 'E4', 'A4', 'E4', 'C4', 'D4', 'E4']),
            ('F', ['F3', 'A3', 'C4', 'F4', 'C4', 'A3', 'G3', 'C4']), ('G', ['G3', 'B3', 'D4', 'G4', 'D4', 'B3', 'A3', 'D4'])]


def main_pop(tl, out_path):
    dur = tl['duration']
    N = int(SR * (dur + 3))
    mix = np.zeros((2, N))

    def add(sig, t, v=1.0, pan=0.0):
        i = int(round(t * SR))
        if i >= N or i < 0:
            return
        sig = sig[:N - i] * v
        mix[0, i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
        mix[1, i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))

    segs = [(s['start'], s['end'], s) for s in tl['shots']] + [(tl['voiceEnd'], dur, None)]
    bar = 0
    for si, (a, b, shot) in enumerate(segs):
        d = b - a
        if d <= 0.05:
            continue
        if shot is None:  # 片尾：收束和弦 + 铃
            for nt in ['C4', 'E4', 'G4', 'C5']:
                add(marimba(nt, 1.5), a, 0.3)
            add(chime(2093, 1.6), a + 0.05, 0.25)
            add(kick(), a, 0.7)
            continue
        step = d / max(1, round(d / (60 / 112)))
        n = int(round(d / step))
        if si > 0:  # 卡点：每次横滑切换给一记底鼓 + 刷声
            add(kick(), a, 0.9)
            add(whoosh(0.35), a - 0.2, 0.35, 0.3)
        quiet = si == 0  # 开场第一镜轻一点
        for k in range(n):
            t = a + k * step
            bb = k % 4
            if bb == 0:
                bar += 1
            root, arp = POP_PROG[(bar - 1) % 4]
            if bb in (0, 2) and not (quiet and k < 4):
                add(kick(), t, 0.55)
            if bb in (1, 3):
                add(clap(), t, 0.35 if not quiet else 0.2, 0.1)
            add(hat(), t + step / 2, 0.22, -0.3)
            add(hat(), t, 0.12, -0.3)
            if bb in (0, 2):
                add(pbass(root + '2', step * 0.9), t, 0.5)
                add(pbass(root + '3', step * 0.45), t + step / 2, 0.25)
            for h in (0, 1):
                add(marimba(arp[(bb * 2 + h) % 8]), t + h * step / 2, 0.24 if h == 0 else 0.16, 0.25 if h else -0.15)
    # 画面事件音效
    for s in tl['shots']:
        for el in s.get('els') or []:
            t, en, ty = el.get('at'), el.get('enter', 'pop'), el.get('type')
            if t is None or en == 'none':
                continue
            if ty == 'check':
                add(chime(1568, 0.8), t, 0.3); add(chime(2093, 0.8), t + 0.09, 0.3)
            elif ty == 'cross':
                add(buzz(), t, 0.5)
            elif en == 'big':
                add(kick(), t, 0.7); add(chime(1760, 1.0), t, 0.25)
            elif en == 'drop':
                add(kick(), t + 0.45, 0.8); add(blip(300, 900, 0.12), t, 0.3)
            elif en == 'fall':
                add(whoosh(0.5), t, 0.3); add(lp(rng.standard_normal(int(SR * 0.35)), 0.35) * np.exp(-tt(0.35) * 10), t + 0.62, 0.6)
            elif en in ('pop', 'slideR', 'slideL'):
                add(blip(), t, 0.22, 0.2)
            if ty == 'timer' and el.get('cd'):
                c = el['cd']; frm = (el.get('p') or {}).get('from', 20)
                for k in range(frm):
                    add(block(), c['at'] + (c['until'] - c['at']) * k / frm, 0.12, 0.35)
            if ty == 'follow' and el.get('tap'):
                add(chime(1760, 0.8), el['tap']['at'], 0.3); add(chime(2349, 0.8), el['tap']['at'] + 0.1, 0.3)
            for r in (el.get('k') or {}).get('ripple') or []:
                add(lp(rng.standard_normal(int(SR * 0.3)), 0.3) * np.exp(-tt(0.3) * 12), r['at'], 0.35)

    out = mix[:, :int(SR * dur)]
    t = np.arange(out.shape[1]) / SR
    out *= np.clip((dur - t) / 1.0, 0, 1) * np.clip(t / 0.2, 0, 1)
    out /= max(1e-6, np.abs(out).max()) / 0.89
    import wave
    with wave.open(out_path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((out.T * 32767).astype(np.int16).tobytes())
    print(f'背景音乐（轻快流行）{dur:.2f}s → {out_path}')


def main():
    tl = json.load(open(sys.argv[1], encoding='utf-8'))
    out_path = sys.argv[2]
    if tl.get('musicStyle') == 'pop':
        return main_pop(tl, out_path)
    dur = tl['duration']
    N = int(SR * (dur + 4))
    mix = np.zeros((2, N))

    def add(sig, t, v=1.0, pan=0.0):
        i = int(round(t * SR))
        if i >= N or i < 0:
            return
        sig = sig[:N - i]
        mix[0, i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
        mix[1, i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))

    def mood_of(s):
        if s.get('music'):
            return s['music']
        if s['kind'] == 'hook':
            return 'dark'
        if s['kind'] == 'title':
            return 'title'
        if s.get('tint'):
            return 'sad'
        props = s.get('props') or []
        if any(p.get('type') == 'map' and p.get('conquer') for p in props):
            return 'epic'
        acts = [a for m in s.get('cast') or [] for a in m.get('actions') or []]
        if any(a.get('do') in ('dance', 'lunge') for a in acts):
            return 'tense'
        if any(a.get('name') == 'cheer' for a in acts):
            return 'bright'
        return 'calm'

    segs = [(s['start'], s['end'], mood_of(s), s) for s in tl['shots']]
    segs.append((tl['voiceEnd'], dur, 'ending', None))
    bar_no = 0
    for si, (a, b, mood, shot) in enumerate(segs):
        d = b - a
        if d <= 0.05:
            continue
        beat = 60 / BPM[mood]
        n = max(1, round(d / beat))
        bt = [a + k * d / n for k in range(n)]
        step = d / n
        # 卡点：每个镜头的第一拍是重拍
        if si > 0 and mood != 'ending':
            add(drum(95, 0.6), a, 0.9)
            tr = (shot or {}).get('transition')
            if tr in ('curtain', 'scroll'):
                add(cymbal(1.4), a, 0.5, 0.2)
            if tr == 'lights':
                add(boom(), a - 0.25, 0.6)
        if mood == 'dark':
            s_ = tt(d)
            env = np.minimum(1, s_ / 2.0) * np.minimum(1, (d - s_) / 0.6 + 0.2)
            pad = (np.sin(2 * np.pi * NOTE['A1'] * s_) + 0.6 * np.sin(2 * np.pi * NOTE['E2'] * s_ + 0.5 * np.sin(2 * np.pi * 0.2 * s_))) * env
            add(pad, a, 0.35)
            for k, t in enumerate(bt):
                if k % 2 == 0:
                    add(drum(62, 0.6), t, 0.45)
                    add(drum(62, 0.6), t + step * 0.3, 0.25)
            # 钩子末尾滚奏进片名
            for k in range(8):
                add(drum(130, 0.25), b - 0.64 + k * 0.08, 0.12 + 0.06 * k, (-1) ** k * 0.2)
        elif mood == 'title':
            add(gong(160, 4.0), a, 0.9)
            add(cymbal(1.6), a, 0.5, -0.2)
            for k, nt in enumerate(['D4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'E5', 'A5']):
                add(pluck(nt), a + 0.3 + k * 0.12, 0.35, 0.3)
        elif mood == 'ending':
            add(gong(140, 5.0), a, 1.0)
            add(boom(), a, 0.6)
            s_ = tt(d + 1)
            pad = (np.sin(2 * np.pi * NOTE['D2'] * s_) + 0.5 * np.sin(2 * np.pi * NOTE['A2'] * s_)) * np.minimum(1, s_ / 0.8) * np.clip((d - s_) / 1.2, 0, 1)
            add(pad, a, 0.3)
            for k, nt in enumerate(['D4', 'F#4', 'A4', 'D5', 'A4', 'B4', 'A4', 'D4']):
                if a + 0.6 + k * 0.42 < b - 0.8:
                    add(pluck(nt), a + 0.6 + k * 0.42, 0.32, (-1) ** k * 0.25)
        else:
            for k, t in enumerate(bt):
                bar_beat = k % 4
                if bar_beat == 0:
                    bar_no += 1
                root, arp = (SAD if mood == 'sad' else PROG)[(bar_no - 1) % 4]
                if mood == 'sad':
                    if k % 8 == 0:
                        add(drum(70, 0.7), t, 0.35)
                        add(lead((root + '4') if root != 'F#' else 'F#4', min(step * 4, 3.2)), t, 0.22, -0.15)
                    if k % 2 == 0:
                        add(pluck(arp[(k // 2) % 4], d=2.0), t, 0.3, 0.25)
                    if bar_beat == 0:
                        add(bass(root + '2', step * 3.5), t, 0.5)
                    continue
                v_dr = {'calm': 0.42, 'tense': 0.6, 'bright': 0.55, 'epic': 0.75}[mood]
                if bar_beat == 0:
                    add(drum(105, 0.5), t, v_dr)
                    add(bass(root + '2', step * 1.8), t, 0.55)
                    if mood in ('bright', 'epic'):
                        add(cymbal(0.9), t, 0.25 if mood == 'bright' else 0.35, 0.3)
                elif mood in ('tense', 'epic'):
                    add(drum(125, 0.35), t, v_dr * 0.6, (-1) ** k * 0.2)
                if mood == 'epic':
                    add(drum(140, 0.25), t + step / 2, 0.3, 0.2)
                    add(bass(root + '2', step * 0.9), t + step / 2, 0.35)
                if bar_beat % 2 == 1:
                    add(block(), t, 0.22 if mood == 'calm' else 0.3, -0.35)
                if mood == 'tense' and bar_beat == 2 and bar_no % 2 == 0:
                    add(xiaoluo(), t, 0.22, 0.2)
                # 拨弦：八分音符琶音（tense 用低八度重复音）
                for h in (0, 1):
                    idx = (bar_beat * 2 + h) % 8
                    nt = arp[idx]
                    if mood == 'tense':
                        nt = (root + '3') if h == 0 else arp[idx]
                    if mood == 'bright':
                        nt = nt[:-1] + str(min(6, int(nt[-1]) + 1))
                    add(pluck(nt), t + h * step / 2, 0.26 if h == 0 else 0.18, 0.25 if h else -0.1)

    # ---------- 画面事件重音 ----------
    def ev(t, kind):
        if t is None:
            return
        if kind == 'tick':
            add(block(), t, 0.35, 0.3); add(chime(2350, 0.8), t, 0.12, 0.3)
        elif kind == 'pop':
            add(drum(120, 0.4), t, 0.6); add(xiaoluo(), t, 0.3, -0.2)
        elif kind == 'stamp':
            add(drum(80, 0.6), t, 0.8); add(cymbal(0.6), t, 0.2)
        elif kind == 'char':
            add(block(), t, 0.15, 0.1)
        elif kind == 'chime':
            add(chime(1760, 1.4), t, 0.3, 0.2)
        elif kind == 'gliss':
            for k, f in enumerate([1318, 1568, 1760, 2093, 2349]):
                add(chime(f, 1.0), t + k * 0.08, 0.16, -0.3 + k * 0.15)
        elif kind == 'swish':
            add(whoosh(0.45), t, 0.5)
        elif kind == 'rise':
            add(whoosh(1.0, rise=True), t, 0.45); add(drum(70, 0.6), t + 1.0, 0.5)
        elif kind == 'conquer':
            add(drum(90, 0.6), t, 0.85); add(cymbal(0.8), t, 0.25, 0.3)
        elif kind == 'boom':
            add(boom(), t, 0.6)
        elif kind == 'door':
            add(lp(rng.standard_normal(int(SR * 0.4)), 0.05) * np.linspace(1, 0, int(SR * 0.4)), t, 0.35)

    for s in tl['shots']:
        if s['kind'] == 'hook' and s.get('textAt') is not None:
            ev(s['textAt'], 'chime')
        if s['kind'] == 'title':
            n = len(s.get('title') or '')
            ev(s['start'] + 0.2 + n * 0.18 + 0.3, 'stamp')
        for npl in s.get('nameplates') or []:
            ev(npl['at'], 'tick')
        for nb in s.get('numbers') or []:
            ev(nb['at'], 'pop')
        bt_ = s.get('bigText')
        if bt_:
            t0 = bt_['at']
            for col in bt_['columns']:
                for k in range(len(col)):
                    ev(t0 + k * 0.2, 'char')
                t0 += len(col) * 0.2 + 0.15
            ev(t0 + 0.1, 'stamp')
        for p in s.get('props') or []:
            if p.get('rise'): ev(p['rise']['at'], 'rise')
            if p.get('tilt'): ev(p['tilt']['at'], 'swish')
            if p.get('strike'): ev(p['strike']['at'], 'swish')
            if p.get('stamp'): ev(p['stamp']['at'], 'stamp')
            if p.get('plaqueTo'): ev(p['plaqueTo']['at'], 'chime')
            if p.get('qin'): ev(p['qin']['at'], 'boom')
            for c in p.get('conquer') or []:
                ev(c['at'], 'conquer')
            for k in p.get('door') or []:
                if k.get('dur', 0.5) > 0.05:
                    ev(k['at'], 'door')
        for e in s.get('effects') or []:
            if e['type'] == 'pass': ev(e['at'] + e.get('dur', 0.7), 'chime')
            if e['type'] == 'sparkle': ev(e['at'], 'gliss')

    # 混响 + 收尾淡出
    def ir(seed):
        r = np.random.default_rng(seed)
        n = int(SR * 2.2)
        s = np.arange(n) / SR
        h = r.standard_normal(n) * np.exp(-s / 0.5)
        h[:int(SR * 0.02)] = 0
        return h / np.sqrt((h ** 2).sum())
    M = 1 << int(np.ceil(np.log2(N + SR * 2.2)))
    wet = np.stack([np.fft.irfft(np.fft.rfft(mix[c], M) * np.fft.rfft(ir(7 + c), M), M)[:N] for c in range(2)])
    out = mix * 0.8 + wet * 0.35
    out = out[:, :int(SR * dur)]
    t = np.arange(out.shape[1]) / SR
    out *= np.clip((dur - t) / 1.2, 0, 1) * np.clip(t / 0.3, 0, 1)
    out /= max(1e-6, np.abs(out).max()) / 0.89
    import wave
    with wave.open(out_path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((out.T * 32767).astype(np.int16).tobytes())
    print(f'背景音乐 {dur:.2f}s → {out_path}')


if __name__ == '__main__':
    main()
