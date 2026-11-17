import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { formatEventDate } from "@/lib/dates";
import { registrationIsOpen } from "@/lib/events/registration-is-open";
import { mapCatalogEvents } from "@/lib/supabase/mappers";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export const metadata: Metadata = {
  title: "Eventos con registro abierto | Dool Fest",
  description: "Encuentra eventos disponibles y regístrate para asistir.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const queryValue = (await searchParams).q;
  const query = typeof queryValue === "string" ? queryValue.trim() : "";
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_event_catalog", {
    p_query: query || null,
  });

  if (error) {
    throw new Error("No fue posible consultar los eventos disponibles.");
  }

  const events = mapCatalogEvents(data)
    .filter(
      (event) =>
        registrationIsOpen(event) &&
        event.ticketTypes.some((ticketType) => ticketType.remaining > 0),
    )
    .map((event) => ({
      ...event,
      remainingCapacity: event.ticketTypes.reduce(
        (total, ticketType) => total + ticketType.remaining,
        0,
      ),
    }));

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-5 py-10 text-white sm:py-16">
      <div className="relative mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
              Encuentra tu próximo evento
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
              Consulta los eventos con registro abierto y asegura tu entrada.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="shrink-0 font-bold text-sky-300 transition hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Acceso para organizadores
          </Link>
        </header>

        <section className="py-10" aria-labelledby="available-events-title">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <h2 id="available-events-title" className="text-3xl font-bold">
                Eventos disponibles
              </h2>
            </div>
            {events.length > 0 && (
              <p className="text-sm text-slate-400">
                {events.length} {events.length === 1 ? "evento" : "eventos"}
              </p>
            )}
          </div>

          <form className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end" role="search">
            <div className="w-full sm:max-w-md">
              <label htmlFor="event-search" className="text-sm font-bold text-slate-200">
                Busca por nombre o lugar
              </label>
              <input
                id="event-search"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Ej. Ciudad de México"
                className="mt-2 rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-base text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-slate-800 px-5 py-3 font-bold text-slate-100 transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Buscar eventos
            </button>
            {query && (
              <Link
                href="/"
                className="px-3 py-3 text-sm font-bold text-sky-300 transition hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Limpiar búsqueda
              </Link>
            )}
          </form>

          {events.length === 0 ? (
            <EmptyState
              headingLevel="h3"
              title={query ? "No encontramos eventos para tu búsqueda" : "No hay eventos con registro abierto"}
              description={query ? "Prueba con otro nombre o lugar, o consulta todos los eventos disponibles." : "Vuelve pronto para consultar nuevas fechas."}
              action={
                query ? (
                  <Link
                    href="/"
                    className="inline-flex rounded-xl bg-sky-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    Ver todos los eventos
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <ol className="border-t border-white/10">
              {events.map((event) => (
                <li key={event.id} className="border-b border-white/10">
                  <article className="grid gap-5 py-7 lg:grid-cols-[11rem_minmax(0,1fr)_13rem] lg:gap-8">
                    <time
                      dateTime={event.startsAt}
                      className="text-sm font-bold capitalize leading-6 text-sky-300"
                    >
                      {formatEventDate(event.startsAt)}
                    </time>

                    <div className="min-w-0">
                      <h3 className="break-words text-2xl font-bold tracking-tight">
                        {event.title}
                      </h3>
                      <p className="mt-2 break-words font-medium text-slate-200">
                        {event.venue}
                      </p>
                      <p className="mt-4 max-w-2xl whitespace-pre-line break-words leading-7 text-slate-400">
                        {event.description || "Este evento no tiene una descripción disponible."}
                      </p>
                    </div>

                    <div className="grid content-start gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end lg:grid-cols-1">
                      <dl className="grid gap-2 text-sm">
                        <div className="flex items-baseline justify-between gap-3">
                          <dt className="text-slate-400">Registro</dt>
                          <dd className="font-bold text-emerald-300">Abierto</dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-3">
                          <dt className="text-slate-400">Entradas</dt>
                          <dd className="text-right font-bold text-slate-100">
                            {event.ticketTypes.length} {event.ticketTypes.length === 1 ? "tipo" : "tipos"}
                          </dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-3">
                          <dt className="text-slate-400">Disponibilidad</dt>
                          <dd className="text-right font-bold text-slate-100">
                            {event.remainingCapacity} {event.remainingCapacity === 1 ? "lugar" : "lugares"}
                          </dd>
                        </div>
                      </dl>
                      <Link
                        href={`/eventos/${event.id}/registro`}
                        className="inline-flex justify-center rounded-xl bg-sky-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                      >
                        Ver y registrarme
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
