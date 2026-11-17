"""第一期《一条戻桥》声音提示表。时间全部取自时间轴标记（m.M）与镜头起止（m.st / m.en），
配音变长变短后重跑即可自动对位。"""
import numpy as np

def build(m, S):
    M, st, en = m.M, m.st, m.en
    D4, Eb4, G4, A4, Bb4, D5, Eb5, A3, D3, G3, Bb3 = 293.66, 311.13, 392.0, 440.0, 466.16, 587.33, 622.25, 220.0, 146.83, 196.0, 233.08
    dur = m.tl['duration']
    KN = S.knocks()
    koto = lambda f, d=3.5, seed=0, wet=.35: S.reverb(S.pluck(f, d, .55, seed), S.IR_HALL, wet)
    def phrase(t, notes, gain=.5, bus='mus'):
        for i, (dt, f, g) in enumerate(notes): m.add(bus, koto(f, 3.8, int(f) + i), t + dt, gain * g, pan=(-.25, .2, 0, .3)[i % 4])

    # ---------- 片头：黑暗中的敲门 ----------
    m.add('sfx', KN, M['knockA'], 1.0)
    m.bed('amb', S.roomtone(en('S02') + 1, 2), [(0, 0), (1.0, .5), (en('S02') - .4, .5), (en('S02') + .3, 0)])
    m.bed('mus', S.drone(en('S02') + 1.5, 73.42, 1), [(.3, 0), (M['L01'], .32), (en('S02') - .5, .4), (en('S02') + .4, 0)])
    m.add('mus', S.eerie(en('S02') - M['L02'] + 1.0, 1174.7, 2), M['L02'] - .2, .09)
    m.bed('amb', S.wind(en('S02') - st('S02') + .5, 8), [(st('S02'), 0), (st('S02') + 1, .12), (en('S02') - .3, .14), (en('S02') + .3, 0)])

    # ---------- 桥：片名、马蹄、流水 ----------
    t4 = st('S04')
    m.add('sfx', S.clack(1), M['title'] + .15, .5); m.add('sfx', S.clack(2), M['title'] + .62, .62)
    phrase(M['title'] + 1.1, [(0, D4, 1), (.85, A4, .8), (1.5, Bb4, .9), (2.9, A4, .6), (3.5, G4, .6), (4.6, Eb4, .8), (5.6, D4, .9)], .46)
    wat = S.water(en('S13') - t4 + 2, 5)
    m.bed('amb', wat, [(t4, 0), (t4 + 1.2, .42), (st('S05b'), .4), (st('S05b') + .3, .26), (st('S06'), .4), (st('S06b'), .3), (st('S08') - .1, .3),
                       (st('S08') + .5, .78), (en('S08') - .2, .78), (st('S09') + .2, .22), (st('S11'), .1), (st('S12'), .36), (en('S13') - .6, .34), (en('S13') + .6, 0)])
    m.bed('amb', S.wind(en('S13') - t4 + 2, 18), [(t4, 0), (t4 + 2, .16), (st('S08'), .12), (st('S08') + .3, .03), (st('S09'), .1), (st('S10'), .5), (st('S11'), .08), (st('S13'), .18), (en('S13') + .5, 0)])
    m.bed('mus', S.drone(st('S08') - t4 + 1, 73.42, 4), [(t4, 0), (t4 + 2, .3), (st('S07'), .34), (st('S08') - .15, .34), (st('S08') + .25, 0)])
    m.add('mus', S.reverb(S.shaku(D4, 5.2, -.07, 3), S.IR_HALL, .4), M['L04'] + .4, .2, pan=.2)
    # 马蹄：土路 -> 停 -> 上桥（木板声）
    h1 = M['L04'] - .3; h1e = st('S05') + 2.5
    m.bed('sfx', S.hooves(h1e - h1 + .3, False, 3, 1.4), [(h1, 0), (h1 + 1.2, .22), (st('S05'), .4), (h1e - .5, .36), (h1e, 0)])
    h2 = st('S06') + .1; h2e = st('S08')
    m.bed('sfx', S.hooves(h2e - h2 + .3, True, 5, 1.3), [(h2, 0), (h2 + .4, .46), (st('S06b'), .42), (st('S06b') + .3, .2), (st('S07'), .26), (h2e - .7, .22), (h2e - .1, 0)])
    m.add('mus', koto(Bb4, 3, 31), M['L06'] - .25, .16)
    m.add('mus', S.reverb(S.shaku(A3, 3.4, -.05, 9), S.IR_HALL, .4), M['L07'] - .1, .15, pan=-.2)

    # ---------- 倒影：音乐停，只留水声 ----------
    c = M['L10.c1']
    m.add('mus', S.eerie(en('S08') - c + .6, 3136.0, 12), c - .2, .05)
    m.add('sfx', S.boom(2.2, 38, 3), c + .05, .34)

    # ---------- 交锋 ----------
    m.add('sfx', S.rustle(.6, 4), st('S09') + .25, .3)
    g0 = st('S09b') + (en('S09b') - st('S09b')) * .34
    m.add('sfx', S.boom(2.0, 50, 5), g0 - .02, .7); m.add('sfx', S.taiko(60, 1, 1), g0 - .02, .6); m.add('sfx', S.whoosh(.3, 3), g0 - .28, .4)
    # 太鼓由疏到密
    t = g0 + .5; iv = .46; i = 0
    while t < M['slash'] - .12:
        m.add('mus', S.taiko(66 + (i % 2) * 6, 1, i), t, min(.62, .2 + i * .035), pan=(-.2, .2)[i % 2]); t += iv; iv = max(.085, iv * .86); i += 1
    m.add('sfx', S.whoosh(1.5, 7, (150, 700), (900, 5000)), st('S10') + .1, .5)
    sl = M['slash']
    m.add('sfx', S.shing(2), sl - .08, .62); m.add('sfx', S.whoosh(.34, 9), sl - .1, .8); m.add('sfx', S.taiko(54, 1, 9), sl + .08, .95); m.add('sfx', S.boom(2.6, 44, 8), sl + .08, .55)
    m.add('sfx', S.splat(2), sl + .2, .35)
    ah = st('S12') + 1.1
    m.add('sfx', S.whoosh(.5, 11, (150, 500), (500, 1800)), ah - .5, .22); m.add('sfx', S.reverb(S.thud(3, 70, 1), S.IR_ROOM, .25), ah, .85)
    m.add('sfx', S.howl(3.4, 480, 150, 5), st('S13') + .15, .17, pan=-.4)
    phrase(M['L14'] + 1.6, [(0, D4, 1), (1.3, A3, .8)], .34)

    # ---------- 归家、封箱 ----------
    t14 = st('S14')
    m.bed('sfx', S.hooves(en('S14') - t14 + .3, False, 7, 1.25), [(t14, 0), (t14 + .6, .26), (en('S14') - .4, .24), (en('S14'), 0)])
    m.bed('mus', S.drone(st('S17') - t14 + 1, 73.42, 6), [(t14, 0), (t14 + 1.5, .26), (st('S16'), .26), (M['L18.end'], .3), (M['L18.end'] + 1.0, 0)])
    m.bed('amb', S.roomtone(dur - st('S15') + 1, 22), [(st('S15'), 0), (st('S15') + .5, .4), (st('S29'), .3), (dur, 0)])
    c3 = M['L15.c3']
    m.add('sfx', S.reverb(S.thud(5, 84, 1), S.IR_ROOM, .3), c3 - .14, .6); m.add('sfx', S.creak(.5, 420, 560, 30, 52, 4), c3 + .06, .3); m.add('sfx', S.slap(1), c3 + .55, .36)

    # ---------- 六夜 ----------
    m.add('mus', koto(D4, 4, 51), M['L16'] - .1, .34); m.add('mus', koto(Eb4, 4, 52), M['L17'] - .1, .34)
    m.add('sfx', S.whoosh(max(.8, M['L18.end'] - M['L18'] + .6), 14, (120, 400), (300, 1200)), M['L18'] - .1, .2)
    m.add('mus', koto(D3, 5, 53, .5), M['L18.end'] + .1, .4)
    hb0 = M['L18']; hb1 = M['knockB'] - .25
    m.bed('sfx', S.heartbeat(hb1 - hb0 + .2, 50, 0), [(hb0, 0), (hb0 + 1, .3), (hb1 - .2, .42), (hb1, 0)])
    # 敲门：与片头同一段
    m.add('sfx', KN, M['knockB'], 1.0)
    m.bed('amb', S.wind(en('S19') - st('S17') + 1, 28), [(st('S17'), 0), (st('S17') + .6, .1), (st('S18'), .1), (st('S18') + 1.2, .24), (en('S19') - .3, .2), (en('S19') + .4, 0)])
    m.add('sfx', S.door_slide(1.45, 6), st('S18') + .25, .5)
    m.add('mus', S.reverb(S.shaku(G3, 4.6, -.04, 13, 4.2), S.IR_HALL, .4), M['L21'] - .2, .12)

    # ---------- 开箱 ----------
    t20 = st('S20')
    m.bed('mus', S.drone(st('S25') - t20 + 1, 69.3, 9), [(t20, 0), (t20 + 1.5, .24), (st('S23'), .34), (st('S24'), .2), (st('S25') - .1, 0)])
    m.add('sfx', S.creak(.7, 240, 300, 16, 24, 8), t20 + .45, .2)
    m.add('sfx', S.creak(.55, 430, 560, 28, 50, 9), M['L22.c1'] + .05, .26); m.add('sfx', S.rustle(.5, 6), M['L22.c1'] + .5, .22)
    m.add('sfx', S.reverb(S.creak(1.5, 300, 520, 14, 30, 10), S.IR_ROOM, .3), M['L22.c2'] + .1, .32)
    hb0 = t20 + .2; hb1 = M['L24.c1'] + .55
    m.bed('sfx', S.heartbeat(hb1 - hb0 + .3, 56, 2, .5), [(hb0, 0), (hb0 + 1.5, .34), (st('S21'), .46), (hb1 - .1, .6), (hb1, 0)])
    m.add('mus', S.eerie(st('S23') - st('S21') + .3, 1244.5, 21), st('S21') - .1, .1)
    gh = M['L24.c1'] + .57
    m.add('sfx', S.boom(2.2, 52, 12), gh, .75); m.add('sfx', S.taiko(58, 1, 12), gh, .7); m.add('sfx', S.splat(5), gh + .02, .3)

    # ---------- 变脸、破屋顶 ----------
    r0 = M['L26.c1'] - .25; rb = M['crash']
    m.add('mus', S.riser(rb - r0 + .05, 7), r0, .6)
    m.add('sfx', S.growl(1.9, 6), M['L26.c1'] + .15, .32)
    m.add('sfx', S.whoosh(.6, 15, (100, 500), (800, 4000)), rb - .55, .6)
    m.add('sfx', S.reverb(S.crash(3.8, 9), S.IR_ROOM, .3), rb, 1.0); m.add('sfx', S.taiko(50, 1, 20), rb, 1.0); m.add('sfx', S.boom(3.2, 40, 14), rb, .8)
    m.add('sfx', S.howl(3.6, 560, 140, 9), rb + .4, .2, pan=.3)

    # ---------- 空箱 ----------
    t26 = st('S26')
    m.bed('amb', S.wind(dur - t26 + 1, 38, 150, 700), [(t26 - 1.5, 0), (t26, .22), (M['pause'], .16), (M['L31.end'] + 1, .12), (st('S29') + 1, .05), (dur, 0)])
    m.bed('sfx', S.ticks(M['toblack'] - t26 + 1, 3, 1.6), [(t26 - .5, 0), (t26, .3), (M['L30'], .22), (M['pause'], .1), (M['toblack'], 0)])
    m.bed('mus', S.drone(dur - t26 + 1, 73.42, 15), [(t26, 0), (t26 + 2, .16), (M['pause'], .1), (M['pause'] + .4, 0), (M['L31.end'] + .2, 0), (st('S29') + .5, .2), (dur - 1.2, .18), (dur, 0)])
    # “祖母。”之后：一声磬
    m.add('mus', S.rin(587.33, 8, 1), M['L31.end'] + .45, .34)
    te = M['endcard']
    m.add('sfx', S.clack(3), te + .55, .5)
    phrase(te + 1.3, [(0, A4, .8), (.6, Bb4, .9), (1.3, A4, .6), (1.9, G4, .6), (2.5, Eb4, .7)], .34)
    m.add('mus', koto(D4, 3, 77, .5), te + 3.3, .36)
