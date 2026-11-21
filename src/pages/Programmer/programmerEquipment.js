/**
 * Reglas puras de equipos para Programmer.
 *
 * La aprobación de un programador reserva placas reales en GM-Activos. Entre
 * el alta y la aprobación la franja puede ocuparse, por eso aquí se compara lo
 * solicitado contra la disponibilidad vigente antes de permitir la decisión.
 */

const texto = (valor) => String(valor ?? "").trim();

const idLinea = (linea) =>
  texto(
    linea?.inventarioId ??
      linea?.equipoId ??
      linea?.inventario?._id ??
      linea?.equipo?._id
  );

const idDisponibilidad = (equipo) => texto(equipo?.id ?? equipo?._id);

const restriccionesDe = (item) => {
  const lista = Array.isArray(item?.restricciones ?? item?.Restricciones)
    ? item.restricciones ?? item.Restricciones
    : [];

  return lista
    .map((restriccion) => texto(restriccion?.texto ?? restriccion))
    .filter(Boolean);
};

/** Nombre visible de una línea o de un equipo de disponibilidad. */
export const nombreEquipo = (item) =>
  texto(item?.placa) ||
  texto(item?.equipo) ||
  texto(item?.descripcion) ||
  "Equipo sin placa";

/**
 * Evalúa cada línea del requerimiento contra la lista de disponibilidad.
 * La lista debe venir con `incluirNoDisponibles=true` para distinguir entre
 * "reservado/inactivo" y "no existe".
 */
export const evaluarEquiposProgrammer = (equipos = [], disponibilidad = []) => {
  const lineas = Array.isArray(equipos) ? equipos : [];
  const porId = new Map(
    (Array.isArray(disponibilidad) ? disponibilidad : [])
      .map((equipo) => [idDisponibilidad(equipo), equipo])
      .filter(([id]) => Boolean(id))
  );

  const conteo = new Map();
  lineas.forEach((linea) => {
    const id = idLinea(linea);
    if (!id) return;
    conteo.set(id, (conteo.get(id) ?? 0) + 1);
  });

  const estados = lineas.map((linea, indice) => {
    const id = idLinea(linea);
    const base = {
      indice,
      id,
      placa: nombreEquipo(linea),
      disponible: false,
      estado: "ok",
      motivo: "",
    };

    if (!id) {
      return {
        ...base,
        estado: "sin-inventario",
        motivo:
          "La línea no tiene una placa real de GM-Activos. Reemplázala por un equipo del inventario.",
      };
    }

    if ((conteo.get(id) ?? 0) > 1) {
      return {
        ...base,
        estado: "duplicado",
        motivo: `La placa ${base.placa} está repetida en la solicitud.`,
      };
    }

    const equipo = porId.get(id);

    if (!equipo) {
      return {
        ...base,
        estado: "no-encontrado",
        motivo: `El equipo ${base.placa} ya no existe en el inventario de GM-Activos.`,
      };
    }

    if (equipo.disponible === false) {
      return {
        ...base,
        estado: "no-disponible",
        motivo:
          texto(equipo.motivoNoDisponible) ||
          `El equipo ${base.placa} no está disponible en esta franja.`,
      };
    }

    return { ...base, disponible: true };
  });

  const conflictos = estados.filter((linea) => linea.estado !== "ok");

  return {
    lineas: estados,
    conflictos,
    bloqueado: conflictos.length > 0,
  };
};

/** Convierte un equipo del selector de disponibilidad en una línea guardable. */
export const equipoDisponibilidadALinea = (equipo = {}) => {
  const id = idDisponibilidad(equipo);
  const categoria = texto(equipo?.categoria?.nombre);
  const placa = texto(equipo?.placa);

  return {
    equipoId: id,
    inventarioId: id,
    equipo:
      texto(equipo?.descripcion) ||
      `${categoria} ${placa}`.trim() ||
      "Equipo sin descripción",
    placa,
    categoria,
    subcategoria: texto(equipo?.subcategoria?.nombre),
    descripcion: texto(equipo?.descripcion),
    imagenActualizadaEn: equipo?.imagen?.actualizadaEn ?? null,
    restricciones: restriccionesDe(equipo),
    restriccionesAceptadasPor: "",
    restriccionesAceptadasPorId: "",
    restriccionesAceptadasEl: null,
    cantidad: 1,
    notas: "",
  };
};

/**
 * Reemplaza una línea por un equipo disponible conservando las notas de la
 * línea original. El resto de líneas queda intacto.
 */
export const reemplazarLineaEquipo = (lineas = [], indice = -1, equipo = {}) => {
  const resultado = (Array.isArray(lineas) ? lineas : []).map((linea) => ({
    ...linea,
  }));

  if (indice < 0 || indice >= resultado.length) return resultado;

  const anterior = resultado[indice] ?? {};
  resultado[indice] = {
    ...equipoDisponibilidadALinea(equipo),
    notas: texto(anterior?.notas),
  };

  return resultado;
};

/**
 * Arma el arreglo de equipos que acepta PUT /programmer/:id. Se envían todas
 * las líneas para no borrar por accidente las que no se modificaron y se
 * conservan las aceptaciones de restricciones ya registradas.
 */
export const lineasEquipoAPayload = (lineas = []) =>
  (Array.isArray(lineas) ? lineas : []).map((item) => {
    const inventarioId = idLinea(item);

    return {
      equipoId: inventarioId,
      inventarioId,
      equipo: texto(item?.equipo),
      placa: texto(item?.placa),
      categoria: texto(item?.categoria),
      subcategoria: texto(item?.subcategoria),
      descripcion: texto(item?.descripcion),
      imagenActualizadaEn: item?.imagenActualizadaEn ?? null,
      restricciones: restriccionesDe(item),
      restriccionesAceptadasPor: texto(item?.restriccionesAceptadasPor),
      restriccionesAceptadasPorId: texto(item?.restriccionesAceptadasPorId),
      restriccionesAceptadasEl: item?.restriccionesAceptadasEl ?? null,
      cantidad: 1,
      notas: texto(item?.notas),
    };
  });
