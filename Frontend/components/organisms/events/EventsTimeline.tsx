"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { ClubEvent } from "@/repository/eventRepository";
import { EventCard } from "./EventCard";
import { EventDetailModal } from "./EventDetailModal";
import { TimelineTopArrow, TimelineBottomDashes, PastMarkerChip, EventNode } from "./timelineParts";
/**
 * One continuous timeline of the whole club calendar: a straight blue spine
 * down the middle that fills up yellow as the visitor scrolls (with the
 * rolling volleyball, like the scrollbar at the page edge). Events alternate
 * left and right of the spine and overlap vertically, so the calendar
 * descends like a staircase; every event gets a bigger node on the line that
 * lights up when the fill reaches it. Past events continue below on the same
 * spine, desaturated and marked by an "Afgelopen" chip. Below lg the split
 * disappears: cards stack full-width over the same centred spine (visible in
 * the gaps), a smaller volleyball rolls down the middle, and each card's
 * border lights up yellow as the ball passes it.
 */
export function EventsTimeline({ upcoming, past }: { upcoming: ClubEvent[]; past: ClubEvent[] }) {
  const reduceMotion = useReducedMotion();
  const timelineRef = useRef<HTMLDivElement>(null);
  // The card clicked open in the lightbox (with whether it's a past event).
  const [selected, setSelected] = useState<{ event: ClubEvent; past: boolean } | null>(null);

  // Starts only once the timeline is halfway up the screen (so the ball waits
  // a beat before rolling); the end offset keeps the ball around mid-viewport
  // for the whole descent instead of sagging towards the bottom.
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ["start 0.5", "end 0.55"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  const ballTop = useTransform(progress, [0, 1], ["0%", "100%"]);
  const ballRotate = useTransform(progress, [0, 1], [0, 1440]);

  // How "parked" the ball is at the very top of its travel: 0 while it's moving,
  // ramping to 1 as it comes to rest â€” either because the fill has emptied
  // (progress 0) or the page can't scroll any higher. Wide ramps so the line
  // empties to yellow gradually instead of snapping.
  const { scrollY: windowScrollY } = useScroll();
  const parked = useMotionValue(0);
  const updateParked = () =>
    parked.set(
      Math.min(1, Math.max(0, Math.max(1 - progress.get() / 0.1, 1 - windowScrollY.get() / 48))),
    );
  useMotionValueEvent(progress, "change", updateParked);
  useMotionValueEvent(windowScrollY, "change", updateParked);
  useEffect(updateParked, []);

  // The blue fill follows the ball but retracts as it parks, so the stretch of
  // line leading up to the arrow empties to yellow too once the ball is at rest.
  const fillScaleY = useTransform([progress, parked], (values: number[]) => values[0] * (1 - values[1]));

  // The arrow only starts lighting once the line is nearly empty (parked past
  // ~0.85), then eases in on a soft spring â€” so it turns yellow a beat *after*
  // the line finishes, never before it.
  const arrowTarget = useTransform(parked, [0.85, 1], [0, 1]);
  const arrowYellow = useSpring(arrowTarget, { stiffness: 55, damping: 20 });

  const items = [
    ...upcoming.map((event) => ({ event, past: false })),
    ...past.map((event) => ({ event, past: true })),
  ];
  // The "Afgelopen" divider resets the staircase overlap right after it.
  const dividerIndex = upcoming.length > 0 && past.length > 0 ? upcoming.length : -1;

  return (
    // Extra vertical room lengthens the line past the first and last cards, so
    // the ball has spine to travel up to the arrow and down to the dashed tail.
    <div ref={timelineRef} className="relative py-12">
      {/* Centred spine at every size, behind the cards (it peeks through the
          gaps on mobile). The whole line glows yellow; the part already
          scrolled past turns blue from the top. */}
      <div
        aria-hidden
        className="absolute left-[calc(50%-2px)] top-1 bottom-1 w-1 rounded-full bg-gradient-to-b from-[var(--color-accent-border)] to-[var(--color-accent)] shadow-[0_0_10px_rgba(250,204,21,0.55)] lg:left-[calc(50%-2.5px)] lg:w-[5px]"
      />
      <motion.div
        aria-hidden
        style={{ scaleY: fillScaleY }}
        className="absolute left-[calc(50%-2px)] top-1 bottom-1 w-1 origin-top rounded-full bg-[var(--color-primary-brand-darker)] lg:left-[calc(50%-2.5px)] lg:w-[5px]"
      />

      {/* Arrow capping the top of the line; yellow dashed tail trailing off the
          bottom. Both sit just outside the cards (translated past the spine ends)
          so they read clear on mobile, where the cards run full-width. */}
      <TimelineTopArrow className="top-1 -translate-y-full" yellow={arrowYellow} />
      <TimelineBottomDashes className="bottom-0 translate-y-full" />

      {/* Volleyball rolling down the centred spine. It sits *behind* the cards
          (rendered before them), so on mobile it only shows where the line
          shows â€” in the gaps between cards â€” instead of passing over them. On
          desktop it stays visible in the empty centre column. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2"
        style={{ top: ballTop }}
      >
        <motion.div
          style={reduceMotion ? undefined : { rotate: ballRotate }}
          className="-ml-2.5 -mt-2.5 h-5 w-5 overflow-hidden rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.35),0_0_10px_rgba(250,204,21,0.45)] lg:-ml-4 lg:-mt-4 lg:h-8 lg:w-8"
        >
          {/* Scaled up a touch so the ball overfills the circular clip, hiding the white corners of the source PNG */}
          <img src="/VolleybalIcon.png" alt="" className="h-full w-full scale-[1.18] object-cover" />
        </motion.div>
      </motion.div>

      <div className="flex flex-col gap-12 lg:gap-0">
        {items.map((item, index) => {
          const onLeft = index % 2 === 0;
          // Each card starts partway down the previous one: the staircase.
          const stagger =
            index === 0 || index === dividerIndex ? "" : item.past ? "lg:-mt-10" : "lg:-mt-16";

          return (
            <Fragment key={item.event.id}>
              {index === dividerIndex && (
                <div className="relative self-center my-8">
                  <PastMarkerChip />
                </div>
              )}

              <div className={`relative ${stagger}`}>
                <EventNode />
                <div className={`lg:w-1/2 ${onLeft ? "lg:pr-10" : "lg:ml-auto lg:pl-10"}`}>
                  <div className="group/card relative">
                    <EventCard
                      event={item.event}
                      index={0}
                      past={item.past}
                      onOpen={() => setSelected({ event: item.event, past: item.past })}
                    />
                    {/* The card border is yellow by default and fades away as the
                        ball reaches the card (returning on the way up) â€” there is
                        no border behind it, so once the yellow fades the card has
                        no border at all. The two yellow layers differ only in flip
                        timing: mobile (full-width tall card) holds yellow until the
                        ball nears the bottom (-90%); desktop (half-width card
                        beside the spine) flips exactly when the card centre meets
                        the ball, in sync with the node (amount 0.5 + -50%). Both
                        lift with the card on hover so the border tracks it. */}
                    <motion.div
                      aria-hidden
                      initial={{ opacity: 1 }}
                      whileInView={{ opacity: 0 }}
                      viewport={{ margin: "0px 0px -90% 0px" }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="pointer-events-none absolute inset-0 rounded-2xl border-[3px] border-[var(--color-accent)] shadow-[0_0_16px_rgba(250,204,21,0.45)] transition-transform duration-300 ease-out group-hover/card:-translate-y-1 lg:hidden"
                    />
                    <motion.div
                      aria-hidden
                      initial={{ opacity: 1 }}
                      whileInView={{ opacity: 0 }}
                      viewport={{ amount: 0.5, margin: "0px 0px -50% 0px" }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="pointer-events-none absolute inset-0 hidden rounded-2xl border-[3px] border-[var(--color-accent)] shadow-[0_0_16px_rgba(250,204,21,0.45)] transition-transform duration-300 ease-out group-hover/card:-translate-y-1 lg:block"
                    />
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>

      <EventDetailModal
        event={selected?.event ?? null}
        past={selected?.past ?? false}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
