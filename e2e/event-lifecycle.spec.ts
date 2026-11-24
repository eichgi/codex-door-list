import { expect, test, type Page } from "@playwright/test";

const organizerEmail = process.env.E2E_ORGANIZER_EMAIL;
const organizerPassword = process.env.E2E_ORGANIZER_PASSWORD;
const attendeeEmail = process.env.E2E_ATTENDEE_EMAIL;
const missingE2eConfiguration =
  !organizerEmail || !organizerPassword || !attendeeEmail;

test.skip(
  missingE2eConfiguration,
  "Configura E2E_ORGANIZER_EMAIL, E2E_ORGANIZER_PASSWORD y E2E_ATTENDEE_EMAIL.",
);

async function signIn(page: Page) {
  await page.goto("/acceso?next=/organizador");
  await page.getByLabel("Correo", { exact: true }).fill(organizerEmail!);
  await page.getByLabel("Contraseña", { exact: true }).fill(organizerPassword!);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/organizador$/);
  await expect(
    page.getByRole("heading", { name: "Eventos e inscripciones" }),
  ).toBeVisible();
}

test("publica un evento, registra y entrega una entrada, y registra su acceso", async ({
  browser,
  page,
}) => {
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const eventTitle = `Evento E2E ${runId}`;
  const ticketTypeName = `General E2E ${runId}`;
  const attendeeName = `Asistente E2E ${runId}`;
  const eventStartsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);
  let eventCreated = false;

  await signIn(page);

  try {
    const createEventForm = page.getByRole("region", {
      name: "Crear evento",
    });
    await createEventForm.getByLabel("Nombre").fill(eventTitle);
    await createEventForm.getByLabel("Sede").fill("Sede de pruebas");
    await createEventForm.getByLabel("Fecha y hora").fill(eventStartsAt);
    await createEventForm.getByLabel("Aforo total").fill("10");
    await createEventForm
      .getByLabel("Descripción")
      .fill("Evento temporal creado por la prueba end-to-end.");
    await createEventForm.getByRole("button", { name: "Crear evento" }).click();

    const eventCard = page.locator("article").filter({ hasText: eventTitle });
    await expect(eventCard).toBeVisible();
    eventCreated = true;

    const ticketTypes = eventCard.getByRole("region", {
      name: "Tipos de entrada",
    });
    await ticketTypes.getByLabel("Nombre").first().fill(ticketTypeName);
    await ticketTypes.getByLabel("Aforo").first().fill("10");
    await ticketTypes.getByRole("button", { name: "Agregar tipo" }).click();
    await expect(ticketTypes.getByLabel("Nombre").last()).toHaveValue(
      ticketTypeName,
    );

    await eventCard.getByLabel("Estado").selectOption("published");
    await eventCard
      .getByRole("button", { name: "Guardar evento", exact: true })
      .click();

    const publicEventLink = eventCard.getByRole("link", {
      name: "Ver página pública",
    });
    await expect(publicEventLink).toBeVisible();
    const publicEventPath = await publicEventLink.getAttribute("href");
    expect(publicEventPath).toMatch(/^\/eventos\/[0-9a-f-]+\/registro$/);

    const attendeeContext = await browser.newContext();
    const attendeePage = await attendeeContext.newPage();

    try {
      await attendeePage.goto(publicEventPath!);
      await expect(
        attendeePage.getByRole("heading", { name: eventTitle }),
      ).toBeVisible();
      await attendeePage
        .getByLabel("Tipo de entrada")
        .selectOption({ label: `${ticketTypeName} · 10 disponibles` });
      await attendeePage.getByLabel("Nombre completo").fill(attendeeName);
      await attendeePage.getByLabel("Correo electrónico").fill(attendeeEmail!);

      const registrationResponsePromise = attendeePage.waitForResponse(
        (response) =>
          response.request().method() === "POST" &&
          /\/api\/eventos\/[0-9a-f-]+\/inscripciones$/.test(response.url()),
      );
      await attendeePage
        .getByRole("button", { name: "Confirmar registro" })
        .click();
      const registrationResponse = await registrationResponsePromise;
      expect(registrationResponse.status()).toBe(201);
      const registration = (await registrationResponse.json()) as {
        ticketCode: string;
        emailDelivery: "sent" | "failed";
      };
      expect(registration.ticketCode).toMatch(/^[0-9a-f]{64}$/);
      expect(registration.emailDelivery).toBe("sent");

      await expect(
        attendeePage.getByText("Te enviamos la entrada por correo."),
      ).toBeVisible();
      await attendeePage
        .getByRole("link", { name: "Ver mi entrada y código QR" })
        .click();
      await expect(attendeePage).toHaveURL(
        new RegExp(`/entradas/${registration.ticketCode}$`),
      );
      await expect(
        attendeePage.getByLabel("Código QR de la entrada"),
      ).toBeVisible();
      await expect(attendeePage.getByText("Válida", { exact: true })).toBeVisible();

      await page.goto("/scan");
      await page.getByLabel("Correo del asistente").fill(attendeeEmail!);
      await page.getByRole("button", { name: "Buscar entrada" }).click();
      await expect(page.getByText(attendeeName)).toBeVisible();
      await expect(page.getByText(eventTitle)).toBeVisible();
      await page.getByRole("button", { name: "Registrar entrada" }).click();
      await expect(
        page.getByText("Entrada registrada. La persona puede ingresar."),
      ).toBeVisible();

      await attendeePage.reload();
      await expect(
        attendeePage.getByText("Utilizada", { exact: true }),
      ).toBeVisible();
      await expect(
        attendeePage.getByLabel("Código QR de la entrada"),
      ).toHaveCount(0);
    } finally {
      await attendeeContext.close();
    }
  } finally {
    if (eventCreated) {
      await page.goto("/organizador");
      const eventCard = page.locator("article").filter({ hasText: eventTitle });
      if (await eventCard.isVisible()) {
        await eventCard.getByRole("button", { name: "Eliminar evento" }).click();
        await expect(eventCard).toHaveCount(0);
      }
    }
  }
});
