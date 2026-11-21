/**
 * Resolución del identificador del Programmer en un turno del planificador.
 *
 * En los borradores de ModalPlanner1 `ID_event` vale "------"; el id real del
 * programador viaja en `Event_name`. Se ignoran los placeholders para no
 * terminar mostrando el ObjectId crudo en la columna del stack.
 */

const texto = (valor) => String(valor ?? "").trim();

const esIdUtil = (valor) => Boolean(valor) && valor !== "------";

export const idProgrammerDeTurno = (turno) => {
  const candidatos = [
    texto(turno?.Event_name),
    texto(turno?.ID_event),
    texto(turno?.ID_programa),
  ];

  return candidatos.find(esIdUtil) ?? "";
};
