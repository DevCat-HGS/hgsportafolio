import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { renderHeadersFile, SECURITY_HEADERS, UMAMI_SCRIPT, umamiId } from "./seo/headers";
import { SUBPAGE_IDS, type PageId, type PageLocale } from "./seo/pages";
import { localizeHtml, renderRobots, renderSitemap } from "./seo/render";

const root = dirname(fileURLToPath(import.meta.url));

/** Which page and language a request is for: /en/ prefix for English, /migozz/ or /aria/ for a case study. */
const route = (path = "/") => ({
  locale: (/^\/en(\/|$)/.test(path) ? "en" : "es") as PageLocale,
  page: (SUBPAGE_IDS.find((id) => new RegExp(`^(/en)?/${id}(/|$)`).test(path)) ?? "home") as PageId,
});

// The production domain is pinned in netlify.toml (VITE_SITE_URL), so canonical, hreflang and sitemap never fall back
// to the .netlify.app address; Netlify's URL is only a fallback for builds without it.
const SITE_URL = (process.env.VITE_SITE_URL || process.env.URL || "").replace(/\/+$/, "");
const base = SITE_URL ? `${SITE_URL}/` : "";

/**
 * Per-language <head> and fallback text. The Spanish page is index.html; the English page (/en/) is derived from it
 * at build time, so there is a single HTML source. Without a site address, tags that require one are omitted.
 */
function seo(): Plugin {
  return {
    name: "seo",
    // In dev, /en/ and /en/<case>/ are served from the Spanish HTML files and localized on the fly.
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const path = req.url?.split("?")[0] ?? "";
        const id = SUBPAGE_IDS.find((p) => new RegExp(`^/(en/)?${p}/?$`).test(path));
        if (id) {
          req.originalUrl = req.url;
          req.url = `/${id}/index.html`;
        }
        next();
      });
    },
    transformIndexHtml(html, ctx) {
      const { locale, page } = route(ctx.originalUrl ?? ctx.path);
      const out = localizeHtml(html, locale, base, page);
      // Analytics only in builds with an Umami site ID; data-domains keeps previews and localhost out of the stats.
      const id = umamiId();
      if (!id) return out;
      const domains = SITE_URL ? ` data-domains="${new URL(SITE_URL).hostname}"` : "";
      return out.replace(
        "</head>",
        `    <script defer src="${UMAMI_SCRIPT}" data-website-id="${id}"${domains}></script>\n  </head>`,
      );
    },
  };
}

/**
 * Date of the last commit that changed what visitors see, for the sitemap's lastmod. A build date would move on every
 * deploy and teach Google to ignore it. Without git history (shallow clone, no git) lastmod is left out.
 */
function contentDate(): string | undefined {
  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%cs", "--", "src", "public", "seo", "index.html", ...SUBPAGE_IDS],
      {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    ).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : undefined;
  } catch {
    return undefined;
  }
}

function seoBuild(): Plugin {
  let outDir = "dist";
  return {
    name: "seo-build",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "robots.txt", source: renderRobots(base) });
      this.emitFile({ type: "asset", fileName: "_headers", source: renderHeadersFile() });
      if (base)
        this.emitFile({
          type: "asset",
          fileName: "sitemap.xml",
          source: renderSitemap(base, contentDate()),
        });
    },
    closeBundle() {
      for (const [source, page] of [
        ["index.html", "home"] as const,
        ...SUBPAGE_IDS.map((id) => [`${id}/index.html`, id] as const),
      ]) {
        const spanish = readFileSync(resolve(outDir, source), "utf8");
        const target = resolve(outDir, "en", source);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, localizeHtml(spanish, "en", base, page));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), seo(), seoBuild()],
  // Absolute asset URLs: the English page lives one level down, at /en/.
  base: "/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        ...Object.fromEntries(SUBPAGE_IDS.map((id) => [id, resolve(root, `${id}/index.html`)])),
      },
    },
  },
  // Same headers Netlify will send, so tests exercise the real Content-Security-Policy.
  preview: { headers: SECURITY_HEADERS },
});
