/**
 * Duraciones puras de stacks y programas.
 *
 * Se movieron aquí desde src/api/stacks.js para poder importarlas sin arrastrar
 * el cliente HTTP (el planificador las usa en cálculos de render).
 * api/stacks.js las re-exporta para no romper las pantallas existentes.
 */

const MINUTOS_POR_DIA = 24 * 60;

const aFecha = (valor) => {
  if (!valor) return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

/**
 * Minutos entre dos fechas. Si la segunda es anterior a la primera se asume
 * que el rango cruza la medianoche y se le suma un día.
 * Devuelve null cuando alguna de las fechas no es válida.
 */
export const minutosEntreFechas = (inicio, fin) => {
  const desde = aFecha(inicio);
  const hasta = aFecha(fin);
  if (!desde || !hasta) return null;

  let minutos = Math.round((hasta.getTime() - desde.getTime()) / 60000);
  if (minutos < 0) minutos += MINUTOS_POR_DIA;
  return minutos;
};

/** Duración en minutos de un programa o evento fijo (Start / End). */
export const duracionPrograma = (programa) => {
  if (!programa) return 0;
  const minutos = minutosEntreFechas(
    programa.Start ?? programa.start,
    programa.End ?? programa.end
  );
  return minutos ?? 0;
};

/**
 * Minutos que aporta un elemento del stack.
 * Mismas reglas que ModalPlanner1.fullTime():
 *   Null -> 30 | Custom -> Duration | TimeOut -> Value
 *   Programa / Secondary -> duración del programa
 *   Label u otros tipos -> 0
 */
export const duracionItemStack = (item, programas = []) => {
  if (!item) return 0;

  if (item.ID_programa === "Null-30" || item.Type === "Null") return 30;

  if (item.Type === "Custom" || item.ID_programa === "Turno Custom") {
    return Number.parseInt(item.Duration, 10) || 0;
  }

  if (item.ID_programa === "TimeOut" || item.Type === "TimeOut") {
    return Number.parseInt(item.Value, 10) || 0;
  }

  if (item.Type === "Programa" || item.Type === "Secondary") {
    const programa = (programas ?? []).find(
      (p) => String(p?._id) === String(item.ID_programa)
    );
    return duracionPrograma(programa);
  }

  return 0;
};

/**
 * Resumen del stack frente a la ventana horaria de un esquema.
 * estado: "ok" (coincide) | "faltante" | "excede" | "sin-ventana"
 */
export const resumirStackDuracion = (stacks = [], esquema = null, programas = []) => {
  const total = (Array.isArray(stacks) ? stacks : []).reduce(
    (acumulado, item) => acumulado + duracionItemStack(item, programas),
    0
  );

  const ventanaCalculada = esquema
    ? minutosEntreFechas(
        esquema.HoraInicio ?? esquema.horaInicio,
        esquema.HoraFinal ?? esquema.horaFinal
      )
    : null;

  // Un horario sin duración (horas iguales o ausentes) no sirve para comparar
  const ventana = ventanaCalculada && ventanaCalculada > 0 ? ventanaCalculada : null;
  const diferencia = ventana === null ? null : ventana - total;

  let estado = "sin-ventana";
  if (ventana !== null && diferencia !== null) {
    if (diferencia === 0) estado = "ok";
    else if (diferencia > 0) estado = "faltante";
    else estado = "excede";
  }

  return { total, ventana, diferencia, estado };
};
