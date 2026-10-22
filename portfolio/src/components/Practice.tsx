import type { Copy } from "../content";
import { stagger } from "../lib/metro";
import { Img } from "./Img";

export function Practice({ t }: { t: Copy }) {
  return (
    <>
      <section className="section" id="practice">
        <div className="wrap">
          <div className="section-head">
            <div className="practice-grid">
              <h2 className="display">{t.practiceTitle}</h2>
              <div className="practice-side">
                <figure className="portrait">
                  <Img src="/portrait/harol.webp" width={364} height={364} loading="lazy" alt={t.portraitAlt} />
                </figure>
                <p className="aside">{t.practiceAside}</p>
              </div>
            </div>
            <p className="lede">{t.practiceBody}</p>
          </div>
          <div className="bento">
            {t.bento.map((item, idx) => (
              <article className="card" key={item.k} style={stagger(idx)}>
                <span className="k">{item.k}</span>
                <p className="v">{item.v}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
