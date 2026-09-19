"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { claimPlayer, releasePlayer, onPlayerChange } from "@/lib/player-bus";
import { useReveal } from "@/lib/reveal";
import { usePointerSpring } from "@/lib/pointer";
import type { Credit } from "@/lib/content";

export type Show = {
  slug: string;
  title: string;
  credit: string | null;
  proof: string;
  trailer: string | null;
  width: number;
  height: number;
  youtubeId: string | null;
  /** the display half of our write-up, looked up on the server */
  about?: Credit | null;
};

/**
 * THE SLATE — four shows, four trailer frames.
 *
 * Each tile reveals on contact, its frame opening on a projector gate.
 *
 * With a mouse, HOVER a tile and its trailer plays, muted and chromeless, in
 * place; leave and the key art comes back. On a phone the whole frame is a
 * TAP target instead, and a tap is a deliberate request, so it gets the real
 * player: sound, captions, YouTube's own controls, and a Stop that puts the
 * key art back. Either way playing is the visitor's decision, not the scroll
 * position's — no trailer ever starts somewhere they were not looking.
 *
 * Hover is gated on the POINTER TYPE, not on a media query: a tap fires
 * pointerenter and pointerleave around the touch, so an ungated hover handler
 * starts a trailer and tears it down again 180ms later, which is what a phone
 * used to do here.
 *
 * AT MOST ONE iframe exists in the document at any moment — the hero
 * included, which is why the two coordinate through the player bus rather
 * than through geometry.
 *
 * The frame carries its own transport: a timecode and an accent rail that
 * fills as the trailer plays and then HOLDS where it stopped, so a glance
 * down the wall tells you which trailers played and how much of each you saw.
 *
 * The fourth show has no embeddable trailer (Facebook only). It runs the
 * identical rig minus the dissolve — dashed rail, "Still", and a link that
 * says where the footage actually lives. Its youtubeId is null, so no player
 * can mount in it by construction rather than by branch.
 */

const ORIGIN = "https://www.youtube-nocookie.com";
const DWELL_MS = 260;
const RETIRE_MS = 820;
const WATCHDOG_MS = 2600;
const WATCHDOG_SLOW_MS = 8000;

type State = "art" | "live" | "played" | "blocked";

function clock(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s - m * 60)).padStart(2, "0")}`;
}

/** The proof line's separator is one of only two sanctioned accent uses. */
function Proof({ proof }: { proof: string }) {
  const sep = proof.includes(" · ")
    ? " · "
    : proof.includes(" / ")
      ? " / "
      : null;
  if (!sep) return <>{proof}</>;
  const [a, b] = proof.split(sep);
  return (
    <>
      {a}
      <span className="text-signal">{sep}</span>
      {b}
    </>
  );
}

function Panel({
  s,
  state,
  isActive,
  manual,
  iframeRef,
  lineRef,
  fillRef,
  frameRef,
  onHandshake,
  onStop,
  onPlay,
  onEnter,
  onLeave,
  canAuto,
}: {
  s: Show;
  state: State;
  isActive: boolean;
  manual: boolean;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  lineRef: (el: HTMLElement | null) => void;
  fillRef: (el: HTMLElement | null) => void;
  frameRef: (el: HTMLElement | null) => void;
  onHandshake: () => void;
  onStop: () => void;
  onPlay: () => void;
  onEnter: () => void;
  onLeave: () => void;
  canAuto: boolean;
}) {
  /* A tap fires pointerenter/pointerleave around itself, so hover belongs to
     mice alone — a pen or a finger is a deliberate press, not a glance. */
  const hovering = (e: React.PointerEvent) => e.pointerType === "mouse";
  const tiltRef = useRef<HTMLElement | null>(null);
  usePointerSpring(tiltRef, { onlyWhileHovered: false });
  // each tile owns its own reveal: revealing the whole section at once put
  // four tiles in the visitor's face simultaneously
  useReveal(tiltRef);

  const still = !s.youtubeId;
  // every frame fills — pillarboxed key art made the wall read as ragged
  const pos =
    Math.abs(s.width / s.height - 16 / 9) < 0.02
      ? undefined
      : s.slug === "time-of-essence"
        ? "50% 20%"
        : "50% 45%";

  return (
    <article
      ref={tiltRef}
      className={`slate-panel tilt${still ? " slate-panel--still" : ""}`}
      data-reveal="pending"
      aria-labelledby={`slate-${s.slug}`}
      onPointerEnter={still ? undefined : (e) => hovering(e) && onEnter()}
      onPointerLeave={still ? undefined : (e) => hovering(e) && onLeave()}
    >
      <div className="slate-rule" aria-hidden="true">
        <i />
      </div>

      <h3
        id={`slate-${s.slug}`}
        className="slate-title display-heavy reveal reveal-2"
      >
        {/* the tilt rides this span, not the heading: the heading is a
            .reveal element and would otherwise apply the reveal's 560ms
            transform transition — plus the row's stagger delay — to the
            cursor tracking, which made the right-hand titles feel dead */}
        <span className="tilt-follow">{s.title}</span>
      </h3>

      <div
        className="slate-frame"
        data-slug={s.slug}
        data-state={state}
        /* a deliberate play brings YouTube's own transport with it, which
           lands exactly where ours is — so ours gets out of the way */
        data-manual={isActive && manual ? "true" : undefined}
        ref={frameRef}
      >
        {isActive && s.youtubeId && (
          /* Ambience is decoration: inert, so it can never take a tap meant
             for the tile. A deliberate play is the real thing, and its own
             controls have to work — especially on a phone, where they are
             how you scrub, pause and go full screen. */
          <div
            className="slate-video absolute inset-0"
            inert={!manual}
            aria-hidden={manual ? undefined : true}
          >
            <iframe
              ref={iframeRef}
              title={manual ? `${s.title} — trailer` : ""}
              src={
                `${ORIGIN}/embed/${s.youtubeId}` +
                `?autoplay=1&mute=${manual ? 0 : 1}` +
                `&controls=${manual ? 1 : 0}` +
                `&disablekb=1&playsinline=1&rel=0&enablejsapi=1&cc_load_policy=0&iv_load_policy=3` +
                `&origin=${encodeURIComponent(window.location.origin)}`
              }
              allow="autoplay; encrypted-media"
              onLoad={onHandshake}
              /* the automatic play is chromeless ambience, so the embed is
                 scaled past the frame to crop its own title bar and controls.
                 A deliberate play (manual) keeps the real player intact. */
              className={`absolute inset-0 h-full w-full border-0 ${
                manual ? "" : "scale-[1.35]"
              }`}
            />
          </div>
        )}

        <Image
          src={`/projects/${s.slug}.jpg`}
          alt={`${s.title}${s.credit ? ` — ${s.credit}` : ""}`}
          fill
          quality={82}
          sizes="(min-width: 640px) 46vw, 100vw"
          style={pos ? { objectPosition: pos } : undefined}
          className="slate-art slate-art--settle object-cover"
        />
        <div className="grain slate-grain" aria-hidden="true" />
        <div className="slate-gate" aria-hidden="true">
          <i />
          <i />
        </div>

        <p className="slate-state meta-caps" ref={lineRef}>
          {still ? (
            "Still"
          ) : (
            <>
              {"Trailer · "}
              <span className="on-hover">Hover</span>
              <span className="on-touch">Tap</span>
              {" to play"}
            </>
          )}
        </p>

        <div className="slate-control">
          {/* a deliberate play has no other way back to the key art, and on a
              phone it is the only way at all */}
          {!still && state === "live" && (
            <button
              type="button"
              className="btn meta-caps bg-screen/80 backdrop-blur-sm"
              onClick={onStop}
            >
              Stop
            </button>
          )}
          {!still && (state === "played" || state === "blocked") && (
            <button type="button" className="btn meta-caps" onClick={onPlay}>
              Replay
            </button>
          )}
          {!still && state === "art" && !isActive && (
            <button
              type="button"
              className={`btn meta-caps${canAuto ? " touch-only" : ""}`}
              onClick={onPlay}
            >
              Play trailer
            </button>
          )}
        </div>

        <div className="slate-rail" aria-hidden="true">
          {!still && <i ref={fillRef} />}
        </div>

        {/* The phone's hover: the whole frame is the target. It is a pointer
            convenience only — the Play trailer control beside it carries the
            accessible name — and it stands down once the trailer is up, so
            the player's own controls get the taps from then on. */}
        {!still && !isActive && (
          <button
            type="button"
            className="slate-hit"
            tabIndex={-1}
            aria-hidden="true"
            onClick={onPlay}
          />
        )}
      </div>

      <div className="slate-stub">
        <p className="text-cap text-mid reveal reveal-3">
          {s.credit && <>{s.credit} · </>}
          <Proof proof={s.proof} />
        </p>
        {/* what the show actually is, and what carried it — the client asked
            for the site to breathe with copy and let the images support it */}
        {s.about && (
          <>
            <p className="reveal reveal-3 mt-3 max-w-[58ch] text-about text-mid">
              {s.about.summary}
            </p>
            <p className="reveal reveal-4 meta-caps mt-3 text-faint">
              {s.about.carrier}
              {s.about.award && (
                <>
                  {" · "}
                  <span className="text-signal">{s.about.award}</span>
                </>
              )}
            </p>
          </>
        )}
        {/* only the tile with nothing to play sends you elsewhere */}
        {still && s.trailer && (
          <a
            className="link meta-caps reveal reveal-4 mt-3 inline-block"
            href={s.trailer}
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch on Facebook <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  );
}

export function Slate({ shows, label }: { shows: Show[]; label: string }) {
  const [active, setActive] = useState<{
    slug: string;
    manual: boolean;
  } | null>(null);
  const [states, setStates] = useState<Record<string, State>>({});
  const [canAuto, setCanAuto] = useState(false);

  const headRef = useRef<HTMLElement | null>(null);
  useReveal(headRef);

  // play-once guard: a REF, never state — StrictMode's second effect pass
  // runs before a state update flushes and both would read an empty set
  const frames = useRef(new Map<string, HTMLElement>());
  const lines = useRef(new Map<string, HTMLElement>());
  const fills = useRef(new Map<string, HTMLElement>());
  const durations = useRef(new Map<string, number>());
  const iframe = useRef<HTMLIFrameElement | null>(null);
  const activeRef = useRef<{ slug: string; manual: boolean } | null>(null);
  const prevActive = useRef<{ slug: string; manual: boolean } | null>(null);
  const retiring = useRef<ReturnType<typeof setTimeout> | null>(null);
  // the slug whose player retired: its iframe lives on ~820ms while the
  // poster returns, and its ticks must not rewrite a settled panel
  const retired = useRef<string | null>(null);

  const setState = useCallback((slug: string, s: State) => {
    setStates((prev) => (prev[slug] === s ? prev : { ...prev, [slug]: s }));
  }, []);

  // whenever the player moves on, the tile it left must stop claiming to be
  // live — "live" is what hides the key art, so a stale one leaves an empty
  // frame and a timecode frozen mid-count
  useEffect(() => {
    const prev = prevActive.current;
    if (prev && prev.slug !== active?.slug) {
      setStates((s) =>
        s[prev.slug] === "live" ? { ...s, [prev.slug]: "played" } : s,
      );
    }
    prevActive.current = active;
    activeRef.current = active;
  }, [active]);

  /** Poster returns, then the iframe is destroyed — unmounting reclaims the
      renderer process and stops the stream; pausing does neither. */
  const retire = useCallback(
    (slug: string, next: State = "played") => {
      retired.current = slug;
      setState(slug, next);
      if (retiring.current) clearTimeout(retiring.current);
      retiring.current = setTimeout(() => {
        activeRef.current = null;
        releasePlayer("slate");
        setActive(null);
      }, RETIRE_MS);
    },
    [setState],
  );

  // The bus has to be listened to, not only shouted into. The hero's own
  // 4.9s timer can fire AFTER the slate has claimed the player — it then
  // mounts a second embed and, without this, the slate never hears about it
  // and two videos decode at once for as long as the visitor stays put.
  useEffect(
    () =>
      onPlayerChange((who) => {
        if (who === "slate") return;
        if (!activeRef.current) return;
        const slug = activeRef.current.slug;
        activeRef.current = null;
        setStates((st) =>
          st[slug] === "live" ? { ...st, [slug]: "played" } : st,
        );
        setActive(null);
      }),
    [],
  );

  // capability gate, read once
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = (
      navigator as unknown as {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (c?.saveData) return;
    if (c?.effectiveType === "2g" || c?.effectiveType === "slow-2g") return;
    setCanAuto(true);
  }, []);

  // the player's readout, watchdog, and end pre-emption
  useEffect(() => {
    if (!active) return;
    const slug = active.slug;
    let started = false;
    let extended = false;
    let done = false;
    // the API reports playerState only when it CHANGES; the ~4/sec ticks that
    // follow carry currentTime alone. So it has to be latched — testing it on
    // the same message as the timecode means the gate can never open.
    let playing = false;
    let watchdog = setTimeout(() => {
      if (!started) retire(slug, "blocked");
    }, WATCHDOG_MS);

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== ORIGIN) return;
      if (e.source !== iframe.current?.contentWindow) return;
      let d: {
        event?: string;
        info?: {
          playerState?: number;
          currentTime?: number;
          duration?: number;
        };
      };
      try {
        d = JSON.parse(e.data);
      } catch {
        return;
      }
      if (d?.event !== "infoDelivery" || !d.info) return;
      if (done || retired.current === slug) return;

      const { playerState, currentTime, duration } = d.info;
      if (typeof playerState === "number") playing = playerState === 1;

      if (!started && !extended) {
        extended = true;
        clearTimeout(watchdog);
        watchdog = setTimeout(
          () => !started && retire(slug, "blocked"),
          WATCHDOG_SLOW_MS - WATCHDOG_MS,
        );
      }
      // hold the poster until the picture is genuinely moving: at 0:00 the
      // player still has its own chrome up, and burning the art off any
      // earlier shows the viewer somebody else's UI
      if (playing && !started && (currentTime ?? 0) >= 0.35) {
        started = true;
        clearTimeout(watchdog);
        setState(slug, "live");
      }
      if (typeof duration === "number" && duration > 0)
        durations.current.set(slug, duration);

      const dur = durations.current.get(slug) ?? 0;
      if (playing && typeof currentTime === "number" && dur > 0) {
        const line = lines.current.get(slug);
        const fill = fills.current.get(slug);
        // written through refs — a playing video never re-renders React
        if (line)
          line.textContent = `Playing · ${clock(currentTime)} / ${clock(dur)}`;
        if (fill)
          fill.style.transform = `scaleX(${Math.min(1, currentTime / dur)})`;
        // pre-empt the end screen: rel=0 still allows same-channel cards
        if (dur - currentTime <= 0.4) {
          done = true;
          retire(slug);
        }
      }
      if (playerState === 0) {
        done = true;
        retire(slug);
      }
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(watchdog);
    };
  }, [active, retire, setState]);

  const handshake = useCallback(() => {
    iframe.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
      ORIGIN,
    );
  }, []);

  /** Start a tile. `manual` is a deliberate click, which earns the real
      player: controls, sound and captions. Hover gets muted ambience. */
  const play = useCallback(
    (slug: string, manual: boolean) => {
      if (retiring.current) clearTimeout(retiring.current);
      setState(slug, "art");
      retired.current = null;
      activeRef.current = { slug, manual };
      claimPlayer("slate");
      setActive({ slug, manual });
    },
    [setState],
  );

  /* Hover in, play; hover out, put the picture back. A short leave delay
     stops a cursor crossing the gap between two tiles from tearing the
     player down and building it again. */
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverIn = useCallback(
    (slug: string) => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
      if (activeRef.current?.slug === slug) return;
      play(slug, false);
    },
    [play],
  );
  const hoverOut = useCallback(
    (slug: string) => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
      leaveTimer.current = setTimeout(() => {
        if (activeRef.current?.slug === slug && !activeRef.current.manual)
          retire(slug);
      }, 180);
    },
    [retire],
  );

  return (
    <section
      ref={headRef}
      data-reveal="pending"
      className="mx-auto max-w-[1320px] px-5 pt-20 sm:px-8"
    >
      <h2 className="meta-caps reveal text-mid">
        The slate <span className="text-faint">— {label}</span>
      </h2>

      <div className="slate-grid">
        {shows.map((s) => (
          <Panel
            key={s.slug}
            s={s}
            state={states[s.slug] ?? "art"}
            isActive={active?.slug === s.slug}
            manual={!!active?.manual}
            canAuto={canAuto}
            iframeRef={iframe}
            onHandshake={handshake}
            onStop={() => retire(s.slug)}
            onPlay={() => play(s.slug, true)}
            onEnter={() => hoverIn(s.slug)}
            onLeave={() => hoverOut(s.slug)}
            frameRef={(el) => {
              if (el) frames.current.set(s.slug, el);
              else frames.current.delete(s.slug);
            }}
            lineRef={(el) => {
              if (el) lines.current.set(s.slug, el);
              else lines.current.delete(s.slug);
            }}
            fillRef={(el) => {
              if (el) fills.current.set(s.slug, el);
              else fills.current.delete(s.slug);
            }}
          />
        ))}
      </div>
    </section>
  );
}
