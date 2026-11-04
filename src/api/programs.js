import { api } from "./client";
import { createCrudApi } from "./crud";

/**
 * Programas / eventos fijos: /programs
 * Además del CRUD hay dos listados filtrados por tipo.
 */
export const programsApi = {
  ...createCrudApi("programs"),

  /** Solo eventos Main: /programs/primary */
  getPrimary: (config) =>
    api.get("/programs/primary", config).then((r) => r.data),

  /** Solo eventos Secondary: /programs/secondary */
  getSecondary: (config) =>
    api.get("/programs/secondary", config).then((r) => r.data),
};
