import { api } from "./client";

/**
 * Fábrica de servicios para los recursos que comparten exactamente la misma
 * forma de rutas en el backend:
 *
 *   GET    /:resource            -> listado general
 *   GET    /:resource/:id        -> un registro
 *   GET    /:resource/:userId    -> registros de un empleado en un año (?año=YYYY)
 *   POST   /:resource            -> crear
 *   PUT    /:resource/:id        -> actualizar
 *   DELETE /:resource/:id        -> eliminar
 *
 * Todos los métodos devuelven directamente el body (lo que antes era
 * response.data), así los componentes nunca ven axios ni la URL.
 */
export const createCrudApi = (resource) => {
  const base = `/${resource}`;

  return {
    /** Nombre del recurso, útil para mensajes de error y depuración. */
    resource,

    getAll: (config) =>
      api.get(base, config).then((response) => response.data),

    getById: (id, config) =>
      api.get(`${base}/${id}`, config).then((response) => response.data),

    /** Registros de un trabajador para un año: /:resource/:userId?año=YYYY */
    getByUser: (userId, year, config) =>
      api
        .get(`${base}/${userId}`, {
          ...config,
          params: { ...config?.params, año: year },
        })
        .then((response) => response.data),

    create: (payload, config) =>
      api.post(base, payload, config).then((response) => response.data),

    update: (id, payload, config) =>
      api
        .put(`${base}/${id}`, payload, config)
        .then((response) => response.data),

    remove: (id, config) =>
      api.delete(`${base}/${id}`, config).then((response) => response.data),
  };
};
