## Contexto
Asume que la versión instalada de Next.js puede diferir de lo que conoces y consulta su documentación oficial antes de escribir código de framework.
Usa Server Components por defecto.
Añade `"use client"` solo cuando exista una necesidad concreta de estado, efectos, eventos o API del navegador.

## Estructura
Coloca las rutas y sus archivos asociados en `app/`, la UI compartida en `components/`, la lógica y las utilidades compartidas en `lib/`, los clientes de Supabase en `lib/supabase/` y todo cambio de esquema en `supabase/migrations/`.
Mantén junto a su ruta todo componente usado por una sola ruta y mueve a `components/` todo componente usado por dos o más rutas.

## Vocabulario
Usa `Event` únicamente para un evento.
Usa `TicketType` únicamente para un tipo de entrada disponible para un evento.
Usa `Ticket` únicamente para la entrada emitida a un asistente.
Usa `Registration` únicamente para la inscripción de un asistente a un evento.
Evita usar `Event`, `TicketType`, `Ticket` y `Registration` como sinónimos entre sí.
Nombra las tablas en plural y `snake_case`, conforme a su entidad; por ejemplo, `ticket_types` para `TicketType`.

## Idioma
Escribe el código, los identificadores y los tipos en inglés, y el texto visible de la interfaz en español.
Nombra en español los segmentos de las rutas públicas y en inglés los componentes que las sirven.

## Casing
Limita `snake_case` a la capa de persistencia.
Define en `camelCase` todos los campos de request y response de las API.
Convierte explícitamente entre `snake_case` de persistencia y `camelCase` de aplicación en la frontera de datos.

## Fuente unica de verdad
Define en `lib/` los tipos compartidos por API, email y UI, e impórtalos desde allí en vez de redefinirlos por archivo.
Define en `lib/` los helpers compartidos de fecha y formato, e impórtalos desde allí en vez de copiarlos entre pantallas.

## Errores
Devuelve todo error de API como JSON con la forma `{ error: string }`.
Responde a cada error de negocio con su código HTTP real y nunca con `200`.
Comprueba `response.ok` en el cliente antes de interpretar el cuerpo de la respuesta.
Transforma los errores de proveedores en mensajes de interfaz controlados y evita mostrar en la UI mensajes crudos de Supabase, Resend o cualquier otro proveedor.

## Base de datos
Crea un archivo de migración versionado para cada cambio de base de datos.
Evita ejecutar o documentar SQL suelto fuera de `supabase/migrations/`.
Activa RLS en toda tabla expuesta y define políticas RLS explícitas para cada operación permitida.
