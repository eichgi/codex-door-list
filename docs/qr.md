# Generación y lectura de códigos QR

## Objetivo

Generar en el servidor el código QR de cada `Ticket` y leerlo desde la cámara del navegador para validar el acceso a un `Event`.

Estas recomendaciones se revisaron el 23 de noviembre de 2026 contra la documentación oficial recuperada mediante Context7. El proyecto utiliza Next.js 16.4.3, React 19.3.0 y `qrcode` 1.5.4.

## Decisión recomendada

- Mantener `qrcode` para generar un SVG en el servidor.
- Usar `@zxing/browser` para leer códigos QR desde la cámara.
- Mantener la generación dentro de un Server Component.
- Encapsular el lector en un componente con `"use client"`, porque necesita cámara, referencias al DOM, efectos y eventos.
- Considerar el valor leído como una entrada no confiable y validarlo siempre en el servidor.

## Generación en el servidor

### Opción 1: `qrcode` (`node-qrcode`)

Ventajas:

- Puede producir SVG, PNG, buffers, archivos y Data URL.
- Permite configurar margen, tamaño, colores y nivel de corrección de errores.
- Ya está instalada y se utiliza en `app/entradas/[code]/page.tsx`.
- La documentación confirma que `toString(text, { type: "svg" })` devuelve el SVG como una cadena en el servidor.
- El mismo generador puede reutilizarse posteriormente en emails, descargas o Route Handlers.

Consideraciones:

- El SVG se inserta como markup. El contenido codificado y las opciones deben permanecer controlados por la aplicación.
- No conviene importar rutas internas del paquete, como sus renderers privados; debe usarse su API pública.

### Opción 2: generador SVG como componente React

Context7 también identifica una alternativa orientada a React y React Native que genera SVG puro sin dependencias.

Ventajas:

- Representación declarativa como componente.
- SVG adaptable y nítido sin necesidad de un canvas.

Desventajas:

- Acopla la generación a React.
- Aporta menos flexibilidad para generar adjuntos, archivos, buffers o respuestas desde endpoints.
- Añadiría otra dependencia sin resolver una carencia del código actual.
- Su principal enfoque es React/React Native, mientras que `node-qrcode` documenta explícitamente sus renderers y API de servidor.

### Recomendación

Mantener `qrcode`. Ya satisface el caso de uso, tiene una API de servidor documentada y evita una migración sin beneficio funcional.

La configuración actual es apropiada:

```ts
const qrSvg = await QRCode.toString(ticket.code, {
  type: "svg",
  errorCorrectionLevel: "M",
  margin: 2,
  width: 280,
  color: {
    dark: "#071226",
    light: "#ffffff",
  },
});
```

Se prefiere SVG frente a PNG para la página de la entrada porque pesa poco, responde bien a diferentes tamaños de pantalla y conserva nitidez al imprimir.

El QR debe contener únicamente un código opaco e impredecible. No debe incluir el nombre, correo u otros datos personales del asistente. El código actual de 64 caracteres hexadecimales cumple la separación entre identificador presentado y datos del `Ticket`, siempre que haya sido generado con entropía criptográfica suficiente.

## Lectura desde la cámara

### Opción 1: `@zxing/browser`

Ventajas:

- Proporciona `BrowserQRCodeReader`, especializado en QR.
- Lee continuamente desde un elemento `<video>`.
- `decodeFromVideoDevice` puede elegir un dispositivo concreto.
- `decodeFromConstraints` permite solicitar la cámara trasera con `facingMode: "environment"`.
- Devuelve controles con un método `stop()` para detener el escaneo y liberar la sesión.
- Permite construir una interfaz consistente con el resto de la aplicación.

Desventajas:

- Hay que implementar la interfaz, los estados, los mensajes de permisos y el manejo de errores.
- Las funciones de linterna se documentan como experimentales y no deben ser un requisito esencial.

### Opción 2: `html5-qrcode`

Ventajas:

- Incluye una interfaz de escaneo preconstruida mediante `Html5QrcodeScanner`.
- También ofrece `Html5Qrcode` como API de menor nivel.
- Puede limitar el lector a `Html5QrcodeSupportedFormats.QR_CODE`.
- Permite configurar frecuencia de lectura y el área de escaneo.
- La interfaz preconstruida puede limitarse a cámara con `supportedScanTypes`.

Desventajas:

- La interfaz incorporada es más difícil de adaptar al sistema visual del proyecto.
- Su API y ciclo de vida son imperativos y requieren limpieza cuidadosa al desmontar un componente React.
- La UI preconstruida puede duplicar controles, textos y estados que la aplicación necesita controlar en español.

### Recomendación

Usar `@zxing/browser`. En este proyecto importa más controlar el flujo de validación, los mensajes y la presentación que disponer de un widget genérico. Su controlador explícito encaja bien con la limpieza de un efecto de React.

Ejemplo conceptual del ciclo de vida:

```ts
const reader = new BrowserQRCodeReader();

const controls = await reader.decodeFromConstraints(
  { video: { facingMode: "environment" } },
  videoElement,
  (result) => {
    if (!result) return;

    const code = result.getText();
    controls.stop();
    // Enviar `code` al servidor para validarlo y marcar el Ticket.
  },
);

// Limpieza al desmontar el componente.
controls.stop();
```

El código definitivo debe contemplar que el componente puede desmontarse antes de que la promesa de inicio termine. La limpieza debe detener tanto los controles resueltos como cualquier pista de cámara que haya quedado activa.

## Arquitectura propuesta

1. `app/entradas/[code]/page.tsx` consulta el `Ticket` y genera su QR mediante `qrcode` en el servidor.
2. Una ruta privada del organizador aloja un componente cliente dedicado al escaneo, por ejemplo `app/dashboard/[eventId]/escanear/ticket-scanner.tsx`.
3. El componente solicita la cámara únicamente después de una acción clara del usuario.
4. Al detectar un código, detiene o pausa el lector para evitar solicitudes duplicadas.
5. Envía al servidor un request con campos en `camelCase`, por ejemplo `{ code }`.
6. El servidor valida el formato, el `Event`, el estado y la pertenencia del `Ticket`.
7. Una operación atómica marca el `Ticket` como utilizado y devuelve el resultado real de negocio.
8. La interfaz muestra un mensaje controlado y permite reanudar el lector para la siguiente entrada.

## Validación y seguridad

- Decodificar un QR no demuestra que el `Ticket` sea válido.
- No debe confiarse en un estado de validez incluido dentro del QR.
- La validación y el cambio de estado deben ejecutarse en el servidor.
- La operación de canje debe ser atómica para impedir que dos dispositivos acepten el mismo `Ticket` simultáneamente.
- La API debe comprobar que el organizador autenticado tiene acceso al `Event` correspondiente.
- Debe validarse el patrón del código antes de consultar la base de datos.
- Deben aplicarse límites de frecuencia razonables al endpoint de validación.
- No deben mostrarse mensajes crudos de Supabase ni de la librería de cámara.
- Los errores de API deben responder como JSON con la forma `{ error: string }` y con su código HTTP real.
- El cliente debe comprobar `response.ok` antes de interpretar una respuesta exitosa.
- La cámara requiere un contexto seguro, normalmente HTTPS, salvo durante el desarrollo en `localhost`.

## Estados de interfaz recomendados

- Cámara sin iniciar.
- Solicitando permiso.
- Escaneando.
- Validando la entrada.
- Entrada válida y registrada.
- Entrada ya utilizada.
- Entrada revocada.
- Entrada inexistente o con formato inválido.
- Entrada perteneciente a otro evento.
- Permiso de cámara denegado.
- Cámara no disponible.
- Error controlado de red o servidor.

Mientras una validación esté en curso, deben ignorarse lecturas repetidas. Después de mostrar el resultado, el operador debe disponer de una acción clara para escanear la siguiente entrada.

## Accesibilidad y operación

- Proporcionar un campo manual para el código de respaldo cuando la cámara no funcione.
- No comunicar el resultado únicamente mediante color; incluir icono, título y descripción.
- Anunciar el resultado con una región de estado accesible.
- Mantener visible qué cámara está activa cuando exista más de una.
- Conservar un botón explícito para detener la cámara.
- Mostrar instrucciones breves para alinear el QR y mejorar la iluminación.
- No depender de la linterna, porque su soporte es experimental y varía por navegador.

## Fuentes consultadas mediante Context7

- `/soldair/node-qrcode`: API de servidor, renderer SVG, opciones de margen, tamaño, color, corrección de errores y Data URL.
- `/zxing-js/browser`: `BrowserQRCodeReader`, `decodeFromVideoDevice`, `decodeFromConstraints` e `IScannerControls.stop()`.
- `/mebjas/html5-qrcode`: `Html5Qrcode`, lectura exclusiva de QR, configuración de cámara, área de lectura y tipos de escaneo.

