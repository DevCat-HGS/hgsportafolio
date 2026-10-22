import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const PUBLIC = resolve(__dirname, "../public");
const KB = 1024;

/** Every file in a public folder (not recursive) matching a pattern, with its size. */
function files(dir: string, pattern: RegExp) {
  const full = join(PUBLIC, dir);
  if (!existsSync(full)) return [];
  return readdirSync(full)
    .filter((f) => pattern.test(f))
    .map((f) => ({ path: `${dir}/${f}`, size: statSync(join(full, f)).size }));
}

const over = (list: { path: string; size: number }[], max: number) =>
  list.filter((f) => f.size > max).map((f) => `${f.path}: ${Math.round(f.size / KB)} KB > ${max / KB} KB`);

// Budgets: what a visitor on a phone downloads. Run `npm run images` to regenerate an output that went over.
describe("asset budgets", () => {
  it("keeps project screenshots light", () => {
    expect(over(files("shots", /(?<!-480)\.webp$/), 120 * KB)).toEqual([]);
    expect(over(files("shots", /-480\.webp$/), 50 * KB)).toEqual([]);
  });

  it("keeps certificates and their thumbnails light", () => {
    expect(over(files("credentials", /\.webp$/), 150 * KB)).toEqual([]);
    expect(over(files("credentials/thumb", /(?<!-360)\.webp$/), 70 * KB)).toEqual([]);
    expect(over(files("credentials/thumb", /-360\.webp$/), 35 * KB)).toEqual([]);
  });

  it("keeps stack icons small", () => {
    expect(over(files("icons", /\.svg$/), 25 * KB)).toEqual([]);
  });

  it("keeps MIGOZZ phone screenshots light", () => {
    expect(over(files("migozz", /\.webp$/), 120 * KB)).toEqual([]);
  });

  it("keeps the portrait light", () => {
    expect(over(files("portrait", /\.webp$/), 60 * KB)).toEqual([]);
  });
});
