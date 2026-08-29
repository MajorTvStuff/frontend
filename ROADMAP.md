# MAJOR CONTENT — roadmap

Everything agreed but not yet built, in the order it should probably happen.
The live site is `site/` (port 3011). Items marked **BLOCKED** are waiting on
something only RG can provide.

---

## 0. Book synopses — BLOCKED, and the site is already built for them

Hovering a jacket on the shelf slides in a panel with the title, the author
and the proof line. That is everything the content files hold per book.

**It carries no synopsis on purpose.** Writing plot summaries for twenty real
published books would be inventing facts about other people's work, which is
the same rule that keeps RG's role off the detail pages. The slot exists in
the markup and shows a pending note in the beta (`NEXT_PUBLIC_SHOW_TODOS`);
send one paragraph per title and it fills in with no further work.

## 0b. Decide whether the shelf popup survives

Flagged for removal: the hover/pin panel on **The shelf — BOOKS**. It is
built and working (hover to preview, click to pin, Escape to release), but
it may not earn its place once the per-title detail pages below exist —
two ways to look at the same book is one too many, and the panel currently
has no synopsis to justify itself.

Decide together with item 1: either the panel becomes the fast preview and
the detail page the full record, or the panel goes and clicking a jacket
navigates straight to its page. **Do not remove it before that call** —
it is the only place a book's author and proof currently appear together
for the backlist.

## 1. Per-title detail pages

Clicking any show or book opens a full breakdown of that title.

Buildable today, from verbatim data we already hold: title, author/credit,
network or publisher, the proof line, the jacket or key art, the trailer.

**BLOCKED — RG's role on each title.** EP, packager, literary rep, publisher,
something else: we do not have it per title, and it is exactly the kind of
fact that must never be inferred from a credit line. One line per title from
him and it ships. Until then the pages carry no role field rather than a
guess. Logged as Q14.

Also worth asking him for, per title: a one-paragraph synopsis, the year,
co-producers, and the specific award detail (DRIVE's Emmy category/year).

## 2. The catalog page

An in-depth catalog on its own page — all 24 titles, filterable by medium
(TV | FILM vs BOOKS), sortable, with the proof lines and networks. The
landing page keeps the edited view (4 shows, a 5-cover front table, a
backlist); the catalog is where someone who wants the whole slate goes.

Detail pages (item 1) hang off it.

## 3. Navigation

Needed once there is more than one page. Deliberately absent right now: a nav
bar on a one-page site is furniture. Minimum: MAJOR CONTENT wordmark home,
Catalog, Contact. It should stay out of the hero's way — the current header
floats over the hero with no background, so a real nav needs either a scrim
or a scroll-triggered solid state.

## 4. Terms of Service and Privacy Policy — DRAFTED, needs review

Both pages exist at `/terms` and `/privacy` and are linked from the footer
on every page.

They describe what this site ACTUALLY does rather than repeating a generic
template: no analytics, no cookies of ours, no forms, no accounts, and one
third party — the YouTube embed, which loads only after a visitor asks for
a trailer, from youtube-nocookie.com. The terms also carry an unsolicited
material clause, which matters more than usual for a company that receives
pitches.

Every fact only the company can supply is a visible dashed placeholder:
registered name, address, jurisdiction, governing law, hosting provider,
privacy contact. A review banner shows while NEXT_PUBLIC_SHOW_TODOS is on.

**Still required before launch: a lawyer reads both.** We wrote accurate
descriptions of the build; that is not legal advice.

The privacy policy has to describe what the site actually does, which today
is: no analytics, no cookies set by us, no forms, no accounts. If a YouTube
embed ever returns (see item 6) it must disclose that YouTube may set cookies
and that we use youtube-nocookie.com to limit it. If analytics are ever added,
the policy has to be written before the script ships, not after.

**NOT lawyer-drafted by us.** We can write an accurate plain-English draft
describing the site's real behaviour; a lawyer should review before launch,
especially if he wants a contact form or any tracking later.

## 5. The remaining client asks (all BLOCKED on RG)

- **Cover priority list** (Q11) — the shelf's front table is currently a
  documented proxy: four NYT bestsellers plus Pelé. His ranked list replaces
  it wholesale.
- **The Oprah audio** (Q12) — a temp comp cut from the TIME OF ESSENCE
  trailer sits at `site/public/intro/opener.mp3`. Official audio plus
  clearance is a launch requirement.
- **A hosted trailer file** (Q13) — see below.
- **A current founder photo** (Q7) — the only one we hold is 250px from the
  2018 site, too small to use. The founder band reserves a slot for it.
- **Contact email** (Q5) — `info@majorcontent.com` is a placeholder.

## 6. Bring the hero film back

The hero deliberately has **no video** right now. A YouTube embed paints its
own transport controls over the picture even while reporting that it is
playing, wears the uploader's watermark ("BEST MOVIES" — the DRIVE link in
the copy doc is a fan re-upload), and burns in auto-captions. None of that
can be styled away from outside an iframe, and all of it landed on the
brand's first screen.

The moment RG sends a hosted MP4, the hero becomes a muted, looping
`<video>` with zero third-party surface, and the ambient film returns. The
slate's hover-to-play trailers should move to the same source at that point.

---

## Housekeeping: collapse the repo down to `site/`

Right now the repository root is *itself* a Next app — the old "Manifesto"
concept that ran on port 3006 — with its own `app/`, `components/`, `lib/`,
`public/`, `package.json` and `node_modules` sitting loose beside the real
build. That is the actual mess: from the root it is not obvious which of
three apps is live.

**Moves into `archive/`, no questions:**

| What | Where | Why |
|---|---|---|
| root `app/ components/ content/ fonts/ lib/ public/` + `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `next-env.d.ts`, `.env.local` | `archive/manifesto/` | the port-3006 concept, superseded |
| `reel/` | already copied to `archive/reel-v1/` — delete the top-level copy | its scripts are already neutered |
| root `node_modules/`, `.next/` | delete outright | rebuildable; `site/` has its own |
| `REEL-PASS-3-PLAN.md` | `archive/` | describes a build that no longer exists |
| `CONCEPTS.html` | `archive/` | the taste-test launcher; only one build remains |

**Two things I will NOT move without a word from you:**

1. **`Assets/` (26 MB)** — the client's original drop: 24 book covers, key
   art, logo lockups, the copy doc, the logo animation, the Uncontained
   recording. It is not dead weight, it is the source everything is derived
   from, and burying it under `archive/` implies otherwise. Suggest
   `source/` at the root instead, or leave it exactly where it is.
2. **`RG-CREATIVE-DIRECTION.md`, `MAJOR-CONTENT-CONCEPTS.md`, `ROADMAP.md`** —
   these are live working documents, not history. The questions list is
   still open and this roadmap is the plan. Suggest a `docs/` folder at the
   root, or leave them.

**Stays at the root regardless:** `.git`, `.gitignore`, and `site/`.

**End state:** root holds `site/`, `archive/`, the source drop, the live
docs, and nothing else that looks runnable.

---

## Ideas worth considering (not agreed, just candidates)

Ordered by impact per unit of effort.

1. **A founder portrait, shot properly.** The single biggest lift available.
   The founder band is currently type-only; a real photograph of RG would
   turn the page's least visual section into its most human one, and it is
   the section that carries the whole publisher-and-producer argument.
2. **Real trailer files.** Removes every compromise above and lets footage
   live on the hero AND the slate, at full quality, with no third party.
3. **The adaptation thread.** Several books became shows. If any of these
   four shows trace back to a title on the shelf, drawing that line
   explicitly — a book cover connected to its key art — would prove
   "publishing is the leverage for production" visually instead of asserting
   it in a sentence. Needs RG to tell us which pairs are real.
4. **Sound design on the intro.** The Oprah clip is one beat; a short
   bespoke sting under the logo build would make the hero feel authored
   rather than assembled.
5. **A press / recognition strip.** If there is coverage — trades, reviews,
   festival selections — a quiet logo row under the slate is the cheapest
   credibility on a page.
6. **Motion on the covers.** A slow parallax on the front-table jackets as
   they pass, so the shelf breathes like the hero does.
7. **A "coming soon" slot.** If anything is in development that can be named,
   even without art, it changes the site's tense from retrospective to
   active — which is what a production company actually sells.
