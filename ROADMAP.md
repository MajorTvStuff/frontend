# MAJOR CONTENT — roadmap

Everything agreed but not yet built, in the order it should probably happen.
The live site is `site/` (port 3011). Items marked **BLOCKED** are waiting on
something only RG can provide.

---

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

## 4. Terms of Service and Privacy Policy

For legality, and both linked from the footer.

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
