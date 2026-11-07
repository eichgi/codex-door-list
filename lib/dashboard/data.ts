import "server-only";

import { notFound, redirect } from "next/navigation";
import { logProviderError } from "@/lib/provider-errors";
import { createClient } from "@/lib/supabase/server";
import type {
  DashboardAttendee,
  DashboardEventDetail,
  DashboardEventSummary,
  DashboardTicketType,
  EventStatus,
} from "@/lib/types";

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  venue: string;
  starts_at: string;
  status: EventStatus;
  max_capacity: number;
};

type TicketTypeRow = {
  id: string;
  event_id: string;
  name: string;
  max_capacity: number;
};

type RegistrationRow = {
  id: string;
  event_id: string;
  ticket_type_id: string;
  buyer_name: string;
  buyer_email: string | null;
  quantity: number;
  created_at: string;
};

async function organizerClient(nextPath: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    logProviderError("No fue posible validar la sesión del organizador", error);
  }

  if (!user) {
    redirect(`/acceso?next=${encodeURIComponent(nextPath)}`);
  }

  return { supabase, user };
}

function failToLoad(error: { message: string }) {
  logProviderError("No fue posible cargar el panel del organizador", error);
  throw new Error("No fue posible cargar la información del panel.");
}

export async function getOrganizerEvents(): Promise<DashboardEventSummary[]> {
  const { supabase, user } = await organizerClient("/dashboard");
  const eventsResult = await supabase
    .from("events")
    .select("id, title, description, venue, starts_at, status, max_capacity")
    .eq("owner_id", user.id)
    .order("starts_at", { ascending: true });
  if (eventsResult.error) failToLoad(eventsResult.error);
  const events = (eventsResult.data ?? []) as EventRow[];
  if (events.length === 0) return [];

  const eventIds = events.map((event) => event.id);
  const [ticketTypesResult, registrationsResult] = await Promise.all([
    supabase
      .from("ticket_types")
      .select("id, event_id, name, max_capacity")
      .in("event_id", eventIds),
    supabase
      .from("registrations")
      .select(
        "id, event_id, ticket_type_id, buyer_name, buyer_email, quantity, created_at",
      )
      .in("event_id", eventIds),
  ]);
  const providerError = ticketTypesResult.error ?? registrationsResult.error;
  if (providerError) failToLoad(providerError);

  const ticketTypes = (ticketTypesResult.data ?? []) as TicketTypeRow[];
  const registrations = (registrationsResult.data ?? []) as RegistrationRow[];

  return events.map((event) => ({
    id: event.id,
    title: event.title,
    venue: event.venue,
    startsAt: event.starts_at,
    status: event.status,
    maxCapacity: event.max_capacity,
    ticketTypeCount: ticketTypes.filter(
      (ticketType) => ticketType.event_id === event.id,
    ).length,
    registeredCount: registrations
      .filter((registration) => registration.event_id === event.id)
      .reduce((total, registration) => total + registration.quantity, 0),
  }));
}

export async function getOrganizerEvent(
  eventId: string,
): Promise<DashboardEventDetail> {
  const nextPath = `/dashboard/${eventId}`;
  const { supabase, user } = await organizerClient(nextPath);
  const eventResult = await supabase
    .from("events")
    .select("id, title, description, venue, starts_at, status, max_capacity")
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (eventResult.error) failToLoad(eventResult.error);
  if (!eventResult.data) notFound();

  const [ticketTypesResult, registrationsResult] = await Promise.all([
    supabase
      .from("ticket_types")
      .select("id, event_id, name, max_capacity")
      .eq("event_id", eventId)
      .order("name", { ascending: true }),
    supabase
      .from("registrations")
      .select(
        "id, event_id, ticket_type_id, buyer_name, buyer_email, quantity, created_at",
      )
      .eq("event_id", eventId)
      .order("created_at", { ascending: false }),
  ]);

  const providerError = ticketTypesResult.error ?? registrationsResult.error;
  if (providerError) failToLoad(providerError);

  const event = eventResult.data as EventRow;
  const ticketTypeRows = (ticketTypesResult.data ?? []) as TicketTypeRow[];
  const registrationRows = (registrationsResult.data ?? []) as RegistrationRow[];
  const ticketTypeNames = new Map(
    ticketTypeRows.map((ticketType) => [ticketType.id, ticketType.name]),
  );

  const ticketTypes: DashboardTicketType[] = ticketTypeRows.map(
    (ticketType) => ({
      id: ticketType.id,
      name: ticketType.name,
      maxCapacity: ticketType.max_capacity,
      registeredCount: registrationRows
        .filter(
          (registration) => registration.ticket_type_id === ticketType.id,
        )
        .reduce((total, registration) => total + registration.quantity, 0),
    }),
  );

  const attendees: DashboardAttendee[] = registrationRows.map(
    (registration) => ({
      registrationId: registration.id,
      name: registration.buyer_name,
      email: registration.buyer_email,
      quantity: registration.quantity,
      ticketTypeName:
        ticketTypeNames.get(registration.ticket_type_id) ??
        "Tipo de entrada no disponible",
      registeredAt: registration.created_at,
    }),
  );

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    venue: event.venue,
    startsAt: event.starts_at,
    status: event.status,
    maxCapacity: event.max_capacity,
    ticketTypes,
    attendees,
  };
}
