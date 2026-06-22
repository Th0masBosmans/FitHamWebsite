"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Users, Plus, Minus } from "lucide-react";
import { PageHeading } from "@/components/molecules/PageHeading";
import { TeamRepository, type Team, type Division } from "@/repository/teamRepository";
import { TeamCard } from "@/components/organisms/teams/TeamCard";

const teamRepository = new TeamRepository();

// The public Teams page shows one collapsible block per division, in this order.
const DIVISIONS: { key: Division; title: string }[] = [
  { key: "jeugd", title: "Jeugd" },
  { key: "dames", title: "Dames" },
  { key: "heren", title: "Heren" },
  { key: "recreatie", title: "Recreatie" },
];

/** Yellow-bar header with a plus/minus toggle that expands a grid of team cards. */
function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="group flex w-full cursor-pointer items-center gap-3 focus:outline-none"
      >
        <div className="h-1 flex-1 rounded-full bg-[var(--color-accent)] transition-opacity group-hover:opacity-80" />
        <h2 className="whitespace-nowrap text-white title-section">{title}</h2>
        <div className="h-1 flex-1 rounded-full bg-[var(--color-accent)] transition-opacity group-hover:opacity-80" />

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
          <motion.div initial={false} animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
            {isOpen ? (
              <Minus className="h-5 w-5 text-[var(--color-accent)]" />
            ) : (
              <Plus className="h-5 w-5 text-[var(--color-accent)]" />
            )}
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4 pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TeamsContent() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    teamRepository
      .fetchTeams()
      .then(setTeams)
      .finally(() => setLoaded(true));
  }, []);

  // Only the divisions that actually have teams get a section.
  const sections = DIVISIONS.map((division) => ({
    ...division,
    teams: teams.filter((team) => team.division === division.key),
  })).filter((section) => section.teams.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden pb-16 lg:pb-24"
    >
      {/* Atmospheric backdrop glows, behind the content layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-24 -right-24 h-72 w-72 rounded-full bg-[var(--color-secondary-brand)]/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-40 -left-28 h-80 w-80 rounded-full bg-[var(--color-accent)]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-md px-6 pt-6 sm:max-w-2xl lg:max-w-5xl">
        <PageHeading
          title="Onze Teams"
          subtitle="Alle teams van jong tot ervaren spelers."
          delay={0.1}
        />

        {loaded && teams.length === 0 && (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md px-6 py-12 text-center shadow-xl">
            <Users className="h-8 w-8 text-[var(--color-accent)]" />
            <p className="max-w-md text-white/85 body-regular">
              Er zijn nog geen teams toegevoegd. Kom binnenkort nog eens kijken!
            </p>
          </div>
        )}

        {sections.map((section) => (
          <CollapsibleSection key={section.key} title={section.title}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.teams.map((team, index) => (
                <TeamCard key={team.id} team={team} index={index} />
              ))}
            </div>
          </CollapsibleSection>
        ))}

        {/* Twizzit + Lid Worden CTAs */}
        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <motion.a
            href="https://twizzit.com/fitham"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative flex w-full items-center justify-center rounded-2xl bg-[var(--color-primary-brand)] px-6 py-4 text-white label-large font-extrabold uppercase tracking-wide shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/twizziticon.png" alt="Twizzit" className="absolute left-6 h-6 w-6 shrink-0 object-contain" />
            Twizzit
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/membership"
              className="relative flex w-full items-center justify-center rounded-2xl bg-[var(--color-accent)] px-6 py-4 text-[var(--color-primary-brand)] label-large font-extrabold uppercase tracking-wide shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
            >
              <Users className="absolute left-6 h-6 w-6 shrink-0" />
              Lid Worden
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
