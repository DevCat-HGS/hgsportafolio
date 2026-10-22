import { describe, expect, it } from "vitest";
import { buildCsp, CSP, renderHeadersFile, SECURITY_HEADERS, umamiId } from "../seo/headers";
import { ARIA_PAGES, DEVPANEL_PAGES, LOCALES, MIGOZZ_PAGES, PAGE_IDS, PAGES, PORTAFOLIO_PAGES } from "../seo/pages";
import {
  BODY_END,
  BODY_START,
  HEAD_END,
  HEAD_START,
  localizeHtml,
  pagePath,
  pageUrl,
  renderFallback,
  renderHead,
  renderRobots,
  renderSitemap,
  structuredData,
} from "../seo/render";

const BASE = "https://example.test/";

describe("page copy", () => {
  it.each(LOCALES)("keeps the %s title and description at search-result length", (locale) => {
    expect(PAGES[locale].title.length).toBeLessThanOrEqual(70);
    expect(PAGES[locale].description.length).toBeLessThanOrEqual(165);
    expect(PAGES[locale].description.length).toBeGreaterThanOrEqual(100);
  });

  it("gives each language its own title and description", () => {
    expect(PAGES.es.title).not.toBe(PAGES.en.title);
    expect(PAGES.es.description).not.toBe(PAGES.en.description);
  });
});

describe("head", () => {
  it("points the canonical and og:url at the page itself", () => {
    expect(renderHead("es", BASE)).toContain(`<link rel="canonical" href="${BASE}" />`);
    expect(renderHead("en", BASE)).toContain(`<link rel="canonical" href="${BASE}en/" />`);
    expect(renderHead("en", BASE)).toContain(`<meta property="og:url" content="${BASE}en/" />`);
  });

  it("lists every language plus x-default on both pages", () => {
    for (const locale of LOCALES) {
      const head = renderHead(locale, BASE);
      expect(head).toContain(`hreflang="es" href="${BASE}"`);
      expect(head).toContain(`hreflang="en" href="${BASE}en/"`);
      expect(head).toContain(`hreflang="x-default" href="${BASE}"`);
    }
  });

  it("marks the language and the alternate in Open Graph", () => {
    expect(renderHead("es", BASE)).toContain('og:locale" content="es_CO"');
    expect(renderHead("es", BASE)).toContain('og:locale:alternate" content="en_US"');
    expect(renderHead("en", BASE)).toContain('og:locale" content="en_US"');
  });

  it("omits tags that need an address when the site URL is unknown", () => {
    const head = renderHead("es", "");
    expect(head).not.toContain("canonical");
    expect(head).not.toContain("hreflang");
    expect(head).not.toContain("og:url");
    expect(head).toContain("<title>");
  });
});

describe("structured data", () => {
  type Node = Record<string, unknown>;
  const graph = (locale: "es" | "en", base: string) => (structuredData(locale, base) as { "@graph": Node[] })["@graph"];
  const types = (locale: "es" | "en", base: string) => graph(locale, base).map((n) => n["@type"]);

  it("describes the person, the app, the website and the profile page", () => {
    expect(types("es", BASE)).toEqual(["Person", "SoftwareApplication", "WebSite", "ProfilePage"]);
  });

  it("falls back to person and app without a site URL", () => {
    expect(types("es", "")).toEqual(["Person", "SoftwareApplication"]);
  });

  it("links the app to both stores and the profile page to its own URL and language", () => {
    const nodes = graph("en", BASE);
    const app = nodes.find((n) => n["@type"] === "SoftwareApplication")!;
    expect(app.installUrl).toEqual([
      expect.stringContaining("play.google.com"),
      expect.stringContaining("apps.apple.com"),
    ]);
    const profile = nodes.find((n) => n["@type"] === "ProfilePage")!;
    expect(profile.url).toBe(`${BASE}en/`);
    expect(profile.inLanguage).toBe("en");
    expect(profile.mainEntity).toEqual({ "@id": `${BASE}#person` });
  });

  it("is valid JSON inside the page", () => {
    const head = renderHead("en", BASE);
    const json = /<script type="application\/ld\+json">(.*)<\/script>/.exec(head)![1];
    expect(() => JSON.parse(json)).not.toThrow();
  });
});

describe("sitemap and robots", () => {
  it("lists every page in both languages, each with reciprocal alternates", () => {
    const xml = renderSitemap(BASE);
    expect(xml).toContain(`<loc>${BASE}</loc>`);
    expect(xml).toContain(`<loc>${BASE}en/</loc>`);
    expect(xml).toContain(`<loc>${BASE}migozz/</loc>`);
    expect(xml).toContain(`<loc>${BASE}en/migozz/</loc>`);
    expect(xml).toContain(`<loc>${BASE}aria/</loc>`);
    expect(xml).toContain(`<loc>${BASE}en/aria/</loc>`);
    expect(xml.match(/hreflang="x-default"/g)).toHaveLength(PAGE_IDS.length * LOCALES.length);
    expect(xml.match(/hreflang="en"/g)).toHaveLength(PAGE_IDS.length * LOCALES.length);
  });

  it("dates every entry only when a lastmod is given", () => {
    expect(renderSitemap(BASE, "2026-10-21").match(/<lastmod>2026-10-21<\/lastmod>/g)).toHaveLength(
      PAGE_IDS.length * LOCALES.length,
    );
    expect(renderSitemap(BASE)).not.toContain("<lastmod>");
  });

  it("points robots.txt at the sitemap only when the address is known", () => {
    expect(renderRobots(BASE)).toContain(`Sitemap: ${BASE}sitemap.xml`);
    expect(renderRobots("")).not.toContain("Sitemap");
  });

  it("builds page URLs", () => {
    expect(pageUrl(BASE, "es")).toBe(BASE);
    expect(pageUrl(BASE, "en")).toBe(`${BASE}en/`);
    expect(pageUrl("", "en")).toBe("");
  });
});

describe("localizeHtml", () => {
  const html = `<html lang="es"><head>${HEAD_START}old${HEAD_END}</head><body>${BODY_START}old${BODY_END}</body></html>`;

  it("swaps the language, head and fallback text", () => {
    const en = localizeHtml(html, "en", BASE);
    expect(en).toContain('<html lang="en"');
    expect(en).toContain(PAGES.en.title);
    expect(en).toContain(PAGES.en.fallback.heading);
    expect(en).not.toContain(PAGES.es.title);
  });

  it("can be applied twice without losing the markers", () => {
    const again = localizeHtml(localizeHtml(html, "en", BASE), "es", BASE);
    expect(again).toContain('<html lang="es"');
    expect(again).toContain(PAGES.es.title);
    expect(again.split(HEAD_START)).toHaveLength(2);
  });

  it("serves the welcome screen text in the page's language, before any JavaScript", () => {
    const splash = `<p id="splash-hello">Bienvenido</p><p id="splash-sub">Cargando…</p>`;
    const en = localizeHtml(html.replace("</body>", `${splash}</body>`), "en", BASE);
    expect(en).toContain('id="splash-hello">Welcome<');
    expect(en).toContain('id="splash-sub">Loading…<');
    const es = localizeHtml(en, "es", BASE);
    expect(es).toContain('id="splash-hello">Bienvenido<');
  });

  it("fails loudly when index.html lost its markers", () => {
    expect(() => localizeHtml('<html lang="es"></html>', "en", BASE)).toThrow(/Missing/);
  });

  it("keeps readable text for crawlers in the fallback", () => {
    expect(renderFallback("es")).toContain("Desarrollador");
    expect(renderFallback("en")).toContain("Full Stack");
  });
});

describe("security headers", () => {
  it("forbids inline and eval scripts", () => {
    const script = CSP.split("; ").find((d) => d.startsWith("script-src"));
    expect(script).toBe("script-src 'self'");
    expect(CSP).not.toContain("unsafe-eval");
  });

  it("denies framing, objects and foreign bases", () => {
    expect(CSP).toContain("frame-ancestors 'none'");
    expect(CSP).toContain("object-src 'none'");
    expect(CSP).toContain("base-uri 'self'");
  });

  it("writes every header to the Netlify _headers file", () => {
    const file = renderHeadersFile();
    for (const name of Object.keys(SECURITY_HEADERS)) expect(file).toContain(`  ${name}: `);
  });
});

describe("analytics", () => {
  it("keeps the policy closed to third parties when Umami is off", () => {
    const csp = buildCsp(false);
    expect(csp).toContain("script-src 'self';");
    expect(csp).not.toContain("umami");
  });

  it("allows only Umami's script and API origins when it is on", () => {
    const csp = buildCsp(true);
    expect(csp).toContain("script-src 'self' https://cloud.umami.is;");
    expect(csp).toContain(
      "connect-src 'self' https://admin.hgsportafolio.site https://cloud.umami.is https://gateway.umami.is https://api-gateway.umami.dev;",
    );
  });

  it("reads the site ID from the environment and ignores anything that is not one", () => {
    const id = "05235cb2-42e3-4aea-8e37-d0b43f1699f7";
    expect(umamiId({ VITE_UMAMI_WEBSITE_ID: ` ${id} ` })).toBe(id);
    expect(
      umamiId({
        VITE_UMAMI_WEBSITE_ID: `<script defer src="https://cloud.umami.is/script.js" data-website-id="${id}"></script>`,
      }),
    ).toBe(id);
    expect(umamiId({ VITE_UMAMI_WEBSITE_ID: "abc" })).toBe("");
    expect(umamiId({ VITE_UMAMI_WEBSITE_ID: "  " })).toBe("");
    expect(umamiId({})).toBe("");
  });
});

describe("MIGOZZ case study page", () => {
  it("lives under /migozz/ in Spanish and /en/migozz/ in English", () => {
    expect(pagePath("es", "migozz")).toBe("migozz/");
    expect(pagePath("en", "migozz")).toBe("en/migozz/");
  });

  it.each(LOCALES)("keeps the %s title and description at search-result length", (locale) => {
    expect(MIGOZZ_PAGES[locale].title.length).toBeLessThanOrEqual(70);
    expect(MIGOZZ_PAGES[locale].description.length).toBeLessThanOrEqual(165);
    expect(MIGOZZ_PAGES[locale].description.length).toBeGreaterThanOrEqual(100);
  });

  it("has its own canonical and alternates, not the home page's", () => {
    const head = renderHead("en", BASE, "migozz");
    expect(head).toContain(`<link rel="canonical" href="${BASE}en/migozz/" />`);
    expect(head).toContain(`hreflang="es" href="${BASE}migozz/"`);
    expect(head).toContain(`hreflang="x-default" href="${BASE}migozz/"`);
    expect(head).toContain(`<title>${MIGOZZ_PAGES.en.title}</title>`);
  });

  it("describes itself as a web page about the app, with a breadcrumb home", () => {
    const graph = (structuredData("es", BASE, "migozz") as { "@graph": Record<string, unknown>[] })["@graph"];
    expect(graph.map((n) => n["@type"])).toEqual(["Person", "SoftwareApplication", "WebPage", "BreadcrumbList"]);
  });

  it("keeps crawler fallback text with a link back to the portfolio", () => {
    expect(renderFallback("en", "migozz")).toContain('href="/en/"');
    expect(renderFallback("es", "migozz")).toContain('href="/"');
  });

  it("is linked from the home page fallback, so crawlers find it without JavaScript", () => {
    expect(renderFallback("es")).toContain('href="/migozz/"');
    expect(renderFallback("en")).toContain('href="/en/migozz/"');
  });
});

describe("ARIA case study page", () => {
  it.each(LOCALES)("keeps the %s title and description at search-result length", (locale) => {
    expect(ARIA_PAGES[locale].title.length).toBeLessThanOrEqual(70);
    expect(ARIA_PAGES[locale].description.length).toBeLessThanOrEqual(165);
    expect(ARIA_PAGES[locale].description.length).toBeGreaterThanOrEqual(100);
  });

  it("has its own canonical, alternates and title", () => {
    const head = renderHead("es", BASE, "aria");
    expect(head).toContain(`<link rel="canonical" href="${BASE}aria/" />`);
    expect(head).toContain(`hreflang="en" href="${BASE}en/aria/"`);
    expect(head).toContain(`<title>${ARIA_PAGES.es.title}</title>`);
    expect(head).toContain(ARIA_PAGES.es.ogDescription);
  });

  it("describes a page about ARIA, made by Arix Group with me as a contributor", () => {
    const graph = (structuredData("en", BASE, "aria") as { "@graph": Record<string, unknown>[] })["@graph"];
    expect(graph.map((n) => n["@type"])).toEqual([
      "Person",
      "SoftwareApplication",
      "SoftwareApplication",
      "WebPage",
      "BreadcrumbList",
    ]);
    const app = graph[2];
    expect(app).toMatchObject({ "@id": `${BASE}#aria`, name: "ARIA", contributor: { "@id": `${BASE}#person` } });
    expect(graph[3]).toMatchObject({ about: { "@id": `${BASE}#aria` } });
  });

  it("links back home in its fallback, and the home fallback lists every project with its case study", () => {
    expect(renderFallback("en", "aria")).toContain('href="/en/"');
    const home = renderFallback("es");
    expect(home).toContain('<a href="/aria/">ARIA</a>');
    expect(home).toContain("<strong>CashWin</strong>");
    expect(home).toContain('<a href="/devpanel/">DevPanel</a>');
    expect(renderFallback("en")).toContain('href="/en/aria/"');
  });
});

describe("DevPanel case study page", () => {
  it.each(LOCALES)("keeps the %s title and description at search-result length", (locale) => {
    expect(DEVPANEL_PAGES[locale].title.length).toBeLessThanOrEqual(70);
    expect(DEVPANEL_PAGES[locale].description.length).toBeLessThanOrEqual(165);
    expect(DEVPANEL_PAGES[locale].description.length).toBeGreaterThanOrEqual(100);
  });

  it("is listed in the sitemap in both languages", () => {
    const xml = renderSitemap(BASE);
    expect(xml).toContain(`<loc>${BASE}devpanel/</loc>`);
    expect(xml).toContain(`<loc>${BASE}en/devpanel/</loc>`);
  });

  it("names me as the author, not a contributor, because it is my own project", () => {
    const graph = (structuredData("es", BASE, "devpanel") as { "@graph": Record<string, unknown>[] })["@graph"];
    const app = graph.find((n) => n["@id"] === `${BASE}#devpanel`);
    expect(app).toMatchObject({ name: "DevPanel", author: { "@id": `${BASE}#person` } });
    expect(app).not.toHaveProperty("contributor");
  });

  it("links home and to the code in its fallback, and the home fallback links the case study", () => {
    expect(renderFallback("es", "devpanel")).toContain('href="https://github.com/DevCat-HGS/DevPanel"');
    expect(renderFallback("en", "devpanel")).toContain('href="/en/"');
    expect(renderFallback("es")).toContain('<a href="/devpanel/">DevPanel</a>');
  });
});

describe("Portfolio case study page", () => {
  it.each(LOCALES)("keeps the %s title and description at search-result length", (locale) => {
    expect(PORTAFOLIO_PAGES[locale].title.length).toBeLessThanOrEqual(70);
    expect(PORTAFOLIO_PAGES[locale].description.length).toBeLessThanOrEqual(165);
    expect(PORTAFOLIO_PAGES[locale].description.length).toBeGreaterThanOrEqual(100);
  });

  it("is listed in the sitemap in both languages", () => {
    const xml = renderSitemap(BASE);
    expect(xml).toContain(`<loc>${BASE}portafolio/</loc>`);
    expect(xml).toContain(`<loc>${BASE}en/portafolio/</loc>`);
  });

  it("names me as the author and points to its documentation", () => {
    const graph = (structuredData("es", BASE, "portafolio") as { "@graph": Record<string, unknown>[] })["@graph"];
    const site = graph.find((n) => n["@id"] === `${BASE}#portafolio`);
    expect(site).toMatchObject({ author: { "@id": `${BASE}#person` } });
    expect(site).toHaveProperty("subjectOf.url", "https://docs.hgsportafolio.site");
  });

  it("links its documentation in the fallback, and the home fallback links the case study", () => {
    expect(renderFallback("es", "portafolio")).toContain('href="https://docs.hgsportafolio.site"');
    expect(renderFallback("en", "portafolio")).toContain('href="/en/"');
    expect(renderFallback("es")).toContain('<a href="/portafolio/">Este portafolio</a>');
  });
});
