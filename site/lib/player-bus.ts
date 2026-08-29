/**
 * One player on the page, guaranteed.
 *
 * The hero and the slate each mount their own YouTube embed, and geometry
 * alone cannot keep them apart: the hero is still a third on screen when
 * the slate's first frame reaches the cue band, so any rootMargin tuned to
 * close that window either fires too early (killing the hero while it is
 * plainly visible) or too late (two players decoding at once).
 *
 * So they coordinate instead of guessing. Claiming the player evicts
 * whoever held it; the previous holder is told and unmounts.
 */

type Listener = (owner: string | null) => void;

const listeners = new Set<Listener>();
let owner: string | null = null;

/** Take the player. Any other holder is notified and must unmount. */
export function claimPlayer(id: string) {
  if (owner === id) return;
  owner = id;
  listeners.forEach((l) => l(owner));
}

/** Give it up, if we still hold it. */
export function releasePlayer(id: string) {
  if (owner !== id) return;
  owner = null;
  listeners.forEach((l) => l(owner));
}

/** Subscribe to ownership changes. Returns an unsubscribe. */
export function onPlayerChange(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
