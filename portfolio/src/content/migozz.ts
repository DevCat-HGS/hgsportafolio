import data from "./data/migozz.json";
import { checked } from "./json";
import type { Locale } from "./types";

/** Line icons drawn by components/MzIcon.tsx. */
export type MzIconName =
  | "download"
  | "devices"
  | "link"
  | "languages"
  | "calendar"
  | "card"
  | "users"
  | "gift"
  | "cards"
  | "chat"
  | "badge"
  | "cash";

/**
 * One public figure with where it comes from, so every number on the page can be checked. `count` makes the number
 * count up when it scrolls into view; figures without it (dates) just fade in.
 */
export interface Metric {
  n: string;
  count?: number;
  suffix?: string;
  label: string;
  source: string;
  icon: MzIconName;
}

export interface Feature {
  k: string;
  v: string;
  icon?: MzIconName;
}

/** A dated, public milestone. */
export interface Milestone {
  date: string;
  k: string;
  v: string;
}

/** Phone screenshot under /public/migozz. Empty until the real captures are added; the gallery hides itself. */
export interface Shot {
  src: string;
  alt: string;
  caption: string;
}

export interface MigozzCopy {
  title: string;
  back: string;
  langLabel: string;
  langAria: string;
  status: string;
  tagline: string;
  lede: string;
  orbitLabel: string;
  metricsTitle: string;
  metricsNote: string;
  metrics: readonly Metric[];
  flowTitle: string;
  flowStep: string;
  flow: readonly Feature[];
  problemTitle: string;
  problem: readonly string[];
  solutionTitle: string;
  solution: string;
  featuresTitle: string;
  features: readonly Feature[];
  networksTitle: string;
  timelineTitle: string;
  timeline: readonly Milestone[];
  shotsTitle: string;
  shots: readonly Shot[];
  roleTitle: string;
  role: string;
  period: string;
  duties: readonly Feature[];
  stack: readonly string[];
  visit: string;
  footer: string;
}

/** Store and web links of MIGOZZ, shared by both languages. */
export const migozzLinks = data.links;

// Figures on the page are public (Google Play, the App Store, migozz.com): note the check date when updating them.
export const migozz: Record<Locale, MigozzCopy> = {
  es: checked<MigozzCopy>(data.es),
  en: checked<MigozzCopy>(data.en),
};

export const migozzTitles: Record<Locale, string> = { es: migozz.es.title, en: migozz.en.title };
