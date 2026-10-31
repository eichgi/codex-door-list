"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = value(formData, "email");
  const password = value(formData, "password");
  const next = value(formData, "next") || "/organizador";
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect(`/acceso?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/", "layout");
  redirect(next.startsWith("/") ? next : "/organizador");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = value(formData, "email");
  const password = value(formData, "password");
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) redirect(`/acceso?error=${encodeURIComponent(error.message)}`);
  redirect("/acceso?message=Revisa+tu+correo+para+confirmar+tu+cuenta.");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
