# MAJOR CONTENT

Rebrand of MAJOR TV for majorcontent.com. Client: Raymond Garcia.

```
site/       THE WEBSITE. This is the only thing that runs.
docs/       Live working documents — the brief, the open questions, the roadmap
Assets/     The client's original drop: covers, key art, copy doc, logo animation
archive/    Superseded builds and the 2018 site they replaced
```

## Run it

```
cd site
npm install     # first time only
npm start       # http://localhost:3011
```

**Never use port 3000** — another application on this machine owns it.

## Where things are

- **`site/`** — the production frontend. Its own README states the rules the
  build is held to: verbatim client copy only, a measured palette, one video
  player ever, triggered reveals, and a resting state that is always visible.
- **`docs/RG-CREATIVE-DIRECTION.md`** — the client's own words from a call,
  decoded into build decisions. This is the brief; it outranks everything.
- **`docs/MAJOR-CONTENT-CONCEPTS.md`** — the three original directions, and
  the open questions for the client (Q1–Q15). Several are launch blockers.
- **`docs/ROADMAP.md`** — what is agreed but not built, what is blocked on the
  client, and candidate ideas.
- **`Assets/`** — the source everything is derived from. The images in
  `site/public/projects/` were processed from here at 1440px; the copy in
  `site/content/` is transcribed from the copy doc verbatim.
- **`archive/`** — `majortv-rebuild/` is the pre-rebrand site (with the
  scraped 2018 original inside it), `manifesto/` and `reel-v1/` are
  superseded builds of this rebrand, `notes/` holds retired planning files.
  Nothing here runs; see `archive/README.md`.
