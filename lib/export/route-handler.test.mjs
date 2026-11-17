import assert from "node:assert/strict";
import test from "node:test";
import { createAttendeesDownloadHandler } from "./route-handler.ts";

const context = { params: Promise.resolve({ eventId: "event-1" }) };

test("returns 403 JSON for an authenticated non-owner", async () => {
  const handler = createAttendeesDownloadHandler(async () => ({
    status: "forbidden",
  }));

  const response = await handler(new Request("https://example.test"), context);

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    error: "No tienes acceso a los asistentes de este evento.",
  });
});

test("returns the CSV as a private attachment", async () => {
  const handler = createAttendeesDownloadHandler(async () => ({
    status: "success",
    csv: "\uFEFFnombre,email",
    filename: "asistentes-festival-2026-11-07.csv",
  }));

  const response = await handler(new Request("https://example.test"), context);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(
    response.headers.get("content-disposition"),
    'attachment; filename="asistentes-festival-2026-11-07.csv"',
  );
  assert.equal(response.headers.get("content-type"), "text/csv; charset=utf-8");
  const bytes = new Uint8Array(await response.arrayBuffer());
  assert.deepEqual([...bytes.slice(0, 3)], [0xef, 0xbb, 0xbf]);
  assert.equal(new TextDecoder().decode(bytes), "nombre,email");
});
