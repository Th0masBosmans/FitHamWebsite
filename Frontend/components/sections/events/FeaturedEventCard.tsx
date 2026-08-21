"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarPlus, Clock, MapPin, Sparkles } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { EventRepository, type ClubEvent } from "@/repository/eventRepository";
import { useIsDesktop } from "@/lib/useIsDesktop";
import {
  formatEventDay,
  formatEventMonthShort,
  formatEventTimeRange,
  eventCalendarFileName,
  eventCalendarFileUrl,
} from "@/lib/eventFormat";

const eventRepository = new EventRepository();

type TimeLeft = {
  dagen: number;
  uren: number;
  min: number;
  sec: number;
}

function getTimeLeft(targetIso: string): TimeLeft | null {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    dagen: Math.floor(diff / 86_400_000),
    uren: Math.floor(diff / 3_600_000) % 24,
    min: Math.floor(diff / 60_000) % 60,
    sec: Math.floor(diff / 1_000) % 60,
  };
}

/**
 * De grote kaart van het uitgelichte evenement: eigenlijk een vergrote versie
 * van een gewoon tijdlijnkaartje.
 *
 * Vanaf tablet vult de affiche de hele kaart, beweegt ze traag mee tijdens het
 * scrollen en ligt alle info erover; enkel de omschrijving blijft verborgen tot
 * je met de muis over de kaart gaat. Op een gsm staat de affiche volledig in
 * beeld met enkel de titel, het uur en de plaats erop; de omschrijving, de
 * aftelklok en de agenda-knop klappen open onder de foto zodra je erop tikt.
 *
 * Wordt op twee plekken gebruikt: bovenaan de evenementenpagina en op de
 * homepagina (via home/FeaturedEventSection). Vandaar de instellingen voor
 * breedte hieronder: op beide pagina's moet de kaart even breed zijn als de rest.
 */
export function FeaturedEventCard({
  event,
  // Hoe breed de kaart mag worden. Standaard de breedte van de
  // evenementenpagina; de homepagina geeft haar eigen breedte mee.
  widthClassName = "max-w-md sm:max-w-2xl lg:max-w-5xl",
  // Vanaf welke schermbreedte er tekst naast het agenda-icoontje past. Dat hangt
  // af van waar de kaart zelf breder wordt, en dat verschilt per pagina.
  agendaLabelBreakpoint = "sm",
}: {
  event: ClubEvent;
  widthClassName?: string;
  agendaLabelBreakpoint?: "sm" | "lg";
}) {
  // De klassen voluit uitgeschreven en niet samengesteld, anders vindt Tailwind
  // ze niet en blijven de stijlen weg.
  const agendaPadding =
    agendaLabelBreakpoint === "lg" ? "px-2.5 py-2 lg:px-5" : "px-2.5 py-2 sm:px-5";
  const agendaLabelVisibility =
    agendaLabelBreakpoint === "lg" ? "hidden lg:inline" : "hidden sm:inline";

  const reduceMotion = useReducedMotion();
  // Vanaf tablet ligt de tekst over de affiche en beweegt die traag mee tijdens
  // het scrollen. Op een gsm staat de affiche volledig in beeld en groeit de
  // kaart mee met de foto; meebewegen zou daar randen geven.
  const isWide = useIsDesktop(640);
  const sectionRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => getTimeLeft(event.start_date));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(event.start_date)), 1000);
    return () => clearInterval(timer);
  }, [event.start_date]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-5%", "5%"]);

  return (
    <section ref={sectionRef} className={`relative mx-auto w-full px-6 ${widthClassName}`}>
      {/* Wazige gekleurde vlekken achter de kaart */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-6 h-64 w-64 rounded-full bg-[var(--color-accent)]/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-8 h-72 w-72 rounded-full bg-[var(--color-secondary-brand)]/20 blur-3xl"
      />

      {/* Op een gsm is de kaart een raster van twee rijen: de affiche bovenaan
          (met de titel en de details erop) en het uitklapbare vlak eronder.
          Vanaf tablet wordt het een kolom waarin alles onderaan de affiche ligt. */}
      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        onClick={() => setOpen((value) => !value)}
        className="group relative grid grid-cols-1 cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-[var(--color-primary-brand-darker)] shadow-2xl sm:flex sm:flex-col sm:justify-end sm:h-[28rem] lg:h-[32rem]"
      >
        {/* De affiche. Op een gsm volledig in beeld; vanaf tablet iets te groot
            gemaakt zodat je bij het meebewegen nooit een rand ziet. */}
        <motion.div
          style={{ y: isWide ? imageY : 0 }}
          className="col-start-1 row-start-1 relative sm:absolute sm:inset-0"
        >
          <img
            src={eventRepository.getEventImageUrl(event.image)}
            alt={event.title}
            className="h-auto w-full transition-transform duration-700 sm:h-full sm:scale-110 sm:object-cover sm:group-hover:scale-[1.15]"
          />
        </motion.div>

        {/* Donkere verloop onderaan voor de leesbaarheid van de tekst op de affiche */}
        <div className="col-start-1 row-start-1 bg-gradient-to-t from-[var(--color-primary-brand-darker)]/85 via-[var(--color-primary-brand-darker)]/20 to-transparent sm:absolute sm:inset-x-0 sm:bottom-0 sm:h-3/5 sm:from-[var(--color-primary-brand-darker)]/90 sm:via-[var(--color-primary-brand-darker)]/35" />

        {/* Nog donkerder zodra de omschrijving over de affiche schuift. Enkel
            vanaf tablet: op een gsm klapt die onder de foto open, niet erover. */}
        <div
          className={`hidden sm:block absolute inset-0 bg-gradient-to-t from-[var(--color-primary-brand-darker)]/95 via-[var(--color-primary-brand-darker)]/40 to-black/15 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          } group-hover:opacity-100`}
        />

        {/* De vaste herkenningspunten: geel datumblokje links, label rechts */}
        <div className="absolute left-4 top-4 z-10 rounded-xl bg-[var(--color-accent)] px-2.5 py-1.5 text-center shadow-lg text-[var(--color-primary-brand)]">
          <div className="text-2xl font-black leading-none">{formatEventDay(event.start_date)}</div>
          <div className="text-[0.7rem] font-extrabold uppercase tracking-[0.15em] leading-tight">
            {formatEventMonthShort(event.start_date)}
          </div>
        </div>
        <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent)] text-[var(--color-primary-brand)] px-3 py-1.5 shadow-lg label-small font-extrabold uppercase tracking-wide">
          <Sparkles className="h-3.5 w-3.5" />
          Uitgelicht
        </span>

        {/* De basis, altijd op de affiche: titel, uur en plaats */}
        <div className="col-start-1 row-start-1 z-10 flex flex-col gap-3 self-end p-5 sm:pb-3 lg:gap-3.5 lg:p-7 lg:pb-3.5">
          <h2 className="text-white title-section drop-shadow-lg">{event.title}</h2>

          {/* Geen datumlabel hier: het gele blokje in de hoek toont de datum al.
              Op een gsm zijn de pilletjes wat smaller zodat het uur en de plaats
              naast elkaar blijven staan. */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/15 backdrop-blur-md px-2.5 py-1 shadow-sm text-white label-small font-semibold sm:px-3 sm:py-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
              {formatEventTimeRange(event.start_date, event.end_date)}
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/15 backdrop-blur-md px-2.5 py-1 shadow-sm text-white label-small font-semibold sm:px-3 sm:py-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
              {event.location}
            </span>
          </div>
        </div>

        {/* De rest. Op een gsm klapt dit blok onder de foto open bij een tik;
            vanaf tablet staat het er gewoon, onderaan de affiche. */}
        <div
          className={`col-start-1 row-start-2 z-10 grid transition-[grid-template-rows] duration-300 ease-out sm:grid-rows-[1fr] ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex flex-col gap-3 px-5 pb-5 pt-3 sm:pt-0 lg:gap-3.5 lg:px-7 lg:pb-7">
              {/* Vanaf tablet blijft de omschrijving verborgen tot je met de muis
                  over de kaart gaat; op een gsm hoort ze bij wat openklapt. */}
              {event.description && (
                <div
                  className={`grid grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out ${
                    open ? "sm:grid-rows-[1fr]" : "sm:grid-rows-[0fr]"
                  } sm:group-hover:grid-rows-[1fr]`}
                >
                  <p
                    className={`min-h-0 max-w-2xl overflow-hidden text-white/85 body-small lg:body-regular leading-relaxed transition-opacity duration-300 ${
                      open ? "sm:opacity-100" : "sm:opacity-0"
                    } sm:group-hover:opacity-100`}
                  >
                    {event.description}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <a
                  href={eventCalendarFileUrl(event)}
                  download={eventCalendarFileName(event)}
                  onClick={(clickEvent) => clickEvent.stopPropagation()}
                  aria-label="Zet in agenda"
                  className={`order-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] text-[var(--color-primary-brand)] ${agendaPadding} shadow-lg label-small font-extrabold uppercase tracking-wide transition-all hover:bg-white hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-white`}
                >
                  <CalendarPlus className="h-4 w-4" />
                  <span className={agendaLabelVisibility}>Zet in agenda</span>
                </a>

                {timeLeft && (
                  <div className="order-1 flex gap-2">
                    {(
                      [
                        { label: "dagen", value: timeLeft.dagen },
                        { label: "uren", value: timeLeft.uren },
                        { label: "min", value: timeLeft.min },
                        { label: "sec", value: timeLeft.sec },
                      ] as const
                    ).map(({ label, value }) => (
                      <div
                        key={label}
                        className="w-12 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 py-1.5 text-center shadow-lg lg:w-14 lg:py-2"
                      >
                        <p className="text-white text-lg font-black tabular-nums leading-none lg:text-xl">
                          {String(value).padStart(2, "0")}
                        </p>
                        <p className="mt-0.5 text-white/70 text-[9px] uppercase tracking-wider lg:text-[10px]">{label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
