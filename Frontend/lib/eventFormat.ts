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

export function googleCalendarUrl(event: {
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string | null;
}): string {
  const toGCalDate = (iso: string) => new Date(iso).toISOString().replace(/\.\d{3}|[-:]/g, "");
  // Google Calendar requires an end time; default to two hours after the start.
  const end = event.end_date ?? new Date(new Date(event.start_date).getTime() + 2 * 60 * 60 * 1000).toISOString();

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toGCalDate(event.start_date)}/${toGCalDate(end)}`,
    details: event.description,
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
