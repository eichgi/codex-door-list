import Link from "next/link";
import { notFound } from "next/navigation";
import { formatEventDate } from "@/lib/dates";
import { mapPublicEvent } from "@/lib/supabase/mappers";
import { createClient } from "@/lib/supabase/server";
import { RegistrationForm } from "./registration-form";

export const instant = false;

export default async function PublicRegistrationPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_event_registration", {
    p_event_id: eventId,
  });

  if (error) throw new Error("No fue posible consultar el evento.");
  if (!data) notFound();

  const event = mapPublicEvent(data);
  const eventDate = formatEventDate(event.startsAt);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-3xl border border-white/10 bg-slate-900/85 p-6 sm:p-7 lg:p-8">
        <Link
          href="/"
          className="text-sm font-bold text-sky-300 transition hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        >
          ← Dool Fest
        </Link>
        <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
          Registro público
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          {event.title}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
          Consulta los detalles del evento y confirma tu entrada.
        </p>
        <dl className="mt-8 grid gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Fecha
            </dt>
            <dd className="mt-2 capitalize text-slate-100">{eventDate}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Lugar
            </dt>
            <dd className="mt-2 text-slate-100">{event.venue}</dd>
          </div>
        </dl>
        {event.description && (
          <div className="mt-8 border-t border-white/10 pt-6">
            <h2 className="text-xl font-bold tracking-tight">Sobre el evento</h2>
            <p className="mt-3 whitespace-pre-line text-base leading-7 text-slate-300">
              {event.description}
            </p>
          </div>
        )}
      </section>

      <section className="self-start rounded-3xl border border-sky-300/40 bg-slate-900/90 p-6 sm:p-7">
        <RegistrationForm eventId={event.id} ticketTypes={event.ticketTypes} />
      </section>
    </div>
  );
}
