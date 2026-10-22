import { test } from "@playwright/test";
import { LOCALES, openSite, VIEWPORTS, type ViewportName } from "./helpers";

// Only runs when asked for: SCREENSHOTS=1 npm run e2e. CI uses it to attach previews to pull requests.
test.skip(!process.env.SCREENSHOTS, "set SCREENSHOTS=1 to capture section screenshots");

const SECTIONS = ["intro", "practice", "startup", "selected", "stack"] as const;

for (const locale of LOCALES) {
  for (const name of Object.keys(VIEWPORTS) as ViewportName[]) {
    test(`capture ${locale} / ${name}`, async ({ page }) => {
      test.setTimeout(60_000);
      await page.setViewportSize(VIEWPORTS[name]);
      await openSite(page, locale);
      // The fixed bar and rail would overlap every element capture.
      await page.addStyleTag({ content: ".nav, .line { display: none !important; }" });
      for (const id of SECTIONS) {
        await page.locator(`#${id}`).screenshot({ path: `.reports/screenshots/${locale}-${name}-${id}.png` });
      }
    });
  }
}
