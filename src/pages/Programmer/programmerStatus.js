/**
 * Reglas visuales del estado de un programador.
 * Se mantienen fuera de React y sin dependencias para poder probarlas con
 * node:test aunque el resto de la vista tenga imports de Vite.
 */

export const ESTADOS_EDITABLES_PROGRAMMER = ["Pendiente", "En revisión"];
export const ESTADOS_APROBADOS_PROGRAMMER = ["Aprobada", "Agendado"];
export const ESTADOS_ASIGNABLES_PROGRAMMER = [
  ...ESTADOS_EDITABLES_PROGRAMMER,
  ...ESTADOS_APROBADOS_PROGRAMMER,
];

export const estadoProgrammerUI = (estado) => ({
  puedeAsignar: ESTADOS_ASIGNABLES_PROGRAMMER.includes(estado),
  puedeDecidir: ESTADOS_EDITABLES_PROGRAMMER.includes(estado),
  esFinal: [...ESTADOS_APROBADOS_PROGRAMMER, "Rechazada"].includes(estado),
  aprobado: ESTADOS_APROBADOS_PROGRAMMER.includes(estado),
});

/** Totales de cupos de personal para la ficha y el planificador. */
export const resumenPersonalProgrammer = (personal = []) => {
  const lineas = (Array.isArray(personal) ? personal : []).filter(
    (linea) => Number(linea?.cantidad) > 0
  );

  const total = lineas.reduce(
    (suma, linea) => suma + Number(linea.cantidad),
    0
  );
  const asignados = lineas.reduce(
    (suma, linea) =>
      suma +
      Math.min(
        Array.isArray(linea?.asignados) ? linea.asignados.length : 0,
        Number(linea.cantidad)
      ),
    0
  );
  const completo =
    lineas.length > 0 &&
    lineas.every(
      (linea) =>
        (Array.isArray(linea?.asignados) ? linea.asignados.length : 0) >=
        Number(linea.cantidad)
    );

  return {
    lineas,
    total,
    asignados,
    pendientes: Math.max(total - asignados, 0),
    completo,
  };
};
