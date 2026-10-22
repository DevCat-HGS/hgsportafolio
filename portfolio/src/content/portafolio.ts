import data from "./data/portafolio.json";
import seo from "./data/seo.json";
import type { CaseCopy } from "./caseStudy";
import { checked } from "./json";
import type { Locale } from "./types";

/** Case study of this portfolio, edited in data/portafolio.json (admin: Portafolio). */
export const portafolio: Record<Locale, CaseCopy> = {
  es: checked<CaseCopy>(data.es),
  en: checked<CaseCopy>(data.en),
};

export const portafolioTitles: Record<Locale, string> = {
  es: seo.portafolioPages.es.title,
  en: seo.portafolioPages.en.title,
};
