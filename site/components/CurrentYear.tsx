"use client";

import { useEffect, useState } from "react";

/**
 * The copyright year, kept current.
 *
 * The site is built once and served as files, so a year written at build
 * time would stay the year it was built in for as long as nobody rebuilt it.
 * The server writes the build year; the visitor's own clock replaces it once
 * the page runs. Starting from the build year rather than reading the clock
 * straight away keeps the first render identical to the server's, so the
 * page hydrates without a mismatch.
 */
export function CurrentYear({ built }: { built: number }) {
  const [year, setYear] = useState(built);
  useEffect(() => {
    const now = new Date().getFullYear();
    if (now !== built) setYear(now);
  }, [built]);
  return <>{year}</>;
}
