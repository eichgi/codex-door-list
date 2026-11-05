import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/acceso/actions";
import { formatEventDate } from "@/lib/dates";
import { logProviderError, providerErrorMessages } from "@/lib/provider-errors";
import { mapOrganizerEvents } from "@/lib/supabase/mappers";
import { createClient } from "@/lib/supabase/server";
import { createEvent, createRegistration, createTicketType, deleteEvent, deleteRegistration, deleteTicketType, updateEvent, updateRegistration, updateTicketType } from "./actions";

export const instant = false;

export default async function OrganizerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/acceso?next=/organizador");
  const { data, error } = await supabase.from("events").select("*, ticket_types(*), registrations(*) ").order("starts_at");
  if (error) {
    logProviderError("No fue posible cargar el panel", error);
    throw new Error(providerErrorMessages.loadOrganizer);
  }
  const events = mapOrganizerEvents(data);

  return <main className="dashboard"><header className="dashboard-header"><div><Link href="/" className="back-link">← Dool Fest</Link><p className="eyebrow">Panel del organizador</p><h1>Eventos e inscripciones</h1></div><form action={signOut}><button className="secondary-button">Cerrar sesión</button></form></header>
    <section className="panel"><h2>Crear evento</h2><form action={createEvent} className="grid-form"><label>Nombre<input name="title" required /></label><label>Sede<input name="venue" required /></label><label>Fecha y hora<input name="starts_at" type="datetime-local" required /></label><label>Aforo total<input name="max_capacity" type="number" min="1" required /></label><label className="full">Descripción<textarea name="description" rows={2} /></label><button type="submit">Crear evento</button></form></section>
    {events.map((event) => { const allocated = event.ticketTypes.reduce((sum, type) => sum + type.maxCapacity, 0); const registered = event.registrations.reduce((sum, registration) => sum + registration.quantity, 0); return <section className="event-card" key={event.id}><div className="event-title"><div><p className="eyebrow">{event.status}</p><h2>{event.title}</h2><p className="muted">{event.venue} · {formatEventDate(event.startsAt)}</p>{event.status === "published" && <Link className="back-link" href={`/eventos/${event.id}/registro`}>Ver registro público →</Link>}</div><div className="capacity"><strong>{allocated} / {event.maxCapacity}</strong><span>aforo asignado</span><strong>{registered}</strong><span>entradas emitidas</span></div></div>
      <form action={updateEvent} className="grid-form compact"><input type="hidden" name="event_id" value={event.id}/><label>Nombre<input name="title" defaultValue={event.title} required /></label><label>Sede<input name="venue" defaultValue={event.venue} required /></label><label>Fecha<input name="starts_at" type="datetime-local" defaultValue={event.startsAt.slice(0,16)} required /></label><label>Aforo total<input name="max_capacity" type="number" min={allocated || 1} defaultValue={event.maxCapacity} required /></label><label>Estado<select name="status" defaultValue={event.status}><option value="draft">Borrador</option><option value="published">Publicado</option></select></label><label className="full">Descripción<textarea name="description" defaultValue={event.description ?? ""} rows={2}/></label><button type="submit">Guardar evento</button></form><form action={deleteEvent}><input type="hidden" name="event_id" value={event.id}/><button className="danger" type="submit">Eliminar evento</button></form>
      <div className="management-grid"><div><h3>Tipos de entrada</h3><p className="muted">Disponibles para asignar: {event.maxCapacity - allocated}</p><form action={createTicketType} className="inline-form"><input type="hidden" name="event_id" value={event.id}/><input name="name" placeholder="Ej. General" required/><input name="max_capacity" type="number" min="1" max={Math.max(1,event.maxCapacity-allocated)} placeholder="Aforo" required/><button>Agregar</button></form>{event.ticketTypes.map((type) => <form action={updateTicketType} className="inline-form record" key={type.id}><input type="hidden" name="ticket_type_id" value={type.id}/><input name="name" defaultValue={type.name} required/><input name="max_capacity" type="number" min="1" defaultValue={type.maxCapacity} required/><button>Guardar</button><button formAction={deleteTicketType} className="danger">Eliminar</button></form>)}</div>
      <div><h3>Registrar inscripción</h3>{event.ticketTypes.length ? <form action={createRegistration} className="grid-form compact"><input type="hidden" name="event_id" value={event.id}/><label>Tipo<select name="ticket_type_id">{event.ticketTypes.map((type)=><option key={type.id} value={type.id}>{type.name}</option>)}</select></label><label>Asistente<input name="buyer_name" required/></label><label>Correo<input name="buyer_email" type="email"/></label><label>Cantidad<input name="quantity" type="number" min="1" required/></label><button>Registrar inscripción</button></form> : <p className="muted">Crea un tipo de entrada primero.</p>}<div className="sales">{event.registrations.map((registration) => <form action={updateRegistration} className="inline-form record" key={registration.id}><input type="hidden" name="registration_id" value={registration.id}/><input name="buyer_name" defaultValue={registration.buyerName} required/><input name="buyer_email" type="email" defaultValue={registration.buyerEmail ?? ""}/><input name="quantity" type="number" min="1" defaultValue={registration.quantity} required/><button>Guardar</button><button formAction={deleteRegistration} className="danger">Eliminar</button></form>)}</div></div></div>
    </section> })}
  </main>;
}
