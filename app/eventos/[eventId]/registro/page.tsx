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
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:py-16">
      <div aria-hidden="true" className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_38%)]" />
      <div className="relative mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl sm:p-10">
          <Link href="/" className="text-sm font-bold text-sky-300 hover:text-sky-200">← Dool Fest</Link>
          <p className="mt-10 text-sm font-bold uppercase tracking-[0.22em] text-sky-300">Registro público</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{event.title}</h1>
          <dl className="mt-8 grid gap-5 text-slate-200">
            <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Fecha</dt><dd className="mt-1 capitalize">{eventDate}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Lugar</dt><dd className="mt-1">{event.venue}</dd></div>
          </dl>
          {event.description && <p className="mt-8 whitespace-pre-line leading-7 text-slate-300">{event.description}</p>}
        </section>

        <section className="self-start rounded-3xl border border-sky-300/20 bg-slate-900/90 p-7 shadow-2xl shadow-sky-950/40 sm:p-8">
          <RegistrationForm eventId={event.id} ticketTypes={event.ticketTypes} />
        </section>
      </div>
    </main>
  );
}
