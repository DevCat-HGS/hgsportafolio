// Cross-platform wrapper: sets SCREENSHOTS=1 and runs the capture spec (see e2e/screenshots.spec.ts).
import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["playwright", "test", "screenshots"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, SCREENSHOTS: "1" },
});
process.exit(result.status ?? 1);
