import type {
  CatalogEvent,
  Event,
  EventStatus,
  PublicEvent,
  Ticket,
  TicketStatus,
} from "@/lib/types";

type CatalogEventRow = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  venue: string;
  status: "published";
};

type OrganizerEventRow = {
  id: string;
  title: string;
  venue: string;
  starts_at: string;
  description: string | null;
  status: EventStatus;
  max_capacity: number;
  ticket_types: Array<{
    id: string;
    name: string;
    max_capacity: number;
  }>;
  registrations: Array<{
    id: string;
    ticket_type_id: string;
    buyer_name: string;
    buyer_email: string | null;
    quantity: number;
  }>;
};

type PublicEventRow = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  venue: string;
  ticket_types: Array<{
    id: string;
    name: string;
    remaining: number;
  }>;
};

type TicketRow = {
  code: string;
  status: TicketStatus;
  attendee_name: string;
  attendee_email: string;
  ticket_type: string;
  event_title: string;
  event_venue: string;
  event_starts_at: string;
};

export function mapCatalogEvents(data: unknown): CatalogEvent[] {
  return ((data ?? []) as CatalogEventRow[]).map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    startsAt: event.starts_at,
    venue: event.venue,
    status: event.status,
  }));
}

export function mapOrganizerEvents(data: unknown): Event[] {
  return ((data ?? []) as OrganizerEventRow[]).map((event) => ({
    id: event.id,
    title: event.title,
    venue: event.venue,
    startsAt: event.starts_at,
    description: event.description,
    status: event.status,
    maxCapacity: event.max_capacity,
    ticketTypes: event.ticket_types.map((ticketType) => ({
      id: ticketType.id,
      name: ticketType.name,
      maxCapacity: ticketType.max_capacity,
    })),
    registrations: event.registrations.map((registration) => ({
      id: registration.id,
      ticketTypeId: registration.ticket_type_id,
      buyerName: registration.buyer_name,
      buyerEmail: registration.buyer_email,
      quantity: registration.quantity,
    })),
  }));
}

export function mapPublicEvent(data: unknown): PublicEvent {
  const event = data as PublicEventRow;

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startsAt: event.starts_at,
    venue: event.venue,
    ticketTypes: event.ticket_types.map((ticketType) => ({
      id: ticketType.id,
      name: ticketType.name,
      remaining: ticketType.remaining,
    })),
  };
}

export function mapTicket(data: unknown): Ticket {
  const ticket = data as TicketRow;

  return {
    code: ticket.code,
    status: ticket.status,
    attendeeName: ticket.attendee_name,
    attendeeEmail: ticket.attendee_email,
    ticketType: ticket.ticket_type,
    eventTitle: ticket.event_title,
    eventVenue: ticket.event_venue,
    eventStartsAt: ticket.event_starts_at,
  };
}
