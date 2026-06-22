"use client";

import { motion, type MotionValue } from "motion/react";
import { History } from "lucide-react";

const ARROW_CLIP = "polygon(50% 0%, 100% 100%, 0% 100%)";

/**
 * Arrowhead that caps the top of the spine and blends straight into it. Its
 * yellow is driven by `yellow` (the fill progress, inverted): full yellow only
 * while the ball sits against the top and can roll no further up, fading to the
 * blue base the moment the ball starts down and the fill covers the top. Without
 * a `yellow` value (the empty-state stub) it falls back to the nodes' in-view
 * flip.
 */
export function TimelineTopArrow({ className = "", yellow }: { className?: string; yellow?: MotionValue<number> }) {
  return (
    <div aria-hidden className={`absolute left-1/2 z-10 h-2.5 w-3.5 -translate-x-1/2 lg:h-3 lg:w-4 ${className}`}>
      {/* Blue base arrow, revealed once the fill has reached the top */}
      <div className="absolute inset-0 bg-[var(--color-primary-brand-darker)]" style={{ clipPath: ARROW_CLIP }} />
      {/* Yellow arrow on top, glowing */}
      {yellow ? (
        <motion.div
          style={{ opacity: yellow, clipPath: ARROW_CLIP }}
          className="absolute inset-0 bg-[var(--color-accent)] [filter:drop-shadow(0_1px_3px_rgba(250,204,21,0.7))]"
        />
      ) : (
        <motion.div
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 0 }}
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
 * Short dashed tail that trails off the bottom of the spine, staying yellow — the
 * calendar fading out below the last event. Same width as the spine, dashes
 * dimming as they descend.
 */
export function TimelineBottomDashes({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 ${className}`}
    >
      <span className="h-2 w-1 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_rgba(250,204,21,0.5)] lg:w-[5px]" />
      <span className="h-2 w-1 rounded-full bg-[var(--color-accent)]/65 lg:w-[5px]" />
      <span className="h-2 w-1 rounded-full bg-[var(--color-accent)]/35 lg:w-[5px]" />
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
 * Node on the spine marking one event: a yellow dot (matching the yellow spine
 * ahead) that turns dark-blue as the rolling ball passes down through it, and
 * back to yellow when you scroll up — staying fully yellow until the ball
 * reaches it. Yellow, with its glow, is the top layer that fades out over a
 * solid blue base, so the blue state shows no leftover yellow halo. Desktop only
 * — it sits on the centre spine between the alternating cards. Each card mirrors
 * this same yellow→blue flip on its own border, in sync with its node (see
 * EventsTimeline).
 */
export function EventNode() {
  return (
    <div
      aria-hidden
      className="hidden lg:block absolute top-1/2 left-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2"
    >
      <div className="relative h-full w-full">
        {/* Solid blue base circle (shown once the ball has passed). */}
        <div className="absolute inset-0 rounded-full border border-white/40 bg-[var(--color-primary-brand-darker)] shadow-md lg:border-2" />
        {/* Yellow circle on top — its fill paints under its own border so the
            whole dot is filled, and it fades out (with its glow) as the ball
            passes, revealing the identical blue base. */}
        <motion.div
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 0 }}
          viewport={{ margin: "0px 0px -50% 0px" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute inset-0 rounded-full border border-white/40 bg-[var(--color-accent)] shadow-[0_0_12px_rgba(250,204,21,0.7)] lg:border-2"
        />
      </div>
    </div>
  );
}
