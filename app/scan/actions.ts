"use server";

import { redirect } from "next/navigation";
import { logProviderError } from "@/lib/provider-errors";
import { normalizeLookupEmail } from "@/lib/scan/data";
import { createClient } from "@/lib/supabase/server";
import type { TicketStatus } from "@/lib/types";

type CheckInOutcome = "checked-in" | "already-used" | "revoked" | "not-found" | "error";

function scanUrl(email: string, outcome: CheckInOutcome) {
  const params = new URLSearchParams({ email, outcome });
  return `/scan?${params.toString()}`;
}

export async function checkInTicket(formData: FormData) {
  const ticketCode = String(formData.get("ticketCode") ?? "").trim();
  const email = normalizeLookupEmail(String(formData.get("email") ?? ""));
  if (!/^[0-9a-f]{64}$/.test(ticketCode)) redirect(scanUrl(email, "not-found"));

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    logProviderError("No fue posible validar la sesión del personal de acceso", authError);
  }
  if (!user) redirect(`/acceso?next=${encodeURIComponent(scanUrl(email, "not-found"))}`);

  const updateResult = await supabase
    .from("tickets")
    .update({ status: "used" })
    .eq("code", ticketCode)
    .eq("status", "valid")
    .select("code")
    .maybeSingle();

  if (updateResult.error) {
    logProviderError("No fue posible registrar la entrada", updateResult.error);
    redirect(scanUrl(email, "error"));
  }
  if (updateResult.data) redirect(scanUrl(email, "checked-in"));

  const statusResult = await supabase
    .from("tickets")
    .select("status")
    .eq("code", ticketCode)
    .maybeSingle();

  if (statusResult.error) {
    logProviderError("No fue posible confirmar el estado de la entrada", statusResult.error);
    redirect(scanUrl(email, "error"));
  }

  const status = statusResult.data?.status as TicketStatus | undefined;
  if (status === "used") redirect(scanUrl(email, "already-used"));
  if (status === "revoked") redirect(scanUrl(email, "revoked"));
  redirect(scanUrl(email, "not-found"));
}
