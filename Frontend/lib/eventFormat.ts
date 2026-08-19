// Alles wat met datums van evenementen te maken heeft.
//
// In de database staat één tijdstip per evenement (start_date, en optioneel
// end_date). De site toont dat op veel verschillende manieren: als dagnummer op
// de tijdlijn, als "zaterdag 14 maart 2026", als beginuur, ... Die omzettingen
// staan allemaal hier, zodat de datums er overal hetzelfde uitzien.
//
// Gebruikt door sections/events/* en sections/home/NextEventCountdown.
export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" });
}

export function formatEventWeekday(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-BE", { weekday: "long" });
}

export function formatEventDay(iso: string): string {
  return String(new Date(iso).getDate());
}

export function formatEventMonthShort(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-BE", { month: "short" }).replace(".", "");
}

export function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" });
}

export function formatEventTimeRange(startIso: string, endIso: string | null): string {
  const start = formatEventTime(startIso);
  return endIso ? `${start} - ${formatEventTime(endIso)}` : start;
}

type CalendarEvent = {
  id?: number;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string | null;
};

/** Zet een tijdstip om naar de schrijfwijze die agenda-bestanden verwachten. */
const toCalendarDate = (iso: string): string =>
  new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Tekens als ; en , hebben een eigen betekenis in een agenda-bestand, dus die moeten ontsnapt worden. */
const escapeCalendarText = (value: string): string =>
  value.replace(/([\\;,])/g, "\\$1").replace(/\r?\n/g, "\\n");

/**
 * Maakt een downloadbaar agenda-bestand (.ics) van een evenement, voor de knop
 * "Zet in agenda". Heeft het evenement geen einduur, dan rekenen we 2 uur.
 *
 * Bewust een .ics-bestand en geen link naar Google Agenda: zo opent het in de
 * agenda-app die de bezoeker zelf gebruikt (Google, Apple, Outlook, ...).
 * De wedstrijdkaart op een teampagina doet hetzelfde.
 */
export function eventCalendarFileUrl(event: CalendarEvent): string {
  const end = event.end_date ?? new Date(new Date(event.start_date).getTime() + 2 * 60 * 60 * 1000).toISOString();

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FitHam//Evenement//NL",
    "BEGIN:VEVENT",
    `UID:${event.id ?? toCalendarDate(event.start_date)}@fitham`,
    `DTSTAMP:${toCalendarDate(new Date().toISOString())}`,
    `DTSTART:${toCalendarDate(event.start_date)}`,
    `DTEND:${toCalendarDate(end)}`,
    `SUMMARY:${escapeCalendarText(event.title)}`,
    `LOCATION:${escapeCalendarText(event.location)}`,
    `DESCRIPTION:${escapeCalendarText(event.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

/** Bestandsnaam van de download: de titel van het evenement, ontdaan van rare tekens. */
export function eventCalendarFileName(event: { title: string }): string {
  const slug = event.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "evenement"}.ics`;
}
