// 《INTJ · 正确》— a data-driven GSAP template.
//
// Everything is laid out from /data.json and put on one paused GSAP timeline;
// the renderer calls window.seekTo(seconds) once per frame. Anything random
// (film grain, dust, letter jitter, garbled glyphs, glitch slices) comes from a
// PRNG seeded by the frame number or by the shot/letter index, so the same
// frame always renders the same pixels.

/* global gsap */
const FPS = 30;
const W = 1920, H = 1080;
const RED = "#C8102E", INK = "#F2F2F2", BG = "#0B0B0B";

// ── layout rules (PROMPT §二, §四) ─────────────────────────────────────────
const TEXT_X = 120;
const TEXT_Y = 200;
const REGION_R = Math.round(W * 0.45); // nothing may cross x = 864
// Zhi Mang Xing's glyphs fill less of the em-box than Noto Serif's: set at
// 92px, its letters come out about as tall as the reference's 80px hand.
const A_MAX = 72, B_MAX = 92, MIN_SIZE = 60;
const B_INDENT = 60;
const B_SPLIT_OVER = 14; // longer second halves break at a comma / colon

// ── deterministic randomness ──────────────────────────────────────────────
const hash = (s) => {
  let h = 2166136261;
  for (const c of String(s)) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return h >>> 0;
};
const mulberry = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rnd = (...k) => mulberry(hash(k.join("|")))();

// ── helpers ───────────────────────────────────────────────────────────────
const stage = document.getElementById("stage");
const el = (tag, cls, parent, style = {}, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  Object.assign(e.style, style);
  if (text !== undefined) e.textContent = text;
  (parent || stage).appendChild(e);
  return e;
};
const ctx = document.createElement("canvas").getContext("2d");
const measure = (text, font, spacing = 0) => {
  ctx.font = font;
  return ctx.measureText(text).width + spacing * [...text].length;
};
const PUNCT = /[，、：；。？！,:;]/;
// split after punctuation, keeping it with the words before it
const segments = (text) => {
  const out = [];
  let cur = "";
  for (const c of text) {
    cur += c;
    if (PUNCT.test(c)) { out.push(cur); cur = ""; }
  }
  if (cur) out.push(cur);
  return out;
};
// hard-wrap one over-long segment into the fewest equal pieces that fit;
// punctuation never starts a line (it stays with the word before it)
const hardWrap = (seg, width) => {
  const chars = [...seg];
  for (let n = 2; n <= chars.length; n++) {
    const per = Math.ceil(chars.length / n);
    const out = [];
    for (let i = 0; i < chars.length; i += per) out.push(chars.slice(i, i + per).join(""));
    for (let k = 1; k < out.length; k++) {
      while (out[k] && PUNCT.test(out[k][0])) { out[k - 1] += out[k][0]; out[k] = out[k].slice(1); }
    }
    const lines = out.filter(Boolean);
    if (lines.every((l) => width(l) <= width.max)) return lines;
  }
  return chars;
};
// Fit `text` into lines no wider than maxW: biggest size from `max` down to
// MIN_SIZE at which every punctuation segment fits, segments packed greedily;
// below that, hard-wrap. `forced` = explicit line breaks to respect.
const fit = (text, fontFor, max, maxW, spacingFor, forced) => {
  const parts = forced || [text];
  for (let size = max; size >= MIN_SIZE; size -= 2) {
    const wOf = (s) => measure(s, fontFor(size), spacingFor(size));
    const lines = [];
    let ok = true;
    for (const part of parts) {
      let cur = "";
      for (const seg of segments(part)) {
        if (wOf(seg) > maxW) { ok = false; break; }
        if (cur && wOf(cur + seg) > maxW) { lines.push(cur); cur = seg; }
        else cur += seg;
      }
      if (!ok) break;
      if (cur) lines.push(cur);
    }
    if (ok) return { size, lines };
  }
  const size = MIN_SIZE;
  const wOf = (s) => measure(s, fontFor(size), spacingFor(size));
  wOf.max = maxW;
  const lines = parts.flatMap((p) => segments(p)).flatMap((s) => (wOf(s) > maxW ? hardWrap(s, wOf) : [s]));
  // re-pack greedily
  const packed = [];
  let cur = "";
  for (const s of lines) {
    if (cur && wOf(cur + s) > maxW) { packed.push(cur); cur = s; } else cur += s;
  }
  if (cur) packed.push(cur);
  return { size, lines: packed };
};
// the second half: break at the comma / colon nearest the middle if long
const splitB = (b) => {
  const chars = [...b];
  if (chars.length <= B_SPLIT_OVER) return [b];
  let best = -1, bestD = 1e9;
  chars.forEach((c, i) => {
    if (i < chars.length - 1 && /[，：；,:]/.test(c)) {
      const d = Math.abs(i + 1 - chars.length / 2);
      if (d < bestD) { bestD = d; best = i + 1; }
    }
  });
  return best > 0 ? [chars.slice(0, best).join(""), chars.slice(best).join("")] : [b];
};
const fontA = (s) => `900 ${s}px "Noto Serif SC"`;
const fontB = (s) => `400 ${s}px "Zhi Mang Xing"`;
const spaceA = () => 2;
const spaceB = (s) => s * 0.08;

// ── the timeline ──────────────────────────────────────────────────────────
const tl = gsap.timeline({ paused: true });
const procs = []; // per-frame procedural effects: (t, frame) => void
let missing = [];
let images = {};

const loadImage = (name) =>
  new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = `/assets/img/${name}`;
  });

const main = async () => {
  const data = await (await fetch("/data.json")).json();
  const shots = data.shots;

  // images: which exist, which are missing
  const wanted = new Set();
  for (const s of shots) {
    if (s.img) wanted.add(s.img);
    (s.flank || []).forEach((f) => wanted.add(f));
    (s.bg || []).forEach((b) => b.startsWith("img-invert:") && wanted.add(b.slice(11)));
  }
  for (const name of wanted) {
    const img = await loadImage(name);
    if (img) images[name] = img;
    else missing.push(name);
  }

  // fonts: make sure every glyph we use is fetched before laying anything out
  const allText = JSON.stringify(data) + "0123456789—·[]Nº：，。";
  await Promise.all([
    document.fonts.load(fontA(72), allText),
    document.fonts.load(`700 40px "Noto Serif SC"`, allText),
    document.fonts.load(`400 26px "Noto Serif SC"`, allText),
    document.fonts.load(fontB(80), allText),
    document.fonts.load(`400 100px "Bebas Neue"`, allText),
    document.fonts.load(`400 20px "IBM Plex Mono"`, allText),
  ]);
  await document.fonts.ready;

  // global layers (back to front)
  const haze = el("div", "full", stage);
  haze.id = "haze";
  const shotLayer = el("div", "full", stage);
  const flash = el("div", "full", stage);
  flash.id = "flash";
  const glitch = el("div", "full", stage);
  glitch.id = "glitch";
  const tag = el("div", "", stage);
  tag.id = "tag";
  el("div", "t1", tag, {}, data.series_tag[0]);
  el("div", "t2", tag, {}, data.series_tag[1]);
  const mark = el("div", "", stage, {}, `— ${data.watermark}`);
  mark.id = "mark";
  const credit = el("div", "", stage);
  credit.id = "credit";
  const creditEn = el("div", "en", credit);
  const creditYr = el("div", "yr", credit);
  const scan = el("div", "full", stage);
  scan.id = "scan";
  const vignette = el("div", "full", stage);
  vignette.id = "vignette";
  const grain = el("canvas", "", stage);
  grain.id = "grain";
  grain.width = 960;
  grain.height = 540;
  const black = el("div", "full", stage);
  black.id = "black";

  gsap.set([tag, credit], { autoAlpha: 0 });

  let t0 = 0;
  const timing = [];
  for (const s of shots) {
    const start = t0, end = t0 + s.dur;
    timing.push({ id: s.id, type: s.type, start, end });
    const root = el("div", "shot", shotLayer);
    tl.set(root, { visibility: "visible" }, start);
    tl.set(root, { visibility: "hidden" }, end);
    // the series tag: on cards and text shots, not on the hook or title
    if (s.type !== "hook" && s.type !== "title") {
      tl.set(tag, { autoAlpha: 1 }, start);
    } else {
      tl.set(tag, { autoAlpha: 0 }, start);
    }
    tl.set(credit, { autoAlpha: 0 }, start);
    BUILD[s.type](s, root, start, end, { flash, credit, creditEn, creditYr, black, data });
    // the last 0.3 s: tear across to the next shot (the end shot fades instead)
    if (s.type !== "end") glitchOut(root, end, s.id);
    t0 = end;
  }
  const duration = t0;
  tl.set({}, {}, duration); // make the timeline exactly as long as the film

  procs.push((t) => {
    let o = 0;
    for (const f of flashes) if (t >= f && t < f + 0.3) o = Math.max(o, 0.15 * (1 - (t - f) / 0.3));
    flash.style.opacity = String(o);
    // bottom-right credit text: the current quote shot's
    const cur = shots.find((s, i) => t >= timing[i].start && t < timing[i].end);
    if (cur && cur.en && creditEn.textContent !== cur.en) { creditEn.textContent = cur.en; creditYr.textContent = cur.years; }
  });
  // haze drifts; grain, dust and scan offset change every frame
  const g = grain.getContext("2d");
  const imgData = g.createImageData(960, 540);
  procs.push((t, frame) => {
    haze.style.transform = `translate(${Math.sin(t / 7) * 40}px, ${Math.cos(t / 9) * 25}px)`;
    scan.style.transform = `translateY(${(frame % 4)}px)`;
    const r = mulberry(frame * 7919 + 13);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = r() < 0.5 ? 0 : (r() * 255) | 0;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = v > 150 ? 26 : 10;
    }
    g.putImageData(imgData, 0, 0);
    // dust: a few specks of white, drifting
    g.fillStyle = "rgba(242,242,242,0.55)";
    for (let k = 0; k < 26; k++) {
      const x = (rnd("dx", k) * 960 + t * (6 + rnd("dv", k) * 10)) % 960;
      const y = (rnd("dy", k) * 540 + t * (2 + rnd("dw", k) * 4)) % 540;
      const s = 0.6 + rnd("ds", k) * 1.4;
      g.fillRect(x, y, s, s);
    }
  });

  window.seekTo = (sec) => {
    const t = Math.max(0, Math.min(duration, sec));
    const frame = Math.round(t * FPS);
    tl.seek(t, false);
    for (const p of procs) p(t, frame);
    return new Promise((res) => requestAnimationFrame(() => res(true)));
  };
  window.__duration = duration;
  window.__shots = timing;
  window.__missing = missing;
  window.__fonts = {
    serif: document.fonts.check(fontA(72), "正确"),
    hand: document.fonts.check(fontB(80), "正确"),
    display: document.fonts.check(`400 100px "Bebas Neue"`, "INTJ"),
    mono: document.fonts.check(`400 20px "IBM Plex Mono"`, "SOCRATES"),
  };
  await window.seekTo(0);
  window.__ready = true;
};

// ── the glitch cut ────────────────────────────────────────────────────────
const glitchOut = (root, end, id) => {
  const bands = Array.from({ length: 7 }, (_, i) => el("div", "abs", document.getElementById("glitch"), { left: 0, width: `${W}px`, display: "none" }));
  const sweep = el("div", "abs", document.getElementById("glitch"), { left: 0, width: `${W}px`, height: "3px", background: INK, boxShadow: `0 0 18px ${INK}`, display: "none" });
  procs.push((t, frame) => {
    const k = (t - (end - 0.3)) / 0.3;
    const on = k >= 0 && k < 1;
    bands.forEach((b) => (b.style.display = on ? "block" : "none"));
    sweep.style.display = on ? "block" : "none";
    if (!on) {
      if (root.dataset.glitched) { root.style.transform = ""; root.style.opacity = ""; delete root.dataset.glitched; }
      return;
    }
    const r = mulberry(hash(`g${id}`) + frame);
    root.dataset.glitched = "1";
    root.style.transform = `translateX(${(r() - 0.5) * 60 * k}px) skewX(${(r() - 0.5) * 8 * k}deg)`;
    root.style.opacity = String(1 - 0.35 * k * r());
    bands.forEach((b) => {
      const h = 4 + r() * 46 * k;
      b.style.top = `${r() * H}px`;
      b.style.height = `${h}px`;
      b.style.transform = `translateX(${(r() - 0.5) * 240 * k}px)`;
      const c = r();
      b.style.background = c < 0.45 ? BG : c < 0.8 ? `rgba(242,242,242,${0.15 + 0.5 * r()})` : RED;
      b.style.opacity = String(0.5 + 0.5 * k);
    });
    sweep.style.top = `${k * H}px`;
  });
};

// ── pieces shared by the text shots ───────────────────────────────────────
const outlineText = (root, word, start, end, { fallback = false } = {}) => {
  // the big background one: 8 %, drifting left the whole shot
  const o = el("div", "outline", root, { left: "120px", top: "170px" }, word);
  tl.fromTo(o, { opacity: 0 }, { opacity: 0.08, duration: 0.6, ease: "power1.out" }, start);
  tl.fromTo(o, { x: 0 }, { x: -140, duration: end - start, ease: "none" }, start);
  if (fallback) {
    // no picture: the outline word stands in for it, on the right
    const size = Math.min(520, 840 / ([...word].length * 0.42));
    const f = el("div", "outline", root, { left: "1010px", top: `${520 - size / 2}px`, fontSize: `${size}px`, WebkitTextStroke: `3px ${INK}` }, word);
    tl.fromTo(f, { opacity: 0, x: 60 }, { opacity: 0.2, x: 0, duration: 0.6, ease: "power2.out" }, start);
    tl.to(f, { x: -50, duration: end - start - 0.6, ease: "none" }, start + 0.6);
    return f;
  }
  return o;
};

// the picture on the right (portrait .png) or full bleed (scene .jpg)
const picture = (root, name, start, end, { invert = false, push = false } = {}) => {
  const img = images[name];
  if (!img) return null;
  const portrait = name.toLowerCase().endsWith(".png");
  const wrap = el("div", "abs", root, portrait ? { right: "60px", bottom: "0px", width: `${W * 0.46}px`, height: `${H - 60}px` } : { inset: 0 });
  const im = el("img", `photo${invert ? " invert" : ""}`, wrap, portrait ? { right: 0, bottom: 0, maxWidth: "100%", maxHeight: "100%", objectFit: "contain" } : { inset: 0, width: "100%", height: "100%", objectFit: "cover" });
  im.src = img.src;
  if (!portrait) el("div", "scene-dark", wrap);
  tl.fromTo(wrap, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, start);
  tl.fromTo(im, { scale: 1 }, { scale: push ? 1.1 : 1.03, duration: end - start, ease: "none", transformOrigin: "60% 40%" }, start);
  return wrap;
};

const reticle = (root, cx, cy, start, end) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", W);
  svg.setAttribute("height", H);
  svg.style.position = "absolute";
  svg.style.inset = "0";
  const g = document.createElementNS(svg.namespaceURI, "g");
  svg.appendChild(g);
  const add = (tagName, attrs) => {
    const n = document.createElementNS(svg.namespaceURI, tagName);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    g.appendChild(n);
    return n;
  };
  const rings = [60, 110, 170, 230].map((r, i) => add("circle", { cx, cy, r, fill: "none", stroke: i % 2 ? INK : RED, "stroke-width": i % 2 ? 1.5 : 4, opacity: i % 2 ? 0.6 : 0.95 }));
  add("line", { x1: cx - 300, y1: cy, x2: cx + 300, y2: cy, stroke: INK, "stroke-width": 1.2, opacity: 0.7 });
  add("line", { x1: cx, y1: cy - 300, x2: cx, y2: cy + 300, stroke: INK, "stroke-width": 1.2, opacity: 0.7 });
  for (let a = 0; a < 360; a += 15) {
    const r1 = 230, r2 = a % 45 ? 242 : 256;
    const x = Math.cos((a * Math.PI) / 180), y = Math.sin((a * Math.PI) / 180);
    add("line", { x1: cx + x * r1, y1: cy + y * r1, x2: cx + x * r2, y2: cy + y * r2, stroke: INK, "stroke-width": 1.2, opacity: 0.6 });
  }
  root.appendChild(svg);
  tl.fromTo(g, { opacity: 0, scale: 1.6, svgOrigin: `${cx} ${cy}` }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }, start);
  rings.forEach((c, i) => tl.fromTo(c, { rotation: 0, svgOrigin: `${cx} ${cy}` }, { rotation: (i % 2 ? -1 : 1) * 40, duration: end - start, ease: "none" }, start));
  return svg;
};

// red flashes are computed per frame from a list (safe to seek either way)
const flashes = [];
const redFlash = (flash, at) => flashes.push(at);

// Lay out and animate the two halves; returns timings and the letter boxes.
const quoteText = (s, root, start, ctx2) => {
  const { flash } = ctx2;
  const aFit = fit(s.a, fontA, A_MAX, REGION_R - TEXT_X, spaceA);
  const bForced = splitB(s.b);
  const bFit = fit(s.b, fontB, B_MAX, REGION_R - TEXT_X - B_INDENT, spaceB, bForced);
  const keyIn = s.key ? (s.b.includes(s.key) ? "b" : s.a.includes(s.key) ? "a" : null) : null;
  let y = TEXT_Y;
  const aLH = aFit.size * 1.38;
  let keyAt = null;
  // first half, line by line
  let aOffset = 0; // char offset into s.a, to find the key
  aFit.lines.forEach((line, i) => {
    const d = el("div", "qa", root, { left: `${TEXT_X}px`, top: `${y}px`, fontSize: `${aFit.size}px`, letterSpacing: "2px", lineHeight: `${aLH}px` });
    if (keyIn === "a") {
      const k = s.a.indexOf(s.key) - aOffset;
      if (k >= 0 && k < line.length) {
        d.append(line.slice(0, k));
        el("span", "key", d, {}, line.slice(k, k + s.key.length));
        d.append(line.slice(k + s.key.length));
      } else d.textContent = line;
    } else d.textContent = line;
    const at = start + 0.4 + i * 0.25;
    tl.fromTo(d, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, at);
    if (keyIn === "a" && s.a.indexOf(s.key) - aOffset >= 0 && s.a.indexOf(s.key) - aOffset < line.length) keyAt = at;
    aOffset += line.length;
    y += aLH;
  });
  y += 18;
  // second half, letter by letter
  const bLH = bFit.size * 1.3;
  const chars = [];
  const keyStart = keyIn === "b" ? s.b.indexOf(s.key) : -1;
  let idx = 0;
  bFit.lines.forEach((line) => {
    let x = TEXT_X + B_INDENT;
    for (const c of line) {
      const sz = bFit.size * (0.94 + rnd(s.id, "sz", idx) * 0.14);
      const w = measure(c, fontB(sz), 0);
      const dy = (rnd(s.id, "dy", idx) - 0.5) * bFit.size * 0.16;
      const rot = (rnd(s.id, "rot", idx) - 0.5) * 8;
      const isKey = keyStart >= 0 && idx >= keyStart && idx < keyStart + s.key.length;
      const span = el("div", `ch${isKey ? " key" : ""}`, root, { left: `${x}px`, top: `${y + dy}px`, fontSize: `${sz}px`, lineHeight: `${bLH}px` }, c);
      chars.push({ span, x, y: y + dy, w, h: bLH, i: idx, c, isKey, rot });
      x += w + spaceB(bFit.size);
      idx++;
    }
    y += bLH;
  });
  const t1 = start + 1.4;
  chars.forEach((ch, i) => {
    const at = t1 + i * 0.06;
    ch.at = at;
    tl.fromTo(ch.span, { opacity: 0 }, { opacity: 1, duration: 0.001 }, at);
    tl.fromTo(ch.span, { scale: 1.3, rotation: ch.rot }, { scale: 1, rotation: ch.rot, duration: 0.18, ease: "power2.out" }, at);
    if (ch.isKey && keyAt === null) keyAt = at;
  });
  // a little shake as each letter lands (1–2 px, seeded by frame)
  procs.push((t, frame) => {
    for (const ch of chars) {
      const k = t - ch.at;
      if (k >= 0 && k < 0.2) {
        const r = mulberry(hash(`${s.id}-${ch.i}`) + frame);
        ch.span.style.translate = `${(r() - 0.5) * 4}px ${(r() - 0.5) * 4}px`;
      } else if (ch.span.style.translate) ch.span.style.translate = "";
    }
  });
  const doneAt = chars.length ? chars[chars.length - 1].at + 0.2 : t1;
  return { chars, keyAt, doneAt, bottom: y, bSize: bFit.size, aFit, bFit };
};

// ── shot types ────────────────────────────────────────────────────────────
const BUILD = {
  hook(s, root, start, end) {
    // backgrounds, cut every 0.4 s
    const bgs = s.bg.map((b) => hookBg(root, b));
    const slots = Math.ceil(s.dur / 0.4);
    procs.push((t) => {
      const k = Math.floor((t - start) / 0.4);
      const live = t >= start && t < end;
      bgs.forEach((b, i) => (b.style.display = live && ((k % bgs.length) + bgs.length) % bgs.length === i ? "block" : "none"));
    });
    void slots;
    // the strips
    s.lines.forEach((line, i) => {
      const rot = [-3, 2.5, -2][i % 3];
      const strip = el("div", "strip", root, { left: `${300 + i * 150}px`, top: `${300 + i * 150}px` }, line);
      const at = start + 0.15 + i * 0.85;
      tl.fromTo(strip, { opacity: 0, y: -60, x: -30, rotation: rot - 8, scale: 1.15 }, { opacity: 1, y: 0, x: 0, rotation: rot, scale: 1, duration: 0.45, ease: "back.out(2.6)" }, at);
      tl.set(strip, { opacity: 0 }, start);
    });
  },

  title(s, root, start, end) {
    // slow red arcs
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    svg.style.position = "absolute";
    svg.style.inset = "0";
    const arc = (r, color, width, dash, op) => {
      const c = document.createElementNS(svg.namespaceURI, "circle");
      Object.entries({ cx: 960, cy: 980, r, fill: "none", stroke: color, "stroke-width": width, "stroke-dasharray": dash, opacity: op }).forEach(([k, v]) => c.setAttribute(k, v));
      svg.appendChild(c);
      return c;
    };
    const a1 = arc(720, RED, 3, "2600 1900", 0.9);
    const a2 = arc(640, INK, 1.2, "2200 1900", 0.35);
    const a3 = arc(800, RED, 1.2, "600 4400", 0.5);
    root.appendChild(svg);
    [a1, a2, a3].forEach((c, i) => tl.fromTo(c, { rotation: 150 + i * 40, svgOrigin: "960 980" }, { rotation: 150 + i * 40 + (i % 2 ? -1 : 1) * 30, duration: end - start, ease: "none" }, start));
    const o = el("div", "outline", root, { left: "-60px", top: "320px" }, "THE ARCHITECT");
    tl.fromTo(o, { opacity: 0, x: 0 }, { opacity: 0.08, x: -120, duration: end - start, ease: "none" }, start);
    const a = el("div", "", root, { position: "absolute", left: 0, width: `${W}px`, textAlign: "center", top: "270px", fontWeight: 900, fontSize: "68px", letterSpacing: "4px", textShadow: `5px 5px 0 ${RED}` }, s.a);
    const block = el("div", "", root, { position: "absolute", left: `${960 - 290}px`, top: "400px", width: "580px", height: "320px", background: RED, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "250px", letterSpacing: "24px", paddingLeft: "24px", color: INK, lineHeight: 1, boxShadow: "0 18px 50px rgba(0,0,0,0.6)" }, s.b);
    const sub = el("div", "mono", root, { left: 0, width: `${W}px`, textAlign: "center", top: "780px" }, s.sub);
    tl.fromTo(a, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, start + 0.2);
    tl.fromTo(block, { opacity: 0, scale: 1.35, rotation: -3 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.45, ease: "back.out(2)" }, start + 0.7);
    tl.fromTo(sub, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, start + 1.2);
  },

  card(s, root, start, end) {
    // rings going out
    const rings = [0, 1, 2, 3, 4].map((i) => el("div", "abs", root, { left: `${960 - 300}px`, top: `${470 - 300}px`, width: "600px", height: "600px", borderRadius: "50%", border: `${i % 2 ? 2 : 6}px solid ${i % 2 ? "rgba(242,242,242,0.35)" : RED}` }));
    rings.forEach((r, i) => tl.fromTo(r, { scale: 0.45 + i * 0.12, opacity: 0.95 }, { scale: 1.5 + i * 0.25, opacity: 0, duration: 1.3, ease: "power2.out" }, start + i * 0.08));
    // fixed rings behind the number
    [200, 260].forEach((r, i) => {
      const c = el("div", "abs", root, { left: `${960 - r}px`, top: `${470 - r}px`, width: `${r * 2}px`, height: `${r * 2}px`, borderRadius: "50%", border: `${i ? 1.5 : 3}px solid ${i ? "rgba(242,242,242,0.3)" : RED}` });
      tl.fromTo(c, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.3 }, start + 0.05);
    });
    const line = el("div", "abs", root, { left: "958px", top: "70px", width: "4px", height: "150px", background: RED, transformOrigin: "50% 0%" });
    tl.fromTo(line, { scaleY: 0 }, { scaleY: 1, duration: 0.3, ease: "power2.out" }, start);
    const no = el("div", "", root, { position: "absolute", left: 0, width: `${W}px`, textAlign: "center", top: `${470 - 190}px`, fontFamily: "var(--display)", fontSize: "360px", lineHeight: "380px", color: INK, textShadow: "0 10px 40px rgba(0,0,0,0.6)" }, s.no);
    tl.fromTo(no, { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" }, start);
    const fit1 = fit(s.text, (sz) => `700 ${sz}px "Noto Serif SC"`, 48, 1500, () => 4);
    const text = el("div", "", root, { position: "absolute", left: 0, width: `${W}px`, textAlign: "center", top: "770px", fontWeight: 700, fontSize: `${fit1.size}px`, letterSpacing: "4px" }, s.text);
    tl.fromTo(text, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, start + 0.25);
    // flanks: inverted photos, tilted (skipped if missing)
    (s.flank || []).forEach((name, i) => {
      const img = images[name];
      [-1, 1].forEach((side) => {
        if (!img) return;
        const wrap = el("div", "abs", root, { left: side < 0 ? "140px" : `${W - 140 - 330}px`, top: "300px", width: "330px", height: "430px", border: `1.5px solid rgba(242,242,242,0.6)`, overflow: "hidden", transform: `perspective(900px) rotateY(${side * -22}deg)` });
        const im = el("img", "photo invert", wrap, { width: "100%", height: "100%", objectFit: "cover" });
        im.src = img.src;
        el("div", "mono", root, { left: side < 0 ? "60px" : `${W - 330}px`, top: "270px", fontSize: "16px" }, "[INVERTED]");
        tl.fromTo(wrap, { opacity: 0, x: side * 60 }, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }, start + 0.1);
        void i;
      });
    });
  },

  line(s, root, start, end, ctx2) {
    lineShot(s, root, start, end, ctx2);
  },

  quote(s, root, start, end, ctx2) {
    const q = lineShot(s, root, start, end, ctx2);
    const { credit } = ctx2;
    // the signature, in the last 1.2 s
    const at = end - 1.2;
    const sx = TEXT_X + B_INDENT + 60, sy = q.bottom + 10;
    // the red line is the signature's dash: drawn first, then the name
    const dash = el("div", "sig-dash", root, { left: `${sx}px`, top: `${sy + 50}px`, width: "88px", transformOrigin: "0 50%" });
    const sig = el("div", "sig", root, { left: `${sx + 108}px`, top: `${sy + 10}px` }, s.sign);
    const src = el("div", "src", root, { left: `${sx + 112}px`, top: `${sy + 96}px` }, s.source);
    tl.fromTo(dash, { scaleX: 0 }, { scaleX: 1, duration: 0.2, ease: "power2.out" }, at);
    tl.fromTo(sig, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.5, ease: "none" }, at + 0.15);
    tl.fromTo(src, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35 }, at + 0.55);
    // bottom-right: who and when
    tl.fromTo(credit, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, immediateRender: false }, start + 0.6);
  },

  end(s, root, start, end, ctx2) {
    lineShot(s, root, start, end, ctx2);
    tl.fromTo(ctx2.black, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.in", immediateRender: false }, end - 0.5);
  },
};

// a hook background
const hookBg = (root, spec) => {
  const box = el("div", "full", root, { display: "none" });
  const [kind, arg] = spec.includes(":") ? [spec.slice(0, spec.indexOf(":")), spec.slice(spec.indexOf(":") + 1)] : [spec, ""];
  const bigRed = () => el("div", "abs", box, { left: "880px", top: "180px", fontFamily: "var(--display)", fontSize: "640px", lineHeight: 1, color: RED, opacity: 0.95 }, "INTJ");
  if (kind === "outline" || (kind === "img-invert" && !images[arg])) {
    const paper = kind === "outline";
    box.style.background = paper ? INK : BG;
    el("div", "outline", box, { left: "40px", top: "120px", fontSize: "560px", WebkitTextStroke: `4px ${paper ? BG : INK}`, opacity: paper ? 0.9 : 0.35 }, arg || "INTJ");
    if (paper) {
      el("div", "abs", box, { left: "-100px", top: "330px", width: "2200px", height: "34px", background: RED, transform: "rotate(-9deg)" });
      el("div", "mono", box, { left: "120px", top: "880px", color: BG, opacity: 0.8 }, "INTJ · 建筑师 · ARCHITECT · ARCHITECTE · АРХИТЕКТОР · 建築家");
    }
    return box;
  }
  if (kind === "rays") {
    box.style.background = BG;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    svg.style.position = "absolute";
    for (let i = 0; i < 90; i++) {
      const a = rnd("ray-a", i) * Math.PI * 2;
      const r0 = 160 + rnd("ray-r", i) * 220, r1 = 1300;
      const wdt = 2 + rnd("ray-w", i) * 22;
      const p = document.createElementNS(svg.namespaceURI, "line");
      Object.entries({ x1: 960 + Math.cos(a) * r0, y1: 520 + Math.sin(a) * r0, x2: 960 + Math.cos(a) * r1, y2: 520 + Math.sin(a) * r1, stroke: rnd("ray-c", i) < 0.5 ? RED : INK, "stroke-width": wdt }).forEach(([k, v]) => p.setAttribute(k, v));
      svg.appendChild(p);
    }
    box.appendChild(svg);
    bigRed();
    return box;
  }
  if (kind === "reticle") {
    box.style.background = BG;
    bigRed().style.opacity = 0.35;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    svg.style.position = "absolute";
    [90, 150, 220, 300].forEach((r, i) => {
      const c = document.createElementNS(svg.namespaceURI, "circle");
      Object.entries({ cx: 1420, cy: 470, r, fill: "none", stroke: i % 2 ? INK : RED, "stroke-width": i % 2 ? 1.5 : 7, opacity: i % 2 ? 0.5 : 1 }).forEach(([k, v]) => c.setAttribute(k, v));
      svg.appendChild(c);
    });
    [[1020, 470, 1820, 470], [1420, 70, 1420, 870]].forEach(([x1, y1, x2, y2]) => {
      const l = document.createElementNS(svg.namespaceURI, "line");
      Object.entries({ x1, y1, x2, y2, stroke: INK, "stroke-width": 1.5, opacity: 0.6 }).forEach(([k, v]) => l.setAttribute(k, v));
      svg.appendChild(l);
    });
    box.appendChild(svg);
    el("div", "mono", box, { left: "1560px", top: "800px", fontSize: "16px", color: INK }, "READING");
    return box;
  }
  if (kind === "img-invert") {
    box.style.background = BG;
    const im = el("img", "photo invert", box, { inset: 0, width: "100%", height: "100%", objectFit: "cover" });
    im.src = images[arg].src;
    el("div", "mono", box, { left: "60px", top: "60px", fontSize: "16px" }, "[INVERTED]");
    return box;
  }
  return box;
};

// a text shot: picture (or its fallback), outline word, two halves, extras
const lineShot = (s, root, start, end, ctx2) => {
  const word = s.outline || "INTJ";
  const has = s.img && images[s.img];
  const pic = has ? picture(root, s.img, start, end, { invert: !!s.invert, push: !!s.push || s.type === "end" }) : null;
  const fb = outlineText(root, word, start, end, { fallback: !has });
  if (!has && (s.push || s.type === "end")) tl.to(fb, { scale: 1.08, duration: end - start, ease: "none", transformOrigin: "70% 50%" }, start);
  void pic;
  if (s.reticle) reticle(root, 1420, 430, start + 0.6, end);
  const q = quoteText(s, root, start, ctx2);
  if (q.keyAt !== null && !s.decode) redFlash(ctx2.flash, q.keyAt);
  if (s.decode) decode(s, q, ctx2);
  if (s.strike) strike(s, root, q);
  if (s.strikeTitle) strikeTitle(root, start, q, end);
  return q;
};

// garble → letters (ref_08): each letter shows red noise from when it lands
// until it resolves, one by one after the whole line has landed
const GLYPHS = "1%@$%*|+&Σ#!?§¥/\\<>=";
const decode = (s, q, ctx2) => {
  const n = q.chars.length;
  const resolveStart = q.chars[n - 1].at + 0.25;
  q.chars.forEach((ch, i) => {
    ch.resolve = resolveStart + i * 0.07;
    ch.span.classList.remove("key");
  });
  const firstKey = q.chars.find((c) => c.isKey);
  if (firstKey) {
    redFlash(ctx2.flash, firstKey.resolve);
  }
  procs.push((t, frame) => {
    for (const ch of q.chars) {
      const garbled = t >= ch.at && t < ch.resolve;
      if (garbled) {
        const r = mulberry(hash(`${s.id}-dc-${ch.i}`) + Math.floor(frame / 2));
        ch.span.textContent = GLYPHS[Math.floor(r() * GLYPHS.length)];
        ch.span.style.color = RED;
        ch.span.style.fontFamily = "var(--mono)";
        ch.span.classList.remove("key");
      } else {
        if (ch.span.textContent !== ch.c) ch.span.textContent = ch.c;
        ch.span.style.color = "";
        ch.span.style.fontFamily = "";
        if (ch.isKey) ch.span.classList.toggle("key", t >= ch.resolve);
      }
    }
  });
};

// a red line drawn through the struck words once the half is written
const strike = (s, root, q) => {
  const idx = s.b.indexOf(s.strike);
  if (idx < 0) return;
  const cs = q.chars.filter((c) => c.i >= idx && c.i < idx + [...s.strike].length);
  const x0 = Math.min(...cs.map((c) => c.x)) - 10, x1 = Math.max(...cs.map((c) => c.x + c.w)) + 10;
  const y = cs[0].y + q.bSize * 0.62;
  const line = el("div", "abs", root, { left: `${x0}px`, top: `${y}px`, width: `${x1 - x0}px`, height: "8px", background: RED, transformOrigin: "0 50%", boxShadow: "0 0 12px rgba(255,90,31,0.6)" });
  tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power2.inOut" }, q.doneAt + 0.15);
};

// the title's red block reappears in the picture area and gets struck through
const strikeTitle = (root, start, q, end) => {
  const block = el("div", "", root, { position: "absolute", left: `${1400 - 200}px`, top: "300px", width: "400px", height: "225px", background: RED, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "176px", letterSpacing: "16px", paddingLeft: "16px", color: INK, lineHeight: 1, boxShadow: "0 18px 50px rgba(0,0,0,0.6)" }, "正确");
  tl.fromTo(block, { opacity: 0, scale: 1.3, rotation: -3 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.4, ease: "back.out(2)" }, start + 0.5);
  const line = el("div", "abs", root, { left: "1140px", top: "405px", width: "520px", height: "14px", background: RED, transformOrigin: "0 50%", transform: "rotate(-14deg)", boxShadow: `0 0 0 3px ${INK}, 0 0 18px rgba(0,0,0,0.8)` });
  const at = (q.keyAt ?? start + 2) + 0.35;
  tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power3.in" }, at);
  tl.to(block, { x: 6, duration: 0.05, yoyo: true, repeat: 3 }, at + 0.3);
  void end;
};

main().catch((e) => {
  window.__error = String(e && e.stack ? e.stack : e);
  console.error(e);
});
