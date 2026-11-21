import { api, API_URL } from "./client";

/**
 * Inventario de GM-Activos consumido por GM Citytv.
 * Las imágenes se sirven por endpoint y no se cargan como data URL en el JSON.
 */
export const equipmentApi = {
  getAll: (params, config) =>
    api.get("/equipment", { ...config, params }).then((r) => r.data),

  getById: (id, config) =>
    api.get(`/equipment/${id}`, config).then((r) => r.data),

  getResumen: (config) =>
    api.get("/equipment/resumen", config).then((r) => r.data),

  getDisponibilidad: (params, config) =>
    api.get("/equipment/disponibilidad", { ...config, params }).then((r) => r.data),

  getAssignments: (params, config) =>
    api.get("/equipment-assignments", { ...config, params }).then((r) => r.data),

  getCategorias: (config) =>
    api.get("/equipment-categories", config).then((r) => r.data),

  getSubcategorias: (params, config) =>
    api.get("/equipment-subcategories", { ...config, params }).then((r) => r.data),

  getUbicaciones: (config) =>
    api.get("/equipment-locations", config).then((r) => r.data),

  /** Seguimientos abiertos después de un mantenimiento. */
  getSeguimientos: (config) =>
    api.get("/equipment/seguimientos", config).then((r) => r.data),

  /** Verifica que una placa esté libre antes de dar de alta el equipo. */
  checkPlate: (params, config) =>
    api
      .get("/equipment/verificar-placa", { ...config, params })
      .then((r) => r.data),

  create: (payload, config) =>
    api.post("/equipment", payload, config).then((r) => r.data),
};

/** URL de la imagen de una placa concreta (para líneas ya guardadas). */
export const imagenEquipoPorId = (inventarioId, version = null, size = "thumb") => {
  if (!inventarioId) return "";
  const query = new URLSearchParams({ size });
  if (version) query.set("v", new Date(version).getTime());
  return `${API_URL}/equipment/${inventarioId}/imagen?${query.toString()}`;
};

/** URL de la imagen de un equipo serializado (catálogo/disponibilidad). */
export const imagenEquipoSrc = (equipo, size = "thumb") => {
  const ruta =
    size === "thumb"
      ? equipo?.imagen?.miniaturaUrl ?? equipo?.imagen?.url
      : equipo?.imagen?.url ?? equipo?.imagen?.miniaturaUrl;

  return ruta ? `${API_URL}${ruta}` : "";
};

/** URL de la imagen genérica de una categoría del inventario. */
export const imagenCategoriaSrc = (categoria, size = "thumb") => {
  const ruta =
    size === "thumb"
      ? categoria?.imagen?.miniaturaUrl ?? categoria?.imagen?.url
      : categoria?.imagen?.url ?? categoria?.imagen?.miniaturaUrl;

  return ruta ? `${API_URL}${ruta}` : "";
};

/** URL del archivo de un adjunto de mantenimiento (evidencias). */
export const maintenanceAttachmentSrc = (
  equipoId,
  mantenimientoId,
  adjuntoId,
  descargar = false
) => {
  if (!equipoId || !mantenimientoId || !adjuntoId) return "";
  const ruta = `/equipment/${equipoId}/mantenimientos/${mantenimientoId}/adjuntos/${adjuntoId}/archivo`;
  return `${API_URL}${ruta}${descargar ? "?descargar=1" : ""}`;
};

/** URL de la imagen genérica de una subcategoría del inventario. */
export const imagenSubcategoriaSrc = (subcategoria, size = "thumb") => {
  const ruta =
    size === "thumb"
      ? subcategoria?.imagen?.miniaturaUrl ?? subcategoria?.imagen?.url
      : subcategoria?.imagen?.url ?? subcategoria?.imagen?.miniaturaUrl;

  return ruta ? `${API_URL}${ruta}` : "";
};
