import Link from "next/link";
import { formatEventDate, formatRegistrationDate } from "@/lib/dates";
import { getOrganizerEvent } from "@/lib/dashboard/data";
import { RegistrationChart } from "./registration-chart";

export default async function DashboardEventPage({
  params,
}: PageProps<"/dashboard/[eventId]">) {
  const { eventId } = await params;
  const event = await getOrganizerEvent(eventId);
  const registeredCount = event.ticketTypes.reduce(
    (total, ticketType) => total + ticketType.registeredCount,
    0,
  );

  return (
    <section className="py-9">
      <Link
        href="/dashboard"
        className="text-sm font-bold text-sky-300 transition hover:text-sky-200"
      >
        ← Todos los eventos
      </Link>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
            Detalle del evento
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            {event.title}
          </h1>
          <p className="mt-4 text-lg capitalize text-slate-300">
            {formatEventDate(event.startsAt)}
          </p>
          <p className="mt-1 text-slate-500">{event.venue}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
          <p className="text-3xl font-bold">
            {registeredCount}
            <span className="text-base font-medium text-slate-500">
              {" "}/ {event.maxCapacity}
            </span>
          </p>
          <p className="mt-1 text-sm text-slate-400">entradas registradas</p>
        </div>
      </div>

      <section className="mt-12" aria-labelledby="ticket-types-title">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
            Aforo
          </p>
          <h2 id="ticket-types-title" className="mt-2 text-2xl font-bold">
            Tipos de entrada
          </h2>
        </div>

        {event.ticketTypes.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-slate-400">
            Este evento todavía no tiene tipos de entrada configurados.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {event.ticketTypes.map((ticketType) => {
              const occupancy = Math.min(
                100,
                Math.round(
                  (ticketType.registeredCount / ticketType.maxCapacity) * 100,
                ),
              );

              return (
                <article
                  key={ticketType.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/85 p-5"
                >
                  <h3 className="font-bold text-slate-100">{ticketType.name}</h3>
                  <p className="mt-4 text-3xl font-bold">
                    {ticketType.registeredCount}
                    <span className="text-base font-medium text-slate-500">
                      {" "}/ {ticketType.maxCapacity}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-400">registros sobre aforo</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-sky-300"
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-12" aria-labelledby="registrations-chart-title">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
            Actividad
          </p>
          <h2 id="registrations-chart-title" className="mt-2 text-2xl font-bold">
            Registros por día
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Evolución diaria desde que se publicó el evento.
          </p>
        </div>
        <div className="mt-6">
          <RegistrationChart eventId={event.id} />
        </div>
      </section>

      <section className="mt-12" aria-labelledby="attendees-title">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
              Inscripciones
            </p>
            <h2 id="attendees-title" className="mt-2 text-2xl font-bold">
              Asistentes registrados
            </h2>
          </div>
          {event.attendees.length > 0 && (
            <p className="text-sm text-slate-400">
              {event.attendees.length}{" "}
              {event.attendees.length === 1 ? "inscripción" : "inscripciones"}
            </p>
          )}
        </div>

        {event.attendees.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-slate-400">
            Aún no hay asistentes registrados para este evento.
          </p>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/85">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-[0.14em] text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-bold">Asistente</th>
                    <th className="px-5 py-4 font-bold">Tipo de entrada</th>
                    <th className="px-5 py-4 text-center font-bold">Cantidad</th>
                    <th className="px-5 py-4 font-bold">Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {event.attendees.map((attendee) => (
                    <tr key={attendee.registrationId}>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-100">{attendee.name}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {attendee.email ?? "Sin correo"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {attendee.ticketTypeName}
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-slate-200">
                        {attendee.quantity}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-400">
                        {formatRegistrationDate(attendee.registeredAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </section>
  );
}
