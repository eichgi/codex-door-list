"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const dashboard = "/organizador";

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function number(formData: FormData, name: string) {
  const parsed = Number(formData.get(name));
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error("El valor debe ser un entero positivo.");
  return parsed;
}

async function organizer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado.");
  return { supabase, user };
}

function complete(error: { message: string } | null) {
  if (error) throw new Error(error.message);
  revalidatePath(dashboard);
}

export async function createEvent(formData: FormData) {
  const { supabase, user } = await organizer();
  const { error } = await supabase.from("events").insert({
    owner_id: user.id, title: text(formData, "title"), venue: text(formData, "venue"),
    starts_at: text(formData, "starts_at"), max_capacity: number(formData, "max_capacity"),
    description: text(formData, "description") || null,
  });
  complete(error);
}

export async function updateEvent(formData: FormData) {
  const { supabase } = await organizer();
  const { error } = await supabase.from("events").update({
    title: text(formData, "title"), venue: text(formData, "venue"), starts_at: text(formData, "starts_at"),
    max_capacity: number(formData, "max_capacity"), description: text(formData, "description") || null,
    status: text(formData, "status"),
  }).eq("id", text(formData, "event_id"));
  complete(error);
}

export async function deleteEvent(formData: FormData) {
  const { supabase } = await organizer();
  const { error } = await supabase.from("events").delete().eq("id", text(formData, "event_id"));
  complete(error);
}

export async function createTicketType(formData: FormData) {
  const { supabase } = await organizer();
  const { error } = await supabase.from("ticket_types").insert({
    event_id: text(formData, "event_id"), name: text(formData, "name"), max_capacity: number(formData, "max_capacity"),
  });
  complete(error);
}

export async function updateTicketType(formData: FormData) {
  const { supabase } = await organizer();
  const { error } = await supabase.from("ticket_types").update({
    name: text(formData, "name"), max_capacity: number(formData, "max_capacity"),
  }).eq("id", text(formData, "ticket_type_id"));
  complete(error);
}

export async function deleteTicketType(formData: FormData) {
  const { supabase } = await organizer();
  const { error } = await supabase.from("ticket_types").delete().eq("id", text(formData, "ticket_type_id"));
  complete(error);
}

export async function createSale(formData: FormData) {
  const { supabase } = await organizer();
  const { error } = await supabase.from("ticket_sales").insert({
    event_id: text(formData, "event_id"), ticket_type_id: text(formData, "ticket_type_id"),
    buyer_name: text(formData, "buyer_name"), buyer_email: text(formData, "buyer_email") || null,
    quantity: number(formData, "quantity"),
  });
  complete(error);
}

export async function updateSale(formData: FormData) {
  const { supabase } = await organizer();
  const { error } = await supabase.from("ticket_sales").update({
    buyer_name: text(formData, "buyer_name"), buyer_email: text(formData, "buyer_email") || null,
    quantity: number(formData, "quantity"),
  }).eq("id", text(formData, "sale_id"));
  complete(error);
}

export async function deleteSale(formData: FormData) {
  const { supabase } = await organizer();
  const { error } = await supabase.from("ticket_sales").delete().eq("id", text(formData, "sale_id"));
  complete(error);
}
