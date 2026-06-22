"use client";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { VolleyRankingRow } from "@/lib/volleyRepository";

/** "Rangschikking" standings table; the club's own rows are highlighted yellow. */
export function StandingsTable({ ranking, loading }: { ranking: VolleyRankingRow[]; loading: boolean }) {
  return (
    <div className="mt-6">
      <SectionHeading title="Rangschikking" />
      <div className="overflow-hidden rounded-2xl border-2 border-white/50 bg-white/90 p-5 shadow-xl">
        {loading ? (
          <div className="h-40 animate-pulse rounded-xl bg-black/5" />
        ) : ranking.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-[var(--color-primary-brand)]/70 body-small font-semibold">Geen rangschikking beschikbaar.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-2 grid grid-cols-[40px_1fr_50px] divide-x divide-black/[0.04] border-b-2 border-[var(--color-primary-brand)]/20 pb-3 sm:grid-cols-[40px_1fr_40px_40px_40px_50px] lg:grid-cols-[60px_1fr_60px_60px_60px_80px]">
              <div className="px-2 text-center text-[var(--color-primary-brand)]/70 label-small font-bold">#</div>
              <div className="px-2 text-[var(--color-primary-brand)]/70 label-small font-bold">Ploeg</div>
              <div className="hidden px-2 text-center text-[var(--color-primary-brand)]/70 label-small font-bold sm:block">GW</div>
              <div className="hidden px-2 text-center text-[var(--color-primary-brand)]/70 label-small font-bold sm:block">SW</div>
              <div className="hidden px-2 text-center text-[var(--color-primary-brand)]/70 label-small font-bold sm:block">SV</div>
              <div className="px-2 text-center text-[var(--color-primary-brand)]/70 label-small font-bold">Ptn</div>
            </div>

            {/* Rows */}
            <div className="space-y-1">
              {ranking.map((row) => (
                <div
                  key={`${row.volgorde}-${row.ploegnaam}`}
                  className={`grid grid-cols-[40px_1fr_50px] items-center divide-x divide-black/[0.04] rounded-lg py-2 sm:grid-cols-[40px_1fr_40px_40px_40px_50px] lg:grid-cols-[60px_1fr_60px_60px_60px_80px] lg:py-3 ${
                    row.isHam ? "bg-[var(--color-accent)]" : "bg-white/50 hover:bg-white/70"
                  }`}
                >
                  <div className={`px-2 text-center label-small ${row.isHam ? "text-[var(--color-primary-brand)] font-extrabold" : "text-[var(--color-primary-brand)]/80 font-semibold"}`}>{row.volgorde}</div>
                  <div className={`truncate px-2 label-small ${row.isHam ? "text-[var(--color-primary-brand)] font-extrabold" : "text-[var(--color-primary-brand)]/80 font-semibold"}`}>{row.ploegnaam}</div>
                  <div className="hidden px-2 text-center text-[var(--color-primary-brand)]/70 label-small font-semibold sm:block">{row.aantalGespeeldeWedstrijden}</div>
                  <div className="hidden px-2 text-center text-[var(--color-primary-brand)]/70 label-small font-semibold sm:block">{row.aantalGewonnenSets}</div>
                  <div className="hidden px-2 text-center text-[var(--color-primary-brand)]/70 label-small font-semibold sm:block">{row.aantalVerlorenSets}</div>
                  <div className="px-2 text-center text-[var(--color-primary-brand)] label-small font-extrabold">{row.puntentotaal}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
