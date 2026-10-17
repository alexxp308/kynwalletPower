# Data Model: Registro de Usuarios

## Dominio

| Entidad | Campos | Reglas |
| --- | --- | --- |
| RegistrationInput | displayName, email, password, confirmation, termsAccepted | Nombre recortado <=80, al menos dos palabras; correo normalizado <=254; contraseña 8–128 exacta, confirmación idéntica; términos true. |
| RegisteredAccount | displayName, normalizedEmail, passwordVerifier | Correo único frente a cuentas iniciales y locales; no contiene contraseña ni confirmación. |
| RegistrationResult | success / validation-error / duplicate-email / unavailable | success no crea sesión; errores de campo tipados, sin detalles internos. |
| AuthResult existente | success(displayName) / invalid-credentials / unavailable | Contrato compatible con Login ampliado. |

Cuenta inicial conserva DemoAccount existente solo en memoria desde configuración externa;
no se aplica a los nombres iniciales la nueva regla de dos palabras retroactivamente.

## Infraestructura y persistencia

Base `kynwallet-demo`, versión 1, almacén `vault`, clave fija `accounts`.
Una fila atómica incluye schemaVersion=1, revision, encryptionKey y envelope.
La fila inicial contiene una colección vacía cifrada. CryptoKey AES-GCM-256 no extraíble,
usos encrypt/decrypt; no se exporta a JSON ni se escribe su material en archivos.

Envelope: iv aleatorio de 12 bytes nuevo en cada cifrado y ciphertext con tag GCM de 128 bits.
AAD constante de namespace y schemaVersion vincula el contenido al formato esperado.
Payload cifrado: lista de RegisteredAccount; verificador por cuenta con algoritmo PBKDF2,
hash SHA-256, iteraciones=600000, salt 16 bytes, resultado derivado 32 bytes.
No se persiste borrador, aceptación, confirmación, contraseña original, aviso ni sesión.

Validar formas, longitudes, versiones, algoritmos permitidos y unicidad tras descifrar.
No aceptar costes de derivación arbitrarios desde almacenamiento manipulado. Comparar
verificadores con recorrido completo de bytes, sin prometer tiempo constante en JavaScript.

## Estados

Formulario: pristine → editing/invalid → submitting → success (navegar) o error.
Bloqueo sincrónico de envío antes de await evita clic/Enter doble. Los errores borran solo
la causa corregida; contraseña revalida confirmación. No se remonta por cambios de ancho.

Persistencia: unread → ready o unavailable. Una versión desconocida, fallo de autenticidad,
clave faltante, cuota o bloqueo devuelve error; no borra datos. Si no hay fila, inicializar
atómicamente. Una actualización gana solo si su revisión leída sigue vigente.

Login: idle → submitting → authenticated o error. Cerrar sesión o recargar elimina acceso,
no cuentas; el aviso de alta desaparece al recargar o abandonar la pantalla.

Ver [contrato de persistencia](contracts/persistence.md).

## Configuración y apertura (ajuste confirmado)

InitialAccountConfig = absent | valid(accounts) | invalid. Solo raw === undefined es absent;
una cadena vacía o catálogo vacío explícito es invalid. No persistir este estado en la bóveda.
Si una fuente inicial válida y una local contienen el mismo correo, ese acceso devuelve
unavailable; no se modifica el registro y no hay prioridad ni migración automática.

Apertura: idle → opening → ready | unavailable. Límite 5000 ms; blocked no reinicia el reloj.
Reintentar crea un intento distinto; eventos de uno vencido no cambian estado ni inicializan
cuentas. No confundir este reintento con los tres intentos máximos de escritura por revisión.

## Resultado de disponibilidad

AvailabilityResult = ready | unavailable, separado de RegistrationResult y AuthResult.
No persiste; ready solo permite otro envío manual. Reintentar no crea fila/clave/cuenta,
no inicia sesión ni dispara aviso de éxito. UI conserva datos ante ambos resultados.
