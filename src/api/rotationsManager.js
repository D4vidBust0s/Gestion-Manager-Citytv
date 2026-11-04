import { api } from "./client";

/**
 * Estado del planificador por grupo: /rotationsmanager y /rotationsmanager-fs
 *
 * Son casi el mismo recurso: la variante "-fs" cubre los turnos fijos de fin
 * de semana. Por eso se generan con una fábrica y se exportan las dos.
 */
const crearRotationsManagerApi = (resource) => {
  const base = `/${resource}`;

  return {
    /** Todos los registros del planificador */
    getAll: (config) => api.get(base, config).then((r) => r.data),

    /** Registros fijos de un grupo: /:recurso/fijos/:idGrupo */
    getFijos: (groupId, config) =>
      api.get(`${base}/fijos/${groupId}`, config).then((r) => r.data),

    /** Nuevo esquema de un grupo */
    create: (payload, config) =>
      api.post(base, payload, config).then((r) => r.data),

    /** Actualiza la fecha clave y los totales del grupo: /:recurso/:idGrupo */
    updateGroup: (groupId, payload, config) =>
      api.put(`${base}/${groupId}`, payload, config).then((r) => r.data),

    /** Avanza el índice del trabajador: /:recurso/update/:idUsuario */
    updateIndex: (userId, payload, config) =>
      api.put(`${base}/update/${userId}`, payload, config).then((r) => r.data),

    /** Marca si el turno es fijo: /:recurso/actfijo/:idUsuario */
    updateFixed: (userId, payload, config) =>
      api.put(`${base}/actfijo/${userId}`, payload, config).then((r) => r.data),

    /** Recalcula el total de esquemas del grupo */
    updateTotalSchema: (groupId, payload, config) =>
      api
        .put(`${base}/actualizartotalschema/${groupId}`, payload, config)
        .then((r) => r.data),

    /** Recalcula el índice posterior a un borrado */
    updatePostDelete: (userId, payload, config) =>
      api
        .put(`${base}/actualizarpostdel/${userId}`, payload, config)
        .then((r) => r.data),

    /** Guarda el nombre del esquema */
    setName: (payload, config) =>
      api.put(`${base}/setname`, payload, config).then((r) => r.data),

    /** Actualiza los datos salariales del trabajador */
    updatePayroll: (userId, payload, config) =>
      api.put(`${base}/payroll/${userId}`, payload, config).then((r) => r.data),

    /** Actualiza los totales del grupo */
    updateGroupTotals: (groupId, payload, config) =>
      api
        .put(`${base}/uptdatetotalgroup/${groupId}`, payload, config)
        .then((r) => r.data),

    remove: (id, config) =>
      api.delete(`${base}/${id}`, config).then((r) => r.data),

    /** Borra el registro simple del trabajador: /:recurso/delsimplereg/:id */
    removeSimple: (id, config) =>
      api.delete(`${base}/delsimplereg/${id}`, config).then((r) => r.data),
  };
};

/** Turnos rotativos entre semana */
export const rotationsManagerApi = crearRotationsManagerApi("rotationsmanager");

/** Turnos fijos de fin de semana */
export const rotationsManagerFsApi =
  crearRotationsManagerApi("rotationsmanager-fs");
