import QRCode from "qrcode";
import { Resend } from "resend";

export type TicketEmailData = {
  code: string;
  attendee_name: string;
  attendee_email: string;
  ticket_type: string;
  event_title: string;
  event_venue: string;
  event_starts_at: string;
};

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character]!,
  );
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  }).format(new Date(value));
}

function emailHtml(ticket: TicketEmailData, eventDate: string) {
  const attendeeName = escapeHtml(ticket.attendee_name);
  const eventTitle = escapeHtml(ticket.event_title);
  const ticketType = escapeHtml(ticket.ticket_type);
  const eventVenue = escapeHtml(ticket.event_venue);
  const escapedEventDate = escapeHtml(eventDate);
  const ticketCode = escapeHtml(ticket.code);

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;background:#020617;color:#e2e8f0;font-family:Arial,sans-serif">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#020617;padding:32px 16px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#0f172a;border:1px solid #334155;border-radius:20px;overflow:hidden">
          <tr><td style="padding:36px 36px 20px">
            <p style="margin:0 0 10px;color:#7dd3fc;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Entrada confirmada</p>
            <h1 style="margin:0;color:#ffffff;font-size:30px;line-height:1.2">${eventTitle}</h1>
            <p style="margin:18px 0 0;color:#cbd5e1;font-size:16px;line-height:1.6">Hola ${attendeeName}, presenta este código QR al ingresar al evento.</p>
          </td></tr>
          <tr><td style="padding:12px 36px 28px">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="color:#e2e8f0;font-size:15px;line-height:1.5">
              <tr><td style="padding:8px 0;color:#94a3b8">Tipo de entrada</td><td align="right" style="padding:8px 0;font-weight:bold">${ticketType}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8">Fecha</td><td align="right" style="padding:8px 0;font-weight:bold;text-transform:capitalize">${escapedEventDate}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8">Lugar</td><td align="right" style="padding:8px 0;font-weight:bold">${eventVenue}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8">Estado</td><td align="right" style="padding:8px 0;color:#6ee7b7;font-weight:bold">Válida</td></tr>
            </table>
          </td></tr>
          <tr><td align="center" style="background:#ffffff;padding:32px">
            <img src="cid:ticket-qr" width="280" height="280" alt="Código QR de la entrada" style="display:block;width:280px;max-width:100%;height:auto" />
            <p style="margin:18px 0 8px;color:#64748b;font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase">Código de entrada</p>
            <p style="margin:0;max-width:500px;color:#0f172a;font-family:monospace;font-size:11px;overflow-wrap:anywhere">${ticketCode}</p>
          </td></tr>
          <tr><td style="padding:22px 36px;color:#94a3b8;font-size:12px;line-height:1.5">
            Esta entrada es personal. No compartas el código ni el QR con otras personas.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function emailText(ticket: TicketEmailData, eventDate: string) {
  return [
    `Tu entrada para ${ticket.event_title} está confirmada.`,
    "",
    `Asistente: ${ticket.attendee_name}`,
    `Tipo de entrada: ${ticket.ticket_type}`,
    `Fecha: ${eventDate}`,
    `Lugar: ${ticket.event_venue}`,
    "Estado: Válida",
    "",
    `Código de entrada: ${ticket.code}`,
    "",
    "El código QR está adjunto e incluido en este correo. No lo compartas con otras personas.",
  ].join("\n");
}

export async function sendTicketEmail(ticket: TicketEmailData) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error("Resend no está configurado.");
  }

  const eventDate = formatEventDate(ticket.event_starts_at);
  const qrImage = await QRCode.toBuffer(ticket.code, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 560,
    color: { dark: "#071226", light: "#ffffff" },
  });
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send(
    {
      from,
      to: ticket.attendee_email,
      subject: `Tu entrada para ${ticket.event_title}`,
      html: emailHtml(ticket, eventDate),
      text: emailText(ticket, eventDate),
      attachments: [
        {
          content: qrImage,
          filename: "entrada-qr.png",
          contentType: "image/png",
          contentId: "ticket-qr",
        },
      ],
    },
    { idempotencyKey: `ticket-confirmation-${ticket.code}` },
  );

  if (error) {
    throw new Error(`Resend rechazó el correo: ${error.message}`);
  }
}
