# Proceso SDD del curso

El prompt es la semilla. SDD genera los documentos, el usuario los revisa y ajusta,
y la especificación revisada se convierte en la fuente de verdad.

## Estado al 17 de octubre de 2026

| Elemento                 | Evidencia y estado                                                                                                                                                                                                                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login                    | Existen especificación, plan, tareas, investigación, contratos y código de la demo. Ver [001-login-billetera](../specs/001-login-billetera/).                                                                                                                                                               |
| Spec Kit y Codex         | Se migró de Claude a Codex y se corrigió el error de archivos faltantes. Ver [configuración](configuracion-herramientas.md).                                                                                                                                                                                |
| Instrucciones del agente | Se agregó [AGENTS.md](../AGENTS.md) para guiar el trabajo con SDD.                                                                                                                                                                                                                                          |
| Figma MCP                | Se usó una copia por falta de permisos en el original. Contexto y captura del frame 31:2 de la copia consultados mediante MCP el 2026-10-17. Ver [configuración](configuracion-herramientas.md).                                                                                                            |
| Registro                 | [Especificación](../specs/002-registro-usuarios/spec.md) generada y aclarada; usuario confirmó disposición para planificar. [Plan técnico](../specs/002-registro-usuarios/plan.md) y artefactos de diseño generados; [tareas](../specs/002-registro-usuarios/tasks.md) generadas, implementación pendiente. |

Esta revisión documental no acredita que se hayan ejecutado las pruebas de la aplicación
ni que el producto implementado coincida visualmente con Figma.

## Decisiones sobre Registro

- Será una funcionalidad independiente de Login, con prefijo `002` si está disponible.
- Se consultará el frame “04 · Registro” mediante el MCP de Figma usando la copia del
  archivo creada para acceder a los estilos, ya que el original devolvió un error de permisos.
- El registro será simulado, sin backend, y permitirá iniciar sesión con la cuenta creada
  después de recargar en el mismo navegador.
- Se impedirán correos duplicados y se rechazarán credenciales incorrectas.
- Estas decisiones deben incorporarse a la especificación y revisarse junto con las
  restricciones de seguridad de la constitución antes de implementar.
- La primera ejecución se limita a especificar; no autoriza plan, tareas ni código.

## Etapas y evidencias

Los comandos siguientes se introducen en una sesión de Codex cuando corresponda.
Esta guía no ejecuta ninguna etapa.

| Etapa                  | Habilidad / acción                             | Prompt o entrada registrada                                                                                                             | Resultado que revisar                                                                                                       |
| ---------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Especificar            | `$speckit-specify`                             | [Registro de Usuarios](prompts/002-registro-usuarios.md)                                                                                | [spec.md](../specs/002-registro-usuarios/spec.md) y [checklist](../specs/002-registro-usuarios/checklists/requirements.md). |
| Aclarar, si hace falta | `$speckit-clarify`                             | Sin archivo de prompt independiente; respuestas en [Clarifications](../specs/002-registro-usuarios/spec.md#clarifications).             | Decisiones incorporadas a la especificación.                                                                                |
| Planificar             | `$speckit-plan`                                | Ajustes registrados: [E2E con Playwright](prompts/002-plan-e2e.md) y [ajustes de integración](prompts/002-plan-ajustes-integracion.md). | [Plan](../specs/002-registro-usuarios/plan.md), investigación, modelo y contratos.                                          |
| Generar tareas         | `$speckit-tasks`                               | [Generación de tareas](prompts/002-tasks.md)                                                                                            | [tasks.md](../specs/002-registro-usuarios/tasks.md), orden y dependencias.                                                  |
| Revisar consistencia   | `$speckit-analyze`                             | Sin archivo de prompt independiente; ejecución descrita en el [informe de análisis](analisis-002-registro.md).                          | Hallazgos entre especificación, plan y tareas.                                                                              |
| Corregir hallazgos     | Edición documental autorizada tras el análisis | [Correcciones autorizadas](prompts/002-correcciones-analyze.md)                                                                         | Documentos alineados y [cierre de hallazgos](analisis-002-registro.md).                                                     |
| Implementar            | `$speckit-implement`                           | [Inicio de implementación](prompts/002-implement.md)                                                                                    | Código y [estado de las tareas](../specs/002-registro-usuarios/tasks.md).                                                   |
