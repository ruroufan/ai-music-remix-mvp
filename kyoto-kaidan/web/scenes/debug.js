import { W, H, at } from '../lib.js';
import * as C from '../art/chars.js';
import * as F from '../art/figures.js';
export function dbg_chars(ctx, s) {
  ctx.fillStyle = '#6a6458'; ctx.fillRect(0, 0, W, H);
  const v = s.p.v || 0;
  if (v === 0) { at(ctx, 420, 860, 1, 0, () => F.riders(ctx, { ph: 1, woman: true })); at(ctx, 250, 1800, .62, 0, () => F.womanStand(ctx, {})); at(ctx, 800, 1800, .62, 0, () => F.grannyStand(ctx, {})); }
  if (v === 1) { at(ctx, 300, 1000, .62, 0, () => F.tsunaStand(ctx, { tilt: .2, look: -1 })); at(ctx, 760, 500, .8, 0, () => C.tsunaBust(ctx, {})); at(ctx, 780, 1500, .8, 0, () => C.grannyBust(ctx, { m: 1 })); }
  if (v === 2) { ctx.fillStyle = '#c8bc9c'; ctx.fillRect(0, 0, W, H); at(ctx, 480, 500, 1, 0, () => F.oniFlight(ctx, {})); at(ctx, 330, 860, 1, 0, () => F.tsunaFall(ctx, {})); at(ctx, 600, 1500, .9, 0, () => F.riders(ctx, { ph: 2, sil: true, woman: true, o: 1 })); }
}
