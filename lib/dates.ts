const eventDateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "America/Mexico_City",
});

export function formatEventDate(value: string) {
  return eventDateFormatter.format(new Date(value));
}
