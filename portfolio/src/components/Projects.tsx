import { useState, type CSSProperties } from "react";
import type { Copy, Project } from "../content";
import { lineStyle, METRO_LINES } from "../lib/metro";
import { Img } from "./Img";
import { asset } from "../lib/asset";

function Media({ p }: { p: Project }) {
  if (p.shot) {
    return (
      <figure className="media">
        <div className="chrome" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>{p.href ? new URL(p.href).host : p.title}</span>
        </div>
        <Img
          src={asset(p.shot)}
          srcSet={`${asset(p.shot.replace(".webp", "-480.webp"))} 480w, ${asset(p.shot)} 960w`}
          sizes="(max-width: 760px) 92vw, 560px"
          alt={p.alt ?? ""}
          width={960}
          height={600}
        />
      </figure>
    );
  }

  return (
    <div className="media art" aria-hidden="true" style={{ ["--h" as string]: p.hue ?? 260 } as CSSProperties}>
      {p.logo ? (
        <img className="logo" src={asset(p.logo)} alt="" decoding="async" />
      ) : (
        <span>{p.title.replace(/[^A-Za-z]/g, "").slice(0, 2)}</span>
      )}
    </div>
  );
}

function ProjectCard({ p, idx, t }: { p: Project; idx: number; t: Copy }) {
  const live = p.href && !p.offline ? p.href : undefined;
  // A link cannot hold other links: with a case study or public code the card stays an article with separate links.
  const whole = live && !p.caseHref && !p.codeHref;
  const inner = (
    <>
      <Media p={p} />
      <div>
        <div className="project-top">
          <span className="badge" aria-hidden="true">
            {METRO_LINES[idx % METRO_LINES.length].letter}
          </span>
          <span className="tag">{p.tag}</span>
        </div>
        <h3>{p.title}</h3>
        <p className="dek">{p.dek}</p>
        <p className="result">
          <span>{t.resultLabel}</span>
          {p.result}
        </p>
      </div>
      <div>
        {p.client ? (
          <p className="client">
            <span>{p.institutional ? t.institutionalLabel : t.clientLabel}</span>
            {p.clientHref && !p.href ? (
              <a href={p.clientHref} target="_blank" rel="noreferrer">
                {p.client}
              </a>
            ) : (
              p.client
            )}
          </p>
        ) : null}
        <div className="tags">
          {p.stack.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
        {p.offline ? <div className="offline">{t.offline}</div> : null}
        {whole ? (
          <div className="visit">{t.visit}</div>
        ) : live || p.caseHref || p.codeHref ? (
          <div className="card-links">
            {live ? (
              <a className="visit" href={live} target="_blank" rel="noreferrer" data-umami-event={`project-${p.id}`}>
                {t.visit}
              </a>
            ) : null}
            {p.caseHref ? (
              <a className="visit case" href={p.caseHref} data-umami-event={`case-${p.id}`}>
                {t.caseLink} →
              </a>
            ) : null}
            {p.codeHref ? (
              <a
                className="visit code"
                href={p.codeHref}
                target="_blank"
                rel="noreferrer"
                data-umami-event={`code-${p.id}`}
              >
                {t.codeLink} ↗
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );

  if (whole) {
    return (
      <a
        className="project"
        href={p.href}
        target="_blank"
        rel="noreferrer"
        style={lineStyle(idx)}
        data-umami-event={`project-${p.id}`}
      >
        {inner}
      </a>
    );
  }

  return (
    <article className="project" style={lineStyle(idx)}>
      {inner}
    </article>
  );
}

/** One of my own products: a dark band with its pitch, highlights and every way in (case, code, download). */
function OwnProject({ p, t }: { p: Project; t: Copy }) {
  return (
    <article className="own-project" id={`own-${p.id}`} aria-labelledby={`own-${p.id}-title`}>
      <div className="own-project-copy">
        <p className="own-project-eyebrow">{p.tag}</p>
        <h4 className="display" id={`own-${p.id}-title`}>
          {p.title}
        </h4>
        <p className="lede">{p.dek}</p>
        {p.points ? (
          <ul className="own-project-points">
            {p.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        ) : null}
        <div className="own-project-links">
          {p.caseHref ? (
            <a className="side-cta primary" href={p.caseHref} data-umami-event={`case-${p.id}`}>
              {t.caseLink} →
            </a>
          ) : null}
          {p.codeHref ? (
            <a
              className="side-cta"
              href={p.codeHref}
              target="_blank"
              rel="noreferrer"
              data-umami-event={`code-${p.id}`}
            >
              {t.codeLink} ↗
            </a>
          ) : null}
          {p.downloadHref ? (
            <a
              className="side-cta"
              href={p.downloadHref}
              target="_blank"
              rel="noreferrer"
              data-umami-event={`${p.id}-download`}
            >
              {t.downloadLabel} ↗
            </a>
          ) : null}
        </div>
        <div className="tags">
          {p.stack.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>
      {p.shot ? (
        <figure className="own-project-shot">
          <img
            src={asset(p.shot)}
            srcSet={`${asset(p.shot.replace(".webp", "-480.webp"))} 480w, ${asset(p.shot)} 960w`}
            sizes="(max-width: 900px) 92vw, 560px"
            alt={p.alt ?? ""}
            width={960}
            height={600}
            loading="lazy"
            decoding="async"
          />
        </figure>
      ) : null}
    </article>
  );
}

export function Projects({ t }: { t: Copy }) {
  const [showAll, setShowAll] = useState(false);
  const own = t.projects.filter((p) => p.own);
  // El índice sale de la lista de clientes completa para que cada tarjeta conserve su línea de metro al desplegar.
  const cards = t.projects.filter((p) => !p.own).map((p, idx) => ({ p, idx }));
  const featured = cards.filter(({ p }) => p.featured);
  const rest = cards.filter(({ p }) => !p.featured);

  return (
    <section className="section" id="selected">
      <div className="wrap">
        <div className="section-head">
          <h2 className="display">{t.selectedTitle}</h2>
          <p className="lede">{t.selectedLead}</p>
        </div>
        {own.length > 0 ? (
          <div className="work-group" aria-labelledby="own-title">
            <div className="work-group-head">
              <h3 id="own-title">{t.ownTitle}</h3>
              <p>{t.ownLead}</p>
            </div>
            <div className="own-projects">
              {own.map((p) => (
                <OwnProject key={p.id} p={p} t={t} />
              ))}
            </div>
          </div>
        ) : null}
        <div className="work-group-head">
          <h3>{t.clientTitle}</h3>
        </div>
        <div className="work">
          {featured.map(({ p, idx }) => (
            <ProjectCard key={p.id} p={p} idx={idx} t={t} />
          ))}
        </div>
        {rest.length > 0 ? (
          <>
            <div className="work-more">
              <button
                type="button"
                className="social-btn"
                onClick={() => setShowAll((v) => !v)}
                aria-expanded={showAll}
                aria-controls="more-projects"
              >
                {showAll ? t.projectsLess : t.projectsMore}
              </button>
            </div>
            <div className="work" id="more-projects" hidden={!showAll}>
              {rest.map(({ p, idx }) => (
                <ProjectCard key={p.id} p={p} idx={idx} t={t} />
              ))}
            </div>
          </>
        ) : null}
        <p className="legal">{t.trademarkNote}</p>
      </div>
    </section>
  );
}
