/**
 * Estados de ausencia y colores equivalentes a los de Barra.jsx.
 *
 * La prioridad importa cuando una persona tiene más de una ausencia activa:
 * se muestra la primera que coincida.
 */

import { rangoCubreFecha } from "./plannerStack";

export const ESTADOS_AUSENCIA = [
  {
    key: "permiso",
    source: "permissions",
    label: "Permiso",
    color: "#E9BD1A",
    textColor: "#000000",
  },
  {
    key: "incapacidad",
    source: "incapacitys",
    label: "Incapacidad",
    color: "red",
    textColor: "#DADADA",
  },
  {
    key: "vacaciones",
    source: "recess",
    label: "Vacaciones",
    color: "#dd6c21",
    textColor: "#000000",
  },
  {
    key: "licencia",
    source: "licenses",
    label: "Licencia",
    color: "#00094B",
    textColor: "#DADADA",
  },
  {
    key: "descanso",
    source: "breaks",
    label: "Descanso",
    color: "#2f800d",
    textColor: "#ffffff",
  },
  {
    key: "compensatorio",
    source: "compensatories",
    label: "Compensatorio",
    color: "#bc09e9",
    textColor: "#ffffff",
  },
];

/**
 * Devuelve el estado de ausencia y el registro que cubre la fecha.
 *
 * @param {Object} entrada
 * @param {string} entrada.id Id del empleado
 * @param {Date|string} entrada.fecha Fecha a validar
 * @param {Object} entrada.ausencias Listas por fuente: permissions, breaks, ...
 */
export const obtenerDetalleAusencia = ({ id, fecha, ausencias } = {}) => {
  const idUsuario = String(id ?? "").trim();
  if (!idUsuario || !ausencias) return null;

  for (const estado of ESTADOS_AUSENCIA) {
    const registros = ausencias[estado.source];
    if (!Array.isArray(registros)) continue;

    const registro = registros.find((item) =>
      rangoCubreFecha([item], idUsuario, fecha)
    );

    if (registro) {
      return { estado, registro };
    }
  }

  return null;
};

/** Devuelve solo el estado de ausencia activo para una persona y fecha. */
export const obtenerEstadoAusencia = (args) =>
  obtenerDetalleAusencia(args)?.estado ?? null;
