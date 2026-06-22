"use client";

import { MapPin, Calendar } from "lucide-react";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { matchScore, type VolleyMatch } from "@/lib/volleyRepository";

/** "zaterdag 20 september 2026" from a match (falls back to the raw dd/mm/yyyy). */
const formatMatchDate = (match: VolleyMatch): string => {
  if (!match.timestamp) return match.datum;
  return new Date(match.timestamp).toLocaleDateString("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

/** "Volgende Wedstrijd" column: the upcoming/most-recent match from VolleyAdmin. */
export function NextMatchCard({ match, loading }: { match: VolleyMatch | null; loading: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <SectionHeading title="Volgende Wedstrijd" />
      {loading ? (
        <div className="h-44 flex-1 animate-pulse rounded-2xl border-2 border-white/50 bg-white/60 shadow-xl" />
      ) : match ? (
        <div className="flex flex-1 flex-col rounded-2xl border-2 border-white/50 bg-white/90 p-6 shadow-xl">
          <div className="flex flex-1 flex-col justify-between gap-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-brand)]">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[var(--color-primary-brand)] label-regular font-bold capitalize">{formatMatchDate(match)}</p>
                  {match.aanvangsuur && (
                    <p className="text-[var(--color-primary-brand)]/80 font-bold">{match.aanvangsuur}</p>
                  )}
                </div>
              </div>

              {match.sporthal && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.sporthal)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3"
                  aria-label={`Open ${match.sporthal} in Google Maps`}
                >
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-brand)] transition-all group-hover:scale-110 group-hover:bg-[var(--color-primary-brand-darker)]">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[var(--color-primary-brand)] font-bold underline-offset-2 group-hover:underline">{match.sporthal}</p>
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
