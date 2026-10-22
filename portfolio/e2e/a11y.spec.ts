import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { LOCALES, openSite, VIEWPORTS, type ViewportName } from "./helpers";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function violations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return violations.map((v) => ({
    rule: v.id,
    impact: v.impact,
    help: v.help,
    targets: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
  }));
}

for (const locale of LOCALES) {
  for (const name of Object.keys(VIEWPORTS) as ViewportName[]) {
    test.describe(`${locale} / ${name}`, () => {
      test.use({ viewport: VIEWPORTS[name] });

      test("page has no WCAG A/AA violations", async ({ page }) => {
        await openSite(page, locale);
        expect(await violations(page)).toEqual([]);
      });

      test("page has no violations with the stack accordion and certificate viewer open", async ({ page }) => {
        await openSite(page, locale);
        await page.locator(".unit-eye").nth(1).click();
        await page.locator(".cred").first().click();
        await expect(page.getByRole("dialog")).toBeVisible();
        expect(await violations(page)).toEqual([]);
      });

      test("MIGOZZ case study has no WCAG A/AA violations", async ({ page }) => {
        await page.goto(locale === "en" ? "/en/migozz/" : "/migozz/");
        await expect(page.locator(".mz-metrics li").first()).toBeVisible();
        expect(await violations(page)).toEqual([]);
      });

      test("ARIA case study has no WCAG A/AA violations", async ({ page }) => {
        await page.goto(locale === "en" ? "/en/aria/" : "/aria/");
        await expect(page.locator(".ar-stop").first()).toBeVisible();
        expect(await violations(page)).toEqual([]);
      });

      test("DevPanel case study has no WCAG A/AA violations", async ({ page }) => {
        await page.goto(locale === "en" ? "/en/devpanel/" : "/devpanel/");
        await expect(page.locator(".ar-shots img").first()).toBeVisible();
        expect(await violations(page)).toEqual([]);
      });

      test("Portfolio case study has no WCAG A/AA violations", async ({ page }) => {
        await page.goto(locale === "en" ? "/en/portafolio/" : "/portafolio/");
        await expect(page.locator(".ar-shots img").first()).toBeVisible();
        expect(await violations(page)).toEqual([]);
      });
    });
  }
}
