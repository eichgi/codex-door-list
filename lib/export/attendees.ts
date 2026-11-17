import type { SupabaseClient } from "@supabase/supabase-js";
import type { TicketStatus } from "@/lib/types";

const activeTicketStatuses = new Set<TicketStatus>(["valid", "used"]);

type EventRow = {
  id: string;
  title: string;
};

type TicketTypeRow = {
  id: string;
  name: string;
  max_capacity: number | null;
};

type RegistrationRow = {
  id: string;
  ticket_type_id: string;
  buyer_name: string;
  buyer_email: string | null;
  created_at: string;
};

type TicketRow = {
  ticket_sale_id: string;
  code: string;
  status: TicketStatus;
};

export type OrganizerAttendee = {
  registrationId: string;
  name: string;
  email: string | null;
  ticketTypeId: string;
  ticketTypeName: string;
  ticketCode: string;
  purchasedAt: string;
  ticketStatus: Extract<TicketStatus, "valid" | "used">;
};

export type OrganizerAttendance = {
  eventTitle: string;
  ticketTypes: Array<{
    id: string;
    name: string;
    maxCapacity: number | null;
    soldCount: number;
  }>;
  attendees: OrganizerAttendee[];
};

export type OrganizerAttendanceResult =
  | { status: "success"; data: OrganizerAttendance }
  | { status: "forbidden" }
  | { status: "error"; error: { message: string } };

export async function loadOrganizerAttendance(
  supabase: SupabaseClient,
  ownerId: string,
  eventId: string,
): Promise<OrganizerAttendanceResult> {
  const eventResult = await supabase
    .from("events")
    .select("id, title")
    .eq("id", eventId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (eventResult.error) return { status: "error", error: eventResult.error };
  if (!eventResult.data) return { status: "forbidden" };

  const [ticketTypesResult, registrationsResult] = await Promise.all([
    supabase
      .from("ticket_types")
      .select("id, name, max_capacity")
      .eq("event_id", eventId)
      .order("name", { ascending: true }),
    supabase
      .from("registrations")
      .select("id, ticket_type_id, buyer_name, buyer_email, created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false }),
  ]);
  const providerError = ticketTypesResult.error ?? registrationsResult.error;
  if (providerError) return { status: "error", error: providerError };

  const event = eventResult.data as EventRow;
  const ticketTypeRows = (ticketTypesResult.data ?? []) as TicketTypeRow[];
  const registrationRows = (registrationsResult.data ?? []) as RegistrationRow[];
  let ticketRows: TicketRow[] = [];

  if (registrationRows.length > 0) {
    const ticketsResult = await supabase
      .from("tickets")
      .select("ticket_sale_id, code, status")
      .in(
        "ticket_sale_id",
        registrationRows.map((registration) => registration.id),
      );

    if (ticketsResult.error) {
      return { status: "error", error: ticketsResult.error };
    }
    ticketRows = (ticketsResult.data ?? []) as TicketRow[];
  }

  const ticketTypeNames = new Map(
    ticketTypeRows.map((ticketType) => [ticketType.id, ticketType.name]),
  );
  const registrations = new Map(
    registrationRows.map((registration) => [registration.id, registration]),
  );
  const soldByTicketType = new Map<string, number>();
  const attendees: OrganizerAttendee[] = [];

  for (const ticket of ticketRows) {
    if (!activeTicketStatuses.has(ticket.status)) continue;

    const registration = registrations.get(ticket.ticket_sale_id);
    if (!registration) continue;

    soldByTicketType.set(
      registration.ticket_type_id,
      (soldByTicketType.get(registration.ticket_type_id) ?? 0) + 1,
    );
    attendees.push({
      registrationId: registration.id,
      name: registration.buyer_name,
      email: registration.buyer_email,
      ticketTypeId: registration.ticket_type_id,
      ticketTypeName:
        ticketTypeNames.get(registration.ticket_type_id) ??
        "Tipo de entrada no disponible",
      ticketCode: ticket.code,
      purchasedAt: registration.created_at,
      ticketStatus: ticket.status as OrganizerAttendee["ticketStatus"],
    });
  }

  attendees.sort((left, right) => right.purchasedAt.localeCompare(left.purchasedAt));

  return {
    status: "success",
    data: {
      eventTitle: event.title,
      ticketTypes: ticketTypeRows.map((ticketType) => ({
        id: ticketType.id,
        name: ticketType.name,
        maxCapacity: ticketType.max_capacity,
        soldCount: soldByTicketType.get(ticketType.id) ?? 0,
      })),
      attendees,
    },
  };
}
