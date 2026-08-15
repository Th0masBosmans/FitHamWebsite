"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeaturedEventCard } from "@/components/sections/events/FeaturedEventCard";
import { EventRepository, type ClubEvent } from "@/repository/eventRepository";

const eventRepository = new EventRepository();

/**
 * Het uitgelichte evenement op de homepagina.
 *
 * Kiest precies hetzelfde evenement als de evenementenpagina (het komende
 * evenement dat de beheerder aangevinkt heeft) en gebruikt ook dezelfde kaart,
 * zodat beide pagina's er hetzelfde uitzien. Is er niets uitgelicht, dan toont
 * dit blok niets.
 */
export function FeaturedEventSection() {
  const [event, setEvent] = useState<ClubEvent | null>(null);

  useEffect(() => {
    eventRepository.fetchEvents().then((events) => {
      // Voorbij als het helemaal gedaan is: einduur als dat ingevuld is, anders
      // het beginuur. Zelfde regel als op de evenementenpagina.
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
