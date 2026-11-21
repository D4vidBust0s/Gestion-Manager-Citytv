/**
 * Utilidades de periodo anual para Requirements.
 *
 * Requirements trabaja con datos de demostración en memoria. El archivo se
 * deriva de `evento.fecha`; no se agrega un campo de archivado.
 */

/** Devuelve el año de una fecha `YYYY-MM-DD` o null si no es válida. */
export const anioDeFecha = (fecha) => {
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fecha ?? ""));

  if (!coincidencia) return null;

  const anio = Number(coincidencia[1]);
  const mes = Number(coincidencia[2]);
  const dia = Number(coincidencia[3]);

  if (
    !Number.isInteger(anio) ||
    !Number.isInteger(mes) ||
    !Number.isInteger(dia) ||
    mes < 1 ||
    mes > 12 ||
    dia < 1 ||
    dia > 31
  ) {
    return null;
  }

  return anio;
};

export const esSolicitudVigente = (solicitud, anioActual) => {
  const anio = anioDeFecha(solicitud?.evento?.fecha);
  return anio !== null && anio >= Number(anioActual);
};

/**
 * Filtra las solicitudes por periodo.
 * - vigentes: año de la fecha >= año actual (incluye años futuros)
 * - archivo: año de la fecha === año archivado seleccionado
 */
export const filtrarSolicitudesPorPeriodo = (
  solicitudes,
  { periodo = "vigentes", anioArchivo = null, anioActual } = {}
) => {
  if (!Array.isArray(solicitudes)) return [];

  const actual = Number(anioActual);

  return solicitudes.filter((solicitud) => {
    const anio = anioDeFecha(solicitud?.evento?.fecha);

    if (anio === null) return false;

    if (periodo === "archivo") {
      return Number(anioArchivo) === anio;
    }

    return anio >= actual;
  });
};

/** Años anteriores con solicitudes, de mayor a menor. */
export const obtenerAniosArchivo = (solicitudes, anioActual) => {
  if (!Array.isArray(solicitudes)) return [];

  const actual = Number(anioActual);
  const anios = new Set();

  solicitudes.forEach((solicitud) => {
    const anio = anioDeFecha(solicitud?.evento?.fecha);
    if (anio !== null && anio < actual) anios.add(anio);
  });

  return [...anios].sort((a, b) => b - a);
};
