import { api } from "./client";

/**
 * Rutas: /routes
 * El único endpoint hasta ahora devuelve un PDF binario.
 */
export const routesApi = {
  /**
   * Genera el PDF de rutas del personal aprobado.
   * Devuelve el Blob listo para descargar.
   */
  createPdf: (payload, config) =>
    api
      .post("/routes/pdf", payload, { responseType: "blob", ...config })
      .then((response) => response.data),
};
