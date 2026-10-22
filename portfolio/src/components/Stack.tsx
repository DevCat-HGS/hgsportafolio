import { useState } from "react";
import { stackTech, type Copy } from "../content";
import { stagger } from "../lib/metro";
import { asset } from "../lib/asset";

function EyeIcon({ off }: { off?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {off ? <path d="M3 3l18 18" /> : null}
    </svg>
  );
}

export function Stack({ t }: { t: Copy }) {
  const [openUnit, setOpenUnit] = useState<string | null>("web");

  // Acordeón: abrir una unidad cierra la anterior; volver a pulsarla la cierra.
  const toggleUnit = (id: string) => {
    setOpenUnit((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <section className="section dark" id="stack">
        <div className="wrap">
          <div className="section-head">
            <h2 className="display">{t.stackTitle}</h2>
          </div>
          <div className="rack">
            {t.stackGroups.map((g, idx) => {
              const isOpen = openUnit === g.id;
              return (
                <div
                  className={g.secondary ? "unit secondary" : "unit"}
                  key={g.id}
                  style={stagger(idx)}
                  data-open={isOpen ? "" : undefined}
                >
                  <div className="unit-head">
                    <span className="unit-leds" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    <div className="unit-text">
                      <span className="unit-k">{g.k}</span>
                      <span className="unit-v">{g.v}</span>
                    </div>
                    <button
                      type="button"
                      className="unit-eye"
                      onClick={() => toggleUnit(g.id)}
                      aria-expanded={isOpen}
                      aria-controls={`unit-${g.id}`}
                    >
                      <EyeIcon off={isOpen} />
                      {isOpen ? t.stackHide : t.stackView}
                    </button>
                  </div>
                  <div className="unit-panel" id={`unit-${g.id}`} data-open={isOpen ? "" : undefined}>
                    <div>
                      {/* Siempre montado: los iconos (SVG locales, ~100 KB en total) se cargan con la página y no al pulsar. */}
                      <ul className="unit-tiles">
                        {(stackTech[g.id] ?? []).map((tech) => (
                          <li key={tech.n} className={tech.i ? "tile" : "tile plain"}>
                            {tech.i ? (
                              <img src={asset(`icons/${tech.i}.svg`)} alt="" width={48} height={48} decoding="async" />
                            ) : null}
                            <span>{tech.n}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
