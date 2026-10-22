// Runs Lighthouse against a running preview (default http://localhost:4173/) for mobile and desktop,
// keeps the median run of each, prints a table and exits with 1 when a budget is missed.
//
//   npm run build && npm run preview &   # in another terminal
//   npm run lighthouse
//
// LH_URL overrides the address, LH_RUNS the number of runs per preset (default 3).
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const URL = process.env.LH_URL ?? "http://localhost:4173/";
const RUNS = Number(process.env.LH_RUNS ?? 3);
// Pinned so scores stay comparable between runs; bump deliberately.
const LIGHTHOUSE = "lighthouse@12.8.2";
const OUT = ".reports";

/** Minimum score per category (0 to 1). Mobile is the strict one: it simulates a slow phone. */
const BUDGETS = {
  mobile: { performance: 0.9, accessibility: 1, "best-practices": 0.95, seo: 0.95 },
  desktop: { performance: 0.95, accessibility: 1, "best-practices": 0.95, seo: 0.95 },
};

mkdirSync(OUT, { recursive: true });

// Chrome sometimes fails to record the trace (NO_NAVSTART and similar runtime errors): that says nothing about the
// page, so a failed run is retried. A low score is a result, not an error, and is never retried.
const ATTEMPTS = 3;

function run(preset, i) {
  const file = `${OUT}/lh-${preset}-${i}.json`;
  const flags = `--headless=new --no-sandbox`;
  const presetArg = preset === "desktop" ? "--preset=desktop" : "";
  for (let attempt = 1; ; attempt++) {
    try {
      execSync(
        `npx --yes ${LIGHTHOUSE} ${URL} ${presetArg} --only-categories=performance,accessibility,best-practices,seo ` +
          `--output=json --output-path="${file}" --chrome-flags="${flags}" --quiet`,
        { stdio: ["ignore", "ignore", "inherit"] },
      );
      return JSON.parse(readFileSync(file, "utf8"));
    } catch (e) {
      if (attempt >= ATTEMPTS) throw e;
      console.warn(`Lighthouse ${preset} run ${i + 1} failed (attempt ${attempt} of ${ATTEMPTS}), retrying.`);
    }
  }
}

const summary = {};
let failed = false;

for (const preset of Object.keys(BUDGETS)) {
  const runs = Array.from({ length: RUNS }, (_, i) => run(preset, i));
  const lhr = runs.sort((a, b) => a.categories.performance.score - b.categories.performance.score)[
    Math.floor(runs.length / 2)
  ];

  const scores = Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, v.score]));
  const metrics = {
    fcp: lhr.audits["first-contentful-paint"].displayValue,
    lcp: lhr.audits["largest-contentful-paint"].displayValue,
    tbt: lhr.audits["total-blocking-time"].displayValue,
    cls: lhr.audits["cumulative-layout-shift"].displayValue,
  };
  const misses = Object.entries(BUDGETS[preset])
    .filter(([cat, min]) => scores[cat] < min)
    .map(([cat, min]) => ({ category: cat, score: scores[cat], min }));

  summary[preset] = {
    scores,
    metrics,
    budgets: BUDGETS[preset],
    misses,
    runs: RUNS,
    perfRuns: runs.map((r) => r.categories.performance.score),
  };
  if (misses.length) failed = true;
}

writeFileSync(`${OUT}/lighthouse-summary.json`, JSON.stringify(summary, null, 2));

const pct = (n) => String(Math.round(n * 100)).padStart(3);
console.log(`\nLighthouse, median of ${RUNS} runs, ${URL}\n`);
console.log("preset   perf  a11y  best  seo   LCP      TBT      CLS     result");
for (const [preset, s] of Object.entries(summary)) {
  const c = s.scores;
  console.log(
    `${preset.padEnd(8)} ${pct(c.performance)}   ${pct(c.accessibility)}   ${pct(c["best-practices"])}   ${pct(c.seo)}   ` +
      `${s.metrics.lcp.padEnd(8)} ${s.metrics.tbt.padEnd(8)} ${s.metrics.cls.padEnd(7)} ${s.misses.length ? "FAIL" : "pass"}`,
  );
  s.misses.forEach((m) => console.log(`  ${m.category}: ${pct(m.score)} is below the budget of ${pct(m.min)}`));
}
process.exit(failed ? 1 : 0);
