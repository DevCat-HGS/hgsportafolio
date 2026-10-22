import { CONTACT_ORIGIN } from "../src/lib/endpoints";

/**
 * Security headers, defined once. vite.config.ts serves them from `vite preview` (so the tests see them) and writes
 * them to dist/_headers for Netlify. Cache headers stay in netlify.toml.
 */
/**
 * Umami Cloud: cookieless analytics, no consent banner needed. Off unless VITE_UMAMI_WEBSITE_ID is set at build time
 * (Netlify → Site configuration → Environment variables); only then is its origin allowed by the policy.
 */
export const UMAMI_SCRIPT = "https://cloud.umami.is/script.js";
// The script loads from cloud.umami.is and sends events to gateway.umami.is (api-gateway.umami.dev is the older host).
const UMAMI_ORIGINS = ["https://cloud.umami.is", "https://gateway.umami.is", "https://api-gateway.umami.dev"];
// Only the UUID is kept, so pasting Umami's whole <script> snippet into the variable still yields a valid tag.
export const umamiId = (env: Record<string, string | undefined> = process.env) =>
  env.VITE_UMAMI_WEBSITE_ID?.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0] ?? "";

export function buildCsp(analytics: boolean): string {
  const extra = analytics ? ` ${UMAMI_ORIGINS.join(" ")}` : "";
  return [
    "default-src 'self'",
    // No inline scripts: the welcome-screen script lives in /splash.js.
    `script-src 'self'${analytics ? ` ${UMAMI_ORIGINS[0]}` : ""}`,
    // The inline <style> blocks in index.html and React style attributes need 'unsafe-inline'.
    "style-src 'self' 'unsafe-inline'",
    // data: is for the SVG grain texture in the stylesheet.
    "img-src 'self' data:",
    "font-src 'self'",
    // The contact form posts to the admin site, which sends the emails.
    `connect-src 'self' ${CONTACT_ORIGIN}${extra}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

export const CSP = buildCsp(Boolean(umamiId()));

export const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": CSP,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

export const renderHeadersFile = (): string =>
  `/*\n${Object.entries(SECURITY_HEADERS)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join("\n")}\n`;
