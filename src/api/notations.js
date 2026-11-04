import { api } from "./client";

/**
 * Anotaciones del planificador: /notations
 *
 * El PUT y el DELETE no llevan id en la URL:
 *   PUT    /notations            { idnota, contenido }
 *   DELETE /notations?idnotation=
 */
export const notationsApi = {
  getAll: (config) => api.get("/notations", config).then((r) => r.data),

  /** Anotaciones de un trabajador en una fecha: ?id=&fecha= */
  getByUserAndDate: (userId, date, config) =>
    api
      .get("/notations", {
        ...config,
        params: { ...config?.params, id: userId, fecha: date },
      })
      .then((r) => r.data),

  create: (payload, config) =>
    api.post("/notations", payload, config).then((r) => r.data),

  /** Actualiza con el id en el body */
  update: (payload, config) =>
    api.put("/notations", payload, config).then((r) => r.data),

  /** Elimina con el id por query string */
  remove: (idNotation, config) =>
    api
      .delete("/notations", {
        ...config,
        params: { ...config?.params, idnotation: idNotation },
      })
      .then((r) => r.data),
};
