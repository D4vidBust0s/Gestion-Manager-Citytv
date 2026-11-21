import { createCrudApi } from "./crud";

/**
 * Departamentos compartidos por Requirements y Programmer: /departments
 *
 * A diferencia de los catálogos de demostración, viven en la base de datos.
 * Las operaciones de escritura requieren que el frontend envíe la identidad
 * del usuario en los headers (lo hace src/api/client.js).
 */
export const departmentsApi = createCrudApi("departments");
