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

export type RegistrationErrorCode =
  | "invalidRequest"
  | "invalidName"
  | "invalidEmail"
  | "ticketTypeInvalid"
  | "eventUnavailable"
  | "ticketUnavailable"
  | "emailAlreadyRegistered"
  | "registrationFailed";

export type RegistrationRequest = {
  ticketTypeId: string;
  buyerName: string;
  buyerEmail: string;
};

export type RegistrationResponse = {
  ticketCode: string;
  emailDelivery: "sent" | "failed";
};

export type ApiErrorResponse = {
  error: RegistrationErrorCode;
};

export type DashboardEventSummary = Pick<
  Event,
  "id" | "title" | "venue" | "startsAt" | "status" | "maxCapacity"
> & {
  ticketTypeCount: number;
  registeredCount: number;
};

export type DashboardTicketType = TicketType & {
  registeredCount: number;
};

export type DashboardAttendee = {
  registrationId: string;
  name: string;
  email: string | null;
  quantity: number;
  ticketTypeName: string;
  registeredAt: string;
};

export type DashboardEventDetail = Pick<
  Event,
  | "id"
  | "title"
  | "description"
  | "venue"
  | "startsAt"
  | "status"
  | "maxCapacity"
> & {
  ticketTypes: DashboardTicketType[];
  attendees: DashboardAttendee[];
};

export type DailyRegistrationPoint = {
  date: string;
  count: number;
};

export type DailyRegistrationsResponse = {
  publishedAt: string | null;
  registrations: DailyRegistrationPoint[];
};
