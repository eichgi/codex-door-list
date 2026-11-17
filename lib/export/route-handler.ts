export type AttendeesDownloadResult =
  | { status: "success"; csv: string; filename: string }
  | { status: "invalid" | "unauthorized" | "forbidden" | "error" };

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

type LoadDownload = (eventId: string) => Promise<AttendeesDownloadResult>;

const errorResponses = {
  invalid: {
    status: 400,
    error: "El identificador del evento no es válido.",
  },
  unauthorized: {
    status: 401,
    error: "Debes iniciar sesión para descargar los asistentes.",
  },
  forbidden: {
    status: 403,
    error: "No tienes acceso a los asistentes de este evento.",
  },
  error: {
    status: 500,
    error: "No fue posible generar la lista de asistentes.",
  },
} as const;

export function createAttendeesDownloadHandler(loadDownload: LoadDownload) {
  return async function GET(_request: Request, { params }: RouteContext) {
    const { eventId } = await params;
    const result = await loadDownload(eventId);

    if (result.status !== "success") {
      const response = errorResponses[result.status];
      return Response.json({ error: response.error }, { status: response.status });
    }

    return new Response(result.csv, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Content-Type": "text/csv; charset=utf-8",
      },
    });
  };
}
