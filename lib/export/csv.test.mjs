import assert from "node:assert/strict";
import test from "node:test";
import { createAttendeesCsvFilename, createCsv } from "./csv.ts";

test("creates an Excel-compatible CSV and escapes special characters", () => {
  const csv = createCsv(
    ["nombre", "notas"],
    [[`Ana "La Jefa" Pérez, Jr.`, "Primera línea\nSegunda línea"]],
  );

  assert.equal(
    csv,
    `\uFEFFnombre,notas\r\n"Ana ""La Jefa"" Pérez, Jr.","Primera línea\nSegunda línea"`,
  );
});

test("creates a headers-only CSV when there are no attendees", () => {
  assert.equal(createCsv(["nombre", "email"], []), "\uFEFFnombre,email");
});

test("creates a normalized filename in the event time zone", () => {
  assert.equal(
    createAttendeesCsvFilename(
      "Concierto Águila & Sol",
      new Date("2026-11-08T05:30:00Z"),
    ),
    "asistentes-concierto-aguila-sol-2026-11-07.csv",
  );
});
