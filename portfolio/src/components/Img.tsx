import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";

/** Imagen que aparece con fundido al terminar de cargar (sobre un fondo con brillo mientras tanto). */
export function Img({ className = "", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ref.current?.complete) setReady(true);
  }, []);

  return (
    <img
      ref={ref}
      className={`${className} fade${ready ? " is-loaded" : ""}`.trim()}
      decoding="async"
      onLoad={() => setReady(true)}
      {...props}
    />
  );
}
