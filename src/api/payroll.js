import { api } from "./client";

/**
 * Detecta si un nombre corresponde a un usuario virtual de balanceo.
 * Se aceptan el nombre original ("UserBalancer") y los numerados
 * ("UserBalancer-1", "UserBalancer-2", ...).
 */
export const isBalancerName = (name) => {
  const normalized = String(name ?? "").trim().toLowerCase();
  return normalized === "userbalancer" || /^userbalancer-\d+$/.test(normalized);
};

/**
 * Detecta si un registro de /payroll es un usuario virtual de balanceo.
 *
 * Se crean en la pantalla de User Balancers con:
 *   Nombres: "UserBalancer" o "UserBalancer-N"
 *   Cargo: "USERBALANCER"  |  Apellidos: ""
 *
 * El backend los devuelve con las claves en minúscula, pero se aceptan las dos
 * grafías por robustez frente a respuestas antiguas.
 */
export const isBalancerUser = (person) => {
  if (!person) return false;

  const cargo = String(person.cargo ?? person.Cargo ?? "").trim().toUpperCase();
  if (cargo === "USERBALANCER") return true;

  return isBalancerName(person.nombres || person.Nombres);
};

/** Grupo al que pertenece un registro de /payroll. */
const getPersonGroupId = (person) =>
  person?.grupoID || person?.grupo || person?.GrupoID || person?.Grupo;

/** Descarta los usuarios virtuales de un listado de personal. */
export const filterBalancerUsers = (people) =>
  (Array.isArray(people) ? people : []).filter((person) => !isBalancerUser(person));

/**
 * Cuenta los UserBalancers de cada grupo a partir del listado general de
 * /payroll. Devuelve un objeto { [groupId]: cantidad }.
 *
 * El grupo puede venir como grupoID, grupo, GrupoID o Grupo según la respuesta
 * del backend, por lo que se prueban las cuatro grafías.
 */
export const getUserBalancerCountsByGroup = (people) =>
  (Array.isArray(people) ? people : []).reduce((counts, person) => {
    if (!isBalancerUser(person)) return counts;

    const groupId = getPersonGroupId(person);
    if (!groupId) return counts;

    const key = String(groupId);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});

/**
 * Calcula el siguiente número de un UserBalancer dentro de un grupo.
 *
 * Usa el mayor sufijo existente + 1 para no duplicar nombres cuando se han
 * eliminado registros intermedios. Los registros antiguos sin sufijo cuentan
 * como secuencia 0, por lo que el primer nombre numerado de cada grupo es
 * "UserBalancer-1".
 */
export const getNextUserBalancerNumber = (people, groupId) => {
  const targetGroup = String(groupId ?? "");

  const maxSequence = (Array.isArray(people) ? people : []).reduce(
    (max, person) => {
      if (!isBalancerUser(person)) return max;
      if (String(getPersonGroupId(person) ?? "") !== targetGroup) return max;

      const name = String(person?.nombres || person?.Nombres || "").trim();
      const match = name.match(/^userbalancer(?:-(\d+))?$/i);
      const sequence = match?.[1] ? Number(match[1]) : 0;

      return Math.max(max, sequence);
    },
    0
  );

  return maxSequence + 1;
};

/**
 * Servicio del recurso /payroll (empleados).
 * Cada método devuelve directamente el body (lo que antes era response.data).
 */
export const payrollApi = {
  getAll: (config) =>
    api.get("/payroll", config).then((response) => response.data),

  getById: (id, config) =>
    api.get(`/payroll/${id}`, config).then((response) => response.data),

  /** Empleados de un grupo: /payroll/idGroup/:groupId */
  getByGroup: (groupId, config) =>
    api
      .get(`/payroll/idGroup/${groupId}`, config)
      .then((response) => response.data),

  /** Empleados de un grupo (ruta alterna usada por otros módulos): /payroll/people/:groupId */
  getPeopleByGroup: (groupId, config) =>
    api
      .get(`/payroll/people/${groupId}`, config)
      .then((response) => response.data),

  create: (payload, config) =>
    api.post("/payroll", payload, config).then((response) => response.data),

  update: (id, payload, config) =>
    api
      .put(`/payroll/${id}`, payload, config)
      .then((response) => response.data),

  remove: (id, config) =>
    api.delete(`/payroll/${id}`, config).then((response) => response.data),

  /** Limpia la asignación del balanceador de un trabajador */
  removeUserBalancer: (id, config) =>
    api
      .delete(`/payroll/userbalancer/${id}`, config)
      .then((response) => response.data),
};
