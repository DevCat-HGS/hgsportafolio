import type { Copy } from "../content";
import { ContactForm } from "./ContactForm";
import { GithubStats } from "./GithubStats";
import { Socials } from "./Socials";

export function Close({ t }: { t: Copy }) {
  return (
    <>
      <section className="section close" id="close">
        <div className="wrap">
          <h2 className="display">{t.closeTitle}</h2>
          <p className="lede">{t.closeBody}</p>
          <a className="mail" href={`mailto:${t.email}`}>
            {t.email}
          </a>
          <Socials links={t.links} cv={t.cv} />
          <aside className="audit" aria-labelledby="audit-title">
            <p className="audit-eyebrow">{t.audit.eyebrow}</p>
            <h3 id="audit-title">{t.audit.title}</h3>
            <p>{t.audit.body}</p>
            <div className="audit-links">
              {t.audit.links.map((l, i) => (
                <a
                  key={l.href}
                  className={i === 0 ? "side-cta primary" : "side-cta"}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  data-umami-event={l.event}
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          </aside>
          <ContactForm t={t} />
          <GithubStats t={t} />
          <nav className="map" aria-label={t.mapLabel}>
            <ol>
              {t.chapters.map((c) => (
                <li key={c.id}>
                  <a href={`#${c.id}`} className={c.id === "close" ? "is-here" : undefined}>
                    <i aria-hidden="true" />
                    <span>{c.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>
    </>
  );
}
