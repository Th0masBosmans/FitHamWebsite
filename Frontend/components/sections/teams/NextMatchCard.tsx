"use client";

import { MapPin, Calendar, Trophy } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { matchScore, type VolleyMatch } from "@/repository/volleyRepository";

/** "zaterdag 20 september 2026" from a match (falls back to the raw dd/mm/yyyy). */
const formatMatchDate = (match: VolleyMatch): string => {
  if (!match.timestamp) return match.datum;
  return new Date(match.timestamp).toLocaleDateString("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

/** Epoch ms → iCalendar "YYYYMMDDTHHMMSSZ" UTC format. */
const toCalendarDate = (ms: number): string =>
  new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/**
 * Maakt een downloadbaar agenda-bestand van de wedstrijd (we rekenen 2 uur).
 * Zo opent het in de agenda-app die de bezoeker zelf gebruikt. Dezelfde aanpak
 * als bij evenementen, zie lib/eventFormat.
 */
const calendarFileUrl = (match: VolleyMatch): string => {
  const soort = match.isBeker ? "Bekerwedstrijd" : "Volleybalwedstrijd";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FitHam//Wedstrijd//NL",
    "BEGIN:VEVENT",
    `UID:${match.timestamp}@fitham`,
    `DTSTAMP:${toCalendarDate(Date.now())}`,
    `DTSTART:${toCalendarDate(match.timestamp)}`,
    `DTEND:${toCalendarDate(match.timestamp + 2 * 60 * 60 * 1000)}`,
    `SUMMARY:${match.isBeker ? "Beker: " : ""}${match.thuisploeg} - ${match.bezoekersploeg}`,
    `LOCATION:${match.sporthal || ""}`,
    `DESCRIPTION:${soort} via FitHam`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
};

/**
 * Merkt een bekerwedstrijd aan met een bekertje in de rechterbovenhoek.
 * Competitiewedstrijden krijgen niets: die zijn de gewone gang van zaken, de
 * beker is het buitenbeentje.
 *
 * Het staat los van de inhoud (`absolute`) en op de hoek van de kaart, zodat de
 * datum, de zaal en de ploegnamen op precies dezelfde plek blijven staan als bij
 * een gewone wedstrijd, hoe lang de naam van de sporthal ook is.
 */
function BekerBadge() {
  return (
    <span
      role="img"
      aria-label="Bekerwedstrijd"
      title="Bekerwedstrijd"
      className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-primary-brand)] shadow-lg"
    >
      <Trophy className="h-5 w-5" />
    </span>
  );
}

/** "Volgende Wedstrijd" column: the upcoming/most-recent match from VolleyAdmin. */
export function NextMatchCard({ match, loading }: { match: VolleyMatch | null; loading: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <SectionHeading title="Volgende Wedstrijd" />
      {loading ? (
        <div className="h-44 flex-1 animate-pulse rounded-2xl border-2 border-white/50 bg-white/60 shadow-xl" />
      ) : match ? (
        <div className="relative flex flex-1 flex-col rounded-2xl border-2 border-white/50 bg-white/90 p-6 shadow-xl">
          {match.isBeker && <BekerBadge />}

          <div className="flex flex-1 flex-col justify-between gap-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {match.timestamp ? (
                <a
                  href={calendarFileUrl(match)}
                  download="wedstrijd.ics"
                  className="group flex cursor-pointer items-center gap-3"
                  aria-label="Voeg wedstrijd toe aan agenda"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-brand)] transition-all group-hover:scale-110 group-hover:bg-[var(--color-primary-brand-darker)]">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[var(--color-primary-brand)] label-regular font-bold capitalize transition-colors group-hover:text-[var(--color-secondary-brand)]">{formatMatchDate(match)}</p>
                    {match.aanvangsuur && (
                      <p className="text-[var(--color-primary-brand)]/80 font-bold transition-colors group-hover:text-[var(--color-secondary-brand)]">{match.aanvangsuur}</p>
                    )}
                  </div>
                </a>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-brand)]">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[var(--color-primary-brand)] label-regular font-bold capitalize">{formatMatchDate(match)}</p>
                  </div>
                </div>
              )}

              {match.sporthal && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.sporthal)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3"
                  aria-label={`Open ${match.sporthal} in Google Maps`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-brand)] transition-all group-hover:scale-110 group-hover:bg-[var(--color-primary-brand-darker)]">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[var(--color-primary-brand)] font-bold transition-colors group-hover:text-[var(--color-secondary-brand)]">{match.sporthal}</p>
                  </div>
                </a>
              )}
            </div>

            <div className="rounded-xl bg-[var(--color-primary-brand)] p-4 text-center">
              <p className="text-white label-large font-extrabold">
                {match.thuisploeg} - {match.bezoekersploeg}
              </p>
              {match.uitslag.trim() && (
                <p className="mt-1 text-[var(--color-accent)] label-large font-black">
                  {matchScore(match).home} - {matchScore(match).away}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-white/50 bg-white/90 p-6 text-center shadow-xl">
          <p className="text-[var(--color-primary-brand)]/70 body-small font-semibold">Geen geplande wedstrijd gevonden.</p>
        </div>
      )}
    </div>
  );
}
