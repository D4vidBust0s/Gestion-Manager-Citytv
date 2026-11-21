import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiAlertTriangle,
  FiEye,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShield,
} from "react-icons/fi";

import { equipmentApi, imagenEquipoSrc } from "../../api/equipment";
import { useEquipmentCatalogs } from "../../Custom_Hooks/useEquipmentCatalogs";
import { useRealtimeEvent } from "../../Custom_Hooks/useRealtimeEvent";
import ActivoDetalleModal from "./ActivoDetalleModal";
import {
  claseEstado,
  etiquetaEstado,
  filtrarEquipos,
  progresoEquipo,
  resumenDesdeEquipos,
  restriccionesTexto,
} from "./activosView";
import "./Activos.css";

const TARJETAS = [
  { clave: "total", label: "Total", clase: "total" },
  { clave: "disponibles", label: "Disponibles", clase: "disponible" },
  { clave: "asignados", label: "Asignados", clase: "asignado" },
  { clave: "mantenimiento", label: "Mantenimiento", clase: "mantenimiento" },
  { clave: "protegidos", label: "Protegidos", clase: "protegido" },
  { clave: "baja", label: "De baja", clase: "baja" },
];

export default function ActivosInventario() {
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [equipoAbierto, setEquipoAbierto] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [subcategoriaId, setSubcategoriaId] = useState("");
  const [ubicacionId, setUbicacionId] = useState("");
  const [estado, setEstado] = useState("");
  const [motivoInactivo, setMotivoInactivo] = useState("");

  const {
    categorias,
    subcategorias,
    ubicaciones,
    error: errorCatalogos,
    errorUbicaciones,
    recargar: recargarCatalogos,
  } = useEquipmentCatalogs();

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const data = await equipmentApi.getAll();
      setEquipos(Array.isArray(data) ? data : data?.equipos ?? []);
    } catch (err) {
      setError(err?.message || "No se pudo cargar el inventario");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useRealtimeEvent("equipment:changed", cargar);

  const subcategoriasFiltradas = useMemo(
    () =>
      subcategorias.filter(
        (subcategoria) =>
          !categoriaId ||
          String(subcategoria.categoria?.id ?? subcategoria.categoriaId) ===
            String(categoriaId)
      ),
    [subcategorias, categoriaId]
  );

  const filtros = useMemo(
    () => ({
      q: busqueda,
      categoriaId,
      subcategoriaId,
      ubicacionId,
      estado,
      motivoInactivo,
    }),
    [busqueda, categoriaId, subcategoriaId, ubicacionId, estado, motivoInactivo]
  );

  const visibles = useMemo(
    () => filtrarEquipos(equipos, filtros),
    [equipos, filtros]
  );

  const resumen = useMemo(() => resumenDesdeEquipos(equipos), [equipos]);

  const hayFiltros = Boolean(
    busqueda.trim() ||
      categoriaId ||
      subcategoriaId ||
      ubicacionId ||
      estado ||
      motivoInactivo
  );

  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoriaId("");
    setSubcategoriaId("");
    setUbicacionId("");
    setEstado("");
    setMotivoInactivo("");
  };

  return (
    <div className="activos-page">
      <div className="activos-page__head">
        <div>
          <h2>Inventario de activos</h2>
          <p>
            Consulta completa del inventario de GM Citytv. La ficha es de solo
            lectura: los estados y los mantenimientos se gestionan en GM-Activos.
          </p>
        </div>

        <div className="activos-page__actions">
          <button
            type="button"
            className="activos-btn activos-btn--ghost"
            onClick={cargar}
            disabled={cargando}
          >
            <FiRefreshCw /> Actualizar
          </button>
          <Link to="/activos/nuevo" className="activos-btn">
            <FiPlus /> Nuevo equipo
          </Link>
        </div>
      </div>

      <div className="activos-kpis">
        {TARJETAS.map((tarjeta) => (
          <div
            className={`activos-kpi activos-kpi--${tarjeta.clase}`}
            key={tarjeta.clave}
          >
            <span>{tarjeta.label}</span>
            <strong>{resumen[tarjeta.clave] ?? 0}</strong>
          </div>
        ))}
      </div>

      <div className="activos-toolbar">
        <label className="activos-search">
          <FiSearch aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar por placa, descripción, categoría u observación…"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            aria-label="Buscar activos"
          />
        </label>

        <select
          className="activos-input activos-input--filter"
          value={categoriaId}
          onChange={(evento) => {
            setCategoriaId(evento.target.value);
            setSubcategoriaId("");
          }}
          aria-label="Filtrar por categoría"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((categoria) => (
            <option key={categoria._id ?? categoria.id} value={categoria._id ?? categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>

        <select
          className="activos-input activos-input--filter"
          value={subcategoriaId}
          onChange={(evento) => setSubcategoriaId(evento.target.value)}
          aria-label="Filtrar por subcategoría"
          disabled={subcategoriasFiltradas.length === 0}
        >
          <option value="">
            {subcategoriasFiltradas.length === 0
              ? "Sin subcategorías"
              : "Todas las subcategorías"}
          </option>
          {subcategoriasFiltradas.map((subcategoria) => (
            <option
              key={subcategoria._id ?? subcategoria.id}
              value={subcategoria._id ?? subcategoria.id}
            >
              {subcategoria.nombre}
            </option>
          ))}
        </select>

        <select
          className="activos-input activos-input--filter"
          value={ubicacionId}
          onChange={(evento) => setUbicacionId(evento.target.value)}
          aria-label="Filtrar por ubicación"
        >
          <option value="">Todas las ubicaciones</option>
          {ubicaciones.map((ubicacion) => (
            <option key={ubicacion._id ?? ubicacion.id} value={ubicacion._id ?? ubicacion.id}>
              {ubicacion.nombre}
            </option>
          ))}
        </select>

        <select
          className="activos-input activos-input--filter"
          value={estado}
          onChange={(evento) => {
            setEstado(evento.target.value);
            if (evento.target.value !== "Inactivo") setMotivoInactivo("");
          }}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          <option value="Activo">Activos</option>
          <option value="Inactivo">Inactivos</option>
        </select>

        {estado === "Inactivo" && (
          <select
            className="activos-input activos-input--filter"
            value={motivoInactivo}
            onChange={(evento) => setMotivoInactivo(evento.target.value)}
            aria-label="Filtrar por motivo de inactividad"
          >
            <option value="">Todos los motivos</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Protegido">Protegido</option>
            <option value="Baja">Baja</option>
            <option value="Novedad">Novedad</option>
          </select>
        )}

        {hayFiltros && (
          <button
            type="button"
            className="activos-btn activos-btn--ghost activos-btn--sm"
            onClick={limpiarFiltros}
          >
            Limpiar
          </button>
        )}
      </div>

      {(errorCatalogos || errorUbicaciones) && (
        <div className="activos-alert activos-alert--warn">
          <FiAlertTriangle aria-hidden="true" />
          <span>{errorCatalogos || errorUbicaciones}</span>
          <button
            type="button"
            className="activos-link-btn"
            onClick={recargarCatalogos}
          >
            Reintentar
          </button>
        </div>
      )}

      {error && (
        <div className="activos-alert activos-alert--error">
          <FiAlertTriangle aria-hidden="true" />
          <span>{error}</span>
          <button type="button" className="activos-link-btn" onClick={cargar}>
            Reintentar
          </button>
        </div>
      )}

      <div className="activos-table-wrap">
        <table className="activos-table">
          <thead>
            <tr>
              <th scope="col">Imagen</th>
              <th scope="col">Placa</th>
              <th scope="col">Categoría / Subcategoría</th>
              <th scope="col">Ubicación</th>
              <th scope="col">Descripción</th>
              <th scope="col">Estado</th>
              <th scope="col">Progreso</th>
              <th scope="col">Alertas</th>
              <th scope="col" />
            </tr>
          </thead>
          <tbody>
            {cargando && equipos.length === 0 ? (
              <tr>
                <td colSpan="9" className="activos-empty">
                  Cargando inventario…
                </td>
              </tr>
            ) : visibles.length === 0 ? (
              <tr>
                <td colSpan="9" className="activos-empty">
                  {hayFiltros
                    ? "No hay activos que coincidan con los filtros."
                    : "Aún no hay equipos registrados en el inventario."}
                </td>
              </tr>
            ) : (
              visibles.map((equipo) => {
                const restricciones = restriccionesTexto(equipo);
                const progreso = progresoEquipo(equipo);

                return (
                  <tr
                    key={equipo.id}
                    className={
                      equipo.motivoInactivo === "Baja"
                        ? "activos-row--baja"
                        : ""
                    }
                  >
                    <td>
                      <button
                        type="button"
                        className="activos-thumb"
                        onClick={() => setEquipoAbierto(equipo.id)}
                        title="Ver ficha del equipo"
                        aria-label={`Ver ficha del equipo ${equipo.placa}`}
                      >
                        {equipo.imagen ? (
                          <img
                            src={imagenEquipoSrc(equipo, "thumb")}
                            alt={`Equipo ${equipo.placa}`}
                            loading="lazy"
                          />
                        ) : (
                          <FiShield aria-hidden="true" />
                        )}
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="activos-link-btn activos-link-btn--strong"
                        onClick={() => setEquipoAbierto(equipo.id)}
                      >
                        {equipo.placa}
                      </button>
                    </td>
                    <td>
                      {equipo.categoria?.nombre || "—"}
                      {equipo.subcategoria?.nombre && (
                        <small className="activos-sublabel">
                          {equipo.subcategoria.nombre}
                        </small>
                      )}
                    </td>
                    <td>{equipo.ubicacion?.nombre || "—"}</td>
                    <td className="activos-cell-desc">{equipo.descripcion || "—"}</td>
                    <td>
                      <span className={`activos-status ${claseEstado(equipo)}`}>
                        {equipo.enCustodia
                          ? "Activo / Asignado"
                          : etiquetaEstado(equipo)}
                      </span>
                    </td>
                    <td>
                      {progreso === null ? (
                        <span className="activos-muted">—</span>
                      ) : (
                        <span className="activos-inline-progress">
                          <span style={{ width: `${progreso}%` }} />
                          <small>{progreso}%</small>
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="activos-row-flags">
                        {restricciones.length > 0 && (
                          <span
                            className="activos-flag activos-flag--warn"
                            title={restricciones.join(" · ")}
                          >
                            ⚠ {restricciones.length}
                          </span>
                        )}
                        {(equipo.observaciones?.length ?? 0) > 0 && (
                          <span
                            className="activos-flag"
                            title={`${equipo.observaciones.length} observaciones`}
                          >
                            {equipo.observaciones.length} obs.
                          </span>
                        )}
                        {restricciones.length === 0 &&
                          (equipo.observaciones?.length ?? 0) === 0 && (
                            <span className="activos-muted">—</span>
                          )}
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="activos-btn activos-btn--sm activos-btn--ghost"
                        onClick={() => setEquipoAbierto(equipo.id)}
                      >
                        <FiEye /> Ver
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="activos-footnote">
        {visibles.length} de {equipos.length} activos visibles · Los cambios de
        estado, observaciones y mantenimientos requieren el rol de almacén en
        GM-Activos.
      </p>

      {equipoAbierto && (
        <ActivoDetalleModal
          equipoId={equipoAbierto}
          onClose={() => setEquipoAbierto(null)}
        />
      )}
    </div>
  );
}
