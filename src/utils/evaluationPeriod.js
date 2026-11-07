/**
 * Cálculo puro del periodo de evaluación configurado en /rules.
 *
 * Se usa la última regla, igual que calcularRango() del planificador, para
 * que las fechas mostradas coincidan con el resto del sistema.
 */

const DIA_MS = 24 * 60 * 60 * 1000;

export const ESTADOS_PERIODO = {
  SIN_CONFIGURACION: "sin-configuracion",
  PROXIMO: "proximo",
  EN_CURSO: "en-curso",
  FINALIZADO: "finalizado",
};

const fechaValida = (valor) => {
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const inicioDelDia = (fecha) => {
  const copia = new Date(fecha.getTime());
  copia.setHours(0, 0, 0, 0);
  return copia;
};

const sumarDias = (fecha, dias) => {
  const copia = new Date(fecha.getTime());
  copia.setDate(copia.getDate() + dias);
  return copia;
};

/**
 * @param {Object} entrada
 * @param {Array} entrada.rules Listado de /rules
 * @param {Date|string} [entrada.ahora] Momento de referencia
 */
export const calcularPeriodoEvaluacion = ({ rules = [], ahora } = {}) => {
  const referencia = fechaValida(ahora ?? new Date()) ?? new Date();

  const reglas = Array.isArray(rules) ? rules : [];
  const regla = reglas[reglas.length - 1];

  const inicioBase = fechaValida(regla?.DiaPeriod);
  const totalDias = parseInt(regla?.Dia, 10);

  if (!inicioBase || !Number.isFinite(totalDias) || totalDias <= 0) {
    return {
      estado: ESTADOS_PERIODO.SIN_CONFIGURACION,
      inicio: null,
      fin: null,
      totalDias: 0,
      diaActual: 0,
      porcentaje: 0,
      restanteMs: 0,
    };
  }

  const inicio = inicioDelDia(inicioBase);

  // La fecha final mostrada es inclusiva: el periodo sigue vigente hasta el
  // final de ese día y el siguiente periodo empieza al día siguiente.
  const fin = sumarDias(inicio, totalDias);
  const siguienteInicio = sumarDias(fin, 1);

  const duracionMs = fin.getTime() - inicio.getTime();
  const transcurridoMs = Math.min(
    Math.max(referencia.getTime() - inicio.getTime(), 0),
    duracionMs
  );

  if (referencia.getTime() < inicio.getTime()) {
    return {
      estado: ESTADOS_PERIODO.PROXIMO,
      inicio,
      fin,
      totalDias,
      diaActual: 0,
      porcentaje: 0,
      restanteMs: inicio.getTime() - referencia.getTime(),
    };
  }

  if (referencia.getTime() >= siguienteInicio.getTime()) {
    return {
      estado: ESTADOS_PERIODO.FINALIZADO,
      inicio,
      fin,
      totalDias,
      diaActual: totalDias,
      porcentaje: 100,
      restanteMs: 0,
    };
  }

  return {
    estado: ESTADOS_PERIODO.EN_CURSO,
    inicio,
    fin,
    totalDias,
    diaActual: Math.min(
      totalDias,
      Math.floor(transcurridoMs / DIA_MS) + 1
    ),
    // 100% se reserva para el estado finalizado; el último tramo en curso
    // se queda en 99 para no mostrar un periodo terminado antes de tiempo.
    porcentaje: Math.min(
      99,
      Math.round((transcurridoMs / duracionMs) * 100)
    ),
    restanteMs: siguienteInicio.getTime() - referencia.getTime(),
  };
};

/**
 * Avanza el periodo hasta encontrar el que contiene `ahora`.
 *
 * Si la aplicación estuvo cerrada varios periodos, se salta todos los
 * completados y se devuelve el inicio del periodo vigente. El nuevo inicio
 * es el día siguiente al fin mostrado del periodo anterior.
 */
export const calcularSiguientePeriodo = ({
  inicio,
  totalDias,
  ahora,
  limite = 1000,
} = {}) => {
  const inicioBase = fechaValida(inicio);
  const referencia = fechaValida(ahora ?? new Date());
  const dias = parseInt(totalDias, 10);
  const maximo =
    Number.isFinite(limite) && limite > 0 ? Math.floor(limite) : 1000;

  if (!inicioBase || !referencia || !Number.isFinite(dias) || dias <= 0) {
    return null;
  }

  let inicioVigente = inicioDelDia(inicioBase);
  let fin = sumarDias(inicioVigente, dias);
  let siguienteInicio = sumarDias(fin, 1);
  let periodosAvanzados = 0;

  while (
    referencia.getTime() >= siguienteInicio.getTime() &&
    periodosAvanzados < maximo
  ) {
    inicioVigente = siguienteInicio;
    fin = sumarDias(inicioVigente, dias);
    siguienteInicio = sumarDias(fin, 1);
    periodosAvanzados += 1;
  }

  return {
    inicio: inicioVigente,
    fin,
    periodosAvanzados,
    limiteAlcanzado: referencia.getTime() >= siguienteInicio.getTime(),
  };
};
