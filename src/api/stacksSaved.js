import { createCrudApi } from "./crud";

/**
 * Esquemas guardados: /stacks-saved
 * (recurso distinto de /savedstacks, que son stacks con nombre)
 */
export const stacksSavedApi = createCrudApi("stacks-saved");
