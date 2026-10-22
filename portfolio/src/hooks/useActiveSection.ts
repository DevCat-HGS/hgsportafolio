import { useEffect, useState } from "react";
import { CHAPTER_IDS } from "../content";

export function useActiveSection() {
  const [id, setId] = useState<string>("intro");

  useEffect(() => {
    const nodes = CHAPTER_IDS.map((key) => document.getElementById(key)).filter((n): n is HTMLElement => Boolean(n));
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit?.target.id) setId(hit.target.id);
      },
      // Banda delgada a media pantalla: la sección que la cruza es la parada actual, sin importar su altura.
      { rootMargin: "-45% 0px -54% 0px", threshold: 0 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.on = id;
  }, [id]);

  return id;
}
