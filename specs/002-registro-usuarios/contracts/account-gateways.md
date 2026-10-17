# Contract: Registro y autenticación local

AuthGateway.authenticate(LoginCredentials): Promise<AuthResult> mantiene la firma de
[Login 001](../../001-login-billetera/contracts/auth-gateway.md).
RegistrationGateway.register recibe nombre, correo y contraseña ya validados; devuelve
success, duplicate-email o unavailable. El caso de uso registerAccount valida otra vez
RegistrationInput, incluyendo confirmación y términos, antes de delegar en ese puerto.
La confirmación no cruza el puerto de persistencia.

## Obligaciones

- Correo se normaliza con normalizeEmail existente; contraseña nunca se transforma.
- Alta duplicada devuelve duplicate-email y no modifica ninguna cuenta previa.
- Alta success se devuelve después de confirmar transacción duradera según garantías del navegador.
- Contraseña incorrecta y correo desconocido producen el mismo invalid-credentials.
- Sin configuración inicial se admiten altas y autenticación local; configuración inicial
  presente e inválida bloquea altas. Las cuentas locales válidas siguen autenticándose.
- Almacenamiento dañado o no disponible produce unavailable incluso si hay catálogo inicial;
  no aceptar silenciosamente cuentas mientras se ignora un estado local desconocido.
- Error técnico nunca rechaza hacia UI ni incluye excepciones, credenciales o PII en resultados.
- SecurityEvents es un puerto inyectado de eventos estructurados con código cerrado,
  operación y resultado; no recibe email, nombre, contraseña, payload ni claves.
- Login limpia contraseña y enfoca el campo tras fallo como en 001; éxito muestra nombre.

main.tsx conecta almacenamiento/protección/gateway, casos de uso y UI. Dominio y aplicación
no importan IndexedDB, window, CryptoKey ni componentes React.

Pruebas de contrato aplican tanto a dobles como al adaptador real. Se amplía la semántica
C4 de Login 001: configuración ausente no implica unavailable si la cuenta local está disponible.

## Configuración inicial y colisiones posteriores

loadDemoAccounts deberá devolver absent, valid(accounts) o invalid, adaptando sus consumidores.
undefined significa absent; cadena vacía, JSON inválido, catálogo vacío o cuentas inválidas
significan invalid. Las cuentas y reglas válidas siguen las del loader existente.

| Estado inicial, con bóveda íntegra | Registro | Login |
| --- | --- | --- |
| absent | Permitido con unicidad local | Cuenta local válida o invalid-credentials si no coincide. |
| valid | Unicidad contra ambas fuentes | Cuenta única coincidente; correo desconocido o contraseña errónea: invalid-credentials. |
| invalid | unavailable | Cuenta local coincidente permitida; contraseña errónea de cuenta local: invalid-credentials; correo no resuelto: unavailable. |

Colisión de correo entre configuración válida y cuenta local creada previamente: ese Login
siempre devuelve unavailable y muestra el mensaje genérico de indisponibilidad existente,
aunque una contraseña coincida. No sobrescribir, priorizar ni intentar identidades alternativas.
Las cuentas sin colisión permanecen operativas; Registro sigue rechazando el correo ocupado.
Registrar solo el código de conflicto sin datos de identidad. No incluye migración ni solución
automática de la colisión. Fallo de almacenamiento sigue teniendo precedencia y falla cerrado.

## Puerto de disponibilidad para Reintentar

AccountAvailabilityGateway.ensureAvailable(): Promise<AvailabilityResult> devuelve
`{ kind: 'ready' }` o `{ kind: 'unavailable' }`, sin credenciales ni error técnico público.
El caso de uso createEnsureAccountAvailability reside en application/ensureAccountAvailability.ts,
recibe este puerto y SecurityEvents y convierte rechazos internos en unavailable.
BrowserAccountGateway implementa el puerto; main.tsx inyecta el caso de uso en App/Registro.
UI no importa infraestructura, IndexedDB ni CryptoKey.

Cada llamada intenta abrir base y validar la bóveda si existe, con el timeout 5000 ms por
intento del contrato de persistencia. No crea claves ni fila de cuentas, no ejecuta register
ni authenticate. Una base válida sin fila devuelve ready; el futuro register inicializa
atómicamente. Corrupción o clave ausente en fila existente produce unavailable sin borrar.
No inicia sesión ni convierte datos del formulario en cuenta ni los registra en eventos.

En UI, Reintentar conserva campos/checkbox y bloquea reintentos simultáneos. ready elimina
solo el error de disponibilidad y permite pulsar Crear cuenta manualmente; unavailable
mantiene error y habilita nuevo reintento. No mostrar aviso de alta ni navegar por ready.
Probar contratos/caso de uso y UI antes de implementar, incluidos resultados tardíos.
