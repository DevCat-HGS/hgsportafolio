// Turns the originals in images/ into the WebP files the site serves, so nobody has to resize or compress by hand.
//
//   images/shots/<name>.png        → public/shots/<name>.webp (960 px) and <name>-480.webp
//   images/credentials/<name>.jpg  → public/credentials/<name>.webp (1100 px), thumb/<name>.webp (560) and -360
//   images/migozz/<name>.png       → public/migozz/<name>.webp (780 px, phone screenshots)
//   images/portrait/<name>.png     → public/portrait/<name>.webp (square, up to 600 px)
//
//   npm run images            # only originals newer than their output
//   npm run images -- --force # everything
//
// Phone photos (certificates) get a light median filter first: it removes sensor noise that WebP compresses badly,
// which took bachiller.webp from 279 KB to 110 KB with the text still crisp. Size budgets are enforced by
// tests/assets.test.ts.
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

const SOURCES = /\.(png|jpe?g|webp|tiff?)$/i;
const force = process.argv.includes("--force");

/** Output files of each kind: width (and height, to crop), WebP quality and whether to denoise. */
const KINDS = {
  shots: [
    { out: (n) => `public/shots/${n}.webp`, width: 960, quality: 78 },
    { out: (n) => `public/shots/${n}-480.webp`, width: 480, quality: 74 },
  ],
  credentials: [
    { out: (n) => `public/credentials/${n}.webp`, width: 1100, quality: 70, denoise: true },
    { out: (n) => `public/credentials/thumb/${n}.webp`, width: 560, quality: 70, denoise: true },
    { out: (n) => `public/credentials/thumb/${n}-360.webp`, width: 360, quality: 70, denoise: true },
  ],
  migozz: [{ out: (n) => `public/migozz/${n}.webp`, width: 780, quality: 80 }],
  portrait: [{ out: (n) => `public/portrait/${n}.webp`, width: 600, height: 600, quality: 82 }],
};

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
let made = 0;

for (const [kind, outputs] of Object.entries(KINDS)) {
  const dir = join("images", kind);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).filter((f) => SOURCES.test(f))) {
    const source = join(dir, file);
    const name = basename(file, extname(file));
    const sourceTime = statSync(source).mtimeMs;
    for (const o of outputs) {
      const target = o.out(name);
      if (!force && existsSync(target) && statSync(target).mtimeMs >= sourceTime) continue;
      mkdirSync(join(target, ".."), { recursive: true });
      let img = sharp(source)
        .rotate()
        .resize({ width: o.width, height: o.height, fit: "cover", withoutEnlargement: true });
      if (o.denoise) img = img.median(3);
      await img.webp({ quality: o.quality, effort: 6 }).toFile(target);
      made++;
      console.log(`${target.padEnd(52)} ${kb(statSync(target).size)}`);
    }
  }
}

console.log(made ? `\n${made} file(s) written.` : "Everything is up to date.");
