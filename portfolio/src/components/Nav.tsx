import type { CSSProperties } from "react";
import type { Copy, Locale } from "../content";

export function Nav({
  t,
  locale,
  active,
  onToggleLocale,
}: {
  t: Copy;
  locale: Locale;
  active: string;
  onToggleLocale: () => void;
}) {
  return (
    <>
      <header className="nav">
        <a className="wordmark" href="#intro">
          {t.wordmark}
        </a>
        <span className="here" aria-hidden="true">
          {t.chapters.find((c) => c.id === active)?.label}
        </span>
        <button
          className="lang"
          type="button"
          onClick={onToggleLocale}
          aria-label={locale === "en" ? "ES · Cambiar a español" : "EN · Switch to English"}
        >
          {t.langLabel}
        </button>
      </header>

      <nav className="line" aria-label="Chapters">
        <span className="line-fill" aria-hidden="true" />
        <span className="train" aria-hidden="true" />
        {t.chapters.map((c, i) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            className={active === c.id ? "stop is-active" : "stop"}
            style={{ ["--at" as string]: i / (t.chapters.length - 1) } as CSSProperties}
            aria-current={active === c.id ? "true" : undefined}
            aria-label={c.label}
          >
            <i aria-hidden="true" />
            <span>{c.label}</span>
          </a>
        ))}
      </nav>
    </>
  );
}
