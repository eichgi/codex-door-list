import { logProviderError } from "@/lib/provider-errors";
import { createClient } from "@/lib/supabase/server";
import type {
  DailyRegistrationPoint,
  DailyRegistrationsResponse,
} from "@/lib/types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const timeZone = "America/Mexico_City";

type EventPublicationRow = {
  published_at: string | null;
};

type RegistrationDateRow = {
  created_at: string;
  quantity: number;
};

function errorResponse(error: string, status: number) {
  return Response.json({ error }, { status });
}

function dateKey(value: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).formatToParts(value);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function nextDateKey(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function buildDailyRegistrations(
  publishedAt: string,
  rows: RegistrationDateRow[],
): DailyRegistrationPoint[] {
  const firstDate = dateKey(new Date(publishedAt));
  const lastDate = dateKey(new Date());
  const totals = new Map<string, number>();

  for (const row of rows) {
    const key = dateKey(new Date(row.created_at));
    totals.set(key, (totals.get(key) ?? 0) + row.quantity);
  }

  const registrations: DailyRegistrationPoint[] = [];
  for (let date = firstDate; date <= lastDate; date = nextDateKey(date)) {
    registrations.push({ date, count: totals.get(date) ?? 0 });
  }

  return registrations;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  if (!uuidPattern.test(eventId)) {
    return errorResponse("El identificador del evento no es válido.", 400);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    logProviderError("No fue posible validar la sesión del organizador", authError);
  }
  if (!user) {
    return errorResponse("Debes iniciar sesión para consultar esta información.", 401);
  }

  const eventResult = await supabase
    .from("events")
    .select("published_at")
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (eventResult.error) {
    logProviderError("No fue posible cargar la fecha de publicación", eventResult.error);
    return errorResponse("No fue posible cargar los registros del evento.", 500);
  }
  if (!eventResult.data) {
    return errorResponse("El evento no existe o no tienes acceso.", 404);
  }

  const event = eventResult.data as EventPublicationRow;
  if (!event.published_at) {
    return Response.json({
      publishedAt: null,
      registrations: [],
    } satisfies DailyRegistrationsResponse);
  }

  const registrationsResult = await supabase
    .from("registrations")
    .select("created_at, quantity")
    .eq("event_id", eventId)
    .gte("created_at", event.published_at)
    .order("created_at", { ascending: true });

  if (registrationsResult.error) {
    logProviderError(
      "No fue posible cargar los registros diarios",
      registrationsResult.error,
    );
    return errorResponse("No fue posible cargar los registros del evento.", 500);
  }

  return Response.json({
    publishedAt: event.published_at,
    registrations: buildDailyRegistrations(
      event.published_at,
      (registrationsResult.data ?? []) as RegistrationDateRow[],
    ),
  } satisfies DailyRegistrationsResponse);
}
