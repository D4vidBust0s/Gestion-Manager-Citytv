import { api } from "./client";

/**
 * Esquemas de rotación: /rotations
 *
 * El PUT y el DELETE no llevan id en la URL: el backend lo recibe en el body.
 */
export const rotationsApi = {
  getAll: (config) => api.get("/rotations", config).then((r) => r.data),

  /** Rotaciones de un grupo: /rotations/:groupId */
  getByGroup: (groupId, config) =>
    api.get(`/rotations/${groupId}`, config).then((r) => r.data),

  /** Rotaciones de fin de semana de un grupo: /rotations/fs/:groupId */
  getByGroupFs: (groupId, config) =>
    api.get(`/rotations/fs/${groupId}`, config).then((r) => r.data),

  create: (payload, config) =>
    api.post("/rotations", payload, config).then((r) => r.data),

  /** Actualiza con el id en el body */
  update: (payload, config) =>
    api.put("/rotations", payload, config).then((r) => r.data),

  /** Elimina con el id en el body: PUT /rotations/delete { idreg } */
  removeByBody: (payload, config) =>
    api.put("/rotations/delete", payload, config).then((r) => r.data),
};
