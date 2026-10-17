# Tasks: Registro de Usuarios de KynWallet

**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md),
[data-model.md](data-model.md), [contratos](contracts/) y [quickstart.md](quickstart.md).
**Fecha**: 2026-10-17. **Feature**: `002-registro-usuarios`.
**Tests**: obligatorios por constitución I y plan aprobado; Vitest/Testing Library y Playwright Chromium.
**Organization**: fases por historia de usuario de spec; P1 antes de P2. Estado actualizado tras implementación: 58 completas y 3 pendientes documentadas.

## Format: `[ID] [P?] [Story] Description`

`[P]` indica trabajo en archivos distintos que puede solaparse solo después de sus prerrequisitos.
No autoriza lanzar agentes ni ejecutar tareas automáticamente. Rutas desde raíz salvo referencias
explícitas a documentos de feature. No instalar dependencias ni implementar durante la generación.
Cada implementación exige prueba RED previa de su comportamiento, luego GREEN y refactorización.
No continuar si fallan controles o hay contradicción de requisitos sin resolver.

## Phase 1: Setup — herramientas compartidas

**Goal**: Preparar herramientas sin modificar comportamiento funcional.

**Independent Test / Checkpoint**: Typecheck de aplicación y E2E, lint y descubrimiento de suites separados.

- [X] T001 Revisar compatibilidad Node, mantenimiento, licencia y vulnerabilidades de @playwright/test; agregar versión acotada a devDependencies en package.json y package-lock.json, sin dependencias de runtime; registrar evidencia en quickstart.md.
- [X] T002 Configurar tsconfig.e2e.json para playwright.config.ts, e2e/**/*.ts, scripts/**/*.ts y scripts/**/*.mjs con allowJs:true y checkJs:true, tipos Node/Playwright sin globals Vitest; agregar typecheck:e2e a package.json.
- [X] T003 Preparar playwright.config.ts con Chromium, proyectos empty/seeded y webServer sin reutilización en 127.0.0.1:4173/4174, selectores accesibles y trace/video/screenshot desactivados; excluir e2e/** de Vitest en vite.config.ts.
- [X] T004 Crear scripts/run-e2e.mjs para generar semillas ficticias en memoria, limpiar VITE_* heredadas, lanzar builds separados en .tmp/e2e/empty/dist y .tmp/e2e/seeded/dist y limpiar procesos/salidas también al fallar; configurar envDir:false solo en modo E2E en vite.config.ts. Pasar semillas al runner sin imprimirlas; empty debe recibir undefined, no cadena vacía.
- [X] T005 Agregar scripts test:e2e y test:e2e:ui en package.json invocando el lanzador; integrar typecheck:e2e y ambas variantes E2E en verify conservando los controles existentes y el build habitual, sin reconstruir cada variante dos veces.
- [X] T006 [P] Excluir .tmp/e2e/, playwright-report/ y test-results/ en .gitignore y .secretlintignore; ajustar eslint.config.js para config/tests E2E y scripts sin desactivar reglas de capas del código de aplicación.

## Phase 2: Foundational — modelos y contratos compartidos

**Goal**: Definir los límites comunes y validación de dominio antes de implementar las historias.

**Independent Test / Checkpoint**: Pruebas de dominio y configuración pasan; ninguna capa interior importa navegador o React.

- [X] T007 [P] Escribir pruebas primero en src/domain/registrationValidation.test.ts para «Nombre recortado <=80, al menos dos palabras», «correo normalizado <=254», «contraseña 8–128 exacta, confirmación idéntica; términos true»; cubrir vacíos, límites, Unicode, acentos, guiones, apóstrofos y prioridad de errores (FR-002–006).
- [X] T008 [P] Ampliar primero src/infrastructure/loadDemoAccounts.test.ts para estados absent/valid/invalid: solo undefined es absent; cadena vacía, JSON inválido, lista vacía, cuentas inválidas o correos duplicados son invalid; mantener nombres iniciales de una palabra admitidos.
- [X] T009 Definir RegistrationInput, RegisteredAccount y RegistrationResult en src/domain/registration.ts y estado de configuración inicial en src/domain/auth.ts según data-model.md: resultado success/validation-error/duplicate-email/unavailable; sin contraseña ni confirmación en RegisteredAccount.
- [X] T010 Implementar reglas en src/domain/registrationValidation.ts y reutilizar normalización/longitudes de src/domain/validation.ts; centralizar mensajes exactos de spec.md en src/domain/messages.ts y no transformar contraseña.
- [X] T011 Ampliar src/infrastructure/loadDemoAccounts.ts a absent/valid(accounts)/invalid y adaptar consumidores actuales en src/main.tsx y pruebas de Login para mantener compatible el gateway en memoria hasta su sustitución en US1.
- [X] T012 Definir puertos RegistrationGateway y SecurityEvents en src/application/ports/RegistrationGateway.ts y src/application/ports/SecurityEvents.ts; register recibe nombre/correo/contraseña validados sin confirmación; eventos con códigos cerrados sin PII, claves ni excepciones. Definir además AccountAvailabilityGateway.ensureAvailable(): Promise<AvailabilityResult> en src/application/ports/AccountAvailabilityGateway.ts, con ready/unavailable sin credenciales ni escrituras de cuentas. Conservar AuthGateway existente.
- [X] T013 [P] Preparar generadores de datos ficticios en src/test/registrationFixtures.ts y e2e/fixtures.ts: generar credenciales al ejecutar, sin fixtures de cuentas/contraseñas versionadas, sin logs, sin exportar storageState; helpers sin mocks para el recorrido E2E principal.

## Phase 3: US1 — Crear cuenta y acceder después de recargar (P1, MVP)

**Goal**: Entregar el recorrido vertical real desde Registro hasta Login, permanencia y fallos explícitos.

**Independent Test / Checkpoint**: Crear cuenta en /registro, llegar a /login, recargar, acceder con su nombre y cerrar sesión; cuenta persiste, sesión no.

- [X] T014 [P] [US1] Escribir pruebas RED en src/infrastructure/WebCryptoAccountProtection.test.ts para PBKDF2-HMAC-SHA-256, «iteraciones=600000, salt 16 bytes, resultado derivado 32 bytes», AES-GCM-256, IV nuevo 12 bytes, tag 128 bits y CryptoKey no extraíble; sin password/confirmation serializados (FR-017).
- [X] T015 [P] [US1] Escribir pruebas RED en src/infrastructure/EncryptedAccountStore.test.ts para lectura íntegra, inicialización atómica, commit antes de éxito, no borrar ante corrupción/cuota/versión/clave ausente; apertura 4999/5000 ms, blocked, success tardío, abort de upgrade tardío y reintento nuevo sin escritura del vencido (FR-008, 017–018).
- [X] T016 [P] [US1] Escribir pruebas RED del caso de uso en src/application/registerAccount.test.ts: validar antes del gateway, no pasar confirmación, éxito solo tras commit y fallo genérico; comprobar bloqueo de alta con catálogo inválido y probar createEnsureAccountAvailability en src/application/ensureAccountAvailability.test.ts: reabre sin register/authenticate, sin datos ni éxito/navegación (FR-005, 009, 011, 018).
- [X] T017 [P] [US1] Crear escenario RED e2e/registration.spec.ts con cuenta nueva, mensaje exacto, campos vacíos, recarga borra aviso, contraseña válida abre bienvenida, recarga termina sesión y logout conserva cuenta; cerrar página y abrir otra del mismo contexto para permanencia. IndexedDB/Web Crypto reales (SC-001, 005).
- [X] T018 [US1] Implementar src/infrastructure/WebCryptoAccountProtection.ts con parámetros y formatos del modelo, AAD de namespace/schemaVersion y validación de algoritmo/costes permitidos; verificar contraseña derivada sin recuperarla como texto y nunca exportar CryptoKey.
- [X] T019 [US1] Implementar src/infrastructure/EncryptedAccountStore.ts: base kynwallet-demo versión 1, store vault, fila accounts con schemaVersion=1/revision/encryptionKey/envelope; criptografía fuera de transacciones, inicialización get-or-add atómica y actualización compare-and-swap con máximo tres intentos; resolver tras oncomplete.
- [X] T020 [US1] Completar apertura en src/infrastructure/EncryptedAccountStore.ts con timeout 5000 ms e identidad por intento, cierre de success tardío y abort de upgrade tardío; versionchange cierra conexión; fallos sin fallback ni borrado. Conservar callbacks tardíos necesarios para cerrar conexiones y liberar recursos después.
- [X] T021 [P] [US1] Escribir pruebas RED en src/infrastructure/BrowserAccountGateway.test.ts para duplicados normalizados contra ambas fuentes, altas casi simultáneas con una sola ganadora y dos correos distintos sin pérdida, conflicto de revisión hasta tres intentos y fallo cerrado sin sobrescribir (FR-007, 018).
- [X] T022 [US1] Después de las pruebas de duplicados, ampliar pruebas RED en src/infrastructure/BrowserAccountGateway.test.ts con matriz absent/valid/invalid, fallo local precede catálogo, contraseña exacta, correo normalizado y desconocido; conflicto inicial/local devuelve unavailable solo para ese correo sin probar ambas identidades.
- [X] T023 [US1] Implementar src/infrastructure/BrowserAccountGateway.ts con los puertos AuthGateway, RegistrationGateway y AccountAvailabilityGateway: unicidad inicial/local, validación de bóveda completa, alta duradera, autenticación derivada, demora configurable de Login y resultados tipados sin rechazar hacia UI; respetar matriz de configuración y emitir eventos seguros; ensureAvailable solo abre y valida bóveda existente, no crea fila ni claves ni envía registro. La inicialización vacía o alta queda para register. Ejecutar antes las pruebas RED de gateway movidas a esta fase.
- [X] T024 [US1] Implementar src/application/registerAccount.ts inyectando RegistrationGateway y SecurityEvents; validar nuevamente entrada, normalizar nombre/correo y convertir excepciones en unavailable sin exponer datos (FR-005, 009, 018). Crear src/application/ensureAccountAvailability.ts inyectando AccountAvailabilityGateway para Reintentar sin envío implícito.
- [X] T025 [US1] Crear src/ui/features/registration/RegistrationForm.tsx, useRegistrationForm.ts y registrationReducer.ts con controles reutilizados, términos false inicial y envío único con bloqueo sincrónico previo a await; todos los errores impiden alta, fallo conserva datos y ofrece Reintentar apertura sin autoenviar mediante caso de uso ensureAccountAvailability inyectado, sin importar IndexedDB en UI; escribir primero pruebas de estado/reintento en src/ui/features/registration/RegistrationForm.test.tsx y registrationReducer.test.ts.
- [X] T026 [US1] Conectar /registro y /login desde src/App.tsx y src/ui/navigation/useAppNavigation.ts usando pathname/pushState/popstate; mantener / como Login, sesión/aviso solo en memoria y aviso eliminado al recargar o abandonar Login; insertar aviso anunciado en src/ui/features/login/LoginForm.tsx (FR-009, 013, 019).
- [X] T027 [US1] Escribir primero las pruebas de integración descritas a continuación y componer gateway, protección, almacenamiento, eventos seguros y casos de uso en src/main.tsx por inyección; incluir ensureAccountAvailability en la inyección de App/formulario y agregar pruebas de integración en src/App.test.tsx para éxito solo después de persistir y no auto-login, fallos sin redirección y Reintentar sin envío implícito.
- [X] T028 [US1] Ampliar e2e/registration-persistence.spec.ts para inspeccionar formato cifrado/clave no extraíble sin logs, alterar ciphertext o quitar clave solo en contexto aislado y verificar indisponibilidad sin reinicio; agregar bloqueo real de apertura y posterior reintento, conservando cuentas previas (SC-010).

## Phase 4: US2 — Corregir errores y evitar duplicados (P1)

**Goal**: Completar interacción inline y demostrar integridad ante duplicados y concurrencia.

**Independent Test / Checkpoint**: Vacíos, formatos y límites muestran errores al lado; duplicado normalizado conserva credenciales originales.

- [X] T029 [P] [US2] Escribir pruebas RED en src/ui/features/registration/RegistrationForm.test.tsx para cinco obligatorios, foco al primer error, blur y corrección, nombre con mínimo dos palabras, límites 80/81 y 254/255, contraseña 7/8/128/129, confirmación y términos al cambiar (FR-002–006).
- [X] T030 [P] [US2] Crear e2e/registration-errors.spec.ts RED para enviar vacío, corregir email/longitudes/coincidencia, bloquear sin términos, duplicar correo con mayúsculas/espacios y comprobar que cuenta original sigue accediendo (SC-002–003).
- [X] T031 [US2] Ampliar src/ui/components/Checkbox/Checkbox.tsx con ref/error/aria-describedby y etiqueta compatible sin romper Login; completar sus pruebas previas en src/ui/components/Checkbox/Checkbox.test.tsx para asociación y foco.
- [X] T032 [US2] Completar src/ui/features/registration/registrationReducer.ts y useRegistrationForm.ts para revalidación tras blur/envío, coincidencia al cambiar cualquiera de contraseñas y aceptación al corregir; conservar datos no afectados y mensaje de duplicado junto al correo.
- [X] T033 [US2] Completar manejo de duplicados y conflictos atómicos en src/infrastructure/BrowserAccountGateway.ts y EncryptedAccountStore.ts hasta pasar contratos; sin consultar solo un caché en memoria ni usar put que sobrescriba sin revisión.
- [X] T034 [US2] Añadir pruebas de clic/Enter repetidos y bloqueo durante operación en src/ui/features/registration/RegistrationForm.test.tsx; ajustar RegistrationForm.tsx para un único envío y estados anunciados (FR-016, 018).
- [X] T035 [US2] Completar e2e/registration-persistence.spec.ts con dos páginas del mismo contexto/origen: mismo correo solo una alta; correos distintos ambos conservados. Verificar acceso posterior y no depender de otras pruebas ni de sleeps fijos.

## Phase 5: US3 — Verificar credenciales reales de la simulación (P1)

**Goal**: Garantizar rechazo correcto, convivencia de fuentes y conflicto de identidad sin prioridad silenciosa.

**Independent Test / Checkpoint**: Cuenta creada autentica solo con contraseña exacta; desconocido falla; catálogo inicial y local coexisten.

- [X] T036 [P] [US3] Escribir regresiones RED en src/ui/features/login/LoginForm.test.tsx y src/application/authenticate.test.ts para mensaje genérico, contraseña vaciada y enfocada tras fallo, correo conservado, error eliminado al editar y nombre correcto en bienvenida (FR-010).
- [X] T037 [P] [US3] Crear e2e/login-registration.spec.ts RED para contraseña errónea y correo desconocido, normalización de correo sin normalizar contraseña y sesión no persistente; en seeded probar cuenta inicial y cuenta nueva y duplicado de semilla (SC-004).
- [X] T038 [US3] Completar resolución de fuentes y conflictos en src/infrastructure/BrowserAccountGateway.ts: invalid bloquea altas y permite local íntegra, correo no resuelto invalid devuelve unavailable; colisión entre fuentes válidas impide ese acceso, conserva datos y otras cuentas funcionan.
- [X] T039 [US3] Adaptar src/ui/features/login/useLoginForm.ts y LoginForm.tsx solo donde sea necesario para mantener el contrato anterior con el nuevo gateway; no cambiar Recordarme, recuperación de contraseña ni avisos sociales de Login.
- [X] T040 [US3] Agregar escenario e2e/login-registration.spec.ts que prepara cuenta cifrada en un contexto aislado con el mismo correo de la semilla, verifica unavailable sin sobrescritura y prueba otra cuenta sin conflicto; no añadir endpoint de pruebas ni mocks de gateway en producción.
- [X] T041 [US3] Ejecutar regresiones src/infrastructure/InMemoryAuthGateway.test.ts, loadDemoAccounts.test.ts y pruebas de Login; registrar resultado y casos del catálogo inválido en specs/002-registro-usuarios/quickstart.md sin registrar credenciales.

## Phase 6: US4 — Navegar y reconocer funciones futuras (P2)

**Goal**: Entregar enlaces, avisos sociales y modal de términos independiente del checkbox.

**Independent Test / Checkpoint**: Google/Apple muestran alert exacto sin cambiar datos; enlaces navegan; modal cierra y devuelve foco.

- [X] T042 [P] [US4] Escribir pruebas RED src/ui/components/TermsDialog/TermsDialog.test.tsx con título, «Contenido de demostración, sin validez legal», Cerrar/Escape y foco devuelto; apertura y cierre no aceptan términos ni pierden campos (FR-021).
- [X] T043 [P] [US4] Crear e2e/registration-navigation.spec.ts RED con alert Google/Apple exacto y aceptado, preservación del formulario, enlaces /login y /registro, acceso directo/recarga y atrás/adelante; aviso éxito no reaparece en visitas independientes (FR-012–013, 019).
- [X] T044 [US4] Implementar src/ui/components/TermsDialog/TermsDialog.tsx y TermsDialog.module.css con dialog.showModal(), nombre accesible, texto ficticio, foco inicial, cierre y restauración; botón activador separado del label en RegistrationForm.tsx.
- [X] T045 [US4] Completar Google/Apple con window.alert("Próximamente") en src/ui/features/registration/RegistrationForm.tsx, type button y sin envío ni cambios de campos; reutilizar SocialButton y Divider.
- [X] T046 [US4] Completar navegación y limpieza de aviso en src/App.tsx y src/ui/navigation/useAppNavigation.ts; probar y limpiar popstate al desmontar y mantener / como Login sin aviso.
- [X] T047 [US4] Verificar modal con Tab/Shift+Tab/Escape en e2e/registration-navigation.spec.ts sin sustituir dialog nativo; asegurar foco al activador, checkbox intacto y ausencia de acciones de registro al abrirlo.
- [X] T048 [US4] Documentar requisito de fallback estático de /login y /registro a index.html en README.md y specs/002-registro-usuarios/quickstart.md, sin desplegar ni agregar proveedor de hosting.

## Phase 7: US5 — Escritorio, móvil y teclado (P2)

**Goal**: Aplicar el diseño de Registro y accesibilidad sin alterar Login ni perder estado al redimensionar.

**Independent Test / Checkpoint**: Frame desktop comparable, solo formulario en móvil; recorrido completo por teclado desde 320 px.

- [X] T049 [P] [US5] Crear e2e/registration-responsive.spec.ts RED a 320, 768, 1024, 1440 y 1920 px y transición 1023↔1024: panel visible según ancho, sin overflow horizontal ni pérdida de campos/errores/términos (FR-014, 020).
- [X] T050 [P] [US5] Escribir pruebas RED de accesibilidad y visibilidad independiente en src/ui/features/registration/RegistrationForm.test.tsx y src/ui/layout/BrandPanel/BrandPanel.test.tsx; usar axe existente, labels, errores asociados, anuncios y foco visible (FR-015–016).
- [X] T051 [US5] Parametrizar contenido de Registro en src/ui/layout/BrandPanel/BrandPanel.tsx y BrandPanel.module.css preservando por defecto Login; usar textos de spec y assets SVG locales compatibles del frame 31:2; consultar MCP si hace falta extraer activos, sin URLs temporales en runtime.
- [X] T052 [US5] Crear src/ui/features/registration/RegistrationScreen.tsx y RegistrationScreen.module.css y completar RegistrationForm.module.css: desktop 620/400 de referencia 1440×1024, controles 52/radio12, dos paneles desde 1024 y solo formulario desde 320 a 1023; flujo flexible para errores, sin coordenadas absolutas ni remontaje al resize.
- [X] T053 [US5] Completar atributos y textos accesibles en src/ui/features/registration/RegistrationForm.tsx y TermsDialog.tsx, reusar PasswordField con dos estados independientes, autocompletado apropiado y Enter equivalente; añadir tokens solo si faltan en src/ui/styles/tokens.css y preservar contraste de Login.
- [X] T054 [US5] Ejecutar e2e/registration-responsive.spec.ts y recorrido de teclado en registration-navigation.spec.ts; medir overflow, foco, visibilidad y persistencia de estado con assertions reintentadas, sin atribuir revisión WCAG completa a axe.
- [ ] T055 [US5] Comparar manualmente 1440×1024 con Figma 31:2 de la copia y documentar evidencia, ajustes mínimos de contraste y revisión de lector de pantalla/zoom en specs/002-registro-usuarios/quickstart.md; no afirmar conformidad sin mediciones ni capturar credenciales.
- [ ] T056 [US5] Medir derivación y recorrido preparado Registro→Login en navegador móvil representativo, comprobar SC-009 <2 minutos sin espera artificial; registrar entorno y resultados en specs/002-registro-usuarios/quickstart.md; revisar diseño si el coste no permite cumplir.

## Phase 8: Polish — validación y documentación

**Goal**: Cerrar trazabilidad y controles antes de revisión de integración.

**Independent Test / Checkpoint**: Todas las suites y verificaciones pasan; evidencia real y pendientes explícitos.

- [X] T057 Revisar trazabilidad FR-001–021 y SC-001–011 contra pruebas implementadas, contratos y decisiones R1–R8 en specs/002-registro-usuarios/quickstart.md; cubrir cualquier caso faltante con prueba previa, sin rebajar criterios.
- [X] T058 Ejecutar npm run typecheck:e2e, npm test, npm run test:coverage y ambas variantes E2E mediante npm run verify definido en package.json; validar cobertura >=80 % en líneas/ramas/funciones/sentencias sin bajar cobertura previa; registrar comandos y resultados reales en docs/proceso-sdd.md.
- [ ] T059 Completar auditorías de dependencias y licencias incluyendo Playwright de desarrollo, secretos y análisis estático configurados en package.json; revisar IndexedDB cifrado y eventos sin PII; documentar límites y revisión de seguridad en specs/002-registro-usuarios/quickstart.md, sin aprobar automáticamente cumplimiento corporativo.
- [X] T060 [P] Actualizar README.md, docs/configuracion-herramientas.md y docs/proceso-sdd.md con ejecución E2E real, requisitos de navegador, funcionamiento del registro simulado, límites de persistencia y estado final; evitar credenciales y evidencia temporal sensible.
- [X] T061 Realizar revisión final de diff y gates de constitución en specs/002-registro-usuarios/plan.md y quickstart.md; dejar pendiente integración hasta revisión independiente y de seguridad conforme 9.3, sin publicar ni fusionar como parte de estas tareas.

## Dependencies & Execution Order

Setup → Foundational → US1 → US2 → US3 → US4 → US5 → Polish.
US2–US5 requieren la base vertical de US1 para sus pruebas integradas. No afirmar que cada
historia puede construirse desde cero sin las anteriores: es un incremento verificable con
fixtures propios que no depende del orden de tests. US4/US5 pueden adelantar archivos nuevos
después de US1, pero coordinar cambios compartidos de formulario/App y ejecutar integración.

- Setup: T001 antes de configuración de tipos/runner; T002–T005 secuenciales. T006 puede
  solaparse con T002 una vez elegida la dependencia; no editar package.json en paralelo.
- Foundational: T007/T008/T013 pueden escribirse en paralelo tras Setup; T009 antes de T010,
  T011 y T012. T010 requiere su prueba T007 y T011 la prueba T008. Terminar todo antes de US1.
- En cada historia escribir y ejecutar pruebas RED antes de los cambios correspondientes.
  Las tareas con pruebas y ajustes combinados deben seguir RED→GREEN dentro de la tarea.
- T014–T017 son pruebas en archivos independientes; cripto T018 precede almacenamiento
  T019–T020. T021 y T022 escriben pruebas del mismo gateway en secuencia y ambas deben
  ejecutarse en RED antes de implementarlo en T023. T024 implementa casos de uso con sus
  pruebas previas T016; T025 escribe primero pruebas de formulario/reintento y luego UI;
  T026 conecta rutas tras escenario RED T017; T027 integra con pruebas previas en App.
- T029 (formulario) y T030 (E2E de errores) pueden redactarse en paralelo después de US1.
  T033 modifica almacenamiento: no solaparlo con T019–T023. T034 modifica formulario;
  no comparte archivos con T033, pero depende de sus resultados para validación integrada.
- US3 refuerza autenticación ya introducida en US1; US4 añade modal/proveedores; US5 termina
  referencia visual. TDD y accesibilidad básica no se posponen aunque su auditoría esté en US5.
- Polish depende de todas las historias; documentación paralela no puede declarar resultados
  aún no obtenidos. No marcar tarea terminada sin evidencia de su criterio.

## Parallel Examples by User Story

| Historia | Ejemplo de trabajo independiente | Límite |
| --- | --- | --- |
| US1 | T014 cripto + T015 persistencia + T016 casos de uso + T017 E2E | Después de Foundational; T021/T022 comparten archivo y son secuenciales antes de T023. |
| US2 | T029 formulario + T030 E2E | Después de US1, archivos distintos; producción después de RED. |
| US3 | T036 Login/aplicación + T037 E2E | Después de US2; contratos de gateway ya probados en US1. |
| US4 | T042 TermsDialog.test + T043 navigation E2E | Después de US3; modal real en E2E. |
| US5 | T049 responsive E2E + T050 accesibilidad/componentes | Después de US4; CSS e integración después de RED. |

## Implementation Strategy

### MVP First

Setup + Foundational + US1 entregan alta válida y Login después de recarga, protección y
fallos explícitos. El MVP conserva validación básica obligatoria y seguridad; no es una
entrega final hasta cerrar US2–US5 y controles. Validar el recorrido independiente antes de continuar.

### Incremental Delivery

Añadir US2 (errores/integridad), US3 (matriz de autenticación), US4 (navegación/modal/social)
y US5 (responsive/revisión visual) sin romper lo anterior. Mantener test:e2e empty/seeded
independientes y datos ficticios únicos. No exportar estado ni registrar contraseñas.

## Notes

- No hay backend, OAuth, sesión persistente, migración automática ni despliegue en estas tareas.
- Registro de entrada: [comando tasks](../../docs/prompts/002-tasks.md).
- Correcciones autorizadas tras analyze: pruebas de gateway movidas antes de implementación;
  IDs renumerados y dependencias revisadas. Histórico en docs/analisis-002-registro.md.
- La generación y esta corrección documental no inician implementación.

## Evidencia de implementación

Ver [informe](../../docs/implementacion-002.md). T055 y T056 permanecen pendientes en su
parte humana/dispositivo real; T059 detectó una licencia heredada no permitida en el árbol
de Secretlint. T058 completada: npm run verify terminó correctamente. Las marcas no sustituyen
revisión independiente ni acreditan aprobación de los pendientes.
