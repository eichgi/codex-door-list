import { sendTicketEmail } from "@/lib/email/send-ticket-email";
import { registrationErrorFromDatabase } from "@/lib/registrations/errors";
import { mapTicket } from "@/lib/supabase/mappers";
import { createClient } from "@/lib/supabase/server";
import type {
  ApiErrorResponse,
  RegistrationErrorCode,
  RegistrationRequest,
  RegistrationResponse,
} from "@/lib/types";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ticketCodePattern = /^[0-9a-f]{64}$/;

function errorResponse(error: RegistrationErrorCode, status: number) {
  return Response.json({ error } satisfies ApiErrorResponse, { status });
}

function parseRequest(value: unknown): RegistrationRequest | null {
  if (!value || typeof value !== "object") return null;

  const { ticketTypeId, buyerName, buyerEmail } = value as Record<string, unknown>;
  if (
    typeof ticketTypeId !== "string" ||
    typeof buyerName !== "string" ||
    typeof buyerEmail !== "string"
  ) {
    return null;
  }

  return {
    ticketTypeId: ticketTypeId.trim(),
    buyerName: buyerName.trim(),
    buyerEmail: buyerEmail.trim().toLowerCase(),
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("invalidRequest", 400);
  }

  const registration = parseRequest(body);
  if (!registration || !uuidPattern.test(eventId)) {
    return errorResponse("invalidRequest", 400);
  }
  if (!uuidPattern.test(registration.ticketTypeId)) {
    return errorResponse("ticketTypeInvalid", 400);
  }
  if (registration.buyerName.length < 2 || registration.buyerName.length > 120) {
    return errorResponse("invalidName", 400);
  }
  if (
    registration.buyerEmail.length > 254 ||
    !emailPattern.test(registration.buyerEmail)
  ) {
    return errorResponse("invalidEmail", 400);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("register_for_event", {
    p_event_id: eventId,
    p_ticket_type_id: registration.ticketTypeId,
    p_buyer_name: registration.buyerName,
    p_buyer_email: registration.buyerEmail,
  });

  if (error) {
    const businessError = registrationErrorFromDatabase(error.code);
    if (businessError) {
      return errorResponse(businessError.error, businessError.status);
    }

    console.error("No se pudo crear la inscripción pública:", error.message);
    return errorResponse("registrationFailed", 500);
  }

  const ticketCode = String(data);
  if (!ticketCodePattern.test(ticketCode)) {
    console.error("La inscripción se creó sin devolver un código de entrada válido.");
    return errorResponse("registrationFailed", 500);
  }

  let emailDelivery: RegistrationResponse["emailDelivery"] = "failed";
  const { data: ticketData, error: ticketError } = await supabase.rpc(
    "get_public_ticket",
    { p_code: ticketCode },
  );

  if (!ticketError && ticketData) {
    try {
      await sendTicketEmail(mapTicket(ticketData));
      emailDelivery = "sent";
    } catch (emailError) {
      console.error(
        "La entrada se creó, pero no se pudo enviar por correo:",
        emailError instanceof Error ? emailError.message : "Error desconocido",
      );
    }
  } else {
    console.error(
      "La entrada se creó, pero no fue posible recuperar sus datos para el correo:",
      ticketError?.message ?? "Respuesta vacía",
    );
  }

  return Response.json(
    { ticketCode, emailDelivery } satisfies RegistrationResponse,
    { status: 201 },
  );
}
