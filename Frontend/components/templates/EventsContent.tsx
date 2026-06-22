"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { PageHeading } from "@/components/molecules/PageHeading";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { EventRepository, type ClubEvent } from "@/repository/eventRepository";
import { FeaturedEventCard } from "@/components/organisms/events/FeaturedEventCard";
import { EventsTimeline } from "@/components/organisms/events/EventsTimeline";
import { TimelineTopArrow, TimelineBottomDashes } from "@/components/organisms/events/timelineParts";

const eventRepository = new EventRepository();
export function EventsContent() {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    eventRepository
      .fetchEvents()
      .then(setEvents)
      .finally(() => setLoaded(true));
  }, []);

  // An event is past once it is fully over (end_date if set, otherwise start_date).
  const isPast = (event: ClubEvent) => new Date(event.end_date ?? event.start_date).getTime() < Date.now();

  const upcomingEvents = events.filter((event) => !isPast(event));
  const pastEvents = events.filter(isPast).reverse();

  // The highlighted event gets the spotlight up top and keeps its
  // chronological spot in the timeline, so the calendar below stays complete.
  const featuredEvent = upcomingEvents.find((event) => event.highlighted);

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
          title="Evenementen"
          subtitle="Van tornooi tot teamfeest: de volledige clubkalender."
          delay={0.1}
        />
      </div>

      {featuredEvent && <FeaturedEventCard event={featuredEvent} />}

      {loaded && (
        <div className="relative mx-auto max-w-md px-6 sm:max-w-2xl lg:max-w-5xl">
          <section className="mt-12 lg:mt-20">
            <SectionHeading title="Events" />

            {upcomingEvents.length > 0 || pastEvents.length > 0 ? (
              <EventsTimeline upcoming={upcomingEvents} past={pastEvents} />
            ) : (
              // No events at all: a short arrow-topped, dash-tailed stub of spine
              // stands in for the (otherwise empty) timeline.
              <div className="relative mx-auto my-6 h-20 w-[5px]">
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 bottom-0 rounded-full bg-gradient-to-b from-[var(--color-accent-border)] to-[var(--color-accent)] shadow-[0_0_10px_rgba(250,204,21,0.55)]"
                />
                <TimelineTopArrow className="top-0 -translate-y-full" />
                <TimelineBottomDashes className="bottom-0 translate-y-full" />
              </div>
            )}
          </section>
        </div>
      )}
    </motion.div>
  );
}
