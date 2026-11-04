import { api } from "./client";

/**
 * Novedades de grupo: /novelties
 * El GET se filtra por ?grupoID= y la resolución es una ruta de acción propia.
 */
export const noveltiesApi = {
  getAll: (config) => api.get("/novelties", config).then((r) => r.data),

  /** Novedades de un grupo */
  getByGroup: (groupId, config) =>
    api
      .get("/novelties", {
        ...config,
        params: { ...config?.params, grupoID: groupId },
      })
      .then((r) => r.data),

  create: (payload, config) =>
    api.post("/novelties", payload, config).then((r) => r.data),

  /** Marca la novedad como resuelta: /novelties/:id/resolve */
  resolve: (id, payload, config) =>
    api
      .put(`/novelties/${id}/resolve`, payload, config)
      .then((r) => r.data),

  remove: (id, config) =>
    api.delete(`/novelties/${id}`, config).then((r) => r.data),
};
