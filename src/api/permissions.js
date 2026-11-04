import { createCrudApi } from "./crud";

/**
 * Permisos: /permissions
 * Mantiene exactamente los mismos métodos que ya usaba la pantalla.
 */
export const permissionsApi = createCrudApi("permissions");
