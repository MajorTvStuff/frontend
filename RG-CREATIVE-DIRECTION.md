# RG's Creative Direction — decoded

*Reframed from his raw call notes (2026-08-19). Left column is what he said;
the rest is what it means and how the site expresses it. His words are the
brief — this doc just turns them into build decisions.*

> **Status change (same day):** the Reel is no longer a concept in a taste
> test — it is **the beta MVP**. The Marquee build is cancelled unless RG
> revives it; the Manifesto stays up as an archived concept. And the color
> scheme goes all the way to the original majortvproductions.com: the old
> site was a **dark navy site** (the `#001528→#003B59` blue-M gradient
> ground, `#003853` section bands, `#26B3EF` accent), so the MVP moves into
> that navy world site-wide — which also makes his "seamless continuity"
> note literal. Execution spec: [REEL-PASS-3-PLAN.md](REEL-PASS-3-PLAN.md).

---

## The through-line

Every note points at the same idea:

> **MAJOR CONTENT is a production company with a publisher's instincts.
> The site is a reference point, not a résumé — quick proof for people who
> didn't do the homework, staged with a sense of order.**

The books are the *leverage*, not the product. The shows are the present
tense. The site's job is to let a visitor absorb that in one scroll without
reading anything they didn't choose to read.

---

## Note by note

### "Reference points for folks that didn't get the info search"
**He means:** most visitors arrive cold — no Google deep-dive, no context.
The site must work as a primer: who this is, why it's credible, in seconds.
**On the site:** proof lines and network names do the talking (Emmy · Hulu,
#1 NYT Bestseller); the icons band is names, not paragraphs; nothing
requires reading a bio to "get it."

### "Bringing publishing sensibility into production TV" / "Publishing is the leverage for production, TV/Film/Books"
**He means:** the unique claim isn't "we make shows AND books" — it's that
two decades of publishing instinct (packaging authors, building platforms,
marketing stories) is the engine behind the production slate.
**On the site:** this line now sits in the Company section as the thesis
between TV | FILM and BOOKS — his exact words, pending his written sign-off.
Books are staged as *foundation* (the shelf below), shows as *output* (the
slate on top).

### "Seamless continuity, from MAJOR TV to MAJOR CONTENT"
**He means:** the rebrand shouldn't read like a new unknown company. The
equity of MAJOR TV carries forward.
**On the site:** a quiet "From MAJOR TV to MAJOR CONTENT" line marks the
lineage in the Company section. (The logo build animation itself is the
continuity argument — same M, new descriptor.)

### "Simplify everything" / "Basic info, and cool info" / "Also just for info not for basically info"
**He means:** two layers only — the essential facts (basic info) and the
impressive facts (cool info). No connective tissue, no walls of text.
**On the site:** already the law since the minimalist pass. This round
extends it to the wall: covers without captions, cluster headers instead of
24 repeated proof lines. Anything deeper is hover-reveal — info on demand.

### "Quick and explosive book covers"
**He means:** covers as energy, not as catalog. They should *flash* — the
punch of the Uncontained intro — not sit in a grid asking to be studied.
**On the site:** during the intro, big covers now hard-cut behind the word
flow (one every ~0.6s while "Worldwide Bestsellers" reads), then the logo
resolves. The covers become part of the show.

### "Oprah Winfrey opens up audio of 'this is a moment' then books then open logo"
**He means:** an intro sketch — a voice of ultimate cultural authority opens,
covers flash, the logo builds. Sound as the hook.
**Status:** the *visual* sequence (moment → books flash → logo build) is now
built. The audio needs two things from RG: the actual clip (source + rights —
which Oprah moment is this?), and a decision on interaction — **browsers
block autoplaying sound**, so audio either rides a "enter with sound" tap or
plays after any first click. Logged as a question for him.

### "Book images and stuff — don't list titles"
**He means:** the covers ARE the titles. Listing "TRUE LOVE — Jennifer Lopez"
under a jacket that already says it is exactly the word-vomit he's cutting.
**On the site:** book tiles are now pure cover art. Title + author appear
only on hover (the "cool info" layer), and in alt text for accessibility.
Show tiles keep their captions — they're the current-day work.

### "Don't wanna show old books cause it was from a decade ago… not loud and proud, but not throw them away"
**He means:** the Celebra shelf is proof, not product. It must be present
(it's the leverage) but visibly *past* — staged smaller, below the shows.
**On the site:** shows lead the wall at full size; the books drop below into
a compact tiered shelf that reads as an archive of receipts, not a storefront.

### "Clustering some covers, ones with more importance to show off" / "(ask if we can get a list of priority)"
**He means:** not all 20 books are equal. Cluster them so the eye lands on
the heavyweights first.
**On the site:** three tiers by the strongest available proxy — the proof
lines — descending in size:
1. **#1 New York Times Bestseller** — one cover, largest
2. **New York Times Bestsellers** — eight covers, medium
3. **International & National Bestsellers** — eleven covers, small
**Open:** his actual priority list replaces the proxy the moment he sends it
(top of list = bigger, earlier). Question logged.

### "Tacky cover images"
**He means:** some jackets are dated 2010s celebrity-publishing design and he
knows it.
**On the site:** the tier system is also the tack-management system — dated
covers render small, in uniform frames, where they read as *volume of proof*
rather than as design choices. The genuinely low-res scans (ME, A MEMOIR)
already never appear above thumbnail size. If he flags specific covers,
they move to the bottom tier or out.

### "ADd my scroll animations" / *(earlier)* "…so people can handle the load of info and create a sense of order"
**He means:** the page should deal information in beats, not all at once.
Order = comprehension.
**On the site:** every section already rises in on scroll; this pass adds
**staggering** — covers cascade in one after another within their cluster,
and the founder band arrives as beats (name → career line → recognition).
Zero JavaScript, reversible, reduced-motion safe.

### "Also afterwards lets the trailer play"
**He means:** once the intro has made its argument, the hero should show
actual footage — the work, moving.
**On the site:** ~11s in, after the logo holds, the DRIVE trailer (his Emmy
flagship) fades up and plays muted behind the lockup, looping as ambience.
Built as a YouTube embed for now; a hosted MP4 from RG would make it
faster, cleaner, and rights-clear. Question logged.

---

## What the Reel becomes

One sentence: **an intro that performs (words → exploding covers → logo →
trailer), a slate that leads, a shelf that testifies, and a company section
that states the thesis in his own words — everything else on demand.**

Scroll order = his argument order:

1. **Intro** — word flow, covers flash, logo builds, trailer plays
2. **The slate** — 4 shows, full size (the present)
3. **The shelf** — 20 covers in 3 descending tiers (the leverage)
4. **Global icons** — names as a band (the network)
5. **Company** — thesis: continuity line + "publishing is the leverage"
6. **Founder** — 3 beats + recognition + contact

---

## Needed from RG (added to MAJOR-CONTENT-CONCEPTS.md questions)

1. **Priority list of book covers** — top = most important; also any covers
   he'd rather bury or drop entirely.
2. **The Oprah audio** — which clip, where it's from, do we have rights; and
   OK that sound requires a tap (browser rule, no way around it).
3. **A hosted trailer file** — the DRIVE trailer as an MP4 we can serve
   (currently a YouTube embed; his file would be faster and rights-clean).
