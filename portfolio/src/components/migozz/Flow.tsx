import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useRef, useState, type CSSProperties } from "react";
import type { Feature } from "../../content/migozz";
import { MzIcon } from "../MzIcon";

/**
 * "How it works" as a real sequence: a brand-colored line fills as the reader scrolls through the four steps, and
 * each step lights up when the line reaches it. Reduced motion shows every step lit.
 */
export function Flow({ title, step, steps }: { title: string; step: string; steps: readonly Feature[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 50%"] });
  const [reached, setReached] = useState(still ? steps.length : 0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!still) setReached(Math.min(steps.length, Math.floor(p * steps.length + 0.35)));
  });

  return (
    <section className="mz-section" aria-labelledby="mz-flow">
      <div className="wrap">
        <h2 className="mz-h2" id="mz-flow">
          {title}
        </h2>
        <div className="mz-flow" ref={ref}>
          <motion.span
            className="mz-flow-line"
            aria-hidden="true"
            style={{ ["--p" as string]: still ? 1 : scrollYProgress } as CSSProperties}
          />
          <ol className="mz-flow-steps">
            {steps.map((s, i) => (
              <li className={i < reached ? "mz-step is-on" : "mz-step"} key={s.k}>
                <span className="mz-step-icon">{s.icon ? <MzIcon name={s.icon} size={28} /> : null}</span>
                <div>
                  <span className="mz-step-n">
                    {step} {i + 1}
                  </span>
                  <h3>{s.k}</h3>
                  <p>{s.v}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
