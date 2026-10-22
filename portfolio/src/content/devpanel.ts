import data from "./data/devpanel.json";
import seo from "./data/seo.json";
import type { CaseCopy } from "./caseStudy";
import { checked } from "./json";
import type { Locale } from "./types";

/** DevPanel case study texts, edited in data/devpanel.json (admin: DevPanel). */
export const devpanel: Record<Locale, CaseCopy> = {
  es: checked<CaseCopy>(data.es),
  en: checked<CaseCopy>(data.en),
};

export const devpanelTitles: Record<Locale, string> = {
  es: seo.devpanelPages.es.title,
  en: seo.devpanelPages.en.title,
};
