import { api } from "./client";

/**
 * Sustituciones temporales: /substitutions
 * El GET se filtra por trabajador y fecha.
 */
export const substitutionsApi = {
  getAll: (config) => api.get("/substitutions", config).then((r) => r.data),

  /** Sustituciones de un trabajador en una fecha: ?id=&fecha= */
  getByUserAndDate: (userId, date, config) =>
    api
      .get("/substitutions", {
        ...config,
        params: { ...config?.params, id: userId, fecha: date },
      })
      .then((r) => r.data),

  create: (payload, config) =>
    api.post("/substitutions", payload, config).then((r) => r.data),

  remove: (id, config) =>
    api.delete(`/substitutions/${id}`, config).then((r) => r.data),
};
