#!/usr/bin/env python3
"""时间轴生成：shots.json（镜头结构）+ vo.json（实际配音时长）-> build/<ep>/timeline.json
镜头长度完全由配音实际长度推出，换配音后重跑即可。
用法: python3 tools/timeline.py ep01
"""
import json, os, sys, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ep = sys.argv[1]
sh = json.load(open(os.path.join(ROOT, ep, 'shots.json'), encoding='utf8'))
vo = json.load(open(os.path.join(ROOT, 'build', ep, 'vo.json'), encoding='utf8'))
sc = json.load(open(os.path.join(ROOT, ep, 'script.json'), encoding='utf8'))
fps = sh.get('fps', 30)
t = 0.0; marks = {}; shots = []; lines = []; started = {}
for s in sh['shots']:
    st = t
    for seg in s['seq']:
        if 'hold' in seg:
            if seg.get('mark'): marks[seg['mark']] = round(t, 3)
            t += seg['hold']
        else:
            lid = seg['line']; v = vo[lid]; n = len(v['clauses'])
            a, b = seg.get('c', [0, n])
            t += seg.get('pre', 0)
            if lid not in started:
                # 整句音频从其第一个分句所在镜头开始连续播放
                started[lid] = t - v['clauses'][a]['t'][0]
                lines.append(dict(id=lid, start=round(started[lid], 3), dur=v['dur'], voice=v['voice']))
                marks[lid] = round(started[lid], 3); marks[lid + '.end'] = round(started[lid] + v['dur'], 3)
                for i, c in enumerate(v['clauses']): marks['%s.c%d' % (lid, i)] = round(started[lid] + c['t'][0], 3)
            t = started[lid] + v['clauses'][b - 1]['t'][1] + seg.get('post', 0)
    t = round(t * fps) / fps
    shots.append(dict(id=s['id'], scene=s['scene'], p=s.get('p', {}), start=round(st, 4), end=round(t, 4), **{k: s[k] for k in ('in', 'out') if k in s}))
# 字幕：按分句出字，短分句合并成一行
subs = []
for ln in sc['lines']:
    if ln['id'] not in marks: continue
    v = vo[ln['id']]; st = marks[ln['id']]
    raw = ln['text']; quoted = raw.startswith('“')
    seps = re.findall(r'[，。？！、；：]|——', re.sub(r'[“”]', '', raw))
    cl = v['clauses']; groups = []; cur = None
    for i, c in enumerate(cl):
        sep = seps[i] if i < len(seps) else ''
        if cur and len(cur['text']) + len(c['text']) + 1 <= 11 and cur['sep'] in '，、':
            cur['text'] += cur['sep'] + c['text']; cur['t'][1] = c['t'][1]; cur['sep'] = sep
        else:
            cur = dict(text=c['text'], t=list(c['t']), sep=sep); groups.append(cur)
    for i, g in enumerate(groups):
        txt = g['text'] + (g['sep'] if g['sep'] in ('？', '！', '——') else '')
        if quoted: txt = ('“' if i == 0 else '') + txt + ('”' if i == len(groups) - 1 else '')
        e = st + (groups[i + 1]['t'][0] if i + 1 < len(groups) else g['t'][1] + 0.25)
        subs.append(dict(text=txt, start=round(st + g['t'][0], 3), end=round(e, 3), line=ln['id']))
out = dict(ep=ep, fps=fps, duration=round(t, 4), frames=int(round(t * fps)), shots=shots, lines=lines, subs=subs, marks=marks,
           overlays=sh.get('overlays', []), meta=dict(series=sc['series'], title=sc['title'], night=sc['night']))
json.dump(out, open(os.path.join(ROOT, 'build', ep, 'timeline.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('duration %.2fs  frames %d  shots %d' % (t, out['frames'], len(shots)))
for s in shots: print(' %s %-10s %6.2f - %6.2f (%.2fs)' % (s['id'], s['scene'], s['start'], s['end'], s['end'] - s['start']))
