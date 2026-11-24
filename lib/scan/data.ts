import "server-only";

import { redirect } from "next/navigation";
import { logProviderError } from "@/lib/provider-errors";
import { createClient } from "@/lib/supabase/server";
import type { Ticket, TicketStatus } from "@/lib/types";

type DoorTicket = Pick<
  Ticket,
  "code" | "status" | "attendeeName" | "attendeeEmail" | "ticketType"
> & {
  eventTitle: string;
  eventStartsAt: string;
};

type EventRow = {
  id: string;
  title: string;
  starts_at: string;
};

type RegistrationRow = {
  id: string;
  event_id: string;
  ticket_type_id: string;
  buyer_name: string;
  buyer_email: string;
};

type TicketTypeRow = {
  id: string;
  name: string;
};

type TicketRow = {
  ticket_sale_id: string;
  code: string;
  status: TicketStatus;
};

export function normalizeLookupEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isLookupEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function findDoorTicketsByEmail(email: string): Promise<DoorTicket[]> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    logProviderError("No fue posible validar la sesión del personal de acceso", authError);
  }
  if (!user) redirect("/acceso?next=%2Fscan");

  const eventsResult = await supabase
    .from("events")
    .select("id, title, starts_at")
    .eq("owner_id", user.id);

  if (eventsResult.error) {
    logProviderError("No fue posible consultar los eventos para el acceso", eventsResult.error);
    throw new Error("No fue posible consultar las entradas.");
  }

  const events = (eventsResult.data ?? []) as EventRow[];
  if (events.length === 0) return [];

  const registrationsResult = await supabase
    .from("registrations")
    .select("id, event_id, ticket_type_id, buyer_name, buyer_email")
    .in("event_id", events.map((event) => event.id))
    .eq("buyer_email", email);

  if (registrationsResult.error) {
    logProviderError("No fue posible buscar al asistente", registrationsResult.error);
    throw new Error("No fue posible consultar las entradas.");
  }

  const registrations = (registrationsResult.data ?? []) as RegistrationRow[];
  if (registrations.length === 0) return [];

  const [ticketTypesResult, ticketsResult] = await Promise.all([
    supabase
      .from("ticket_types")
      .select("id, name")
      .in("id", registrations.map((registration) => registration.ticket_type_id)),
    supabase
      .from("tickets")
      .select("ticket_sale_id, code, status")
      .in("ticket_sale_id", registrations.map((registration) => registration.id)),
  ]);

  const providerError = ticketTypesResult.error ?? ticketsResult.error;
  if (providerError) {
    logProviderError("No fue posible cargar la entrada del asistente", providerError);
    throw new Error("No fue posible consultar las entradas.");
  }

  const eventsById = new Map(events.map((event) => [event.id, event]));
  const ticketTypesById = new Map(
    ((ticketTypesResult.data ?? []) as TicketTypeRow[]).map((ticketType) => [
      ticketType.id,
      ticketType.name,
    ]),
  );
  const registrationsById = new Map(
    registrations.map((registration) => [registration.id, registration]),
  );

  return ((ticketsResult.data ?? []) as TicketRow[])
    .flatMap((ticket): DoorTicket[] => {
      const registration = registrationsById.get(ticket.ticket_sale_id);
      const event = registration ? eventsById.get(registration.event_id) : undefined;
      if (!registration || !event) return [];

      return [{
        code: ticket.code,
        status: ticket.status,
        attendeeName: registration.buyer_name,
        attendeeEmail: registration.buyer_email,
        ticketType: ticketTypesById.get(registration.ticket_type_id) ?? "Tipo de entrada no disponible",
        eventTitle: event.title,
        eventStartsAt: event.starts_at,
      }];
    })
    .sort((left, right) => left.eventStartsAt.localeCompare(right.eventStartsAt));
}
