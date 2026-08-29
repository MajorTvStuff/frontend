"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/reveal";

/**
 * Wraps a static section in the site's one reveal mechanism, so a server
 * component can opt into it without becoming a client component itself.
 * Children stream through untouched; only the wrapper element is a client
 * boundary, and all of the copy inside still renders on the server.
 */
export function Reveal({
  as: Tag = "section",
  className,
  children,
}: {
  as?: "section" | "div" | "footer";
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useReveal(ref);
  return (
    <Tag
      ref={ref as React.RefObject<HTMLElement & HTMLDivElement>}
      data-reveal="pending"
      className={className}
    >
      {children}
    </Tag>
  );
}
