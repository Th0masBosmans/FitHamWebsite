"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Users } from "lucide-react";
import { TeamRepository, type Team } from "@/repository/teamRepository";
import {
  VolleyRepository,
  pickWeekMatch,
  type VolleyMatch,
  type VolleyRankingRow,
} from "@/lib/volleyRepository";
import { TeamStaffList } from "@/components/organisms/teams/TeamStaffList";
import { TeamRoster } from "@/components/organisms/teams/TeamRoster";
import { TrainingSchedule } from "@/components/organisms/teams/TrainingSchedule";
import { NextMatchCard } from "@/components/organisms/teams/NextMatchCard";
import { StandingsTable } from "@/components/organisms/teams/StandingsTable";

const teamRepository = new TeamRepository();
const volleyRepository = new VolleyRepository();

type TeamDetailContentProps = {
  teamId: number;
}

/**
 * Full team page, rebuilt to match the Figma prototype's TeamDetail layout:
 * an info card + photo up top, the roster ("Teamleden"), then training times
 * beside the next match, and finally the white standings table. The next match
 * and standings come live from VolleyAdmin for teams linked to a series.
 */
export function TeamDetailContent({ teamId }: TeamDetailContentProps) {
  const [team, setTeam] = useState<Team | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);

  const [weekMatch, setWeekMatch] = useState<VolleyMatch | null>(null);
  const [ranking, setRanking] = useState<VolleyRankingRow[]>([]);
  const [loadingComp, setLoadingComp] = useState(false);

  // Load the team itself.
  useEffect(() => {
    let active = true;
    setLoadingTeam(true);
    teamRepository
      .fetchTeam(teamId)
      .then((fetchedTeam) => active && setTeam(fetchedTeam))
      .finally(() => active && setLoadingTeam(false));
    return () => {
      active = false;
    };
  }, [teamId]);

  // Once we know the team's series, fetch its standings + this week's match.
  useEffect(() => {
    if (!team?.reeks) {
      setWeekMatch(null);
      setRanking([]);
      return;
    }
    let active = true;
    setLoadingComp(true);
    const clubId = team.volley_club_id ?? undefined;
    Promise.all([
      volleyRepository.fetchRanking(team.reeks, clubId),
      volleyRepository.fetchMatches(team.reeks, clubId),
    ])
      .then(([rankingRows, matches]) => {
        if (!active) return;
        setRanking(rankingRows);
        setWeekMatch(pickWeekMatch(matches));
      })
      .finally(() => active && setLoadingComp(false));
    return () => {
      active = false;
    };
  }, [team?.reeks, team?.volley_club_id]);

  if (loadingTeam) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-[var(--color-accent)]" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <Users className="h-10 w-10 text-[var(--color-accent)]" />
        <p className="text-white/85 body-regular">Dit team bestaat niet (meer).</p>
        <Link href="/teams" className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-[var(--color-primary-brand)] label-small font-extrabold uppercase tracking-wide">
          <ArrowLeft className="h-4 w-4" /> Naar teams
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden pb-16 lg:pb-24"
    >
      {/* Atmospheric backdrop glows */}
      <div aria-hidden className="pointer-events-none absolute top-24 -right-24 h-72 w-72 rounded-full bg-[var(--color-secondary-brand)]/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-40 -left-28 h-80 w-80 rounded-full bg-[var(--color-accent)]/10 blur-3xl" />

      <div className="relative mx-auto max-w-md px-6 py-8 lg:max-w-6xl">
        {/* Back button */}
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/15 backdrop-blur-md px-4 py-2 text-white label-small font-bold transition-all hover:bg-white/25"
        >
          <ArrowLeft className="h-5 w-5" /> Terug
        </Link>

        {/* Team photo, full width, with the team name overlaid bottom-left */}
        <div className="relative mt-4 overflow-hidden rounded-2xl border-2 border-white/30 shadow-2xl">
          {team.photo_url ? (
            <img src={teamRepository.getTeamPhotoUrl(team.photo_url)} alt={team.name} className="h-auto w-full object-contain" />
          ) : (
            <div className="flex h-64 w-full items-center justify-center bg-gradient-to-br from-[var(--color-primary-brand)] to-[var(--color-primary-brand-darker)] lg:h-96">
              <Users className="h-16 w-16 text-white/30" />
            </div>
          )}

          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

          <div className="absolute bottom-0 left-0 flex items-center gap-3 p-5 lg:p-6">
            <div className="h-12 w-2 rounded-full bg-[var(--color-accent)]" />
            <h1 className="text-white title-page drop-shadow-lg">{team.name}</h1>
          </div>
        </div>

        {/* Info card */}
        {team.description && (
          <div className="mt-6 rounded-2xl border-2 border-white/30 bg-white/20 backdrop-blur-md p-6 shadow-xl">
            <p className="text-white/85 body-small leading-relaxed whitespace-pre-line">{team.description}</p>
          </div>
        )}

        <TeamStaffList staff={team.staff} />

        <TeamRoster players={team.players} />

        {/* Training schedule beside the next match */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TrainingSchedule trainingDays={team.training_days} />
          {team.reeks && <NextMatchCard match={weekMatch} loading={loadingComp} />}
        </div>

        {/* Standings (white table) */}
        {team.reeks && <StandingsTable ranking={ranking} loading={loadingComp} />}
      </div>
    </motion.div>
  );
}
