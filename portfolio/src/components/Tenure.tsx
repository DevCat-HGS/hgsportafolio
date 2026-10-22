import type { Copy } from "../content";

export function Tenure({ t }: { t: Copy }) {
  return (
    <>
      <section className="tenure" id="tenure">
        <div className="wrap tenure-sticky">
          <div>
            <span className="status past">{t.tenureStatus}</span>
            <h2 className="display company">{t.tenureCompany}</h2>
            <p className="role">
              {t.tenureRole}
              <br />
              {t.tenurePlace}
            </p>
          </div>
          <div className="beats">
            {t.tenureBeats.map((b) => (
              <article className="beat" key={b.n}>
                <div>
                  <h3>{b.title}</h3>
                  <p>{b.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
