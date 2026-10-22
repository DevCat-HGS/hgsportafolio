/** Shape shared by every case study page (ARIA, DevPanel): data/<id>.json holds one of these per language. */

export interface Point {
  k: string;
  v: string;
}

/** A measured figure with the context that makes it honest (what it was compared with, how it was measured). */
export interface Figure {
  n: string;
  label: string;
  note: string;
}

/** One stop of a line on the architecture map. `transfer` marks the stop both lines share. */
export interface Stop extends Point {
  transfer?: boolean;
}

export interface Line {
  name: string;
  /** Site colour the line is drawn with: the metro green or the signal yellow. */
  color: "metro" | "signal";
  stops: readonly Stop[];
}

/** A call to action in the hero, such as the code or a download. */
export interface CaseLink {
  label: string;
  href: string;
  /** Umami event name for the click. */
  event: string;
}

/** A screenshot under /public, with the -480 variant `npm run images` makes next to it. */
export interface CaseShot {
  src: string;
  alt: string;
  caption: string;
}

/** A silent explainer video under /public, with its poster and a transcript for anyone who cannot or will not play it. */
export interface CaseVideo {
  title: string;
  src: string;
  poster: string;
  caption: string;
  transcriptLabel: string;
  transcript: readonly string[];
}

export interface CaseCopy {
  back: string;
  langLabel: string;
  langAria: string;
  kicker: string;
  tagline: string;
  lede: string;
  meta: readonly string[];
  links?: readonly CaseLink[];
  video?: CaseVideo;
  numbersTitle: string;
  numbers: readonly Figure[];
  problemTitle: string;
  problem: readonly string[];
  solutionTitle: string;
  solution: string;
  shotsTitle?: string;
  shots?: readonly CaseShot[];
  mapTitle: string;
  mapLead: string;
  transfer: string;
  lines: readonly Line[];
  decisionsTitle: string;
  decisions: readonly Point[];
  brokeTitle: string;
  broke: readonly Point[];
  roleTitle: string;
  role: string;
  period: string;
  duties: readonly Point[];
  /** Who built what, when the project was a team effort. */
  teamNote?: string;
  nextTitle: string;
  next: readonly string[];
  stack: readonly string[];
  footer: string;
}
