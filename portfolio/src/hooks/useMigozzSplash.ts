import { useEffect, useState } from "react";

/**
 * Lifts the MIGOZZ loading screen (inline in migozz/index.html) once the fonts are ready and it has been visible for
 * a moment, so a refresh never flashes unstyled text. Returns true when the page is showing, which is when the hero
 * animation should start.
 */
export function useMigozzSplash(minShow = 450) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const splash = document.getElementById("mz-splash");
    const root = document.documentElement;
    const wait = new Promise((r) => window.setTimeout(r, Math.max(0, minShow - performance.now())));
    let removed = 0;
    let alive = true;
    Promise.all([document.fonts.ready, wait]).then(() => {
      if (!alive) return;
      splash?.classList.add("hide");
      root.classList.remove("mz-loading");
      setReady(true);
      removed = window.setTimeout(() => splash?.remove(), 600);
    });
    return () => {
      alive = false;
      window.clearTimeout(removed);
    };
  }, [minShow]);

  return ready;
}
