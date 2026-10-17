# KynWallet · Login y Registro (demo)

Demostración funcional, solo del lado del cliente, de las pantallas de Login y Registro de la
billetera virtual KynWallet. Reproduce el diseño de Figma
([01 · Login](https://www.figma.com/design/f7uDsv8sh6ZOtK2OitTqtg/Billetera-Virtual---Prototipos?node-id=2-2)),
valida los campos y simula la autenticación contra cuentas ficticias, sin backend ni base de datos remota. Las cuentas nuevas se conservan cifradas en IndexedDB.

Especificación, plan y tareas: [`specs/001-login-billetera/`](specs/001-login-billetera/).

## Requisitos

- Node.js 24.15.0 o superior y npm 10 o superior. `.nvmrc` fija la versión validada.
- Chromium de Playwright para las E2E (`npx playwright install chromium`).

## Configuración

```bash
npm install
cp .env.example .env.local
```

Opcionalmente, edita `.env.local` para definir cuentas iniciales **ficticias** en `VITE_DEMO_USERS`:

```dotenv
VITE_DEMO_USERS=[{"email":"tu.correo@example.com","password":"minimo-8-caracteres","displayName":"Tu Nombre"}]
```

- `password`: de 8 a 128 caracteres. `displayName`: de 1 a 80 caracteres. Los correos no se pueden repetir.
- `.env.local` no se versiona: la Constitución del proyecto (regla 5.3) prohíbe credenciales en el
  código fuente o en archivos versionados.
- ⚠️ Al ser una aplicación solo-cliente, el valor de `VITE_DEMO_USERS` queda incluido en el bundle
  compilado. Usa únicamente cuentas ficticias.
- Si falta la variable, puedes crear una cuenta en `/registro` e iniciar sesión con ella.
- Una configuración presente e inválida bloquea nuevas altas; las cuentas locales íntegras
  siguen funcionando. Un correo en conflicto entre ambas fuentes produce indisponibilidad.

## Scripts

| Comando                           | Descripción                                                                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Servidor de desarrollo en <http://localhost:5173>                                                                                                     |
| `npm run build`                   | Typecheck y build de producción en `dist/`                                                                                                            |
| `npm run preview`                 | Sirve el build de producción                                                                                                                          |
| `npm test`                        | Ejecuta las pruebas una vez                                                                                                                           |
| `npm run test:watch`              | Pruebas en modo observación                                                                                                                           |
| `npm run test:coverage`           | Pruebas con cobertura (umbral: 80 %)                                                                                                                  |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                                                                                                     |
| `npm run verify`                  | Todos los controles de cumplimiento: lint, formato, tipos, pruebas con cobertura, build, auditoría de dependencias y licencias, y escaneo de secretos |

## Arquitectura

Clean Architecture ligera. Las dependencias apuntan hacia el dominio y ESLint lo verifica:

```text
src/
├── domain/          # Tipos, reglas de validación y textos. Sin React.
├── application/     # Caso de uso `authenticate` y puerto `AuthGateway`
├── infrastructure/  # `InMemoryAuthGateway` (simulación, 1 s) y `loadDemoAccounts`
├── ui/
│   ├── styles/      # Tokens de Figma (`tokens.css`) y estilos globales
│   ├── components/  # Button, TextField, PasswordField, Checkbox, SocialButton, Divider, Alert
│   ├── layout/      # BrandPanel
│   └── features/login/  # LoginScreen, LoginForm, WelcomeView, reducer y hook
├── App.tsx
└── main.tsx         # Raíz de composición (inyección de dependencias)
```

Las pruebas viven junto al código (`*.test.ts(x)`). Cada caso se nombra con el escenario o
requisito que verifica (por ejemplo, `US2-1`, `FR-012`) para mantener la trazabilidad.

## Notas de diseño

- **Contraste (pendiente de aprobación de diseño):** varios colores de Figma no alcanzan
  WCAG 2.1 AA (botón 2.83:1, enlaces 3.56:1, textos secundarios 3.28:1, bordes 1.40:1). Se
  usan variantes más oscuras del mismo tono (`--brand-700`, `--neutral-600`, `--neutral-border`
  en `src/ui/styles/tokens.css`). Detalle en `specs/001-login-billetera/research.md` (R3).
- Los iconos de Google, Apple y del control de visibilidad son los marcadores de posición del
  diseño de Figma.
- Fuera de alcance: recuperar contraseña, acceso real con Google/Apple, persistencia de
  "Recordarme" y bloqueo por intentos fallidos. Al activarlos se muestra un aviso.

## Documentación del curso

Este proyecto utiliza Spec Kit y Spec Driven Development (SDD). El prompt es la semilla;
la especificación revisada es la fuente de verdad de cada funcionalidad.

- [Configuración de herramientas](docs/configuracion-herramientas.md): Spec Kit,
  Codex, MCP de Figma y resolución del error de integración con Claude.
- [Proceso SDD y estado del ejercicio](docs/proceso-sdd.md): etapas, decisiones,
  artefactos existentes y trabajo pendiente.
- [Prompt de Registro de Usuarios](docs/prompts/002-registro-usuarios.md): requisitos
  y alcance de la generación de la especificación.
- [Instrucciones del agente](AGENTS.md) y [constitución](.specify/memory/constitution.md).

Login y Registro son funcionalidades de la demo;
su implementación y las verificaciones están registradas en [el informe](docs/implementacion-002.md).

## Registro y pruebas E2E

Desde Login usa «Regístrate» o abre `/registro`. El registro simulado valida nombre, correo,
contraseñas y términos; al completarse vuelve a `/login`. La cuenta persiste en el mismo
origen/perfil tras recargar; la sesión y el aviso de éxito no persisten. Borrar los datos
del sitio elimina las cuentas. Solo usar datos ficticios.

```bash
nvm use
npm ci
npx playwright install chromium
npm run dev
```

Pruebas automatizadas que abren Chromium, llenan campos y pulsan botones:

```bash
npm run typecheck:e2e
npm run test:e2e
npm run test:e2e:ui
npm run verify
```

E2E genera dos builds/servidores aislados (puertos 4173/4174), sin leer `.env.local`.
En Linux puede ser necesario `npx playwright install --with-deps chromium`.
Para desplegar una SPA estática, configurar el servidor para servir `index.html` al abrir
o recargar `/login` y `/registro`. Vite dev/preview ya permite probar estas rutas localmente.
