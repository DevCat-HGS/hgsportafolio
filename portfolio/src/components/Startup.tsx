import type { Copy } from "../content";
import { stagger } from "../lib/metro";
import { asset } from "../lib/asset";

export function Startup({ t }: { t: Copy }) {
  return (
    <>
      <section className="section dark" id="startup">
        <div className="wrap">
          <div className="section-head">
            <div className="startup-top">
              <img className="app-icon" src={asset("migozz-icon.webp")} alt="" width={72} height={72} />
              <h2 className="display">{t.startupCompany}</h2>
              <span className="status">
                <i aria-hidden="true" />
                {t.startupStatus}
              </span>
            </div>
            <p className="role">
              {t.startupRole}
              <br />
              {t.startupPeriod}
            </p>
            <p className="lede">{t.startupBody}</p>
            <div className="stores">
              <a
                href={t.startupLinks.play}
                target="_blank"
                rel="noreferrer"
                aria-label="Google Play"
                data-umami-event="migozz-play"
              >
                <img src={asset("play.png")} alt="Google Play" height={48} />
              </a>
              <a
                href={t.startupLinks.apple}
                target="_blank"
                rel="noreferrer"
                aria-label="App Store"
                data-umami-event="migozz-appstore"
              >
                <img src={asset("appstore.svg")} alt="App Store" height={40} />
              </a>
              <a className="web-link" href={t.startupLinks.web} target="_blank" rel="noreferrer">
                {t.startupWeb}
              </a>
              <a className="case-link" href={t.startupCase.href} data-umami-event="migozz-case">
                <img src={asset("migozz-icon.webp")} alt="" width={26} height={26} />
                <span>{t.startupCase.label}</span>
                <svg className="case-arrow" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    d="M5 12h14m-5-5 5 5-5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div className="duties">
            {t.startupDuties.map((d, idx) => (
              <article className="card" key={d.n} style={stagger(idx)}>
                <span className="k">{d.k}</span>
                <p className="v">{d.v}</p>
              </article>
            ))}
          </div>
          <div className="tags startup-stack">
            {t.startupStack.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
