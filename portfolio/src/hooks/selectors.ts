/**
 * Class names the hooks rely on. They are defined in the stylesheet (see styles/), so keep both in sync:
 * a renamed class that is still listed here would silently stop animating.
 */
export const SELECTORS = {
  line: ".line",
  marquee: ".marquee",
  reveal: ".section-head, .bento .card, .duties .card, .beat, .project, .cred, .cred-list li, .unit, .legal",
  spotlight: ".duties .card, .unit",
} as const;
