# Prompt: ajustes de integración del plan 002

Fecha: 2026-10-17. Habilidad aplicada: `$speckit-plan`.

## Entrada de planificación aplicada

```text
$speckit-plan

Actualiza el plan existente de specs/002-registro-usuarios con estas decisiones:
1. Distinguir configuración inicial ausente, válida e inválida. Sin configuración,
   permitir cuentas locales; con configuración inválida, impedir altas y permitir
   Login local íntegro. Si un catálogo posterior introduce un correo local existente,
   rechazar ese acceso con indisponibilidad genérica, sin sobrescribir ni elegir fuente.
2. Limitar la apertura de IndexedDB a 5 segundos. Mostrar error y Reintentar al vencer;
   cada reintento inicia otra apertura. Ignorar resultados antiguos y cerrar conexiones
   tardías. Mantener los tres intentos separados para conflictos de escritura. No borrar datos.
3. Definir E2E separadas sin cuentas iniciales y con cuentas ficticias generadas en ejecución,
   builds y servidores independientes, sin cargar .env.local. Agregar tsconfig.e2e.json
   y comprobación de tipos de configuración, tests y scripts dentro de verify.

Mantén consistentes investigación, modelo, contratos y quickstart. Registra el cambio
para el curso. No instales dependencias, generes tareas ni implementes código.
```

## Resultado y alcance

Se actualizaron [plan](../../specs/002-registro-usuarios/plan.md),
[investigación](../../specs/002-registro-usuarios/research.md),
[modelo](../../specs/002-registro-usuarios/data-model.md),
[contratos](../../specs/002-registro-usuarios/contracts/) y
[quickstart](../../specs/002-registro-usuarios/quickstart.md).
Este registro conserva la entrada; los artefactos de diseño contienen las decisiones vigentes.
La especificación conserva su alcance: no se añade migración de cuentas ni backend.
No se ejecutan pruebas de producto ni se modifican scripts, dependencias o implementación.
