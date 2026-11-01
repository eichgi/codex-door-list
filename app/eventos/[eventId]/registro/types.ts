export type RegistrationState = {
  status: "idle" | "error" | "success";
  message: string;
  unavailableTicketTypeId?: string;
  ticketCode?: string;
  emailDelivery?: "sent" | "failed";
};

export type PublicTicketType = {
  id: string;
  name: string;
  remaining: number;
};

export type PublicEvent = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  venue: string;
  ticket_types: PublicTicketType[];
};
