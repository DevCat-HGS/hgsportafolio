// Renders scripts/og-template.html to public/og.png (1200x630, the Open Graph / Twitter card).
//   npm run og
// Locally you can reuse an installed browser: PW_CHANNEL=chrome npm run og
import { chromium } from "@playwright/test";
import { statSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const template = resolve(import.meta.dirname, "og-template.html");
const output = resolve(import.meta.dirname, "../public/og.png");

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(template).href);
  await page.evaluate("document.fonts.ready");
  await page.screenshot({ path: output, type: "png" });
} finally {
  await browser.close();
}

console.log(`Wrote ${output} (${Math.round(statSync(output).size / 1024)} KB)`);
