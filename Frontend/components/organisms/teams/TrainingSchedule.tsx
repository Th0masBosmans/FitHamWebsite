"use client";

import { Clock } from "lucide-react";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { TrainingDay } from "@/types";

/** "Trainingstijden" column: each training day with its time slot. */
export function TrainingSchedule({ trainingDays }: { trainingDays: TrainingDay[] }) {
  if (trainingDays.length === 0) return null;

  return (
    <div className="flex h-full flex-col">
      <SectionHeading title="Trainingstijden" />
      <div className="flex flex-1 flex-col gap-3">
        {trainingDays.map((training) => (
          <div key={training.id} className="flex flex-1 items-center gap-4 rounded-2xl border-2 border-white/50 bg-white/90 p-5 shadow-xl transition-transform hover:scale-[1.02]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-brand)]">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[var(--color-primary-brand)] label-large font-extrabold">{training.day}</p>
              <p className="text-[var(--color-primary-brand)]/70 font-semibold">{training.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
