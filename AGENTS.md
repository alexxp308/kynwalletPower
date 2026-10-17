# Instrucciones para trabajar en KynWallet

## Flujo de desarrollo

Este proyecto utiliza Spec Kit y Spec Driven Development (SDD).

- Consulta `.specify/memory/constitution.md` antes de especificar,
  planificar o implementar cambios.
- Usa las habilidades `speckit-*` correspondientes a la etapa solicitada.
- Para funcionalidades existentes, revisa sus documentos en `specs/`.
- Para funcionalidades nuevas, utiliza la numeración configurada
  en Spec Kit.
- Respeta la etapa solicitada: generar una especificación no autoriza
  generar el plan, las tareas o la implementación.
- Si una petición contradice la especificación vigente, señala la
  diferencia y actualiza el documento según la decisión del usuario
  antes de implementar.

## Diseño

- Cuando se proporcione una referencia de Figma, consulta su contexto
  mediante MCP.
- Si no puedes acceder, informa la limitación y no inventes detalles.
- Reutiliza los componentes y estilos existentes cuando sean compatibles
  con la especificación y el diseño.

## Implementación y validación

- Mantén los cambios dentro del alcance solicitado.
- No agregues dependencias sin una necesidad concreta.
- Consulta `package.json` para identificar los comandos disponibles.
- Ejecuta las verificaciones apropiadas para los cambios realizados.
- Al terminar, indica qué cambió, qué verificaste y qué quedó pendiente.
