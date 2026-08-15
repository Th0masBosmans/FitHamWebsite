"use client";

import { Fragment, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import type { ClubEvent } from "@/repository/eventRepository";
import { EventCard } from "./EventCard";
import { EventDetailModal } from "./EventDetailModal";
import { TimelineTopDashes, TimelineBottomArrow, PastMarkerChip, EventNode } from "./timelineParts";

export function EventsTimeline({ upcoming, past }: { upcoming: ClubEvent[]; past: ClubEvent[] }) {
  const reduceMotion = useReducedMotion();
  const timelineRef = useRef<HTMLDivElement>(null);
  // De kaart die momenteel in het detailvenster openstaat.
  const [selected, setSelected] = useState<{ event: ClubEvent; past: boolean } | null>(null);

  // De tijdlijn met alle evenementen onder elkaar, met een volleybal die
  // meerolt terwijl je scrolt. De losse stukjes (lijn, pijl, stippen, bordje)
  // staan in timelineParts; de kaartjes zelf in EventCard.

  // Hoe ver je door de tijdlijn gescrold bent, van 0 tot 1. Alles hieronder
  // hangt daaraan vast. De bal begint pas te rollen als de tijdlijn halverwege
  // het scherm staat, en blijft daarna mooi in het midden meelopen.
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ["start 0.5", "end 0.55"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  const ballTop = useTransform(progress, [0, 1], ["0%", "100%"]);
  const ballRotate = useTransform(progress, [0, 1], [0, 1440]);

  // De gele lijn groeit exact mee met de bal. Ze wordt echt hoger gemaakt en niet
  // uitgerekt, want uitrekken plet het ronde uiteinde tot een streepje.
  const fillHeight = useTransform(progress, (value) => `calc(${value} * (100% - 8px))`);

  // Het pijltje onderaan licht pas op als de gele lijn er bijna is, met een
  // klein vertragingetje zodat het nooit vóór de lijn oplicht.
  const arrowTarget = useTransform(progress, [0.94, 0.99], [0, 1]);
  const arrowYellow = useSpring(arrowTarget, { stiffness: 55, damping: 20 });

  const items = [
    ...upcoming.map((event) => ({ event, past: false })),
    ...past.map((event) => ({ event, past: true })),
  ];
  // Na het bordje "Afgelopen" begint het trapjespatroon opnieuw.
  const dividerIndex = upcoming.length > 0 && past.length > 0 ? upcoming.length : -1;

  return (
    // Extra ruimte boven en onder: onderaan zodat de bal nog een stuk lijn heeft
    // om naar het pijltje te rollen, bovenaan voor de streepjes, die buiten dit
    // kader hangen en anders over de titel zouden schuiven.
    <div ref={timelineRef} className="relative mt-16 py-12">
      {/* De lijn zelf, altijd in het midden en achter de kaarten. Ze is helemaal
          donkerblauw; het stuk dat je al voorbij gescrold bent kleurt geel. */}
      <div
        aria-hidden
        className="absolute left-[calc(50%-2px)] top-1 bottom-1 w-1 rounded-full bg-[var(--color-primary-brand-darker)] lg:left-[calc(50%-2.5px)] lg:w-[5px]"
      />
      <motion.div
        aria-hidden
        style={{ height: fillHeight }}
        className="absolute left-[calc(50%-2px)] top-1 w-1 rounded-full bg-gradient-to-b from-[var(--color-accent-border)] to-[var(--color-accent)] shadow-[0_0_10px_rgba(250,204,21,0.55)] lg:left-[calc(50%-2.5px)] lg:w-[5px]"
      />

      {/* De streepjes boven de lijn en het pijltje eronder. Ze staan allebei net
          buiten de kaarten, zodat ze op mobiel (waar de kaarten de volle breedte
          nemen) toch goed zichtbaar blijven. */}
      <TimelineTopDashes className="-top-0.5 -translate-y-full" />
      <TimelineBottomArrow className="bottom-1 translate-y-full" yellow={arrowYellow} />

      {/* De volleybal die langs de lijn naar beneden rolt. Hij staat achter de
          kaarten, dus op mobiel zie je hem alleen in de tussenruimtes; op desktop
          rolt hij door de lege middenkolom. Wel vóór de streepjes en het pijltje,
          zodat hij daar bovenop rolt en niet eronder verdwijnt. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2"
        style={{ top: ballTop }}
      >
        <motion.div
          style={reduceMotion ? undefined : { rotate: ballRotate }}
          className="-ml-2.5 -mt-2.5 h-5 w-5 overflow-hidden rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.35),0_0_10px_rgba(250,204,21,0.45)] lg:-ml-4 lg:-mt-4 lg:h-8 lg:w-8"
        >
          {/* Iets vergroot, zodat de witte hoekjes van de PNG buiten het rondje vallen */}
          <img src="/VolleybalIcon.png" alt="" className="h-full w-full scale-[1.18] object-cover" />
        </motion.div>
      </motion.div>

      <div className="flex flex-col gap-12 lg:gap-0">
        {items.map((item, index) => {
          const onLeft = index % 2 === 0;
          // Elke kaart begint een stukje lager dan de vorige: het trapjeseffect.
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
                    {/* De kaart heeft standaard geen rand; er verschijnt een gele
                        zodra de bal erbij komt, en die verdwijnt weer als je
                        omhoog scrolt. Er staan twee versies onder elkaar omdat het
                        moment verschilt: op mobiel wacht de rand tot de bal
                        onderaan de kaart is, op desktop kleurt ze precies wanneer
                        de bal het midden van de kaart passeert, gelijk met de stip
                        op de lijn. */}
                    <motion.div
                      aria-hidden
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ margin: "0px 0px -90% 0px" }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="pointer-events-none absolute inset-0 rounded-2xl border-[3px] border-[var(--color-accent)] shadow-[0_0_16px_rgba(250,204,21,0.45)] transition-transform duration-300 ease-out group-hover/card:-translate-y-1 lg:hidden"
                    />
                    <motion.div
                      aria-hidden
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
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
