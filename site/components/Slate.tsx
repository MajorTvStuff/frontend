"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { claimPlayer, releasePlayer, onPlayerChange } from "@/lib/player-bus";
import { useReveal } from "@/lib/reveal";

export type Show = {
  slug: string;
  title: string;
  credit: string | null;
  proof: string;
  trailer: string | null;
  width: number;
  height: number;
  youtubeId: string | null;
};

/**
 * THE SLATE — four shows, four trailer frames.
 *
 * Each tile reveals on contact, its frame opening on a projector gate, and
 * plays its trailer muted when it reaches the middle of the screen. The
 * contract: each show autoplays AT MOST ONCE per page load, and AT MOST ONE
 * iframe exists in the document at any moment — the hero included, which is
 * why the two coordinate through the player bus rather than through
 * geometry.
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
  const sep = proof.includes(" · ") ? " · " : proof.includes(" / ") ? " / " : null;
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
  canAuto: boolean;
}) {
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
      className={`slate-panel${still ? " slate-panel--still" : ""}`}
      aria-labelledby={`slate-${s.slug}`}
    >
      <div className="slate-rule" aria-hidden="true">
        <i />
      </div>

      <h3
        id={`slate-${s.slug}`}
        className="slate-title display-heavy reveal reveal-2"
      >
        {s.title}
      </h3>

      <div
        className="slate-frame"
        data-slug={s.slug}
        data-state={state}
        ref={frameRef}
      >
        {isActive && s.youtubeId && (
          <div className="slate-video absolute inset-0" inert aria-hidden="true">
            <iframe
              ref={iframeRef}
              title=""
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
          {still ? "Still" : "Trailer · Muted"}
        </p>

        <div className="slate-control">
          {!still && state === "live" && !manual && (
            <button type="button" className="btn meta-caps" onClick={onStop}>
              Stop
            </button>
          )}
          {!still && (state === "played" || state === "blocked") && (
            <button type="button" className="btn meta-caps" onClick={onPlay}>
              Replay
            </button>
          )}
          {!still && state === "art" && !canAuto && !isActive && (
            <button type="button" className="btn meta-caps" onClick={onPlay}>
              Play trailer
            </button>
          )}
        </div>

        <div className="slate-rail" aria-hidden="true">
          {!still && <i ref={fillRef} />}
        </div>
      </div>

      {/* one line of metadata, not five */}
      <div className="slate-stub">
        <p className="text-cap text-mid reveal reveal-3">
          {s.credit && <>{s.credit} · </>}
          <Proof proof={s.proof} />
        </p>
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
  const [active, setActive] = useState<{ slug: string; manual: boolean } | null>(
    null,
  );
  const [states, setStates] = useState<Record<string, State>>({});
  const [canAuto, setCanAuto] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  useReveal(sectionRef);

  // play-once guard: a REF, never state — StrictMode's second effect pass
  // runs before a state update flushes and both would read an empty set
  const played = useRef<Set<string>>(new Set());
  const frames = useRef(new Map<string, HTMLElement>());
  const lines = useRef(new Map<string, HTMLElement>());
  const fills = useRef(new Map<string, HTMLElement>());
  const durations = useRef(new Map<string, number>());
  const iframe = useRef<HTMLIFrameElement | null>(null);
  const activeRef = useRef<{ slug: string; manual: boolean } | null>(null);
  const prevActive = useRef<{ slug: string; manual: boolean } | null>(null);
  const playable = useRef<string[]>([]);
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  /** Arm the most-centred unplayed tile, but only when nothing is playing.
      Two tiles share the cue band in this layout; they queue rather than
      trading the player back and forth a second at a time. The band is
      measured fresh, because a tile that crossed it while another played has
      already had its observer callback and will never get another. */
  const schedule = useCallback(() => {
    if (activeRef.current || dwellTimer.current) return;
    const vh = window.innerHeight;
    const bandTop = vh * 0.3;
    const bandBottom = vh * 0.7;
    let best: string | null = null;
    let bestD = Infinity;
    playable.current.forEach((slug) => {
      if (played.current.has(slug)) return;
      const el = frames.current.get(slug);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom <= bandTop || r.top >= bandBottom) return;
      const d = Math.abs(r.top + r.height / 2 - vh / 2);
      if (d < bestD) {
        bestD = d;
        best = slug;
      }
    });
    if (!best) return;
    const pick: string = best;
    dwellTimer.current = setTimeout(() => {
      dwellTimer.current = null;
      if (activeRef.current || played.current.has(pick)) return;
      played.current.add(pick);
      retired.current = null;
      activeRef.current = { slug: pick, manual: false };
      claimPlayer("slate");
      setActive({ slug: pick, manual: false });
    }, DWELL_MS);
  }, []);

  // watch the cue band, and re-check as the page moves
  useEffect(() => {
    if (!canAuto) return;
    const list = shows.filter((s) => s.youtubeId);
    playable.current = list.map((s) => s.slug);
    if (!list.length) return;

    let io: IntersectionObserver | null = null;
    const arm = () => {
      io = new IntersectionObserver(() => schedule(), {
        rootMargin: "-30% 0px -30% 0px",
        threshold: 0,
      });
      list.forEach((sh) => {
        const el = frames.current.get(sh.slug);
        if (el && io) io.observe(el);
      });
    };
    const ric = (
      window as unknown as { requestIdleCallback?: (cb: () => void) => number }
    ).requestIdleCallback;
    const handle = ric ? ric(arm) : setTimeout(arm, 1);

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        schedule();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (!ric) clearTimeout(handle as ReturnType<typeof setTimeout>);
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      if (dwellTimer.current) clearTimeout(dwellTimer.current);
      dwellTimer.current = null;
    };
  }, [canAuto, shows, schedule]);

  // when the player frees up, whatever owns the band gets its turn
  useEffect(() => {
    if (!active) schedule();
  }, [active, schedule]);

  // keep playing while a decent part of the tile is still on screen: cutting
  // at the cue band's edge ended every trailer after about a second, and
  // holding until full exit starved the tiles below
  useEffect(() => {
    if (!active) return;
    const slug = active.slug;
    const el = frames.current.get(slug);
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio < 0.35) retire(slug);
      },
      { threshold: [0, 0.35, 0.6] },
    );
    io.observe(el);
    const onHide = () => document.hidden && retire(slug);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [active, retire]);

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
        info?: { playerState?: number; currentTime?: number; duration?: number };
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
        if (line) line.textContent = `Playing · ${clock(currentTime)} / ${clock(dur)}`;
        if (fill) fill.style.transform = `scaleX(${Math.min(1, currentTime / dur)})`;
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

  /** Every deliberate play is the full player: controls, sound, captions. */
  const playManual = useCallback(
    (slug: string) => {
      played.current.add(slug);
      if (retiring.current) clearTimeout(retiring.current);
      if (dwellTimer.current) {
        clearTimeout(dwellTimer.current);
        dwellTimer.current = null;
      }
      setState(slug, "art");
      retired.current = null;
      activeRef.current = { slug, manual: true };
      claimPlayer("slate");
      setActive({ slug, manual: true });
    },
    [setState],
  );

  return (
    <section
      ref={sectionRef}
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
            onPlay={() => playManual(s.slug)}
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
