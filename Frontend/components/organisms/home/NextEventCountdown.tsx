"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { EventRepository, type ClubEvent } from "@/repository/eventRepository";
import { formatEventDate } from "@/lib/eventFormat";

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
 * Live ticking countdown to the next upcoming club event, shown on the home
 * page. Renders nothing when there is no upcoming event.
 */
export function NextEventCountdown() {
  const [event, setEvent] = useState<ClubEvent | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    eventRepository.fetchEvents().then((events) => {
      // Events arrive sorted by start_date, so the first future one is the next.
      const upcoming = events.find((candidate) => new Date(candidate.start_date).getTime() > Date.now());
      if (upcoming) {
        setEvent(upcoming);
        setTimeLeft(getTimeLeft(upcoming.start_date));
      }
    });
  }, []);

  useEffect(() => {
    if (!event) return;
    const timer = setInterval(() => setTimeLeft(getTimeLeft(event.start_date)), 1000);
    return () => clearInterval(timer);
  }, [event]);

  if (!event || !timeLeft) return null;

  const units: { label: string; value: number }[] = [
    { label: "dagen", value: timeLeft.dagen },
    { label: "uren", value: timeLeft.uren },
    { label: "min", value: timeLeft.min },
    { label: "sec", value: timeLeft.sec },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="mb-8 lg:mb-16"
    >
      <SectionHeading title="Save the date" />
      {/* Bigger card connecting the image (left) with the countdown + description (right) */}
      <Link
        href="/events"
        className="group relative block rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--color-primary-brand)] to-[var(--color-secondary-brand)] border-2 border-[var(--color-secondary-brand)]/50 shadow-2xl hover:shadow-2xl transition-shadow duration-150"
      >
        {/* Decorative bubbles, same language as the webshop card */}
        <div className="absolute -right-10 -top-10 w-40 h-40 lg:w-56 lg:h-56 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
        <div className="absolute -left-10 -bottom-10 w-32 h-32 lg:w-48 lg:h-48 bg-[var(--color-accent)]/10 rounded-full group-hover:scale-150 transition-transform duration-700 delay-100"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center p-4 lg:p-6 gap-4 lg:gap-8">
          {/* Left: framed image with title, date and location — whole photo visible */}
          <div className="relative lg:w-2/5 lg:flex-shrink-0 rounded-xl overflow-hidden shadow-lg border border-white/20">
            <img
              src={eventRepository.getEventImageUrl(event.image)}
              alt={event.title}
              className="block w-full h-auto"
            />
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5 flex flex-col items-start gap-2">
              <h3 className="text-white text-lg lg:text-xl font-extrabold drop-shadow-lg text-left">
                {event.title}
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 text-white px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold">
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--color-accent)]" />
                  {formatEventDate(event.start_date)}
                </span>
                <span className="inline-flex items-center gap-1 sm:gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 text-white px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold">
                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--color-accent)]" />
                  {event.location}
                </span>
              </div>
            </div>
          </div>

          {/* Right: countdown timer and description, centered like the webshop card */}
          <div className="lg:w-3/5 flex flex-col items-center justify-center gap-4 lg:gap-6 text-center p-5 lg:p-8">
            <div className="flex justify-center gap-2.5 lg:gap-3">
              {units.map(({ label, value }) => (
                <div
                  key={label}
                  className="w-16 lg:w-20 bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl py-2 lg:py-3 text-center shadow-sm"
                >
                  <p className="text-white text-2xl lg:text-3xl font-black tabular-nums leading-none">
                    {String(value).padStart(2, "0")}
                  </p>
                  <p className="text-white/70 text-[10px] lg:text-xs uppercase tracking-wider mt-1">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {event.description && (
              <p className="text-white/90 text-sm lg:text-base leading-relaxed max-w-md font-medium">
                {event.description}
              </p>
            )}

            {/* Styled as a button, but a span because the whole card is already a link */}
            <span className="inline-flex items-center gap-1.5 bg-[var(--color-accent)] text-[var(--color-primary-brand)] px-4 py-1.5 lg:px-5 lg:py-2 rounded-full text-xs lg:text-sm font-bold group-hover:bg-white transition-colors shadow">
              <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Zet in agenda</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
