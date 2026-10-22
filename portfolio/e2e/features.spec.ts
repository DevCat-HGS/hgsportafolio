import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { openSite } from "./helpers";

test.describe("contact form", () => {
  test("posts the fields to the admin's contact function and confirms without reloading", async ({ page }) => {
    let posted: Record<string, unknown> = {};
    // The real function sends emails; here it is answered locally.
    await page.route("https://admin.hgsportafolio.site/api/contact", async (route) => {
      posted = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 200, json: { ok: true }, headers: { "Access-Control-Allow-Origin": "*" } });
    });

    await openSite(page, "en");
    const form = page.locator("form.contact");
    await form.getByLabel("Name").fill("Ada Lovelace");
    await form.getByLabel("Email").fill("ada@example.com");
    await form.getByLabel("Message").fill("Hello from the test suite");
    await form.getByRole("button", { name: "Send message" }).click();

    await expect(form.getByRole("status")).toHaveText(/Message sent/);
    expect(posted).toMatchObject({ name: "Ada Lovelace", email: "ada@example.com", lang: "en", website: "" });
    expect(typeof posted.elapsed).toBe("number");
    await expect(form.getByLabel("Name")).toHaveValue("");
  });

  test("tells the visitor to use email when sending fails", async ({ page }) => {
    await page.route("https://admin.hgsportafolio.site/api/contact", (route) =>
      route.fulfill({ status: 500, headers: { "Access-Control-Allow-Origin": "*" } }),
    );
    await openSite(page, "es");
    const form = page.locator("form.contact");
    await form.getByLabel("Nombre").fill("Ada");
    await form.getByLabel("Correo").fill("ada@example.com");
    await form.getByLabel("Mensaje").fill("Hola");
    await form.getByRole("button", { name: "Enviar mensaje" }).click();
    await expect(form.getByRole("status")).toHaveText(/No se pudo enviar/);
  });
});

test.describe("print", () => {
  test("drops navigation and interaction, and opens every stack group", async ({ page }) => {
    await openSite(page, "es");
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".nav")).toBeHidden();
    await expect(page.locator(".line")).toBeHidden();
    await expect(page.locator("form.contact")).toBeHidden();
    await expect(page.locator(".unit-panel").last().locator(".tile").first()).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(255, 255, 255)");
  });
});

test.describe("high contrast", () => {
  test("replaces glass with opaque panels and has no WCAG A/AA violations", async ({ page }) => {
    await page.emulateMedia({ contrast: "more" });
    await openSite(page, "es");
    const filter = await page
      .locator(".unit")
      .first()
      .evaluate((el) => getComputedStyle(el).backdropFilter);
    expect(filter === "none" || filter === "").toBe(true);
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(violations.map((v) => v.id)).toEqual([]);
  });
});
