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
