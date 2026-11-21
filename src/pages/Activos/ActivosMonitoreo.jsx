import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiAlertTriangle,
  FiEye,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";

import { equipmentApi, imagenEquipoSrc } from "../../api/equipment";
import { useRealtimeEvent } from "../../Custom_Hooks/useRealtimeEvent";
import ActivoDetalleModal from "./ActivoDetalleModal";
import {
  contadorAnotaciones,
  filtrarSeguimientos,
  formatearFechaHora,
  normalizarProgreso,
} from "./activosView";
import "./Activos.css";

export default function ActivosMonitoreo() {
  const [seguimientos, setSeguimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [equipoAbierto, setEquipoAbierto] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const data = await equipmentApi.getSeguimientos();
      setSeguimientos(
        Array.isArray(data?.seguimientos) ? data.seguimientos : []
      );
    } catch (err) {
      setError(err?.message || "No se pudieron cargar los seguimientos");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useRealtimeEvent("equipment:changed", cargar);

  const visibles = useMemo(
    () => filtrarSeguimientos(seguimientos, busqueda),
    [seguimientos, busqueda]
  );

  return (
    <div className="activos-page">
      <div className="activos-page__head">
        <div>
          <h2>Monitoreo de activos</h2>
          <p>
            Seguimientos abiertos después de un mantenimiento. Consulta las
            anotaciones del almacén; GM Citytv no agrega notas ni cierra
            seguimientos.
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
          <Link
            to="/activos/mantenimientos"
            className="activos-btn activos-btn--ghost"
          >
            <FiActivity /> Mantenimientos
          </Link>
        </div>
      </div>

      <div className="activos-kpis activos-kpis--two">
        <div className="activos-kpi activos-kpi--mantenimiento">
          <span>Seguimientos abiertos</span>
          <strong>{seguimientos.length}</strong>
        </div>
        <div className="activos-kpi activos-kpi--protegido">
          <span>Anotaciones registradas</span>
          <strong>
            {seguimientos.reduce(
              (total, seguimiento) => total + contadorAnotaciones(seguimiento),
              0
            )}
          </strong>
        </div>
      </div>

      <div className="activos-toolbar">
        <label className="activos-search">
          <FiSearch aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar por placa, ubicación o tipo de mantenimiento…"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            aria-label="Buscar seguimientos"
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

      {cargando && seguimientos.length === 0 ? (
        <p className="activos-empty">Cargando seguimientos…</p>
      ) : visibles.length === 0 ? (
        <div className="activos-empty activos-empty--panel">
          <FiActivity aria-hidden="true" />
          <p>
            {busqueda.trim()
              ? "Ningún seguimiento coincide con la búsqueda."
              : "No hay seguimientos abiertos en este momento."}
          </p>
        </div>
      ) : (
        <div className="activos-cards activos-cards--wide">
          {visibles.map((seguimiento) => {
            const anotaciones = Array.isArray(
              seguimiento.seguimiento?.anotaciones
            )
              ? seguimiento.seguimiento.anotaciones
              : [];
            const progreso = normalizarProgreso(seguimiento.progreso);

            return (
              <article
                className="activos-card"
                key={`${seguimiento.equipoId}-${seguimiento.mantenimientoId}`}
              >
                <div className="activos-card__head">
                  {seguimiento.imagen ? (
                    <img
                      src={imagenEquipoSrc(seguimiento, "thumb")}
                      alt={`Equipo ${seguimiento.placa}`}
                      loading="lazy"
                    />
                  ) : (
                    <span className="activos-card__media-empty">
                      <FiActivity aria-hidden="true" />
                    </span>
                  )}

                  <div className="activos-card__identity">
                    <div>
                      <strong>{seguimiento.placa}</strong>
                      <span className="activos-status activos-status--mantenimiento">
                        Seguimiento pendiente
                      </span>
                    </div>
                    <p>{seguimiento.descripcion || "Sin descripción"}</p>
                    <small>
                      {seguimiento.categoria?.nombre || "Sin categoría"}
                      {seguimiento.subcategoria?.nombre
                        ? ` · ${seguimiento.subcategoria.nombre}`
                        : ""}
                      {seguimiento.ubicacion?.nombre
                        ? ` · ${seguimiento.ubicacion.nombre}`
                        : ""}
                    </small>
                  </div>

                  <button
                    type="button"
                    className="activos-btn activos-btn--ghost activos-btn--sm"
                    onClick={() => setEquipoAbierto(seguimiento.equipoId)}
                  >
                    <FiEye /> Ver ficha
                  </button>
                </div>

                <dl className="activos-card__meta">
                  <div>
                    <dt>Mantenimiento</dt>
                    <dd>
                      {seguimiento.tipo || "—"}
                      {seguimiento.mantenimientoDescripcion
                        ? ` · ${seguimiento.mantenimientoDescripcion}`
                        : ""}
                    </dd>
                  </div>
                  <div>
                    <dt>Iniciado por</dt>
                    <dd>{seguimiento.iniciadoPor || "Sin registrar"}</dd>
                  </div>
                  <div>
                    <dt>Inicio del seguimiento</dt>
                    <dd>{formatearFechaHora(seguimiento.inicio)}</dd>
                  </div>
                  <div>
                    <dt>Progreso</dt>
                    <dd>{progreso === null ? "Sin dato" : `${progreso}%`}</dd>
                  </div>
                </dl>

                <div className="activos-card__body">
                  <h4>Anotaciones ({anotaciones.length})</h4>
                  {anotaciones.length === 0 ? (
                    <p className="activos-empty">
                      Sin anotaciones registradas por el almacén.
                    </p>
                  ) : (
                    <ul className="activos-notes">
                      {anotaciones.map((anotacion, indice) => (
                        <li key={anotacion.id || `${anotacion.creadoEn}-${indice}`}>
                          <span className="activos-note-number">{indice + 1}</span>
                          <div>
                            <p>{anotacion.texto}</p>
                            <small>
                              {anotacion.por || "Almacén"} ·{" "}
                              {formatearFechaHora(anotacion.creadoEn)}
                            </small>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {seguimiento.estadoEquipo && (
                    <small className="activos-muted">
                      Estado del equipo: {seguimiento.estadoEquipo}
                    </small>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="activos-footnote">
        Los seguimientos se cierran desde GM-Activos con una nota del almacén.
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
