"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarPlus, Clock, MapPin, Sparkles } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { EventRepository, type ClubEvent } from "@/repository/eventRepository";
import { formatEventDay, formatEventMonthShort, formatEventTimeRange, googleCalendarUrl } from "@/lib/eventFormat";

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
 * Spotlight for the highlighted event: a giant version of the timeline poster
 * cards. The photo fills practically the whole card (with a slow parallax
 * drift and hover zoom); over it sit only the familiar anchors — yellow date
 * plate, "Uitgelicht" badge, title, frosted chips — plus this card's own
 * extras: a live countdown in glass tiles and the agenda CTA. The description
 * stays hidden and slides up on hover or tap, exactly like the cards below.
 */
export function FeaturedEventCard({ event }: { event: ClubEvent }) {
  const reduceMotion = useReducedMotion();
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
    <section ref={sectionRef} className="relative mx-auto w-full max-w-md px-6 sm:max-w-2xl lg:max-w-5xl">
      {/* Atmospheric glows behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-6 h-64 w-64 rounded-full bg-[var(--color-accent)]/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-8 h-72 w-72 rounded-full bg-[var(--color-secondary-brand)]/20 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        onClick={() => setOpen((value) => !value)}
        className="group relative h-[26rem] cursor-pointer overflow-hidden rounded-2xl border border-white/15 shadow-2xl sm:h-[28rem] lg:h-[32rem]"
      >
        {/* Parallax poster photo; oversized so the drift never reveals an edge */}
        <motion.div style={{ y: imageY }} className="absolute inset-0">
          <img
            src={eventRepository.getEventImageUrl(event.image)}
            alt={event.title}
            className="h-full w-full scale-110 object-cover transition-transform duration-700 group-hover:scale-[1.15]"
          />
        </motion.div>

        {/* Bottom gradient for the always-visible strip; deepens on hover/tap */}
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[var(--color-primary-brand-darker)]/90 via-[var(--color-primary-brand-darker)]/35 to-transparent" />
        <div
          className={`absolute inset-0 bg-gradient-to-t from-[var(--color-primary-brand-darker)]/95 via-[var(--color-primary-brand-darker)]/40 to-black/15 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          } group-hover:opacity-100`}
        />

        {/* The familiar anchors: yellow date plate left, highlight badge right */}
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

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-5 lg:gap-3.5 lg:p-7">
          <h2 className="text-white title-section drop-shadow-lg">{event.title}</h2>

          {/* No date chip: the yellow plate in the corner already carries the date */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1.5 shadow-sm text-white label-small font-semibold">
              <Clock className="h-3.5 w-3.5 text-[var(--color-accent)]" />
              {formatEventTimeRange(event.start_date, event.end_date)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1.5 shadow-sm text-white label-small font-semibold">
              <MapPin className="h-3.5 w-3.5 text-[var(--color-accent)]" />
              {event.location}
            </span>
          </div>

          {/* Hidden description, slides up on hover or tap like the timeline cards */}
          {event.description && (
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              } group-hover:grid-rows-[1fr]`}
            >
              <p
                className={`min-h-0 max-w-2xl overflow-hidden text-white/85 body-small lg:body-regular leading-relaxed transition-opacity duration-300 ${
                  open ? "opacity-100" : "opacity-0"
                } group-hover:opacity-100`}
              >
                {event.description}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-end justify-between gap-4">
            <a
              href={googleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(clickEvent) => clickEvent.stopPropagation()}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] text-[var(--color-primary-brand)] px-5 py-2 shadow-lg label-small font-extrabold uppercase tracking-wide transition-all hover:bg-white hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
            >
              <CalendarPlus className="h-4 w-4" />
              Zet in agenda
            </a>

            {timeLeft && (
              <div className="flex gap-2">
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
      </motion.div>
    </section>
  );
}
