import data from "./data/aria.json";
import seo from "./data/seo.json";
import type { CaseCopy } from "./caseStudy";
import { checked } from "./json";
import type { Locale } from "./types";

/** ARIA case study texts, edited in data/aria.json (admin: ARIA). */
export const aria: Record<Locale, CaseCopy> = {
  es: checked<CaseCopy>(data.es),
  en: checked<CaseCopy>(data.en),
};

/** The tab title is the same one search results show. */
export const ariaTitles: Record<Locale, string> = { es: seo.ariaPages.es.title, en: seo.ariaPages.en.title };
