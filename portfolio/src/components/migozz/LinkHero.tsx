import { motion, useReducedMotion, type TargetAndTransition } from "motion/react";
import type { CSSProperties } from "react";
import { NETWORK_ICONS } from "../../content/networkIcons";
import { asset } from "../../lib/asset";

const C = 200; // center of the 400 × 400 drawing
const R = 158; // distance from the center to each network
const nodes = NETWORK_ICONS.map((n, i) => {
  const a = (-90 + (360 / NETWORK_ICONS.length) * i) * (Math.PI / 180);
  return { ...n, x: C + R * Math.cos(a), y: C + R * Math.sin(a), i };
});

/**
 * The page's one orchestrated moment: "one link". The networks pop in, a stream of light leaves each one toward
 * MIGOZZ, and the MIGOZZ icon lands and starts to pulse as the streams reach it. With reduced motion everything is
 * shown at once, still.
 */
export function LinkHero({ label, play }: { label: string; play: boolean }) {
  const still = useReducedMotion();
  const from = (v: TargetAndTransition) => (still ? false : v);
  // Hold every animation until the loading screen lifts, so the sequence is seen from the start.
  const to = (v: TargetAndTransition) => (play || still ? v : undefined);

  return (
    <div className={play ? "mz-link is-playing" : "mz-link"} role="img" aria-label={label}>
      <svg className="mz-link-lines" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="mz-stream" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="400" y2="400">
            <stop offset="0" stopColor="#6D1FC0" />
            <stop offset="0.5" stopColor="#8E2DE2" />
            <stop offset="1" stopColor="#D43FC6" />
          </linearGradient>
        </defs>
        {nodes.map((n) => (
          <g key={n.name}>
            <motion.path
              d={`M${n.x} ${n.y} L${C} ${C}`}
              stroke="rgba(88,28,160,0.16)"
              strokeWidth="1.5"
              fill="none"
              initial={from({ pathLength: 0 })}
              animate={to({ pathLength: 1 })}
              transition={{ delay: 0.55 + n.i * 0.07, duration: 0.6, ease: "easeOut" }}
            />
            {/* A dash of light that keeps traveling from the network to MIGOZZ. */}
            <path
              className="mz-link-flow"
              d={`M${n.x} ${n.y} L${C} ${C}`}
              stroke="url(#mz-stream)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              pathLength={1}
              style={{ ["--d" as string]: `${1.4 + n.i * 0.18}s` } as CSSProperties}
            />
          </g>
        ))}
      </svg>

      {nodes.map((n) => (
        <motion.span
          key={n.name}
          className="mz-link-node"
          style={{ left: `${(n.x / 400) * 100}%`, top: `${(n.y / 400) * 100}%`, color: n.color }}
          initial={from({ scale: 0, opacity: 0 })}
          animate={to({ scale: 1, opacity: 1 })}
          transition={{ delay: 0.15 + n.i * 0.07, type: "spring", stiffness: 380, damping: 18 }}
          title={n.name}
        >
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">
            <path d={n.path} fill="currentColor" />
          </svg>
        </motion.span>
      ))}

      <motion.div
        className="mz-link-core"
        initial={from({ scale: 0.3, opacity: 0 })}
        animate={to({ scale: 1, opacity: 1 })}
        transition={{ delay: 1.15, type: "spring", stiffness: 220, damping: 14 }}
      >
        <img src={asset("migozz-icon.webp")} alt="" width={120} height={120} />
      </motion.div>
    </div>
  );
}

/** "MIGOZZ" rising letter by letter out of a mask, in step with the network animation. */
export function HeroTitle({ text, play }: { text: string; play: boolean }) {
  const still = useReducedMotion();
  return (
    <h1 className="display mz-title" aria-label={text}>
      {text.split("").map((ch, i) => (
        <span className="mz-title-mask" aria-hidden="true" key={i}>
          <motion.span
            className="mz-title-letter"
            initial={still ? false : { y: "105%" }}
            animate={play || still ? { y: "0%" } : undefined}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {ch}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}
