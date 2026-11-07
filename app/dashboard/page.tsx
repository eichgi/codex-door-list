import Link from "next/link";
import { formatEventDate } from "@/lib/dates";
import { getOrganizerEvents } from "@/lib/dashboard/data";

const statusLabels = {
  draft: "Borrador",
  published: "Publicado",
  deleted: "Eliminado",
} as const;

export default async function DashboardPage() {
  const events = await getOrganizerEvents();

  return (
    <section className="py-10" aria-labelledby="dashboard-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 id="dashboard-title" className="text-4xl font-bold tracking-tight sm:text-5xl">
            Tus eventos
          </h1>
          <p className="mt-3 text-lg text-slate-400">
            Consulta el aforo y las personas registradas en cada evento.
          </p>
        </div>
        {events.length > 0 && (
          <p className="text-sm font-medium text-slate-400">
            {events.length} {events.length === 1 ? "evento" : "eventos"}
          </p>
        )}
      </div>

      {events.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-16 text-center">
          <h2 className="text-2xl font-bold">Todavía no tienes eventos</h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-400">
            Crea tu primer evento para empezar a configurar sus tipos de entrada.
          </p>
          <Link
            href="/organizador"
            className="mt-7 inline-flex rounded-xl bg-sky-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-200"
          >
            Crear un evento
          </Link>
        </div>
      ) : (
        <div className="mt-9 grid gap-5 md:grid-cols-2">
          {events.map((event) => {
            const occupancy = Math.min(
              100,
              Math.round((event.registeredCount / event.maxCapacity) * 100),
            );

            return (
              <Link
                key={event.id}
                href={`/dashboard/${event.id}`}
                className="group rounded-3xl border border-white/10 bg-slate-900/85 p-6 shadow-2xl shadow-sky-950/20 transition hover:-translate-y-0.5 hover:border-sky-300/40 sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
                      {statusLabels[event.status]}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight group-hover:text-sky-100">
                      {event.title}
                    </h2>
                  </div>
                  <span className="text-xl text-sky-300" aria-hidden="true">
                    →
                  </span>
                </div>
                <p className="mt-3 text-sm capitalize text-slate-300">
                  {formatEventDate(event.startsAt)}
                </p>
                <p className="mt-1 text-sm text-slate-500">{event.venue}</p>

                <div className="mt-7 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl font-bold">
                      {event.registeredCount}
                      <span className="text-base font-medium text-slate-500">
                        {" "}/ {event.maxCapacity}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-slate-400">entradas registradas</p>
                  </div>
                  <p className="text-right text-sm text-slate-400">
                    {event.ticketTypeCount}{" "}
                    {event.ticketTypeCount === 1 ? "tipo" : "tipos"} de entrada
                  </p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-sky-300"
                    style={{ width: `${occupancy}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
