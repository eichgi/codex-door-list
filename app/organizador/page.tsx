import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/acceso/actions";
import { EmptyState } from "@/components/ui/empty-state";
import { formatEventDate } from "@/lib/dates";
import { logProviderError, providerErrorMessages } from "@/lib/provider-errors";
import { mapOrganizerEvents } from "@/lib/supabase/mappers";
import { createClient } from "@/lib/supabase/server";
import type { EventStatus } from "@/lib/types";
import {
  createEvent,
  createRegistration,
  createTicketType,
  deleteEvent,
  deleteRegistration,
  deleteTicketType,
  updateEvent,
  updateRegistration,
  updateTicketType,
} from "./actions";

export const instant = false;

const fieldClassName =
  "mt-2 rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white transition placeholder:text-slate-500 focus-visible:border-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/30";
const primaryButtonClassName =
  "rounded-xl bg-sky-300 px-4 py-2.5 font-bold text-slate-950 transition hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";
const secondaryButtonClassName =
  "rounded-xl bg-slate-800 px-4 py-2.5 font-bold text-slate-100 transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";
const destructiveButtonClassName =
  "rounded-xl bg-red-900 px-4 py-2.5 font-bold text-red-100 transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

const statusLabels: Record<EventStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  deleted: "Eliminado",
};

export default async function OrganizerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/acceso?next=/organizador");

  const [eventsResult, ticketTypesResult, registrationsResult] =
    await Promise.all([
      supabase.from("events").select("*").order("starts_at"),
      supabase.from("ticket_types").select("*"),
      supabase.from("registrations").select("*"),
    ]);
  const providerError =
    eventsResult.error ?? ticketTypesResult.error ?? registrationsResult.error;

  if (providerError) {
    logProviderError("No fue posible cargar el panel", providerError);
    throw new Error(providerErrorMessages.loadOrganizer);
  }

  const events = mapOrganizerEvents({
    events: eventsResult.data,
    ticketTypes: ticketTypesResult.data,
    registrations: registrationsResult.data,
  });

  return (
    <>
      <header className="flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/"
            className="text-sm font-bold text-sky-300 transition hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            ← Dool Fest
          </Link>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
            Panel del organizador
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Eventos e inscripciones
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
            Configura el aforo, publica tus eventos y administra a las personas
            registradas desde un solo lugar.
          </p>
        </div>
        <form action={signOut}>
          <button type="submit" className={secondaryButtonClassName}>
            Cerrar sesión
          </button>
        </form>
      </header>

      <section className="mt-12" aria-labelledby="create-event-title">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
          Nuevo evento
        </p>
        <h2 id="create-event-title" className="mt-2 text-2xl font-bold">
          Crear evento
        </h2>
        <form
          action={createEvent}
          className="mt-6 grid gap-5 rounded-2xl border border-white/10 bg-slate-900/85 p-5 sm:grid-cols-2 sm:p-6"
        >
          <label className="text-sm font-medium text-slate-300">
            Nombre
            <input className={fieldClassName} name="title" required />
          </label>
          <label className="text-sm font-medium text-slate-300">
            Sede
            <input className={fieldClassName} name="venue" required />
          </label>
          <label className="text-sm font-medium text-slate-300">
            Fecha y hora
            <input
              className={fieldClassName}
              name="starts_at"
              type="datetime-local"
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-300">
            Aforo total
            <input
              className={fieldClassName}
              name="max_capacity"
              type="number"
              min="1"
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-300 sm:col-span-2">
            Descripción
            <textarea
              className={fieldClassName}
              name="description"
              rows={3}
            />
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className={primaryButtonClassName}>
              Crear evento
            </button>
          </div>
        </form>
      </section>

      <section className="mt-12" aria-labelledby="managed-events-title">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
              Gestión
            </p>
            <h2 id="managed-events-title" className="mt-2 text-2xl font-bold">
              Tus eventos
            </h2>
          </div>
          {events.length > 0 && (
            <p className="text-sm text-slate-400">
              {events.length} {events.length === 1 ? "evento" : "eventos"}
            </p>
          )}
        </div>

        {events.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="Todavía no tienes eventos"
              description="Crea tu primer evento con el formulario anterior para configurar sus tipos de entrada."
              headingLevel="h3"
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-5">
            {events.map((event) => {
              const allocated = event.ticketTypes.reduce(
                (sum, ticketType) => sum + ticketType.maxCapacity,
                0,
              );
              const registered = event.registrations.reduce(
                (sum, registration) => sum + registration.quantity,
                0,
              );

              return (
                <article
                  className="rounded-3xl border border-white/10 bg-slate-900/85 p-5 sm:p-6"
                  key={event.id}
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                        {statusLabels[event.status]}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold tracking-tight">
                        {event.title}
                      </h3>
                      <p className="mt-2 text-sm capitalize text-slate-400">
                        {event.venue} · {formatEventDate(event.startsAt)}
                      </p>
                      {event.status === "published" && (
                        <Link
                          className="mt-4 inline-flex text-sm font-bold text-sky-300 transition hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                          href={`/eventos/${event.id}/registro`}
                        >
                          Ver página pública →
                        </Link>
                      )}
                    </div>
                    <dl className="grid grid-cols-2 gap-5 rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div>
                        <dd className="text-3xl font-bold">
                          {allocated}
                          <span className="text-base font-medium text-slate-500">
                            {" "}/ {event.maxCapacity}
                          </span>
                        </dd>
                        <dt className="mt-1 text-sm text-slate-400">
                          aforo asignado
                        </dt>
                      </div>
                      <div>
                        <dd className="text-3xl font-bold">{registered}</dd>
                        <dt className="mt-1 text-sm text-slate-400">
                          entradas emitidas
                        </dt>
                      </div>
                    </dl>
                  </div>

                  <form
                    action={updateEvent}
                    className="mt-6 grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-2"
                  >
                    <input type="hidden" name="event_id" value={event.id} />
                    <label className="text-sm font-medium text-slate-300">
                      Nombre
                      <input className={fieldClassName} name="title" defaultValue={event.title} required />
                    </label>
                    <label className="text-sm font-medium text-slate-300">
                      Sede
                      <input className={fieldClassName} name="venue" defaultValue={event.venue} required />
                    </label>
                    <label className="text-sm font-medium text-slate-300">
                      Fecha y hora
                      <input className={fieldClassName} name="starts_at" type="datetime-local" defaultValue={event.startsAt.slice(0, 16)} required />
                    </label>
                    <label className="text-sm font-medium text-slate-300">
                      Aforo total
                      <input className={fieldClassName} name="max_capacity" type="number" min={allocated || 1} defaultValue={event.maxCapacity} required />
                    </label>
                    <label className="text-sm font-medium text-slate-300">
                      Estado
                      <select className={fieldClassName} name="status" defaultValue={event.status}>
                        <option value="draft">Borrador</option>
                        <option value="published">Publicado</option>
                      </select>
                    </label>
                    <label className="text-sm font-medium text-slate-300 sm:col-span-2">
                      Descripción
                      <textarea className={fieldClassName} name="description" defaultValue={event.description ?? ""} rows={3} />
                    </label>
                    <div className="sm:col-span-2">
                      <button type="submit" className={primaryButtonClassName}>Guardar evento</button>
                    </div>
                  </form>

                  <div className="mt-8 grid gap-8 border-t border-white/10 pt-8 lg:grid-cols-2">
                    <section aria-labelledby={`ticket-types-${event.id}`}>
                      <h4 id={`ticket-types-${event.id}`} className="text-xl font-bold tracking-tight">Tipos de entrada</h4>
                      <p className="mt-2 text-sm text-slate-400">Disponibles para asignar: {event.maxCapacity - allocated}</p>
                      <form action={createTicketType} className="mt-5 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2">
                        <input type="hidden" name="event_id" value={event.id} />
                        <label className="text-sm font-medium text-slate-300">
                          Nombre
                          <input className={fieldClassName} name="name" placeholder="Ej. General" required />
                        </label>
                        <label className="text-sm font-medium text-slate-300">
                          Aforo
                          <input className={fieldClassName} name="max_capacity" type="number" min="1" max={Math.max(1, event.maxCapacity - allocated)} required />
                        </label>
                        <div className="sm:col-span-2">
                          <button type="submit" className={primaryButtonClassName}>Agregar tipo</button>
                        </div>
                      </form>

                      {event.ticketTypes.length === 0 ? (
                        <p className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">Este evento todavía no tiene tipos de entrada.</p>
                      ) : (
                        <div className="mt-5 grid gap-4">
                          {event.ticketTypes.map((ticketType) => (
                            <form action={updateTicketType} className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2" key={ticketType.id}>
                              <input type="hidden" name="ticket_type_id" value={ticketType.id} />
                              <label className="text-sm font-medium text-slate-300">
                                Nombre
                                <input className={fieldClassName} name="name" defaultValue={ticketType.name} required />
                              </label>
                              <label className="text-sm font-medium text-slate-300">
                                Aforo
                                <input className={fieldClassName} name="max_capacity" type="number" min="1" defaultValue={ticketType.maxCapacity} required />
                              </label>
                              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                                <button type="submit" className={secondaryButtonClassName}>Guardar</button>
                                <button formAction={deleteTicketType} className={destructiveButtonClassName}>Eliminar</button>
                              </div>
                            </form>
                          ))}
                        </div>
                      )}
                    </section>

                    <section aria-labelledby={`registrations-${event.id}`}>
                      <h4 id={`registrations-${event.id}`} className="text-xl font-bold tracking-tight">Inscripciones</h4>
                      <p className="mt-2 text-sm text-slate-400">Registra y actualiza asistentes del evento.</p>
                      {event.ticketTypes.length > 0 ? (
                        <form action={createRegistration} className="mt-5 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2">
                          <input type="hidden" name="event_id" value={event.id} />
                          <label className="text-sm font-medium text-slate-300">
                            Tipo de entrada
                            <select className={fieldClassName} name="ticket_type_id">
                              {event.ticketTypes.map((ticketType) => <option key={ticketType.id} value={ticketType.id}>{ticketType.name}</option>)}
                            </select>
                          </label>
                          <label className="text-sm font-medium text-slate-300">
                            Asistente
                            <input className={fieldClassName} name="buyer_name" required />
                          </label>
                          <label className="text-sm font-medium text-slate-300">
                            Correo
                            <input className={fieldClassName} name="buyer_email" type="email" />
                          </label>
                          <label className="text-sm font-medium text-slate-300">
                            Cantidad
                            <input className={fieldClassName} name="quantity" type="number" min="1" required />
                          </label>
                          <div className="sm:col-span-2">
                            <button type="submit" className={primaryButtonClassName}>Registrar inscripción</button>
                          </div>
                        </form>
                      ) : (
                        <p className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">Crea un tipo de entrada antes de registrar asistentes.</p>
                      )}

                      {event.registrations.length === 0 ? (
                        <p className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">Aún no hay asistentes registrados para este evento.</p>
                      ) : (
                        <div className="mt-5 grid gap-4">
                          {event.registrations.map((registration) => (
                            <form action={updateRegistration} className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2" key={registration.id}>
                              <input type="hidden" name="registration_id" value={registration.id} />
                              <label className="text-sm font-medium text-slate-300">
                                Asistente
                                <input className={fieldClassName} name="buyer_name" defaultValue={registration.buyerName} required />
                              </label>
                              <label className="text-sm font-medium text-slate-300">
                                Correo
                                <input className={fieldClassName} name="buyer_email" type="email" defaultValue={registration.buyerEmail ?? ""} />
                              </label>
                              <label className="text-sm font-medium text-slate-300">
                                Cantidad
                                <input className={fieldClassName} name="quantity" type="number" min="1" defaultValue={registration.quantity} required />
                              </label>
                              <div className="flex flex-wrap items-end gap-3 sm:col-span-2">
                                <button type="submit" className={secondaryButtonClassName}>Guardar</button>
                                <button formAction={deleteRegistration} className={destructiveButtonClassName}>Eliminar</button>
                              </div>
                            </form>
                          ))}
                        </div>
                      )}
                    </section>
                  </div>

                  <form action={deleteEvent} className="mt-8 border-t border-white/10 pt-6">
                    <input type="hidden" name="event_id" value={event.id} />
                    <button type="submit" className={destructiveButtonClassName}>Eliminar evento</button>
                  </form>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
