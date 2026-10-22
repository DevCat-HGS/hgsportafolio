import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/** public/.well-known/security.txt (RFC 9116). The test fails a month before it expires, as a reminder to renew. */
describe("security.txt", () => {
  const txt = readFileSync(resolve(__dirname, "../public/.well-known/security.txt"), "utf8");

  it("has a contact and the canonical address", () => {
    expect(txt).toMatch(/^Contact: mailto:\S+@\S+$/m);
    expect(txt).toMatch(/^Canonical: https:\/\/hgsportafolio\.site\/\.well-known\/security\.txt$/m);
  });

  it("is not about to expire", () => {
    const expires = Date.parse(txt.match(/^Expires: (\S+)$/m)?.[1] ?? "");
    expect(expires - Date.now()).toBeGreaterThan(30 * 24 * 60 * 60 * 1000);
  });
});
