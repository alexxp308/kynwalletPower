# Contract: Persistencia de cuentas

FR-007, 008, 017, 018. Ver [modelo](../data-model.md) y [decisiones R1–R3](../research.md).

## Lectura y escritura

1. Abrir base versionada y leer fila; si existe, validar clave, versión, revisión y envelope.
2. Si no existe, generar clave y payload vacío fuera de la transacción. En una transacción
   readwrite añadir la fila solo si sigue ausente. Si otra pestaña ganó, usar la fila ganadora.
3. Descifrar y validar toda la colección. No interpretar fallo como colección vacía.
4. Para registrar, verificar correo contra configuración inicial y colección local; derivar
   verificador y cifrar colección ampliada con IV nuevo fuera de la transacción.
5. En readwrite comprobar revisión; si coincide, put con revision+1. Si no coincide,
   repetir lectura y comprobación, hasta tres intentos. No reutilizar IV entre cifrados.
6. Resolver success solo al completar transacción. Ante abort/quota/error responder unavailable.

Así dos pestañas no sobrescriben sus altas y un correo duplicado solo tiene un ganador.
No borrar ni recrear base por errores, versiones no admitidas o pérdida de clave. No invocar
Web Crypto con await dentro de una transacción que dependa de seguir activa.

## Fallos verificables

Quota, acceso denegado, upgrade bloqueado, ciphertext alterado, claves ausentes, payload
inválido o versión desconocida deben impedir éxito y conservar los bytes anteriores.
Versionchange cierra conexiones para permitir upgrade; blocked se gestiona dentro del límite
de apertura de 5000 ms definido a continuación.
La capa de UI permite reintento explícito. No hay recuperación ni borrado automático.

## Límite de seguridad

Cifrado de registros en reposo y verificación derivada, sin garantía de clave protegida
físicamente ni defensa frente a scripts del mismo origen. HTTPS fuera de localhost.
No persistir claves como strings, logs de cuentas ni datos en localStorage/sessionStorage.
No usar información personal en índices, nombres de claves o mensajes diagnósticos.

## Límite de apertura y reintento

- Un intento de open vence a los 5000 ms, incluidos los periodos de blocked. Si termina antes,
  limpiar el temporizador y continuar; error inmediato produce unavailable sin esperar al límite.
- Al vencer, resolver unavailable una sola vez. UI muestra el mensaje genérico de operación y
  «Reintentar», sin éxito ni navegación. El reintento inicia open de nuevo, sin envío automático.
- Marcar intento como vencido y distinguir su identidad de la del siguiente. No simular que
  open se puede cancelar. success tardío cierra la conexión y no altera UI ni datos; si llega
  upgradeneeded con intento ya vencido, abortar la transacción de upgrade. No inicializar bóveda
  desde eventos de un intento vencido. Limpiar recursos al terminar o desmontar.
- No usar timeout de apertura como timeout arbitrario de una escritura ya en curso: el commit
  mantiene su contrato y no se anuncia fallo para luego crear una cuenta silenciosamente.
- Tres intentos por conflicto de revisión son un límite distinto; se mantienen sin borrar datos.

Probar 4999/5000 ms con reloj inyectado, blocked que se libera a tiempo, success tardío,
error inmediato, reintento correcto y ausencia de escrituras del intento vencido.

## Apertura de disponibilidad sin alta

La comprobación invocada por AccountAvailabilityGateway abre y valida sin crear fila de
bóveda, claves ni cuentas. Si la base aún no existe, su apertura puede crear el esquema
vacío; eso no representa inicialización ni registro. Una bóveda ausente es apta para
inicialización futura desde register; una fila presente dañada nunca equivale a ausencia.
