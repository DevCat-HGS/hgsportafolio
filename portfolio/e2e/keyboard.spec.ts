import { expect, test } from "@playwright/test";
import { openSite } from "./helpers";

test.describe("keyboard", () => {
  test("the skip link is the first tab stop and lands on the main landmark", async ({ page }) => {
    await openSite(page, "en");
    await page.keyboard.press("Tab");
    const skip = page.locator(".skip");
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("every chapter stop has an accessible name", async ({ page }) => {
    await openSite(page, "es");
    const stops = page.locator(".line .stop");
    expect(await stops.count()).toBeGreaterThan(0);
    for (const stop of await stops.all()) {
      expect(((await stop.getAttribute("aria-label")) ?? "").trim().length).toBeGreaterThan(0);
    }
  });

  test("the certificate viewer traps focus, closes with Escape and returns focus to its opener", async ({ page }) => {
    await openSite(page, "en");
    const opener = page.locator(".cred").first();
    await opener.focus();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const close = page.locator(".lightbox-close");
    await expect(close).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(close).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("the language toggle moves between / and /en/ without reloading, and Back returns", async ({ page }) => {
    await openSite(page, "en");
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.locator(".lang").click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page).not.toHaveURL(/\/en\//);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");

    await page.goBack();
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});
