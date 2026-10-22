import raw from "./github.json";

export interface GithubData {
  publicRepos: number;
  languages: { name: string; percent: number }[];
  lastPush: string | null;
}

/** Generated weekly by scripts/github-stats.mjs; do not edit github.json by hand. */
export const github: GithubData = raw;
