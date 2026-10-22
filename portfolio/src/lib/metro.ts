import type { CSSProperties } from "react";

/** Cada proyecto es una línea del metro: letra y color propios. */
export const METRO_LINES = [
  { letter: "A", color: "#00794f" },
  { letter: "B", color: "#c2410c" },
  { letter: "K", color: "#1c6dd0" },
  { letter: "J", color: "#a61e8c" },
  { letter: "L", color: "#0b7285" },
  { letter: "H", color: "#c92a2a" },
  { letter: "M", color: "#5f3dc4" },
  { letter: "P", color: "#b45309" },
] as const;

export const lineStyle = (i: number) =>
  ({ ["--lc" as string]: METRO_LINES[i % METRO_LINES.length].color }) as CSSProperties;

export const stagger = (i: number) => ({ ["--i" as string]: i }) as CSSProperties;
