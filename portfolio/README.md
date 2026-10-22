# Portfolio

Single-page bilingual (ES / EN) portfolio for Harol Guerrero Salgado. React 19, TypeScript and Vite, with no UI or animation libraries. The design follows one idea: a Medellín metro line that runs down the page, one station per chapter.

Lighthouse (local preview): desktop 98 / 100 / 100 / 100, mobile 94 / 100 / 100 / 100 (performance / accessibility / best practices / SEO).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve dist/ locally
```

Requires Node 20.19 or newer (CI uses Node 22).

## Quality checks

```bash
npm run check      # typecheck, lint, format check and tests
npm run typecheck
npm run lint
npm run format     # rewrite files with Prettier
npm test
```

The same checks run on every pull request (`.github/workflows/portfolio-ci.yml` at the repository root).

### Browser checks and budgets

These run against the production build, so build first (`npm run build`).

```bash
npm run e2e              # axe accessibility (WCAG A/AA, ES and EN, mobile and desktop) and keyboard behavior
npm run e2e:screenshots  # section screenshots into .reports/screenshots
npm run lighthouse       # median of several runs against the budgets in scripts/lighthouse.mjs
```

Playwright downloads its own browser on first use (`npx playwright install chromium`). To reuse an installed Chrome instead, set `PW_CHANNEL=chrome` (and `CHROME_PATH` for Lighthouse). Start `npm run preview` in another terminal for `lighthouse`; Playwright starts its own server.

On pull requests the `quality` job runs all three, fails the check when a budget or a test is missed, uploads the screenshots and reports as an artifact, and keeps one comment up to date with the numbers.

### Automation

| Workflow              | What it does                                                                                                                   |
| :-------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `portfolio-ci.yml`    | Typecheck, lint, format, unit tests and build; then Lighthouse budgets, axe and keyboard tests, screenshots and the PR comment |
| `preview-comment.yml` | Edits one comment per pull request with the Netlify deploy preview link                                                        |
| `links.yml`           | Checks every URL in the content and READMEs weekly and on content changes; opens an issue when one breaks                      |
| `release.yml`         | Release Please: keeps a release pull request with the next version and `CHANGELOG.md`, built from Conventional Commit messages |
| `og.yml`              | Re-renders `public/og.png` from `scripts/og-template.html` when the template changes (`npm run og` locally)                    |
| `github-data.yml`     | Weekly refresh of `src/data/github.json` (`npm run github-stats` locally)                                                      |
| `dependabot.yml`      | Weekly updates for npm and GitHub Actions                                                                                      |

The share card is generated: edit `scripts/og-template.html`, not the PNG.

`src/data/github.json` feeds a small block in the closing section (public repositories, top languages, last push). It stays hidden until there are at least three public repositories (`MIN_REPOS` in `GithubStats.tsx`), so it never advertises an empty profile.

## Structure

```text
src/
  App.tsx                 composition only: hooks plus one component per section
  main.tsx                entry point
  content/
    types.ts              Copy interface shared by both languages, CHAPTER_IDS
    data/*.json           all visible text and data, edited from admin.hgsportafolio.site
    en.ts, es.ts          read data/site.json through checked(): a missing key fails the build
    stack.ts              technologies and icons per stack group
    index.ts              public exports
  components/             Hero, Practice, Startup, Tenure, Projects, Credentials, Stack, Close, Nav, ...
  data/github.ts          typed access to the generated github.json
  hooks/                  scroll scene, reveal, spotlight, active section, locale, splash
    selectors.ts          class names the hooks depend on (keep in sync with styles/)
  lib/metro.ts            line colors and small style helpers
  styles/                 one file per section; index.css imports them in cascade order
tests/                    content and data integrity tests (Vitest)
e2e/                      Playwright: axe accessibility, keyboard behavior, screenshots
seo/                      per-language head, structured data, sitemap, security headers
scripts/                  Lighthouse budgets, quality report, og.png renderer, GitHub stats
public/                   images, icons, CV PDFs, 404 page
index.html                SEO tags, welcome screen markup and styles (inlined to paint before JS)
vite.config.ts            injects canonical URLs, JSON-LD, robots.txt and sitemap.xml at build time
```

## Editing content

All text and data live in `src/content/data/*.json` (site texts, projects, stack, MIGOZZ, SEO), the files the admin at admin.hgsportafolio.site edits. The TypeScript modules read them through `checked()` (`src/content/json.ts`), so a missing or misspelled key still fails `tsc` and the build, and `tests/content.test.ts` keeps Spanish and English with the same keys. To add a project, use the admin or append an entry to `data/projects.json`; drop its screenshot original in `images/shots/` and `npm run images` writes the WebP files. `npm test` checks that every image, icon and CV file the content references exists.

Keep `result` factual. It is shown as an outcome label on each project; replace it with real numbers when you have them.

## Styles

`src/styles/index.css` imports the files in order, and later files refine earlier ones (glass, touch fallbacks). Do not reorder the imports without checking the result. Class names used by hooks are listed in `src/hooks/selectors.ts`.

Two behaviors worth knowing:

- Live `backdrop-filter` blur is only used with a fine pointer on wide screens. On touch devices it costs about a second of main-thread blocking, so `glass-touch.css` swaps it for more opaque fills.
- Reveal-on-scroll and the welcome screen are disabled with `prefers-reduced-motion`.

## Languages, SEO and deployment

Spanish lives at `/` and English at `/en/`: two static pages with their own title, description, canonical, `hreflang`
links, Open Graph tags, structured data and fallback text, so each language can be indexed and shared on its own. The
URL decides the language (`useLocale`, `public/splash.js` and the build all use the same rule); the toggle switches
without reloading and updates the address.

`index.html` is the only HTML source. `vite.config.ts` fills its marked blocks (`<!--seo-head-->`, `<!--seo-body-->`)
for Spanish and derives `dist/en/index.html` from it. The generators live in `seo/` and are unit tested:

```text
seo/pages.ts     per-language titles, descriptions and fallback text
seo/render.ts    head tags, JSON-LD (Person, SoftwareApplication, WebSite, ProfilePage), sitemap, robots.txt
seo/headers.ts   security headers and Content-Security-Policy, the single source for preview and Netlify
```

At build time the site address comes from Netlify's `URL` variable (or `VITE_SITE_URL`). Without it, tags that need an
address (canonical, `og:url`, `hreflang`, sitemap) are omitted instead of emitted empty.

Netlify redirects first-time visitors with an English browser from `/` to `/en/` (`netlify.toml`). The language toggle
sets the `nf_lang` cookie, which Netlify reads before the browser language, so a manual choice sticks. Crawlers send no
language and get `/`.

Security headers (CSP without inline scripts or `unsafe-eval`, `nosniff`, frame denial, referrer and permissions
policies) are served by `vite preview` for the tests and written to `dist/_headers` for Netlify. Because of the CSP the
welcome-screen and 404 scripts are external files (`public/splash.js`, `public/404.js`). `public/404.html` is served by
Netlify for unknown paths. Cache rules stay in `netlify.toml`.

Asset URLs are absolute from the site root (`src/lib/asset.ts`), because the English page is one level down.

## Notes

- The welcome screen markup and CSS live in `index.html` so they paint before the bundle loads; `public/splash.js` sets its language and `useSplash` hides it once fonts are ready.
- SENA and its logo belong to Servicio Nacional de Aprendizaje and are used only to identify the institution (see the notice in the Projects section).

## Formulario de contacto

El formulario envía a `https://admin.hgsportafolio.site/api/contact` (`src/lib/endpoints.ts`), una función del admin
que guarda el mensaje (se lee en la estación «Mensajes» del admin), te lo manda por correo con «Responder» directo al
visitante y le envía al visitante una confirmación en el idioma de la página. La confirmación nunca repite lo que
escribió el visitante. Hay un campo trampa para bots, un tiempo mínimo de llenado y límites por dirección y por día.
La lógica está en `admin/netlify/lib/contact.ts` y sus pruebas en `tests/contact-email.test.ts`. La política de
seguridad del sitio permite conectarse a ese dominio (`seo/headers.ts`).

## Analítica

Umami Cloud, sin cookies, se activa con `VITE_UMAMI_WEBSITE_ID` en Netlify (ver `.env.example`). Eventos que ya se
registran: descarga del CV (`cv-download`), clics en proyectos (`project-<id>`), redes (`social-<red>`), tiendas y
caso de MIGOZZ, clic en enviar (`contact`) y mensaje enviado (`contact-sent`).
