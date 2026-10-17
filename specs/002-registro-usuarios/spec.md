# Feature Specification: Registro de Usuarios de KynWallet

**Feature Branch**: `feature/registro-alexander-huerta` (rama existente; la especificación tiene identidad independiente `002-registro-usuarios`)

**Created**: 2026-10-17

**Status**: Draft — pendiente de revisión del usuario; contexto visual consultado mediante MCP.

**Input**: Crear Registro de Usuarios como funcionalidad independiente de `001-login-billetera`, con nombre completo, correo, contraseña, confirmación, términos obligatorios, validación inline, prevención de duplicados y conservación de cuentas tras recargar. Integrar la autenticación simulada con `/login`; mostrar el éxito exacto solicitado; ofrecer Google/Apple con alert «Próximamente» y presentación responsive de dos paneles en escritorio y solo formulario en móvil. Sin backend real. Generar únicamente la especificación y artefactos propios de `speckit-specify` para revisión previa del usuario.

**Fuente de verdad**: este documento define Registro y los cambios explícitos al contrato de Login necesarios para el recorrido completo. El usuario debe revisarlo antes de continuar.

### Referencias y estado del diseño

- [Constitución 1.0.0](../../.specify/memory/constitution.md): principios I–IV, seguridad 5.1–5.5, conformidad documental 6.1–6.5, accesibilidad 8.4, reutilización y diseño 8.5–8.6, trazabilidad 9.2. Sus obligaciones de ingeniería siguen vigentes para fases posteriores; este documento no concede excepciones ni prescribe arquitectura.
- [Login 001](../001-login-billetera/spec.md): validaciones, normalización del correo, mensajes de error, bienvenida personalizada, cierre de sesión y límites de la simulación.
- [Referencia de Figma: 04 · Registro](https://www.figma.com/design/wuPFwEdJFAhHz9d41yUzOq/Billetera-Virtual---Prototipos--copia-?node-id=31-2): archivo copiado `wuPFwEdJFAhHz9d41yUzOq`, página `0:1`, frame `31:2`.

**VIS-001 — Acceso confirmado el 2026-10-17**: se consultó `get_design_context` mediante MCP para el frame `31:2`, incluyendo su captura. Esta evidencia sustituye el bloqueo del borrador anterior y la referencia al archivo original. Los siguientes valores proceden del contexto del frame; no son supuestos ni decisiones de implementación.

### Referencia visual observada

| Aspecto | Evidencia del frame «04 · Registro» |
| --- | --- |
| Distribución | Lienzo de 1440 × 1024 px, fondo blanco; panel izquierdo de marca de 620 × 1024 px y formulario en el área derecha. Columna de formulario de 400 px, inicio en x=820, encabezado en y=140. |
| Panel de marca | Degradado naranja de `#FF8A65` a `#EF5226`; logotipo blanco KynWallet en la parte superior (x=56, y=64). Titular en dos líneas «Comienza tu» / «camino financiero.» y apoyo «Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar.». |
| Tarjeta decorativa | Kyn Card de 360 × 210 px en x=56, y=750; radio 22 px, blanco al 16 % y borde blanco al 35 %, chip dorado. Número enmascarado terminado en 4827, titular ilustrativo STEVEN LUNA y vencimiento 12/29; no representan una cuenta ni una tarjeta funcional. |
| Tipografía | Inter; marca 26 px/700; titular del panel 44 px/700 con interlineado 1,08; apoyo 17 px/400 con interlineado 1,5; encabezado «Crea tu cuenta» 30 px/700; subtítulo «Completa tus datos para comenzar» 16 px/400; etiquetas 14 px/500; contenido de campos 15 px/400; acción principal 16 px/600. |
| Paleta del formulario | Encabezado `#16182C`, etiquetas `#3D3F5C`, textos secundarios `#8A8BA8`, placeholders `#A9ABC2`, bordes y divisores `#D7D9E6`, fondo blanco; botón principal `#FF6B3D` con texto blanco y enlaces `#EF5226`. Son valores observados, sujetos a la prioridad de accesibilidad indicada abajo. |
| Campos | Cuatro controles de 400 × 52 px, radio 12 px, borde 1,5 px, texto a 16 px del borde izquierdo. Sus bordes superiores están en y=246, 338, 430 y 522. Nombre: «Ej: Diego Martínez»; correo: «tucorreo@ejemplo.com»; contraseñas enmascaradas con control visual de visibilidad en cada una. |
| Términos y acción | Checkbox de 20 × 20 px y radio 6 px, texto «Acepto los términos y condiciones»; botón «Crear cuenta» de 400 × 52 px con radio 12 px, en y=628. |
| Opciones y pie | Divisor «o regístrate con»; Google y Apple en la misma fila, cada botón de 192 × 48 px con radio 12 px y separación de 16 px. El frame usa círculos grises como marcas visuales de proveedores; no se deducen logotipos oficiales inexistentes. Pie «¿Ya tienes cuenta? Inicia sesión» de 14 px, enlace semibold naranja. |

Estas medidas definen el estado inicial de escritorio como referencia comparativa, no coordenadas rígidas para cualquier ventana. Los errores inline deben ampliar el espacio necesario sin superponer ni ocultar controles. Se reutilizarán componentes y estilos existentes compatibles con esta referencia conforme a la constitución 8.5–8.6.

El frame no contiene una variante móvil ni estados de error, foco, carga o éxito. Su comportamiento se define en los requisitos; el umbral responsive está confirmado en S-006 y Clarifications. La constitución 8.4 prevalece sobre cualquier combinación de colores del prototipo que no cumpla WCAG 2.1 AA: las correcciones mínimas de contraste deben quedar documentadas en la revisión visual, conservando jerarquía y familia cromática. No se presume que los colores observados hayan superado una auditoría de accesibilidad.

## Clarifications

### Session 2026-10-17

- Ajuste confirmado tras análisis: si una configuración inicial válida posterior duplica el correo de una cuenta local, rechazar ese acceso por indisponibilidad genérica, sin priorizar fuentes ni sobrescribir; mantener operativas las demás cuentas.

- Q: ¿Qué debe ocurrir al pulsar «términos y condiciones» en Registro? → A: Abrir un modal con un texto de demostración, identificado como tal y sin validez legal (opción B).
- Q: ¿Qué nombres debe aceptar el campo «Nombre completo»? → A: Entre 1 y 80 caracteres tras quitar espacios periféricos, con al menos dos palabras para nombre y apellido (opción B).

- Q: ¿Debe seguir visible el mensaje «Cuenta creada correctamente. Ya puedes iniciar sesión» si el usuario recarga `/login` antes de iniciar sesión? → A: Se muestra al llegar desde Registro y desaparece al recargar o abandonar Login; la cuenta permanece disponible (opción A).

- Q: ¿A partir de qué ancho debe mostrarse el panel de marca junto al formulario? → A: Dos paneles desde 1024 px; solo formulario entre 320 y 1023 px (opción A).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear una cuenta y acceder después de recargar (Priority: P1)

Como visitante, quiero crear una cuenta de demostración y entrar posteriormente con sus credenciales, para comprobar el recorrido completo de Registro y Login.

**Why this priority**: una redirección o un mensaje de éxito sin poder usar la cuenta creada no satisface el objetivo principal.

**Independent Test**: con un correo disponible, completar Registro, comprobar la llegada a `/login`, recargar, iniciar sesión con los datos recién registrados, verificar el nombre en la bienvenida y cerrar sesión.

**Acceptance Scenarios**:

1. **Given** Registro abierto y un correo disponible, **When** se completa un nombre válido, correo válido, contraseña admitida y confirmación idéntica, se aceptan los términos y se pulsa «Crear cuenta», **Then** se conserva una única cuenta, se navega a `/login` y aparece exactamente «Cuenta creada correctamente. Ya puedes iniciar sesión». El visitante todavía no está autenticado.
2. **Given** una cuenta creada, **When** se recarga `/login` y se envían el correo y la contraseña registrados, **Then** se permite el acceso y el formulario se reemplaza por la bienvenida personalizada con el nombre registrado y el botón «Cerrar sesión» de Login 001.
3. **Given** la bienvenida, **When** se pulsa «Cerrar sesión», **Then** vuelve el formulario de Login vacío y sin mensajes, pero la cuenta continúa disponible para otro acceso.
4. **Given** una cuenta creada en el mismo sitio y perfil de navegador, **When** se vuelve a abrir la demostración sin borrar sus datos, **Then** se puede iniciar sesión con ella; la existencia de la cuenta no restaura una sesión iniciada.
5. **Given** un alta en procesamiento, **When** se repite el clic o se pulsa Enter varias veces, **Then** se procesa una sola alta, se comunica el estado de procesamiento y se bloquean nuevos envíos hasta terminar.
6. **Given** un fallo al conservar la cuenta o recuperar de forma fiable las cuentas existentes, **When** se intenta completar el alta, **Then** se informa el fallo en Registro sin éxito ni redirección ni sobrescritura de cuentas anteriores.

---

### User Story 2 - Corregir errores y evitar cuentas duplicadas (Priority: P1)

Como visitante, quiero recibir errores claros junto a cada control y saber si mi correo ya está registrado, para corregir los datos sin generar cuentas inválidas.

**Why this priority**: protege la integridad de las cuentas que utilizará Login.

**Independent Test**: enviar el formulario vacío, probar cada regla por separado, corregir sus errores e intentar un alta con un correo existente.

**Acceptance Scenarios**:

1. **Given** los cuatro campos vacíos y el checkbox desmarcado, **When** se envía el formulario, **Then** aparecen los cinco errores obligatorios junto a sus controles, el foco pasa al primer error y no se crea ninguna cuenta.
2. **Given** los demás controles válidos, **When** se ingresa un correo como `usuario@` o `usuario.com` y se sale del campo o se envía, **Then** aparece «Ingresa un correo electrónico válido» y se impide el alta.
3. **Given** los demás controles válidos, **When** la contraseña tiene 7 caracteres, **Then** se rechaza con el error del mínimo; con 8 y 128 se supera la validación de longitud, y con 129 se rechaza con el error del máximo.
4. **Given** una confirmación con contenido diferente de la contraseña, **When** se valida, **Then** aparece «Las contraseñas no coinciden» junto a la confirmación y se impide el alta.
5. **Given** los cuatro campos válidos y los términos sin aceptar, **When** se pulsa «Crear cuenta», **Then** aparece «Debes aceptar los términos y condiciones» junto al checkbox y no se crea una cuenta.
6. **Given** un correo registrado, **When** se intenta otra alta con ese correo, incluso con diferencias de mayúsculas o espacios periféricos, **Then** aparece «Este correo ya está registrado» junto al correo, no se crea una segunda cuenta ni se cambian los datos de la original.
7. **Given** un error inline, **When** se corrige su causa, **Then** desaparece ese error y se conservan los demás datos. Cambiar la contraseña reevalúa su coincidencia con la confirmación.
8. **Given** un alta rechazada, **When** se inicia sesión con una cuenta anterior y sus credenciales originales, **Then** la cuenta sigue funcionando sin modificaciones.
9. **Given** los demás controles válidos, **When** se valida un nombre de una sola palabra como «Diego», **Then** aparece «Ingresa al menos tu nombre y un apellido» junto al nombre y se impide el alta; «Diego Martínez» supera esta regla. Los espacios periféricos o repetidos no convierten una sola palabra en dos.

---

### User Story 3 - Verificar realmente las credenciales en Login (Priority: P1)

Como titular de una cuenta, quiero acceder solo con mi correo y contraseña correctos, para que la simulación compruebe la cuenta registrada.

**Why this priority**: valida la integración y evita una simulación que acepte cualquier contraseña.

**Independent Test**: preparar una cuenta mediante Registro, recargar y probar contraseña incorrecta, correo desconocido y credenciales correctas.

**Acceptance Scenarios**:

1. **Given** una cuenta creada, **When** Login recibe su correo con una contraseña incorrecta de longitud válida, **Then** muestra «Correo o contraseña incorrectos» y no permite el acceso.
2. **Given** un correo desconocido con formato válido, **When** se envía con una contraseña de longitud válida, **Then** se muestra el mismo mensaje genérico, sin revelar si existe el correo.
3. **Given** una cuenta creada, **When** su correo se escribe con mayúsculas o espacios periféricos y la contraseña exacta, **Then** el acceso funciona; las diferencias en mayúsculas o espacios de la contraseña sí causan rechazo.
4. **Given** un intento de acceso fallido, **When** se presenta el error, **Then** se conserva el correo, se vacía la contraseña y se enfoca ese campo; al modificar cualquiera de los campos desaparece el error de autenticación, conforme a Login 001.
5. **Given** cuentas iniciales válidas de la demostración sin conflicto con cuentas locales, **When** se agrega una cuenta desde Registro, **Then** las iniciales y la nueva pueden iniciar sesión y todos sus correos se consideran ocupados para futuras altas.
6. **Given** una configuración inicial válida posterior con un correo ya presente en una cuenta local, **When** se intenta acceder con ese correo, **Then** se muestra el mensaje genérico de servicio de acceso no disponible, no se autentica con ninguna de las dos cuentas ni se sobrescriben sus datos. Las otras cuentas sin conflicto siguen funcionando; Registro rechaza ese correo como ocupado. No hay migración ni elección automática de identidad.

---

### User Story 4 - Navegar y reconocer funciones futuras (Priority: P2)

Como visitante, quiero ir a Login o conocer la disponibilidad de los proveedores sociales, para elegir cómo continuar.

**Why this priority**: conecta los recorridos y hace explícitas las acciones disponibles.

**Independent Test**: activar Google, Apple y el enlace de Login desde Registro; después activar «Regístrate» desde Login.

**Acceptance Scenarios**:

1. **Given** Registro con datos ingresados, **When** se activa Google o Apple, **Then** aparece un alert con el texto exacto «Próximamente», se permanece en Registro y se conservan campos y aceptación de términos, sin crear cuenta ni sesión.
2. **Given** Registro, **When** se activa «¿Ya tienes cuenta? Inicia sesión», **Then** se navega a `/login` sin crear cuenta ni mostrar un éxito de registro.
3. **Given** Login, **When** se activa «Regístrate», **Then** se navega a `/registro`, sustituyendo únicamente para ese enlace el aviso de función no disponible de Login 001.
4. **Given** la llegada a Login después de un alta exitosa, **When** se muestra su formulario, **Then** los campos están vacíos y el éxito se anuncia a tecnologías de asistencia. El aviso desaparece al recargar o abandonar Login y no reaparece en visitas independientes posteriores; la cuenta creada sigue disponible.
5. **Given** Registro con datos ingresados, **When** se activa «términos y condiciones», **Then** se abre un modal con un texto de demostración identificado como «Contenido de demostración, sin validez legal», sin navegar ni enviar el formulario. Abrirlo o cerrarlo no modifica los campos ni la aceptación del checkbox.
6. **Given** el modal abierto, **When** se utiliza teclado o lector de pantalla, **Then** se anuncia su título, el foco permanece dentro del modal y puede cerrarse con Escape o con un botón «Cerrar»; al cerrarlo el foco vuelve al enlace que lo abrió.

---

### User Story 5 - Usar Registro en escritorio, móvil y con teclado (Priority: P2)

Como visitante, quiero completar el formulario en mi dispositivo y con tecnologías de asistencia, para utilizar el registro sin barreras.

**Why this priority**: responsive es explícito y la accesibilidad es obligatoria por constitución.

**Independent Test**: revisar a 320, 375, 768, 1024 y 1440 px, recorrer los controles con teclado y comprobar el anuncio de errores y resultados. Los anchos son una propuesta de verificación, no medidas extraídas de Figma.

**Acceptance Scenarios**:

1. **Given** un ancho desde 1024 px, **When** se presenta Registro, **Then** aparecen dos paneles, uno de marca con el contenido documentado en la referencia visual y otro con el formulario completo.
2. **Given** un ancho inferior a 1024 px, **When** se presenta Registro, **Then** solo aparece el panel del formulario, incluyendo términos, botones sociales y enlace de Login, sin desplazamiento horizontal desde 320 px.
3. **Given** el formulario, **When** se utiliza solo teclado y se envía con Enter, **Then** todos sus controles se pueden alcanzar con orden lógico y foco visible, y se aplican las mismas reglas que al pulsar «Crear cuenta».
4. **Given** un control inválido o un resultado de operación, **When** se usa lector de pantalla, **Then** se anuncia su mensaje asociado; el estado no depende únicamente del color.
5. **Given** contraseña y confirmación, **When** se abre Registro, **Then** ambas ocultan sus caracteres y permiten mostrar u ocultar su propio valor mediante controles accesibles, sin enviarlo ni modificarlo.
6. **Given** Registro inicial a 1440 × 1024 px, **When** se compara con el frame `31:2`, **Then** coinciden distribución, textos, jerarquía Inter, paleta y dimensiones de componentes descritas en la referencia visual, salvo ajustes de contraste documentados para cumplir WCAG 2.1 AA. Los errores, al aparecer, desplazan el contenido sin superposición.

### Edge Cases

- Nombre o correo con solo espacios: se consideran vacíos. El nombre exige al menos dos palabras no vacías separadas por espacios; espacios repetidos no cuentan como palabras. Se admiten acentos, apóstrofos y guiones, pero una sola palabra, incluso con guion, se rechaza.
- Nombre de 80 caracteres y correo de 254: se admiten si cumplen las demás reglas; 81 y 255 respectivamente producen error inline. La longitud se evalúa después de quitar espacios periféricos.
- Contraseña con espacios o mayúsculas: se respeta exactamente; no se recorta ni se transforma. No se agregan reglas de complejidad adicionales a la longitud.
- Confirmación vacía: se muestra obligatoriedad antes que falta de coincidencia. Si hay varios errores en controles distintos, todos se presentan en el intento de envío.
- Pegar o autocompletar contenido aplica las mismas reglas que escribirlo manualmente.
- Desmarcar términos antes de enviar bloquea el alta aunque todos los campos ya se hayan validado.
- Dos solicitudes casi simultáneas con el mismo correo: como máximo se crea una cuenta, sin sobrescribir la primera.
- No poder recuperar las cuentas o encontrar datos locales dañados no autoriza a borrarlas silenciosamente ni a omitir la comprobación de duplicados; se informa el fallo.
- Si no hay configuración inicial de cuentas, una cuenta creada y conservada correctamente desde Registro debe permitir el acceso. Un fallo real al recuperar sus datos produce indisponibilidad, nunca aceptación de cualquier contraseña.
- Recargar desde la bienvenida termina el estado de acceso, manteniendo la cuenta. Cerrar sesión tampoco elimina cuentas.
- Borrar datos del sitio, cambiar de navegador/perfil o utilizar un contexto que descarte sus datos puede eliminar la cuenta local; no se promete recuperación ni sincronización.
- Abrir directamente o recargar `/registro` y `/login` permite acceder a sus pantallas. Un formulario incompleto no se conserva como cuenta.
- Al pasar de 1023 a 1024 px aparece el panel de marca; al volver a 1023 px se oculta sin perder valores, errores ni aceptación de términos del formulario.

## Requirements *(mandatory)*

### Functional Requirements

**Procedencia**: **C** = confirmado por la solicitud o por respuestas en Clarifications; **L** = heredado de Login o constitución; **S** = supuesto explícito para revisión, detallado en Assumptions; **F** = observado mediante MCP en el frame de Figma.

| ID | Procedencia | Requisito verificable | Criterios de aceptación |
| --- | --- | --- | --- |
| FR-001 | C | Registro DEBE mostrar Nombre completo, Correo electrónico, Contraseña y Confirmar contraseña, checkbox de términos, «Crear cuenta», Google, Apple y «¿Ya tienes cuenta? Inicia sesión». | Historias 1.1, 2.1 y 4.1–4.2 |
| FR-002 | C, L, S | Los cuatro campos DEBEN ser obligatorios. Nombre DEBE tener de 1 a 80 caracteres y al menos dos palabras no vacías separadas por espacios; correo DEBE tener formato válido y hasta 254 caracteres. Nombre y correo se validan tras quitar espacios periféricos. | Historia 2.1–2.2, 2.9 y límites de nombre/correo |
| FR-003 | C, L | Contraseña DEBE tener de 8 a 128 caracteres y coincidir exactamente con la confirmación. No se DEBEN modificar sus valores para comparar. | Historias 2.3–2.4 y 3.3 |
| FR-004 | C, S | El checkbox DEBE estar desmarcado inicialmente y requerir aceptación explícita en cada alta. | Historia 2.1 y 2.5; caso límite de desmarcado |
| FR-005 | C, L | «Crear cuenta» DEBE validar todos los controles antes de procesar el alta. Si hay errores, DEBE impedir el alta, mostrar mensajes junto a sus controles y enfocar el primer control inválido. | Historia 2.1–2.5 |
| FR-006 | C, L, S | Los campos DEBEN validarse al salir y al enviar; sus errores DEBEN desaparecer al corregirse. La coincidencia DEBE reevaluarse cuando cambia cualquiera de las contraseñas. Tras su primera validación, cambiar la aceptación DEBE actualizar su error. | Historia 2.7 |
| FR-007 | C, L | El correo DEBE ser único, sin distinguir mayúsculas ni espacios periféricos. Duplicados de cuentas iniciales o creadas DEBEN rechazarse inline sin sobrescribir datos. | Historias 2.6, 2.8 y 3.5 |
| FR-008 | C | El alta DEBE conservar una cuenta que permita iniciar sesión tras recargar o volver a visitar el mismo sitio en el mismo navegador, mientras sus datos locales se conserven. Conservar solo el éxito no cumple el requisito. | Historia 1.1–1.4 |
| FR-009 | C | Solo tras conservar correctamente la cuenta se DEBE navegar a `/login` y mostrar exactamente «Cuenta creada correctamente. Ya puedes iniciar sesión». No se DEBE autenticar automáticamente. | Historia 1.1 y 1.6 |
| FR-010 | C, L | Login DEBE comprobar las credenciales de las cuentas creadas, aceptar solo las coincidentes y mostrar su nombre en la bienvenida. Credenciales incorrectas DEBEN producir «Correo o contraseña incorrectos», sin revelar existencia del correo. Si un correo aparece a la vez en una configuración inicial válida y en una cuenta local, se DEBE rechazar ese acceso por indisponibilidad genérica sin sobrescribir ni priorizar fuentes, manteniendo operativas las cuentas sin conflicto. | Historias 1.2 y 3.1–3.6 |
| FR-011 | C, L | Registro y Login DEBEN ser simulados, sin backend real. Una cuenta creada correctamente DEBE poder acceder aunque no existan cuentas iniciales configuradas. | Historia 1.2 y caso límite de configuración ausente |
| FR-012 | C | Google y Apple en Registro DEBEN mostrar un alert «Próximamente» sin enviar, registrar, autenticar, navegar ni alterar el formulario. | Historia 4.1 |
| FR-013 | C, S | El enlace de Registro DEBE navegar a `/login`; «Regístrate» en Login DEBE abrir `/registro`. Ambas rutas DEBEN funcionar con acceso directo y recarga. | Historia 4.2–4.3 y caso límite de rutas |
| FR-014 | C, L | Desde 1024 px Registro DEBE mostrar dos paneles; por debajo, solo el formulario. Todos los controles DEBEN ser utilizables sin desplazamiento horizontal desde 320 px. Cambiar entre ambas distribuciones NO DEBE perder valores, errores ni aceptación de términos. | Historia 5.1–5.2 y caso límite 1023/1024 px |
| FR-015 | L | Registro y su integración DEBEN cumplir WCAG 2.1 AA, con etiquetas asociadas, errores y resultados anunciados, contraste suficiente, foco lógico y visible y operación por teclado. | Historias 4.4 y 5.3–5.4; revisión de accesibilidad |
| FR-016 | L, F | Ambas contraseñas DEBEN ocultarse inicialmente y ofrecer visibilidad independiente accesible. Enter DEBE aplicar las mismas reglas y envío que «Crear cuenta». | Historia 5.3 y 5.5 |
| FR-017 | L | Contraseña y confirmación NO DEBEN exponerse en URL, mensajes, registros ni archivos versionados. No se DEBE conservar una contraseña legible ni la confirmación en el navegador. La cuenta conservada DEBE permitir verificar la contraseña sin recuperarla como texto legible; los datos personales DEBEN protegerse y cifrarse en reposo conforme a la constitución 5.4. | Inspección de datos conservados, mensajes, URL, registros y archivos durante los recorridos 1–3 |
| FR-018 | C, L, S | El procesamiento DEBE comunicarse y bloquear envíos adicionales. Un fallo de conservación o recuperación DEBE producir un error comprensible sin detalles internos, sin éxito aparente ni pérdida de cuentas existentes. | Historia 1.5–1.6 y casos límite de duplicación/fallo |
| FR-019 | L, S | Cerrar sesión DEBE restituir Login vacío sin mensajes y conservar las cuentas. Recargar NO DEBE restaurar una sesión iniciada. El aviso de alta DEBE aparecer en la llegada posterior al éxito, desaparecer al recargar o abandonar Login y no reaparecer en visitas independientes. | Historias 1.3–1.4 y 4.4; caso límite de recarga |
| FR-020 | C, F, L | Registro DEBE tomar como referencia la distribución, textos, tipografía, colores y componentes documentados del frame `31:2`. En móvil solo se DEBE mostrar el formulario. Los estados adicionales DEBEN conservar esa jerarquía, permitir el crecimiento por errores y cumplir la accesibilidad constitucional. | Historia 5.1–5.6 y referencia visual observada |

| FR-021 | C, L | «términos y condiciones» DEBE abrir un modal accesible con texto de demostración y la identificación «Contenido de demostración, sin validez legal». DEBE poder cerrarse con «Cerrar» o Escape y devolver el foco al enlace. Abrirlo o cerrarlo NO DEBE alterar el formulario ni aceptar términos automáticamente. | Historia 4.5–4.6 |

### Mensajes inline

Salvo los textos de éxito y «Próximamente», fijados por el usuario, se proponen los siguientes textos para mantener coherencia con Login.

| Situación | Mensaje |
| --- | --- |
| Nombre vacío | Ingresa tu nombre completo |
| Nombre mayor de 80 caracteres | El nombre debe tener como máximo 80 caracteres |
| Nombre con una sola palabra | Ingresa al menos tu nombre y un apellido |
| Correo vacío | Ingresa tu correo electrónico |
| Correo mal formado | Ingresa un correo electrónico válido |
| Correo mayor de 254 caracteres | El correo debe tener como máximo 254 caracteres |
| Correo duplicado | Este correo ya está registrado |
| Contraseña vacía | Ingresa tu contraseña |
| Contraseña menor de 8 caracteres | La contraseña debe tener al menos 8 caracteres |
| Contraseña mayor de 128 caracteres | La contraseña debe tener como máximo 128 caracteres |
| Confirmación vacía | Confirma tu contraseña |
| Confirmación distinta | Las contraseñas no coinciden |
| Términos sin aceptar | Debes aceptar los términos y condiciones |
| Fallo de conservación o recuperación durante el alta | No se pudo completar el registro. Intenta de nuevo. |

Por control, se prioriza obligatoriedad, luego longitud y después formato (incluido el mínimo de dos palabras del nombre) o coincidencia. Duplicado se informa para un correo con formato válido. El fallo de operación puede mostrarse junto al formulario, pues no corresponde a un control concreto. Los errores de credenciales e indisponibilidad del acceso mantienen el contrato de Login.

### Key Entities *(include if feature involves data)*

- **Cuenta de demostración**: nombre de presentación, correo único normalizado y capacidad de verificar la contraseña registrada sin conservarla legible. Puede ser inicial o creada en Registro. Su permanencia no constituye una sesión.
- **Solicitud de registro**: datos de los cuatro campos y aceptación de términos. La confirmación solo participa en la validación; un borrador no es una cuenta persistida.
- **Aceptación de términos**: consentimiento afirmativo requerido para crear la cuenta; no implica suscripciones ni consentimientos comerciales adicionales.
- **Resultado del alta**: éxito únicamente cuando la cuenta queda conservada y disponible para Login; de otro modo, errores de controles u operación. El aviso de éxito no contiene credenciales.
- **Estado de acceso simulado**: estado temporal que habilita la bienvenida, eliminado al cerrar sesión o recargar y separado de la conservación de la cuenta.

### Integración y cambios al contrato de Login 001

- Se conservan Login FR-003–FR-010: validación compatible, normalización de correo, carga del acceso, error genérico y bienvenida personalizada. Se mantienen el tratamiento del intento fallido y el cierre de sesión de su historia 1 y FR-009a; «sin conservar datos del acceso anterior» significa limpiar el estado del acceso, no eliminar la cuenta registrada.
- Se amplía FR-007: el conjunto de cuentas admitidas incluye las creadas mediante Registro, también después de recargar. Una autenticación limitada a cuentas iniciales no satisface este nuevo recorrido.
- Se precisa FR-011: las cuentas iniciales continúan viniendo de configuración externa; las nuevas provienen de los datos introducidos por el visitante. No se autoriza agregar sus credenciales al código fuente.
- Se conserva la prohibición de FR-012 sobre contraseñas en almacenamiento del navegador: la permanencia de la cuenta se exige sin conservar contraseña legible ni confirmación. El mecanismo de protección se resolverá posteriormente, respetando la constitución 5.3–5.4; esta especificación no aprueba excepciones de seguridad.
- Se sustituye únicamente «Regístrate» en FR-016 e historia 5 por navegación al Registro. «¿Olvidaste tu contraseña?» y los proveedores sociales de Login siguen con «Función no disponible en esta demostración». «Próximamente» se exige para los botones sociales de Registro.
- FR-017 «Recordarme» no cambia: no habilita persistencia. La cuenta creada permanece con independencia de esa casilla, pero no se recuerda una sesión ni se rellena su contraseña.
- Se amplían los supuestos de Login que excluían Registro y cuentas nuevas persistentes; se mantienen la ausencia de backend, de sesión persistente y la bienvenida como destino final del acceso.
- `001-login-billetera/spec.md` permanece como referencia; este documento define la ampliación funcional 002 para su integración posterior. No se identificaron BRD ni ARD en la documentación consultada; si se incorporan, deberá revisarse la coherencia conforme al principio VI.

### Alcance y límites

**Incluido**: formulario, aceptación y modal accesible de términos de demostración, validaciones inline, duplicados, conservación local de cuentas, autenticación con ellas tras recargar, integración con Login, bienvenida y cierre de sesión existentes, navegación entre pantallas, avisos sociales, responsive, accesibilidad, manejo de fallos y protección de los datos conservados.

**Fuera de alcance**: backend, cuentas reales, base de datos remota, OAuth, envío o verificación de correo, recuperación/cambio de contraseña, edición/eliminación de cuentas, sesión persistente, sincronización entre navegadores/dispositivos, administración, operaciones financieras y redacción/publicación de términos legales. El contenido de demostración del modal está incluido; no se publica un documento legal ni una página adicional de términos. La tarjeta del panel de marca es exclusivamente decorativa; no habilita operaciones financieras.

**Límite de esta ejecución**: `spec.md`, checklist de calidad y referencia de feature en `.specify/feature.json`. No se generan plan, tareas, código ni modificaciones a Login.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los recorridos con alta válida permite iniciar sesión con el correo y contraseña registrados después de recargar el mismo sitio/navegador y muestra el nombre correcto en la bienvenida.
- **SC-002**: El 100 % de los casos de obligatoriedad, formato, longitudes, coincidencia y términos inválidos impide el alta y muestra los errores junto a los controles afectados.
- **SC-003**: El 100 % de los intentos de correo duplicado, incluidas variantes de mayúsculas y espacios periféricos, conserva una sola cuenta y las credenciales originales siguen funcionando.
- **SC-004**: El 100 % de los intentos con contraseña incorrecta o correo desconocido, sin conflicto entre fuentes y con servicio disponible, rechaza el acceso con el mismo mensaje genérico, sin bienvenida. Los correos en conflicto producen indisponibilidad genérica sin bienvenida ni sobrescritura (historia 3.6).
- **SC-005**: El 100 % de las altas completadas llega a `/login` con el mensaje exacto de éxito; ninguna alta fallida produce ese éxito o esa redirección.
- **SC-006**: En los cinco anchos de prueba de la historia 5, todos los controles permiten completar el alta sin desplazamiento horizontal y se cumple la distribución establecida de uno o dos paneles.
- **SC-007**: Los recorridos principales son operables completamente con teclado y la revisión automatizada y manual no identifica incumplimientos WCAG 2.1 AA, incluidos anuncios de errores y resultados.
- **SC-008**: El 100 % de las activaciones de Google/Apple en Registro muestra «Próximamente» y conserva los datos, sin registrar ni autenticar.
- **SC-009**: Una persona con datos válidos preparados puede completar Registro y su primer Login en menos de 2 minutos y reconoce cuándo se creó su cuenta y cuándo accedió, sin asistencia.
- **SC-010**: En todos los casos de fallo al conservar o recuperar cuentas, no se produce éxito aparente ni pérdida o sobrescritura de cuentas previas.

- **SC-011**: La comparación del estado inicial a 1440 × 1024 px con el frame `31:2` verifica el 100 % de los aspectos de la tabla de referencia visual; toda diferencia por contraste queda identificada y justificada conforme a WCAG 2.1 AA. No faltan textos ni componentes observados y no hay superposiciones al mostrar errores.

## Assumptions

- **S-001 — Ruta**: se adopta `/registro`, pues la solicitud solo fijó explícitamente `/login`. Se hace navegable el enlace «Regístrate» existente para integrar ambos recorridos.
- **S-002 — Límites compatibles (nombre aclarado)**: nombre de hasta 80 caracteres tras quitar espacios periféricos, con al menos dos palabras no vacías separadas por espacios para nombre y apellido; se admiten acentos, apóstrofos y guiones. Regla confirmada en Clarifications e historia 2.9. Correo hasta 254 y contraseña hasta 128 caracteres se mantienen heredados de Login.
- **S-003 — Normalización**: se recortan espacios periféricos de nombre/correo y se ignoran mayúsculas del correo. Contraseña y confirmación no se modifican; se conserva la política de longitud sin complejidad adicional.
- **S-004 — Permanencia local**: la cuenta pertenece al mismo sitio y perfil del navegador, mientras se conserven sus datos. No se garantiza permanencia en contextos que los descarten, ni recuperación tras borrarlos. No se fija tecnología de almacenamiento.
- **S-005 — Éxito y sesión (aviso aclarado)**: el aviso de éxito aparece al llegar desde Registro y desaparece al recargar o abandonar Login, sin reaparecer en visitas independientes (decisión confirmada). Se mantiene el supuesto de que Login llega con campos vacíos tras el alta. La cuenta sobrevive a la recarga; la sesión no.
- **S-006 — Responsive (aclarado)**: dos paneles desde 1024 px y solo formulario entre 320 y 1023 px, confirmado en Clarifications. Estos anchos son decisiones de comportamiento, no medidas de una variante móvil de Figma.
- **S-007 — Coherencia**: idioma español; validación al salir y enviar; limpieza de errores al corregir; bloqueo de envíos en procesamiento. Se adoptan por coherencia con Login, no como detalles observados del frame. No se exige espera artificial en Registro.
- **S-008 — Términos (aclarado)**: el enlace abre un modal con texto de demostración identificado sin validez legal, conforme a FR-021 e historia 4.5–4.6. Se mantiene como supuesto la casilla inicialmente desmarcada; abrir o cerrar el modal no la acepta. La redacción de términos legales reales y su versionado siguen fuera de alcance.
- **S-009 — Cuentas iniciales**: siguen funcionando y reservan sus correos, salvo conflicto de correo entre fuentes: en ese caso el acceso de ese correo se rechaza por indisponibilidad genérica conforme a historia 3.6 y FR-010 (decisión confirmada por el usuario). Su ausencia no invalida una cuenta nueva conservada correctamente. No se incluye migración de identidades contradictorias entre configuraciones.
- **S-010 — Estados adicionales**: al no existir variantes de error, carga, foco o móvil en el frame consultado, se propone conservar la jerarquía visual y permitir crecimiento vertical para los mensajes. La fuente, paleta y contenido de escritorio sí proceden de Figma; los ajustes de contraste se rigen por la constitución.

**Estado para revisión**: aclaración completada con cuatro decisiones integradas sobre términos, nombre completo, aviso de éxito y responsive. Los demás supuestos permanecen explícitos; no se consideran confirmados por estas respuestas. Checklist de calidad revalidado. No se inicia planificación, generación de tareas ni implementación en esta ejecución.
