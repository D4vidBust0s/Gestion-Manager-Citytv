/**
 * Cálculo puro de la alerta de fin de contrato para trabajadores temporales.
 *
 * La alerta se dispara ÚNICAMENTE para registros con `temporal = true`.
 * La fecha de referencia es `fechaIngreso`:
 *
 *   finContrato  = fechaIngreso + DiasPeriodo días
 *   inicioAlerta = finContrato - DiasAlert días
 *
 * `DiasAlert` y `DiasPeriodo` vienen de /rules y pueden llegar como texto.
 * No se hardcodea ningún valor: hoy son 5 y 180, pero pueden cambiar.
 *
 * La duración del latido empieza lenta (DURACION_LATIDO.INICIAL), se acelera
 * al acercarse `finContrato` y queda en su punto más rápido si el contrato ya
 * venció. El resultado es independiente de React y de la API para poder
 * probarlo de forma aislada.
 */

export const DURACION_LATIDO = Object.freeze({
  INICIAL: 2.4, // segundos: inicio suave
  FINAL: 0.5, // segundos: día de vencimiento
  VENCIDO: 0.28, // segundos: contrato ya vencido
});

const MS_POR_DIA = 24 * 60 * 60 * 1000;

const aFecha = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null;

  const fecha =
    valor instanceof Date ? new Date(valor.getTime()) : new Date(valor);

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
 * Diferencia en días calendario, calculada con componentes UTC para que los
 * cambios de horario (DST) no alteren el resultado.
 */
const diasCalendarioEntre = (desde, hasta) => {
  const inicio = Date.UTC(desde.getFullYear(), desde.getMonth(), desde.getDate());
  const fin = Date.UTC(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());

  return Math.round((fin - inicio) / MS_POR_DIA);
};

const parsearEntero = (valor) => {
  if (typeof valor === "number") {
    return Number.isInteger(valor) ? valor : null;
  }

  const texto = String(valor ?? "").trim();
  if (!/^-?\d+$/.test(texto)) return null;

  return Number.parseInt(texto, 10);
};

const redondearDuracion = (duracion) =>
  Math.round(duracion * 1000) / 1000;

const resultadoInactivo = (extra = {}) => ({
  activa: false,
  duracion: null,
  diasParaFin: null,
  progreso: 0,
  vencido: false,
  finContrato: null,
  inicioAlerta: null,
  ...extra,
});

/**
 * Acepta los valores que puede devolver el backend y evita que un string
 * "false" se interprete como verdadero.
 */
export const esTemporal = (valor) =>
  valor === true || valor === "true" || valor === 1 || valor === "1";

/**
 * @param {Object} entrada
 * @param {Date|string} entrada.fechaReferencia Fecha seleccionada en la barra.
 * @param {Date|string} entrada.fechaIngreso Fecha de ingreso del trabajador.
 * @param {boolean|string|number} entrada.temporal Bandera del trabajador.
 * @param {string|number} entrada.diasAlerta Días antes del vencimiento (rules).
 * @param {string|number} entrada.diasPeriodo Duración del contrato (rules).
 * @returns {{
 *   activa: boolean,
 *   duracion: number|null,
 *   diasParaFin: number|null,
 *   progreso: number,
 *   vencido: boolean,
 *   finContrato: Date|null,
 *   inicioAlerta: Date|null
 * }}
 */
export const calcularAlertaContrato = ({
  fechaReferencia,
  fechaIngreso,
  temporal,
  diasAlerta,
  diasPeriodo,
} = {}) => {
  if (!esTemporal(temporal)) return resultadoInactivo();

  const referencia = aFecha(fechaReferencia);
  const ingreso = aFecha(fechaIngreso);
  const alerta = parsearEntero(diasAlerta);
  const periodo = parsearEntero(diasPeriodo);

  if (!referencia || !ingreso || alerta === null || periodo === null) {
    return resultadoInactivo();
  }

  if (alerta < 0 || periodo <= 0) return resultadoInactivo();

  const ingresoDia = inicioDelDia(ingreso);
  const referenciaDia = inicioDelDia(referencia);

  // Una fecha de ingreso futura no debe generar alerta.
  if (referenciaDia.getTime() < ingresoDia.getTime()) {
    return resultadoInactivo();
  }

  const finContrato = sumarDias(ingresoDia, periodo);
  const inicioAlerta = sumarDias(finContrato, -alerta);
  const diasParaFin = diasCalendarioEntre(referenciaDia, finContrato);

  if (diasParaFin > alerta) {
    return resultadoInactivo({ diasParaFin, finContrato, inicioAlerta });
  }

  const vencido = diasParaFin < 0;
  const progreso = vencido
    ? 1
    : alerta > 0
      ? Math.min(Math.max(1 - diasParaFin / alerta, 0), 1)
      : 1;

  // progreso² mantiene el inicio suave y concentra la aceleración cerca del
  // vencimiento.
  const duracion = vencido
    ? DURACION_LATIDO.VENCIDO
    : DURACION_LATIDO.INICIAL +
      (DURACION_LATIDO.FINAL - DURACION_LATIDO.INICIAL) *
        progreso ** 2;

  return {
    activa: true,
    duracion: redondearDuracion(duracion),
    diasParaFin,
    progreso,
    vencido,
    finContrato,
    inicioAlerta,
  };
};
