"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { TeamRepository, type Team } from "@/repository/teamRepository";

const teamRepository = new TeamRepository();

/**
 * Compact banner card for one team: the photo fills a short row, darkened so
 * the team name stays legible, with a chevron hinting at the team page. Clicking
 * opens the team's page.
 */
export function TeamCard({ team, index = 0 }: { team: Team; index?: number }) {
  const reduceMotion = useReducedMotion();
  const photo = team.photo_url ? teamRepository.getTeamPhotoUrl(team.photo_url) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: reduceMotion ? 0 : (index % 2) * 0.08, ease: "easeOut" }}
    >
      <Link
        href={`/teams/${team.id}`}
        aria-label={`Bekijk ${team.name}`}
        className="group block relative h-28 overflow-hidden rounded-2xl shadow-xl transition-all duration-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
      >
        {/* Photo (or brand fallback) behind a dark scrim that keeps the name legible */}
        {photo ? (
          <img
            src={photo}
            alt={team.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--color-primary-brand)]" />
        )}
        <div className="absolute inset-0 bg-black/70 transition-colors duration-150 group-hover:bg-black/60" />

        <div className="relative flex h-full items-center justify-between gap-3 px-5">
          <h3 className="text-white label-large font-extrabold drop-shadow-lg">{team.name}</h3>
          <ChevronRight className="h-6 w-6 shrink-0 text-white drop-shadow-lg transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </Link>
    </motion.div>
  );
}
