# CONTEXTO MAESTRO — Ecosistema GM (Citytv)

> **Estatus:** documento canónico de arquitectura funcional. Es "oro puro": si algo aquí
> contradice una suposición, manda este archivo. Se actualiza solo cuando el dueño del
> producto (David) lo indique.
>
> **Ámbito:** describe los TRES sistemas del ecosistema, sus límites, sus contratos de
> integración y las directrices no negociables. No es documentación de código; el detalle
> técnico vive junto a cada módulo en `src/`.

---

## 1. El ecosistema en una frase

Tres aplicaciones hermanas, un solo dueño de la verdad:

```
  (departamentos)                (equipos del canal)            (horas → dinero)
  Comercial / Noticias     ┌──────────────────────┐      ┌───────────────────────┐
  Bravissimo / Exteriores  │      GM-ACTIVOS      │      │  Software de nómina   │
          │                │  inventario real     │      │  (externo, de la      │
          │  requerimiento │  disponibilidad      │      │   empresa)            │
          ▼                └──────────┬───────────┘      └───────────▲───────────┘
  ┌───────────────────┐               │ disponibilidad               │ horas liquidadas
  │  GM-NEXUS         │  requerimiento│ por franja                   │
  │  (hermana de      │───────────────┼──────────────────────────────┤
  │   requerimientos) │               ▼                              │
  └─────────┬─────────┘     ┌──────────────────────┐                  │
            │  solicitud    │      GM CITYTV       │──────────────────┘
            └──────────────►│   "EL REY" / núcleo  │
                            │  personal · turnos   │
                            │  horas · cifras      │
                            └──────────────────────┘
```

| Sistema | Nombre | Rol en el ecosistema | Estado |
|---|---|---|---|
| Núcleo | **GM Citytv** (Gestión Manager) | Administra personal, requerimientos de personal, turnos y convierte todo en cifras para la nómina. Dueño de la verdad. | En desarrollo (este repo) |
| Suministro | **GM-Activos** (Gestión Manager Activos) | Gestiona equipos e inventario del canal. Al recibir un requerimiento pone en evidencia el inventario disponible. | Fase 1 corriendo en `:5174` (cascarón + Tools) |
| Captación | **GM-Nexus** | Hermana de GM Citytv. Gestiona los requerimientos de las personas y departamentos ya definidos (Comercial, Noticias, Bravissimo, Exteriores…). | Por implementar (nombre definido) |

---

## 2. GM Citytv — el rey

**Qué hace.** Es el sistema que administra el personal del canal, atiende los
requerimientos de personal y convierte todo eso en cifras que se ingresan en el software
de nómina de la empresa, el cual liquida según las horas laboradas de cada trabajador.

**Qué posee (y nadie más puede poseer):**

- El **catálogo de personas** (trabajadores, cargos, áreas, grupos, estado activo/inactivo).
- Las **reglas de tiempo**: rotaciones, stacks, turnos, horas objetivo (target), festivos, periodos de evaluación.
- Las **ausencias** y sus consecuencias: permiso, descanso, incapacidad, vacaciones, licencia, compensatorios.
- Las **sustituciones / USERBALANCER** (cambio temporal de rol de un trabajador).
- El **MainPlanner** (asignación real día a día) y el **Balancer** (horas laboradas vs. horas target).
- La **consolidación** del día trabajado (Validado / Ajustado / No laborado).
- **La cifra final**: horas por trabajador listas para nómina.

**Qué NO hace:** no inventa requerimientos, no inventa inventario y no liquida dinero.
Recibe solicitudes, las valida contra su realidad de personal y entrega horas.

**Realidad técnica en este repo:** React 18 + Vite, `react-router-dom`, `axios`,
`socket.io-client`, `styled-components`. Toda salida HTTP pasa por `src/api/*` y la URL
base vive en `.env` (`VITE_API_URL`); ningún componente escribe URLs a mano. Las pantallas
viven en `src/pages/*` y el planner en `src/Components/Body-Section/Mainplanner`.

---

## 3. GM-Activos — el inventario

**Qué hace.** Gestiona los equipos y el inventario del canal (cámaras, luces, audio,
transmisión, grúa y soportes, transporte, etc.).

**Regla clave:** está **ligado al rey**. Cuando se hace un requerimiento, GM-Activos
**pone en evidencia el inventario disponible**. Es decir: el requerimiento no se aprueba
"a ciegas"; el sistema muestra qué hay realmente libre en la franja solicitada.

**Responsabilidades:**

- Existencia física y estado de cada activo (disponible, reservado, en mantenimiento, de baja).
- Disponibilidad **por franja horaria**, no solo por día.
- Reservas derivadas de requerimientos aprobados.
- Salidas y entradas (préstamos), responsables y trazabilidad.
- Alertas de conflicto: dos requerimientos que piden el mismo equipo a la misma hora.

**Frontera:** GM-Activos no calcula horas de personas ni cifras de nómina. Solo responde
"hay / no hay / cuánto hay" y bloquea o libera inventario.

### 3.1 Estado de implementación — Fase 2 (inventario operativo)

Proyecto independiente en `Desktop\Gm-Activos` (`gm-activos`), corriendo en **:5174**.

**Ya funciona contra la API real:**

- Login con **control de rol**: `Almacenista` (se tolera `Almaceneista`) es el único
  rol que entra a GM-Activos; el Administrador/gestor de GM Citytv ya no tiene
  acceso y sigue en el rey. El rechazo se avisa con una alerta (SweetAlert2).
- Shell idéntico: sidebar colapsable, Top (perfil, reloj, recordatorios), footer
  de novedades flotante con Socket.IO.
- **Tools**: Notas personales (`/tasks`) y Chat corporativo (`/chat`), mismo
  socket y mismos endpoints que el rey.
- **Equipment**: inventario real con los 9 campos (placa, categoría, estado,
  ubicación, hoja de vida, imagen, descripción, observaciones y restricciones),
  jerarquía **Categoría → Subcategoría → Equipo**, CRUD de categorías,
  subcategorías y ubicaciones, imágenes **genéricas por categoría/subcategoría**
  (sin imagen por equipo), mantenimientos y actualización en tiempo real.
- **Integración**: Programmer y Requirements de GM Citytv consultan
  disponibilidad por franja y reservan placas concretas al aprobar.
- Identidad visual: `#00094B` → **`#890000`** (derivados azules → rojos oscuros,
  hover púrpura → `#8A0000`).

**Detalle técnico:** `Gm-Activos/docs/INVENTARIO.md`.

**Sin cambios destructivos en GM-RestApi:** se agregaron colecciones, endpoints,
eventos y middleware de forma aditiva.

---

## 4. GM-Nexus — la hermana de requerimientos

> **Nombre decidido:** `GM-Nexus` (antes "GM-¿?" / nombre pendiente). El nombre está
> cerrado por el dueño del producto; no se renombra sin su orden explícita.

**Qué hace.** Es la puerta de entrada del canal: las personas y los departamentos ya
definidos (**Comercial, Noticias, Bravissimo, Exteriores**, y los que se sumen) crean
requerimientos. Cada requerimiento es un evento que necesita personas y equipos.

**Anatomía de un requerimiento (contrato ya modelado en el código):**

| Bloque | Campos |
|---|---|
| Identidad | `id`, `codigo` (`REQ-AAAA-NNN`), `nombre`, `departamentoId` |
| Evento | `programa`, `tipoEvento`, `fecha`, `horaInicio`, `horaFin`, `locacion` |
| Personal | lista de `{ rolId, cantidad, horas, notas }` |
| Equipos | lista de `{ equipoId, cantidad, inventarioId, estadoInventario, notas }` |
| Gestión | `prioridad` (Alta/Media/Baja), `estado`, `solicitante`, `descripcion`, `observacion` |
| Auditoría | `historial` (creación, revisión, aprobación, rechazo, actualización) |
| Integración | `evento.programaId`, `evento.idEventoPlanner`, `integracion.sincronizado` |

**Ciclo de vida:**

```
Pendiente → En revisión → Aprobada ─────────────┐
                     └──► Rechazada             │
Aprobada + personal completo → Agendado ────────┤
                                                ▼
                    GM Citytv: evento "Requerimiento/Programmer" en ModalPlanner1
                    GM-Activos: reserva de equipos de la franja
                                                ▼
                    Asignación de personal → turnos → consolidación
                                                ▼
                    Horas por trabajador → nómina
```

La aprobación ya no exige personal asignado. Si el personal requerido queda
completo, el registro pasa a **Agendado**; si no, permanece en **Aprobada**.
Ambos estados son operativos y se ofrecen a Programador de Turnos y GM-Activos.

**Regla de oro:** un requerimiento **no se duplica** en el planner. Lo que se
corrige es la lectura que igualaba Programmer con Requirements: son flujos
distintos (ver 4.1). El registro de Programmer es el evento manual; la solicitud
de Requirements es un registro propio que, al aprobarse, se refleja en el
planner por referencia.

### 4.1 Programmer y Requirements no son lo mismo

| | **Programmer** | **Requirements** |
|---|---|---|
| Naturaleza | Proceso **manual** e interno de GM Citytv | **Sistema completo** de solicitudes por áreas |
| Quién lo usa | Administrador/gestor de GM Citytv | Comercial, Noticias, Bravissimo, Exteriores y las áreas que se sumen |
| Registro | Evento/requerimiento capturado a mano | Solicitud con `departamentoId`, solicitante, ciclo de vida, historial, personal y equipos |
| Persistencia | Colección `Programmer` | Colección y API propias de `Requirement` |
| Aprobación | Manual, por gestor; personal opcional | Flujo por estados; personal opcional |
| Inventario | Reserva equipos reales al aprobar | Reserva equipos reales al aprobar |
| Estado operativo | Aprobada sin personal; Agendado con personal completo | Aprobada sin personal; Agendado con personal completo |
| Relación | No reemplaza a Requirements | No reemplaza a Programmer |

Ambos comparten el servicio de reservas de GM-Activos. Una franja ocupada no se
puede aprobar dos veces, sin importar el origen.

En esta fase la solicitud de Requirements la crea un gestor a nombre del área.
El autoservicio con login propio de las áreas corresponde a GM-Nexus; el modelo
de datos ya lo soporta.

**Regla de catálogos:** departamentos, roles técnicos y equipos se referencian **por ID**
desde el núcleo. Ninguna app hermana mantiene su propia copia de personas.

---

## 5. Contratos de integración (borrador, a validar al implementar)

**Identificadores que viajan entre sistemas**

| ID | Dueño | Uso |
|---|---|---|
| `requerimientoId` / `codigo` | GM-Nexus | Trazabilidad de la solicitud |
| `eventoIdPlanner` | GM Citytv | Enlace requerimiento ↔ turno |
| `inventarioId` | GM-Activos | Enlace equipo solicitado ↔ activo real |
| `trabajadorId` | GM Citytv | Único origen de personas |

**Consultas mínimas**

- `GET /activos/disponibilidad?equipoId&fecha&horaInicio&horaFin` → cantidad disponible real.
- `POST /requerimientos` → crea y notifica en tiempo real.
- `PATCH /requerimientos/:id/estado` → aprobación/rechazo con motivo y actor.
- `POST /activos/reservas` → reserva al aprobar; libera si se rechaza o se cancela.

**Eventos en tiempo real (socket.io, ya presente en el cliente)**

`requerimiento.creado`, `requerimiento.actualizado`, `requerimiento.decidido`,
`inventario.reservado`, `inventario.liberado`, `turno.guardado`, `consolidacion.cerrada`,
`usuario.actualizado` (cambio de perfil: foto, nombre o rol; lo emite la API al guardar).

Además, el inventario de GM-Activos emite:

- `equipment:changed`
- `equipment-categories:changed`
- `equipment-locations:changed`
- `equipment-assignment:changed`
- `requirements:changed`

Estos eventos los consumen GM-Activos, Programmer y Requirements para refrescar
sin recargar.

**Regla de tiempo real:** la disponibilidad que ve el solicitante y la que ve el
administrador son la misma y cambian sin recargar. Nada de "actualizar para ver".

---

## 6. Directrices no negociables (dadas por David)

1. **GM Citytv es el rey.** Es el núcleo y la fuente de verdad. Las hermanas se subordinan.
2. **Todo debe ser en tiempo real.** Requerimiento, inventario, planner y cifras.
3. **Todo nombre de producto empieza por `GM-`**, siguiendo el patrón `GM-Activos`.
4. **No se refactoriza lo existente** sin orden explícita (ver `rules.md`): se extiende.
5. **Un requerimiento = un evento de planner**, misma entidad, nunca copia.
6. **La cifra de nómina solo sale del rey.** Ninguna hermana produce horas liquidables.
7. **El inventario se evidencia, no se supone.** Sin disponibilidad confirmada no hay aprobación.

---

## 7. Estado real del código hoy (este repo)

Lo que ya existe y **hay que respetar**:

- `src/pages/Requirements/` — sistema de solicitudes por áreas con API y
  colección propias (`Requirement`). Incluye alta/edición, aprobación, rechazo,
  revisión, personal real y equipos reservados en GM-Activos.
- `src/pages/Programmer/` — **requerimientos manuales ya funcionales**: alta,
  edición, aprobación, personal, equipos reales de GM-Activos, historial y
  exportación. Es el proceso manual interno del rey.
- `src/context/RequirementsProvider.jsx` — estado compartido de solicitudes y
  contador del Sidebar; ya no usa datos de demostración.
- `src/Components/Modals/ModalPlanner1.jsx` — consume el evento de requerimiento
  desde el planner.
- `src/pages/Consolidate/` — validación del día trabajado (Validado / Ajustado / No laborado).
- `src/api/*` + `socket.io-client` — capa única HTTP y canal de tiempo real.

**Deuda reconocida:** completar la integración del requerimiento aprobado con el
turno del planner y definir el contrato definitivo de GM-Nexus. El inventario y
las reservas ya están resueltos.

---

## 8. Nombre del sistema de requerimientos — DECIDIDO

**Nombre oficial: `GM-Nexus`.** Decidido por David. Se escribe con guion (`GM-Nexus`),
siglas internas `GM-NX`. El guion bajo `GM_NEXUS` solo se admite en nombres técnicos
(repos, variables, bases de datos); nunca en la interfaz ni en documentos.

**Por qué encaja:** `Nexus` = el punto de unión. Es exactamente la función de la app:
es el nudo donde se encuentran los departamentos (Comercial, Noticias, Bravissimo,
Exteriores), el rey (GM Citytv) y el inventario (GM-Activos). Mantiene el patrón `GM-`
y tiene peso de marca sin sacrificar significado.

**Cómo nombrar cada cosa (para no ensuciar el nombre):**

| Elemento | Forma correcta |
|---|---|
| Producto / app | **GM-Nexus** |
| Descriptor largo | "GM-Nexus — Gestión de requerimientos" |
| Repo / carpeta | `gm-nexus` |
| Prefijo de código (componentes) | `Nexus*` (ej. `NexusRequirementModal`) |
| Siglas en documentos | `GM-NX` |
| Ticket / código de requerimiento | se mantiene `REQ-AAAA-NNN` (no se prefija con NX) |

**Nombres descartados** (quedan registrados para que no se reabran sin razón):
GM-Requerimientos, GM-Solicitudes, GM-Órdenes/OT, GM-Brief, GM-Origen, GM-Nexo,
GM-Intake, GM-Pedidos.

---

## 9. Preguntas abiertas (se responden al implementar, no antes)

1. ¿GM-Activos y GM-Nexus son apps separadas o módulos del mismo backend con distinto front?
2. ¿El requerimiento lo crea el departamento solicitante o lo radica el administrador del rey?
3. ¿La aprobación es de una sola persona o hay visto bueno de producción + técnica?
4. ¿El requerimiento puede pedir personal sin equipos, y viceversa?
5. ¿Qué pasa si el inventario se libera después de aprobado el requerimiento?
6. ¿Nómina consume un archivo/API o el sistema de la empresa jala de la base del rey?

---

## 10. Registro de decisiones

| # | Fecha | Decisión | Estado |
|---|---|---|---|
| D-001 | 2026-11-15 | El núcleo se llama **GM Citytv** y es la fuente de verdad ("el rey"). | Vigente |
| D-002 | 2026-11-15 | El inventario se llama **GM-Activos** y evidencia disponibilidad real por franja. | Vigente |
| D-003 | 2026-11-15 | La hermana de requerimientos se llama **GM-Nexus**. | Vigente |
| D-004 | 2026-11-15 | Un requerimiento es el mismo registro que el evento del planner; nunca una copia. | Vigente |
| D-005 | 2026-11-15 | GM-Activos se implementa como proyecto independiente (`gm-activos`) en el puerto **5174**, con las mismas tecnologías del rey. | Vigente |
| D-006 | 2026-11-15 | Identidad de GM-Activos: **`#890000`** sustituye al azul `#00094B`; derivados azules y hover a `#6E0000`. | Vigente |
| D-007 | 2026-11-15 | Solo entra a GM-Activos el rol **`Almacenista`** (se acepta `Almaceneista` por datos antiguos). | Vigente |
| D-008 | 2026-11-15 | El rol no es editable desde el perfil del Top: define el acceso. | Vigente |
| D-009 | 2026-11-15 | Sidebar de GM-Activos: logo, 4 auxiliares, **Equipment** (Inventory / New Equipment / Maintenance) y **Tools** (Tasks / Chat). | Vigente |
| D-010 | 2026-11-15 | Fase 1 de Equipment = cascarón con estados vacíos honestos y mapa de campos propuesto. La lógica llega en Fase 2. | Vigente |
| D-011 | 2026-11-15 | GM-Activos **no** modifica la API ni las colecciones del rey; comparte usuarios, tareas, grupos, novedades y socket. | Vigente |
| D-012 | 2026-11-15 | Las ventanas internas de GM-Activos usan **`BaseOperations1`** (pestaña roja de título + póster diagonal + marca de agua), igual que las ventanas internas de GM Citytv. La pestaña se dibuja dentro de la tarjeta para que la barra superior no tape el título. | Vigente |
| D-013 | 2026-11-15 | La API compartida evoluciona con cambios **aditivos** que sirven a los dos sistemas. Se agregó el evento de socket `usuario_actualizado` (lo emite `updateUser`), para que las fotos de perfil se refresquen en todas las sesiones sin recargar. | Vigente |
| D-014 | 2026-11-15 | Toda **ventana interna** nueva se monta con `BaseOperations1` (con póster) o `BaseOperations2` (sin póster) y hereda `margin-top: 4.3%` (≈50 px a 1440 px) para separarse de la barra superior. La pestaña del título se superpone a la tarjeta (no va dentro). No se inventan márgenes por pantalla. | Vigente |
| D-015 | 2026-11-15 | Las **notas personales** aceptan adjuntos (imágenes o documentos) guardados como data URL dentro del documento `Task.adjuntos` (mismo patrón del chat), máximo 3 archivos de 4 MB. El listado muestra un extracto de 2 líneas y el **doble clic abre la modal de detalle** con el texto completo y los adjuntos. Aplica a GM Citytv y GM-Activos. | Vigente |
| D-016 | 2026-11-15 | Al hacer clic en un adjunto **no se descarga**: se abre una vista previa dentro de la app (imagen ampliada, PDF embebido o texto). Los formatos sin visor nativo muestran un aviso y el botón de descarga. El data URL se convierte a blob para el visor. | Vigente |
| D-017 | 2026-11-15 | Un adjunto se puede eliminar desde el **formulario** (botón "Quitar" en la ficha) y desde la **modal de detalle** (✕ sobre la tarjeta, con confirmación). El borrado hace un PUT solo con la lista `adjuntos`; el resto de la nota no se toca. | Vigente |
| D-018 | 2026-11-16 | **Programmer y Requirements son entidades distintas**: Programmer es el proceso manual interno; Requirements es el sistema de solicitudes por áreas, con colección y API propias. No se fusionan. | Vigente |
| D-019 | 2026-11-16 | El inventario de GM-Activos persiste `Activo`/`Inactivo` con motivo (`Mantenimiento`, `Protegido`, `Baja`). **`Disponible`/`Asignado` se derivan de las reservas por franja**; `Baja` es terminal. | Vigente |
| D-020 | 2026-11-16 | Un requerimiento pide **una placa exacta por línea** (cantidad 1). Los selectores solo muestran equipos disponibles para la franja y muestran el resumen total/inactivos/disponibles. | Vigente |
| D-021 | 2026-11-16 | El **Administrador/gestor** puede entrar a GM-Activos solo a **Equipment** (Inventory, Catalogs, Maintenance); el Almacenista conserva Tools. Se amplía D-007. | Reemplazada por D-032 |
| D-022 | 2026-11-16 | Las **imágenes** de equipos se guardan como data URL con miniatura y se sirven por endpoint. Las **restricciones** se muestran con aviso destacado y exigen aceptación explícita al asignar. | Vigente |
| D-023 | 2026-11-16 | Las reservas de equipos son globales: Requirements y Programmer comparten el mismo servicio y no pueden aprobar el mismo equipo en franjas que se crucen. | Vigente |
| D-024 | 2026-11-16 | El Sidebar de GM-Activos → Equipment queda con **Inventory / New Equipment / Catalogs / Maintenance**. Catalogs administra categorías y ubicaciones. | Vigente |
| D-025 | 2026-11-16 | La regla D-004 (no duplicar el evento del planner) **no** significa que Programmer y Requirements sean la misma entidad. D-018 prevalece: son flujos distintos, cada uno con su registro. | Vigente |
| D-026 | 2026-11-16 | El inventario tiene jerarquía **Categoría → Subcategoría → Equipo**. La subcategoría es opcional, pero obligatoria cuando la categoría tiene subcategorías activas. | Vigente |
| D-027 | 2026-11-16 | **No se guardan imágenes por equipo.** Cada categoría y subcategoría tiene una imagen genérica; el equipo hereda subcategoría → categoría → placeholder. | Vigente |
| D-028 | 2026-11-16 | El mantenimiento registra automáticamente el técnico de la sesión, no usa costo y acepta adjuntos (5 máximo, 4 MB) en una colección aparte. El seguimiento reemplaza al próximo mantenimiento, tiene fecha de inicio y se cierra con nota; el dashboard de GM-Activos queda pendiente de implementar. | Vigente |
| D-029 | 2026-11-16 | Maintenance se divide en **Maintenance** (alta y listado), **Activos** (estado, progreso, evidencias, bitácora paso a paso y línea de tiempo) y **Monitoring** (seguimientos activos con anotaciones firmadas con autor, fecha y hora). | Vigente |
| D-030 | 2026-11-16 | Un equipo **no puede entrar ni salir de mantenimiento mediante un cambio de estado**. Solo `startMaintenance` y `finishMaintenance` modifican ese estado; el cambio genérico responde `409`. El mantenimiento puede iniciarlo un almacenista y finalizarlo otro, y varios pueden agregar pasos o evidencias. | Vigente |
| D-031 | 2026-11-16 | El **progreso del mantenimiento es automático**: 10% por paso registrado, con tope de 95% mientras está abierto y 100% al finalizar. La bitácora y la línea de tiempo se muestran como árbol con pasos numerados. Cada paso se puede editar o eliminar y acepta imágenes propias. | Vigente |
| D-032 | 2026-11-17 | **Accesos separados**: GM Citytv es solo para roles de gestión (el almacén queda fuera) y GM-Activos es exclusivo de `Almacenista`/`Almaceneista`. El login **y** la sesión guardada se validan en cada app; el rechazo por rol y la bienvenida se muestran con SweetAlert2. Reemplaza D-021 y confirma D-007. | Vigente |
| D-033 | 2026-11-17 | GM Citytv agrega el módulo **Activos** (`/activos`): inventario completo de solo lectura, consulta de mantenimientos y monitoreo, y alta de equipos en `Inactivo`/`Protegido` sin selector de estado. Ninguna pantalla de GM Citytv cambia estados, edita datos, agrega observaciones o restricciones, inicia o finaliza mantenimientos, registra pasos o evidencias, ni cierra seguimientos. La restricción es de interfaz: la API sigue aceptando escrituras de un gestor con acceso directo. | Vigente |
| D-034 | 2026-11-17 | En Programmer, **`nombre` y `departamento` son la fuente de verdad**: `programa` se deriva del nombre y `tipoEvento` del departamento. Ambos campos del evento son de solo lectura, se normalizan al leer y se recalculan al guardar para que los registros antiguos también queden consistentes. | Vigente |
| D-035 | 2026-11-17 | La UI de Programmer llama **Programador de Turnos** al sistema destino de la programación. El nombre técnico del componente y los identificadores internos no se renombran; el cambio es solo de textos visibles. | Vigente |
| D-036 | 2026-11-17 | En Programmer, las **horas de Personal requerido** se derivan de la duración entre la hora de inicio y la hora de fin del evento, se redondean a 2 decimales y se muestran en un campo de solo lectura. Si el fin es menor que el inicio, se interpreta como cruce de medianoche. | Vigente |
| D-037 | 2026-11-18 | El **personal requerido es opcional** para aprobar un programador. La ventana de asignación muestra el turno guardado y el turno proyectado según la rotación; la proyección es informativa y no altera los bloqueos. Los KPIs de Programmer usan una variante compacta para dejar más espacio al listado y al detalle. | Vigente |
| D-038 | 2026-11-18 | En Programmer, la **aprobación exige disponibilidad vigente de los equipos**. Si una placa se reservó después del alta, la ficha la marca en rojo, permite reemplazarla por otra disponible y mantiene “Aprobar” deshabilitado hasta resolver todos los conflictos. El listado usa tarjetas y el panel de detalle concentra la gestión y la descripción. | Vigente |
| D-039 | 2026-11-18 | El personal es **opcional** para aprobar en Programmer y Requirements. Al aprobar sin personal el estado es **Aprobada**; cuando todos los cupos de personal quedan cubiertos, el estado pasa automáticamente a **Agendado**. Asignar o retirar personal después de aprobar recalcula entre Aprobada y Agendado. Programador de Turnos, Consolidate y GM-Activos deben incluir ambos estados operativos. | Vigente |
| D-040 | 2026-11-18 | Los turnos **Type “Programmer”** guardados en ModalPlanner1 cuentan como asignación real del trabajador en el Programmer: se agregan a la línea de personal de su grupo y puede completar el paso a **Agendado**. Al eliminar el último turno de ese trabajador se libera solo la asignación creada desde el planificador; las asignaciones manuales se conservan. La columna del stack muestra el nombre del programador, no su `_id`. | Vigente |
| D-041 | 2026-11-18 | Asignar personal desde **Programmer** crea un turno **directo** (`Origen: "programmer-directo"`), sin stack, con la fecha y horas del programador. Si el Programmer está pendiente, el turno se crea al aprobarlo. Retirar el personal elimina solo el turno directo; los stacks creados desde ModalPlanner1 se conservan. Las pantallas muestran el aviso **Programación directa**. | Vigente |

> Regla: toda decisión nueva se agrega aquí con fecha. Lo que no está en esta tabla
> sigue siendo propuesta, no ley.

