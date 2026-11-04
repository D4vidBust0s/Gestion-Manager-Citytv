import { createCrudApi } from "./crud";

/**
 * Programación de eventos por fecha: /programmer
 * El GET se filtra con ?fecha=, que el CRUD ya admite vía config.
 */
export const programmerApi = createCrudApi("programmer");
