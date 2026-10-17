# Quickstart de validación: Registro

Guía de validación de la implementación. Evidencia ejecutada y pendientes en
[el informe](../../docs/implementacion-002.md).
Consultar [spec](spec.md), [modelo](data-model.md) y [contratos](contracts/).

## Preparación

Node >=24.15.0 y npm compatible, navegador actual y mismo origen durante las pruebas de recarga.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Configurar únicamente cuentas ficticias en .env.local si se desea catálogo inicial. Probar
además sin VITE_DEMO_USERS: las nuevas cuentas deben funcionar. HTTPS para desplegar y
fallback a index.html para rutas; localhost es el entorno de desarrollo.

## Pruebas automáticas propuestas (TDD)

Crear primero pruebas que fallen para cada cambio; luego implementar y refactorizar.
No guardar contraseñas ni cuentas en fixtures versionadas: generar datos ficticios en ejecución
según la política de seguridad existente. Los casos se nombran con FR, SC o historia.

- Dominio FR-002–006: vacíos, longitudes límite, dos palabras, acentos, espacios y confirmación.
- Aplicación/gateway FR-007–011: duplicados normalizados, contraseña incorrecta, cuenta local
  sin configuración, catálogo inválido y fallos de almacenamiento.
- Persistencia FR-017–018: revisión concurrente, aborto de commit, corrupción, versión
  desconocida y clave ausente. Fallo no elimina ni cambia cuentas anteriores.
- UI FR-001, 005–006, 012–016, 019, 021: foco, errores asociados, Enter/clic doble,
  modal independiente del checkbox, avisos y navegación sin PII.
- Regresión Login: cuentas iniciales, nombre, rechazo genérico, campos tras fallo,
  logout y proveedores existentes. Axe en formulario/modal/éxito.

```bash
npm test
npm run test:coverage
npm run verify
```

verify incluye formato, lint, tipos, pruebas/cobertura, build, auditorías y secretos.
Cobertura mínima 80 % en líneas, ramas, funciones y sentencias. Auditorías requieren red.
Playwright se incorpora como dependencia de desarrollo conforme a research R7. Su versión,
licencia y vulnerabilidades se verificarán antes de integrar. La cobertura Vitest y la suite
E2E son controles complementarios.

## E2E automatizadas con Playwright

Los siguientes comandos ya están definidos en package.json para las pruebas implementadas.

```bash
npm ci
npx playwright install chromium
npm run test:e2e
npm run test:e2e:ui
```

En Linux/CI se podrá usar `npx playwright install --with-deps chromium` si faltan dependencias
del sistema; este paso puede requerir permisos administrativos. El modo UI permite observar
los clics, escritura y assertions. No requiere suscripción ni cuenta de un servicio cloud.

`test:e2e` construirá la aplicación y arrancará preview automáticamente con webServer,
en `http://127.0.0.1:4173` (empty) y `http://127.0.0.1:4174` (seeded), sin ejecutar dev
manualmente. Cada variante tendrá build separado y cada test tendrá un
contexto nuevo y datos ficticios generados en ejecución; la recarga conserva el mismo contexto.
Dos páginas del mismo contexto probarán concurrencia y reapertura con la misma cuenta.
No exportar storageState: puede contener material de la bóveda y no prueba su reapertura real.

La matriz obligatoria de escenarios figura en [plan.md](plan.md#pruebas-e2e-automatizadas--actualización-del-2026-10-17).
Crear primero los escenarios que fallen, con selectores por rol/etiqueta y esperas sobre estado
visible, sin retardos fijos ni mocks del gateway en el recorrido principal.

El entorno E2E debe definir explícitamente la configuración de semillas al construir, sin
heredar credenciales de .env.local. Ejecutar variantes separadas con catálogo vacío y catálogo
válido generado en runtime. Un cambio de variable tras el build no altera VITE_DEMO_USERS.

E2E obligatorias en verify junto a controles existentes. Traces, vídeo y capturas estarán
desactivados por defecto para no registrar credenciales. Resultados y reportes se ignoran en
Git y escaneo de secretos; registrar en la bitácora solo resumen, navegador, versión y estado.
Nunca marcar una prueba no ejecutada como aprobada.

## Recorridos en navegador real

1. Abrir /registro, crear cuenta ficticia válida y aceptar términos. Llegar a /login
   con «Cuenta creada correctamente. Ya puedes iniciar sesión» y campos vacíos.
2. Recargar: desaparece aviso; iniciar sesión con la cuenta nueva, comprobar nombre.
   Recargar bienvenida: termina acceso. Volver a entrar y cerrar sesión: cuenta permanece.
3. Probar contraseña errónea y correo desconocido; mismo error sin bienvenida.
4. Repetir alta con variantes del correo: rechazar, verificar credenciales originales.
   Repetir simultáneamente desde dos pestañas: una sola cuenta, sin altas perdidas.
5. Desactivar configuración inicial y repetir alta/login. Con configuración válida,
   comprobar que ambas fuentes autentican y reservan correos.
6. Inspeccionar IndexedDB: datos personales cifrados, sin contraseña legible ni confirmación;
   CryptoKey no extraíble. Verificar descifrado mediante adaptador en prueba, no en logs.
   Alterar una copia de la bóveda en un perfil de prueba: fallo explícito, sin reinicio.
7. Provocar rechazo de almacenamiento y fallo criptográfico con adaptadores de prueba;
   no redirigir ni anunciar éxito. Confirmar cuentas previas intactas.
8. Probar términos con Tab/Enter/Escape, cerrar y verificar retorno de foco; checkbox intacto.
   Google/Apple: alert exacto y formulario conservado. Navegar en ambos sentidos y atrás/adelante.
9. Comparar Figma a 1440×1024; revisar 320, 768, 1024 y 1920 px y transición 1023/1024.
   Sin scroll horizontal ni pérdida de estado; errores sin superposición. Revisar contraste,
   zoom, foco y anuncios con lector de pantalla, no solo axe.
10. Con datos preparados completar Registro y primer Login en menos de dos minutos (SC-009).

Registrar navegador, versión, viewport, resultados, diferencias visuales y correcciones.
Playwright automatizará los recorridos indicados en el plan sobre navegador real.
La revisión manual de Figma, contraste, lector de pantalla y tiempo de uso sigue siendo
necesaria; jsdom ni las E2E por sí solos acreditan todos esos criterios.

## Validación de los tres ajustes de integración

Comandos disponibles:

```bash
npm run typecheck:e2e
npm run test:e2e
npm run verify
```

`typecheck:e2e` comprueba playwright.config.ts, e2e/ y scripts de preparación con
`tsconfig.e2e.json`. Vitest excluye e2e; ninguna suite depende de los globals de la otra.
El lanzador de E2E genera builds `.tmp/e2e/empty/dist` y `.tmp/e2e/seeded/dist`, ejecuta
ambos proyectos y limpia procesos y archivos al terminar. Desactiva lectura dotenv y limpia
VITE_* heredadas antes de pasar el catálogo permitido. Nunca cargar .env.local personal.
Los artefactos efímeros y semillas no se versionan ni se imprimen. verify conserva build
de aplicación y verifica E2E de ambas variantes, además de tipos y controles existentes.

Casos adicionales obligatorios:

- Configuración undefined, válida, vacía explícita, JSON inválido y catálogo inválido:
  verificar la matriz del contrato de gateways sin borrar cuentas locales.
- Introducir una cuenta inicial con correo ya presente localmente: rechazar ese Login
  con indisponibilidad, conservar ambas fuentes y comprobar otra cuenta sin conflicto.
  Cubrir con prueba de contrato y E2E que prepare la bóveda en un contexto aislado.
- Apertura bloqueada: antes de 5000 ms continúa procesando; al vencer informa error y
  ofrece Reintentar. Liberar bloqueo y reintentar sin perder las cuentas previas.
- Éxito tardío de apertura vencida: no cambia UI ni inicializa datos, cierra conexión.
  Probar con reloj/dobles deterministas; complementar con bloqueo real en navegador.

## Verificación de correcciones de analyze

- Antes del gateway, ejecutar pruebas RED de duplicados y de toda la matriz de cuentas;
  no esperar a US2/US3 para probar comportamiento ya implementado en US1.
- typecheck:e2e debe incluir scripts/**/*.mjs con allowJs/checkJs, además de config y tests;
  introducir temporalmente un error de tipos en el lanzador durante la verificación para
  comprobar que se detecta y retirarlo antes de integrar.
- Reintentar invoca ensureAccountAvailability: ready conserva campos y habilita Crear cuenta,
  sin alta, sesión, mensaje de éxito ni navegación; verificar que no llama register/authenticate
  ni crea claves/fila. Fallo conserva datos y permite volver a intentarlo.
- Verificar historia 3.6 de spec: conflicto de identidad devuelve indisponibilidad genérica
  solo para ese correo y conserva las demás cuentas operativas. No sustituirlo por rechazo
  genérico de contraseña, ni elegir una fuente silenciosamente.

## Trazabilidad de ejecución

| Criterios | Evidencia implementada |
| --- | --- |
| FR-001–006, SC-002 | registrationValidation.test.ts, RegistrationForm.test.tsx, registration-errors.spec.ts. |
| FR-007–011, SC-001/003–005 | BrowserAccountGateway.test.ts, EncryptedAccountStore.test.ts, registration.spec.ts, login-registration.spec.ts, registration-persistence.spec.ts. |
| FR-012–013, FR-019, SC-008 | App.test.tsx y registration-navigation.spec.ts; aviso y sesión de memoria. |
| FR-014–016, FR-020, SC-006–007/011 | registration-responsive.spec.ts, TermsDialog.test.tsx, revisión visual; revisión manual completa pendiente. |
| FR-017–018, SC-010 | WebCryptoAccountProtection.test.ts, EncryptedAccountStore.test.ts y E2E de corrupción/bloqueo/concurrencia. |
| FR-021 | TermsDialog.test.tsx y registration-navigation.spec.ts; foco y Escape reales. |
| SC-009 | Recorrido móvil automatizado con CPU emulada; validación con persona/dispositivo real pendiente. |

Ver [informe](../../docs/implementacion-002.md) para resultados exactos, contraste y auditorías.
