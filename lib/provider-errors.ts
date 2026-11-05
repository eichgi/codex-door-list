type ProviderError = { message: string };

export function logProviderError(context: string, error: ProviderError) {
  console.error(`${context}:`, error.message);
}

export const providerErrorMessages = {
  signIn: "No pudimos iniciar sesión. Verifica tus credenciales e intenta nuevamente.",
  signUp: "No pudimos crear la cuenta. Verifica los datos e intenta nuevamente.",
  loadOrganizer: "No fue posible cargar la información del organizador.",
  createEvent: "No fue posible crear el evento.",
  updateEvent: "No fue posible guardar el evento.",
  deleteEvent: "No fue posible eliminar el evento.",
  createTicketType: "No fue posible crear el tipo de entrada.",
  updateTicketType: "No fue posible guardar el tipo de entrada.",
  deleteTicketType: "No fue posible eliminar el tipo de entrada.",
  createRegistration: "No fue posible crear la inscripción.",
  updateRegistration: "No fue posible guardar la inscripción.",
  deleteRegistration: "No fue posible eliminar la inscripción.",
} as const;
