# Prompt: correcciones autorizadas tras speckit-analyze

Fecha: 2026-10-17. Feature: `002-registro-usuarios`.

## Solicitud original y autorización

Tras presentar el informe de cinco hallazgos

El análisis inicial se realizó con `$speckit-analyze` y su script de prerrequisitos.
Esta ejecución posterior aplica las correcciones documentales explícitamente autorizadas;
no convierte analyze en un comando de edición ni inicia implementación.

## Prompt aplicado

```text
Aplica las cinco correcciones del análisis de specs/002-registro-usuarios:
C1. Coloca las pruebas del gateway y su matriz de configuración/duplicados antes
    de su implementación; conserva TDD y actualiza numeración y dependencias.
I1. Refleja en spec.md la decisión ya aprobada de rechazar por indisponibilidad
    los accesos de correos en conflicto entre catálogo inicial y cuentas locales,
    sin sobrescribir ni priorizar fuentes y manteniendo operativas las demás cuentas.
I2. Incluye scripts/run-e2e.mjs en el control de tipos E2E con allowJs/checkJs.
U1. Define un puerto y caso de uso de disponibilidad para que Reintentar reabra y
    valide almacenamiento sin registrar, autenticar ni reenviar el formulario.
I3. Corrige la referencia errónea de almacenamiento en las dependencias de tasks.md.

Mantén coherentes especificación, plan, modelo, investigación, contratos, quickstart
 y tareas. Conserva el informe inicial, el resultado de las correcciones y este prompt
 en la documentación del curso. No instales dependencias ni implementes código.
```

## Resultado

Se corrigieron los documentos de feature y se conservan 61 tareas pendientes. Las pruebas
antes T028 y T035 pasan a T021/T022 en US1; la implementación del gateway pasa a T023.
Se renumeran IDs intermedios y se revisan dependencias y ejemplos de paralelismo.
Reparto vigente: preparación 6, fundamentos 7, US1 15, US2 7, US3 6, US4 7, US5 8 y cierre 5.
Los recuentos de 002-tasks.md describen la generación original, antes de esta revisión.

Ver [informe y cierre de hallazgos](../analisis-002-registro.md) y
[bitácora](../proceso-sdd.md). Las correcciones son documentales: no se ejecutó implementación,
instalación ni pruebas del producto. Las verificaciones se limitan a coherencia, IDs y enlaces.
