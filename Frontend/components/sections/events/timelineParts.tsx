"use client";

import { motion, type MotionValue } from "motion/react";
import { History } from "lucide-react";

const ARROW_CLIP = "polygon(50% 100%, 100% 0%, 0% 0%)";

// De losse onderdelen waaruit de tijdlijn op de evenementenpagina is opgebouwd.
// De tijdlijn zelf zit in EventsTimeline; die zet deze stukjes samen.

/**
 * Het pijltje onderaan de tijdlijn. Blijft blauw zolang de gele lijn er nog niet
 * is, en licht pas op als die helemaal beneden staat.
 *
 * Zonder `yellow` (dat is het geval als er nog geen enkel evenement is) licht hij
 * gewoon op zodra je hem in beeld scrolt.
 */
export function TimelineBottomArrow({ className = "", yellow }: { className?: string; yellow?: MotionValue<number> }) {
  // Bewust geen z-index: zo kan de volleybal er overheen rollen in plaats van eronder.
  return (
    <div aria-hidden className={`absolute left-1/2 h-2.5 w-3.5 -translate-x-1/2 lg:h-3 lg:w-4 ${className}`}>
      {/* Blauwe pijl, zichtbaar tot de gele lijn beneden is */}
      <div className="absolute inset-0 bg-[var(--color-primary-brand-darker)]" style={{ clipPath: ARROW_CLIP }} />
      {/* Gele pijl erbovenop, met gloed */}
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
 * De gele streepjes die bovenaan uit de tijdlijn lopen: de kalender die naar
 * boven toe uitdooft. De streepjes worden langer en feller naar onder toe, zodat
 * het lijkt alsof de lijn er geleidelijk uit ontstaat.
 *
 * Ze staan op exact dezelfde plek en breedte als de lijn zelf, dus pas je de ene
 * aan, pas dan ook de andere aan.
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

/** Het matglazen bordje op de tijdlijn waar de voorbije evenementen beginnen. */
export function PastMarkerChip() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-4 py-1.5 shadow-md text-white/80 label-small font-extrabold uppercase tracking-[0.15em]">
      <History className="h-3.5 w-3.5" />
      Afgelopen
    </span>
  );
}

/**
 * De stip op de tijdlijn bij één evenement. Blauw tot de rollende bal er
 * voorbijkomt, dan geel; scrol je terug omhoog, dan wordt hij weer blauw.
 *
 * Alleen op desktop, want daar staat de lijn tussen de kaarten in. De rand van
 * de bijhorende kaart doet in EventsTimeline hetzelfde kleurtje mee.
 */
export function EventNode() {
  return (
    <div
      aria-hidden
      className="hidden lg:block absolute top-1/2 left-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2"
    >
      <div className="relative h-full w-full">
        {/* Blauwe stip, tot de bal er voorbij is */}
        <div className="absolute inset-0 rounded-full border border-white/40 bg-[var(--color-primary-brand-darker)] shadow-md lg:border-2" />
        {/* Gele stip die er bij het passeren van de bal overheen vervaagt */}
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
