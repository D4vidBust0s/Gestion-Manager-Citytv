/**
 * Etiquetas, filtros y formatos del módulo Activos de GM Citytv.
 *
 * Este módulo es de solo lectura sobre el inventario de GM-Activos: todas las
 * funciones son puras y no mutan los equipos recibidos.
 */

export const CLASE_ESTADO_EQUIPO = {
  Disponible: "activos-status--disponible",
  Asignado: "activos-status--asignado",
  Mantenimiento: "activos-status--mantenimiento",
  Protegido: "activos-status--protegido",
  Baja: "activos-status--baja",
  Novedad: "activos-status--novedad",
  Inactivo: "activos-status--baja",
};

export const MOTIVOS_INACTIVIDAD = [
  "Mantenimiento",
  "Protegido",
  "Baja",
  "Novedad",
];

export const etiquetaEstado = (equipo) =>
  equipo?.estadoOperativo ||
  equipo?.subEstado ||
  (equipo?.estado === "Inactivo" ? "Inactivo" : "Disponible");

export const claseEstado = (equipo) =>
  CLASE_ESTADO_EQUIPO[etiquetaEstado(equipo)] ?? "activos-status--disponible";

export const esEnMantenimiento = (equipo) =>
  equipo?.estado === "Inactivo" && equipo?.motivoInactivo === "Mantenimiento";

export const esEquipoBaja = (equipo) =>
  equipo?.estado === "Inactivo" && equipo?.motivoInactivo === "Baja";

export const restriccionesTexto = (equipo) =>
  (Array.isArray(equipo?.restricciones) ? equipo.restricciones : [])
    .map((item) => (typeof item === "string" ? item : item?.texto))
    .map((texto) => String(texto ?? "").trim())
    .filter(Boolean);

export const observacionesTexto = (equipo) =>
  (Array.isArray(equipo?.observaciones) ? equipo.observaciones : [])
    .map((item) => (typeof item === "string" ? item : item?.texto))
    .map((texto) => String(texto ?? "").trim())
    .filter(Boolean);

/** Texto libre que usa el buscador del inventario. */
export const textoBuscableEquipo = (equipo) =>
  [
    equipo?.placa,
    equipo?.descripcion,
    equipo?.categoria?.nombre,
    equipo?.subcategoria?.nombre,
    equipo?.ubicacion?.nombre,
    ...observacionesTexto(equipo),
    ...restriccionesTexto(equipo),
  ]
    .join(" ")
    .toLowerCase();

export const filtrarEquipos = (
  equipos = [],
  {
    q = "",
    categoriaId = "",
    subcategoriaId = "",
    ubicacionId = "",
    estado = "",
    motivoInactivo = "",
  } = {}
) => {
  const termino = String(q ?? "").trim().toLowerCase();

  return (Array.isArray(equipos) ? equipos : []).filter((equipo) => {
    if (
      categoriaId &&
      String(equipo?.categoria?.id ?? "") !== String(categoriaId)
    ) {
      return false;
    }
    if (
      subcategoriaId &&
      String(equipo?.subcategoria?.id ?? "") !== String(subcategoriaId)
    ) {
      return false;
    }
    if (
      ubicacionId &&
      String(equipo?.ubicacion?.id ?? "") !== String(ubicacionId)
    ) {
      return false;
    }
    if (estado && equipo?.estado !== estado) return false;
    if (motivoInactivo && equipo?.motivoInactivo !== motivoInactivo) {
      return false;
    }

    if (!termino) return true;

    return textoBuscableEquipo(equipo).includes(termino);
  });
};

export const filtrarSeguimientos = (seguimientos = [], q = "") => {
  const termino = String(q ?? "").trim().toLowerCase();
  if (!termino) return Array.isArray(seguimientos) ? seguimientos : [];

  return (Array.isArray(seguimientos) ? seguimientos : []).filter(
    (seguimiento) =>
      [
        seguimiento?.placa,
        seguimiento?.descripcion,
        seguimiento?.categoria?.nombre,
        seguimiento?.subcategoria?.nombre,
        seguimiento?.ubicacion?.nombre,
        seguimiento?.tipo,
        seguimiento?.mantenimientoDescripcion,
      ]
        .join(" ")
        .toLowerCase()
        .includes(termino)
  );
};

export const formatearFecha = (valor, opciones = {}) => {
  if (!valor) return "Sin fecha";

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...opciones,
  }).format(fecha);
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

export const formatearRangoReserva = (reserva) => {
  if (!reserva) return "";
  return `${formatearFechaHora(reserva.inicio)} → ${formatearFechaHora(
    reserva.fin
  )}`;
};

/** Progreso acotado a 0–100; devuelve null cuando no hay dato. */
export const normalizarProgreso = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null;
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return null;
  return Math.min(100, Math.max(0, Math.round(numero)));
};

export const progresoEquipo = (equipo) =>
  normalizarProgreso(equipo?.progresoMantenimiento);

export const resumenDesdeEquipos = (equipos = []) => {
  const resumen = {
    total: 0,
    activos: 0,
    inactivos: 0,
    disponibles: 0,
    asignados: 0,
    mantenimiento: 0,
    protegidos: 0,
    baja: 0,
    novedades: 0,
  };

  (Array.isArray(equipos) ? equipos : []).forEach((equipo) => {
    resumen.total += 1;

    if (equipo?.estado === "Inactivo") {
      resumen.inactivos += 1;
      if (equipo.motivoInactivo === "Mantenimiento") resumen.mantenimiento += 1;
      if (equipo.motivoInactivo === "Protegido") resumen.protegidos += 1;
      if (equipo.motivoInactivo === "Baja") resumen.baja += 1;
      if (equipo.motivoInactivo === "Novedad") resumen.novedades += 1;
      return;
    }

    resumen.activos += 1;
    if (equipo?.enCustodia || equipo?.subEstado === "Asignado") {
      resumen.asignados += 1;
    } else {
      resumen.disponibles += 1;
    }
  });

  return resumen;
};

/** Mantenimientos del más reciente al más antiguo. */
export const ordenarMantenimientos = (mantenimientos = []) =>
  (Array.isArray(mantenimientos) ? mantenimientos : [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b?.iniciadoEn || 0).getTime() -
        new Date(a?.iniciadoEn || 0).getTime()
    );

export const mantenimientoEnProceso = (mantenimientos = []) =>
  ordenarMantenimientos(mantenimientos).find(
    (mantenimiento) => mantenimiento?.estado === "En proceso"
  ) ?? null;

export const contadorAnotaciones = (seguimiento) =>
  (Array.isArray(seguimiento?.seguimiento?.anotaciones)
    ? seguimiento.seguimiento.anotaciones
    : []
  ).length;

export const promedioProgreso = (equipos = []) => {
  const valores = (Array.isArray(equipos) ? equipos : [])
    .map(progresoEquipo)
    .filter((valor) => valor !== null);

  if (valores.length === 0) return null;

  return Math.round(
    valores.reduce((total, valor) => total + valor, 0) / valores.length
  );
};
