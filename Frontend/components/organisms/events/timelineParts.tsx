"use client";

import { motion, type MotionValue } from "motion/react";
import { History } from "lucide-react";

const ARROW_CLIP = "polygon(50% 100%, 100% 0%, 0% 0%)";

/**
 * Arrowhead that caps the bottom of the spine and blends straight into it,
 * pointing down the way the calendar runs. Its yellow is driven by `yellow`: it
 * sits on the blue base like the stretch of spine ahead of the ball, lighting up
 * only once the fill has run all the way down to it. Without a `yellow` value
 * (the empty-state stub) it falls back to the nodes' in-view flip.
 */
export function TimelineBottomArrow({ className = "", yellow }: { className?: string; yellow?: MotionValue<number> }) {
  // No z-index: the arrow only has to sit above the spine, which it already does
  // by DOM order, and staying at the default level lets the volleyball (rendered
  // after it) roll over the arrowhead instead of under it.
  return (
    <div aria-hidden className={`absolute left-1/2 h-2.5 w-3.5 -translate-x-1/2 lg:h-3 lg:w-4 ${className}`}>
      {/* Blue base arrow, shown until the fill has reached the bottom */}
      <div className="absolute inset-0 bg-[var(--color-primary-brand-darker)]" style={{ clipPath: ARROW_CLIP }} />
      {/* Yellow arrow on top, glowing */}
      {yellow ? (
        <motion.div
          style={{ opacity: yellow, clipPath: ARROW_CLIP }}
          className="absolute inset-0 bg-[var(--color-accent)] [filter:drop-shadow(0_1px_3px_rgba(250,204,21,0.7))]"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ margin: "0px 0px -50% 0px" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute inset-0 bg-[var(--color-accent)] [filter:drop-shadow(0_1px_3px_rgba(250,204,21,0.7))]"
          style={{ clipPath: ARROW_CLIP }}
        />
      )}
    </div>
  );
}

/**
 * Dashed tail that trails off the top of the spine, staying yellow — the
 * calendar fading out above the first event. The container takes the spine's
 * exact width *and* its exact left offset — rather than centring itself with a
 * translate — so the dashes land on precisely the same pixels as the line at
 * both sizes. The dashes lengthen and brighten as they descend towards the
 * spine, and the last one is long, fully opaque and fades in from its own top,
 * so it reads as the line itself resolving out of the dashes rather than as a
 * fourth detached dash.
 *
 * No z-index, for the same reason as the arrow: the tail only has to sit above
 * the spine, which it already does by DOM order, and staying at the default
 * level lets the volleyball (rendered after it) roll over the dashes rather
 * than behind them when it is parked at the top.
 */
export function TimelineTopDashes({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute left-[calc(50%-2px)] flex w-1 flex-col items-center gap-1.5 lg:left-[calc(50%-2.5px)] lg:w-[5px] ${className}`}
    >
      <span className="h-2 w-full rounded-full bg-[var(--color-accent)]/35" />
      <span className="h-3 w-full rounded-full bg-[var(--color-accent)]/65" />
      <span className="h-6 w-full rounded-full bg-gradient-to-b from-[var(--color-accent)]/70 to-[var(--color-accent)] shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
    </div>
  );
}

/** Frosted marker that sits on the timeline where the past part begins. */
export function PastMarkerChip() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-4 py-1.5 shadow-md text-white/80 label-small font-extrabold uppercase tracking-[0.15em]">
      <History className="h-3.5 w-3.5" />
      Afgelopen
    </span>
  );
}

/**
 * Node on the spine marking one event: a dark-blue dot (matching the unlit spine
 * ahead) that lights up yellow as the rolling ball passes down through it, and
 * back to blue when you scroll up — staying blue until the ball reaches it.
 * Yellow, with its glow, is the top layer that fades in over a solid blue base,
 * so the blue state shows no leftover yellow halo. Desktop only — it sits on the
 * centre spine between the alternating cards. Each card mirrors this same
 * blue→yellow flip on its own border, in sync with its node (see
 * EventsTimeline).
 */
export function EventNode() {
  return (
    <div
      aria-hidden
      className="hidden lg:block absolute top-1/2 left-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2"
    >
      <div className="relative h-full w-full">
        {/* Solid blue base circle (shown until the ball has passed). */}
        <div className="absolute inset-0 rounded-full border border-white/40 bg-[var(--color-primary-brand-darker)] shadow-md lg:border-2" />
        {/* Yellow circle on top — its fill paints under its own border so the
            whole dot is filled, and it fades in (with its glow) as the ball
            passes, covering the identical blue base. */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ margin: "0px 0px -50% 0px" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute inset-0 rounded-full border border-white/40 bg-[var(--color-accent)] shadow-[0_0_12px_rgba(250,204,21,0.7)] lg:border-2"
        />
      </div>
    </div>
  );
}
