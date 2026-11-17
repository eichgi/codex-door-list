# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Organizadores de eventos pequeños y medianos que necesitan crear, publicar y administrar sus eventos. Las personas asistentes consultan el enlace público de un evento para registrarse una sola vez y obtener su entrada.

## Product Purpose

Dool Fest permite registrar eventos y asistentes de forma ágil. Su objetivo es que las personas organizadoras puedan preparar y gestionar registros con facilidad, y que la validación de entradas durante el evento sea rápida.

## Positioning

Una plataforma operativa para crear eventos y facilitar tanto el registro público como el check-in rápido mediante entradas digitales.

## Operating Context

Las personas organizadoras configuran eventos, aforo y tipos de entrada desde un panel autenticado. Publican un enlace de registro para asistentes; cada asistente se registra una vez, recibe una entrada digital con código QR y la presenta en el acceso al evento.

## Capabilities and Constraints

- Panel autenticado para que cada organizador gestione únicamente sus eventos, tipos de entrada y registros.
- Registro público sin sesión para eventos publicados y vigentes, con validación de cupo y un registro por correo y evento.
- Emisión de una entrada digital única con código QR y estados válida, utilizada o revocada.
- Envío de la entrada por correo mediante Resend.
- Persistencia y autenticación mediante Supabase, con RLS aplicado.
- La suma de los aforos de los tipos de entrada no puede superar el aforo del evento, incluso ante solicitudes simultáneas.

## Brand Commitments

La experiencia debe ser directa y operativa. La interfaz no debe incluir decoración que interfiera con el trabajo de registro ni con la rapidez requerida en la entrada al evento.

## Evidence on Hand

- Implementación actual de panel de organizador, catálogo público, registro, entradas QR y panel de métricas.
- Datos de eventos, tipos de entrada, registros y entradas en Supabase.
- Integración de correo transaccional con Resend.
- No hay testimonios, estudios de caso, métricas comerciales ni activos de marca confirmados; no deben inventarse.

## Product Principles

1. Reducir el esfuerzo de crear y publicar un evento.
2. Hacer que el registro de asistentes sea claro y se complete una sola vez.
3. Priorizar la velocidad y la claridad en la operación de acceso.
4. Mantener la información de aforo y entradas confiable en todo momento.
5. Evitar elementos que distraigan de las tareas operativas.
