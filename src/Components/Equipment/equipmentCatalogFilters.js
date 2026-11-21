/**
 * Utilidades puras para el selector de equipos por categoría/subcategoría.
 * Se mantienen fuera de React para poder probar los filtros con node:test.
 */

const texto = (valor) => String(valor ?? "").trim();

/** Texto comparable: minúsculas y sin tildes. */
export const normalizarBusqueda = (valor) =>
  texto(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const idCategoriaEquipo = (equipo) =>
  texto(equipo?.categoria?.id ?? equipo?.categoriaId);

export const idSubcategoriaEquipo = (equipo) =>
  texto(equipo?.subcategoria?.id ?? equipo?.subcategoriaId);

export const idEquipo = (equipo) => texto(equipo?.id ?? equipo?._id);

export const idsEquiposSeleccionados = (lineas = []) =>
  new Set(
    (Array.isArray(lineas) ? lineas : [])
      .map((linea) =>
        texto(
          linea?.inventarioId ??
            linea?.equipoId ??
            linea?.inventario?._id ??
            linea?.equipo?._id
        )
      )
      .filter(Boolean)
  );

const ordenarPorNombre = (a, b) =>
  a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });

const ordenarCategorias = (a, b) =>
  a.orden - b.orden || ordenarPorNombre(a, b);

/**
 * Categorías que tienen al menos un equipo disponible en la franja.
 * Si el catálogo falla o llega incompleto, el nombre y la imagen de respaldo
 * salen de los propios equipos disponibles para no dejar el selector vacío.
 */
export const categoriasDisponibles = (equipos = [], categorias = []) => {
  const listaEquipos = Array.isArray(equipos) ? equipos : [];
  const listaCategorias = Array.isArray(categorias) ? categorias : [];

  const catalogo = new Map(
    listaCategorias.map((categoria) => [
      texto(categoria?._id ?? categoria?.id),
      categoria,
    ])
  );

  const agrupadas = new Map();

  listaEquipos.forEach((equipo) => {
    const id = idCategoriaEquipo(equipo);
    if (!id) return;

    const actual = agrupadas.get(id);
    if (actual) {
      actual.cantidad += 1;
      return;
    }

    agrupadas.set(id, {
      id,
      nombre:
        texto(catalogo.get(id)?.nombre) ||
        texto(equipo?.categoria?.nombre) ||
        "Sin categoría",
      descripcion: texto(catalogo.get(id)?.descripcion),
      imagen: catalogo.get(id)?.imagen ?? null,
      imagenEquipo: equipo?.imagen ?? null,
      activo: catalogo.get(id)?.activo !== false,
      orden: Number(catalogo.get(id)?.orden) || 0,
      cantidad: 1,
    });
  });

  return Array.from(agrupadas.values()).sort(ordenarCategorias);
};

/**
 * Subcategorías con equipos disponibles dentro de una categoría.
 * Solo devuelve subcategorías reales: los equipos sin subcategoría no crean
 * una tarjeta vacía.
 */
export const subcategoriasDisponibles = (
  equipos = [],
  subcategorias = [],
  categoriaId = ""
) => {
  const listaEquipos = Array.isArray(equipos) ? equipos : [];
  const listaSubcategorias = Array.isArray(subcategorias)
    ? subcategorias
    : [];
  const categoriaBuscada = texto(categoriaId);

  const catalogo = new Map(
    listaSubcategorias.map((subcategoria) => [
      texto(subcategoria?._id ?? subcategoria?.id),
      subcategoria,
    ])
  );

  const agrupadas = new Map();

  listaEquipos.forEach((equipo) => {
    if (categoriaBuscada && idCategoriaEquipo(equipo) !== categoriaBuscada) {
      return;
    }

    const id = idSubcategoriaEquipo(equipo);
    if (!id) return;

    const actual = agrupadas.get(id);
    if (actual) {
      actual.cantidad += 1;
      return;
    }

    const subcategoria = catalogo.get(id);

    agrupadas.set(id, {
      id,
      nombre:
        texto(subcategoria?.nombre) ||
        texto(equipo?.subcategoria?.nombre) ||
        "Sin subcategoría",
      descripcion: texto(subcategoria?.descripcion),
      imagen: subcategoria?.imagen ?? null,
      imagenEquipo: equipo?.imagen ?? null,
      activo: subcategoria?.activo !== false,
      orden: Number(subcategoria?.orden) || 0,
      cantidad: 1,
    });
  });

  return Array.from(agrupadas.values()).sort(ordenarCategorias);
};

/** Aplica categoría, subcategoría y búsqueda; devuelve una lista ordenada por placa. */
export const filtrarEquipos = (
  equipos = [],
  { categoriaId = "", subcategoriaId = "", busqueda = "" } = {}
) => {
  const categoriaBuscada = texto(categoriaId);
  const subcategoriaBuscada = texto(subcategoriaId);
  const termino = normalizarBusqueda(busqueda);

  return (Array.isArray(equipos) ? equipos : [])
    .filter((equipo) => {
      if (categoriaBuscada && idCategoriaEquipo(equipo) !== categoriaBuscada) {
        return false;
      }

      if (
        subcategoriaBuscada &&
        idSubcategoriaEquipo(equipo) !== subcategoriaBuscada
      ) {
        return false;
      }

      if (!termino) return true;

      return normalizarBusqueda(
        [
          equipo?.placa,
          equipo?.descripcion,
          equipo?.categoria?.nombre,
          equipo?.subcategoria?.nombre,
        ]
          .filter(Boolean)
          .join(" ")
      ).includes(termino);
    })
    .sort((a, b) =>
      texto(a?.placa).localeCompare(texto(b?.placa), "es", { numeric: true })
    );
};

/** Nombre visible de una línea de equipo ya guardada. */
export const nombreEquipoLinea = (linea) =>
  texto(linea?.placa) ||
  texto(linea?.equipo) ||
  texto(linea?.descripcion) ||
  "Equipo seleccionado";

/** Categoría visible de una línea de equipo ya guardada. */
export const categoriaLinea = (linea) =>
  [texto(linea?.categoria), texto(linea?.subcategoria)]
    .filter(Boolean)
    .join(" · ");
