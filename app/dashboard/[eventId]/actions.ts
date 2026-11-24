"use server";

import { randomUUID } from "node:crypto";
import { sendTicketEmail } from "@/lib/email/send-ticket-email";
import { logProviderError } from "@/lib/provider-errors";
import { createClient } from "@/lib/supabase/server";
import type { ResendTicketState, Ticket, TicketStatus } from "@/lib/types";

const ticketCodePattern = /^[0-9a-f]{64}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function error(message: string): ResendTicketState {
  return { status: "error", message };
}

export async function resendTicket(
  _previousState: ResendTicketState,
  formData: FormData,
): Promise<ResendTicketState> {
  const eventId = formValue(formData, "eventId");
  const ticketCode = formValue(formData, "ticketCode");

  if (!uuidPattern.test(eventId) || !ticketCodePattern.test(ticketCode)) {
    return error("No fue posible identificar esta entrada. Actualiza la página e inténtalo de nuevo.");
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError) {
    logProviderError("No fue posible validar la sesión para reenviar la entrada", authError);
  }
  if (!authData.user) {
    return error("Tu sesión terminó. Inicia sesión nuevamente para reenviar la entrada.");
  }

  const ticketResult = await supabase
    .from("tickets")
    .select("ticket_sale_id, code, status")
    .eq("code", ticketCode)
    .maybeSingle();

  if (ticketResult.error) {
    logProviderError("No fue posible recuperar la entrada para reenviarla", ticketResult.error);
    return error("No pudimos preparar la entrada. Inténtalo de nuevo.");
  }
  if (!ticketResult.data) {
    return error("Esta entrada no está disponible o no pertenece a tu evento.");
  }

  const ticketRow = ticketResult.data as {
    ticket_sale_id: string;
    code: string;
    status: TicketStatus;
  };
  if (ticketRow.status === "revoked") {
    return error("La entrada está revocada y no puede reenviarse.");
  }

  const registrationResult = await supabase
    .from("registrations")
    .select("event_id, ticket_type_id, buyer_name, buyer_email")
    .eq("id", ticketRow.ticket_sale_id)
    .eq("event_id", eventId)
    .maybeSingle();

  if (registrationResult.error) {
    logProviderError("No fue posible recuperar la inscripción para reenviar la entrada", registrationResult.error);
    return error("No pudimos preparar la entrada. Inténtalo de nuevo.");
  }
  if (!registrationResult.data) {
    return error("Esta entrada no está disponible o no pertenece a tu evento.");
  }

  const registration = registrationResult.data as {
    event_id: string;
    ticket_type_id: string;
    buyer_name: string;
    buyer_email: string | null;
  };
  if (!registration.buyer_email) {
    return error("Este asistente no tiene un email registrado.");
  }

  const [eventResult, ticketTypeResult] = await Promise.all([
    supabase
      .from("events")
      .select("title, venue, starts_at")
      .eq("id", registration.event_id)
      .eq("owner_id", authData.user.id)
      .maybeSingle(),
    supabase
      .from("ticket_types")
      .select("name")
      .eq("id", registration.ticket_type_id)
      .eq("event_id", registration.event_id)
      .maybeSingle(),
  ]);

  const providerError = eventResult.error ?? ticketTypeResult.error;
  if (providerError) {
    logProviderError("No fue posible completar los datos de la entrada", providerError);
    return error("No pudimos preparar la entrada. Inténtalo de nuevo.");
  }
  if (!eventResult.data || !ticketTypeResult.data) {
    return error("Esta entrada no está disponible o no pertenece a tu evento.");
  }

  const event = eventResult.data as {
    title: string;
    venue: string;
    starts_at: string;
  };
  const ticketType = ticketTypeResult.data as { name: string };
  const ticket: Ticket = {
    code: ticketRow.code,
    status: ticketRow.status,
    attendeeName: registration.buyer_name,
    attendeeEmail: registration.buyer_email,
    ticketType: ticketType.name,
    eventTitle: event.title,
    eventVenue: event.venue,
    eventStartsAt: event.starts_at,
  };

  try {
    await sendTicketEmail(ticket, {
      idempotencyKey: `ticket-resend-${ticket.code}-${randomUUID()}`,
    });
  } catch (providerError) {
    logProviderError(
      "No fue posible reenviar la entrada por correo",
      providerError instanceof Error
        ? providerError
        : { message: "Error desconocido" },
    );
    return error("No pudimos enviar el correo. Inténtalo de nuevo en unos minutos.");
  }

  return {
    status: "success",
    message: `Entrada reenviada a ${registration.buyer_email}.`,
  };
}
