# Programmer vs Requirements

> Referencia corta para no confundir los dos flujos. Ambos usan el inventario de
> GM-Activos, pero **no son la misma entidad**.

| | Programmer | Requirements |
|---|---|---|
| Qué es | Proceso **manual** interno de GM Citytv | **Sistema completo** de solicitudes por áreas |
| Quién lo crea | Administrador/gestor de GM Citytv | Gestor a nombre de Comercial, Noticias, Bravissimo, Exteriores… |
| Colección | `Programmer` | `Requirement` |
| Código | `REQ-AAAA-NNNN` | `REQ-AAAA-NNNN` (el generador verifica ambas colecciones) |
| Ciclo | Pendiente → En revisión → Aprobada → Agendado / Rechazada | Pendiente → En revisión → Aprobada → Agendado / Rechazada |
| Equipos | Placa exacta, cantidad 1 | Placa exacta, cantidad 1 |
| Personal | Opcional; completo solo para Agendado | Opcional; completo solo para Agendado |
| Al aprobar | Reserva equipos; sin personal queda Aprobada | Reserva equipos; sin personal queda Aprobada |
| Al completar personal | Pasa a Agendado | Pasa a Agendado |
| Al rechazar/reabrir/eliminar | Libera reservas | Libera reservas |
| Pantalla | Journal → Programmer | Journal → Requirements |
| Autoservicio por área | No; siempre manual | Corresponde a GM-Nexus; en esta fase lo crea un gestor |

## Regla de inventario compartida

- Solo se ofrecen equipos **Disponibles** para la fecha/hora del evento.
- El selector muestra: `X totales · Y inactivos · Z disponibles`.
- Si un equipo está reservado en esa franja, no aparece.
- Las restricciones se muestran en un recuadro de advertencia y deben aceptarse.
- La aprobación vuelve a validar en el backend; si la franja se ocupó, responde
  `409` con un mensaje sencillo.
- En Programmer, antes de aprobar se revalida la disponibilidad: las placas que
  dejaron de estar libres se marcan en rojo, se pueden reemplazar por otra
  disponible y “Aprobar” queda bloqueado mientras exista un conflicto.
- El personal es opcional al aprobar. Sin personal el estado queda **Aprobada**;
  cuando todos los cupos quedan cubiertos pasa a **Agendado**. Ambos estados son
  operativos y se ofrecen a Programador de Turnos y GM-Activos.
- `GET /api/requirements?soloAprobadas=true` y
  `GET /api/programmer?soloAprobados=true` devuelven Aprobada y Agendado.
  Consultar `estado=Aprobada` en Requirements también incluye Agendado.
- En ModalPlanner1, guardar un turno `Type: "Programmer"` asigna al trabajador
  en la línea de personal de su grupo; al completar todos los cupos el
  programador pasa a **Agendado**. La asignación del planificador se libera al
  borrar el último turno del trabajador y no afecta las asignaciones manuales.
- Asignar personal desde la pantalla **Programmer** crea un turno **directo**
  (`Origen: "programmer-directo"`), sin stack, con la fecha y horas del
  programador. Si el Programmer está pendiente, el turno se crea al aprobarlo.
  Retirar el personal elimina solo ese turno directo; los stacks de
  ModalPlanner1 se conservan.

## Qué no hacer

- No copiar registros de Programmer a Requirement ni viceversa.
- No reservar equipos al crear una solicitud pendiente; la reserva nace al
  aprobar.
- No mostrar equipos inactivos, protegidos, de baja o ya reservados en la franja.
- No fusionar las dos colecciones “para simplificar”: el dueño del producto
  definió que son flujos distintos.
