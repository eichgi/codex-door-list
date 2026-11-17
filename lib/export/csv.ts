const csvBom = "\uFEFF";

function escapeCsvField(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);

  if (!/[",\r\n]/.test(text)) return text;

  return `"${text.replaceAll('"', '""')}"`;
}

export function createCsv(
  headers: readonly string[],
  rows: ReadonlyArray<ReadonlyArray<string | number | null | undefined>>,
) {
  const lines = [headers, ...rows].map((row) =>
    row.map(escapeCsvField).join(","),
  );

  return `${csvBom}${lines.join("\r\n")}`;
}

function slugify(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "evento";
}

function dateKey(value: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Mexico_City",
  }).formatToParts(value);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export function createAttendeesCsvFilename(eventTitle: string, now = new Date()) {
  return `asistentes-${slugify(eventTitle)}-${dateKey(now)}.csv`;
}
