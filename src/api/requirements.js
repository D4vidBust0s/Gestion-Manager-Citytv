import { api } from "./client";

/**
 * Requirements: solicitudes por área (Comercial, Noticias, etc.).
 * Es una colección y un ciclo de vida distintos de Programmer.
 */
export const requirementsApi = {
  /**
   * Lista solicitudes. Para consumidores operativos (GM-Activos) usar
   * `soloAprobadas: true` o `estado: "Aprobada"`; ambos incluyen Aprobada y
   * Agendado.
   */
  getAll: (params, config) =>
    api.get("/requirements", { ...config, params }).then((r) => r.data),

  getYears: (config) =>
    api.get("/requirements/years", config).then((r) => r.data),

  getResumen: (config) =>
    api.get("/requirements/resumen", config).then((r) => r.data),

  getById: (id, config) =>
    api.get(`/requirements/${id}`, config).then((r) => r.data),

  create: (payload, config) =>
    api.post("/requirements", payload, config).then((r) => r.data),

  update: (id, payload, config) =>
    api.put(`/requirements/${id}`, payload, config).then((r) => r.data),

  decide: (id, payload, config) =>
    api.put(`/requirements/${id}/decision`, payload, config).then((r) => r.data),

  assignPersonnel: (id, rolId, payload, config) =>
    api
      .put(
        `/requirements/${id}/personal/${encodeURIComponent(rolId)}/asignados`,
        payload,
        config
      )
      .then((r) => r.data),

  remove: (id, config) =>
    api.delete(`/requirements/${id}`, config).then((r) => r.data),
};
