import { defineConfig } from "@playwright/test";

const PORT = 4173;

export default defineConfig({
  testDir: "e2e",
  outputDir: ".reports/playwright",
  reporter: [["list"], ["json", { outputFile: ".reports/playwright.json" }]],
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Locally you can reuse an installed browser: PW_CHANNEL=chrome npm run e2e
    channel: process.env.PW_CHANNEL || undefined,
    // Skips the welcome animation and the scroll reveal so pages are stable to inspect.
    reducedMotion: "reduce",
  },
  // Tests run against the production build: run `npm run build` first.
  webServer: {
    command: `npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
  },
});
