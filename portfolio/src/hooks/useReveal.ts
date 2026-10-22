import { useEffect } from "react";
import { SELECTORS } from "./selectors";

/**
 * Entrada escalonada al cruzar el viewport. Sin JS o con movimiento reducido todo se ve de entrada.
 * `selector` elige qué aparece; por defecto, los bloques de la página principal.
 */
export function useReveal(selector: string = SELECTORS.reveal) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const root = document.documentElement;
    const nodes = document.querySelectorAll<HTMLElement>(selector);
    nodes.forEach((n) => n.setAttribute("data-r", ""));
    root.classList.add("reveal-on");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => {
      io.disconnect();
      root.classList.remove("reveal-on");
      nodes.forEach((n) => n.removeAttribute("data-r"));
    };
  }, [selector]);
}
