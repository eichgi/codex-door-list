"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  isRegistrationErrorCode,
  registrationErrorMessages,
} from "@/lib/registrations/errors";
import type {
  ApiErrorResponse,
  PublicTicketType,
  RegistrationRequest,
  RegistrationResponse,
  RegistrationState,
} from "@/lib/types";

const initialState: RegistrationState = { status: "idle", message: "" };

export function RegistrationForm({
  eventId,
  ticketTypes,
}: {
  eventId: string;
  ticketTypes: PublicTicketType[];
}) {
  const [state, setState] = useState(initialState);
  const [pending, setPending] = useState(false);
  const availableTypes = ticketTypes.filter(
    (ticketType) => ticketType.remaining > 0 && ticketType.id !== state.unavailableTicketTypeId,
  );

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const requestBody: RegistrationRequest = {
      ticketTypeId: String(formData.get("ticket_type_id") ?? ""),
      buyerName: String(formData.get("buyer_name") ?? ""),
      buyerEmail: String(formData.get("buyer_email") ?? ""),
    };

    try {
      const response = await fetch(`/api/eventos/${eventId}/inscripciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const body = (await response.json()) as ApiErrorResponse;
        const error = isRegistrationErrorCode(body.error)
          ? body.error
          : "registrationFailed";
        const unavailableTicketTypeId =
          error === "ticketUnavailable" || error === "ticketTypeInvalid"
            ? requestBody.ticketTypeId
            : undefined;

        setState({
          status: "error",
          message: registrationErrorMessages[error],
          unavailableTicketTypeId,
        });
        return;
      }

      const result = (await response.json()) as RegistrationResponse;
      setState({
        status: "success",
        message:
          result.emailDelivery === "sent"
            ? "Tu registro y tu entrada quedaron confirmados. Te enviamos la entrada por correo."
            : "Tu registro y tu entrada quedaron confirmados, pero no pudimos enviar el correo. Abre y guarda tu entrada desde este enlace.",
        ticketCode: result.ticketCode,
        emailDelivery: result.emailDelivery,
      });
    } catch {
      setState({
        status: "error",
        message: registrationErrorMessages.registrationFailed,
      });
    } finally {
      setPending(false);
    }
  }

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/60 p-6 text-emerald-100" role="status">
        <p className="text-xs font-bold uppercase tracking-[0.2em]">Registro confirmado</p>
        <h2 className="mt-2 text-2xl font-bold text-white">¡Listo!</h2>
        <p className="mt-3 text-sm leading-6 text-emerald-100">{state.message}</p>
        {state.emailDelivery === "failed" && (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200" role="alert">
            Tu entrada sigue siendo válida. Consérvala desde el enlace de abajo.
          </p>
        )}
        {state.ticketCode && (
          <Link
            className="mt-6 inline-flex rounded-xl bg-sky-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950"
            href={`/entradas/${state.ticketCode}`}
          >
            Ver mi entrada y código QR
          </Link>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submitRegistration} className="grid gap-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">Tu entrada</p>
        <h2 className="mt-2 text-2xl font-bold text-white">Completa tu registro</h2>
        <p className="mt-2 text-sm text-slate-400">Cada registro corresponde a una persona.</p>
      </div>

      <label className="text-sm font-medium text-slate-300">
        Tipo de entrada
        <select className="mt-2 rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white transition focus-visible:border-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/30" name="ticket_type_id" required disabled={pending || availableTypes.length === 0} defaultValue="">
          <option value="" disabled>Selecciona una opción</option>
          {ticketTypes.map((ticketType) => {
            const unavailable = ticketType.remaining < 1 || ticketType.id === state.unavailableTicketTypeId;
            return (
              <option key={ticketType.id} value={ticketType.id} disabled={unavailable}>
                {ticketType.name} · {unavailable ? "Agotada" : `${ticketType.remaining} disponibles`}
              </option>
            );
          })}
        </select>
      </label>

      <label className="text-sm font-medium text-slate-300">
        Nombre completo
        <input className="mt-2 rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white transition focus-visible:border-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/30" name="buyer_name" required minLength={2} maxLength={120} autoComplete="name" disabled={pending} />
      </label>

      <label className="text-sm font-medium text-slate-300">
        Correo electrónico
        <input className="mt-2 rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white transition focus-visible:border-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/30" name="buyer_email" type="email" required maxLength={254} autoComplete="email" disabled={pending} />
      </label>

      {state.message && (
        <p className="rounded-xl border border-red-400/30 bg-red-950/60 px-4 py-3 text-sm text-red-100" role="alert" aria-live="polite">
          {state.message}
        </p>
      )}

      {availableTypes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300" role="status">
          Por el momento no hay tipos de entrada con disponibilidad.
        </p>
      ) : (
        <button className="rounded-xl bg-sky-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950" type="submit" disabled={pending} aria-disabled={pending}>
          {pending ? "Confirmando disponibilidad…" : "Confirmar registro"}
        </button>
      )}
    </form>
  );
}
