// Builds the raster favicons from public/favicon.svg, so Google Search (which wants a multiple of 48 px and falls
// back to /favicon.ico) always shows the same icon as the browser tab.
//
//   public/favicon.svg → public/favicon.ico (16, 32, 48), public/favicon-192.png
//
//   npm run favicon
//
// Without a real /favicon.ico, Netlify answers that path with its own default icon.
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const svg = readFileSync("public/favicon.svg");
const png = (size) =>
  sharp(svg, { density: 72 * (size / 64) * 4 })
    .resize(size, size)
    .png()
    .toBuffer();

/** ICO container with PNG-compressed entries (supported by every current browser and by Google). */
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((img) => img.data)]);
}

const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(icoSizes.map(async (size) => ({ size, data: await png(size) })));
writeFileSync("public/favicon.ico", ico(icoImages));
writeFileSync("public/favicon-192.png", await png(192));
console.log("favicon.ico, favicon-192.png written");
