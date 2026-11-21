import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
  FiActivity,
  FiAlertTriangle,
  FiEye,
  FiRefreshCw,
  FiSearch,
  FiTool,
} from "react-icons/fi";

import { equipmentApi, imagenEquipoSrc } from "../../api/equipment";
import { useRealtimeEvent } from "../../Custom_Hooks/useRealtimeEvent";
import ActivoDetalleModal from "./ActivoDetalleModal";
import {
  esEnMantenimiento,
  filtrarEquipos,
  formatearFechaHora,
  normalizarProgreso,
  progresoEquipo,
  promedioProgreso,
} from "./activosView";
import "./Activos.css";

const ProgressBar = ({ valor }) => {
  const progreso = normalizarProgreso(valor);
  if (progreso === null) {
    return <span className="activos-muted">Sin progreso registrado</span>;
  }

  return (
    <div className="activos-progress">
      <span style={{ width: `${progreso}%` }} />
      <small>{progreso}%</small>
    </div>
  );
};

ProgressBar.propTypes = {
  valor: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default function ActivosMantenimientos() {
  const [equipos, setEquipos] = useState([]);
  const [seguimientos, setSeguimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [equipoAbierto, setEquipoAbierto] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const [listaEquipos, dataSeguimientos] = await Promise.all([
        equipmentApi.getAll(),
        equipmentApi.getSeguimientos().catch(() => ({ seguimientos: [] })),
      ]);

      setEquipos(Array.isArray(listaEquipos) ? listaEquipos : []);
      setSeguimientos(
        Array.isArray(dataSeguimientos?.seguimientos)
          ? dataSeguimientos.seguimientos
          : []
      );
    } catch (err) {
      setError(err?.message || "No se pudo cargar el estado de mantenimiento");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useRealtimeEvent("equipment:changed", cargar);

  const enMantenimiento = useMemo(
    () => equipos.filter(esEnMantenimiento),
    [equipos]
  );

  const visibles = useMemo(
    () => filtrarEquipos(enMantenimiento, { q: busqueda }),
    [enMantenimiento, busqueda]
  );

  const progresoPromedio = promedioProgreso(enMantenimiento);
  const placasConSeguimiento = new Set(
    seguimientos.map((seguimiento) => String(seguimiento.equipoId ?? ""))
  );

  return (
    <div className="activos-page">
      <div className="activos-page__head">
        <div>
          <h2>Equipos en mantenimiento</h2>
          <p>
            Estado y avance del proceso técnico. Solo lectura: los pasos, las
            evidencias y el cierre se registran en GM-Activos.
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
          <Link to="/activos/monitoreo" className="activos-btn activos-btn--ghost">
            <FiActivity /> Monitoreo
          </Link>
        </div>
      </div>

      <div className="activos-kpis activos-kpis--three">
        <div className="activos-kpi activos-kpi--mantenimiento">
          <span>En mantenimiento</span>
          <strong>{enMantenimiento.length}</strong>
        </div>
        <div className="activos-kpi activos-kpi--asignado">
          <span>Progreso promedio</span>
          <strong>{progresoPromedio === null ? "—" : `${progresoPromedio}%`}</strong>
        </div>
        <div className="activos-kpi activos-kpi--protegido">
          <span>Seguimientos pendientes</span>
          <strong>{seguimientos.length}</strong>
        </div>
      </div>

      <div className="activos-toolbar">
        <label className="activos-search">
          <FiSearch aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar por placa, categoría, ubicación o descripción…"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            aria-label="Buscar equipos en mantenimiento"
          />
        </label>
      </div>

      {error && (
        <div className="activos-alert activos-alert--error">
          <FiAlertTriangle aria-hidden="true" />
          <span>{error}</span>
          <button type="button" className="activos-link-btn" onClick={cargar}>
            Reintentar
          </button>
        </div>
      )}

      {cargando && enMantenimiento.length === 0 ? (
        <p className="activos-empty">Cargando mantenimientos…</p>
      ) : visibles.length === 0 ? (
        <div className="activos-empty activos-empty--panel">
          <FiTool aria-hidden="true" />
          <p>
            {busqueda.trim()
              ? "Ningún equipo en mantenimiento coincide con la búsqueda."
              : "No hay equipos en mantenimiento en este momento."}
          </p>
        </div>
      ) : (
        <div className="activos-cards">
          {visibles.map((equipo) => {
            const progreso = progresoEquipo(equipo);
            const tieneSeguimiento = placasConSeguimiento.has(
              String(equipo.id)
            );

            return (
              <article className="activos-card" key={equipo.id}>
                <div className="activos-card__head">
                  {equipo.imagen ? (
                    <img
                      src={imagenEquipoSrc(equipo, "thumb")}
                      alt={`Equipo ${equipo.placa}`}
                      loading="lazy"
                    />
                  ) : (
                    <span className="activos-card__media-empty">
                      <FiTool aria-hidden="true" />
                    </span>
                  )}

                  <div className="activos-card__identity">
                    <div>
                      <strong>{equipo.placa}</strong>
                      <span className="activos-status activos-status--mantenimiento">
                        Mantenimiento
                      </span>
                    </div>
                    <p>{equipo.descripcion || "Sin descripción"}</p>
                    <small>
                      {equipo.categoria?.nombre || "Sin categoría"}
                      {equipo.subcategoria?.nombre
                        ? ` · ${equipo.subcategoria.nombre}`
                        : ""}
                      {equipo.ubicacion?.nombre
                        ? ` · ${equipo.ubicacion.nombre}`
                        : ""}
                    </small>
                  </div>
                </div>

                <div className="activos-card__body">
                  <div className="activos-card__row">
                    <span>Progreso</span>
                    <strong>
                      {progreso === null ? "Sin dato" : `${progreso}%`}
                    </strong>
                  </div>
                  <ProgressBar valor={equipo.progresoMantenimiento} />

                  <div className="activos-card__row">
                    <span>Seguimiento posterior</span>
                    <strong>{tieneSeguimiento ? "Pendiente" : "No registrado"}</strong>
                  </div>

                  <small className="activos-muted">
                    Última actualización: {formatearFechaHora(equipo.updatedAt)}
                  </small>
                </div>

                <div className="activos-card__actions">
                  <button
                    type="button"
                    className="activos-btn activos-btn--ghost activos-btn--sm"
                    onClick={() => setEquipoAbierto(equipo.id)}
                  >
                    <FiEye /> Ver mantenimiento
                  </button>
                  <Link
                    to="/activos/monitoreo"
                    className="activos-btn activos-btn--sm"
                  >
                    <FiActivity /> Monitoreo
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="activos-footnote">
        El progreso lo calcula GM-Activos con el avance del último paso
        registrado. GM Citytv no modifica ni cierra mantenimientos.
      </p>

      {equipoAbierto && (
        <ActivoDetalleModal
          equipoId={equipoAbierto}
          initialTab="mantenimiento"
          onClose={() => setEquipoAbierto(null)}
        />
      )}
    </div>
  );
}
