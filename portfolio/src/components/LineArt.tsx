/** Plano de la línea como fondo del hero: dos líneas que se cruzan y un cable punteado. */
export function LineArt() {
  return (
    <svg
      className="line-art"
      viewBox="0 0 600 700"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMaxYMid meet"
    >
      <path className="art-a" pathLength="1" d="M300 20 V250 Q300 300 340 340 L430 430 Q460 460 460 500 V680" />
      <path className="art-b" pathLength="1" d="M40 380 H200 Q250 380 275 355 L340 290 Q370 260 420 260 H580" />
      <path className="art-c" d="M90 120 L300 250 L520 130" />
      {[
        [300, 250],
        [340, 340],
        [460, 500],
        [200, 380],
        [420, 260],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} className="art-stop" cx={x} cy={y} r="13" />
      ))}
    </svg>
  );
}
