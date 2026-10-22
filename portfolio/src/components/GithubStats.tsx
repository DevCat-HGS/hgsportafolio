import type { Copy } from "../content";
import { github } from "../data/github";

/** Below this the numbers say less than their absence, so the block stays hidden until there is something to show. */
const MIN_REPOS = 3;

export function GithubStats({ t }: { t: Copy }) {
  if (github.publicRepos < MIN_REPOS) return null;

  return (
    <dl className="gh-stats">
      <div>
        <dt>{t.githubRepos}</dt>
        <dd>{github.publicRepos}</dd>
      </div>
      <div>
        <dt>{t.githubLanguages}</dt>
        <dd>{github.languages.map((l) => `${l.name} ${l.percent}%`).join(", ")}</dd>
      </div>
      {github.lastPush ? (
        <div>
          <dt>{t.githubLastPush}</dt>
          <dd>{github.lastPush}</dd>
        </div>
      ) : null}
    </dl>
  );
}
