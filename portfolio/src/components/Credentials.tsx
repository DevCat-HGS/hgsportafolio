import type { Copy, CredItem } from "../content";
import { stagger } from "../lib/metro";
import { Img } from "./Img";
import { asset } from "../lib/asset";

const warmed = new Set<string>();

/** Starts downloading the full-size certificate as soon as the user aims at it, so the lightbox opens with it ready. */
function warm(img: string) {
  if (warmed.has(img)) return;
  warmed.add(img);
  new Image().src = asset(`credentials/${img}.webp`);
  void import("./Lightbox");
}

const warmProps = (img: string) => ({
  onPointerEnter: () => warm(img),
  onPointerDown: () => warm(img),
  onFocus: () => warm(img),
});

export function Credentials({ t, onOpen }: { t: Copy; onOpen: (item: CredItem) => void }) {
  return (
    <>
      <section className="section" id="credentials">
        <div className="wrap">
          <div className="section-head">
            <h2 className="display">{t.credTitle}</h2>
            <p className="lede">{t.credLead}</p>
          </div>
          {t.credGroups.map((g, gi) => (
            <div className="cred-group" key={gi}>
              <h3 className="cred-k">{g.k}</h3>
              {"compact" in g && g.compact ? (
                <ul className="cred-list">
                  {g.items.map((it) => (
                    <li key={it.img}>
                      <span className="cred-list-title">{it.title}</span>
                      <span className="cred-meta">{it.meta}</span>
                      <button
                        type="button"
                        className="cred-view"
                        onClick={() => onOpen(it)}
                        {...warmProps(it.img)}
                        aria-label={`${t.credView}: ${it.title}`}
                      >
                        {t.credViewShort}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="cred-grid">
                  {g.items.map((it, idx) => (
                    <button
                      type="button"
                      className="cred"
                      key={it.img}
                      style={stagger(idx)}
                      onClick={() => onOpen(it)}
                      {...warmProps(it.img)}
                      aria-label={`${t.credView}: ${it.title}`}
                    >
                      <span className="cred-img">
                        <Img
                          src={asset(`credentials/thumb/${it.img}.webp`)}
                          srcSet={`${asset(`credentials/thumb/${it.img}-360.webp`)} 360w, ${asset(`credentials/thumb/${it.img}.webp`)} 560w`}
                          sizes="(max-width: 760px) 92vw, 380px"
                          alt=""
                          width={560}
                          height={420}
                        />
                      </span>
                      <span className="cred-title">{it.title}</span>
                      <span className="cred-meta">{it.meta}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
