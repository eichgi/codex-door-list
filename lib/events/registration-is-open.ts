type RegistrationEvent = {
  status: string;
  starts_at: string;
};

const mexicoCityDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Mexico_City",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function calendarDateKey(date: Date) {
  if (Number.isNaN(date.getTime())) return null;

  const parts = mexicoCityDate.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return year && month && day ? `${year}-${month}-${day}` : null;
}

export function registrationIsOpen(event: RegistrationEvent, now = new Date()) {
  if (event.status !== "published") return false;

  const eventDate = calendarDateKey(new Date(event.starts_at));
  const currentDate = calendarDateKey(now);

  return eventDate !== null && currentDate !== null && eventDate >= currentDate;
}
