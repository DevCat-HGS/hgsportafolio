import { Flow } from "./components/migozz/Flow";
import { HeroTitle, LinkHero } from "./components/migozz/LinkHero";
import { PublicCharts, UserCharts } from "./components/migozz/UserCharts";
import { MzIcon } from "./components/MzIcon";
import { migozz, migozzLinks, migozzTitles, type Metric } from "./content/migozz";
import { USER_DATA } from "./content/migozzUsers";
import { NETWORK_ICONS } from "./content/networkIcons";
import { useCountUp } from "./hooks/useCountUp";
import { useLocale } from "./hooks/useLocale";
import { useMigozzSplash } from "./hooks/useMigozzSplash";
import { asset } from "./lib/asset";

function MetricItem({ m }: { m: Metric }) {
  const { ref, value } = useCountUp<HTMLLIElement>(m.count ?? 0, 1300);
  return (
    <li ref={ref}>
      <span className="mz-metric-icon">
        <MzIcon name={m.icon} size={20} />
      </span>
      <strong aria-hidden="true">{m.count != null ? `${value}${m.suffix ?? ""}` : m.n}</strong>
      <span className="sr-only">{m.n}</span>
      <span className="mz-metric-label">{m.label}</span>
      <small>{m.source}</small>
    </li>
  );
}

/** MIGOZZ case study: public metrics, users, what the product does and my part in it. */
export default function MigozzPage() {
  const { locale, toggle } = useLocale(migozzTitles);
  const t = migozz[locale];
  const home = locale === "en" ? "/en/" : "/";
  const ready = useMigozzSplash();

  return (
    <>
      <header className="nav mz-nav">
        <a className="wordmark" href={home}>
          ← {t.back}
        </a>
        <button className="lang" type="button" onClick={toggle} aria-label={t.langAria}>
          {t.langLabel}
        </button>
      </header>

      <main id="main" className="mz">
        <section className="mz-hero">
          <div className="wrap mz-hero-grid">
            <div className="mz-hero-copy">
              <span className="status">
                <i aria-hidden="true" />
                {t.status}
              </span>
              <HeroTitle text="MIGOZZ" play={ready} />
              <p className="mz-tagline">{t.tagline}</p>
              <p className="lede">{t.lede}</p>
              <div className="stores">
                <a href={migozzLinks.play} target="_blank" rel="noreferrer" aria-label="Google Play">
                  <img src={asset("play.png")} alt="Google Play" height={48} />
                </a>
                <a href={migozzLinks.apple} target="_blank" rel="noreferrer" aria-label="App Store">
                  <img src={asset("appstore.svg")} alt="App Store" height={40} />
                </a>
                <a className="web-link" href={migozzLinks.web} target="_blank" rel="noreferrer">
                  migozz.com
                </a>
              </div>
            </div>
            <LinkHero label={t.orbitLabel} play={ready} />
          </div>
        </section>

        <section className="mz-section mz-metrics-band" aria-labelledby="mz-metrics">
          <div className="wrap">
            <h2 className="mz-h2" id="mz-metrics">
              {t.metricsTitle}
            </h2>
            <ul className="mz-metrics">
              {t.metrics.map((m) => (
                <MetricItem m={m} key={m.label} />
              ))}
            </ul>
            <p className="mz-note">{t.metricsNote}</p>
          </div>
        </section>

        <PublicCharts locale={locale} />

        {USER_DATA ? <UserCharts data={USER_DATA} locale={locale} /> : null}

        <Flow title={t.flowTitle} step={t.flowStep} steps={t.flow} />

        <section className="mz-section" aria-labelledby="mz-problem">
          <div className="wrap mz-split">
            <div>
              <h2 className="mz-h2" id="mz-problem">
                {t.problemTitle}
              </h2>
              <ul className="mz-problem">
                {t.problem.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div className="mz-solution">
              <h2 className="mz-h2">{t.solutionTitle}</h2>
              <p>{t.solution}</p>
            </div>
          </div>
        </section>

        <section className="mz-section" aria-labelledby="mz-features">
          <div className="wrap">
            <h2 className="mz-h2" id="mz-features">
              {t.featuresTitle}
            </h2>
            <ul className="mz-features">
              {t.features.map((f) => (
                <li className="mz-feature" key={f.k}>
                  {f.icon ? (
                    <span className="mz-feature-icon">
                      <MzIcon name={f.icon} />
                    </span>
                  ) : null}
                  <div>
                    <h3>{f.k}</h3>
                    <p>{f.v}</p>
                  </div>
                </li>
              ))}
            </ul>
            <h3 className="mz-h3">{t.networksTitle}</h3>
            <ul className="mz-networks">
              {NETWORK_ICONS.map((n) => (
                <li key={n.name}>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                    <path d={n.path} fill={n.color} />
                  </svg>
                  {n.name}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mz-section" aria-labelledby="mz-timeline">
          <div className="wrap">
            <h2 className="mz-h2" id="mz-timeline">
              {t.timelineTitle}
            </h2>
            <ol className="mz-timeline">
              {t.timeline.map((m) => (
                <li className="mz-milestone" key={m.date}>
                  <time>{m.date}</time>
                  <h3>{m.k}</h3>
                  <p>{m.v}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {t.shots.length > 0 ? (
          <section className="mz-section" aria-labelledby="mz-shots">
            <div className="wrap">
              <h2 className="mz-h2" id="mz-shots">
                {t.shotsTitle}
              </h2>
              <div className="mz-shots">
                {t.shots.map((s) => (
                  <figure className="mz-phone" key={s.src}>
                    <img src={asset(s.src)} alt={s.alt} width={390} height={844} loading="lazy" decoding="async" />
                    <figcaption>{s.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="mz-section" aria-labelledby="mz-role">
          <div className="wrap">
            <h2 className="mz-h2" id="mz-role">
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
            <div className="tags">
              {t.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
            <div className="mz-cta">
              <a className="mz-btn" href={migozzLinks.web} target="_blank" rel="noreferrer">
                {t.visit}
              </a>
              <a className="mz-btn mz-btn-ghost" href={home}>
                ← {t.back}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer mz-footer">
        <div className="wrap">{t.footer}</div>
      </footer>
    </>
  );
}
