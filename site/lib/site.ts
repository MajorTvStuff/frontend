export const SITE_URL = "https://www.majorcontent.com";

/**
 * REVIEW CHROME — the "Beta MVP" watermark. It is a tool for reviewing the
 * build with the client, not part of the site, so it is on by default here
 * and off in anything built for a host: NEXT_PUBLIC_REVIEW=false.
 */
export const REVIEW = process.env.NEXT_PUBLIC_REVIEW !== "false";

/** Amber "confirm with client" chips render unless explicitly disabled. */
export const SHOW_TODOS = process.env.NEXT_PUBLIC_SHOW_TODOS !== "false";
