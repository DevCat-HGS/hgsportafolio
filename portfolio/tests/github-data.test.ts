import { describe, expect, it } from "vitest";
import { github } from "../src/data/github";

describe("github data", () => {
  it("has the expected shape", () => {
    expect(Number.isInteger(github.publicRepos)).toBe(true);
    expect(github.publicRepos).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(github.languages)).toBe(true);
    expect(github.lastPush === null || /^\d{4}-\d{2}-\d{2}$/.test(github.lastPush)).toBe(true);
  });

  it("lists languages with sensible percentages", () => {
    const total = github.languages.reduce((sum, l) => sum + l.percent, 0);
    expect(total).toBeLessThanOrEqual(100 + github.languages.length);
    github.languages.forEach((l) => {
      expect(l.name.length).toBeGreaterThan(0);
      expect(l.percent).toBeGreaterThan(0);
    });
  });
});
