import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState, type PointerEvent } from "react";
import type { Locale } from "../../content";
import { FEATURED_CREATORS, IOS_RELEASES } from "../../content/migozzPublic";
import type { Platform, UserData } from "../../content/migozzUsers";

/** Platform colors, validated for color-blind separation and contrast on the white page and its #F6F1FD surface (dataviz validator). */
const PLATFORM_COLOR: Record<Platform, string> = { Android: "#9461F2", iOS: "#D26A20", Web: "#1C9FB0" };
const PLATFORM_ORDER: readonly Platform[] = ["Android", "iOS", "Web"];
const LINE = "#D43FC6";
const BAR = "#9461F2";
const EASE = [0.22, 1, 0.36, 1] as const;

const COPY = {
  es: {
    users: "Usuarios",
    publicTitle: "En números",
    growth: (pct: string, since: string) => `${pct} desde ${since}`,
    platforms: "Por plataforma",
    countries: "Por país",
    table: "Ver los datos en tabla",
    month: "Mes",
    count: "Cantidad",
    releases: "Versiones publicadas en iOS",
    releasesDelta: (days: number, every: string) => `en ${days} días, una cada ${every} días`,
    perMonth: "Versiones por mes",
    creators: "Comunidad de los creadores destacados",
    creatorsTotal: (v: string) => `${v} seguidores sumados`,
    date: "Fecha",
    creator: "Creador",
    source: (src: string, date: string) => `Fuente: ${src}, ${date}.`,
    publicSource:
      "Fuentes: historial de versiones de la App Store (muestra las 25 más recientes) y perfiles destacados de migozz.com, consultados el 10 de octubre de 2026.",
  },
  en: {
    users: "Users",
    publicTitle: "By the numbers",
    growth: (pct: string, since: string) => `${pct} since ${since}`,
    platforms: "By platform",
    countries: "By country",
    table: "See the data as a table",
    month: "Month",
    count: "Count",
    releases: "Versions released on iOS",
    releasesDelta: (days: number, every: string) => `in ${days} days, one every ${every} days`,
    perMonth: "Versions per month",
    creators: "Community of the featured creators",
    creatorsTotal: (v: string) => `${v} followers combined`,
    date: "Date",
    creator: "Creator",
    source: (src: string, date: string) => `Source: ${src}, ${date}.`,
    publicSource:
      "Sources: the App Store version history (it lists the 25 most recent) and the featured profiles on migozz.com, checked on October 10, 2026.",
  },
} as const;

/** Axis ticks on whole, tidy steps (1, 2 or 5 × 10ⁿ), about four of them, with the top just above the data. */
function niceTicks(v: number) {
  const raw = Math.max(v, 1) / 4;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = Math.max(1, [1, 2, 5, 10].map((m) => m * p).find((m) => m >= raw) ?? raw);
  const top = Math.ceil(v / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
}

const PAD = { l: 52, r: 18, t: 18, b: 34 };

/** The drawing is as wide as its box, so axis text keeps its real size on a phone instead of shrinking with it. */
function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

interface Point {
  key: string;
  /** Short label for the axis and the tooltip. */
  label: string;
  value: number;
  /** Timestamp: when present, points sit at their real date instead of evenly spaced. */
  at?: number;
}

/**
 * One series over time: the line draws itself when it scrolls into view, the area fades in under it, the last point
 * lands, and hovering shows a crosshair with the exact value. A table holds the same numbers.
 */
function TrendChart({
  title,
  delta,
  points,
  head,
  locale,
  big,
}: {
  title: string;
  delta?: string;
  points: readonly Point[];
  head: readonly [string, string];
  locale: Locale;
  big?: string;
}) {
  const t = COPY[locale];
  const still = useReducedMotion();
  const gradient = useId();
  const [hover, setHover] = useState<number | null>(null);
  const { ref: box, width: W } = useWidth<HTMLDivElement>(720);
  const H = W < 520 ? 240 : 300;
  const nf = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const pts = points;

  const ticks = niceTicks(Math.max(...pts.map((p) => p.value)));
  const max = ticks[ticks.length - 1];
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const t0 = pts[0].at;
  const t1 = pts[pts.length - 1].at;
  const timed = t0 != null && t1 != null && t1 > t0;
  const x = (i: number) =>
    PAD.l +
    (pts.length === 1
      ? innerW / 2
      : timed
        ? (innerW * ((pts[i].at as number) - (t0 as number))) / ((t1 as number) - (t0 as number))
        : (innerW * i) / (pts.length - 1));
  const y = (v: number) => PAD.t + innerH - (innerH * v) / max;
  // With real dates a running total stays flat until the next event, so it is drawn as steps; otherwise a line.
  const line = pts
    .map((p, i) => {
      const px = x(i).toFixed(1);
      const py = y(p.value).toFixed(1);
      if (!i) return `M${px} ${py}`;
      return timed ? `H${px} V${py}` : `L${px} ${py}`;
    })
    .join(" ");
  const base = PAD.t + innerH;
  const area = `${line} L${x(pts.length - 1).toFixed(1)} ${base} L${x(0).toFixed(1)} ${base} Z`;
  // Axis labels at least ~64 px apart; the first and the last are always shown.
  const shown = new Set<number>([0, pts.length - 1]);
  let lastX = x(0);
  pts.forEach((_, i) => {
    if (x(i) - lastX >= 64 && x(pts.length - 1) - x(i) >= 64) {
      shown.add(i);
      lastX = x(i);
    }
  });
  const last = pts[pts.length - 1];

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    let best = 0;
    pts.forEach((_, i) => {
      if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i;
    });
    setHover(best);
  };
  const h = hover == null ? null : pts[hover];
  const inView = { once: true, amount: 0.4 } as const;

  return (
    <figure className="mz-chart mz-chart-main">
      <figcaption className="mz-chart-head">
        <span className="mz-chart-title">{title}</span>
        <strong className="mz-chart-big">{big ?? nf.format(last.value)}</strong>
        {delta ? <span className="mz-chart-delta">{delta}</span> : null}
      </figcaption>
      <div className="mz-chart-plot" ref={box}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`${title}: ${pts.map((p) => `${p.label} ${nf.format(p.value)}`).join(", ")}`}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={LINE} stopOpacity="0.35" />
              <stop offset="1" stopColor={LINE} stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((v) => (
            <g key={v} className="mz-axis">
              <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} />
              <text x={PAD.l - 10} y={y(v)} dy="0.32em" textAnchor="end">
                {nf.format(v)}
              </text>
            </g>
          ))}
          {pts.map((p, i) => (
            <text
              key={p.key}
              className="mz-axis-x"
              x={x(i)}
              y={H - 8}
              textAnchor={i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle"}
            >
              {shown.has(i) ? p.label : ""}
            </text>
          ))}
          <motion.path
            d={area}
            fill={`url(#${CSS.escape(gradient)})`}
            initial={still ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={inView}
            transition={{ delay: 0.6, duration: 0.8 }}
          />
          <motion.path
            d={line}
            fill="none"
            stroke={LINE}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={still ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={inView}
            transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
          />
          <motion.circle
            cx={x(pts.length - 1)}
            cy={y(last.value)}
            r="6"
            fill={LINE}
            stroke="#FFFFFF"
            strokeWidth="2"
            initial={still ? false : { scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={inView}
            transition={{ delay: 1.55, type: "spring", stiffness: 400, damping: 14 }}
          />
          {hover != null && h ? (
            <g className="mz-cross">
              <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={base} />
              <circle cx={x(hover)} cy={y(h.value)} r="6" fill={LINE} stroke="#FFFFFF" strokeWidth="2" />
            </g>
          ) : null}
          {/* Hit area wider than the marks. */}
          <rect x={PAD.l} y={PAD.t} width={innerW} height={innerH} fill="transparent" />
        </svg>
        {hover != null && h ? (
          <div
            className="mz-tip"
            style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(h.value) / H) * 100}%` }}
            role="status"
          >
            <span>{h.label}</span>
            <strong>{nf.format(h.value)}</strong>
          </div>
        ) : null}
      </div>
      <details className="mz-table">
        <summary>{t.table}</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">{head[0]}</th>
              <th scope="col">{head[1]}</th>
            </tr>
          </thead>
          <tbody>
            {pts.map((p) => (
              <tr key={p.key}>
                <td>{p.label}</td>
                <td>{nf.format(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** Horizontal bars, one hue, value at the end of each bar; they grow from the left when they scroll into view. */
function BarListChart({
  title,
  total,
  rows,
  locale,
  compact,
}: {
  title: string;
  total?: string;
  rows: readonly { label: string; value: number }[];
  locale: Locale;
  compact?: boolean;
}) {
  const still = useReducedMotion();
  const nf = new Intl.NumberFormat(locale, compact ? { notation: "compact", maximumFractionDigits: 1 } : {});
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <figure className="mz-chart">
      <figcaption className="mz-chart-title">
        {title}
        {total ? <strong className="mz-chart-sub">{total}</strong> : null}
      </figcaption>
      <ul className="mz-bars">
        {rows.map((r, i) => (
          <li key={r.label}>
            <span>{r.label}</span>
            <span className="mz-bar-track">
              <motion.span
                className="mz-bar"
                style={{ width: `${(r.value / max) * 100}%`, background: BAR }}
                initial={still ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ delay: 0.1 * i, duration: 0.8, ease: EASE }}
              />
            </span>
            <strong>{nf.format(r.value)}</strong>
          </li>
        ))}
      </ul>
    </figure>
  );
}

function PlatformChart({ data, locale }: { data: UserData; locale: Locale }) {
  const t = COPY[locale];
  const still = useReducedMotion();
  const nf = new Intl.NumberFormat(locale);
  const rows = PLATFORM_ORDER.map((name) => data.platforms.find((p) => p.name === name)).filter(
    (p): p is UserData["platforms"][number] => Boolean(p && p.users > 0),
  );
  const total = rows.reduce((s, r) => s + r.users, 0);
  const share = (v: number) => `${nf.format(Math.round((v / total) * 100))} %`;

  return (
    <figure className="mz-chart">
      <figcaption className="mz-chart-title">{t.platforms}</figcaption>
      <div className="mz-stack" role="img" aria-label={rows.map((r) => `${r.name} ${share(r.users)}`).join(", ")}>
        {rows.map((r, i) => (
          <motion.span
            key={r.name}
            style={{ flexGrow: r.users, background: PLATFORM_COLOR[r.name] }}
            initial={still ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ delay: 0.15 * i, duration: 0.7, ease: EASE }}
          />
        ))}
      </div>
      <ul className="mz-legend">
        {rows.map((r) => (
          <li key={r.name}>
            <i style={{ background: PLATFORM_COLOR[r.name] }} aria-hidden="true" />
            <span>{r.name}</span>
            <strong>{share(r.users)}</strong>
            <small>{nf.format(r.users)}</small>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** Public figures, always visible: the iOS release pace and the reach of the featured creators. */
export function PublicCharts({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const nf = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
  const day = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
  const month = new Intl.DateTimeFormat(locale, { month: "long" });
  const at = (iso: string) => new Date(`${iso}T12:00:00`);

  const cumulative: Point[] = IOS_RELEASES.map((r, i) => ({
    key: r.version,
    label: day.format(at(r.date)),
    value: i + 1,
    at: at(r.date).getTime(),
  }));
  const first = at(IOS_RELEASES[0].date);
  const lastDate = at(IOS_RELEASES[IOS_RELEASES.length - 1].date);
  const days = Math.round((lastDate.getTime() - first.getTime()) / 86_400_000);
  const every = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(days / (IOS_RELEASES.length - 1));

  const perMonth = new Map<string, number>();
  IOS_RELEASES.forEach((r) => {
    const m = month.format(at(r.date));
    perMonth.set(m, (perMonth.get(m) ?? 0) + 1);
  });
  const monthRows = [...perMonth].map(([label, value]) => ({ label: label[0].toUpperCase() + label.slice(1), value }));
  const totalCommunity = FEATURED_CREATORS.reduce((s, c) => s + c.community, 0);

  return (
    <section className="mz-section" aria-labelledby="mz-public">
      <div className="wrap">
        <h2 className="mz-h2" id="mz-public">
          {t.publicTitle}
        </h2>
        <div className="mz-charts">
          <TrendChart
            title={t.releases}
            delta={t.releasesDelta(days, every)}
            points={cumulative}
            head={[t.date, t.count]}
            locale={locale}
          />
          <div className="mz-charts-side">
            <BarListChart title={t.perMonth} rows={monthRows} locale={locale} />
            <BarListChart
              title={t.creators}
              total={t.creatorsTotal(nf.format(totalCommunity))}
              rows={FEATURED_CREATORS.map((c) => ({ label: c.name, value: c.community }))}
              locale={locale}
              compact
            />
          </div>
        </div>
        <p className="mz-note">{t.publicSource}</p>
      </div>
    </section>
  );
}

/** Private figures from migozzUsers.ts: monthly trend, platform split and top countries. Hidden until filled. */
export function UserCharts({ data, locale }: { data: UserData; locale: Locale }) {
  const t = COPY[locale];
  const nf = new Intl.NumberFormat(locale);
  const monthName = new Intl.DateTimeFormat(locale, { month: "short", year: "2-digit" });
  const label = (m: string) => monthName.format(new Date(`${m}-15T12:00:00`));
  const pts: Point[] = data.monthly.map((p) => ({ key: p.month, label: label(p.month), value: p.users }));
  const first = data.monthly[0];
  const last = data.monthly[data.monthly.length - 1];
  const growth = first && last && first.users > 0 ? (last.users - first.users) / first.users : null;
  const pct = growth == null ? "" : `${growth >= 0 ? "+" : "−"}${nf.format(Math.round(Math.abs(growth) * 100))} %`;
  const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${data.asOf}T12:00:00`),
  );

  return (
    <section className="mz-section" aria-labelledby="mz-users">
      <div className="wrap">
        <h2 className="mz-h2" id="mz-users">
          {t.users}
        </h2>
        <div className="mz-charts">
          {pts.length ? (
            <TrendChart
              title={data.metric[locale]}
              delta={growth != null && pts.length > 1 ? t.growth(pct, label(first.month)) : undefined}
              points={pts}
              head={[t.month, t.users]}
              locale={locale}
            />
          ) : null}
          <div className="mz-charts-side">
            {data.platforms.length ? <PlatformChart data={data} locale={locale} /> : null}
            {data.countries.length ? (
              <BarListChart
                title={t.countries}
                rows={[...data.countries]
                  .sort((a, b) => b.users - a.users)
                  .slice(0, 6)
                  .map((c) => ({ label: c.name[locale], value: c.users }))}
                locale={locale}
              />
            ) : null}
          </div>
        </div>
        <p className="mz-note">{t.source(data.source[locale], date)}</p>
      </div>
    </section>
  );
}
