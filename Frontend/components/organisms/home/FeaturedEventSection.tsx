"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { FeaturedEventCard } from "@/components/organisms/events/FeaturedEventCard";
import { EventRepository, type ClubEvent } from "@/repository/eventRepository";

const eventRepository = new EventRepository();

export function FeaturedEventSection() {
  const [event, setEvent] = useState<ClubEvent | null>(null);

  useEffect(() => {
    eventRepository.fetchEvents().then((events) => {
      const upcoming = events.find(
        (candidate) => new Date(candidate.start_date).getTime() > Date.now()
      );
      setEvent(upcoming ?? null);
    });
  }, []);

  if (!event) return null;

  return (
    <div className="max-w-md lg:max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 lg:mb-16"
      >
        <SectionHeading title="Volgend evenement" />
        <FeaturedEventCard event={event} />
      </motion.div>
    </div>
  );
}
