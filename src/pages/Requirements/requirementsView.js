import { CATALOGO_EQUIPOS, ROLES_TECNICOS } from "./requirementsData";

/** Catálogos resueltos por ID para evitar duplicar nombres en la UI. */
export const MAPA_ROLES = new Map(ROLES_TECNICOS.map((rol) => [rol.id, rol.nombre]));
export const MAPA_EQUIPOS = new Map(
  CATALOGO_EQUIPOS.map((equipo) => [equipo.id, equipo])
);

export const CLASE_ESTADO = {
  Pendiente: "requirements-badge--pending",
  "En revisión": "requirements-badge--review",
  Aprobada: "requirements-badge--approved",
  Agendado: "requirements-badge--scheduled",
  Rechazada: "requirements-badge--rejected",
};

export const ETIQUETA_TIPO_HISTORIAL = {
  creacion: "Solicitud creada",
  aprobacion: "Solicitud aprobada",
  agendamiento: "Solicitud agendada",
  rechazo: "Solicitud denegada",
  revision: "Revisión solicitada",
  actualizacion: "Solicitud actualizada",
  asignacion: "Personal asignado",
};

export const CLASE_TIPO_HISTORIAL = {
  creacion: "requirements-history__item--creacion",
  aprobacion: "requirements-history__item--aprobacion",
  agendamiento: "requirements-history__item--agendamiento",
  rechazo: "requirements-history__item--rechazo",
  revision: "requirements-history__item--revision",
  actualizacion: "requirements-history__item--actualizacion",
  asignacion: "requirements-history__item--asignacion",
};

export const formatearFecha = (
  fechaISO,
  opciones = { day: "2-digit", month: "short", year: "numeric" }
) => {
  if (!fechaISO) return "Sin fecha";

  const [anio, mes, dia] = String(fechaISO).split("-").map(Number);
  if (!anio || !mes || !dia) return "Sin fecha";

  const fecha = new Date(anio, mes - 1, dia);
  if (Number.isNaN(fecha.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-CO", opciones).format(fecha);
};

export const formatearFechaHora = (valor) => {
  if (!valor) return "Sin registro";

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "Sin registro";

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(fecha);
};

export const sumarCantidad = (items) =>
  (Array.isArray(items) ? items : []).reduce(
    (total, item) => total + (Number(item?.cantidad) || 0),
    0
  );

export const nombreRol = (rolId) => MAPA_ROLES.get(rolId) ?? "Rol sin catalogar";

export const datosEquipo = (equipoId) =>
  MAPA_EQUIPOS.get(equipoId) ?? { categoria: "Sin categoría", nombre: equipoId };

/** Ordena el historial por fecha. Por defecto deja lo más reciente primero. */
export const ordenarHistorial = (historial, orden = "desc") => {
  const lista = Array.isArray(historial) ? [...historial] : [];
  const factor = orden === "asc" ? 1 : -1;

  return lista.sort(
    (entradaA, entradaB) => factor * (new Date(entradaA.el) - new Date(entradaB.el))
  );
};

export const contarMovimientos = (solicitud) =>
  Array.isArray(solicitud?.historial) ? solicitud.historial.length : 0;
