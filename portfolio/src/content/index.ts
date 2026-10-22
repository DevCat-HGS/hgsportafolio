import { en } from "./en";
import { es } from "./es";
import type { Copy, Locale } from "./types";

export const copy: Record<Locale, Copy> = { en, es };

export { stackTech } from "./stack";
export { CHAPTER_IDS } from "./types";
export type { ChapterId, Copy, CredItem, Link, Locale, Project } from "./types";
