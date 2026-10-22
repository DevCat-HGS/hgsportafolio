// Records scripts/video/explainer.html to public/video/portafolio-<lang>.webm (1280x720, VP8, no audio) and a poster
// public/video/portafolio-<lang>.webp, in Spanish and English. The case study at /portafolio/ embeds them.
//   npm run video
// Locally you can reuse an installed browser: PW_CHANNEL=chrome npm run video
//
// The figures come from the live monitor (health.hgsportafolio.site) at recording time, and its page is captured
// for the health scene, so the video shows what was measured that day. With no network the figures show "—".
import { chromium } from "@playwright/test";
import { mkdirSync, readdirSync, renameSync, rmSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const template = resolve(import.meta.dirname, "video/explainer.html");
const out = resolve(root, "public/video");
const raw = resolve(root, ".reports/video-raw");
const SIZE = { width: 1280, height: 720 };

async function liveData() {
  try {
    const history = await (await fetch("https://health.hgsportafolio.site/data/lighthouse.json")).json();
    const last = history.at(-1);
    return { mobile: last?.mobile?.scores.performance, desktop: last?.desktop?.scores.performance };
  } catch {
    return {};
  }
}

const data = {
  ...(await liveData()),
  workflows: readdirSync(resolve(root, "../.github/workflows")).filter((f) => f.endsWith(".yml")).length,
};
console.log("Figures:", data);

mkdirSync(out, { recursive: true });
rmSync(raw, { recursive: true, force: true });
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });
try {
  // The health scene shows the monitor's real page, as it looked when the video was made.
  const shot = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  await shot.goto("https://health.hgsportafolio.site/", { waitUntil: "networkidle" });
  await shot.waitForTimeout(1500);
  await shot.screenshot({ path: resolve(root, ".reports/video-health.png") });
  await shot.close();

  for (const lang of ["es", "en"]) {
    const context = await browser.newContext({ viewport: SIZE, recordVideo: { dir: raw, size: SIZE } });
    await context.addInitScript(`window.VIDEO_DATA = ${JSON.stringify(data)};`);
    const page = await context.newPage();
    await page.goto(`${pathToFileURL(template).href}?lang=${lang}`);
    await page.evaluate("document.fonts.ready");
    const playing = page.evaluate("window.play()");
    await page.waitForTimeout(2600);
    const poster = await page.screenshot();
    await sharp(poster)
      .webp({ quality: 80 })
      .toFile(resolve(out, `portafolio-${lang}.webp`));
    await playing;
    await page.waitForTimeout(600);
    const video = page.video();
    await context.close();
    const file = resolve(out, `portafolio-${lang}.webm`);
    renameSync(await video.path(), file);
    console.log(`Wrote ${file} (${Math.round(statSync(file).size / 1024)} KB)`);
  }
} finally {
  await browser.close();
}
