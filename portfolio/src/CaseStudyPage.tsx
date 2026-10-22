import type { CaseCopy, Line } from "./content/caseStudy";
import type { Locale } from "./content/types";
import { useLocale } from "./hooks/useLocale";
import { asset } from "./lib/asset";

/** One line of the architecture map: stations in order, the shared one marked as a transfer. */
function MetroLine({ line, transfer }: { line: Line; transfer: string }) {
  return (
    <section className={`ar-line ar-line-${line.color}`} aria-label={line.name}>
      <h3 className="ar-line-name">
        <i aria-hidden="true" />
        {line.name}
      </h3>
      <ol className="ar-stops">
        {line.stops.map((s) => (
          <li className={s.transfer ? "ar-stop is-transfer" : "ar-stop"} key={s.k}>
            <span className="ar-dot" aria-hidden="true" />
            <div>
              <h4>
                {s.k}
                {s.transfer ? <span className="ar-transfer">{transfer}</span> : null}
              </h4>
              <p>{s.v}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * A case study page (ARIA, DevPanel): what it does, how it is built, what was measured and broke, and which part is
 * mine. Each page has its own entry (src/<id>.tsx) that passes its texts and title.
 */
export default function CaseStudyPage({
  name,
  copy,
  titles,
}: {
  name: string;
  copy: Record<Locale, CaseCopy>;
  titles: Record<Locale, string>;
}) {
  const { locale, toggle } = useLocale(titles);
  const t = copy[locale];
  const home = locale === "en" ? "/en/" : "/";

  return (
    <>
      <header className="nav ar-nav">
        <a className="wordmark" href={`${home}#selected`}>
          ← {t.back}
        </a>
        <button className="lang" type="button" onClick={toggle} aria-label={t.langAria}>
          {t.langLabel}
        </button>
      </header>

      <main id="main" className="ar">
        <section className="ar-hero">
          <div className="wrap">
            <p className="kicker">{t.kicker}</p>
            <h1 className="display ar-title">{name}</h1>
            <p className="ar-tagline">{t.tagline}</p>
            <p className="lede">{t.lede}</p>
            <ul className="ar-meta">
              {t.meta.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            {t.links?.length ? (
              <div className="ar-links">
                {t.links.map((l, i) => (
                  <a
                    className={i === 0 ? "ar-cta primary" : "ar-cta"}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    data-umami-event={l.event}
                    key={l.href}
                  >
                    {l.label} ↗
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="ar-section ar-numbers-band" aria-labelledby="ar-numbers">
          <div className="wrap">
            <h2 className="ar-h2" id="ar-numbers">
              {t.numbersTitle}
            </h2>
            <ul className="ar-numbers">
              {t.numbers.map((f) => (
                <li key={f.label}>
                  <strong>{f.n}</strong>
                  <span>{f.label}</span>
                  <small>{f.note}</small>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ar-section" aria-labelledby="ar-problem">
          <div className="wrap ar-split">
            <div>
              <h2 className="ar-h2" id="ar-problem">
                {t.problemTitle}
              </h2>
              <ul className="ar-problem">
                {t.problem.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div className="ar-solution">
              <h2 className="ar-h2">{t.solutionTitle}</h2>
              <p>{t.solution}</p>
            </div>
          </div>
        </section>

        {t.shots?.length ? (
          <section className="ar-section" aria-labelledby="ar-shots">
            <div className="wrap">
              <h2 className="ar-h2" id="ar-shots">
                {t.shotsTitle}
              </h2>
              <div className="ar-shots">
                {t.shots.map((s) => (
                  <figure key={s.src}>
                    <img
                      src={asset(s.src)}
                      srcSet={`${asset(s.src.replace(".webp", "-480.webp"))} 480w, ${asset(s.src)} 960w`}
                      sizes="(max-width: 900px) 92vw, 560px"
                      alt={s.alt}
                      width={960}
                      height={655}
                      loading="lazy"
                      decoding="async"
                    />
                    <figcaption>{s.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="ar-section" aria-labelledby="ar-map">
          <div className="wrap">
            <h2 className="ar-h2" id="ar-map">
              {t.mapTitle}
            </h2>
            <p className="ar-lead">{t.mapLead}</p>
            <div className="ar-map">
              {t.lines.map((line) => (
                <MetroLine line={line} transfer={t.transfer} key={line.name} />
              ))}
            </div>
          </div>
        </section>

        <section className="ar-section" aria-labelledby="ar-decisions">
          <div className="wrap">
            <h2 className="ar-h2" id="ar-decisions">
              {t.decisionsTitle}
            </h2>
            <ol className="ar-cards">
              {t.decisions.map((d) => (
                <li className="ar-card" key={d.k}>
                  <h3>{d.k}</h3>
                  <p>{d.v}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="ar-section ar-broke-band" aria-labelledby="ar-broke">
          <div className="wrap">
            <h2 className="ar-h2" id="ar-broke">
              {t.brokeTitle}
            </h2>
            <ul className="ar-broke">
              {t.broke.map((b) => (
                <li key={b.k}>
                  <h3>{b.k}</h3>
                  <p>{b.v}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ar-section" aria-labelledby="ar-role">
          <div className="wrap">
            <h2 className="ar-h2" id="ar-role">
              {t.roleTitle}
            </h2>
            <p className="role">
              {t.role}
              <br />
              {t.period}
            </p>
            <div className="duties">
              {t.duties.map((d) => (
                <article className="card" key={d.k}>
                  <span className="k">{d.k}</span>
                  <p className="v">{d.v}</p>
                </article>
              ))}
            </div>
            {t.teamNote ? <p className="ar-team">{t.teamNote}</p> : null}
            <div className="tags">
              {t.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="ar-section" aria-labelledby="ar-next">
          <div className="wrap">
            <h2 className="ar-h2" id="ar-next">
              {t.nextTitle}
            </h2>
            <ul className="ar-next">
              {t.next.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            <a className="ar-back" href={`${home}#selected`}>
              ← {t.back}
            </a>
          </div>
        </section>
      </main>

      <footer className="footer ar-footer">
        <div className="wrap">{t.footer}</div>
      </footer>
    </>
  );
}
