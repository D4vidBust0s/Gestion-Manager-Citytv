import { createCrudApi } from "./crud";
import { api } from "./client";

/**
 * Programación de eventos por fecha: /programmer
 *
 * Además de los campos históricos que consume ModalPlanner1
 * (Nombre, Fecha_clave, Time_in, Time_out, Color, ...), el body admite los
 * metadatos del requerimiento manual:
 *
 *   codigo, departamento, prioridad, estado, tipoEvento, programa,
 *   locacion, descripcion, solicitante, personal, equipos, historial
 *
 * El backend los guarda de forma opcional, por lo que los registros antiguos
 * siguen funcionando y el planificador no necesita cambios.
 */
const crud = createCrudApi("programmer");

export const programmerApi = {
  ...crud,

  /**
   * Consulta los requerimientos cuya Fecha_clave corresponde al día indicado.
   * `fecha` debe ser la medianoche local en ISO, que es el formato que ya usan
   * usePlannerData y useConsolidateData.
   */
  getByDate: (fecha, config = {}) =>
    api
      .get("/programmer", {
        ...config,
        params: { ...(config.params ?? {}), fecha },
      })
      .then((response) => response.data),

  /**
   * Lista todos los requerimientos manuales sin filtrar por fecha.
   * Se usa en la pestaña "Todos" de la pantalla Programmer.
   */
  getAllRequirements: (config = {}) =>
    api
      .get("/programmer", {
        ...config,
        params: { ...(config.params ?? {}), todas: true },
      })
      .then((response) => response.data),

  /** Requerimientos de un año calendario (para Año actual / Años anteriores). */
  getByYear: (anio, config = {}) =>
    api
      .get("/programmer", {
        ...config,
        params: { ...(config.params ?? {}), anio },
      })
      .then((response) => response.data),

  /** Años con requerimientos registrados: [{ anio, total }]. */
  getYears: (config = {}) =>
    api.get("/programmer/years", config).then((response) => response.data),

  /** Aprueba, rechaza o solicita revisión de un requerimiento. */
  decide: (id, payload, config = {}) =>
    api
      .put(`/programmer/${id}/decision`, payload, config)
      .then((response) => response.data),

  /** Asigna personal real a un grupo requerido. */
  assignPersonnel: (id, rolId, payload, config = {}) =>
    api
      .put(
        `/programmer/${id}/personal/${encodeURIComponent(rolId)}/asignados`,
        payload,
        config
      )
      .then((response) => response.data),
};
