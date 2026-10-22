import { useEffect, useRef, useState } from "react";
import type { CredItem } from "../content";
import { Img } from "./Img";
import { asset } from "../lib/asset";

export function Lightbox({ item, close, label }: { item: CredItem; close: () => void; label: string }) {
  const closeButton = useRef<HTMLButtonElement>(null);
  // Captured during the first render, before autoFocus moves focus to the close button.
  const [opener] = useState(() => document.activeElement as HTMLElement | null);
  // `close` changes identity on every parent render; keeping it in a ref keeps the effect below mounted once.
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      // Único control del diálogo: el foco no debe escaparse a la página de detrás.
      if (e.key === "Tab") {
        e.preventDefault();
        closeButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      opener?.focus?.();
    };
  }, [opener]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={item.title} onClick={close}>
      <figure onClick={(e) => e.stopPropagation()}>
        <Img src={asset(`credentials/${item.img}.webp`)} alt={item.title} />
        <figcaption>
          <strong>{item.title}</strong>
          <span>{item.meta}</span>
        </figcaption>
      </figure>
      <button ref={closeButton} type="button" className="lightbox-close" onClick={close} autoFocus>
        {label}
      </button>
    </div>
  );
}
