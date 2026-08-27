"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera, CalendarPlus, Clock, MapPin, Sparkles } from "lucide-react";
import { EventRepository, type ClubEvent } from "@/repository/eventRepository";
import { useIsDesktop } from "@/lib/useIsDesktop";
import { EventRegistrationButton } from "./EventRegistrationButton";
import {
  formatEventDay,
  formatEventMonthShort,
  formatEventTimeRange,
  formatEventWeekday,
  eventCalendarFileName,
  eventCalendarFileUrl,
} from "@/lib/eventFormat";

const eventRepository = new EventRepository();

/** Het gele datumblokje op de foto (dag + maand). Zelfde voor komende en voorbije evenementen. */
function DatePlate({ iso }: { iso: string }) {
  const year = new Date(iso).getFullYear();
  const showYear = year !== new Date().getFullYear();

  return (
    <div className="rounded-xl bg-[var(--color-accent)] px-2.5 py-1.5 text-center shadow-lg text-[var(--color-primary-brand)]">
      <div className="text-2xl font-black leading-none">{formatEventDay(iso)}</div>
      <div className="text-[0.7rem] font-extrabold uppercase tracking-[0.15em] leading-tight">
        {formatEventMonthShort(iso)}
        {showYear ? ` ${String(year).slice(2)}` : ""}
      </div>
    </div>
  );
}

/**
 * Een evenementkaartje op de tijdlijn.
 *
 * Op de affiche staat de basis: de titel, het uur en de plaats. De rest — de
 * omschrijving en de knop eronder — zit verstopt tot je met de muis over de
 * kaart gaat (vanaf tablet) of erop tikt (op een gsm).
 *
 * Het verschil tussen de twee zit in de hoogte. Vanaf tablet heeft de kaart een
 * vaste hoogte, vult de affiche ze helemaal op en ligt alle tekst erover: de
 * basis is dan mee verstopt en schuift van onderen omhoog. Op een gsm staat de
 * affiche volledig in beeld, blijft de basis er altijd op staan en groeit de
 * kaart naar beneden: de rest klapt open in een vlak onder de foto.
 *
 * Voorbije evenementen zijn kleiner en wat gedempt, en krijgen geen agenda-knop.
 */
export function EventCard({
  event,
  past = false,
  onOpen,
}: {
  event: ClubEvent;
  past?: boolean;
  /** Als dit meegegeven is, opent een klik het detailvenster in plaats van het paneeltje open te klappen. */
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  // Vanaf tablet opent een klik het detailvenster; op een gsm klapt een tik de
  // kaart open, want daar staat alle info al op en onder de affiche zelf.
  const isWide = useIsDesktop(640);

  const hasPhotos = past && event.album_id != null && (event.albumMediaCount ?? 0) > 0;
  // Is er een inschrijflink, dan is dat de knop die moet opvallen en zakt
  // "zet in agenda" naar de gedempte glazen stijl.
  const showRegistration = !past && Boolean(event.registration_url);
  // Bij een voorbij evenement zonder omschrijving en zonder album valt er niets
  // open te klappen; dan tonen we ook het pijltje niet.
  const hasMore = Boolean(event.description) || hasPhotos || !past;

  return (
    <article
      onClick={() => (onOpen && isWide ? onOpen() : setOpen((value) => !value))}
      className={`group relative grid grid-cols-1 cursor-pointer overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 sm:flex sm:flex-col sm:justify-end ${
        past ? "h-auto sm:h-72" : "h-auto sm:h-[26rem]"
      }`}
    >
      {/* De affiche. Op een gsm bepaalt zij de hoogte van de kaart zodat ze
          volledig te zien is; vanaf tablet vult ze de kaart op als achtergrond. */}
      <img
        src={eventRepository.getEventImageUrl(event.image)}
        alt={event.title}
        loading="lazy"
        className={`col-start-1 row-start-1 block h-auto w-full transition-all duration-500 sm:absolute sm:inset-0 sm:h-full sm:object-cover sm:group-hover:scale-105 ${
          past ? "brightness-[0.82] group-hover:brightness-100" : ""
        }`}
      />

      {/* Waas onderaan de affiche zodat de titel, het uur en de plaats leesbaar
          blijven. Op een gsm mag die donkerder: daar staat de tekst er altijd op. */}
      <div className="col-start-1 row-start-1 bg-gradient-to-t from-[var(--color-primary-brand-darker)]/85 via-[var(--color-primary-brand-darker)]/20 to-transparent sm:absolute sm:inset-0 sm:from-[var(--color-primary-brand-darker)]/45 sm:via-transparent" />

      {/* Extra donkere waas terwijl het paneeltje over de affiche schuift. Enkel
          vanaf tablet: op een gsm ligt de rest onder de foto, niet erover. */}
      <div
        className={`hidden sm:block sm:absolute sm:inset-0 bg-gradient-to-t from-[var(--color-primary-brand-darker)]/95 via-[var(--color-primary-brand-darker)]/40 to-black/15 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        } group-hover:opacity-100`}
      />

      <div className="absolute left-3 top-3 z-10">
        <DatePlate iso={event.start_date} />
      </div>

      {/* Het uitgelichte evenement staat ook bovenaan de pagina; dit label verbindt de twee */}
      {event.highlighted && !past && (
        <div
          title="Uitgelicht"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] shadow-lg"
        >
          <Sparkles className="h-4 w-4 text-[var(--color-primary-brand)]" />
        </div>
      )}

      {/* De basis op de affiche: titel, uur en plaats. Op een gsm altijd te zien;
          vanaf tablet mee verstopt tot je over de kaart gaat.

          self-end zet dit blok op een gsm onderaan de affiche (in het raster is
          dat de verticale as), maar vanaf tablet is de kaart een kolom en zou
          diezelfde regel het blok naar rechts duwen en laten krimpen. Vandaar
          sm:self-stretch: daar hoort het gewoon over de volle breedte links. */}
      <div
        className={`col-start-1 row-start-1 z-10 grid self-end transition-[grid-template-rows] duration-300 ease-out sm:self-stretch ${
          open ? "sm:grid-rows-[1fr]" : "sm:grid-rows-[0fr]"
        } sm:group-hover:grid-rows-[1fr]`}
      >
        <div
          className={`min-h-0 overflow-hidden transition-opacity duration-300 ${
            open ? "sm:opacity-100" : "sm:opacity-0"
          } sm:group-hover:opacity-100`}
        >
          <div className="flex flex-col gap-2 p-4 sm:pb-2.5">
            <h3 className="text-white label-large font-black italic uppercase tracking-tight leading-tight drop-shadow-lg">
              {event.title}
            </h3>

            {/* Het uur en de plaats horen naast elkaar te staan. Op een gsm laten
                we de dag van de week weg en maken we de pilletjes wat smaller,
                anders passen ze samen niet op één regel. */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/15 backdrop-blur-md px-2.5 py-1 shadow-sm text-white label-small font-semibold sm:px-3">
                <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
                <span className="hidden capitalize sm:inline">{formatEventWeekday(event.start_date)} </span>
                {formatEventTimeRange(event.start_date, event.end_date)}
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/15 backdrop-blur-md px-2.5 py-1 shadow-sm text-white label-small font-semibold sm:px-3">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
                {event.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* De rest: omschrijving en knop. Op een gsm klapt dit open in een gekleurd
          vlak onder de foto; vanaf tablet hoort het bij het paneeltje op de foto. */}
      {hasMore && (
        <div
          className={`col-start-1 row-start-2 z-10 grid transition-[grid-template-rows] duration-300 ease-out ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          } sm:group-hover:grid-rows-[1fr]`}
        >
          <div
            className={`min-h-0 overflow-hidden transition-opacity duration-300 ${
              open ? "opacity-100" : "opacity-0"
            } sm:group-hover:opacity-100`}
          >
            <div className="flex flex-col items-start gap-2.5 bg-[var(--color-primary-brand-darker)] px-4 pb-4 pt-3 sm:bg-transparent sm:pt-0">
              {event.description && (
                <p
                  className={`text-white/85 body-small leading-relaxed ${
                    past ? "sm:line-clamp-2" : "sm:line-clamp-3"
                  }`}
                >
                  {event.description}
                </p>
              )}

              {hasPhotos && (
                <Link
                  href={`/galerij?album=${event.album_id}`}
                  onClick={(clickEvent) => clickEvent.stopPropagation()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md text-white px-4 py-1.5 shadow-lg label-small font-extrabold uppercase tracking-wide transition-all hover:bg-white/30 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Foto's
                </Link>
              )}

              {!past && (
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {showRegistration && (
                    <EventRegistrationButton url={event.registration_url!} label={event.registration_label} size="small" />
                  )}
                  <a
                    href={eventCalendarFileUrl(event)}
                    download={eventCalendarFileName(event)}
                    onClick={(clickEvent) => clickEvent.stopPropagation()}
                    aria-label="Zet in agenda"
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 label-small font-extrabold uppercase tracking-wide shadow-lg transition-all hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-white sm:px-4 ${
                      showRegistration
                        ? "bg-white/15 backdrop-blur-md text-white hover:bg-white/30"
                        : "bg-[var(--color-accent)] text-[var(--color-primary-brand)] hover:bg-white"
                    }`}
                  >
                    <CalendarPlus className="h-3.5 w-3.5 shrink-0" />
                    {/* Staat er een actieknop naast, dan is er op een gsm geen
                        plaats voor het volledige opschrift; samen met het
                        icoontje is "agenda" daar duidelijk genoeg. */}
                    {showRegistration ? (
                      <>
                        <span className="sm:hidden">Agenda</span>
                        <span className="hidden sm:inline">Zet in agenda</span>
                      </>
                    ) : (
                      "Zet in agenda"
                    )}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
