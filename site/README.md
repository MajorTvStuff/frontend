# MAJOR CONTENT — the frontend

Production build. `npm start` serves it on **3011** (never use 3000 — that
port belongs to another app on this machine).

## What this is

A single page whose job is stated in the client's own brief: *"a reference
point for folks that didn't get the info search."* Most visitors arrive cold,
so the page states, then proves, then re-states, then proves again — and
never proves something it has not yet claimed.

    hero     what the company is, and six tokens of proof, at t=0
    slate    the present tense, proved with footage
    shelf    the claim that explains the slate, and the books that prove it
    icons    the network, as names
    founder  the person who is both publisher and producer

## The rules this build is held to

- **Every string is verbatim client copy** or a mechanical slice of one.
  `content/site.json` and `content/projects.json` are ground truth. Nothing
  on the page is written by us — no invented credits, awards or dates. The
  two `positioning` lines are the client's spoken words and are marked
  display-only pending his written sign-off.
- **The palette is measured, not chosen** — taken off the client's original
  site. Brand red appears only inside the logo; the accent has exactly two
  jobs (a proof separator, and the trailer progress rail).
- **One player, ever.** The hero and the slate coordinate through
  `lib/player-bus.ts` rather than through geometry, because geometry cannot
  close the window where both are legally on screen.
- **Reveals are triggered, never scroll-scrubbed.** A `view()` timeline's
  entry phase is the element's own height, so a 15px heading finished inside
  6px of scroll — invisible. `lib/reveal.ts` plays once, on contact, at its
  own speed, and works in Firefox and Safari.
- **The resting state is always visible.** Only JS hides anything, only when
  motion is allowed, and only `[data-reveal="in"]` carries a transition — so
  nothing can ever be watched fading *away*. There is a `<noscript>` fallback.
- **Reduced motion means fewer and gentler, not zero**: movement goes,
  colour and opacity feedback on controls stays.

## History

The first build is archived at `../archive/reel-v1/`. It was replaced after a
five-lens audit whose verdict was "the page performs beautifully and argues
nothing" — a cold visitor scrolled 2.6 screens before the site said what the
company was, and the one differentiating claim sat at 15px, 81% down the page.
The intro choreography, the wordmark tracing, the player contract and the
trailer machinery all originate there and were carried forward.

Open questions for the client live in `../MAJOR-CONTENT-CONCEPTS.md` (Q11-Q13
are the newest: the cover priority list, the Oprah clip, and a hosted trailer
file — the DRIVE link in his copy doc is a watermarked fan re-upload).

## Planned

See `../ROADMAP.md` for the full list (detail pages, a catalog page, nav,
TOS/privacy, and what is blocked on the client).

- **Per-title detail pages.** Clicking a show or a book opens a full
  breakdown of that title. Everything we hold verbatim can be built today —
  title, credit, network/publisher, proof line, trailer, jacket. The one
  thing that is BLOCKED is the client's own role on each title (EP,
  packager, literary rep, publisher…): we do not have it, and it is exactly
  the kind of fact that must never be inferred from a credit line. Logged as
  Q14 in `../MAJOR-CONTENT-CONCEPTS.md`; the pages ship without a role field
  until he sends one per title.
