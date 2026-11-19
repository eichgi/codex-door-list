import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { CopyTicketCode } from "./copy-ticket-code";
import { formatEventDate } from "@/lib/dates";
import { mapTicket } from "@/lib/supabase/mappers";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export const metadata: Metadata = {
  title: "Mi entrada | Dool Fest",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

const codePattern = /^[0-9a-f]{64}$/;

const statusCopy = {
  valid: {
    label: "Válida",
    classes: "border-emerald-400/30 bg-emerald-950/60 text-emerald-100",
    description: "Muestra este código al personal de acceso.",
    showsQr: true,
  },
  used: {
    label: "Utilizada",
    classes: "border-white/10 bg-slate-800 text-slate-100",
    description: "Esta entrada ya fue registrada. Consulta al personal del evento si necesitas ayuda.",
    showsQr: false,
  },
  revoked: {
    label: "Revocada",
    classes: "border-red-400/30 bg-red-950/60 text-red-100",
    description: "Esta entrada no puede usarse. Consulta al personal del evento si necesitas ayuda.",
    showsQr: false,
  },
} as const;

export default async function PublicTicketPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (!codePattern.test(code)) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_ticket", { p_code: code });
  if (error) throw new Error("No fue posible consultar la entrada.");
  if (!data) notFound();

  const ticket = mapTicket(data);
  const status = statusCopy[ticket.status];
  if (!status) notFound();

  const qrSvg = await QRCode.toString(ticket.code, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 280,
    color: { dark: "#071226", light: "#ffffff" },
  });
  const eventDate = formatEventDate(ticket.eventStartsAt);

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:py-16">
      <div aria-hidden="true" className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_38%)]" />
      <article className="relative mx-auto grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl md:grid-cols-[1fr_320px]">
        <section className="p-7 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-sky-300">Entrada digital</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">{ticket.eventTitle}</h1>
          <span className={`mt-6 inline-flex rounded-full border px-4 py-2 text-sm font-bold ${status.classes}`}>
            {status.label}
          </span>

          <dl className="mt-8 grid gap-5 sm:grid-cols-2">
            <div><dt className="ticket-label">Asistente</dt><dd className="mt-1 text-lg">{ticket.attendeeName}</dd></div>
            <div><dt className="ticket-label">Correo</dt><dd className="mt-1 break-all text-lg">{ticket.attendeeEmail}</dd></div>
            <div><dt className="ticket-label">Tipo de entrada</dt><dd className="mt-1 text-lg">{ticket.ticketType}</dd></div>
            <div><dt className="ticket-label">Fecha</dt><dd className="mt-1 text-lg capitalize">{eventDate}</dd></div>
            <div className="sm:col-span-2"><dt className="ticket-label">Lugar</dt><dd className="mt-1 text-lg">{ticket.eventVenue}</dd></div>
          </dl>
        </section>

        <section className="grid content-center justify-items-center bg-white p-7 text-slate-950 sm:p-8">
          {status.showsQr ? (
            <>
              <div
                className="w-full max-w-[280px] [&_svg]:h-auto [&_svg]:w-full"
                aria-label="Código QR de la entrada"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <p className="mt-4 text-center text-sm font-bold">{status.description}</p>
              <p className="mt-2 text-center text-sm text-slate-500">Si no se puede escanear, usa el código de respaldo.</p>
              <p className="mt-6 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Código de respaldo</p>
              <code className="mt-2 max-w-full break-all text-center text-xs text-slate-500">{ticket.code}</code>
              <CopyTicketCode code={ticket.code} />
            </>
          ) : (
            <div className={`w-full rounded-2xl border p-6 text-center ${status.classes}`}>
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Entrada {status.label}</p>
              <p className="mt-4 text-base leading-7">{status.description}</p>
            </div>
          )}
        </section>
      </article>
    </main>
  );
}
