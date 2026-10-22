import { useEffect } from "react";
import { CHAPTER_IDS } from "../content";
import { SELECTORS } from "./selectors";

/** Moves the train along the line: --line is 0..1 across the chapter stations. */
export function useScrollScene() {
  useEffect(() => {
    const line = document.querySelector<HTMLElement>(SELECTORS.line);
    const marquees = document.querySelectorAll<HTMLElement>(SELECTORS.marquee);
    let frame = 0;
    let tops: number[] = [];

    // Las posiciones solo cambian al redimensionar o cargar contenido: medirlas en cada scroll fuerza layout.
    const measure = () => {
      tops = CHAPTER_IDS.map((id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : 0;
      });
    };

    const update = () => {
      frame = 0;

      marquees.forEach((m) => {
        const r = m.getBoundingClientRect();
        const m01 = 1 - (r.top + r.height) / (window.innerHeight + r.height);
        m.style.setProperty("--m", Math.min(Math.max(m01, 0), 1).toFixed(4));
      });

      const y = window.scrollY + window.innerHeight * 0.4;
      let i = 0;
      while (i < tops.length - 1 && y >= tops[i + 1]) i++;
      const end = i < tops.length - 1 ? tops[i + 1] : tops[i] + window.innerHeight;
      const f = Math.min(Math.max((y - tops[i]) / Math.max(end - tops[i], 1), 0), 1);
      line?.style.setProperty("--line", ((i + (i < tops.length - 1 ? f : 0)) / (tops.length - 1)).toFixed(4));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const remeasure = () => {
      measure();
      schedule();
    };

    measure();
    update();
    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    window.addEventListener("load", remeasure);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("load", remeasure);
    };
  }, []);
}
