# Research: Registro de Usuarios

Fecha: 2026-10-17. Contexto: [spec](spec.md), constitución 1.0.0 y código de Login existente.

## R1 — Permanencia y protección

**Decisión**: IndexedDB nativo y una bóveda AES-GCM-256 que contiene el conjunto de cuentas
nuevas; una CryptoKey no extraíble, generada por navegador, se conserva por structured clone.
PBKDF2-HMAC-SHA-256, salt aleatorio de 16 bytes por cuenta, 600000 iteraciones y verificador
de 32 bytes. Contraseña y confirmación nunca se serializan. La protección reside en infraestructura.

**Motivo**: sobrevivir recargas, cifrar nombre/correo y no persistir contraseña recuperable.
Toda la colección cifrada evita un índice de correo legible o hash público adivinable.
No hay gestor remoto ni clave embebida en el código.

**Alternativas**: memoria pierde las cuentas al recargar; localStorage no conserva CryptoKey
como objeto y no aporta transacciones; clave derivada solo de la contraseña dificulta detectar
correos duplicados antes de autenticarse; backend excede alcance.

**Límite**: no extraíble significa que exportKey no puede extraerla; no garantiza almacenamiento
físico seguro. Código del mismo origen puede usarla para descifrar. El cifrado de registros no
protege ante XSS ni acceso al perfil y no sustituye autorización real. Solo cuentas ficticias.
Fallo de Crypto/IndexedDB, clave perdida, ciphertext inválido o versión desconocida produce
indisponibilidad; nunca reiniciar datos ni usar texto plano como fallback.

Fuentes primarias: [Web Crypto, almacenamiento y seguridad](https://www.w3.org/TR/webcrypto/#key-storage),
[PBKDF2](https://www.w3.org/TR/webcrypto/#pbkdf2) y
[guía OWASP de almacenamiento de contraseñas](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
para el coste de PBKDF2 elegido. Argon2id se consideró, pero requiere una implementación
adicional; se elige PBKDF2 nativo para esta demo y se medirá su coste real.

## R2 — Escritura atómica y correos duplicados

**Decisión**: una fila de bóveda con revisión creciente. Leer, validar y descifrar fuera de
transacción; comprobar duplicados contra cuentas iniciales y nuevas; cifrar nueva colección.
En una transacción readwrite releer revisión y escribir solo si coincide. Si cambió, repetir
con datos nuevos; máximo tres intentos antes de unavailable. Inicialización usa add atómico
para clave y bóveda; dos pestañas no generan estados de clave incompatibles.

**Motivo**: evitar duplicados y pérdidas sin mantener una transacción viva mientras await
Web Crypto. Éxito únicamente en transaction.oncomplete, no en request.onsuccess.
Datos dañados se conservan y reportan; no se reemplazan por una colección vacía.

**Alternativas**: flag de UI no protege entre pestañas; read-modify-write sin revisión pierde
altas. Un repositorio por cuenta requiere índices que aquí se evitan para minimizar exposición.

Fuente: [IndexedDB, transacciones](https://www.w3.org/TR/IndexedDB/#transaction-concept).

## R3 — Cuentas iniciales y Login

**Decisión**: BrowserAccountGateway implementa AuthGateway y RegistrationGateway. Reutilizar
loadDemoAccounts ampliado con estados absent/valid/invalid y normalización; cuentas iniciales
se consultan en memoria, sin persistirlas.
Ausencia de configuración se trata como catálogo inicial vacío; una configuración presente
pero inválida impide altas, pues no permite comprobar duplicados con fiabilidad. Una cuenta
local íntegra puede autenticarse aunque la configuración falte o sea inválida; para un correo
no resuelto con configuración inválida, unavailable. Fallo de bóveda falla cerrado.

**Motivo**: ampliar C4 del contrato 001 según FR-011 sin alterar AuthResult. Con catálogo vacío
y almacenamiento íntegro, correo desconocido devuelve invalid-credentials. Mantener demora
configurable de Login existente y mensajes genéricos, sin emitir nombre/correo en eventos.

**Alternativas**: seguir con InMemoryAuthGateway exclusivamente incumple FR-008; tratar cualquier
error de configuración como cero cuentas disponibles puede permitir correos duplicados.

## R4 — Rutas y estado efímero

**Decisión**: navegación nativa con pathname, pushState y popstate para /login y /registro;
/ conserva Login. App mantiene aviso de alta solo en memoria y lo consume al llegar a Login.
No ponerlo en query, storage ni history.state. Al abandonar Login se elimina; una recarga
inicia App sin aviso ni sesión. Cada navegación desmonta el formulario de la pantalla previa.

**Motivo**: dos rutas no justifican añadir un router. Despliegue debe servir index.html como
fallback para enlaces directos. La sesión actual de Login sigue en memoria.

Fuente: [HTML, History](https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-history-interface).

## R5 — Diseño y accesibilidad

**Decisión**: reutilizar TextField, PasswordField, Button, SocialButton, Divider, Alert y tokens.
Extender Checkbox con error/ref/descripción y contenido de etiqueta compatible, separando el
botón de términos del label para que abrir el modal no marque la casilla. BrandPanel recibe
variante/contenido de Registro sin cambiar por defecto Login. Layout propio con breakpoint
1024, sin desmontaje por resize; flujo CSS y columna de 400 px, no posiciones absolutas.
Modal con dialog.showModal(), título, texto «Contenido de demostración, sin validez legal»,
botón Cerrar y Escape; foco devuelto al activador. Probar navegador real y teclado.

**Evidencia MCP**: get_design_context y get_screenshot consultados para archivo
wuPFwEdJFAhHz9d41yUzOq, nodo 31:2 «04 · Registro», el 2026-10-17. Coincide con tabla de spec:
panel 620, formulario 400, Inter y campos 52. No se incorporan URLs temporales como recursos
runtime. Usar SVG locales existentes compatibles y documentar contraste accesible.

**Alternativas**: Tailwind agrega un sistema ajeno; layout absoluto falla con errores; modal
casero duplica foco e inert. Fuente: [dialog en HTML](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element).

## R6 — Verificación

**Decisión**: TDD para validación, casos de uso, contratos de gateway y estados UI; dobles
inyectados para errores y concurrencia. IndexedDB y Web Crypto reales se verifican en navegador,
además de pruebas unitarias de lógica. No presentar jsdom como prueba real de persistencia,
cifrado, CSS o foco del modal. La suite se amplía con Playwright según R7; su instalación queda para implementación.

**Alternativas**: solo snapshots no prueban registro-login-recarga; solo memoria en pruebas
no acredita transacciones reales. Usar cobertura y scripts existentes del proyecto.

## R7 — E2E automatizadas con Playwright (2026-10-17)

**Decisión**: agregar `@playwright/test` como devDependency para automatizar Chromium real,
con configuración en playwright.config.ts y escenarios en e2e/. Scripts propuestos:
`test:e2e` (build + runner), `test:e2e:ui` (build + runner --ui). Integrar el runner en verify
tras el build existente, evitando builds redundantes; no modificar scripts en planificación.

**Motivo**: el usuario solicitó probar vistas llenando campos y pulsando controles. jsdom
no acredita persistencia real ni comportamiento nativo de dialog. Playwright permite revisar
el flujo registro-login-recarga con las APIs reales del navegador, sin servicio cloud.

**Alternativas**: mantener solo revisión manual no satisface la automatización solicitada;
Cypress también es viable, pero no se necesitan dos runners E2E. Testing Library sigue
verificando componentes y Vitest conserva cobertura de lógica; no se sustituyen.

**Aislamiento y fiabilidad**: contextos nuevos por test; dos páginas en un mismo contexto
para concurrencia sobre la misma bóveda. Roles/labels y assertions reintentadas; sin sleeps
arbitrarios. webServer arranca preview del build en origen fijo y sin reutilización para
no probar un servidor con configuración accidental. Los datos iniciales se generan en
runtime y se suministran al proceso de build; ejecutar variantes con/sin configuración.

**Dependencia y seguridad**: durante implementación elegir versión compatible con Node,
fijarla y versionar lockfile, verificar licencia y vulnerabilidades, incluidos componentes
de desarrollo; el audit:licenses actual solo inspecciona producción y no basta para esta alta.
Chromium se descarga como binario de pruebas, fuera del bundle. No usar datos personales
reales, credenciales en fixtures ni storageState exportado. Desactivar trace, screenshot y
video por defecto; pueden capturar valores introducidos. Ignorar reports/resultados en Git.

**Fuentes oficiales**: [buenas prácticas](https://playwright.dev/docs/best-practices),
[webServer](https://playwright.dev/docs/test-webserver),
[aislamiento](https://playwright.dev/docs/browser-contexts),
[ejecución y modo UI](https://playwright.dev/docs/running-tests).

En la incorporación inicial de E2E no se modificaron modelo ni contratos. Gate de diseño aprobado
para planificar, sin afirmar instalación, auditorías ni pruebas ejecutadas.

## R8 — Ajustes de integración aceptados (2026-10-17)

**Decisión**: aplicar los tres ajustes de [plan](plan.md#ajustes-de-integración-confirmados--2026-10-17):
configuración discriminada y rechazo del correo en conflicto; apertura de IndexedDB limitada
a 5000 ms con reintento explícito; variantes E2E empty/seeded con builds y orígenes aislados,
dotenv desactivado y typecheck específico. Los valores de timeout y la política de conflictos
son decisiones de diseño aprobadas por el usuario, no hechos deducidos de documentación externa.

**Motivo**: el loader existente devuelve null para ausencia e invalidez, impidiendo aplicar
la política R3; elegir una identidad silenciosamente puede autenticar la cuenta equivocada;
el bloqueo sin límite deja la UI esperando; E2E con variables personales no son reproducibles.

**Alternativas**: prioridad local o inicial rechazada para no ocultar conflictos; borrado
silencioso rechazado por FR-018; timeout cancelando ficticiamente open rechazado, pues se
requiere manejar eventos tardíos; compartir dist entre variantes rechazado por interferencias.
No se agrega otra dependencia para gestionar los procesos: usar scripts Node del proyecto.

El catálogo ausente se identifica solo por undefined; vacío explícito o formato inválido
son invalid. Si existe conflicto entre fuentes válidas, solo ese correo devuelve unavailable,
sin cambiar cuentas; no hay migración ni elección automática. Ver contrato de gateways.
Apertura vencida no puede inicializar bóveda ni actualizar UI tarde; ver contrato de persistencia.
Se actualizan modelo, contratos y quickstart para mantener consistencia con el plan.

Referencia técnica del aislamiento dotenv: [Vite, envDir](https://vite.dev/config/shared-options#envdir).

## R9 — Correcciones autorizadas del análisis

**Decisión**: mover las pruebas de matriz/duplicados antes del gateway en US1, alineando
TDD con constitución I. Mantener IDs consecutivos tras renumeración. Alinear historia 3.6,
FR-010, SC-004 y S-009 con la política de conflicto ya aprobada. Incluir scripts .mjs en
la comprobación TypeScript con allowJs/checkJs. Usar AccountAvailabilityGateway y caso de
uso específico para Reintentar sin registrar, autenticar ni tocar secretos desde UI.

**Motivo**: eliminar orden contradictorio de pruebas, divergencia funcional, archivo fuera
del control de tipos y operación de UI sin contrato. **Alternativas**: no usar el envío de
registro como reintento, ni saltar pruebas de gateway, ni introducir runtime TypeScript nuevo
solo para ejecutar el lanzador. Es una corrección autorizada posterior al análisis de solo lectura.

## R10 — Verificación durante implementación

Se agregó fake-indexeddb 6.2.6 únicamente como devDependency (Apache-2.0) para contratos
unitarios de transacción, corrupción y concurrencia. Las E2E siguen usando APIs reales.
Se elevó Node a >=24.15.0 por los engines de jsdom 30.1.2 existente; no hubo nuevas
librerías runtime. Evidencia de ejecución y limitaciones en [informe](../../docs/implementacion-002.md).
