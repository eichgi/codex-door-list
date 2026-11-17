import { formatRegistrationDate } from "@/lib/dates";
import { loadOrganizerAttendance } from "@/lib/export/attendees";
import { createAttendeesCsvFilename, createCsv } from "@/lib/export/csv";
import {
  createAttendeesDownloadHandler,
  type AttendeesDownloadResult,
} from "@/lib/export/route-handler";
import { logProviderError } from "@/lib/provider-errors";
import { createClient } from "@/lib/supabase/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ticketStatusLabels = {
  valid: "Válido",
  used: "Utilizado",
} as const;

const csvHeaders = [
  "nombre",
  "email",
  "tipo de entrada",
  "código de ticket",
  "fecha de compra",
  "estado del ticket",
] as const;

async function loadDownload(eventId: string): Promise<AttendeesDownloadResult> {
  if (!uuidPattern.test(eventId)) return { status: "invalid" };

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    logProviderError("No fue posible validar la sesión del organizador", authError);
  }
  if (!user) return { status: "unauthorized" };

  const result = await loadOrganizerAttendance(supabase, user.id, eventId);
  if (result.status === "forbidden") return result;
  if (result.status === "error") {
    logProviderError(
      "No fue posible cargar los asistentes para la exportación",
      result.error,
    );
    return { status: "error" };
  }

  return {
    status: "success",
    csv: createCsv(
      csvHeaders,
      result.data.attendees.map((attendee) => [
        attendee.name,
        attendee.email,
        attendee.ticketTypeName,
        attendee.ticketCode,
        formatRegistrationDate(attendee.purchasedAt),
        ticketStatusLabels[attendee.ticketStatus],
      ]),
    ),
    filename: createAttendeesCsvFilename(result.data.eventTitle),
  };
}

export const GET = createAttendeesDownloadHandler(loadDownload);
