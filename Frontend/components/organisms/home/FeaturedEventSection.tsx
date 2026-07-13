"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { FeaturedEventCard } from "@/components/organisms/events/FeaturedEventCard";
import { EventRepository, type ClubEvent } from "@/repository/eventRepository";

const eventRepository = new EventRepository();

/**
 * Home-page spotlight for the club's highlighted event. Mirrors the events
 * page: same selection (the upcoming event flagged `highlighted`) and the same
 * `FeaturedEventCard`, aligned to the events-page container widths so the two
 * pages read as one continuous design. Renders nothing when no upcoming event
 * is highlighted.
 */
export function FeaturedEventSection() {
  const [event, setEvent] = useState<ClubEvent | null>(null);

  useEffect(() => {
    eventRepository.fetchEvents().then((events) => {
      // Past once fully over (end_date if set, otherwise start_date) — same rule as the events page.
      const isPast = (candidate: ClubEvent) =>
        new Date(candidate.end_date ?? candidate.start_date).getTime() < Date.now();
      const featured = events.find((candidate) => !isPast(candidate) && candidate.highlighted);
      setEvent(featured ?? null);
    });
  }, []);

  if (!event) return null;

  return (
    <section className="relative overflow-hidden py-8 lg:py-16">
      <div className="mx-auto max-w-md px-6 lg:max-w-6xl">
        <SectionHeading title="Uitgelicht evenement" />
      </div>
      <FeaturedEventCard event={event} widthClassName="max-w-md lg:max-w-6xl" agendaLabelBreakpoint="lg" />
    </section>
  );
}
