He seguido patrones consistentes con el código existente, pero no existe una convención formal documentada. Algunas decisiones fueron pragmáticas y quedaron inconsistencias técnicas.

Convenciones actuales:

- Rutas públicas en español: eventos, entradas, organizador, acceso.
- Segmentos dinámicos en camelCase: [eventId]; tokens simples como [code].
- Código TypeScript en inglés: PublicTicket, RegistrationState, sendTicketEmail.
- Base de datos en snake_case: ticket_sales, buyer_email, register_for_event.
- Código reutilizable bajo lib/, agrupado por dominio: lib/email, lib/events, lib/supabase.
- Server Actions junto a su ruta en actions.ts.
- Tipos específicos de una pantalla junto a la ruta en types.ts.
- Estados de rutas mediante convenciones de App Router: loading.tsx, error.tsx y not-found.tsx.
- Errores esperados de formularios se devuelven como estado; fallos inesperados se lanzan para que los capture error.tsx.
- Validaciones críticas se repiten en cliente/servidor y se garantizan definitivamente en PostgreSQL.

Inconsistencias pendientes:

- app/organizador/page.tsx es monolítico, mientras las rutas nuevas están divididas en componentes, acciones y tipos.
- Algunos tipos de entrada/evento están definidos localmente en varias páginas en vez de compartir un modelo.
- Los códigos de error de PostgreSQL se interpretan con error.message.includes(...); funcionaría mejor una capa tipada y centralizada.
- El formato de fecha se repite en varias partes.
- El estilo mezcla Tailwind con clases globales heredadas.
- No hay pruebas automatizadas ni una guía de convenciones.
- El envío de correo es síncrono y de mejor esfuerzo; no existe outbox ni reintento persistente.

En resumen: no fue completamente “sobre la marcha”, porque seguí las convenciones del repositorio y de App Router, pero tampoco hay todavía una arquitectura formal y totalmente uniforme. Antes de que el proyecto crezca mucho, convendría documentar estas reglas y centralizar tipos, fechas y errores.


Sí hay inconsistencias reales. Ninguna rompe actualmente el flujo principal, pero sí representan deuda técnica.

- Mezcla de idiomas. Las rutas y textos están en español (/eventos, /entradas, /organizador), mientras componentes y funciones usan inglés (PublicTicketPage, RegistrationForm, sendTicketEmail). La base de datos usa inglés y snake_case.
- Estructuras diferentes por pantalla. app/organizador/page.tsx concentra consulta, autenticación y prácticamente toda la interfaz en un solo archivo. En cambio, el registro está dividido entre page.tsx, registration-form.tsx, actions.ts y types.ts.
- Tipos duplicados. La forma de una entrada aparece como PublicTicket en la página y como TicketEmailData en el correo. Los eventos también tienen distintas definiciones locales. Si cambia un campo, hay que recordar modificar varios lugares.
- Formateo de fechas repetido. La configuración es-MX y America/Mexico_City aparece en la landing, página del evento, página de entrada y correo.
- Regla de vigencia duplicada. La comparación por fecha de CDMX existe en:
  - Políticas RLS.
  - Funciones SQL.
  - lib/events/registration-is-open.ts.

  Esto es defensivo, pero no hay pruebas que garanticen que todas las implementaciones permanezcan equivalentes.
- Errores de base de datos interpretados como texto. La acción usa expresiones como:

  error.message.includes("EMAIL_ALREADY_REGISTERED")

  Es frágil: un cambio en PostgreSQL, Supabase o el mensaje puede romper el mapeo.
- Estrategias de error diferentes. Las páginas lanzan excepciones, el formulario devuelve estados tipados y el correo captura el error y continúa. Además, existe error.tsx en las rutas de registro y entrada, pero no en la landing raíz.
- Acceso público inconsistente. La landing consulta directamente events, mientras la página de registro usa una función RPC. Ambas opciones son válidas, pero no hay una regla arquitectónica que indique cuándo debe usarse cada una.
- Validaciones duplicadas sin esquema compartido. Nombre y correo se validan mediante atributos HTML, regex en TypeScript y regex en PostgreSQL. No hay Zod u otra definición reutilizable.
- Estilos mezclados. Las páginas públicas usan principalmente Tailwind, mientras el panel usa clases globales como .dashboard, .event-card y .grid-form. Incluso la página de entrada utiliza .ticket-label desde CSS global dentro de una pantalla basada en Tailwind.
- Metadata desactualizada conceptualmente. app/layout.tsx todavía describe “Dool Fest 2026” como un evento concreto, pero / ahora es un catálogo de múltiples eventos.
- Correo sin estado persistente. Si Resend falla, la entrada queda creada y se informa al usuario, pero la base de datos no guarda que el correo falló. No hay reintento ni forma administrativa de reenviarlo.
- No hay pruebas automatizadas. Las validaciones se hicieron mediante TypeScript, lint, build y pruebas manuales puntuales. Las condiciones de concurrencia, RLS, duplicados y zonas horarias dependen principalmente del diseño SQL, no de una suite reproducible.

Mi evaluación honesta: el código es funcional y razonablemente seguro para el alcance actual, pero la organización todavía parece la de un proyecto que creció por funcionalidades sucesivas. Antes de añadir escaneo, reenvíos, administración de tickets o más páginas públicas, convendría hacer una refactorización pequeña para centralizar tipos, fechas, errores y acceso a datos.