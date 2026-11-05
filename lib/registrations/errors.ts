import type { RegistrationErrorCode } from "@/lib/types";

type RegistrationError = {
  error: RegistrationErrorCode;
  status: number;
};

const databaseErrors: Record<string, RegistrationError> = {
  P1001: { error: "invalidName", status: 400 },
  P1002: { error: "invalidEmail", status: 400 },
  P1003: { error: "ticketTypeInvalid", status: 409 },
  P1004: { error: "eventUnavailable", status: 409 },
  P1005: { error: "emailAlreadyRegistered", status: 409 },
  P1006: { error: "ticketUnavailable", status: 409 },
};

export const registrationErrorMessages: Record<RegistrationErrorCode, string> = {
  invalidRequest: "Revisa los datos del formulario e intenta nuevamente.",
  invalidName: "Ingresa un nombre de entre 2 y 120 caracteres.",
  invalidEmail: "Ingresa un correo electrónico válido.",
  ticketTypeInvalid: "El tipo de entrada seleccionado ya no está disponible. Elige otra opción.",
  eventUnavailable: "Este evento ya no está disponible para registro.",
  ticketUnavailable: "La entrada seleccionada acaba de agotarse. Elige otra opción disponible.",
  emailAlreadyRegistered: "Este correo ya está registrado para el evento. Solo se permite un registro por persona.",
  registrationFailed: "No pudimos completar tu registro. Intenta de nuevo en unos momentos.",
};

export function registrationErrorFromDatabase(code: string): RegistrationError | null {
  return databaseErrors[code] ?? null;
}

export function isRegistrationErrorCode(value: unknown): value is RegistrationErrorCode {
  return typeof value === "string" && value in registrationErrorMessages;
}
