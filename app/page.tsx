import Link from "next/link";
import { registrationIsOpen } from "@/lib/events/registration-is-open";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type PublicEvent = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  venue: string;
  status: "published";
};

const eventDateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "America/Mexico_City",
});

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, title, description, starts_at, venue, status")
    .eq("status", "published")
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error("No fue posible consultar los eventos disponibles.");
  }

  const events = ((data ?? []) as PublicEvent[]).filter((event) =>
    registrationIsOpen(event),
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-5 py-10 text-white sm:py-16">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_38%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-sky-300">
              Dool Fest
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
              Encuentra tu próximo evento
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
              Consulta los eventos con registro abierto y asegura tu entrada.
            </p>
          </div>
          <Link
            href="/organizador"
            className="shrink-0 font-bold text-sky-300 hover:text-sky-200"
          >
            Acceso para organizadores →
          </Link>
        </header>

        <section className="py-10" aria-labelledby="available-events-title">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                Registro público
              </p>
              <h2 id="available-events-title" className="mt-2 text-3xl font-bold">
                Eventos disponibles
              </h2>
            </div>
            {events.length > 0 && (
              <p className="text-sm text-slate-400">
                {events.length} {events.length === 1 ? "evento" : "eventos"}
              </p>
            )}
          </div>

          {events.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 px-7 py-14 text-center shadow-2xl">
              <h3 className="text-2xl font-bold">No hay eventos con registro abierto</h3>
              <p className="mt-3 text-slate-400">
                Vuelve pronto para consultar nuevas fechas.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="flex flex-col rounded-3xl border border-white/10 bg-slate-900/90 p-7 shadow-2xl shadow-sky-950/30 sm:p-8"
                >
                  <p className="text-sm font-bold capitalize text-sky-300">
                    {eventDateFormatter.format(new Date(event.starts_at))}
                  </p>
                  <h3 className="mt-3 text-3xl font-bold tracking-tight">
                    {event.title}
                  </h3>
                  <p className="mt-3 font-medium text-slate-200">{event.venue}</p>
                  <p className="mt-5 flex-1 whitespace-pre-line leading-7 text-slate-400">
                    {event.description || "Este evento no tiene una descripción disponible."}
                  </p>
                  <Link
                    href={`/eventos/${event.id}/registro`}
                    className="mt-7 inline-flex self-start rounded-xl bg-sky-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-200"
                  >
                    Ver evento y registrarme
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
