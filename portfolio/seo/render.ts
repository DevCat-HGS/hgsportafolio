import {
  DEFAULT_LOCALE,
  LOCALES,
  PAGE_IDS,
  PAGES,
  SITE,
  SUBPAGE_IDS,
  SUBPAGES,
  type PageId,
  type PageLocale,
} from "./pages";
import projectData from "../src/content/data/projects.json";
import { projectsFrom, type ProjectEntry } from "../src/content/projects";

/** Path of a page in a language, relative to the site root. Spanish is the default and has no prefix. */
export const pagePath = (locale: PageLocale, page: PageId = "home") =>
  `${locale === DEFAULT_LOCALE ? "" : `${locale}/`}${page === "home" ? "" : `${page}/`}`;

/** Absolute URL of a page, or "" when the site address is not known (local builds). */
export const pageUrl = (base: string, locale: PageLocale, page: PageId = "home") =>
  base ? `${base}${pagePath(locale, page)}` : "";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export const HEAD_START = "<!--seo-head-->";
export const HEAD_END = "<!--/seo-head-->";
export const BODY_START = "<!--seo-body-->";
export const BODY_END = "<!--/seo-body-->";

/**
 * schema.org graph: the person, the MIGOZZ app and, when the site address is known, the website and this profile page
 * (home) or the case study page with its breadcrumb.
 */
export function structuredData(locale: PageLocale, base: string, pageId: PageId = "home"): object {
  const page = PAGES[locale];
  const url = pageUrl(base, locale, pageId);
  const person = {
    "@type": "Person",
    "@id": `${base}#person`,
    name: SITE.name,
    givenName: "Harol",
    familyName: "Guerrero Salgado",
    alternateName: ["Harol G. Salgado", "Harol Salgado", "Harol Guerrero", "DevCat-HGS"],
    jobTitle: page.jobTitle,
    description: page.about,
    sameAs: [SITE.linkedin, SITE.github],
    knowsAbout: [
      "JavaScript",
      "TypeScript",
      "Python",
      "React",
      "Next.js",
      "Node.js",
      "Flutter",
      "Firebase",
      "AWS",
      "PostgreSQL",
      "MongoDB",
      "Docker",
      "SAP Fiori",
    ],
    knowsLanguage: ["es", "en"],
    worksFor: { "@type": "Organization", name: "MIGOZZ", url: SITE.migozz.url },
    alumniOf: { "@type": "EducationalOrganization", name: "SENA - Servicio Nacional de Aprendizaje" },
    address: { "@type": "PostalAddress", addressLocality: "Medellín", addressCountry: "CO" },
    ...(base ? { url: base, image: `${base}portrait/harol.webp` } : {}),
  };

  const migozz = {
    "@type": "SoftwareApplication",
    "@id": `${base}#migozz`,
    name: "MIGOZZ",
    applicationCategory: "SocialNetworkingApplication",
    operatingSystem: "Android, iOS, Web",
    url: SITE.migozz.url,
    installUrl: [SITE.migozz.play, SITE.migozz.apple],
    inLanguage: ["es", "en"],
    author: { "@id": `${base}#person` },
  };

  const graph: object[] = [person, migozz];
  if (base && pageId !== "home") {
    const subpage = SUBPAGES[pageId];
    const sub = subpage.copy[locale];
    const aboutId = `${base}#${pageId}`;
    // MIGOZZ is already in the graph; any other product gets its node here, with me as its author or a contributor.
    if (pageId !== "migozz")
      graph.push({ ...subpage.about, "@id": aboutId, [subpage.relation]: { "@id": `${base}#person` } });
    graph.push(
      {
        "@type": "WebPage",
        "@id": `${url}#page`,
        url,
        name: sub.title,
        description: sub.description,
        inLanguage: locale,
        about: { "@id": aboutId },
        author: { "@id": `${base}#person` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE.name, item: pageUrl(base, locale) },
          { "@type": "ListItem", position: 2, name: subpage.name, item: url },
        ],
      },
    );
  } else if (base) {
    graph.push(
      {
        "@type": "WebSite",
        "@id": `${base}#website`,
        url: base,
        name: SITE.name,
        alternateName: [`${SITE.name} — Portfolio`, "Harol Guerrero", "DevCat-HGS"],
        inLanguage: [...LOCALES],
        publisher: { "@id": `${base}#person` },
      },
      {
        "@type": "ProfilePage",
        "@id": `${url}#profile`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: locale,
        isPartOf: { "@id": `${base}#website` },
        mainEntity: { "@id": `${base}#person` },
        primaryImageOfPage: { "@type": "ImageObject", url: `${base}og.png`, width: 1200, height: 630 },
      },
    );
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

/** Everything that goes in <head> and depends on the language and the site address. */
export function renderHead(locale: PageLocale, base: string, pageId: PageId = "home"): string {
  const home = PAGES[locale];
  const sub = pageId === "home" ? null : SUBPAGES[pageId].copy[locale];
  const p = sub ? { ...home, ...sub, twitterDescription: sub.ogDescription } : home;
  const url = pageUrl(base, locale, pageId);
  const image = `${base}og.png`;
  const alternates = base
    ? [
        ...LOCALES.map((l) => `    <link rel="alternate" hreflang="${l}" href="${pageUrl(base, l, pageId)}" />`),
        `    <link rel="alternate" hreflang="x-default" href="${pageUrl(base, DEFAULT_LOCALE, pageId)}" />`,
      ]
    : [];
  const lines = [
    HEAD_START,
    `    <title>${esc(p.title)}</title>`,
    `    <meta name="description" content="${esc(p.description)}" />`,
    `    <meta name="author" content="${esc(SITE.author)}" />`,
    ...SITE.verification.map((v) => `    <meta name="google-site-verification" content="${v}" />`),
    `    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />`,
    ...(base ? [`    <link rel="canonical" href="${url}" />`] : []),
    ...alternates,
    `    <meta property="og:type" content="website" />`,
    `    <meta property="og:site_name" content="${esc(SITE.name)}" />`,
    `    <meta property="og:locale" content="${p.ogLocale}" />`,
    `    <meta property="og:locale:alternate" content="${p.ogAlternate}" />`,
    ...(base ? [`    <meta property="og:url" content="${url}" />`] : []),
    `    <meta property="og:title" content="${esc(p.title)}" />`,
    `    <meta property="og:description" content="${esc(p.ogDescription)}" />`,
    `    <meta property="og:image" content="${image}" />`,
    `    <meta property="og:image:width" content="1200" />`,
    `    <meta property="og:image:height" content="630" />`,
    `    <meta property="og:image:alt" content="${esc(p.ogImageAlt)}" />`,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${esc(p.title)}" />`,
    `    <meta name="twitter:description" content="${esc(p.twitterDescription)}" />`,
    `    <meta name="twitter:image" content="${image}" />`,
    `    <script type="application/ld+json">${JSON.stringify(structuredData(locale, base, pageId))}</script>`,
    HEAD_END,
  ];
  return lines.join("\n");
}

/** Text kept inside #root so crawlers and readers without JavaScript still get the essentials. */
export function renderFallback(locale: PageLocale, pageId: PageId = "home"): string {
  if (pageId !== "home") {
    const f = SUBPAGES[pageId].copy[locale].fallback;
    return [
      BODY_START,
      "      <main>",
      `        <h1>${esc(f.heading)}</h1>`,
      `        <p>${esc(f.paragraph)}</p>`,
      "        <ul>",
      `          <li><a href="${SUBPAGES[pageId].siteUrl}">${esc(f.site)}</a></li>`,
      `          <li><a href="/${pagePath(locale)}">${esc(f.back)}</a></li>`,
      "        </ul>",
      "      </main>",
      BODY_END,
    ].join("\n");
  }
  const f = PAGES[locale].fallback;
  // One line per project, so a crawler or an AI reading the bare HTML sees the same work a visitor does.
  const projects = projectsFrom(projectData.projects as ProjectEntry[], locale).map((p) => {
    const link = p.caseHref ?? p.href ?? p.codeHref;
    const name = link ? `<a href="${esc(link)}">${esc(p.title)}</a>` : `<strong>${esc(p.title)}</strong>`;
    return `          <li>${name}: ${esc(p.dek)}</li>`;
  });
  return [
    BODY_START,
    "      <main>",
    `        <h1>${esc(f.heading)}</h1>`,
    `        <p>${esc(f.paragraph)}</p>`,
    `        <h2>${esc(f.projects)}</h2>`,
    "        <ul>",
    ...projects,
    "        </ul>",
    "        <ul>",
    `          <li><a href="${SITE.linkedin}">${esc(f.linkedin)}</a></li>`,
    `          <li><a href="${SITE.github}">${esc(f.github)}</a></li>`,
    ...SUBPAGE_IDS.map(
      (id) =>
        `          <li><a href="/${pagePath(locale, id)}">${esc(SUBPAGES[id].copy[locale].fallback.heading)}</a></li>`,
    ),
    "        </ul>",
    "      </main>",
    BODY_END,
  ].join("\n");
}

const SPLASH: Record<PageLocale, { hello: string; loading: string }> = {
  es: { hello: "Bienvenido", loading: "Cargando…" },
  en: { hello: "Welcome", loading: "Loading…" },
};

/** Builds the page for a language out of the Spanish one Vite produced, swapping only the marked blocks. */
export function localizeHtml(html: string, locale: PageLocale, base: string, pageId: PageId = "home"): string {
  const between = (start: string, end: string, replacement: string, source: string) => {
    const a = source.indexOf(start);
    const b = source.indexOf(end);
    if (a === -1 || b === -1) throw new Error(`Missing ${start} markers in index.html`);
    return source.slice(0, a) + replacement + source.slice(b + end.length);
  };
  let out = between(HEAD_START, HEAD_END, renderHead(locale, base, pageId), html);
  out = between(BODY_START, BODY_END, renderFallback(locale, pageId), out);
  // Welcome screen text as served, before splash.js runs: what crawlers without JavaScript read first.
  const splash = SPLASH[locale];
  out = out
    .replace(/(id="splash-hello">)[^<]*/, `$1${splash.hello}`)
    .replace(/(id="splash-sub">)[^<]*/, `$1${splash.loading}`);
  return out.replace(/<html lang="[a-z-]+"/, `<html lang="${locale}"`);
}

/** lastmod, when given (YYYY-MM-DD), tells crawlers when the content last changed so they recrawl it sooner. */
export function renderSitemap(base: string, lastmod?: string): string {
  const entries = PAGE_IDS.flatMap((pageId) =>
    LOCALES.map((l) => {
      const links = [
        ...LOCALES.map(
          (alt) => `    <xhtml:link rel="alternate" hreflang="${alt}" href="${pageUrl(base, alt, pageId)}" />`,
        ),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl(base, DEFAULT_LOCALE, pageId)}" />`,
      ].join("\n");
      const priority = pageId === "home" ? (l === DEFAULT_LOCALE ? "1.0" : "0.9") : "0.7";
      const date = lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : "";
      return `  <url>\n    <loc>${pageUrl(base, l, pageId)}</loc>\n${links}\n${date}    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    }),
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries}\n</urlset>\n`;
}

export function renderRobots(base: string): string {
  return `User-agent: *\nAllow: /\n${base ? `\nSitemap: ${base}sitemap.xml\n` : ""}`;
}
