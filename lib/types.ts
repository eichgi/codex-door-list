export type EventStatus = "draft" | "published" | "deleted";
export type TicketStatus = "valid" | "used" | "revoked";

export type TicketType = {
  id: string;
  name: string;
  maxCapacity: number;
};

export type Registration = {
  id: string;
  ticketTypeId: string;
  buyerName: string;
  buyerEmail: string | null;
  quantity: number;
};

export type Event = {
  id: string;
  title: string;
  venue: string;
  startsAt: string;
  description: string | null;
  status: EventStatus;
  maxCapacity: number;
  ticketTypes: TicketType[];
  registrations: Registration[];
};

export type CatalogEvent = Pick<
  Event,
  "id" | "title" | "description" | "startsAt" | "venue"
> & {
  status: "published";
};

export type PublicTicketType = {
  id: string;
  name: string;
  remaining: number;
};

export type PublicEvent = Pick<
  Event,
  "id" | "title" | "description" | "startsAt" | "venue"
> & {
  ticketTypes: PublicTicketType[];
};

export type Ticket = {
  code: string;
  status: TicketStatus;
  attendeeName: string;
  attendeeEmail: string;
  ticketType: string;
  eventTitle: string;
  eventVenue: string;
  eventStartsAt: string;
};

export type RegistrationState = {
  status: "idle" | "error" | "success";
  message: string;
  unavailableTicketTypeId?: string;
  ticketCode?: string;
  emailDelivery?: "sent" | "failed";
};
