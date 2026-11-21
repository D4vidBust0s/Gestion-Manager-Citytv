import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  FiAlertTriangle,
  FiRefreshCw,
  FiSearch,
  FiX,
} from "react-icons/fi";

import {
  imagenCategoriaSrc,
  imagenEquipoSrc,
  imagenSubcategoriaSrc,
} from "../../api/equipment";
import {
  categoriasDisponibles,
  filtrarEquipos,
  idEquipo,
  subcategoriasDisponibles,
} from "./equipmentCatalogFilters";
import "./EquipmentCatalogPicker.css";

function Imagen({ src, alt, inicial = "•" }) {
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    setFallo(false);
  }, [src]);

  if (!src || fallo) {
    return (
      <span className="equipment-picker__placeholder" aria-hidden="true">
        {inicial.slice(0, 1).toUpperCase() || "•"}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFallo(true)}
    />
  );
}

Imagen.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  inicial: PropTypes.string,
};

/**
 * Selector visual de equipos disponibles por categoría y subcategoría.
 * Las imágenes de los filtros vienen del catálogo genérico de GM-Activos; la
 * imagen de cada equipo es la que hereda de su subcategoría o categoría.
 */
export default function EquipmentCatalogPicker({
  equipos = [],
  cargando = false,
  error = null,
  franjaLista = false,
  categorias = [],
  subcategorias = [],
  catalogosCargando = false,
  catalogosError = null,
  seleccionActual = null,
  idsOcupados = [],
  onSelect,
  onClose,
  onRecargar,
  onRecargarCatalogos,
}) {
  const equiposDisponibles = useMemo(
    () => (Array.isArray(equipos) ? equipos : []),
    [equipos]
  );
  const idActual = String(
    seleccionActual?.inventarioId ||
      seleccionActual?.equipoId ||
      seleccionActual?.id ||
      ""
  );
  const equipoActual = equiposDisponibles.find(
    (equipo) => idEquipo(equipo) === idActual
  );

  const [categoriaId, setCategoriaId] = useState(
    () => equipoActual?.categoria?.id ?? ""
  );
  const [subcategoriaId, setSubcategoriaId] = useState(
    () => equipoActual?.subcategoria?.id ?? ""
  );
  const [busqueda, setBusqueda] = useState("");

  const categoriasConEquipos = useMemo(
    () => categoriasDisponibles(equiposDisponibles, categorias),
    [equiposDisponibles, categorias]
  );

  const categoriaActiva = categoriasConEquipos.some(
    (categoria) => categoria.id === categoriaId
  )
    ? categoriaId
    : "";

  const subcategoriasConEquipos = useMemo(
    () =>
      subcategoriasDisponibles(
        equiposDisponibles,
        subcategorias,
        categoriaActiva
      ),
    [equiposDisponibles, subcategorias, categoriaActiva]
  );

  const subcategoriaActiva = subcategoriasConEquipos.some(
    (subcategoria) => subcategoria.id === subcategoriaId
  )
    ? subcategoriaId
    : "";

  const equiposFiltrados = useMemo(
    () =>
      filtrarEquipos(equiposDisponibles, {
        categoriaId: categoriaActiva,
        subcategoriaId: subcategoriaActiva,
        busqueda,
      }),
    [equiposDisponibles, categoriaActiva, subcategoriaActiva, busqueda]
  );

  const idsOcupadosSet = useMemo(
    () =>
      new Set(
        (Array.isArray(idsOcupados) ? idsOcupados : []).map((id) =>
          String(id)
        )
      ),
    [idsOcupados]
  );

  const categoriaSeleccionada = categoriasConEquipos.find(
    (categoria) => categoria.id === categoriaActiva
  );

  const hayFiltros = Boolean(categoriaActiva || subcategoriaActiva || busqueda);

  const limpiarFiltros = () => {
    setCategoriaId("");
    setSubcategoriaId("");
    setBusqueda("");
  };

  return (
    <section
      className="equipment-picker"
      role="region"
      aria-label="Selector de equipos disponibles"
    >
      <header className="equipment-picker__head">
        <div>
          <strong>Seleccionar equipo</strong>
          <p>
            Filtra por categoría y subcategoría. Solo aparecen equipos
            disponibles para la fecha y hora del evento.
          </p>
        </div>
        <button
          type="button"
          className="equipment-picker__close"
          onClick={onClose}
          aria-label="Cerrar selector de equipos"
        >
          <FiX aria-hidden="true" />
        </button>
      </header>

      {!franjaLista ? (
        <div className="equipment-picker__empty">
          <strong>Completa la fecha y las horas</strong>
          <span>
            La disponibilidad depende de la franja del evento. Indica fecha,
            hora de inicio y hora de fin para consultar equipos.
          </span>
        </div>
      ) : (
        <>
          {catalogosError && (
            <div className="equipment-picker__alert" role="status">
              <FiAlertTriangle aria-hidden="true" />
              <span>
                No se pudieron cargar las imágenes del catálogo; se usan los
                datos de los equipos disponibles.
              </span>
              {onRecargarCatalogos ? (
                <button
                  type="button"
                  className="equipment-picker__retry"
                  onClick={onRecargarCatalogos}
                >
                  <FiRefreshCw aria-hidden="true" />
                  Reintentar
                </button>
              ) : null}
            </div>
          )}

          {error && (
            <div className="equipment-picker__alert" role="alert">
              <FiAlertTriangle aria-hidden="true" />
              <span>{error}</span>
              {onRecargar ? (
                <button
                  type="button"
                  className="equipment-picker__retry"
                  onClick={onRecargar}
                >
                  <FiRefreshCw aria-hidden="true" />
                  Reintentar
                </button>
              ) : null}
            </div>
          )}

          <div className="equipment-picker__section">
            <div className="equipment-picker__section-head">
              <span>1. Categoría</span>
              <small>
                {catalogosCargando
                  ? "Actualizando catálogos…"
                  : `${categoriasConEquipos.length} categoría(s) con disponibilidad`}
              </small>
            </div>

            <div className="equipment-picker__categories">
              <button
                type="button"
                className={`equipment-picker__category ${
                  !categoriaActiva ? "is-active" : ""
                }`}
                aria-pressed={!categoriaActiva}
                onClick={() => {
                  setCategoriaId("");
                  setSubcategoriaId("");
                }}
              >
                <span
                  className="equipment-picker__category-media equipment-picker__category-media--all"
                  aria-hidden="true"
                >
                  ▦
                </span>
                <span className="equipment-picker__category-copy">
                  <strong>Todas</strong>
                  <small>{equiposDisponibles.length} disponibles</small>
                </span>
              </button>

              {categoriasConEquipos.map((categoria) => {
                const imagen =
                  imagenCategoriaSrc(categoria, "thumb") ||
                  imagenEquipoSrc({ imagen: categoria.imagenEquipo }, "thumb");

                return (
                  <button
                    type="button"
                    key={categoria.id}
                    className={`equipment-picker__category ${
                      categoria.id === categoriaActiva ? "is-active" : ""
                    }`}
                    aria-pressed={categoria.id === categoriaActiva}
                    onClick={() => {
                      setCategoriaId(categoria.id);
                      setSubcategoriaId("");
                    }}
                  >
                    <span className="equipment-picker__category-media">
                      <Imagen
                        src={imagen}
                        alt={`Imagen de ${categoria.nombre}`}
                        inicial={categoria.nombre}
                      />
                    </span>
                    <span className="equipment-picker__category-copy">
                      <strong>{categoria.nombre}</strong>
                      <small>
                        {categoria.cantidad} equipo
                        {categoria.cantidad === 1 ? "" : "s"}
                      </small>
                    </span>
                  </button>
                );
              })}
            </div>

            {categoriasConEquipos.length === 0 && !cargando ? (
              <p className="equipment-picker__hint">
                No hay categorías con equipos disponibles en esta franja.
              </p>
            ) : null}
          </div>

          {categoriaActiva && subcategoriasConEquipos.length > 0 && (
            <div className="equipment-picker__section">
              <div className="equipment-picker__section-head">
                <span>2. Subcategoría</span>
                <small>Opcional para acotar la búsqueda</small>
              </div>

              <div className="equipment-picker__subcategories">
                <button
                  type="button"
                  className={`equipment-picker__chip ${
                    !subcategoriaActiva ? "is-active" : ""
                  }`}
                  aria-pressed={!subcategoriaActiva}
                  onClick={() => setSubcategoriaId("")}
                >
                  <span
                    className="equipment-picker__chip-media equipment-picker__chip-media--all"
                    aria-hidden="true"
                  >
                    ▦
                  </span>
                  <span>Todas</span>
                </button>

                {subcategoriasConEquipos.map((subcategoria) => {
                  const imagen =
                    imagenSubcategoriaSrc(subcategoria, "thumb") ||
                    imagenEquipoSrc(
                      { imagen: subcategoria.imagenEquipo },
                      "thumb"
                    ) ||
                    imagenCategoriaSrc(categoriaSeleccionada, "thumb");

                  return (
                    <button
                      type="button"
                      key={subcategoria.id}
                      className={`equipment-picker__chip ${
                        subcategoria.id === subcategoriaActiva
                          ? "is-active"
                          : ""
                      }`}
                      aria-pressed={subcategoria.id === subcategoriaActiva}
                      onClick={() => setSubcategoriaId(subcategoria.id)}
                    >
                      <span className="equipment-picker__chip-media">
                        <Imagen
                          src={imagen}
                          alt={`Imagen de ${subcategoria.nombre}`}
                          inicial={subcategoria.nombre}
                        />
                      </span>
                      <span>{subcategoria.nombre}</span>
                      <small>{subcategoria.cantidad}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <label className="equipment-picker__search">
            <FiSearch aria-hidden="true" />
            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por placa, descripción o categoría"
              aria-label="Buscar equipo disponible"
            />
          </label>

          <div className="equipment-picker__results-head">
            <strong>Equipos disponibles</strong>
            <span>
              {cargando
                ? "Consultando disponibilidad…"
                : `${equiposFiltrados.length} resultado${
                    equiposFiltrados.length === 1 ? "" : "s"
                  }`}
            </span>
          </div>

          {cargando ? (
            <p className="equipment-picker__hint">
              Cargando equipos disponibles para la franja…
            </p>
          ) : equiposFiltrados.length === 0 ? (
            <div className="equipment-picker__empty">
              <strong>
                {equiposDisponibles.length === 0
                  ? "No hay equipos disponibles"
                  : "Ningún equipo coincide con los filtros"}
              </strong>
              <span>
                {equiposDisponibles.length === 0
                  ? "Todos los equipos están inactivos o reservados para esta fecha y hora."
                  : "Prueba con otra categoría, otra subcategoría o limpia la búsqueda."}
              </span>
              {equiposDisponibles.length > 0 && hayFiltros ? (
                <button
                  type="button"
                  className="equipment-picker__retry"
                  onClick={limpiarFiltros}
                >
                  Limpiar filtros
                </button>
              ) : null}
            </div>
          ) : (
            <div className="equipment-picker__grid">
              {equiposFiltrados.map((equipo) => {
                const id = idEquipo(equipo);
                const ocupado = idsOcupadosSet.has(id);
                const actual = id === idActual;
                const restricciones = (Array.isArray(equipo?.restricciones)
                  ? equipo.restricciones
                  : []
                )
                  .map((restriccion) =>
                    String(restriccion?.texto ?? restriccion ?? "").trim()
                  )
                  .filter(Boolean);
                const imagen = imagenEquipoSrc(equipo, "thumb");

                return (
                  <button
                    type="button"
                    key={id}
                    className={`equipment-picker__equipment ${
                      actual ? "is-current" : ""
                    } ${ocupado ? "is-occupied" : ""}`}
                    disabled={ocupado}
                    onClick={() => onSelect(equipo)}
                    title={
                      ocupado
                        ? "Esta placa ya está agregada en otra línea"
                        : `Seleccionar ${equipo.placa}`
                    }
                  >
                    <span className="equipment-picker__equipment-media">
                      <Imagen
                        src={imagen}
                        alt={`Imagen de ${equipo.placa || "equipo"}`}
                        inicial={equipo.placa || "E"}
                      />
                    </span>

                    <span className="equipment-picker__equipment-copy">
                      <span className="equipment-picker__equipment-top">
                        <strong>{equipo.placa || "Sin placa"}</strong>
                        {actual ? (
                          <span className="equipment-picker__badge equipment-picker__badge--current">
                            Actual
                          </span>
                        ) : ocupado ? (
                          <span className="equipment-picker__badge">
                            Ya agregado
                          </span>
                        ) : (
                          <span className="equipment-picker__badge equipment-picker__badge--ok">
                            Disponible
                          </span>
                        )}
                      </span>

                      <span className="equipment-picker__equipment-category">
                        {equipo.categoria?.nombre || "Sin categoría"}
                        {equipo.subcategoria?.nombre
                          ? ` · ${equipo.subcategoria.nombre}`
                          : ""}
                      </span>

                      <span className="equipment-picker__equipment-desc">
                        {equipo.descripcion || "Sin descripción"}
                      </span>

                      {restricciones.length > 0 ? (
                        <span className="equipment-picker__restriction">
                          <FiAlertTriangle aria-hidden="true" />
                          <span className="equipment-picker__restriction-texts">
                            {restricciones.map((texto) => (
                              <span
                                key={texto}
                                className="equipment-picker__restriction-item"
                              >
                                {texto}
                              </span>
                            ))}
                          </span>
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}

EquipmentCatalogPicker.propTypes = {
  equipos: PropTypes.array,
  cargando: PropTypes.bool,
  error: PropTypes.string,
  franjaLista: PropTypes.bool,
  categorias: PropTypes.array,
  subcategorias: PropTypes.array,
  catalogosCargando: PropTypes.bool,
  catalogosError: PropTypes.string,
  seleccionActual: PropTypes.object,
  idsOcupados: PropTypes.array,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onRecargar: PropTypes.func,
  onRecargarCatalogos: PropTypes.func,
};
