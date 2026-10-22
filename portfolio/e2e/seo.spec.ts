import { expect, test, type Page } from "@playwright/test";
import { openSite } from "./helpers";

/** Collects same-origin requests that failed and any Content-Security-Policy violation reported by the browser. */
function watch(page: Page) {
  const failed: string[] = [];
  const violations: string[] = [];
  page.on("response", (res) => {
    if (res.url().startsWith("http://localhost") && res.status() >= 400) failed.push(`${res.status()} ${res.url()}`);
  });
  page.on("console", (msg) => {
    if (/content security policy|refused to/i.test(msg.text())) violations.push(msg.text());
  });
  return { failed, violations };
}

test.describe("languages", () => {
  test("/ is Spanish and /en/ is English, each with its own title", async ({ page }) => {
    await openSite(page, "es");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    const es = await page.title();

    await openSite(page, "en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    const en = await page.title();

    expect(es).toContain("Desarrollador");
    expect(en).toContain("Developer");
  });

  test("the English page loads every asset from the site root", async ({ page }) => {
    const { failed } = watch(page);
    await openSite(page, "en");
    // Scroll through so lazy images (projects, credentials, stack icons) request their files.
    for (const id of ["selected", "credentials", "stack"]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    }
    await page.locator(".unit-eye").nth(1).click();
    await page.waitForLoadState("networkidle");
    expect(failed).toEqual([]);
  });

  test("each page's static HTML carries its own head, before JavaScript runs", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en/");
    expect(await page.title()).toContain("Developer");
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "en_US");
    await expect(page.locator("#root h1")).toHaveCount(1);
    await context.close();
  });
});

test.describe("security headers", () => {
  for (const path of ["/", "/en/"]) {
    test(`${path} sends the policy and runs without violations`, async ({ page }) => {
      const { violations } = watch(page);
      const response = await page.goto(path);
      const headers = response!.headers();
      expect(headers["content-security-policy"]).toContain("script-src 'self'");
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");

      await page.waitForFunction(() => document.documentElement.classList.contains("is-ready"));
      await page.locator(".cred").first().click();
      await expect(page.getByRole("dialog")).toBeVisible();
      expect(violations).toEqual([]);
    });
  }

  for (const [path, lang] of [
    ["/migozz/", "es"],
    ["/en/migozz/", "en"],
  ] as const) {
    test(`${path} sends the policy, renders in ${lang} and runs without violations`, async ({ page }) => {
      const { violations } = watch(page);
      const response = await page.goto(path);
      expect(response!.headers()["content-security-policy"]).toContain("script-src 'self'");
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.locator(".mz-metrics li").first()).toBeVisible();
      expect(violations).toEqual([]);
    });
  }
});
