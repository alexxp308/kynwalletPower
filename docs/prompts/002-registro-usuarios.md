# Prompt: Registro de Usuarios

Este prompt documenta el origen de la funcionalidad para el curso. La especificación
revisada en `specs/002-registro-usuarios/spec.md`, cuando exista, será la fuente de verdad.

## Ajuste acordado

El registro será simulado, sin backend, y permitirá iniciar sesión con la cuenta creada
en el mismo navegador incluso después de recargar. El prompt ya incorpora esta decisión.

## Prompt para Codex

Pegar en una sesión de Codex abierta en la raíz del proyecto:

```text
$speckit-specify

Crear la funcionalidad Registro de Usuarios de KynWallet como una
nueva especificación, independiente de 001-login-billetera.
Usar numeración secuencial: 002 si está disponible.

Antes de redactar, consulta mediante el MCP de Figma el frame
“04 · Registro” del siguiente archivo:
https://www.figma.com/design/wuPFwEdJFAhHz9d41yUzOq/Billetera-Virtual---Prototipos--copia-?node-id=0-1&p=f&t=a6WwE5wjtrTNxYCa-0

Extrae su contexto visual y úsalo como referencia de distribución,
tipografía, colores y componentes. Si no puedes acceder mediante MCP,
indica el bloqueo y no inventes detalles del diseño.

Requisitos funcionales:
1. Formulario con nombre completo, correo electrónico, contraseña
   y confirmar contraseña.
2. Checkbox obligatorio de aceptación de términos y condiciones.
3. Botón “Crear cuenta” que valide todos los campos antes de enviar.
4. Botones de Google y Apple que muestren un alert con el texto
   “Próximamente”.
5. Link “¿Ya tienes cuenta? Inicia sesión” que navegue a /login.
6. Tras un registro exitoso, redirigir a /login y mostrar un mensaje
   de éxito.
7. Validaciones inline:
   - Todos los campos son obligatorios.
   - El correo debe tener un formato válido.
   - La contraseña debe tener al menos 8 caracteres.
   - Ambas contraseñas deben coincidir.
   - Es obligatorio aceptar los términos y condiciones.
   - Si hay errores, impedir el envío y mostrar mensajes claros
     junto a los controles correspondientes.
8. Diseño responsive: dos paneles en desktop y solo el formulario
   en mobile.

Revisa la constitución del proyecto y la especificación existente de
Login para mantener coherencia y definir la integración con /login.

Genera historias de usuario, requisitos verificables, criterios de
aceptación, casos límite y límites de alcance. Distingue los requisitos
confirmados de las suposiciones.

El registro y el inicio de sesión deben ser simulados, sin backend real.

Al crear una cuenta:
- Validar todos los campos y la aceptación de términos.
- Conservar la cuenta de demostración para que pueda iniciar sesión
  posteriormente, incluso después de recargar la página en el mismo
  navegador.
- Impedir registrar nuevamente un correo ya registrado y mostrar
  un error inline.
- Redirigir a /login con el mensaje “Cuenta creada correctamente.
  Ya puedes iniciar sesión”.
- Permitir iniciar sesión con el correo y la contraseña registrados.
- Rechazar el inicio de sesión si las credenciales no coinciden.

La simulación debe integrarse con el Login existente. Una redirección
o un mensaje de éxito por sí solos no cumplen el requisito: el usuario
debe poder iniciar sesión con la cuenta creada.

El documento generado será la fuente de verdad y lo revisaré antes
de continuar.

Limita esta ejecución a generar la especificación y los artefactos
propios de speckit-specify. No generes el plan técnico ni tareas y
no implementes código.
```

```text
$speckit-clarify

Revisa specs/002-registro-usuarios/spec.md.
Presta especial atención a los supuestos S-001 a S-010.
Prioriza las decisiones que afecten el alcance, el comportamiento
o la experiencia del usuario y pregúntame lo necesario para aclararlas.

Actualiza la especificación con mis respuestas.
No generes plan, tareas ni código.
```

[Volver al proceso SDD](../proceso-sdd.md) · [README](../../README.md)
