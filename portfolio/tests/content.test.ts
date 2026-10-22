import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CHAPTER_IDS, copy, stackTech } from "../src/content";
import { projectsFrom } from "../src/content/projects";
import migozz from "../src/content/data/migozz.json";
import seo from "../src/content/data/seo.json";
import site from "../src/content/data/site.json";

const PUBLIC = resolve(__dirname, "../public");
const inPublic = (path: string) => existsSync(resolve(PUBLIC, path));
const locales = Object.keys(copy) as (keyof typeof copy)[];

/** Describes the structure of a value (keys and array lengths) without its text, so languages can be compared. */
function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, shape(v)]),
    );
  }
  return typeof value;
}

describe("languages", () => {
  it("expose the same structure in English and Spanish", () => {
    expect(shape(copy.es)).toEqual(shape(copy.en));
  });

  it("have no empty strings", () => {
    const empties: string[] = [];
    const walk = (v: unknown, path: string) => {
      if (typeof v === "string" && v.trim() === "") empties.push(path);
      else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
      else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => walk(x, `${path}.${k}`));
    };
    locales.forEach((l) => walk(copy[l], l));
    expect(empties).toEqual([]);
  });
});

describe.each(locales)("%s chapters", (locale) => {
  it("follow CHAPTER_IDS in order", () => {
    expect(copy[locale].chapters.map((c) => c.id)).toEqual([...CHAPTER_IDS]);
  });
});

describe("projects", () => {
  it("use the same ids in the same order in both languages", () => {
    expect(copy.es.projects.map((p) => p.id)).toEqual(copy.en.projects.map((p) => p.id));
  });

  it.each(locales)("have unique ids and a result (%s)", (locale) => {
    const ids = copy[locale].projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    copy[locale].projects.forEach((p) => expect(p.result.length).toBeGreaterThan(0));
  });

  it("link only over https", () => {
    copy.en.projects.forEach((p) => {
      [p.href, p.clientHref].filter(Boolean).forEach((url) => expect(url).toMatch(/^https:\/\//));
    });
  });

  it("point at images that exist, including the small variant", () => {
    copy.en.projects.forEach((p) => {
      if (p.shot) {
        expect(inPublic(p.shot), p.shot).toBe(true);
        expect(inPublic(p.shot.replace(".webp", "-480.webp")), `${p.shot} (480w)`).toBe(true);
        expect(p.alt, `${p.id} alt`).toBeTruthy();
      }
      if (p.logo) expect(inPublic(p.logo), p.logo).toBe(true);
    });
  });
});

describe("credentials", () => {
  it("have a full image and both thumbnails", () => {
    copy.en.credGroups
      .flatMap((g) => g.items)
      .forEach((it) => {
        expect(inPublic(`credentials/${it.img}.webp`), it.img).toBe(true);
        expect(inPublic(`credentials/thumb/${it.img}.webp`), `${it.img} thumb`).toBe(true);
        expect(inPublic(`credentials/thumb/${it.img}-360.webp`), `${it.img} thumb 360`).toBe(true);
      });
  });
});

describe("stack", () => {
  it("lists technologies for every group and no extras", () => {
    const groups = copy.en.stackGroups.map((g) => g.id).sort();
    expect(Object.keys(stackTech).sort()).toEqual(groups);
  });

  it("only references icons that exist", () => {
    Object.values(stackTech)
      .flat()
      .forEach((tech) => {
        if (tech.i) expect(inPublic(`icons/${tech.i}.svg`), tech.i).toBe(true);
      });
  });
});

describe("contact", () => {
  it.each(locales)("has a valid email and https links (%s)", (locale) => {
    expect(copy[locale].email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    copy[locale].links.forEach((l) => expect(l.href).toMatch(/^https:\/\//));
  });

  it("points the CV at files that exist", () => {
    locales.forEach((l) => expect(inPublic(copy[l].cv.href), copy[l].cv.href).toBe(true));
  });
});

describe("projects written by the admin editor", () => {
  const base = {
    es: { title: "A", tag: "T", dek: "D", result: "R" },
    en: { title: "A", tag: "T", dek: "D", result: "R" },
  };

  it("skips hidden entries and drops empty optional values", () => {
    const out = projectsFrom(
      [
        { id: "a", ...base, href: "", hue: null, featured: false, shot: "", stack: [" React ", ""] },
        { id: "b", ...base, hidden: true },
      ],
      "es",
    );
    expect(out).toEqual([{ id: "a", title: "A", tag: "T", dek: "D", result: "R", stack: ["React"] }]);
  });

  it("points an uploaded original at its generated WebP", () => {
    const [p] = projectsFrom([{ id: "a", ...base, shot: "shots/nueva-captura.png" }], "en");
    expect(p.shot).toBe("shots/nueva-captura.webp");
  });
});

describe("editable data files", () => {
  /** Paths of every key, with list positions collapsed, so lists of different length still compare by item shape. */
  const shape = (v: unknown, path = ""): string[] =>
    Array.isArray(v)
      ? v.flatMap((x) => shape(x, `${path}[]`))
      : v && typeof v === "object"
        ? Object.entries(v).flatMap(([k, x]) => [`${path}.${k}`, ...shape(x, `${path}.${k}`)])
        : [];
  const same = (a: unknown, b: unknown) => expect([...new Set(shape(a))].sort()).toEqual([...new Set(shape(b))].sort());

  it("keeps Spanish and English with the same keys", () => {
    same(site.es, site.en);
    same(migozz.es, migozz.en);
    same(seo.pages.es, seo.pages.en);
    same(seo.migozzPages.es, seo.migozzPages.en);
  });
});
