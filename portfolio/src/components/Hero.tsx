import type { Copy } from "../content";
import { stagger } from "../lib/metro";
import { LineArt } from "./LineArt";
import { Socials } from "./Socials";

export function Hero({ t }: { t: Copy }) {
  return (
    <>
      <section className="hero" id="intro">
        <LineArt />
        <div className="hero-inner">
          <p className="kicker">{t.heroKicker}</p>
          <h1 className="display">
            <span className="sr-only">Harol Guerrero Salgado </span>
            <span className="mask" aria-hidden="true">
              <span style={stagger(0)}>{t.heroName[0]}</span>
            </span>
            <span className="mask" aria-hidden="true">
              <span style={stagger(1)}>{t.heroName[1]}</span>
            </span>
          </h1>
          <div className="hero-bottom">
            <p className="lede">{t.heroDek}</p>
            <div className="signs">
              <a className="sign now" href="#startup">
                <i aria-hidden="true" />
                {t.heroNow}
              </a>
              <p className="sign open">
                <i aria-hidden="true" />
                {t.heroOpen}
              </p>
            </div>
          </div>
          <dl className="stats">
            {t.heroStats.map((st) => (
              <div key={st.l}>
                <dt>{st.n}</dt>
                <dd>{st.l}</dd>
              </div>
            ))}
          </dl>
          <div className="hero-foot">
            <Socials links={t.links} cv={t.cv} />
            <ul className="meta">
              {t.heroMeta.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            <a className="scroll-cue" href="#practice">
              {t.scroll}
            </a>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1, 2, 3].map((n) => (
            <span key={n}>{t.marquee}</span>
          ))}
        </div>
      </div>
    </>
  );
}
