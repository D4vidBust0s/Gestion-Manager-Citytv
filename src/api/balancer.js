import { api } from "./client";

/** Balanceador de cargas: /balancer */
export const balancerApi = {
  /** Balance actual calculado por el backend */
  getCurrent: (config) => api.get("/balancer", config).then((r) => r.data),
};
