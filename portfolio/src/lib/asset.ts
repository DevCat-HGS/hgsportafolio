/**
 * URL of a file in /public. The English page lives at /en/, so relative paths like "shots/a.webp" would resolve
 * to /en/shots/a.webp; this always resolves from the site root.
 */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
