# Dool Fest

Panel para organizadores con autenticación de Supabase, CRUD de eventos, tipos de entrada y ventas.

## Configuración

1. Copia `.env.example` como `.env.local` y configura la URL y la Publishable Key de tu proyecto de Supabase.
2. Aplica, en orden, todas las migraciones de `supabase/migrations/` a tu proyecto de Supabase.
3. En Supabase Auth, habilita el proveedor de correo y configura la URL de redirección de tu entorno si usas confirmación de correo.

La migración aplica RLS: una persona autenticada sólo puede consultar y modificar sus propios eventos, sus tipos de entrada y sus ventas.

La suma de aforos de los tipos de entrada no puede superar el aforo del evento. Esta regla se aplica en la interfaz y mediante triggers en PostgreSQL, incluso ante solicitudes simultáneas. Tampoco se permiten ventas que excedan el aforo de su tipo de entrada.

Cada evento publicado y vigente tiene una página pública en `/eventos/{id}/registro`. El registro no requiere sesión, acepta eventos durante todo el día de su fecha y vuelve a validar tanto la vigencia como el cupo dentro de una transacción antes de guardar los datos del asistente. Un mismo correo solo puede registrarse una vez por evento, aunque seleccione otro tipo de entrada.

Cada registro confirmado emite una única entrada con estado `valid`, `used` o `revoked`. Su página se encuentra en `/entradas/{codigo}` y solo puede consultarse con el código aleatorio completo de 256 bits; no existe un catálogo público de entradas.

Al confirmar un registro, la entrada también se envía al correo del asistente mediante Resend. El mensaje incluye los datos del evento, el código y el QR embebido. Configura `RESEND_API_KEY` y `RESEND_FROM_EMAIL`; el remitente debe pertenecer a un dominio verificado en Resend.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
