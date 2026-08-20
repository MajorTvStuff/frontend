# Reel → BETA MVP build plan (RG call notes, 2026-08-19)

*The creative reasoning behind every item here lives in
[RG-CREATIVE-DIRECTION.md](RG-CREATIVE-DIRECTION.md) — his raw notes, decoded.
This file is the execution plan: exact changes, file by file, in build order.
Scope: the Reel (`reel/`, port 3011), which this pass **promotes from
"Concept 01" to the beta MVP** — the taste test is decided. Manifesto stays up
as an archived concept; the Marquee build is cancelled unless RG revives it.*

**Status: EXECUTED 2026-08-19** — built, rebuilt clean, and verified by a
five-lens pass (timed intro beats, section captures + hover + 390px overflow,
console/network hygiene through the trailer mount, reduced-motion audit,
WCAG contrast math on 13 pairs): **zero blockers**. One flag surfaced: the
DRIVE trailer link in RG's copy doc is a fan re-upload that plays with a
"BEST MOVIES" watermark baked into the footage — now visible in the hero
until he sends an official file or link (see Q13). RG's two call lines
render from the `positioning` block in `reel/content/site.json`, still
marked *display-only, pending sign-off*.

---

## 0 · Promotion: Concept 01 → BETA MVP

**Files:** `reel/app/layout.tsx`, `CONCEPTS.html`, memory

- Tab title: `Concept 01 · The Reel — MAJOR CONTENT` →
  **`MAJOR CONTENT — TV | FILM | BOOKS`** (clean brand title; no concept
  prefix on an MVP).
- Watermark chip: `Concept 01 · The Reel` → **`BETA MVP`** — restyled for the
  dark scheme (silver text on `#003853`, hairline border), still one div to
  delete at launch.
- `viewport.themeColor`: `#ffffff` → **`#001528`** (the browser chrome should
  sit in the navy world too), and the `html { background }` fallback flips
  with it.
- `CONCEPTS.html` launcher: the Reel card becomes **"BETA MVP →
  localhost:3011"** at the top; Manifesto card relabeled *"archived concept"*;
  the pre-stubbed Marquee card removed (build cancelled — the MVP is chosen).
- Memory (`major-content-rebrand.md`): record the promotion — taste test
  resolved to the Reel, Marquee cancelled, "strip the chip at launch" now
  means the single BETA chip.

---

## 0b · Scheme: the original site's dark navy, site-wide

**Files:** `reel/app/globals.css` (token remap), touch-ups in every component

**The fact that drives this** (measured in `archive/DESIGN-NOTES.md`): the
original majortvproductions.com was a **dark site** — the `#001528 → #003B59`
blue-M gradient as its ground, published `#003853` section backgrounds,
`#26B3EF` accent text, silver `#B2BEC6` details. The current Reel wears those
colors as accents on white chrome; "like majortvproductions.com" means living
*in* them. This also makes "seamless continuity" literal: the new site keeps
the old site's room.

Token remap in `@theme` (semantic names keep working; values flip):

| Token | Was (light chrome) | Becomes (original navy) | Role |
|---|---|---|---|
| `--color-ground` *(new)* | — | `#001528` | body background (screen navy) |
| `--color-panel` *(new)* | — | `#062036` | lifted frames: cover letterboxes, cards |
| `--color-paper` | `#ffffff` | `#ffffff` (unchanged) | now the **text** color, plus rare light insets |
| `--color-ink` | `#001223` | `#001223` (unchanged) | text on light insets (hover inversion) |
| `--color-mid` | `#47596a` | **`#9fb1be`** (steel) | muted text — steel on screen ≈ 8.7:1 ✓ |
| `--color-faint` | `#8fa1b0` | **`#7d8f9d`** | de-emphasized text (≥4.5:1 on ground) |
| `--color-line` | `#e2e8ed` | **`rgba(178,190,198,0.22)`** | hairlines on dark |
| `--color-screen` | `#001528` | unchanged | hero gradient top / scrims |
| `--color-band` | `#003853` | unchanged | founder band — now a *lifted* band on the darker ground |
| `--color-signal` | `#26b3ef` | unchanged | accent — ≈7.8:1 on screen ✓ |
| `--color-red` / `--color-silver` | unchanged | unchanged | logo red; silver details |

Global flips that follow:

- `body { background: var(--color-ground); color: var(--color-paper) }`;
  `color-scheme: dark`; `::selection` → signal on ink; focus outline → signal.
- **Header**: dark ground, `Lockup tone="light"` + bright descriptor (the
  reversed wordmark — white letters, red wings — exactly the old site's
  header treatment). Same in the footer.
- **Hero**: already the original gradient — unchanged. The white gap risk
  under `object-contain` slides disappears entirely (letterbox = ground).
- **Wall**: show captions become paper/steel on dark; hover inversion now
  inverts to **paper bg + ink text** (light flash on dark — same move,
  reversed). Book covers letterbox in `--color-panel` frames instead of
  white so uniform 2:3 frames read as shelf objects, not white cards.
- **Icons band**: names in paper, interpuncts stay signal, `border-y` uses
  the new dark hairline.
- **Company**: statement in paper, thesis lines paper/steel; continuity meta
  line in steel.
- **Founder band `#003853`**: kept as-is — it now reads as the *bright* room
  on the page, which is how the original used it. Recognition stays signal;
  email underline stays signal.
- **Scrims/text-shadows**: already rgba-navy — no change.
- **A11y gate**: every new text/bg pair re-checked ≥4.5:1 (steel-on-ground,
  faint-on-ground, steel-on-band, silver-on-band); the archive's measured
  pairs are the reference. Red is never text on dark (archive rule).

---

## 1 · The hero: intro gains an explosive cover flash, then the trailer takes over

**Files:** `reel/components/Montage.tsx`, `reel/app/globals.css`, `reel/app/page.tsx`

### New hero timeline (was: word flow → logo → ambient carousel)

| Time | Beat | Mechanism |
|---|---|---|
| 0.0–7.8s | Word-flow lines (unchanged, 1.15s cadence) | existing `.intro-line` |
| **4.0–7.6s** | **NEW: 6 book covers hard-cut behind the words, one every 0.6s** — starts exactly as "Worldwide Bestsellers" reads | new `.intro-flash` layer |
| 8.0–9.8s | Logo build (unchanged: wings → letters → descriptor) | existing `.logo-*` |
| 10.4s | "Now playing" caption arrives (unchanged) | existing `.hero-caption` |
| 10.6s | Heavy scrim releases (unchanged) | existing `.intro-scrim` |
| **~10.6s** | **NEW: DRIVE trailer mounts, fades up over 1.6s, plays muted + looping behind the lockup** | new trailer layer + `.trailer-in` |

### 1a — Cover flash layer (`.intro-flash`)

- Roster: the 6 large-source book covers already vetted for full-bleed
  (`true-love`, `the-love-playbook`, `why-soccer-matters`, `my-voice`,
  `chasing-the-sun`, `clemente`) — derived in `page.tsx` from `SLIDE_SPEC`
  (`fit === "contain"` entries), passed to Montage as a new `flash` prop.
  The small/tacky scans (ME, A MEMOIR, 500px covers) stay excluded, as always.
- Markup: one absolutely-positioned stack inside the hero, **z-25** — above
  both scrims (z-20), below the word-flow text (z-30). Covers render at ~58%
  of hero height, centered, `object-contain`.
- CSS (inside the existing `prefers-reduced-motion: no-preference` block):
  ```css
  .intro-flash {
    animation: intro-flash 0.62s var(--ease-weighted) both;
    animation-delay: calc(var(--i) * 0.6s + 4s);
  }
  @keyframes intro-flash {
    0%   { opacity: 0; transform: scale(1.12); }
    12%  { opacity: 1; transform: scale(1); }     /* punch in */
    88%  { opacity: 1; transform: scale(0.99); }  /* settle */
    100% { opacity: 0; }                          /* hard-cut out */
  }
  ```
  Natural (no-animation) state = `opacity-0` = final state → reduced-motion
  and print land clean, same rule as every other intro element.
- Timing check: delays 4.0 / 4.6 / 5.2 / 5.8 / 6.4 / 7.0s, each 0.62s →
  last cover exits 7.62s, logo wings arrive 8.0s. No collision.

### 1b — Trailer takeover

- `page.tsx` derives from `projects.json`: DRIVE's YouTube ID (`QSFPH394pZ4`
  out of its `trailer` URL) + title + proof, passed as a `trailer` prop.
- Montage gains `showTrailer` state: a one-shot `setTimeout` at **10 600ms**
  (skipped entirely under `prefers-reduced-motion`). When it fires:
  - An `aria-hidden`, `tabIndex={-1}`, **pointer-events-none** iframe mounts at
    **z-15** — above the carousel slides (z-10), *below* the resting scrim
    (z-20) so the lockup keeps its readability treatment.
  - `youtube-nocookie.com/embed/QSFPH394pZ4?autoplay=1&mute=1&controls=0&loop=1&playlist=QSFPH394pZ4&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1`
  - Cover-fit sizing: wrapper `absolute inset-0 overflow-hidden`; iframe
    `absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 aspect-video min-h-full min-w-full`
    (verify visually — fallback is a measured `calc` width if the min/aspect
    trick misbehaves).
  - `.trailer-in { animation: logo-fade 1.6s var(--ease-weighted) 0.2s both; }`
  - Carousel auto-advance **stops** once the trailer is up (guard in the cycle
    effect); the carousel stays mounted beneath as the offline/embed-failure
    fallback.
  - The "now playing" caption switches to `DRIVE · Emmy Award-Winning · Hulu · Trailer`.
- Trade-offs to state in the report: the embed loads ~1MB of YouTube JS —
  deferred to 10.6s so LCP/TBT are untouched, but the real fix is RG's hosted
  MP4 (question logged). Muted forever by design (it's ambience; no controls).

### 1c — Oprah audio intro (his sketch: audio → books → logo)

**Visual half ships with 1a** (moment → covers flash → logo build).
**Audio half is blocked on RG**: need the clip + rights, and browsers block
autoplaying sound — so the design would need an "enter with sound" tap.
Logged as a question; no build work this pass.

---

## 2 · The wall: shows lead, books become a tiered shelf

**File:** `reel/components/Wall.tsx` (near-total rewrite)

### 2a — The slate (shows, unchanged prominence)

The 4 show tiles keep full captions (title / credit / proof) and the WATCH
chip — they're the present-tense work, loud and proud. Layout becomes a clean
`grid-cols-1 sm:grid-cols-2` of 4:3 tiles under the existing
"The slate — TV | FILM | BOOKS" label.

### 2b — The shelf (books: clustered, capless, tiered)

Three clusters in **descending size = descending importance**, headers taken
verbatim from the proof lines (only pluralized). Proof stated once per
cluster instead of 20 repeated caption blocks:

| Tier | Header | Covers | Size @1320px container |
|---|---|---|---|
| 1 | `#1 New York Times Bestseller` | THE LOVE PLAYBOOK (1) | ~176px wide (`w-44`) |
| 2 | `New York Times Bestsellers` | TRUE LOVE, ME, MY VOICE, OUT OF THE BLUE, THE 22-DAY REVOLUTION, CHORDS OF STRENGTH, LORD HELP ME, NOELLE THE BULLDOG (8, doc order) | one row of 8 ≈ 143px |
| 3 | `International & National Bestsellers` | the remaining 11, doc order | one row of 11 ≈ 103px |

- **No titles listed** on any book tile — cover art only, in uniform 2:3
  letterboxed frames (the tack-management device: dated covers read as
  volume-of-proof, not design choices).
- **Hover/focus reveal** = the "cool info" layer: a small navy inset slides up
  with title + author. Alt text keeps `TITLE — credit` for screen readers.
- Mobile: tier 1 `w-36`; tier 2 `grid-cols-3`; tier 3 `grid-cols-4`.
- The clustering key is a **proxy** (proof lines). When RG sends his priority
  list, it replaces the proxy: list order → tier + position. Question logged.
- Sectioning: `The shelf — BOOKS` meta label introduces the cluster group so
  slate/shelf read as two rooms of one wall.

### 2c — Data

No changes to `projects.json` (verbatim ground truth). Clustering is derived
in the component: `medium === "book"` partitioned by `proof`, doc order
preserved within each tier.

---

## 3 · Company section: the thesis in his own words

**File:** `reel/app/page.tsx`

- Under the "Company" header, a quiet meta line: **"From MAJOR TV to MAJOR
  CONTENT"** (continuity, `text-mid` — `text-faint` fails contrast on white).
- Between the statement and the TV|FILM / BOOKS columns, his thesis line:
  **"Publishing is the leverage for production."** — set as a medium-weight
  standalone line above the two columns it explains.
- Both render from the `positioning` block (already in `site.json`), both
  flagged **derived from call notes, pending written sign-off** — they're in
  the questions list, and removing them is deleting two JSX lines.

---

## 4 · Scroll choreography: staggering ("sense of order")

**File:** `reel/app/globals.css` (+ class/style changes where applied)

All zero-JS, inside the existing `@supports (animation-timeline: view())`:

- **`.scroll-pop`** for shelf covers — rise + slight scale (0.94 → 1), with a
  per-tile cascade via indexed custom property:
  ```css
  .scroll-pop {
    animation: scroll-pop var(--ease-weighted) both;
    animation-timeline: view();
    animation-range: entry calc(var(--d, 0) * 3%) entry calc(38% + var(--d, 0) * 3%);
  }
  ```
  Each cover gets `style={{"--d": indexInCluster}}` → covers cascade in
  sequence as the cluster enters. **Verify `calc()` inside `animation-range`
  in Chrome** — if unsupported, tiles reveal together (graceful, not broken).
- **`.scroll-rise-2` / `.scroll-rise-3`** — later entry ranges layered onto
  `.scroll-rise` for in-section beats:
  - Founder band: name → career line (`-2`) → recognition (`-3`) arrive as
    three beats.
  - Company: statement → thesis line (`-2`) → columns (`-3`).

This is the visible down-payment on RG's "add my scroll animations so people
can handle the load of info."

---

## 5 · Questions doc additions

**File:** `MAJOR-CONTENT-CONCEPTS.md` — append:

11. **Priority list of book covers** — top = most important (drives cluster
    tiers + sizes); also: any covers to bury or drop as too dated?
12. **The Oprah audio** — which clip is "this is a moment," from where, do we
    have rights? And confirm: browsers block autoplaying sound, so audio
    needs an "enter with sound" tap — acceptable?
13. **Hosted trailer file** — the hero now wants the DRIVE trailer playing
    after the intro; currently a muted YouTube embed. An MP4 he owns would be
    faster, cleaner, rights-clear (extends Q3/Q4).

---

## 6 · Build & verify sequence

1. Edits in this order: `globals.css` (token remap first — everything else
   renders against it) → `Montage.tsx` → `Wall.tsx` → `page.tsx` →
   `layout.tsx` (Beta MVP promotion) → `CONCEPTS.html` → concepts doc.
   (`site.json`/`content.ts` already done.)
2. Rebuild clean (OneDrive rule): kill the node on **3011 only** (3000 = CUE
   IT, never touch), `rm -rf reel/.next`, full `npm run build`, restart.
3. Verification, multi-lens (scripts in scratchpad `trace/`):
   - **Timed intro beats**: screenshots at ~5s (covers flashing), ~9.5s (logo
     built), ~13.5s (trailer playing + caption swapped).
   - **Scroll captures**: slate, all three shelf tiers (+ hover state), company
     thesis lines, founder beats.
   - **Console check** across the load + trailer mount (YouTube embed noise is
     expected; app errors are not).
   - **Overflow probe** at 390px (11-column tier is the risk).
   - **Reduced-motion audit**: no flash layer, no trailer, finished lockup,
     static shelf — natural-state-equals-final-state rule on every new element.
   - **A11y re-check**: cover alt text, no focusable iframe, and the full
     dark-scheme contrast sweep (steel/faint/silver on ground, band, panel —
     every pair ≥4.5:1, per the archive's measured reference table).
   - **Scheme eyeball**: side-by-side screenshot against the archive build's
     dark sections — the MVP should read as the same room.
4. Commit, update `major-content-rebrand` memory (Beta MVP promotion,
   dark-scheme state, open asks).

---

## 7 · Explicitly deferred / blocked

| Item | Why | Unblocks when |
|---|---|---|
| Oprah audio in intro | no clip, no rights, autoplay-sound blocked by browsers | RG sends clip + OK's a sound-on tap |
| Re-cluster by his real priority | proxy = proof lines for now | RG sends the priority list |
| Hosted trailer MP4 replacing embed | only YouTube links in hand | RG sends a file |
| Vegas Residency in hero rotation | Facebook-only video | RG sends a file (Q4) |
| Concept 02 · The Marquee | **cancelled** — the Reel is the beta MVP | only if RG asks for it |
| Strip the BETA MVP chip | it marks the beta while RG reviews | launch |
