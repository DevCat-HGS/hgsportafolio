import { useEffect } from "react";

/**
 * Hides the welcome screen once fonts are ready and the minimum display time has passed, then lets the hero play.
 * It does not wait for the project and credential images: they load eagerly right behind it, and holding the splash
 * for them cost about 1.5 s of Speed Index on desktop (Lighthouse 93 → 98).
 */
export function useSplash() {
  useEffect(() => {
    const splash = document.getElementById("splash");
    if (!splash) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minShow = reduced ? 250 : 1500;
    const wait = new Promise((r) => window.setTimeout(r, Math.max(0, minShow - performance.now())));
    Promise.all([document.fonts.ready, wait]).then(() => {
      splash.classList.add("hide");
      document.documentElement.classList.remove("is-loading");
      document.documentElement.classList.add("is-ready");
      window.setTimeout(() => splash.remove(), 900);
    });
  }, []);
}
