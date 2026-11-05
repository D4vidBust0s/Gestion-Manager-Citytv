import { api } from "./client";

/**
 * Elementos del esquema de turnos: /stacks
 * Además del CRUD normal hay un borrado masivo por id de esquema.
 */
export const stacksApi = {
  getAll: (config) => api.get("/stacks", config).then((r) => r.data),

  /** Elementos de un esquema: /stacks/:idschema */
  getBySchema: (idSchema, config) =>
    api.get(`/stacks/${idSchema}`, config).then((r) => r.data),

  create: (payload, config) =>
    api.post("/stacks", payload, config).then((r) => r.data),

  update: (id, payload, config) =>
    api.put(`/stacks/${id}`, payload, config).then((r) => r.data),

  remove: (id, config) =>
    api.delete(`/stacks/${id}`, config).then((r) => r.data),

  /** Borra todos los elementos de un esquema: /stacks/deleteall/:idschema */
  removeAllBySchema: (idSchema, config) =>
    api.delete(`/stacks/deleteall/${idSchema}`, config).then((r) => r.data),
};

/* ==========================================
   DURACIONES DEL STACK
   Estas reglas replican fullTime() de ModalPlanner1: el acumulado que se
   muestra en Rotations y el del planificador deben dar los mismos minutos.
   El cálculo vive en utils/stackDuration.js; aquí solo se re-exporta para
   conservar los imports existentes (RotationsContent usa estos helpers).
   ========================================== */

export {
  minutosEntreFechas,
  duracionPrograma,
  duracionItemStack,
  resumirStackDuracion,
} from "../utils/stackDuration";
