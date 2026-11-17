"""声音合成库：全部音效与配乐都由代码生成（numpy/scipy），不使用任何采样素材。"""
import numpy as np, scipy.signal as sg

SR = 48000
PI2 = 2 * np.pi
def tt(d): return np.arange(int(d * SR)) / SR
def rs(seed): return np.random.default_rng(seed)
def white(d, seed=0): return rs(seed).standard_normal(int(d * SR))
def pink(d, seed=0):
    b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]; a = [1, -2.494956002, 2.017265875, -0.522189400]
    return sg.lfilter(b, a, white(d, seed)) * 8
def bp(x, lo, hi, order=2): return sg.sosfilt(sg.butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, order=2): return sg.sosfilt(sg.butter(order, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, order=2): return sg.sosfilt(sg.butter(order, f, 'highpass', fs=SR, output='sos'), x)
def norm(x, peak=1.0): return x / max(1e-9, np.abs(x).max()) * peak
def fade(x, a=0.01, r=0.01):
    x = x.copy(); na, nr = int(a * SR), int(r * SR)
    if na: x[:na] *= np.linspace(0, 1, na) ** 2
    if nr: x[-nr:] *= np.linspace(1, 0, nr) ** 2
    return x
def lfo(d, rate, seed=0, depth=1.0):
    """平滑随机起伏 0..1"""
    n = int(d * SR); k = max(4, int(d * rate) + 4); pts = rs(seed).uniform(0, 1, k)
    return 1 - depth + depth * np.interp(np.linspace(0, k - 1, n), np.arange(k), sg.savgol_filter(pts, min(k - (1 - k % 2), 5), 2) if k >= 5 else pts)
def stereo(x, pan=0.0):
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    return np.stack([x * l, x * r], 1)

def make_ir(d, seed=1, bright=4000, pre=0.012):
    t = tt(d); L = lp(white(d, seed), bright) * np.exp(-t * 6.9 / d); R = lp(white(d, seed + 1), bright) * np.exp(-t * 6.9 / d)
    ir = np.stack([L, R], 1); ir[:int(pre * SR)] *= 0.2
    return ir / np.sqrt((ir ** 2).sum(0)).mean()
IR_ROOM = make_ir(0.55, 3, 3500)
IR_HALL = make_ir(2.8, 7, 3000)
IR_VAST = make_ir(4.5, 11, 2200)
def reverb(x, ir=IR_ROOM, wet=0.25, dry=1.0):
    if x.ndim == 1: x = stereo(x)
    w = np.stack([sg.fftconvolve(x[:, i], ir[:, i]) for i in (0, 1)], 1)
    out = np.zeros_like(w); out[:len(x)] += x * dry; out += w * wet
    return out

# ---------------- 音效 ----------------
def knock_one(seed=0, f0=150, amp=1.0):
    d = 0.7; t = tt(d); r = rs(seed); x = np.zeros_like(t)
    for f, dec, a in [(f0, 20, 1.0), (f0 * 1.9, 32, .6), (f0 * 3.1, 48, .36), (f0 * 4.7, 70, .2), (f0 * 7.3, 110, .1)]:
        x += a * np.sin(PI2 * f * (1 + r.uniform(-.02, .02)) * t) * np.exp(-dec * t)
    x += bp(r.standard_normal(len(t)), 700, 3200) * np.exp(-200 * t) * .9
    x *= np.minimum(1, t / 0.0012)
    return lp(x, 2600) * amp
def knocks(pattern=(0, 0.46, 0.92)):
    """三声敲门——片头与第六夜用的是同一段"""
    out = np.zeros(int((pattern[-1] + 1.0) * SR))
    for i, (p, a, f) in enumerate(zip(pattern, (1.0, .9, 1.06), (150, 146, 153))):
        k = knock_one(40 + i, f, a); s = int(p * SR); out[s:s + len(k)] += k
    return reverb(norm(out, .9), IR_ROOM, .5)

def water(d, seed=5):
    """河水：粉噪带通 + 缓慢起伏 + 零星的咕噜声"""
    chans = []
    for c in (0, 1):
        x = bp(pink(d, seed + c), 280, 2600) * lfo(d, 1.3, seed + 9 + c, .45) + bp(white(d, seed + 20 + c), 1800, 6000) * .12 * lfo(d, 3, seed + 3 + c, .7)
        r = rs(seed + 50 + c); n = len(x)
        for _ in range(int(d * 3.2)):
            s = r.integers(0, n - 4000); L = r.integers(900, 3200); t = np.arange(L) / SR; f0 = r.uniform(380, 1100)
            x[s:s + L] += np.sin(PI2 * (f0 * t + r.uniform(300, 1400) * t * t)) * np.hanning(L) * r.uniform(.25, .7)
        chans.append(x)
    return norm(np.stack(chans, 1), .5)
def wind(d, seed=8, lo=180, hi=900):
    chans = []
    for c in (0, 1):
        a = bp(pink(d, seed + c), lo, hi) * lfo(d, .35, seed + 4 + c, .8)
        b = bp(pink(d, seed + 7 + c), lo * 2.2, hi * 2.4) * lfo(d, .22, seed + 11 + c, .95) ** 2 * .6
        chans.append(a + b)
    return norm(np.stack(chans, 1), .5)
def roomtone(d, seed=2): return norm(np.stack([lp(pink(d, seed), 240), lp(pink(d, seed + 1), 240)], 1), .5)

def hoof(seed=0, wood=False, amp=1.0):
    d = .28; t = tt(d); r = rs(seed)
    x = bp(r.standard_normal(len(t)), 700, 2400) * np.exp(-t * 85) * .9 + np.sin(PI2 * r.uniform(95, 125) * t) * np.exp(-t * 38) * .8
    if wood:
        for f, a in [(r.uniform(210, 260), .8), (r.uniform(380, 450), .5), (r.uniform(620, 700), .25)]: x += np.sin(PI2 * f * t) * np.exp(-t * 30) * a
    return x * amp * np.minimum(1, t / .001)
def hooves(d, wood=False, seed=3, rate=1.45, amp_env=None):
    """四拍慢步"""
    out = np.zeros(int(d * SR) + SR); r = rs(seed); step = 1 / rate / 2; t = 0.05; i = 0
    while t < d:
        for off, a in ((0, 1.0), (step * .42, .7)):
            k = hoof(seed * 100 + i, wood, a * r.uniform(.8, 1.1)); s = int((t + off + r.uniform(-.012, .012)) * SR)
            if s + len(k) < len(out): out[s:s + len(k)] += k
            i += 1
        t += step
    out = out[:int(d * SR)]
    return reverb(norm(out, .7), IR_ROOM, .16)

def whoosh(d=.45, seed=1, lo=(200, 900), hi=(1500, 7000)):
    n = int(d * SR); x = white(d, seed); u = np.linspace(0, 1, n)
    y = bp(x, *lo) * (1 - u) + bp(x, *hi) * u
    return norm(y * np.sin(np.pi * u ** .7) ** 2, .9)
def shing(seed=2):
    d = 1.3; t = tt(d); r = rs(seed); x = np.zeros_like(t)
    for f, dec, a in [(2330, 5, 1), (3610, 6.5, .8), (5240, 8, .6), (6870, 10, .45), (9140, 13, .3), (11800, 16, .2)]:
        x += a * np.sin(PI2 * f * t * (1 + .0006 * np.sin(PI2 * 7 * t)) + r.uniform(0, 6)) * np.exp(-dec * t)
    scrape = hp(white(d, seed), 3500) * np.minimum(1, t / .07) * np.exp(-np.maximum(0, t - .07) * 16)
    return norm(x * .5 * np.minimum(1, t / .05) + scrape * .8, .9)
def thud(seed=0, f=72, amp=1.0, wood=True):
    d = .9; t = tt(d); fr = f * (1 + .9 * np.exp(-t * 40)); x = np.sin(PI2 * np.cumsum(fr) / SR) * np.exp(-t * 9)
    x += lp(white(d, seed), 900) * np.exp(-t * 45) * .8
    if wood:
        for ff, a in [(190, .5), (310, .35), (540, .2)]: x += np.sin(PI2 * ff * t) * np.exp(-t * 26) * a
    return norm(x, .9) * amp
def boom(d=2.4, f=46, seed=4):
    t = tt(d); fr = f * (.62 + .9 * np.exp(-t * 6)); x = np.sin(PI2 * np.cumsum(fr) / SR) * np.exp(-t * 1.9)
    x += lp(white(d, seed), 160) * np.exp(-t * 2.4) * .9 + lp(white(d, seed + 1), 2500) * np.exp(-t * 28) * .7
    return norm(np.tanh(x * 1.6), .95)
def taiko(f=64, amp=1.0, seed=0):
    d = 1.5; t = tt(d); fr = f * (1 + 1.3 * np.exp(-t * 34)); x = np.sin(PI2 * np.cumsum(fr) / SR) * np.exp(-t * 4.6)
    x += .4 * np.sin(PI2 * np.cumsum(fr * 1.52) / SR) * np.exp(-t * 9) + lp(white(d, seed), 1500) * np.exp(-t * 46) * .8
    return norm(np.tanh(x * 1.3), .95) * amp
def clack(seed=0):
    """拍子木"""
    d = .35; t = tt(d); x = bp(white(d, seed), 1400, 5200) * np.exp(-t * 95) * .9
    for f, a in [(1150, 1), (2380, .7), (3140, .4)]: x += np.sin(PI2 * f * t) * np.exp(-t * 55) * a
    return reverb(norm(x * np.minimum(1, t / .0008), .9), IR_HALL, .28)
def creak(d=1.0, f0=380, f1=520, rate0=26, rate1=44, seed=3):
    n = int(d * SR); u = np.linspace(0, 1, n); rate = rate0 + (rate1 - rate0) * u + rs(seed).uniform(-4, 4) * np.sin(PI2 * 1.7 * u)
    ph = np.cumsum(rate) / SR; pe = (ph % 1) ** 5
    y = bp(white(d, seed) * pe, min(f0, f1) * .8, max(f0, f1) * 1.7) + .5 * np.sin(PI2 * np.cumsum(f0 + (f1 - f0) * u) / SR) * pe
    return norm(y * np.sin(np.pi * u) ** .6, .8)
def door_slide(d=1.4, seed=6):
    n = int(d * SR); u = np.linspace(0, 1, n); x = lp(white(d, seed), 420) * np.sin(np.pi * u) ** .5
    r = rs(seed); clicks = np.zeros(n)
    for _ in range(int(d * 30)):
        s = r.integers(0, n - 600); L = 500; t = np.arange(L) / SR; clicks[s:s + L] += np.sin(PI2 * r.uniform(900, 2600) * t) * np.exp(-t * 300) * r.uniform(.2, 1)
    x = norm(x, .8) + clicks * .22 * np.sin(np.pi * u)
    st = thud(seed, 90, .5); out = np.zeros(n + len(st)); out[:n] += x; out[n - 2000:n - 2000 + len(st)] += st * .6
    return reverb(norm(out, .8), IR_ROOM, .22)
def rustle(d=.5, seed=4): n = int(d * SR); u = np.linspace(0, 1, n); return norm(bp(white(d, seed), 1500, 7000) * np.sin(np.pi * u) ** 2 * lfo(d, 30, seed, .7), .7)
def slap(seed=1): d = .12; t = tt(d); return norm(hp(white(d, seed), 1200) * np.exp(-t * 70), .8)
def splat(seed=2): d = .5; t = tt(d); return norm(lp(white(d, seed), 1800) * np.exp(-t * 14) * lfo(d, 40, seed, .8), .8)
def crash(d=3.6, seed=9):
    """屋顶被撞破：爆裂 + 木头断裂 + 碎片四散"""
    n = int(d * SR); t = tt(d); r = rs(seed)
    x = lp(white(d, seed), 5000) * np.exp(-t * 5) + lp(white(d, seed + 1), 300) * np.exp(-t * 2.2) * 1.4
    for i in range(34):   # 断木
        s = int(r.uniform(0, .9) ** 1.6 * SR); L = int(.14 * SR); tk = np.arange(L) / SR
        c = sum(np.sin(PI2 * f * tk) * np.exp(-tk * r.uniform(40, 90)) for f in r.uniform(180, 1600, 3)) + bp(r.standard_normal(L), 900, 5000) * np.exp(-tk * 120)
        x[s:s + L] += c * r.uniform(.3, 1.0)
    for i in range(110):  # 碎片落地
        s = int((.35 + r.uniform(0, 1) ** .8 * (d - .6)) * SR); L = int(.05 * SR); tk = np.arange(L) / SR
        if s + L < n: x[s:s + L] += np.sin(PI2 * r.uniform(500, 3200) * tk) * np.exp(-tk * 160) * r.uniform(.05, .32) * (1 - s / n)
    return norm(np.tanh(x * 1.2), .98)
def ticks(d, seed=3, rate=1.2):
    n = int(d * SR); x = np.zeros(n); r = rs(seed)
    for _ in range(int(d * rate)):
        s = r.integers(0, n - 3000); L = 2400; tk = np.arange(L) / SR; x[s:s + L] += np.sin(PI2 * r.uniform(600, 2800) * tk) * np.exp(-tk * 150) * r.uniform(.1, .5)
    return x
def heartbeat(d, bpm=54, seed=0, accel=0.0):
    n = int(d * SR); x = np.zeros(n + SR); t = 0.1
    while t < d:
        for off, f, a in ((0, 58, 1.0), (.16, 50, .7)):
            L = int(.3 * SR); tk = np.arange(L) / SR; k = np.sin(PI2 * f * (1 + .5 * np.exp(-tk * 40)) * tk) * np.exp(-tk * 20) * a; s = int((t + off) * SR); x[s:s + L] += k
        t += 60 / (bpm * (1 + accel * t / d))
    return lp(x[:n], 180) * .9
def howl(d=3.0, f0=520, f1=170, seed=5):
    n = int(d * SR); u = np.linspace(0, 1, n); f = f0 * (f1 / f0) ** (u ** .7) * (1 + .03 * np.sin(PI2 * 6.3 * u * d))
    ph = PI2 * np.cumsum(f) / SR; x = np.sin(ph) + .5 * np.sin(2 * ph) + .3 * np.sin(3 * ph + .5) + bp(white(d, seed), 300, 1500) * .5
    x = bp(x, 150, 1800) * np.sin(np.pi * u ** .5) ** 1.5
    return reverb(norm(x, .8), IR_VAST, .7, .5)
def growl(d=1.8, seed=6):
    n = int(d * SR); u = np.linspace(0, 1, n); f = 52 * (1 + .25 * u) * (1 + .04 * lfo(d, 18, seed, 1))
    ph = np.cumsum(f) / SR; saw = 2 * (ph % 1) - 1
    x = bp(saw, 90, 1100) + bp(saw * (1 + white(d, seed) * .4), 500, 1800) * .7
    return reverb(norm(np.tanh(x * 3) * np.sin(np.pi * u) ** .8, .8), IR_HALL, .4, .8)
def riser(d=3.0, seed=7):
    """不协和音簇上滑 + 颤动，用于变脸"""
    n = int(d * SR); u = np.linspace(0, 1, n); x = np.zeros(n); r = rs(seed)
    for f0 in (110.0, 116.5, 164.8, 174.6, 233.1, 246.9):
        f = f0 * (1 + .55 * u ** 2) * (1 + .004 * np.sin(PI2 * r.uniform(4, 7) * u * d)); ph = PI2 * np.cumsum(f) / SR
        x += sum(np.sin(k * ph + r.uniform(0, 6)) / k for k in range(1, 9))
    trem = 1 - .45 * u * (.5 + .5 * np.sin(PI2 * np.cumsum(5 + 11 * u) / SR))
    x = (lp(x, 700) * (1 - u) + lp(x, 4200) * u) * trem * u ** 1.8 + hp(white(d, seed), 2500) * u ** 3 * .5
    return reverb(norm(x, .85), IR_HALL, .3, .9)

# ---------------- 乐器 ----------------
def pluck(f, d=3.5, bright=.55, seed=0, damp=.9965):
    """筝：Karplus-Strong"""
    N = max(2, int(round(SR / f))); r = rs(seed); buf = r.uniform(-1, 1, N)
    for _ in range(int((1 - bright) * 6) + 1): buf = .5 * (buf + np.roll(buf, 1))
    P = int(d * SR / N) + 1; out = np.empty((P, N))
    for i in range(P): out[i] = buf; buf = damp * (.5 * buf + .5 * np.roll(buf, 1))
    x = out.ravel()[:int(d * SR)]; t = tt(d)[:len(x)]
    x = x + bp(r.standard_normal(len(x)), 1500, 5000) * np.exp(-t * 180) * .3
    return fade(norm(x, .9), 0.001, .2)
def shaku(f, d=4.0, bend=-.07, seed=0, vib=5.0):
    """尺八：带气声的长音，起音由低滑上，尾部颤音"""
    n = int(d * SR); u = np.linspace(0, 1, n); t = u * d
    fc = f * (1 + bend * np.exp(-t * 4.5)) * (1 + .009 * np.clip(u * 2 - .5, 0, 1) * np.sin(PI2 * vib * t))
    ph = PI2 * np.cumsum(fc) / SR
    tone = np.sin(ph) + .32 * np.sin(2 * ph + .3) + .1 * np.sin(3 * ph)
    breath = bp(white(d, seed), f * .9, f * 3.2) * (.35 + .5 * np.exp(-t * 6)) + bp(white(d, seed + 1), 2500, 7000) * .06
    env = np.minimum(1, t / .32) ** 1.5 * np.minimum(1, (d - t) / .8) ** 1.2 * (.85 + .15 * np.sin(PI2 * .9 * t))
    return (tone * .8 + breath * .7) * env * .6
def drone(d, f=73.42, seed=1):
    t = tt(d); chans = []
    for c in (0, 1):
        x = np.zeros_like(t)
        for i, (m, a) in enumerate([(1, 1), (1.4983, .5), (2.0, .55), (2.006, .4), (3.0, .16), (.5, .7)]):
            x += a * np.sin(PI2 * f * m * t + c * 1.3 + i) * lfo(d, .18, seed + i * 3 + c, .6)
        chans.append(lp(x, 420))
    return norm(np.stack(chans, 1), .5)
def eerie(d, f=1174.7, seed=2):
    """高处的细线：两根略微失谐的正弦"""
    t = tt(d); u = t / d
    x = np.sin(PI2 * f * t) * lfo(d, .4, seed, .5) + np.sin(PI2 * f * 1.0595 * t + 1) * lfo(d, .31, seed + 1, .7) * .8 + np.sin(PI2 * f * 2.01 * t) * .2 * lfo(d, .5, seed + 2, .9)
    return x * np.sin(np.pi * u) ** .8 * .3
def rin(f=587.33, d=7.5, seed=0):
    """磬（りん）"""
    t = tt(d); x = np.zeros_like(t)
    for m, a, dec in [(1, 1, .55), (2.76, .5, .9), (5.4, .25, 1.4), (8.93, .12, 2.2)]:
        x += a * (np.sin(PI2 * f * m * t) + np.sin(PI2 * (f * m + .7) * t + 1)) * .5 * np.exp(-t * dec)
    x += bp(white(d, seed), 2000, 6000) * np.exp(-t * 120) * .3
    return reverb(norm(x * np.minimum(1, t / .002), .8), IR_HALL, .3)
