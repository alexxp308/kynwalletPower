# Configuración de herramientas

Guía del entorno utilizado en el curso. Ejecutar los comandos de terminal desde la
raíz del proyecto. La ejecución de la aplicación se explica en el [README](../README.md).

## Spec Kit y Codex

El proyecto ya contiene `.specify/`. Con Specify CLI instalado y soporte de integraciones,
se agrega Codex a un proyecto existente mediante:

```bash
specify integration install codex
specify integration use codex
specify integration status
```

La integración instala las habilidades `speckit-*` en `.agents/skills/`.
Se invocan en Codex con `$`, por ejemplo `$speckit-specify`.

### Error resuelto durante la migración

El estado mostró Codex como predeterminado, pero reportó diez archivos faltantes de
Claude: `managed-files-missing (claude)`. Claude seguía registrado sin sus archivos.
Como se decidió continuar con Codex, se ejecutó:

```bash
specify integration uninstall claude
specify integration status
```

La verificación posterior mostró `Integration status: OK`, con Codex como única
integración y cero archivos faltantes. Retirar Claude corresponde a esta migración;
no es necesario hacerlo si se desean conservar ambas integraciones.

## MCP de Figma para Codex en VS Code

Se utiliza el servidor remoto oficial. Codex CLI y su extensión de VS Code comparten
la configuración del mismo entorno de usuario.

```bash
codex mcp add figma --url https://mcp.figma.com/mcp
```

El comando puede iniciar la autorización en el navegador. Si hace falta iniciar sesión
después, ejecutar:

```bash
codex mcp login figma
codex mcp list
```

Autorizar con una cuenta con acceso al diseño. Recargar VS Code con `Ctrl+Shift+P` →
`Developer: Reload Window` y abrir una nueva sesión de Codex. En Codex CLI, `/mcp`
permite consultar los servidores activos.

La presencia en la lista confirma la configuración; el acceso al archivo debe
comprobarse realizando una consulta con las herramientas de Figma.

### Acceso al diseño: copia del archivo de Figma

Durante la consulta al archivo original, el MCP respondió:
`Looks like you don't have edit access to this file`.
El servidor ya estaba disponible; el bloqueo correspondía a los permisos sobre el archivo.

Para poder acceder a los estilos del diseño en este ejercicio, se creó una copia del
archivo en el espacio de Figma del usuario y se actualizó el enlace del
[prompt de Registro](prompts/002-registro-usuarios.md) para utilizar esa copia.

- [Archivo original del curso](https://www.figma.com/design/f7uDsv8sh6ZOtK2OitTqtg/Billetera-Virtual---Prototipos?node-id=31-2).
- [Copia utilizada en el ejercicio](https://www.figma.com/design/wuPFwEdJFAhHz9d41yUzOq/Billetera-Virtual---Prototipos--copia-?node-id=0-1).

La copia tiene otra clave de archivo. Se debe localizar el frame “04 · Registro”
dentro de ella y confirmar su nodo; no asumir que conserva el identificador del original.
Esta fue la solución utilizada en el curso, no un paso obligatorio para todos los archivos.

### Consulta de prueba

```text
Usa el MCP de Figma para consultar el frame “04 · Registro”:
https://www.figma.com/design/wuPFwEdJFAhHz9d41yUzOq/Billetera-Virtual---Prototipos--copia-?node-id=0-1

Describe su diseño sin modificar archivos. Si el nodo corresponde a un contenedor,
localiza el frame por su nombre y confirma el nodo consultado.
```

Referencia: [documentación oficial de MCP en Codex](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).
No guardar credenciales, tokens ni enlaces temporales de autorización en el repositorio.

## Instrucciones del agente

[AGENTS.md](../AGENTS.md) guía el trabajo de Codex y lo remite a la
[constitución](../.specify/memory/constitution.md). La constitución define los principios
del proyecto; los documentos en `specs/` definen cada funcionalidad.

[Volver al README](../README.md)

## Entorno de implementación y E2E

Usar Node >=24.15.0 (`nvm use` con .nvmrc), instalar dependencias con npm ci y Chromium con
`npx playwright install chromium`. `npm run test:e2e` ejecuta ambas variantes y
`npm run test:e2e:ui` abre el modo interactivo. No se requiere cuenta de Playwright ni cloud.
Puertos reservados: 4173/4174; no reutilizar servidores ajenos en ellos.

La validación de esta sesión usó Node y Chromium temporales en /tmp, sin modificar
instalaciones globales. Ver [informe de implementación](implementacion-002.md).

### Ver las pruebas mientras se ejecutan

Desde la raíz del proyecto, instalar Chromium si todavía no está disponible:

```bash
npx playwright install chromium
```

Abrir el modo visual de Playwright:

```bash
npm run test:e2e:ui
```

En la interfaz, seleccionar una prueba y pulsar **▶** para inspeccionar sus acciones y
resultados. Empezar por `registration.spec.ts`, que recorre Registro → Login → recarga →
iniciar sesión. Las pruebas llenan campos, pulsan botones y verifican los resultados.

No es necesario iniciar `npm run dev`: el comando genera los builds y Playwright levanta
los servidores locales de prueba automáticamente. Usar Node >=24.15.0.
