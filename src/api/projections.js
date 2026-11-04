import { api } from "./client";

/** Proyecciones / simulaciones de nómina: /projections */
export const projectionsApi = {
  getAll: (config) => api.get("/projections", config).then((r) => r.data),

  create: (payload, config) =>
    api.post("/projections", payload, config).then((r) => r.data),
};
