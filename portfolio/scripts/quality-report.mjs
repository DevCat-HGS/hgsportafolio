// Builds the markdown for the pull request quality comment from the files the CI job produced:
//   .reports/lighthouse-summary.json   (scripts/lighthouse.mjs)
//   .reports/playwright.json           (Playwright JSON reporter)
//   .reports/baseline/lighthouse-summary.json (the same file from the last run on main, when available)
// ARTIFACT_URL, when set, links the downloadable screenshots and reports.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const MARKER = "<!-- quality-report -->";
const read = (path) => (existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null);
const pct = (n) => Math.round(n * 100);

const lh = read(".reports/lighthouse-summary.json");
const base = read(".reports/baseline/lighthouse-summary.json");

/** "+3" / "−2" against main, or "" when equal or there is no baseline. */
const delta = (preset, cat, now) => {
  const before = base?.[preset]?.scores?.[cat];
  if (before == null) return "";
  const d = pct(now) - pct(before);
  return d === 0 ? "" : ` (${d > 0 ? "+" : "−"}${Math.abs(d)})`;
};
const pw = read(".reports/playwright.json");
const lines = [MARKER, "### Quality report", ""];

lines.push(
  `**Lighthouse** (median of several runs, production build${base ? "; in brackets, the change against main" : ""})`,
  "",
);
if (lh) {
  lines.push(
    "| Device | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | Result |",
    "| :-- | --: | --: | --: | --: | --: | --: | --: | :-- |",
  );
  for (const [preset, s] of Object.entries(lh)) {
    const c = s.scores;
    const cell = (cat) =>
      `${pct(c[cat])}${delta(preset, cat, c[cat])}${c[cat] < s.budgets[cat] ? " (min " + pct(s.budgets[cat]) + ")" : ""}`;
    lines.push(
      `| ${preset} | ${cell("performance")} | ${cell("accessibility")} | ${cell("best-practices")} | ${cell("seo")} | ${s.metrics.lcp} | ${s.metrics.tbt} | ${s.metrics.cls} | ${s.misses.length ? "**Fail**" : "Pass"} |`,
    );
  }
} else {
  lines.push("Lighthouse did not produce a report. Check the job log.");
}

lines.push("", "**Browser checks** (accessibility with axe, keyboard behavior)", "");
if (pw) {
  const { expected = 0, unexpected = 0, skipped = 0, flaky = 0 } = pw.stats ?? {};
  lines.push(`${expected} passed, ${unexpected} failed, ${flaky} flaky, ${skipped} skipped.`);
  const failures = [];
  const walk = (suite, trail) => {
    const here = suite.title && !suite.file ? [...trail, suite.title] : trail;
    (suite.specs ?? []).forEach((spec) => {
      if (!spec.ok) failures.push([...here, spec.title].join(" > "));
    });
    (suite.suites ?? []).forEach((s) => walk(s, here));
  };
  (pw.suites ?? []).forEach((s) => walk(s, []));
  if (failures.length) lines.push("", ...failures.map((f) => `- ${f}`));
} else {
  lines.push("The browser checks did not produce a report. Check the job log.");
}

lines.push("", "**Screenshots**", "");
lines.push(
  process.env.ARTIFACT_URL
    ? `Hero, practice, startup, projects and stack, in Spanish and English at mobile and desktop widths: [download the screenshots and reports](${process.env.ARTIFACT_URL}).`
    : "Not available for this run.",
);
lines.push("", "<sub>Updated on every push. Budgets live in `portfolio/scripts/lighthouse.mjs`.</sub>");

writeFileSync(".reports/quality-comment.md", lines.join("\n") + "\n");
console.log(lines.join("\n"));
