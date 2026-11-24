import { formatEventDate } from "@/lib/dates";
import {
  findDoorTicketsByEmail,
  isLookupEmail,
  normalizeLookupEmail,
} from "@/lib/scan/data";
import type { TicketStatus } from "@/lib/types";
import { checkInTicket } from "./actions";

const statusCopy: Record<TicketStatus, { label: string; className: string }> = {
  valid: {
    label: "Lista para ingresar",
    className: "border-emerald-400/30 bg-emerald-950/60 text-emerald-100",
  },
  used: {
    label: "Entrada ya utilizada",
    className: "border-amber-400/30 bg-amber-950/60 text-amber-100",
  },
  revoked: {
    label: "Entrada revocada",
    className: "border-red-400/30 bg-red-950/60 text-red-100",
  },
};

const outcomeCopy = {
  "checked-in": {
    message: "Entrada registrada. La persona puede ingresar.",
    className: "border-emerald-400/30 bg-emerald-950/60 text-emerald-100",
  },
  "already-used": {
    message: "Esta entrada ya había sido utilizada. Verifica la identidad antes de permitir el acceso.",
    className: "border-amber-400/30 bg-amber-950/60 text-amber-100",
  },
  revoked: {
    message: "Esta entrada está revocada y no permite el acceso.",
    className: "border-red-400/30 bg-red-950/60 text-red-100",
  },
  "not-found": {
    message: "No encontramos una entrada que puedas registrar.",
    className: "border-red-400/30 bg-red-950/60 text-red-100",
  },
  error: {
    message: "No pudimos registrar la entrada. Intenta nuevamente.",
    className: "border-red-400/30 bg-red-950/60 text-red-100",
  },
} as const;

type Outcome = keyof typeof outcomeCopy;

export default async function ScanPage({ searchParams }: PageProps<"/scan">) {
  const params = await searchParams;
  const email = normalizeLookupEmail(typeof params.email === "string" ? params.email : "");
  const hasSearch = email.length > 0;
  const validEmail = isLookupEmail(email);
  const tickets = validEmail ? await findDoorTicketsByEmail(email) : [];
  const outcome = typeof params.outcome === "string" && params.outcome in outcomeCopy
    ? outcomeCopy[params.outcome as Outcome]
    : null;

  return (
    <section className="py-9">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Control de acceso</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Si el código QR no se puede leer, busca el correo exacto del asistente y registra su entrada manualmente.
        </p>
      </div>

      <form method="get" className="mt-8 rounded-2xl border border-white/10 bg-slate-900/85 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <label className="grid gap-2 text-sm font-bold text-slate-200" htmlFor="attendee-email">
            Correo del asistente
            <input
              id="attendee-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={email}
              placeholder="asistente@correo.com"
              className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/30"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-sky-300 px-5 py-2.5 font-bold text-slate-950 transition hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Buscar entrada
          </button>
        </div>
      </form>

      {outcome && (
        <p className={`mt-6 rounded-2xl border p-4 text-sm font-bold ${outcome.className}`} role="status">
          {outcome.message}
        </p>
      )}

      {hasSearch && !validEmail && (
        <p className="mt-6 rounded-2xl border border-red-400/30 bg-red-950/60 p-4 text-sm text-red-100" role="alert">
          Escribe un correo completo, por ejemplo asistente@correo.com.
        </p>
      )}

      {validEmail && tickets.length === 0 && (
        <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/5 p-8 text-center sm:p-10">
          <h2 className="text-xl font-bold tracking-tight">No encontramos una entrada para ese correo</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
            Confirma cómo se escribió el correo durante el registro o solicita el código de respaldo de la entrada.
          </p>
        </div>
      )}

      {tickets.length > 0 && (
        <section className="mt-8" aria-labelledby="search-results-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="search-results-title" className="text-2xl font-bold">Entradas encontradas</h2>
              <p className="mt-2 text-sm text-slate-400">Verifica el nombre y el evento antes de registrar el acceso.</p>
            </div>
            <p className="text-sm font-bold text-slate-300">
              {tickets.length} {tickets.length === 1 ? "resultado" : "resultados"}
            </p>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {tickets.map((ticket) => {
              const status = statusCopy[ticket.status];
              return (
                <article key={ticket.code} className="rounded-2xl border border-white/10 bg-slate-900/85 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">{ticket.attendeeName}</h3>
                      <p className="mt-1 text-sm text-slate-400">{ticket.attendeeEmail}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>

                  <dl className="mt-5 grid gap-4 border-t border-white/10 pt-5">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Evento</dt>
                      <dd className="mt-1 font-bold text-slate-100">{ticket.eventTitle}</dd>
                      <dd className="mt-1 text-sm capitalize text-slate-400">{formatEventDate(ticket.eventStartsAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Tipo de entrada</dt>
                      <dd className="mt-1 text-slate-200">{ticket.ticketType}</dd>
                    </div>
                  </dl>

                  {ticket.status === "valid" && (
                    <form action={checkInTicket} className="mt-6">
                      <input type="hidden" name="ticketCode" value={ticket.code} />
                      <input type="hidden" name="email" value={email} />
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-sky-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                      >
                        Registrar entrada
                      </button>
                    </form>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}
    </section>
  );
}
