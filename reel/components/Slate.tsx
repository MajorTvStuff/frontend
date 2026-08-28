"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { claimPlayer, releasePlayer } from "@/lib/player-bus";

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
 * THE SLATE — the four shows as four trailer panels.
 *
 * Four tiles pinned to a wall like a contact sheet — a scattered grid
 * of different widths and drops, nothing sharing an edge. Each tile
 * pops in on its own view timeline as it enters: a rule draws, a gate
 * opens, the key art settles. When a frame reaches the middle of the
 * screen it holds a beat and the still burns off to running footage.
 *
 * The metadata stub's last field is the instrument: a timecode and an
 * accent rail that FILLS as the trailer
 * plays and HOLDS where it stopped — so a glance down the section shows
 * which trailers played and how much of each you saw.
 *
 * Contract: each embeddable show autoplays at most once per page load,
 * independently of the others, and at most ONE iframe exists in the
 * document at any moment.
 *
 * The fourth show has no embeddable trailer (Facebook only). It runs the
 * identical rig minus the dissolve: dashed rail, state line "Still", and
 * a link that says where the footage actually lives. Because its
 * youtubeId is null it is structurally absent from the cue observer —
 * no iframe can mount in it by construction, not by branch.
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

/** The proof line's separator is one of the two sanctioned accent uses. */
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

export function Slate({ shows, label }: { shows: Show[]; label: string }) {
  const [active, setActive] = useState<{
    slug: string;
    manual: boolean;
  } | null>(null);
  const [states, setStates] = useState<Record<string, State>>({});
  const [canAuto, setCanAuto] = useState(false);

  // play-once guard: a REF, never state — StrictMode's second effect pass
  // runs before a state update flushes and both would read an empty set.
  // Never reset in cleanup.
  const played = useRef<Set<string>>(new Set());
  const frames = useRef(new Map<string, HTMLElement>());
  const lines = useRef(new Map<string, HTMLElement>());
  const fills = useRef(new Map<string, HTMLElement>());
  const durations = useRef(new Map<string, number>());
  const iframe = useRef<HTMLIFrameElement | null>(null);
  const retiring = useRef<ReturnType<typeof setTimeout> | null>(null);
  // the scatter puts two tiles side by side, so more than one can sit in the
  // cue band at once. These make "one at a time" a queue, not a race.
  const activeRef = useRef<{ slug: string; manual: boolean } | null>(null);
  const prevActive = useRef<{ slug: string; manual: boolean } | null>(null);
  const playable = useRef<string[]>([]);
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setState = useCallback((slug: string, s: State) => {
    setStates((prev) => (prev[slug] === s ? prev : { ...prev, [slug]: s }));
  }, []);

  // Whenever the player moves on, the tile it left must stop claiming to be
  // live: "live" is what hides the key art, so a stale one leaves an empty
  // frame behind and a state line frozen mid-timecode.
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

  // ---- capability gate, read once (matches how Montage.tsx asks) ----
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

  // ---- observer A: approach -> warm the connection, once, then stop ----
  useEffect(() => {
    if (!canAuto) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        const hosts: [string, boolean][] = [
          [ORIGIN, true],
          ["https://i.ytimg.com", false],
        ];
        for (const [href, cors] of hosts) {
          const l = document.createElement("link");
          l.rel = "preconnect";
          l.href = href;
          if (cors) l.crossOrigin = "";
          document.head.appendChild(l);
        }
        io.disconnect();
      },
      { rootMargin: "0px 0px 150% 0px", threshold: 0 },
    );
    frames.current.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [canAuto]);

  /** Arm the most-centred unplayed tile — but only when nothing is playing.
      Two tiles can share the cue band in this layout; they queue instead of
      trading the player back and forth a second at a time. */
  const schedule = useCallback(() => {
    if (activeRef.current || dwellTimer.current) return;
    // Measure the band fresh rather than trusting the observer's set: a tile
    // that crossed the band while another was playing has already had its
    // "entered" callback, and IntersectionObserver will not fire it again —
    // so a queued tile would be skipped for the rest of the page load.
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
      // re-check: the dwell is exactly the window in which things change
      if (activeRef.current || played.current.has(pick)) return;
      played.current.add(pick);
      activeRef.current = { slug: pick, manual: false };
      claimPlayer("slate");
      setActive({ slug: pick, manual: false });
    }, DWELL_MS);
  }, []);

  // ---- observer B: who is in the cue band ----
  useEffect(() => {
    if (!canAuto) return;
    const list = shows.filter((s) => s.youtubeId);
    playable.current = list.map((s) => s.slug);
    if (!list.length) return;

    let io: IntersectionObserver | null = null;
    const arm = () => {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.length) schedule();
        },
        { rootMargin: "-30% 0px -30% 0px", threshold: 0 },
      );
      list.forEach((sh) => {
        const el = frames.current.get(sh.slug);
        if (el && io) io.observe(el);
      });
    };

    // defuse IO's next-frame first callback racing the hero intro
    const ric = (
      window as unknown as { requestIdleCallback?: (cb: () => void) => number }
    ).requestIdleCallback;
    const handle = ric ? ric(arm) : setTimeout(arm, 1);
    return () => {
      if (!ric) clearTimeout(handle as ReturnType<typeof setTimeout>);
      io?.disconnect();
      if (dwellTimer.current) clearTimeout(dwellTimer.current);
      dwellTimer.current = null;
    };
  }, [canAuto, shows, schedule]);

  // when the player frees up, whatever is still in the band gets its turn
  useEffect(() => {
    if (!active) schedule();
  }, [active, schedule]);

  // ...and re-check as the page moves, so a tile that was queued behind
  // another still arms the moment it owns the middle of the screen. schedule()
  // returns immediately while a player is held, so this costs a comparison.
  useEffect(() => {
    if (!canAuto) return;
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
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [canAuto, schedule]);

  // ---- observer C: the live panel left the screen -> retire ----
  useEffect(() => {
    if (!active) return;
    const slug = active.slug;
    const el = frames.current.get(slug);
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) retire(slug);
      },
      // retire on leaving the CUE BAND, not the viewport: a trailer runs for
      // minutes and a reader passes the wall in seconds, so holding the
      // player until full exit means the tiles below never get their moment.
      // Each tile plays while it owns the middle of the screen, then hands on.
      { threshold: 0, rootMargin: "-30% 0px -30% 0px" },
    );
    io.observe(el);
    const onHide = () => {
      if (document.hidden) retire(slug);
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [active, retire]);

  // ---- the player: postMessage readout, watchdog, end pre-emption ----
  useEffect(() => {
    if (!active) return;
    const slug = active.slug;
    let started = false;
    let extended = false;
    // YouTube reports playerState only when it CHANGES; the ~4/sec ticks
    // that follow carry currentTime alone. So the state has to be latched —
    // testing it against the same message that carries the timecode means
    // the "wait until it is really moving" gate can never open.
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
      const { playerState, currentTime, duration } = d.info;

      // any signal at all means slow, not blocked
      if (!started && !extended) {
        extended = true;
        clearTimeout(watchdog);
        watchdog = setTimeout(() => {
          if (!started) retire(slug, "blocked");
        }, WATCHDOG_SLOW_MS - WATCHDOG_MS);
      }
      if (typeof playerState === "number") playing = playerState === 1;

      // hold the poster until the picture is genuinely moving: at 0:00 the
      // player still has its own chrome up (title bar, channel name), and
      // burning off the art any earlier shows the viewer YouTube's UI
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
        if (dur - currentTime <= 0.4) retire(slug);
      }
      if (playerState === 0) retire(slug);
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
  const playManual = (slug: string) => {
    played.current.add(slug);
    if (retiring.current) clearTimeout(retiring.current);
    if (dwellTimer.current) {
      clearTimeout(dwellTimer.current);
      dwellTimer.current = null;
    }
    setState(slug, "art");
    activeRef.current = { slug, manual: true };
    claimPlayer("slate");
    setActive({ slug, manual: true });
  };

  return (
    <section className="slate mx-auto max-w-[1320px] px-5 pt-12 sm:px-8">
      <h2 className="meta-caps text-mid">
        The slate <span className="text-faint">— {label}</span>
      </h2>

      <div className="slate-grid">
        {shows.map((s) => {
          const st = states[s.slug] ?? "art";
          const isActive = active?.slug === s.slug;
          const still = !s.youtubeId;
          const dur = durations.current.get(s.slug);
          const fitCover = Math.abs(s.width / s.height - 16 / 9) < 0.02;

          return (
            <article
              key={s.slug}
              className={`slate-panel${still ? " slate-panel--still" : ""}`}
              aria-labelledby={`slate-${s.slug}`}
            >
              <div className="slate-rule" aria-hidden="true">
                <i />
              </div>

              <h3 id={`slate-${s.slug}`} className="slate-title display-heavy">
                {s.title}
              </h3>

              <div
                className={`slate-frame${st === "live" ? " slate-frame-live" : ""}`}
                data-slug={s.slug}
                data-state={st}
                ref={(el) => {
                  if (el) frames.current.set(s.slug, el);
                  else frames.current.delete(s.slug);
                }}
              >
                {isActive && s.youtubeId && (
                  <div
                    className="slate-video absolute inset-0"
                    inert
                    aria-hidden="true"
                  >
                    <iframe
                      ref={iframe}
                      title=""
                      src={
                        `${ORIGIN}/embed/${s.youtubeId}` +
                        `?autoplay=1&mute=${active.manual ? 0 : 1}` +
                        `&controls=${active.manual ? 1 : 0}` +
                        `&disablekb=1&playsinline=1&rel=0&enablejsapi=1` +
                        `&origin=${encodeURIComponent(window.location.origin)}`
                      }
                      allow="autoplay; encrypted-media"
                      onLoad={handshake}
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  </div>
                )}

                <Image
                  src={`/projects/${s.slug}.jpg`}
                  alt={`${s.title}${s.credit ? ` — ${s.credit}` : ""}`}
                  fill
                  quality={82}
                  sizes="(min-width:1376px) 700px, (min-width:1024px) 52vw, (min-width:640px) 46vw, 100vw"
                  className={`slate-art ${fitCover ? "object-cover" : "object-contain"} ${
                    still ? "slate-art--push" : "slate-art--settle"
                  }`}
                />
                <div className="grain slate-grain" aria-hidden="true" />
                <div className="slate-gate" aria-hidden="true">
                  <i />
                  <i />
                </div>
              </div>

              <div className="slate-stub">
                {s.credit && (
                  <p className="slate-credit text-cap slate-beat slate-beat-2">
                    {s.credit}
                  </p>
                )}
                <p className="slate-proof meta-caps slate-beat slate-beat-3">
                  <Proof proof={s.proof} />
                </p>

                <div className="slate-transport slate-beat slate-beat-4">
                  <p
                    className="slate-state meta-caps"
                    ref={(el) => {
                      if (el) lines.current.set(s.slug, el);
                      else lines.current.delete(s.slug);
                    }}
                  >
                    {still
                      ? "Still"
                      : (st === "played" || st === "blocked") && dur
                        ? `Trailer · ${clock(dur)}`
                        : "Trailer · Muted"}
                  </p>

                  <div className="slate-rail" aria-hidden="true">
                    {!still && (
                      <i
                        ref={(el) => {
                          if (el) fills.current.set(s.slug, el);
                          else fills.current.delete(s.slug);
                        }}
                      />
                    )}
                  </div>

                  <div className="slate-control">
                    {!still && st === "live" && !active?.manual && (
                      <button
                        type="button"
                        className="slate-btn meta-caps"
                        onClick={() => retire(s.slug)}
                      >
                        Stop
                      </button>
                    )}
                    {!still && (st === "played" || st === "blocked") && (
                      <button
                        type="button"
                        className="slate-btn meta-caps"
                        onClick={() => playManual(s.slug)}
                      >
                        Replay
                      </button>
                    )}
                    {!still && st === "art" && !canAuto && !isActive && (
                      <button
                        type="button"
                        className="slate-btn meta-caps"
                        onClick={() => playManual(s.slug)}
                      >
                        Play trailer
                      </button>
                    )}
                  </div>
                </div>

                {s.trailer && (
                  <a
                    className="slate-out meta-caps slate-beat slate-beat-5"
                    href={s.trailer}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {still
                      ? "Watch on Facebook"
                      : "Watch the trailer on YouTube"}{" "}
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="slate-close" aria-hidden="true" />
    </section>
  );
}
