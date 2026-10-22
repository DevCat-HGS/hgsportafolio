import seo from "../src/content/data/seo.json";
import { checked as as } from "../src/content/json";

export type PageLocale = "es" | "en";

export const LOCALES: readonly PageLocale[] = ["es", "en"];
export const DEFAULT_LOCALE: PageLocale = "es";

/**
 * Each page exists in every language: home at / and /en/, and each case study at /<id>/ and /en/<id>/ (MIGOZZ and
 * ARIA, DevPanel, Portafolio). A new case study is a new id here, an entry in SUBPAGES and its own <id>/index.html.
 */
export type PageId = "home" | "migozz" | "aria" | "devpanel" | "portafolio";
export type SubpageId = Exclude<PageId, "home">;
export const PAGE_IDS: readonly PageId[] = ["home", "migozz", "aria", "devpanel", "portafolio"];
export const SUBPAGE_IDS: readonly SubpageId[] = ["migozz", "aria", "devpanel", "portafolio"];

/** Site identity, links and Search Console tokens. Edited in src/content/data/seo.json (admin: SEO). */
export const SITE = seo.site;

export interface PageCopy {
  lang: PageLocale;
  ogLocale: string;
  ogAlternate: string;
  title: string;
  description: string;
  ogDescription: string;
  twitterDescription: string;
  ogImageAlt: string;
  jobTitle: string;
  about: string;
  /** Text kept in the HTML for crawlers and readers without JavaScript. */
  fallback: { heading: string; paragraph: string; projects: string; linkedin: string; github: string };
}

export const PAGES: Record<PageLocale, PageCopy> = { es: as<PageCopy>(seo.pages.es), en: as<PageCopy>(seo.pages.en) };

/** <head> copy and crawler fallback of a case study. Shares the Open Graph locales of the home page. */
export interface SubpageCopy {
  title: string;
  description: string;
  ogDescription: string;
  ogImageAlt: string;
  fallback: { heading: string; paragraph: string; site: string; back: string };
}

export const MIGOZZ_PAGES: Record<PageLocale, SubpageCopy> = {
  es: as<SubpageCopy>(seo.migozzPages.es),
  en: as<SubpageCopy>(seo.migozzPages.en),
};

export const ARIA_PAGES: Record<PageLocale, SubpageCopy> = {
  es: as<SubpageCopy>(seo.ariaPages.es),
  en: as<SubpageCopy>(seo.ariaPages.en),
};

export const DEVPANEL_PAGES: Record<PageLocale, SubpageCopy> = {
  es: as<SubpageCopy>(seo.devpanelPages.es),
  en: as<SubpageCopy>(seo.devpanelPages.en),
};

export const PORTAFOLIO_PAGES: Record<PageLocale, SubpageCopy> = {
  es: as<SubpageCopy>(seo.portafolioPages.es),
  en: as<SubpageCopy>(seo.portafolioPages.en),
};

/** What each case study is about: its copy, the product it describes and where that product lives. */
export interface Subpage {
  copy: Record<PageLocale, SubpageCopy>;
  /** Short name for the breadcrumb. */
  name: string;
  /** Link in the crawler fallback: the product, or the client that owns it. */
  siteUrl: string;
  /** schema.org node of the product, without @id (render.ts adds it). */
  about: Record<string, unknown>;
  /** How I relate to the product in schema.org: my own project, or one I worked on in a team. */
  relation: "author" | "contributor";
}

export const SUBPAGES: Record<SubpageId, Subpage> = {
  migozz: { copy: MIGOZZ_PAGES, name: "MIGOZZ", siteUrl: seo.site.migozz.url, about: {}, relation: "contributor" },
  aria: {
    copy: ARIA_PAGES,
    name: "ARIA",
    siteUrl: "https://arixgroup.com.co/",
    about: {
      "@type": "SoftwareApplication",
      name: "ARIA",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "es",
      creator: { "@type": "Organization", name: "Arix Group", url: "https://arixgroup.com.co/" },
    },
    relation: "contributor",
  },
  devpanel: {
    copy: DEVPANEL_PAGES,
    name: "DevPanel",
    siteUrl: "https://github.com/DevCat-HGS/DevPanel",
    about: {
      "@type": "SoftwareApplication",
      name: "DevPanel",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Windows",
      inLanguage: ["es", "en"],
      license: "https://opensource.org/licenses/MIT",
      downloadUrl: "https://github.com/DevCat-HGS/DevPanel/releases/tag/installer",
      sameAs: "https://github.com/DevCat-HGS/DevPanel",
    },
    relation: "author",
  },
  portafolio: {
    copy: PORTAFOLIO_PAGES,
    name: "Portafolio HGS",
    // The fallback links the docs; the code is in the public mirror (sameAs).
    siteUrl: "https://docs.hgsportafolio.site",
    about: {
      "@type": "WebApplication",
      name: "Portafolio HGS",
      inLanguage: ["es", "en"],
      url: "https://hgsportafolio.site/",
      sameAs: "https://github.com/DevCat-HGS/hgsportafolio",
      subjectOf: { "@type": "TechArticle", name: "Documentación técnica", url: "https://docs.hgsportafolio.site" },
    },
    relation: "author",
  },
};
