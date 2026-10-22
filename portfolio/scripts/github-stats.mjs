// Builds src/data/github.json from the public GitHub API, so the site never hard-codes these numbers.
//   npm run github-stats
// Only public, non-fork repositories count, and the profile README repository is left out (it has no code).
// GITHUB_TOKEN is optional; it only raises the API rate limit.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const USER = "DevCat-HGS";
const PROFILE_REPO = USER;
const TOP_LANGUAGES = 5;
const output = resolve(import.meta.dirname, "../src/data/github.json");

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": `${USER}-portfolio`,
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${path}`);
  return res.json();
}

const repos = (await api(`/users/${USER}/repos?type=owner&per_page=100&sort=pushed`)).filter(
  (r) => !r.fork && !r.archived && r.name !== PROFILE_REPO,
);

const bytes = new Map();
for (const repo of repos) {
  const langs = await api(`/repos/${USER}/${repo.name}/languages`);
  for (const [name, n] of Object.entries(langs)) bytes.set(name, (bytes.get(name) ?? 0) + n);
}

const total = [...bytes.values()].reduce((a, b) => a + b, 0);
const languages = [...bytes.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, TOP_LANGUAGES)
  .map(([name, n]) => ({ name, percent: Math.round((n / total) * 100) }));

const lastPush =
  repos
    .map((r) => r.pushed_at)
    .sort()
    .at(-1)
    ?.slice(0, 10) ?? null;
const next = { publicRepos: repos.length, languages, lastPush };

let current = "";
try {
  current = readFileSync(output, "utf8");
} catch {
  /* first run */
}
const text = JSON.stringify(next, null, 2) + "\n";
if (text === current) {
  console.log("github.json is already up to date.");
} else {
  writeFileSync(output, text);
  console.log("Updated github.json:", next);
}
