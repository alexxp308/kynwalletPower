# Contract: UI de Registro e integración Login

| Interacción | Resultado |
| --- | --- |
| Acceso directo/recarga de /registro | Formulario vacío, términos desmarcados, contraseñas ocultas. |
| Envío inválido | Errores de spec junto a controles; foco al primero; sin gateway. |
| Blur / corrección | Validar al salir; tras validación actualizar error al corregir; coincidencia reactiva. |
| Alta en curso | Anunciar estado, botón y envíos bloqueados; un único procesamiento. |
| Alta confirmada | Navegar /login, campos vacíos, aviso exacto en región anunciada; sin auto-login. |
| Recarga/salida de Login | Borrar aviso y sesión de memoria; cuenta disponible. |
| Google / Apple en Registro | window.alert('Próximamente'); sin enviar ni cambiar estado. |
| Inicia sesión / Regístrate | /login / /registro respectivamente. |
| Términos | Botón con aspecto de enlace abre dialog, sin cambiar checkbox. |
| Cerrar / Escape del modal | Cerrar, devolver foco al activador y preservar formulario. |
| Resize 1023 ↔ 1024 | Solo CSS oculta/muestra marca; estado completo preservado. |

Modal incluye título y «Contenido de demostración, sin validez legal», texto breve de uso
exclusivamente ficticio y ningún consentimiento comercial. Etiqueta de checkbox y activador
son elementos separados visualmente contiguos; no anidar botón interactivo en label.

Cada campo: label asociado, aria-invalid, aria-describedby al error; foco visible. Dialog con
nombre accesible, foco inicial dentro y tabulación confinada por showModal. Al cerrar, no
mover foco al checkbox. Probar lector de pantalla y navegador real.

Comparación desktop: 1440×1024, marca 620, formulario 400, campos y CTA 52, radios 12,
textos y placeholders de spec y marco 31:2. Reutilizar Inter y tokens accesibles existentes;
registrar cada ajuste mínimo de contraste en la revisión visual. Errores expanden flujo vertical.
Viewport mínimo 320 y dos paneles a partir de 1024, sin alterar breakpoint de Login 001.
En despliegue estático configurar fallback de /login y /registro a index.html.
