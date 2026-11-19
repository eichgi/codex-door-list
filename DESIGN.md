---
name: Dool Fest
description: Sistema operativo para registrar eventos y validar entradas con rapidez.
colors:
  night: "#020617"
  panel: "#0f172a"
  panel-legacy: "#0e1d35"
  scan-surface: "#ffffff"
  slate-800: "#1e293b"
  signal-sky: "#7dd3fc"
  signal-sky-light: "#bae6fd"
  primary-text: "#f8fafc"
  secondary-text: "#cbd5e1"
  muted-text: "#94a3b8"
  quiet-text: "#64748b"
  divider: "#294365"
  danger: "#7f1d1d"
  success: "#34d399"
  warning: "#fbbf24"
typography:
  display:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.2em"
rounded:
  control: "0.75rem"
  inset: "1rem"
  surface: "1.5rem"
  pill: "9999px"
spacing:
  compact: "0.5rem"
  control: "0.75rem"
  standard: "1.25rem"
  section: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.signal-sky}"
    textColor: "{colors.night}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.signal-sky-light}"
  button-secondary:
    backgroundColor: "{colors.slate-800}"
    textColor: "{colors.primary-text}"
    rounded: "{rounded.control}"
    padding: "0.625rem 1rem"
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.primary-text}"
    rounded: "{rounded.surface}"
    padding: "1.5rem"
  input:
    backgroundColor: "{colors.night}"
    textColor: "{colors.primary-text}"
    rounded: "{rounded.control}"
    padding: "0.625rem 0.75rem"
---

# Design System: Dool Fest

## Overview

**Creative North Star: "La cabina de operaciones"**

Dool Fest se comporta como un espacio de control nocturno para organizar eventos: sobrio, concentrado y fácil de escanear. La energía propia de un evento aparece como señalización celeste puntual, no como decoración; guía acciones, estados y enlaces sin competir con los datos operativos.

La interfaz deja un aire moderado entre bloques para facilitar la lectura, pero conserva formularios, tarjetas y métricas compactos. La velocidad de registro y de validación en acceso prevalece sobre cualquier tratamiento ornamental.

**Key Characteristics:**

- Superficies azul-marino profundas con capas tonales y contraste alto.
- Celeste de señal reservado para acciones, enlaces, foco y etiquetas operativas.
- Tipografía sans serif directa, con títulos contundentes y etiquetas compactas en mayúsculas.
- Tarjetas grandes, bordes discretos y sombras contenidas para separar bloques.
- Ritmo espaciado que permite escaneo rápido sin saturar la pantalla.

## Colors

La paleta usa una base nocturna de slate con un único acento frío, pensado como señal funcional y no como relleno decorativo.

### Primary

- **Celeste de señal** (`#7dd3fc`): acción principal, enlaces operativos, anillos de foco y etiquetas de contexto.
- **Celeste de señal claro** (`#bae6fd`): estado hover de la acción principal y enlaces secundarios legibles.

### Neutral

- **Noche operativa** (`#020617`): fondo principal de las superficies de aplicación.
- **Panel profundo** (`#0f172a`): tarjetas, contenedores y capas elevadas actuales.
- **Panel profundo heredado** (`#0e1d35`): superficies del flujo de acceso y estilos globales existentes.
- **Superficie de escaneo** (`#ffffff`): fondo de alto contraste, exclusivo para códigos QR y códigos que deban leerse mediante cámara.
- **Pizarra secundaria** (`#1e293b`): controles secundarios y pistas de progreso.
- **Texto principal** (`#f8fafc`): contenido de máxima prioridad sobre fondos oscuros.
- **Texto secundario** (`#cbd5e1`), **texto atenuado** (`#94a3b8`) y **texto quieto** (`#64748b`): niveles descendentes de apoyo, metadatos y contexto.
- **Divisor estructural** (`#294365`): bordes de los estilos globales heredados; en componentes actuales se usa blanco translúcido con la misma función.

### State Colors

- **Peligro** (`#7f1d1d`): eliminación, errores y avisos críticos.
- **Éxito** (`#34d399`): entrada válida y confirmaciones positivas.
- **Advertencia** (`#fbbf24`): entrada utilizada o atención no crítica.

### Named Rules

**La regla de la señal.** El celeste se usa para orientar una acción o confirmar una prioridad; no se convierte en fondo dominante de una pantalla.

## Typography

**Display Font:** Arial, con Helvetica y sans-serif como fallback.
**Body Font:** Arial, con Helvetica y sans-serif como fallback.

**Character:** una sans serif funcional y familiar mantiene el trabajo legible bajo presión. El peso bold y el tracking ajustado jerarquizan los títulos; las etiquetas usan mayúsculas y espaciado amplio para clasificar sin añadir ruido.

### Hierarchy

- **Display** (700, hasta `3.75rem`, `1`): titular principal del catálogo público en pantallas amplias.
- **Headline** (700, hasta `3rem`, `1`): títulos de páginas y eventos.
- **Title** (700, `1.5rem`, `1.2`): nombres de tarjetas, secciones y estados vacíos.
- **Body** (400, `1rem`, `1.75`): explicación y contenido de lectura; las introducciones pueden subir a `1.125rem`.
- **Label** (700, `0.75rem`, tracking entre `0.14em` y `0.22em`, mayúsculas): clasificación de paneles, metadatos y estados.

### Named Rules

**La regla del escaneo.** Usa títulos cortos y pesos altos para decisiones; usa texto atenuado para contexto, nunca para información crítica.

## Layout

El contenedor principal se limita a `max-w-6xl`; los estilos globales heredados usan hasta `1200px`. El contenido parte de un padding de `1.25rem` en móvil y crece a `2rem` en pantallas medianas. La estructura se apila por defecto y activa grids de dos columnas en `md` o `lg` cuando el contexto permite comparar o completar información en paralelo.

El ritmo habitual es de `1.25rem` dentro de bloques, `1.5rem` entre tarjetas cercanas y `3rem` entre secciones. En móvil, formularios y controles en línea se convierten en una columna, manteniendo objetivos táctiles claros y lectura continua.

## Elevation & Depth

La profundidad es tonal por defecto: fondo noche, panel profundo y paneles blancos translúcidos crean separación sin volumen excesivo. Los bordes blancos al 10–15% de opacidad delimitan la mayoría de las superficies; los estilos globales heredados usan `#294365`. Las tarjetas destacadas pueden usar sombras amplias y suaves (`shadow-2xl`, a veces teñida de azul) para aislar una tarea, mientras que los estados hover añaden un desplazamiento vertical mínimo.

### Shadow Vocabulary

- **Sombra de contenedor heredado** (`0 20px 50px rgb(0 0 0 / .2)`): aislamiento de tarjetas de acceso, paneles y eventos en los estilos globales.
- **Sombra de tarjeta destacada** (`shadow-2xl`): refuerza tarjetas navegables y superficies públicas; no sustituye los bordes ni el contraste de contenido.

### Named Rules

**La regla de capas tranquilas.** La elevación separa tareas; no se usa para hacer que todos los componentes pidan atención.

## Shapes

Los controles usan esquinas de `0.75rem` (`rounded-xl`); los paneles internos, `1rem` (`rounded-2xl`); y las tarjetas principales, `1.5rem` (`rounded-3xl`). Las etiquetas de estado usan píldoras completas. Los bordes son finos y de bajo contraste, y las barras de avance usan extremos redondeados para conservar continuidad visual.

## Components

### Buttons

- **Character:** acciones inmediatas y inequívocas.
- **Shape:** radio de `0.75rem` (`rounded-xl`) y peso bold.
- **Primary:** celeste de señal con texto noche; padding usual de `0.75rem 1.25rem`.
- **Hover / Focus:** hover en celeste claro; foco visible con anillo celeste y offset oscuro.
- **Secondary:** pizarra secundaria con texto slate claro; se usa para navegación o cierre de sesión.
- **Destructive:** rojo oscuro con texto rojo claro; reservado para acciones irreversibles.

### Cards / Containers

- **Character:** unidades operativas con información agrupada y escaneable.
- **Corner Style:** `1.5rem` en superficies principales; `1rem` en datos agrupados dentro de una tarjeta.
- **Background:** panel profundo, normalmente con opacidad entre 85% y 90%, o blanco al 5% para un subnivel.
- **Border:** blanco al 10% en el sistema actual; los estilos globales heredados usan `#294365`.
- **Internal Padding:** entre `1.25rem` y `2rem`, según importancia y tamaño de pantalla.

### Inputs / Fields

- **Style:** fondo noche, borde fino de bajo contraste, texto blanco y esquinas de `0.75rem`.
- **Focus:** el borde y el anillo pasan a celeste de señal; el offset se mantiene noche para no romper la superficie.
- **Grouping:** etiquetas slate claro sobre el campo, con separación compacta y grids responsivos.

### Status Labels

- **Style:** etiqueta pequeña en mayúsculas o píldora con borde y fondo translúcidos.
- **Valid:** verde suave sobre fondo verde translúcido.
- **Used:** ámbar suave sobre fondo ámbar translúcido.
- **Revoked / Error:** rojo claro sobre fondo rojo translúcido.

### Navigation

- **Style:** enlaces de texto bold en celeste de señal; navegación de panel en botones secundarios o contornos sutiles.
- **Responsive behavior:** encabezados se apilan en móvil; las acciones se conservan visibles y pueden envolver en varias líneas.

### Empty States

- **Style:** contenedor `rounded-3xl`, borde discontinuo y fondo blanco translúcido al 5%.
- **Content:** título directo, descripción breve en texto atenuado y una sola acción primaria cuando desbloquea la siguiente tarea.

## Do's and Don'ts

### Do:

- **Do** usa el celeste de señal para indicar una decisión, acción o foco, especialmente sobre fondos noche.
- **Do** conserva tarjetas compactas con padding suficiente (`1.25rem` a `2rem`) para que los datos se escaneen con rapidez.
- **Do** organiza los datos con títulos bold, etiquetas en mayúsculas y texto atenuado para el contexto.
- **Do** apila grids y acciones en móvil antes de reducir demasiado el tamaño de texto o los controles.
- **Do** usa rojo, verde y ámbar solo para estados con significado operativo.

### Don't:

- **Don't** llenar una superficie con celeste: su rareza comunica prioridad.
- **Don't** añadir decoración, ilustraciones o movimiento que ralentice el registro o el acceso al evento.
- **Don't** ocultar acciones críticas solo en hover ni depender del color como única señal de estado.
- **Don't** convertir cada panel en una tarjeta con sombra; usa capas tonales y bordes sutiles primero.
