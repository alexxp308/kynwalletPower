# Implementation Plan: Registro de Usuarios de KynWallet

**Branch**: `feature/registro-alexander-huerta` | **Date**: 2026-10-17 | **Spec**: [spec.md](spec.md)

**Feature**: `002-registro-usuarios`. El script de setup devuelve esta identidad como BRANCH;
la rama real se comprobó con Git. No se crea ni cambia de rama.

## Summary

Implementar Registro y ampliar Login para autenticar cuentas locales después de recargar.
Mantener React, TypeScript, CSS Modules y las capas existentes. Usar IndexedDB para una
bóveda cifrada con Web Crypto y verificadores de contraseña derivados con PBKDF2.
Conservar cuentas iniciales de configuración sin escribirlas en almacenamiento local.
El aviso de éxito y la sesión viven solo en memoria. Modal nativo de términos de demostración.

El usuario indicó que la especificación está lista para planificar. Las cuatro aclaraciones
integradas se respetan, al igual que los demás supuestos documentados. No se modifica el
histórico de especificación ni se inicia implementación con este plan.

## Technical Context

**Language/Version**: TypeScript ~5.9, React ~19.3; Node >=24.15.0 según package.json y .nvmrc (ajuste de implementación por engines existentes).
**Primary Dependencies**: React DOM, Vite ~8.3, Inter existente; CSS Modules. Sin nuevas dependencias de runtime.
**Storage**: IndexedDB nativo, bóveda AES-GCM-256 y CryptoKey no extraíble persistida;
PBKDF2-HMAC-SHA-256 con salt aleatorio por cuenta y 600000 iteraciones.
**Testing**: Vitest, Testing Library, jsdom, axe-core existentes; fake-indexeddb solo como doble unitario; contratos con dobles
inyectados; Playwright Test (`@playwright/test`) como dependencia de desarrollo para E2E
automatizadas en Chromium real, con IndexedDB y Web Crypto sin sustituir en el recorrido principal.
**Target Platform**: navegadores actuales con IndexedDB, Web Crypto y dialog;
HTTPS en despliegue, localhost en desarrollo. Sin degradación a texto plano.
**Project Type**: SPA solo cliente, demo sin operaciones financieras ni backend.
**Performance Goals**: recorrido SC-009 inferior a dos minutos con datos preparados;
medir derivación en dispositivo móvil, sin espera artificial de Registro. Mantener el
comportamiento de carga de Login 001. No bloquear UI con bucles criptográficos propios.
**Constraints**: nombre 1–80 y dos palabras; correo <=254; contraseña 8–128 sin recorte;
WCAG 2.1 AA; breakpoint 1024 px; desde 320 px sin scroll horizontal.
**Scale/Scope**: demo local de curso, dos pantallas y modal; sin sincronización ni migración
entre dispositivos. Bóveda completa adecuada para pocas cuentas ficticias, sin promesa masiva.

## Constitution Check

Gates evaluados antes de investigación y repetidos después del diseño:

| Principio | Antes | Después / evidencia de diseño |
| --- | --- | --- |
| I. TDD | Aplicable, sin código nuevo | Pruebas de comportamiento primero; matriz en quickstart. |
| II. SOLID | Capas existentes reutilizables | Casos de uso reciben puertos; infraestructura se compone en main.tsx. |
| III. Clean Architecture | Compatible | Dominio sin navegador; IndexedDB y CryptoKey solo en infraestructura. |
| IV. DRY/KISS/YAGNI | Compatible | Reutilizar validadores, controles, tokens; rutas nativas para dos pantallas. |
| V. Seguridad | Requiere decidir persistencia | Bóveda cifrada, verificador sin contraseña recuperable, fallos cerrados y eventos sin PII; límites en research. |
| VI. BRD/ARD | No identificados en documentos existentes | Spec 002 y constitución son referencias; revisar si aparecen otros documentos. |
| 7. Dependencias | Sin incorporaciones de runtime | Playwright como dependencia de desarrollo justificada en R7; fijar versión, lockfile y revisar licencia, mantenimiento y vulnerabilidades antes de integrar. |
| 8. Calidad | Verificaciones aún no ejecutadas | Cobertura Vitest >=80 % en cuatro métricas y E2E Playwright obligatorias, además de revisión manual de accesibilidad y contraste. |
| 9. Gobierno | Planificación autorizada por usuario | Trazabilidad FR/SC y revisión de PR; integración sujeta a controles y revisión independientes. |

Resultado de diseño: sin desviaciones nuevas deliberadas. Cifrado de registros no convierte
esta demo en autenticación segura para producción; no protege de XSS ni del propietario del
perfil. Las credenciales iniciales VITE ya expuestas en el bundle son un límite heredado,
no se amplían ni se presentan como un secreto protegido. Solo datos ficticios. La revisión
de seguridad de integración deberá verificar 5.3–5.4 y estos límites; no se declara aprobada.

## Project Structure

### Documentation (this feature)

```text
specs/002-registro-usuarios/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
└── contracts/
    ├── account-gateways.md
    ├── persistence.md
    └── ui-registration.md
```

`tasks.md` se generará posteriormente mediante speckit-tasks; no forma parte de esta ejecución.

### Source Code (repository root)

Estructura propuesta, todavía no implementada:

```text
src/
├── domain/registration.ts, registrationValidation.ts, messages.ts
├── application/registerAccount.ts, authenticate.ts
├── application/ports/RegistrationGateway.ts, AuthGateway.ts, SecurityEvents.ts
├── application/ports/AccountAvailabilityGateway.ts
├── application/ensureAccountAvailability.ts
├── infrastructure/BrowserAccountGateway.ts
├── infrastructure/EncryptedAccountStore.ts, WebCryptoAccountProtection.ts
├── infrastructure/loadDemoAccounts.ts, InMemoryAuthGateway.ts
├── ui/components/TermsDialog/
├── ui/features/registration/        # pantalla, formulario, reducer, hook y CSS Modules
├── ui/features/login/              # navegación y aviso efímero
├── ui/layout/BrandPanel/            # contenido parametrizable
├── ui/navigation/                  # pathname, pushState y popstate
├── ui/styles/                      # tokens accesibles existentes
├── App.tsx
└── main.tsx
```

Estructura adicional propuesta para las pruebas, aún no creada:

```text
playwright.config.ts
e2e/
├── registration.spec.ts
├── registration-errors.spec.ts
├── registration-navigation.spec.ts
├── registration-responsive.spec.ts
└── registration-persistence.spec.ts
```

Excluir `e2e/**` de Vitest y agregar `tsconfig.e2e.json` con comprobación explícita de
`playwright.config.ts`, `e2e/**/*.ts`, `scripts/**/*.ts` y `scripts/**/*.mjs` con
`allowJs: true` y `checkJs: true` para comprobar también el lanzador Node. El tsconfig actual
no incluye estos archivos. Agregar `typecheck:e2e` e incorporarlo a `verify`. Añadir scripts `test:e2e` y `test:e2e:ui` y ejecutar E2E como parte de
`npm run verify` después del build. Ignorar reportes y resultados en Git y en el escaneo de
secretos; nunca guardar storageState ni claves de la bóveda como artefactos.

**Structure Decision**: ampliar el proyecto único existente. Pruebas junto a sus módulos.
Mantener AuthGateway y AuthResult compatibles; agregar un puerto específico de Registro.
No usar Tailwind ni copiar coordenadas absolutas del código de Figma.

## Phase 0 — Research

Decisiones resueltas en [research.md](research.md): persistencia y concurrencia, integración
con cuentas iniciales, navegación efímera, reutilización, accesibilidad y estrategia de prueba.
No quedan marcadores NEEDS CLARIFICATION para el diseño aquí definido.

## Phase 1 — Design

[Modelo](data-model.md), [puertos](contracts/account-gateways.md),
[persistencia](contracts/persistence.md), [UI](contracts/ui-registration.md) y
[validación](quickstart.md) constituyen los artefactos del diseño.

Trazabilidad de cobertura propuesta:

| Requisitos | Diseño / verificación |
| --- | --- |
| FR-001–006, 016 | Validación de dominio; formulario y foco; SC-002. |
| FR-007–011, 017–018 | Gateway compuesto y bóveda; SC-001, 003–005, 010. |
| FR-012–013, 019 | Rutas, alert y estados solo en memoria; SC-005, 008. |
| FR-014–015, 020 | Layout, controles reutilizados, contraste y comparación MCP; SC-006, 007, 011. |
| FR-021 | Dialog accesible con cierre y restauración de foco; historia 4.5–4.6. |
| SC-009 | Recorrido manual cronometrado tras implementar. |

No se ejecutaron pruebas de producto ni auditorías como parte de la planificación.

## Pruebas E2E automatizadas — actualización del 2026-10-17

Petición del usuario incorporada mediante `speckit-plan`; ver [registro del comando](../../docs/prompts/002-plan-e2e.md).
Playwright local no requiere servicio cloud. La instalación se hará durante implementación,
con versión compatible con el Node utilizado, licencia y lockfile revisados.

- Chromium es el navegador requerido de la suite inicial; no se declara cobertura Firefox/WebKit.
- Ejecutar contra build de Vite servido por preview en orígenes fijos por variante, puertos estrictos (4173 y 4174).
  webServer gestiona preview; `test:e2e` construye antes y no reutiliza un servidor ajeno.
- Contexto limpio por test; conservarlo durante registro, recarga, nueva página y login.
  Para concurrencia abrir dos páginas del mismo contexto: comparten IndexedDB y origen.
- Crear datos ficticios únicos en ejecución, llenar por etiquetas, pulsar por roles accesibles
  y esperar resultados observables con assertions auto-reintentadas; no usar sleeps fijos.
- Ejecutar con configuración inicial ausente para el flujo principal y con catálogo inicial
  válido para integración. Vite incorpora variables al build: cada variante exige build y
  servidor propio, generando las semillas solo en ejecución y sin usar .env.local personal.
- Reports locales mínimos: sin traces, vídeos, screenshots ni estado persistido por defecto,
  porque las acciones de fill pueden registrar credenciales incluso si se generan en ejecución.
  Depuración interactiva opcional; no imprimir contraseñas ni subir artefactos sensibles.

| Escenario E2E requerido | Requisitos / resultado |
| --- | --- |
| Registro → login → recarga → acceso → logout | FR-008–011, 019; éxito exacto, cuenta persiste, aviso y sesión no. |
| Contraseña incorrecta / correo desconocido | FR-010; rechazo genérico sin bienvenida. |
| Duplicados y altas simultáneas | FR-007, 018; una sola cuenta por correo y credenciales originales intactas. |
| Formulario vacío y datos inválidos, corregir y enviar | FR-002–006, 016; errores inline, foco y Enter equivalente al clic. |
| Google/Apple y rutas directas | FR-012–013; capturar dialog alert exacto y aceptarlo; no perder formulario. |
| Modal con teclado | FR-015, 021; abrir/cerrar con Escape o botón, foco vuelve y casilla no cambia. |
| Responsive 320, 768, 1024, 1440, 1920 y transición 1023/1024 | FR-014, 020; marca visible según ancho, sin overflow ni pérdida de estado. |
| Corrupción controlada y ausencia de clave | FR-017–018; sin falso éxito ni borrado; preparar fallo en perfil aislado, no en datos del usuario. |
| Catálogo inicial y cuenta nueva | FR-007, 011; ambas autentican y sus correos quedan reservados. |

Persistencia/criptografía real se ejercitan en E2E; fallos de cuota y APIs denegadas también
se cubren con dobles de contrato deterministas. No reemplazar gateway ni almacenamiento
por mocks en el recorrido exitoso. La revisión humana de Figma, lector de pantalla y SC-009
permanece: una E2E verde no acredita por sí sola equivalencia visual o WCAG completa.

Gates reevaluados: compatible con principios I, IV, 7 y 8; nueva dependencia solo de pruebas,
justificada por validación de navegador real. Pruebas y auditorías pendientes de implementación.
En esta actualización E2E no cambiaron el modelo ni los contratos funcionales; los ajustes
posteriores de integración se documentan en la sección siguiente.

## Ajustes de integración confirmados — 2026-10-17

Aplicados mediante `speckit-plan`; [prompt registrado](../../docs/prompts/002-plan-ajustes-integracion.md).

### Configuración inicial y conflictos de identidad

Ampliar `loadDemoAccounts` con resultado discriminado `absent`, `valid(accounts)` o `invalid`.
Solo `undefined` representa ausencia; cadena vacía, JSON inválido, lista vacía o cuentas
inválidas se consideran configuración inválida, conservando la validación previa del catálogo.
Adaptar sus consumidores y pruebas; no continuar usando `null` para ambos estados.

- Ausente: altas permitidas y Login con cuentas locales; correo desconocido rechaza credenciales.
- Válida: comprobar ambas fuentes. Duplicados se rechazan en Registro sin sobrescribir.
- Inválida: impedir altas; una cuenta local íntegra puede acceder. Para correos no resueltos,
  responder `unavailable`.
- Si una configuración válida posterior contiene un correo ya existente localmente, el Login
  de ese correo devuelve `unavailable` con el mensaje genérico existente. No priorizar fuentes,
  ni probar ambas contraseñas, ni modificar registros. Otras cuentas sin conflicto funcionan.
  Registrar solo código estructurado de conflicto, sin correo. No se incluye migración automática.

### Apertura de IndexedDB y reintento

Límite de apertura: 5000 ms por intento, medido con temporizador inyectable en pruebas.
Una apertura bloqueada mantiene el estado de procesamiento hasta liberarse, fallar o agotar
ese límite. Al vencer: `unavailable`, mensaje genérico y acción «Reintentar»; nunca éxito ni
redirección. Reintentar abre una solicitud nueva y no envía el formulario automáticamente.

La API de apertura no se trata como cancelable: marcar solicitud vencida; si después llega
success, cerrar esa conexión sin publicar resultado. Si llega upgradeneeded tras vencer,
abortar su transacción. No ejecutar inicialización de bóveda desde un intento vencido.
Limpiar temporizadores/listeners y usar identidad por intento para ignorar respuestas antiguas.
No borrar bases ni claves. Los tres intentos máximos por conflicto de revisión siguen siendo
una política separada de esta apertura; un timeout nunca desencadena escrituras repetidas.

Reintentar se conecta mediante el puerto de aplicación `AccountAvailabilityGateway`, con
`ensureAvailable(): Promise<AvailabilityResult>` (`ready` o `unavailable`), y el caso de uso
`createEnsureAccountAvailability` inyectado en UI desde main.tsx. BrowserAccountGateway
implementa el puerto y delega apertura/validación en el almacén. No recibe credenciales,
no llama register/authenticate y no crea cuentas, claves ni fila de bóveda. Ausencia de fila
en base válida significa ready para un registro futuro, que realizará su inicialización.
Un resultado ready elimina el error de disponibilidad y habilita el envío manual, sin éxito
de registro ni navegación; unavailable conserva datos y permite otro reintento explícito.

### Variantes E2E y tipos

Diseñar un lanzador Node de pruebas que gestione ambas variantes y sus datos efímeros:

| Variante | Configuración | Build | Origen |
| --- | --- | --- | --- |
| empty | VITE_DEMO_USERS ausente | `.tmp/e2e/empty/dist` | http://127.0.0.1:4173 |
| seeded | Catálogo válido generado en ejecución | `.tmp/e2e/seeded/dist` | http://127.0.0.1:4174 |

Configurar Vite para desactivar lectura de archivos dotenv en modo E2E (`envDir: false`)
y limpiar las variables heredadas `VITE_*` del proceso hijo antes de suministrar las
permitidas. Usar modos E2E explícitos; nunca leer/copiar .env.local. Generar semillas en
memoria, compartirlas con el runner por entorno sin imprimirlas y eliminar procesos y
salidas efímeras al finalizar. Ignorar `.tmp/e2e/` en Git y escaneo de secretos.

Proyectos Playwright `empty` y `seeded` usan baseURL y webServer propios sin reutilizar
servidores. Los tests comunes se ejecutan en ambos; los de semillas solo en seeded.
No reconstruir dos variantes sobre el mismo dist. `test:e2e` y `test:e2e:ui` invocan el
lanzador; `verify` conserva su build habitual y ejecuta las dos variantes E2E por separado.
Esos builds adicionales validan configuraciones distintas, no son duplicados del build común.
`typecheck:e2e` ejecutará `tsc --noEmit -p tsconfig.e2e.json`, aislando los globals de Vitest.

### Verificación del ajuste

Agregar pruebas de los tres estados de configuración, conflicto posterior y cuentas no
afectadas; temporizador a 4999/5000 ms, apertura tardía y reintento exitoso; E2E con ambos
catálogos y comprobación de tipos de config/tests/lanzador. No se requiere introducir otra
herramienta de runtime. Gates I–IV, V, 7–9 revisados: diseño compatible, verificaciones de
producto e integración aún pendientes. Este ajuste no amplía el alcance a migración de cuentas.

## Complexity Tracking

Sin excepciones propuestas. La bóveda cifrada y el control de revisión son necesarios por
FR-017 y el caso de concurrencia; memoria sola no cumple FR-008 y almacenamiento en texto
plano no cumple FR-017. Si la medición muestra límites de rendimiento o compatibilidad,
revisar el diseño antes de implementar alternativas.

## Corrección documental tras analyze — 2026-10-17

Aplicados C1, I1, I2, U1 e I3 con autorización del usuario. Pruebas de gateway preceden a su
implementación en tasks.md, conflicto entre fuentes alineado con spec.md, lanzador .mjs
incluido en typecheck y puerto de disponibilidad definido. Sin nuevas dependencias ni
excepciones constitucionales; se mantiene revisión de integración y pruebas pendientes.
Ver [registro](../../docs/prompts/002-correcciones-analyze.md).

## Estado de ejecución

Implementación realizada; [evidencia y pendientes](../../docs/implementacion-002.md).
No se declara aprobación de integración ni de revisiones manuales pendientes.
