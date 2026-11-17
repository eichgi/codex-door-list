import assert from "node:assert/strict";
import test from "node:test";
import { loadOrganizerAttendance } from "./attendees.ts";

function createSupabase(results) {
  const calls = [];

  return {
    calls,
    client: {
      from(table) {
        const operations = [];
        calls.push({ table, operations });
        const query = {
          select(columns) {
            operations.push(["select", columns]);
            return query;
          },
          eq(column, value) {
            operations.push(["eq", column, value]);
            return query;
          },
          in(column, values) {
            operations.push(["in", column, values]);
            return query;
          },
          order(column, options) {
            operations.push(["order", column, options]);
            return query;
          },
          maybeSingle() {
            return Promise.resolve(results[table]);
          },
          then(resolve, reject) {
            return Promise.resolve(results[table]).then(resolve, reject);
          },
        };

        return query;
      },
    },
  };
}

test("returns no data when the authenticated user does not own the event", async () => {
  const supabase = createSupabase({
    events: { data: null, error: null },
  });

  const result = await loadOrganizerAttendance(
    supabase.client,
    "another-owner",
    "event-1",
  );

  assert.deepEqual(result, { status: "forbidden" });
  assert.equal(supabase.calls.length, 1);
  assert.deepEqual(supabase.calls[0], {
    table: "events",
    operations: [
      ["select", "id, title"],
      ["eq", "id", "event-1"],
      ["eq", "owner_id", "another-owner"],
    ],
  });
});

test("excludes revoked tickets from attendees and sold counts", async () => {
  const supabase = createSupabase({
    events: {
      data: { id: "event-1", title: "Festival" },
      error: null,
    },
    ticket_types: {
      data: [
        { id: "general", name: "General", max_capacity: 10 },
        { id: "vip", name: "VIP", max_capacity: null },
      ],
      error: null,
    },
    registrations: {
      data: [
        {
          id: "registration-valid",
          ticket_type_id: "general",
          buyer_name: "Ana",
          buyer_email: "ana@example.com",
          created_at: "2026-11-07T18:00:00Z",
        },
        {
          id: "registration-used",
          ticket_type_id: "vip",
          buyer_name: "Luis",
          buyer_email: "luis@example.com",
          created_at: "2026-11-07T17:00:00Z",
        },
        {
          id: "registration-revoked",
          ticket_type_id: "general",
          buyer_name: "Eva",
          buyer_email: "eva@example.com",
          created_at: "2026-11-07T16:00:00Z",
        },
      ],
      error: null,
    },
    tickets: {
      data: [
        { ticket_sale_id: "registration-valid", code: "code-1", status: "valid" },
        { ticket_sale_id: "registration-used", code: "code-2", status: "used" },
        {
          ticket_sale_id: "registration-revoked",
          code: "code-3",
          status: "revoked",
        },
      ],
      error: null,
    },
  });

  const result = await loadOrganizerAttendance(
    supabase.client,
    "owner-1",
    "event-1",
  );

  assert.equal(result.status, "success");
  assert.deepEqual(
    result.data.attendees.map((attendee) => attendee.ticketCode),
    ["code-1", "code-2"],
  );
  assert.deepEqual(
    result.data.ticketTypes.map(({ id, maxCapacity, soldCount }) => ({
      id,
      maxCapacity,
      soldCount,
    })),
    [
      { id: "general", maxCapacity: 10, soldCount: 1 },
      { id: "vip", maxCapacity: null, soldCount: 1 },
    ],
  );
});

test("returns an empty attendee list without querying tickets", async () => {
  const supabase = createSupabase({
    events: { data: { id: "event-1", title: "Festival" }, error: null },
    ticket_types: { data: [], error: null },
    registrations: { data: [], error: null },
  });

  const result = await loadOrganizerAttendance(
    supabase.client,
    "owner-1",
    "event-1",
  );

  assert.equal(result.status, "success");
  assert.deepEqual(result.data.attendees, []);
  assert.equal(supabase.calls.some(({ table }) => table === "tickets"), false);
});
