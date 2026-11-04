import { api } from "./client";

/**
 * Festivos: /holidays
 *   /holidays/:year             -> festivos del año
 *   /holidays/especial/:year    -> festivos especiales, con ?fecha=
 */
export const holidaysApi = {
  getByYear: (year, config) =>
    api.get(`/holidays/${year}`, config).then((r) => r.data),

  getSpecialByYear: (year, config) =>
    api.get(`/holidays/especial/${year}`, config).then((r) => r.data),

  /** Festivos especiales para una fecha concreta del año */
  getSpecialByDate: (year, date, config) =>
    api
      .get(`/holidays/especial/${year}`, {
        ...config,
        params: { ...config?.params, fecha: date },
      })
      .then((r) => r.data),
};
