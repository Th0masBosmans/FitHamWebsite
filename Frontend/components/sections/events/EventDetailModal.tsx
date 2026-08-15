"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { CalendarPlus, Camera, CheckCircle2, Clock, MapPin, Sparkles, X } from "lucide-react";
import { EventRepository, type ClubEvent } from "@/repository/eventRepository";
import {
  formatEventDay,
  formatEventMonthShort,
  formatEventTimeRange,
  formatEventWeekday,
  eventCalendarFileName,
  eventCalendarFileUrl,
} from "@/lib/eventFormat";

const eventRepository = new EventRepository();

type EventDetailModalProps = {
  event: ClubEvent | null;
  past: boolean;
  onClose: () => void;
}

/**
 * Het venster dat opengaat als je op een evenement in de tijdlijn klikt. Zelfde
 * opzet als de fotoviewer in de galerij, maar dan voor één evenement: de affiche
 * bovenaan, daaronder de titel, de details en de volledige omschrijving (op het
 * kaartje zelf staat die afgekapt).
 */
export function EventDetailModal({ event, past, onClose }: EventDetailModalProps) {
  // Escape sluit het venster, en de pagina erachter mag niet meescrollen.
  useEffect(() => {
    if (!event) return;
    const onKey = (keyEvent: KeyboardEvent) => keyEvent.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [event, onClose]);

  const year = event ? new Date(event.start_date).getFullYear() : 0;
  const showYear = year !== new Date().getFullYear();
  const hasPhotos = past && event?.album_id != null && (event?.albumMediaCount ?? 0) > 0;

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 shadow-2xl"
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            {/* Clubachtergrond achter alles, zelfde look als de fotoviewer */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-brand-darker)] via-[var(--color-primary-brand)] to-[var(--color-primary-brand-dark)]" />
              <div className="absolute top-[-20%] right-[-10%] h-[70%] w-[70%] rounded-full bg-[var(--color-secondary-brand)] opacity-25 blur-3xl" />
              <div className="absolute bottom-[-25%] left-[-15%] h-[75%] w-[75%] rounded-full bg-[var(--color-accent)] opacity-15 blur-3xl" />
            </div>

            <div className="relative max-h-[90vh] overflow-y-auto">
              {/* De affiche van het evenement */}
              <div className="relative h-60 w-full sm:h-72">
                <img
                  src={eventRepository.getEventImageUrl(event.image)}
                  alt={event.title}
                  className={`h-full w-full object-cover ${past ? "brightness-90" : ""}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary-brand-darker)] via-[var(--color-primary-brand-darker)]/30 to-transparent" />

                {/* Het vertrouwde gele datumblokje linksboven */}
                <div className="absolute left-4 top-4 rounded-xl bg-[var(--color-accent)] px-2.5 py-1.5 text-center shadow-lg text-[var(--color-primary-brand)]">
                  <div className="text-2xl font-black leading-none">{formatEventDay(event.start_date)}</div>
                  <div className="text-[0.7rem] font-extrabold uppercase tracking-[0.15em] leading-tight">
                    {formatEventMonthShort(event.start_date)}
                    {showYear ? ` ${String(year).slice(2)}` : ""}
                  </div>
                </div>

                {/* Melding "voorbij" bovenaan de foto */}
                {past && (
                  <span className="absolute left-1/2 top-4 z-10 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-4 py-1.5 shadow-lg text-white/90 label-small font-extrabold uppercase tracking-wide">
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-accent)]" />
                    Afgelopen
                  </span>
                )}
              </div>

              {/* Sluitknop */}
              <button
                onClick={onClose}
                aria-label="Sluiten"
                className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60 hover:scale-105 active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Het tekstpaneel met alle info */}
              <div className="relative flex flex-col gap-4 p-6 pt-7">
                {!past && event.highlighted && (
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent)] text-[var(--color-primary-brand)] px-3 py-1.5 shadow-lg label-small font-extrabold uppercase tracking-wide">
                      <Sparkles className="h-3.5 w-3.5" />
                      Uitgelicht
                    </span>
                  </div>
                )}

                <h2 className="text-white title-section drop-shadow-lg">{event.title}</h2>

                {event.description && (
                  <p className="text-white/85 body-small lg:body-regular leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1.5 shadow-sm text-white label-small font-semibold">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
                    <span className="capitalize">{formatEventWeekday(event.start_date)}</span>{" "}
                    {formatEventTimeRange(event.start_date, event.end_date)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1.5 shadow-sm text-white label-small font-semibold">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
                    {event.location}
                  </span>

                  {hasPhotos && (
                    <>
                      {/* Op een telefoon zetten we het linkje naar de foto's op een
                          eigen regel onder het uur en de plaats; op bredere schermen
                          staat het ernaast, rechts uitgelijnd. */}
                      <span aria-hidden className="basis-full sm:hidden" />
                      <Link
                        href={`/galerij?album=${event.album_id}`}
                        className="sm:ml-auto inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md text-white px-4 py-1.5 shadow-lg label-small font-extrabold uppercase tracking-wide transition-all hover:bg-white/30 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        Bekijk foto's
                      </Link>
                    </>
                  )}
                </div>

                {!past && (
                  <a
                    href={eventCalendarFileUrl(event)}
                    download={eventCalendarFileName(event)}
                    className="self-start inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] text-[var(--color-primary-brand)] px-5 py-2 shadow-lg label-small font-extrabold uppercase tracking-wide transition-all hover:bg-white hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <CalendarPlus className="h-4 w-4" />
                    Zet in agenda
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
