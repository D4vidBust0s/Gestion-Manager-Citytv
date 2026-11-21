import { api } from "./client";

/**
 * Turnos: /shifts
 *
 * Varias rutas son "de acción" y no CRUD puro:
 *   /shifts/day, /shifts/full, /shifts/daykey,
 *   /shifts/all/:fecha, /shifts/routes/by-date, /shifts/single/:id
 */
export const shiftsApi = {
  /** Listado filtrable por trabajador y fecha: ?id=&fecha= */
  getAll: (config) => api.get("/shifts", config).then((r) => r.data),

  /** Todos los turnos con información extendida */
  getFull: (config) => api.get("/shifts/full", config).then((r) => r.data),

  /** Turnos entre dos extremos: ?in=&out= */
  getDay: (config) => api.get("/shifts/day", config).then((r) => r.data),

  /** Turnos de un día concreto: ?daykey=ISO */
  getDayKey: (config) => api.get("/shifts/daykey", config).then((r) => r.data),

  /** Turnos por fecha ISO dentro de la ruta: /shifts/all/:fecha */
  getAllByDate: (date, config) =>
    api.get(`/shifts/all/${date}`, config).then((r) => r.data),

  /** Rutas de un día: ?fecha= */
  getRoutesByDate: (date, config) =>
    api
      .get("/shifts/routes/by-date", {
        ...config,
        params: { ...config?.params, fecha: date },
      })
      .then((r) => r.data),

  create: (payload, config) =>
    api.post("/shifts", payload, config).then((r) => r.data),

  /** Actualiza con los identificadores en el body (la URL no lleva id) */
  update: (payload, config) =>
    api.put("/shifts", payload, config).then((r) => r.data),

  /** Actualiza un turno existente (consolidación, sin crear registros) */
  updateConsolidation: (id, payload, config) =>
    api
      .put(`/shifts/consolidation/${id}`, payload, config)
      .then((r) => r.data),

  /** Actualiza varios turnos existentes en una sola llamada */
  consolidateBulk: (updates, config) =>
    api
      .put("/shifts/consolidation", { updates }, config)
      .then((r) => r.data),

  /** Elimina un turno concreto: /shifts/single/:id */
  remove: (id, config) =>
    api.delete(`/shifts/single/${id}`, config).then((r) => r.data),

  /** Elimina todos los turnos de una fecha ISO: /shifts/all/:fecha */
  removeByDate: (date, config) =>
    api.delete(`/shifts/all/${date}`, config).then((r) => r.data),
};
