/**
 * THE BACKLIST CLUMP.
 *
 * Fourteen covers arranged the way a word cloud arranges words: a round,
 * tight clump with no rows or columns to read, sitting in a square field.
 * The client asked for exactly that — "a circular clump, closer together" —
 * after a jittered grid still read as three rows.
 *
 * How it is built (every step deterministic, so the server and the client
 * agree and the clump never reshuffles between renders):
 *
 *  1. SEED on concentric rings. The nearest cover takes the centre; the rest
 *     are sorted so the squarest covers go to the rim, where a square closes
 *     the outline better than a tall jacket does. Each cover owns an angular
 *     slot proportional to its footprint, nudged by its slug hash so no ring
 *     reads as a regular polygon, and slides in along its own ray until its
 *     box just clears the covers already placed.
 *  2. COMPACT. A circular boundary shrinks over sixty iterations toward the
 *     radius that would give the target fill; any cover whose outer corner
 *     pokes past it is pulled in, and a rectangle-aware push-apart keeps
 *     every pair a fixed gap clear. The clump is re-centred every step.
 *  3. CLEAN UP with separation alone until nothing collides, then fit the
 *     result into the field.
 *
 * Collision uses the axis-aligned box of the TILTED cover, so a tipped
 * corner never crosses a neighbour. The parameters are the winners of a
 * measured sweep (roundness 0.86, 16px minimum gap at desktop size, hull
 * fill 0.62 against 0.43 for the grid it replaces).
 */

export type ClumpInput = { slug: string; aspect: number };

export type ClumpItem = {
  slug: string;
  /** centre, percent of the square field */
  x: number;
  y: number;
  /** width, percent of the field */
  w: number;
  /** depth 0..1 — drives size, parallax travel, shadow and stacking */
  z: number;
  /** degrees */
  tilt: number;
};

const GAP = 1.8; // clear space between boxes, in cover units (~16px at desktop)
const ANGLE_JITTER = 0.1; // share of a cover's angular slot it may wander
const RING_DENSITY = 0.75; // ring k holds round(2π·k·density) covers
const TARGET_FILL = 0.6; // share of the final disc the boxes should cover
const COMPACT_ITERS = 60;
const CLEANUP_ITERS = 80;
const SETTLE_STEP = 1;
const FIT = 94; // the clump spans this much of the field, centred
/** the field width, in px, at which the largest cover is this wide */
const NEAR_COVER_PX = 160;

const TAU = Math.PI * 2;

/* Deterministic pseudo-randomness per slug (FNV-style), 0..1. */
export function hash(slug: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

type Box = {
  slug: string;
  z: number;
  tilt: number;
  w: number;
  aspect: number;
  hw: number; // half-extents of the axis-aligned box around the tilted cover
  hh: number;
  x: number;
  y: number;
};

function makeBox(it: ClumpInput): Box {
  const z = hash(it.slug, 3);
  const tilt = (hash(it.slug, 4) - 0.5) * 7;
  const w = 12 + z * 6;
  const h = w / it.aspect;
  const t = (tilt * Math.PI) / 180;
  const c = Math.abs(Math.cos(t)),
    s = Math.abs(Math.sin(t));
  return {
    slug: it.slug,
    z,
    tilt,
    w,
    aspect: it.aspect,
    hw: (w * c + h * s) / 2,
    hh: (w * s + h * c) / 2,
    x: 0,
    y: 0,
  };
}

/* two boxes are clear when they are GAP apart on at least one axis */
const clear = (a: Box, b: Box) =>
  Math.abs(a.x - b.x) >= a.hw + b.hw + GAP ||
  Math.abs(a.y - b.y) >= a.hh + b.hh + GAP;

/* distance from the origin to the cover's farthest corner */
const reach = (c: Box) =>
  Math.hypot(Math.abs(c.x) + c.hw, Math.abs(c.y) + c.hh);

/* ring populations: 1 at the centre, then rings that fill by circumference */
function ringSizes(n: number): number[] {
  const sizes = [1];
  let left = n - 1;
  for (let k = 1; left > 0; k++) {
    const take = Math.min(Math.round(TAU * k * RING_DENSITY), left);
    sizes.push(take);
    left -= take;
  }
  return sizes;
}

/* slide cover c outward along its ray until it clears every placed cover */
function settle(c: Box, theta: number, placed: Box[]) {
  const ux = Math.cos(theta),
    uy = Math.sin(theta);
  const clearAt = (r: number) => {
    c.x = r * ux;
    c.y = r * uy;
    return placed.every((p) => clear(c, p));
  };
  let r = 0;
  while (!clearAt(r) && r < 1000) r += SETTLE_STEP;
  if (r === 0) return;
  let lo = r - SETTLE_STEP,
    hi = r; // lo blocked, hi clear: bisect to the contact point
  for (let i = 0; i < 10; i++) {
    const mid = (lo + hi) / 2;
    if (clearAt(mid)) hi = mid;
    else lo = mid;
  }
  clearAt(hi);
}

/* push every colliding pair apart along the line between their centres, by
   the smallest move that clears one axis; returns whether anything moved */
function separate(covers: Box[]): boolean {
  let moved = false;
  for (let i = 0; i < covers.length; i++) {
    for (let j = i + 1; j < covers.length; j++) {
      const a = covers[i],
        b = covers[j];
      const px = a.hw + b.hw + GAP - Math.abs(b.x - a.x);
      const py = a.hh + b.hh + GAP - Math.abs(b.y - a.y);
      if (px <= 0 || py <= 0) continue;
      let dx = b.x - a.x,
        dy = b.y - a.y,
        d = Math.hypot(dx, dy);
      if (d < 1e-6) {
        // coincident centres: pick a deterministic direction
        const ang = hash(a.slug + b.slug, 5) * TAU;
        dx = Math.cos(ang);
        dy = Math.sin(ang);
        d = 1;
      }
      const ux = dx / d,
        uy = dy / d;
      const tx = Math.abs(ux) > 1e-9 ? px / Math.abs(ux) : Infinity;
      const ty = Math.abs(uy) > 1e-9 ? py / Math.abs(uy) : Infinity;
      const t = Math.min(tx, ty) * 1.001;
      a.x -= (ux * t) / 2;
      a.y -= (uy * t) / 2;
      b.x += (ux * t) / 2;
      b.y += (uy * t) / 2;
      moved = true;
    }
  }
  return moved;
}

function recentre(covers: Box[]) {
  const n = covers.length;
  const gx = covers.reduce((s, c) => s + c.x, 0) / n;
  const gy = covers.reduce((s, c) => s + c.y, 0) / n;
  for (const c of covers) {
    c.x -= gx;
    c.y -= gy;
  }
}

export function clump(items: ClumpInput[]): {
  items: ClumpItem[];
  /** the field width, in px, at which the largest cover is NEAR_COVER_PX */
  fieldPx: number;
} {
  const covers = items.map(makeBox);
  if (covers.length === 0) return { items: [], fieldPx: 0 };

  // the nearest cover takes the centre; the squarest covers go to the rim
  const byDepth = covers
    .slice()
    .sort((a, b) => b.z - a.z || (a.slug < b.slug ? -1 : 1));
  const squareness = (c: Box) => Math.min(c.hw, c.hh) / Math.max(c.hw, c.hh);
  const order = [
    byDepth[0],
    ...byDepth
      .slice(1)
      .sort(
        (a, b) => squareness(a) - squareness(b) || (a.slug < b.slug ? -1 : 1),
      ),
  ];

  /* 1. seed */
  const placed: Box[] = [];
  let idx = 0;
  ringSizes(order.length).forEach((count, k) => {
    const ring = order.slice(idx, idx + count);
    idx += count;
    if (k === 0) {
      ring.forEach((c) => placed.push(c)); // the centre cover stays at the origin
      return;
    }
    const foot = ring.map((c) => c.hw + c.hh + GAP);
    const total = foot.reduce((s, f) => s + f, 0);
    // alternate rings start half a slot round, so slots never line up radially
    const base = k % 2 === 0 ? 0 : TAU / (2 * count);
    let cum = 0;
    ring.forEach((c, i) => {
      const slot = (TAU * foot[i]) / total;
      const theta =
        base +
        (TAU * (cum + foot[i] / 2)) / total +
        (hash(c.slug, 11) - 0.5) * ANGLE_JITTER * slot;
      cum += foot[i];
      settle(c, theta, placed);
      placed.push(c);
    });
  });

  /* 2. compact */
  const boxArea = covers.reduce((s, c) => s + 4 * c.hw * c.hh, 0);
  const rMin = Math.sqrt(boxArea / (Math.PI * TARGET_FILL));
  recentre(covers);
  const r0 = Math.max(...covers.map(reach));
  for (let it = 0; it < COMPACT_ITERS; it++) {
    const R = r0 + ((rMin - r0) * (it + 1)) / COMPACT_ITERS;
    for (const c of covers) {
      const d = Math.hypot(c.x, c.y);
      if (d < 1e-6) continue;
      const over = reach(c) - R; // how far the outer corner pokes past the boundary
      if (over > 0) {
        c.x -= (c.x / d) * over;
        c.y -= (c.y / d) * over;
      }
    }
    separate(covers);
    recentre(covers);
  }

  /* 3. clean up */
  for (let it = 0; it < CLEANUP_ITERS; it++) {
    if (!separate(covers)) break;
  }

  /* fit: scale positions and widths together so the clump spans FIT percent
     of a square field, centred — only the SHAPE was decided above */
  const X0 = Math.min(...covers.map((c) => c.x - c.hw)),
    X1 = Math.max(...covers.map((c) => c.x + c.hw));
  const Y0 = Math.min(...covers.map((c) => c.y - c.hh)),
    Y1 = Math.max(...covers.map((c) => c.y + c.hh));
  const s = FIT / Math.max(X1 - X0, Y1 - Y0);
  const cx = (X0 + X1) / 2,
    cy = (Y0 + Y1) / 2;
  const round = (v: number) => Math.round(v * 100) / 100;
  const out = covers.map((c) => ({
    slug: c.slug,
    x: round(50 + (c.x - cx) * s),
    y: round(50 + (c.y - cy) * s),
    w: round(c.w * s),
    z: Math.round(c.z * 1000) / 1000,
    tilt: round(c.tilt),
  }));
  const maxW = Math.max(...out.map((c) => c.w));
  return { items: out, fieldPx: Math.round((NEAR_COVER_PX * 100) / maxW) };
}
