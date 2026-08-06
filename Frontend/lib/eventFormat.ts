// The database stores a single timestamptz; the UI shows date and start time separately.
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

/** Month-group label for the timeline; the year is added only when it differs from today's. */
export function formatEventMonthLabel(iso: string): string {
  const date = new Date(iso);
  const month = date.toLocaleDateString("nl-BE", { month: "long" });
  return date.getFullYear() === new Date().getFullYear() ? month : `${month} ${date.getFullYear()}`;
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

/** ISO timestamp → iCalendar "YYYYMMDDTHHMMSSZ" UTC format. */
const toCalendarDate = (iso: string): string =>
  new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Backslashes, semicolons, commas and newlines are all delimiters in a property value. */
const escapeCalendarText = (value: string): string =>
  value.replace(/([\\;,])/g, "\\$1").replace(/\r?\n/g, "\\n");

/**
 * A downloadable .ics file for the event (2-hour default duration when it has
 * no end). Using an .ics data URL keeps it generic: it opens in whatever
 * calendar app the visitor has (Google, Apple, Outlook, …) on whatever device
 * they are on, rather than forcing one provider. Same approach as the match
 * card on the team pages.
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

/** Filename for the downloaded .ics: the event title, stripped to something safe. */
export function eventCalendarFileName(event: { title: string }): string {
  const slug = event.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "evenement"}.ics`;
}
