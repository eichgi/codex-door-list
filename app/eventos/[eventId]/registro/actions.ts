"use server";

import { createClient } from "@/lib/supabase/server";
import { sendTicketEmail, type TicketEmailData } from "@/lib/email/send-ticket-email";
import type { RegistrationState } from "./types";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ticketCodePattern = /^[0-9a-f]{64}$/;

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export async function registerForEvent(
  eventId: string,
  _previousState: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  const ticketTypeId = value(formData, "ticket_type_id");
  const buyerName = value(formData, "buyer_name");
  const buyerEmail = value(formData, "buyer_email").toLowerCase();

  if (!uuidPattern.test(eventId) || !uuidPattern.test(ticketTypeId)) {
    return { status: "error", message: "Selecciona un tipo de entrada válido." };
  }
  if (buyerName.length < 2 || buyerName.length > 120) {
    return { status: "error", message: "Ingresa un nombre de entre 2 y 120 caracteres." };
  }
  if (buyerEmail.length > 254 || !emailPattern.test(buyerEmail)) {
    return { status: "error", message: "Ingresa un correo electrónico válido." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("register_for_event", {
    p_event_id: eventId,
    p_ticket_type_id: ticketTypeId,
    p_buyer_name: buyerName,
    p_buyer_email: buyerEmail,
  });

  if (!error && ticketCodePattern.test(String(data))) {
    const ticketCode = String(data);
    const { data: ticketData, error: ticketError } = await supabase.rpc("get_public_ticket", {
      p_code: ticketCode,
    });

    if (!ticketError && ticketData) {
      try {
        await sendTicketEmail(ticketData as TicketEmailData);
        return {
          status: "success",
          message: "Tu registro y tu entrada quedaron confirmados. Te enviamos la entrada por correo.",
          ticketCode,
          emailDelivery: "sent",
        };
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

    return {
      status: "success",
      message: "Tu registro y tu entrada quedaron confirmados, pero no pudimos enviar el correo. Abre y guarda tu entrada desde este enlace.",
      ticketCode,
      emailDelivery: "failed",
    };
  }

  if (!error) {
    console.error("El registro se creó sin devolver un código de entrada válido.");
    return {
      status: "error",
      message: "Tu registro no pudo emitir una entrada. Contacta al organizador antes de intentarlo nuevamente.",
    };
  }

  if (error.message.includes("EVENT_UNAVAILABLE")) {
    return {
      status: "error",
      message: "Este evento ya no está disponible para registro.",
    };
  }
  if (error.message.includes("TICKET_UNAVAILABLE")) {
    return {
      status: "error",
      message: "La entrada seleccionada acaba de agotarse. Elige otra opción disponible.",
      unavailableTicketTypeId: ticketTypeId,
    };
  }
  if (error.message.includes("TICKET_TYPE_INVALID")) {
    return {
      status: "error",
      message: "El tipo de entrada seleccionado ya no está disponible. Elige otra opción.",
      unavailableTicketTypeId: ticketTypeId,
    };
  }
  if (error.message.includes("EMAIL_ALREADY_REGISTERED")) {
    return {
      status: "error",
      message: "Este correo ya está registrado para el evento. Solo se permite un registro por persona.",
    };
  }
  if (error.message.includes("INVALID_NAME") || error.message.includes("INVALID_EMAIL")) {
    return { status: "error", message: "Revisa tu nombre y correo electrónico." };
  }

  console.error("No se pudo crear el registro público:", error.message);
  return {
    status: "error",
    message: "No pudimos completar tu registro. Intenta de nuevo en unos momentos.",
  };
}
