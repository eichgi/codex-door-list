"use client";

import { useActionState } from "react";
import type { ResendTicketState } from "@/lib/types";
import { resendTicket } from "./actions";

const initialState: ResendTicketState = { status: "idle", message: "" };

type ResendTicketButtonProps = {
  eventId: string;
  ticketCode: string;
  attendeeEmail: string | null;
};

export function ResendTicketButton({
  eventId,
  ticketCode,
  attendeeEmail,
}: ResendTicketButtonProps) {
  const [state, formAction, pending] = useActionState(
    resendTicket,
    initialState,
  );
  const disabled = pending || !attendeeEmail;

  return (
    <form action={formAction} className="flex min-w-44 flex-col items-start gap-2">
      <input name="eventId" type="hidden" value={eventId} />
      <input name="ticketCode" type="hidden" value={ticketCode} />
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-100 transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-800"
      >
        {pending ? "Enviando…" : "Reenviar entrada"}
      </button>
      {!attendeeEmail && (
        <p className="text-xs text-slate-500">No hay email registrado.</p>
      )}
      {state.message && (
        <p
          aria-live="polite"
          className={
            state.status === "success"
              ? "max-w-56 text-xs leading-5 text-emerald-300"
              : "max-w-56 text-xs leading-5 text-red-300"
          }
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
