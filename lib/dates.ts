const eventDateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "America/Mexico_City",
});

const registrationDateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Mexico_City",
});

const chartDateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function formatEventDate(value: string) {
  return eventDateFormatter.format(new Date(value));
}

export function formatRegistrationDate(value: string) {
  return registrationDateFormatter.format(new Date(value));
}

export function formatChartDate(value: string) {
  return chartDateFormatter.format(new Date(`${value}T00:00:00Z`));
}
