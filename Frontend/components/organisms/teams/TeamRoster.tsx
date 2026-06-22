"use client";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { Player } from "@/types";

// Roster display order, by playing position. Anything unlisted sorts last.
const POSITION_ORDER = ["Receptie Hoek", "Spelverdeler", "Opposite", "Midden", "Libero"];
const positionRank = (position: string) => {
  const index = POSITION_ORDER.indexOf(position);
  return index === -1 ? POSITION_ORDER.length : index;
};

/** "Teamleden" card: players sorted by position, split across two columns. */
export function TeamRoster({ players }: { players: Player[] }) {
  if (players.length === 0) return null;

  const sorted = [...players].sort(
    (firstPlayer, secondPlayer) => positionRank(firstPlayer.position) - positionRank(secondPlayer.position),
  );
  // Split into two halves so each column reads top-to-bottom and players of the
  // same position stay stacked under each other.
  const half = Math.ceil(sorted.length / 2);
  const columns = [sorted.slice(0, half), sorted.slice(half)];

  return (
    <div className="mt-6">
      <SectionHeading title="Teamleden" />
      <div className="rounded-2xl border-2 border-white/50 bg-white/90 backdrop-blur-md p-3 shadow-xl">
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-x-3">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-1.5">
              {column.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[var(--color-primary-brand)]/5 px-4 py-3 transition-colors hover:bg-[var(--color-primary-brand)]/10"
                >
                  <span className="text-[var(--color-primary-brand)] label-regular font-semibold">{player.name}</span>
                  <span className="shrink-0 rounded-full bg-[var(--color-primary-brand)] px-3.5 py-1 text-white label-small font-bold">
                    {player.position}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
