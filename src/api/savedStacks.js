import { api } from "./client";

/**
 * Stacks con nombre (copias de trabajo): /savedstacks
 * Se identifican por nombre, no por id.
 */
export const savedStacksApi = {
  getAll: (config) => api.get("/savedstacks", config).then((r) => r.data),

  /** Trae el stack corto de un nombre: /savedstacks/corto?nombre= */
  getShort: (name, config) =>
    api
      .get("/savedstacks/corto", {
        ...config,
        params: { ...config?.params, nombre: name },
      })
      .then((r) => r.data),

  create: (payload, config) =>
    api.post("/savedstacks", payload, config).then((r) => r.data),

  /** Renombra el stack: /savedstacks/:nombre */
  update: (name, payload, config) =>
    api.put(`/savedstacks/${name}`, payload, config).then((r) => r.data),

  remove: (name, config) =>
    api.delete(`/savedstacks/${name}`, config).then((r) => r.data),
};
