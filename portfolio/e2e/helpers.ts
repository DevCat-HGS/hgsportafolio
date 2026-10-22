import type { Page } from "@playwright/test";

export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 },
} as const;
export type ViewportName = keyof typeof VIEWPORTS;

/** Spanish lives at / and English at /en/. */
export const pathFor = (locale: Locale) => (locale === "en" ? "/en/" : "/");

/** Opens the site in the given language and waits for the welcome screen to finish. */
export async function openSite(page: Page, locale: Locale) {
  await page.goto(pathFor(locale));
  await page.waitForFunction(() => document.documentElement.classList.contains("is-ready"));
  await page.waitForSelector("#splash", { state: "detached" });
}
