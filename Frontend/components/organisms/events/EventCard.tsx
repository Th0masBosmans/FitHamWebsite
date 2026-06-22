"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera, CalendarPlus, Clock, MapPin, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { EventRepository, type ClubEvent } from "@/repository/eventRepository";
import {
  formatEventDay,
  formatEventMonthShort,
  formatEventTimeRange,
  formatEventWeekday,
  googleCalendarUrl,
} from "@/lib/eventFormat";

const eventRepository = new EventRepository();

/** Yellow day/month block pinned over the photo — same for upcoming and past. */
function DatePlate({ iso }: { iso: string }) {
  const year = new Date(iso).getFullYear();
  const showYear = year !== new Date().getFullYear();

  return (
    <div className="rounded-xl bg-[var(--color-accent)] px-2.5 py-1.5 text-center shadow-lg text-[var(--color-primary-brand)]">
      <div className="text-2xl font-black leading-none">{formatEventDay(iso)}</div>
      <div className="text-[0.7rem] font-extrabold uppercase tracking-[0.15em] leading-tight">
        {formatEventMonthShort(iso)}
        {showYear ? ` ${String(year).slice(2)}` : ""}
      </div>
    </div>
  );
}

/**
 * Mystery poster card: by default only the photo and the date plate show.
 * Hovering (or tapping, on touch screens) deepens the overlay and slides up a
 * bottom panel with the title, details and agenda CTA. Past events render
 * compact and slightly dimmed (not desaturated), brightening on hover, without
 * the CTA.
 */
export function EventCard({
  event,
  index = 0,
  past = false,
  onOpen,
}: {
  event: ClubEvent;
  index?: number;
  past?: boolean;
  /** When set, clicking the card opens the detail lightbox instead of toggling the inline panel. */
  onOpen?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: reduceMotion ? 0 : (index % 3) * 0.08, ease: "easeOut" }}
      onClick={() => (onOpen ? onOpen() : setOpen((value) => !value))}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
        past ? "h-72" : "h-[26rem]"
      }`}
    >
      <img
        src={eventRepository.getEventImageUrl(event.image)}
        alt={event.title}
        loading="lazy"
        className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
          past ? "brightness-[0.82] group-hover:brightness-100" : ""
        }`}
      />

      {/* Light wash so the photo stays the star; a deeper gradient fades in for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary-brand-darker)]/45 via-transparent to-transparent" />
      <div
        className={`absolute inset-0 bg-gradient-to-t from-[var(--color-primary-brand-darker)]/95 via-[var(--color-primary-brand-darker)]/40 to-black/15 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        } group-hover:opacity-100`}
      />

      <div className="absolute left-3 top-3 z-10">
        <DatePlate iso={event.start_date} />
      </div>

      {/* The highlighted event also stars in the hero above; this badge ties the two together */}
      {event.highlighted && !past && (
        <div
          title="Uitgelicht"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] shadow-lg"
        >
          <Sparkles className="h-4 w-4 text-[var(--color-primary-brand)]" />
        </div>
      )}

      {/* Hidden bottom panel: slides up on hover or tap */}
      <div
        className={`absolute inset-x-0 bottom-0 z-10 grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        } group-hover:grid-rows-[1fr]`}
      >
        <div
          className={`min-h-0 overflow-hidden transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          } group-hover:opacity-100`}
        >
          <div className="flex flex-col gap-2.5 p-4">
            <h3 className="text-white label-large font-black italic uppercase tracking-tight leading-tight drop-shadow-lg">
              {event.title}
            </h3>

            {event.description && (
              <p className={`text-white/85 body-small leading-relaxed ${past ? "line-clamp-2" : "line-clamp-3"}`}>
                {event.description}
              </p>
            )}

            {/* Time + location at the bottom, with the photos link pushed to the bottom-right
                (mirrors the detail lightbox). */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 shadow-sm text-white label-small font-semibold">
                <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
                <span className="capitalize">{formatEventWeekday(event.start_date)}</span>{" "}
                {formatEventTimeRange(event.start_date, event.end_date)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 shadow-sm text-white label-small font-semibold">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
                {event.location}
              </span>

              {past && event.album_id != null && (event.albumMediaCount ?? 0) > 0 && (
                <Link
                  href={`/galerij?album=${event.album_id}`}
                  onClick={(clickEvent) => clickEvent.stopPropagation()}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md text-white px-4 py-1.5 shadow-lg label-small font-extrabold uppercase tracking-wide transition-all hover:bg-white/30 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Foto's
                </Link>
              )}
            </div>

            {!past && (
              <a
                href={googleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(clickEvent) => clickEvent.stopPropagation()}
                className="self-start inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent)] text-[var(--color-primary-brand)] px-4 py-1.5 label-small font-extrabold uppercase tracking-wide shadow-lg transition-all hover:bg-white hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                Zet in agenda
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
