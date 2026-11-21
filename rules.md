# Directrices del Proyecto (React - 2 Años de Desarrollo)

> **Contexto maestro del ecosistema GM:** antes de proponer arquitectura, nombres o
> integraciones, leer [`docs/CONTEXTO-GM.md`](docs/CONTEXTO-GM.md). Allí viven los tres
> sistemas (GM Citytv = rey, GM-Activos, GM-Nexus), sus fronteras y las
> directrices no negociables. Este archivo manda sobre el código; ese manda sobre el producto.

## REGLAS CRÍTICAS DE PRESERVACIÓN DE CÓDIGO
1. **NO refactorizar código funcional existente**: Queda estrictamente prohibido alterar la lógica de negocio, arquitectura de carpetas, o bibliotecas de manejo de estado actuales a menos que se indique explícitamente.
2. **Principio de Extensión**: Para nuevas funcionalidades, crea nuevos componentes, hooks, o utilidades independientes en lugar de reescribir archivos masivos preexistentes.
3. **Mantenimiento de Estilo**: Respeta rigurosamente el estilo de formateo, nomenclatura (CamelCase, PascalCase) y los patrones de diseño ya presentes en los componentes hermanos.

## POLÍTICA DE AHORRO DE TOKENS
- No asumas el contexto completo del monorepo o proyecto.
- Si requieres información de un archivo externo que no ha sido indexado o abierto, solicítame confirmación antes de escanearlo.
