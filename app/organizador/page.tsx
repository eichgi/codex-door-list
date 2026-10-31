import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/acceso/actions";
import { createClient } from "@/lib/supabase/server";
import { createEvent, createSale, createTicketType, deleteEvent, deleteSale, deleteTicketType, updateEvent, updateSale, updateTicketType } from "./actions";

export const instant = false;

type TicketType = { id: string; name: string; max_capacity: number };
type Sale = { id: string; ticket_type_id: string; buyer_name: string; buyer_email: string | null; quantity: number };
type Event = { id: string; title: string; venue: string; starts_at: string; description: string | null; status: "draft" | "published" | "deleted"; max_capacity: number; ticket_types: TicketType[]; ticket_sales: Sale[] };

export default async function OrganizerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/acceso?next=/organizador");
  const { data, error } = await supabase.from("events").select("*, ticket_types(*), ticket_sales(*) ").order("starts_at");
  if (error) throw new Error(error.message);
  const events = (data ?? []) as Event[];

  return <main className="dashboard"><header className="dashboard-header"><div><Link href="/" className="back-link">← Dool Fest</Link><p className="eyebrow">Panel del organizador</p><h1>Eventos y ventas</h1></div><form action={signOut}><button className="secondary-button">Cerrar sesión</button></form></header>
    <section className="panel"><h2>Crear evento</h2><form action={createEvent} className="grid-form"><label>Nombre<input name="title" required /></label><label>Sede<input name="venue" required /></label><label>Fecha y hora<input name="starts_at" type="datetime-local" required /></label><label>Aforo total<input name="max_capacity" type="number" min="1" required /></label><label className="full">Descripción<textarea name="description" rows={2} /></label><button type="submit">Crear evento</button></form></section>
    {events.map((event) => { const allocated = event.ticket_types.reduce((sum, type) => sum + type.max_capacity, 0); const sold = event.ticket_sales.reduce((sum, sale) => sum + sale.quantity, 0); return <section className="event-card" key={event.id}><div className="event-title"><div><p className="eyebrow">{event.status}</p><h2>{event.title}</h2><p className="muted">{event.venue} · {new Date(event.starts_at).toLocaleString("es-MX")}</p></div><div className="capacity"><strong>{allocated} / {event.max_capacity}</strong><span>aforo asignado</span><strong>{sold}</strong><span>boletos vendidos</span></div></div>
      <form action={updateEvent} className="grid-form compact"><input type="hidden" name="event_id" value={event.id}/><label>Nombre<input name="title" defaultValue={event.title} required /></label><label>Sede<input name="venue" defaultValue={event.venue} required /></label><label>Fecha<input name="starts_at" type="datetime-local" defaultValue={event.starts_at.slice(0,16)} required /></label><label>Aforo total<input name="max_capacity" type="number" min={allocated || 1} defaultValue={event.max_capacity} required /></label><label>Estado<select name="status" defaultValue={event.status}><option value="draft">Borrador</option><option value="published">Publicado</option></select></label><label className="full">Descripción<textarea name="description" defaultValue={event.description ?? ""} rows={2}/></label><button type="submit">Guardar evento</button></form><form action={deleteEvent}><input type="hidden" name="event_id" value={event.id}/><button className="danger" type="submit">Eliminar evento</button></form>
      <div className="management-grid"><div><h3>Tipos de entrada</h3><p className="muted">Disponibles para asignar: {event.max_capacity - allocated}</p><form action={createTicketType} className="inline-form"><input type="hidden" name="event_id" value={event.id}/><input name="name" placeholder="Ej. General" required/><input name="max_capacity" type="number" min="1" max={Math.max(1,event.max_capacity-allocated)} placeholder="Aforo" required/><button>Agregar</button></form>{event.ticket_types.map((type) => <form action={updateTicketType} className="inline-form record" key={type.id}><input type="hidden" name="ticket_type_id" value={type.id}/><input name="name" defaultValue={type.name} required/><input name="max_capacity" type="number" min="1" defaultValue={type.max_capacity} required/><button>Guardar</button><button formAction={deleteTicketType} className="danger">Eliminar</button></form>)}</div>
      <div><h3>Registrar venta</h3>{event.ticket_types.length ? <form action={createSale} className="grid-form compact"><input type="hidden" name="event_id" value={event.id}/><label>Tipo<select name="ticket_type_id">{event.ticket_types.map((type)=><option key={type.id} value={type.id}>{type.name}</option>)}</select></label><label>Comprador<input name="buyer_name" required/></label><label>Correo<input name="buyer_email" type="email"/></label><label>Cantidad<input name="quantity" type="number" min="1" required/></label><button>Registrar venta</button></form> : <p className="muted">Crea un tipo de entrada primero.</p>}<div className="sales">{event.ticket_sales.map((sale) => <form action={updateSale} className="inline-form record" key={sale.id}><input type="hidden" name="sale_id" value={sale.id}/><input name="buyer_name" defaultValue={sale.buyer_name} required/><input name="buyer_email" type="email" defaultValue={sale.buyer_email ?? ""}/><input name="quantity" type="number" min="1" defaultValue={sale.quantity} required/><button>Guardar</button><button formAction={deleteSale} className="danger">Eliminar</button></form>)}</div></div></div>
    </section> })}
  </main>;
}
