"use client";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { TeamRepository } from "@/repository/teamRepository";
import type { StaffMember } from "@/types";

const teamRepository = new TeamRepository();

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** "Stafleden" card: coaches/trainers with their photo (or initials) and role. */
export function TeamStaffList({ staff }: { staff: StaffMember[] }) {
  if (staff.length === 0) return null;

  return (
    <div className="mt-6">
      <SectionHeading title="Stafleden" />
      <div className="rounded-2xl border-2 border-white/50 bg-white/90 backdrop-blur-md p-5 shadow-xl">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {staff.map((member) => (
            <div key={member.id} className="flex items-center gap-3 rounded-xl bg-[var(--color-primary-brand)]/5 p-3 transition-colors hover:bg-[var(--color-primary-brand)]/10">
              {member.photo ? (
                <img src={teamRepository.getStaffPhotoUrl(member.photo)} alt={member.name} className="h-12 w-12 shrink-0 rounded-full border-2 border-[var(--color-primary-brand)]/15 object-cover" />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-brand)] text-white label-small font-black">
                  {initials(member.name)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-[var(--color-primary-brand)]/60 label-small font-semibold">{member.role}</p>
                <p className="truncate text-[var(--color-primary-brand)] label-regular font-extrabold">{member.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
