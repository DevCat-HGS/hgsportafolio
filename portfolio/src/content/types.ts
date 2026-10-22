export type Locale = "en" | "es";

/** Single source of truth for the chapter order: drives the rail, the scroll scene and the section anchors. */
export const CHAPTER_IDS = [
  "intro",
  "practice",
  "startup",
  "tenure",
  "selected",
  "credentials",
  "stack",
  "close",
] as const;

export type ChapterId = (typeof CHAPTER_IDS)[number];

export interface Chapter {
  id: ChapterId;
  n: string;
  label: string;
}

export interface Project {
  id: string;
  tag: string;
  title: string;
  dek: string;
  /** Short, factual outcome label. Only state what is true; add real metrics here when available. */
  result: string;
  stack: readonly string[];
  /** Screenshot path under /public. When absent the card shows a generated cover. */
  shot?: string;
  alt?: string;
  /** Live site. When present the whole card is a link. */
  href?: string;
  /** Path of the project's case study on this site (/aria/ or /en/aria/). */
  caseHref?: string;
  /** Public repository with the project's code. */
  codeHref?: string;
  /** The live site is down on the client's side: the card stops linking and says so, the screenshot stays. */
  offline?: boolean;
  client?: string;
  clientHref?: string;
  /** Marks work built for an institution (shown with a different label). */
  institutional?: boolean;
  logo?: string;
  /** Hue for the generated cover. */
  hue?: number;
  /** Always visible; the rest wait behind "see more projects". */
  featured?: boolean;
  /** My own product: shown first, as a band of its own, instead of in the client grid. */
  own?: boolean;
  /** Highlights of an own product's band. */
  points?: readonly string[];
  /** Where to download an own product, when it is an app. */
  downloadHref?: string;
}

export interface CredItem {
  img: string;
  title: string;
  meta: string;
}

export interface CredGroup {
  k: string;
  /** Renders as a compact list instead of a thumbnail grid. */
  compact?: boolean;
  items: readonly CredItem[];
}

export interface Pair {
  k: string;
  v: string;
}

export interface Duty extends Pair {
  n: string;
}

export interface Beat {
  n: string;
  title: string;
  body: string;
}

export interface StackGroup extends Pair {
  id: string;
  /** Tecnologías con las que he trabajado pero que no son el foco: se muestran en segundo plano. */
  secondary?: boolean;
}

export interface Link {
  label: string;
  href: string;
}

export interface Stat {
  n: string;
  l: string;
}

/** Everything a visitor can read. Both languages must satisfy this shape, so a missing key fails the build. */
export interface Copy {
  skip: string;
  wordmark: string;
  langLabel: string;
  chapters: readonly Chapter[];
  heroKicker: string;
  heroName: readonly [string, string];
  heroDek: string;
  heroNow: string;
  heroOpen: string;
  heroMeta: readonly string[];
  heroStats: readonly Stat[];
  resultLabel: string;
  scroll: string;
  marquee: string;
  mapLabel: string;
  issue: string;
  practiceEyebrow: string;
  practiceTitle: string;
  practiceBody: string;
  practiceAside: string;
  portraitAlt: string;
  bento: readonly Pair[];
  startupEyebrow: string;
  startupCompany: string;
  startupRole: string;
  startupPeriod: string;
  startupStatus: string;
  startupBody: string;
  startupDuties: readonly Duty[];
  startupLinks: { web: string; play: string; apple: string };
  startupWeb: string;
  /** Button to the MIGOZZ case study page, in this language. */
  startupCase: { label: string; href: string };
  startupStack: readonly string[];
  tenureEyebrow: string;
  tenureStatus: string;
  tenureCompany: string;
  tenureRole: string;
  tenurePlace: string;
  tenureBeats: readonly Beat[];
  selectedEyebrow: string;
  selectedTitle: string;
  selectedLead: string;
  projects: readonly Project[];
  projectsMore: string;
  projectsLess: string;
  credEyebrow: string;
  credTitle: string;
  credLead: string;
  credGroups: readonly CredGroup[];
  credView: string;
  credViewShort: string;
  credClose: string;
  stackEyebrow: string;
  stackTitle: string;
  stackGroups: readonly StackGroup[];
  stackView: string;
  stackHide: string;
  closeEyebrow: string;
  closeTitle: string;
  closeBody: string;
  email: string;
  contactForm: {
    title: string;
    name: string;
    email: string;
    message: string;
    submit: string;
    sending: string;
    sent: string;
    error: string;
  };
  links: readonly Link[];
  footer: string;
  visit: string;
  offline: string;
  /** Link from a project card to its case study. */
  caseLink: string;
  /** Link from a project card to its public repository. */
  codeLink: string;
  /** Home page band that promotes DevPanel, my own open-source project. */
  /** Subsection of my own products, shown before the client work. */
  ownTitle: string;
  ownLead: string;
  /** Subsection of the work for clients and institutions. */
  clientTitle: string;
  /** Download button of an own product that is an app. */
  downloadLabel: string;
  cv: { label: string; href: string };
  clientLabel: string;
  institutionalLabel: string;
  trademarkNote: string;
  githubRepos: string;
  githubLanguages: string;
  githubLastPush: string;
}

export interface Tech {
  n: string;
  /** Icon file name (without extension) under /public/icons. Omit when there is no icon. */
  i?: string;
}
