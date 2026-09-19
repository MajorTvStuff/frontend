# MAJOR CONTENT — roadmap

Everything agreed but not yet built, in the order it should probably happen.
The live site is `site/` (port 3011). Items marked **BLOCKED** are waiting on
something only RG can provide.

---

## THE CLIENT'S OWN LAYOUT — 2026-09-18

RG built a version himself and sent the screen recording (`Assets/1288.mp4`,
67s, 320x240). It is the clearest brief of the project, and the page now
follows it. Frames are in the session scratchpad; the structure is:

    hero      the intro lines resolving into the lockup — no key art
    COMPANY   all three company paragraphs
    [band]    one drifting row: full 16:9 tiles for shows, books two high
    TV | FILM the copy
    BOOKS     the copy
    FOUNDER   the whole five-paragraph bio, recognition in a rule
    contact   the address, then the footer

Every section is a small-caps label with the M mark, then writing at one
reading measure. The band is the ONLY imagery in the body of the page. In his
recording the page holds still while the row drifts — the surrounding copy is
identical across frames 42s, 46s and 49s while the images change completely —
so it is a marquee, not a scroller.

**What this answered.** "I want the site to breathe more with copy and
messaging, and have the images be more supportive." The old page carried 164
words of his copy and 441 more sat unused in the content file; the page now
carries all of it, the founder bio included, and the body has no imagery
except the band. 5,640px and image-led became 4,968px and copy-led.

**Parked, not deleted:** the trailer slate (`components/Slate.tsx`), the book
clump (`components/Shelf.tsx`, `lib/clump.ts`, `lib/stage.ts`) and the book
panel are intact, tested and out of the page. His layout has none of them and
he asked for simplicity. Their probes in the scratchpad (`tap-verify.js`,
`stage-verify.js`, `clump-verify.js`) target components that are no longer
mounted and will not pass until they return. Where the trailers belong is a
question for the call.

**Open against his version:**

- **Palette.** His ground is a neutral near-black (sampled 5-11% grey, R=G=B);
  ours is the navy #001528 measured off majortvproductions.com on the client's
  instruction. Not changed unilaterally — it is one token, `--color-ground`.
- **The hero.** He deferred it ("we can explore the header video/animation
  after") and says his own logo timing is wrong. `Assets/MAJOR-TV-logo-
  animation.mov` is the source file and has been in the drop all along.
- **Global icons** had its own band and no longer does; the eighteen names are
  in bio paragraph three, which now renders in full.

## 0. Book synopses — DRAFTED FROM SOURCES, awaiting RG's sign-off

Hovering a jacket on the shelf slides in a panel with the title, the author
and the proof line. The synopsis slot exists in the markup and is still empty
on the site.

**All 24 are now written** (2026-09-18) — see `site/content/research.json` and
the sign-off copy at `docs/SYNOPSES-FOR-REVIEW.md`. The rule has not changed:
nothing was invented. Each summary is written by us, in our own words, from
published sources — publisher listings, trade press, network announcements —
and every fact underneath it (imprint, year, network, co-writers) is cited.
No jacket copy is reproduced, because that is someone else's copyright.

**RG's role per title is not guessed either.** His own approved bio names all
four shows as Executive Producer and names LORD HELP ME as literary
representation; for the books the imprint is a matter of public record
(Celebra for 17 of them, Rayo for two), and his bio states that he founded and
published Celebra and was Associate Publisher of Rayo. One title — CELIA, MY
LIFE — is the only case where the connection is not spelled out either way.

**LIVE ON THE BETA** as of 2026-09-18, at the client's instruction: the book
panel carries the summary, the publisher and the year, and RG's role on the
title; each slate tile carries the same beneath its credit line, with DRIVE's
Emmy named by category. Only the display half of each entry reaches the page —
our citations and our open questions stay on the server, where `research()`
keeps them and `credit()` does not.

**Six further titles were added the same day** — THE GREENPRINT, NO LOST
CAUSES, THE NEXT BIG STORY, EL CREADOR DE ÉXITOS, VIVIENDO and UNA VIDA. All
six are named in RG's bio and all six are researched, but **none can get a
tile**: we have no cover image and no proof line for any of them, and we will
not invent a bestseller claim. They sit in research.json with `onSite: false`
and are listed in the review doc.

**Still open:** six cover images, six proof lines, and RG's read-through of
the wording — it is our words about other people's work, and he is the one who
carries the relationships.

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

RG supplied the company details 2026-09-07: the entity is **Major TV, Inc.**,
a **New Jersey** company. The contact was `rgarcia@majortvproductions.com`
and is now **info@majorcontent.com** — he is moving it to the new brand's
domain (2026-09-19), which is the address his own build showed.
Both live in `site/content/site.json` (`legal.entity`, `legal.jurisdiction`,
`contact.email`), so the terms, the privacy page and the copyright notice all
read them from one place. Governing law and forum are now New Jersey, and the
copyright line names the company rather than the brand.

**Two placeholders remain, both on /privacy:** the hosting provider (unknown
until we pick a host — see item on GoDaddy in the client asks) and the
registered office address. A review banner shows while NEXT_PUBLIC_SHOW_TODOS
is on.

**One thing to put to RG:** the site brands as MAJOR CONTENT but the entity is
Major TV, Inc. Both pages currently say the site is published by Major TV, Inc.
"under the name MAJOR CONTENT", which describes what is happening without
claiming a registered DBA. If MAJOR CONTENT is a registered trade name, or a
separate entity is being formed, the wording should follow that instead.

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

## Housekeeping — DONE (29 Aug)

The root used to be a third Next app (the port-3006 Manifesto concept)
sitting loose beside `site/` and `reel/`. It is now:

```
site/       the website — the only thing that runs
docs/       this file, the brief, the open questions
Assets/     the client's original drop
archive/    legacy/ (2018 site), manifesto/, reel-v1/
```

`Assets/` stayed at the root deliberately: it is the source the site's
imagery and copy are derived from, not history. The working documents moved
to `docs/` rather than `archive/` for the same reason.

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
