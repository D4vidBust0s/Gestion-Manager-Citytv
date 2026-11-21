import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FiDownload, FiRefreshCw, FiX } from "react-icons/fi";

import {
  equipmentApi,
  imagenEquipoSrc,
  maintenanceAttachmentSrc,
} from "../../api/equipment";
import {
  claseEstado,
  etiquetaEstado,
  formatearFechaHora,
  formatearRangoReserva,
  normalizarProgreso,
  observacionesTexto,
  ordenarMantenimientos,
  restriccionesTexto,
} from "./activosView";
import "./Activos.css";

const TABS = [
  { id: "resumen", label: "Resumen" },
  { id: "mantenimiento", label: "Mantenimiento" },
  { id: "hoja", label: "Hoja de vida" },
];

const ProgressBar = ({ valor }) => {
  const progreso = normalizarProgreso(valor);
  if (progreso === null) return null;

  return (
    <div
      className="activos-progress"
      role="progressbar"
      aria-valuenow={progreso}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${progreso}%` }} />
      <small>{progreso}%</small>
    </div>
  );
};

ProgressBar.propTypes = {
  valor: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

const AttachmentList = ({ equipoId, mantenimientoId, adjuntos = [] }) => {
  if (!adjuntos.length) return null;

  return (
    <ul className="activos-attachments">
      {adjuntos.map((adjunto) => (
        <li key={adjunto.id}>
          <a
            href={
              maintenanceAttachmentSrc(equipoId, mantenimientoId, adjunto.id) ||
              adjunto.url
            }
            target="_blank"
            rel="noreferrer"
            title={adjunto.nombre}
          >
            <FiDownload aria-hidden="true" />
            {adjunto.nombre || "Evidencia"}
          </a>
          {adjunto.subidoPor && <small>{adjunto.subidoPor}</small>}
        </li>
      ))}
    </ul>
  );
};

AttachmentList.propTypes = {
  equipoId: PropTypes.string,
  mantenimientoId: PropTypes.string,
  adjuntos: PropTypes.array,
};

function ActivoDetalleModal({ equipoId, initialTab = "resumen", onClose }) {
  const [equipo, setEquipo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(initialTab);

  const cargar = useCallback(async () => {
    if (!equipoId) return;
    setCargando(true);
    setError(null);

    try {
      const data = await equipmentApi.getById(equipoId);
      setEquipo(data);
    } catch (err) {
      setError(err?.message || "No se pudo cargar la ficha del equipo");
    } finally {
      setCargando(false);
    }
  }, [equipoId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    const alPresionar = (evento) => {
      if (evento.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [onClose]);

  const mantenimientos = ordenarMantenimientos(equipo?.mantenimientos ?? []);
  const hojaDeVida = Array.isArray(equipo?.hojaDeVida)
    ? equipo.hojaDeVida.slice().reverse()
    : [];

  return (
    <div className="activos-modal-backdrop" onMouseDown={onClose}>
      <div
        className="activos-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Ficha del equipo ${equipo?.placa ?? ""}`}
        onMouseDown={(evento) => evento.stopPropagation()}
      >
        <header className="activos-modal__head">
          <div className="activos-modal__identity">
            {equipo?.imagen ? (
              <a
                className="activos-modal__thumb"
                href={imagenEquipoSrc(equipo, "full")}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={imagenEquipoSrc(equipo, "thumb")}
                  alt={`Equipo ${equipo?.placa}`}
                />
              </a>
            ) : (
              <span className="activos-modal__thumb activos-modal__thumb--empty">
                Sin imagen
              </span>
            )}

            <div>
              <h3>{equipo?.placa || "Cargando equipo…"}</h3>
              <p>{equipo?.descripcion || "—"}</p>
              {equipo && (
                <span className={`activos-status ${claseEstado(equipo)}`}>
                  {etiquetaEstado(equipo)}
                </span>
              )}
            </div>
          </div>

          <div className="activos-modal__actions">
            <button
              type="button"
              className="activos-icon-btn"
              onClick={cargar}
              title="Actualizar ficha"
              aria-label="Actualizar ficha"
            >
              <FiRefreshCw />
            </button>
            <button
              type="button"
              className="activos-icon-btn"
              onClick={onClose}
              title="Cerrar"
              aria-label="Cerrar ficha"
            >
              <FiX />
            </button>
          </div>
        </header>

        <nav className="activos-tabs" aria-label="Secciones de la ficha">
          {TABS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`activos-tab ${
                tab === item.id ? "activos-tab--active" : ""
              }`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="activos-modal__body">
          {cargando && <p className="activos-empty">Cargando ficha…</p>}

          {!cargando && error && (
            <div className="activos-alert activos-alert--error">
              <p>{error}</p>
              <button type="button" className="activos-btn" onClick={cargar}>
                Reintentar
              </button>
            </div>
          )}

          {!cargando && !error && equipo && tab === "resumen" && (
            <div className="activos-detail">
              <section className="activos-detail-grid">
                <div>
                  <span className="activos-detail-label">Categoría</span>
                  <strong>{equipo.categoria?.nombre || "Sin categoría"}</strong>
                </div>
                <div>
                  <span className="activos-detail-label">Subcategoría</span>
                  <strong>
                    {equipo.subcategoria?.nombre || "Sin subcategoría"}
                  </strong>
                </div>
                <div>
                  <span className="activos-detail-label">Ubicación</span>
                  <strong>{equipo.ubicacion?.nombre || "Sin ubicación"}</strong>
                </div>
                <div>
                  <span className="activos-detail-label">Estado</span>
                  <strong>{etiquetaEstado(equipo)}</strong>
                </div>
                <div>
                  <span className="activos-detail-label">Registrado</span>
                  <strong>{formatearFechaHora(equipo.createdAt)}</strong>
                </div>
                <div>
                  <span className="activos-detail-label">Última actualización</span>
                  <strong>{formatearFechaHora(equipo.updatedAt)}</strong>
                </div>
                <div className="activos-detail-grid__wide">
                  <span className="activos-detail-label">Descripción</span>
                  <p>{equipo.descripcion || "Sin descripción registrada."}</p>
                </div>
              </section>

              {restriccionesTexto(equipo).length > 0 && (
                <div className="activos-callout activos-callout--warn">
                  <strong>Restricciones de uso</strong>
                  <ul>
                    {restriccionesTexto(equipo).map((texto) => (
                      <li key={texto}>{texto}</li>
                    ))}
                  </ul>
                </div>
              )}

              <section className="activos-section">
                <h4>Observaciones ({equipo.observaciones?.length ?? 0})</h4>
                {observacionesTexto(equipo).length === 0 ? (
                  <p className="activos-empty">Sin observaciones registradas.</p>
                ) : (
                  <ul className="activos-notes">
                    {equipo.observaciones.map((observacion) => (
                      <li key={observacion.id || observacion.texto}>
                        <p>{observacion.texto}</p>
                        <small>
                          {observacion.por || "Almacén"} ·{" "}
                          {formatearFechaHora(observacion.creadoEn)}
                        </small>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="activos-section">
                <h4>Reservas activas ({equipo.reservasActivas?.length ?? 0})</h4>
                {(equipo.reservasActivas ?? []).length === 0 ? (
                  <p className="activos-empty">Sin reservas activas.</p>
                ) : (
                  <ul className="activos-notes">
                    {equipo.reservasActivas.map((reserva) => (
                      <li key={reserva.id}>
                        <p>
                          <strong>
                            {reserva.origenCodigo || reserva.origenTipo}
                          </strong>
                          {reserva.origenNombre
                            ? ` · ${reserva.origenNombre}`
                            : ""}
                        </p>
                        <small>{formatearRangoReserva(reserva)}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}

          {!cargando && !error && equipo && tab === "mantenimiento" && (
            <div className="activos-detail">
              {mantenimientos.length === 0 ? (
                <p className="activos-empty">
                  Este equipo no tiene mantenimientos registrados.
                </p>
              ) : (
                mantenimientos.map((mantenimiento) => (
                  <article
                    className="activos-maint"
                    key={mantenimiento.id}
                  >
                    <header className="activos-maint__head">
                      <div>
                        <h4>{mantenimiento.tipo || "Mantenimiento"}</h4>
                        <p>{mantenimiento.descripcion || "Sin descripción"}</p>
                      </div>
                      <span
                        className={`activos-chip ${
                          mantenimiento.estado === "En proceso"
                            ? "activos-chip--live"
                            : ""
                        }`}
                      >
                        {mantenimiento.estado || "Sin estado"}
                      </span>
                    </header>

                    <dl className="activos-maint__meta">
                      <div>
                        <dt>Técnico</dt>
                        <dd>{mantenimiento.tecnico || "Sin asignar"}</dd>
                      </div>
                      <div>
                        <dt>Inicio</dt>
                        <dd>{formatearFechaHora(mantenimiento.iniciadoEn)}</dd>
                      </div>
                      <div>
                        <dt>Fin</dt>
                        <dd>
                          {mantenimiento.finalizadoEn
                            ? formatearFechaHora(mantenimiento.finalizadoEn)
                            : "En curso"}
                        </dd>
                      </div>
                      <div>
                        <dt>Progreso</dt>
                        <dd>{mantenimiento.progreso ?? 0}%</dd>
                      </div>
                    </dl>

                    <ProgressBar valor={mantenimiento.progreso} />

                    {mantenimiento.resultado && (
                      <p className="activos-muted">
                        Resultado: <strong>{mantenimiento.resultado}</strong>
                      </p>
                    )}

                    <h5 className="activos-subtitle">
                      Pasos ({mantenimiento.pasos?.length ?? 0})
                    </h5>
                    {(mantenimiento.pasos ?? []).length === 0 ? (
                      <p className="activos-empty">Sin pasos registrados.</p>
                    ) : (
                      <ol className="activos-steps">
                        {mantenimiento.pasos.map((paso) => (
                          <li key={paso.id}>
                            <div>
                              <p>{paso.texto}</p>
                              <small>
                                {paso.por || "Almacén"} ·{" "}
                                {formatearFechaHora(paso.creadoEn)}
                                {paso.avance !== null &&
                                paso.avance !== undefined
                                  ? ` · Avance ${paso.avance}%`
                                  : ""}
                              </small>
                            </div>
                            <AttachmentList
                              equipoId={equipo.id}
                              mantenimientoId={mantenimiento.id}
                              adjuntos={paso.adjuntos ?? []}
                            />
                          </li>
                        ))}
                      </ol>
                    )}

                    {(mantenimiento.adjuntos ?? []).length > 0 && (
                      <>
                        <h5 className="activos-subtitle">Evidencias generales</h5>
                        <AttachmentList
                          equipoId={equipo.id}
                          mantenimientoId={mantenimiento.id}
                          adjuntos={mantenimiento.adjuntos}
                        />
                      </>
                    )}

                    {mantenimiento.seguimiento && (
                      <div className="activos-followup">
                        <div className="activos-followup__head">
                          <strong>
                            Seguimiento ·{" "}
                            {mantenimiento.seguimiento.estado || "Pendiente"}
                          </strong>
                          <small>
                            {formatearFechaHora(
                              mantenimiento.seguimiento.inicio
                            )}
                            {mantenimiento.seguimiento.fin
                              ? ` → ${formatearFechaHora(
                                  mantenimiento.seguimiento.fin
                                )}`
                              : ""}
                          </small>
                        </div>

                        {(mantenimiento.seguimiento.anotaciones ?? []).length >
                        0 ? (
                          <ul className="activos-notes">
                            {mantenimiento.seguimiento.anotaciones.map(
                              (anotacion) => (
                                <li key={anotacion.id || anotacion.creadoEn}>
                                  <p>{anotacion.texto}</p>
                                  <small>
                                    {anotacion.por || "Almacén"} ·{" "}
                                    {formatearFechaHora(anotacion.creadoEn)}
                                  </small>
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="activos-muted">
                            Sin anotaciones de seguimiento.
                          </p>
                        )}

                        {mantenimiento.seguimiento.nota && (
                          <p className="activos-muted">
                            Nota de cierre: {mantenimiento.seguimiento.nota}
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          )}

          {!cargando && !error && equipo && tab === "hoja" && (
            <div className="activos-detail">
              {hojaDeVida.length === 0 ? (
                <p className="activos-empty">Sin movimientos en la hoja de vida.</p>
              ) : (
                <ol className="activos-timeline">
                  {hojaDeVida.map((evento) => (
                    <li key={evento.id || `${evento.el}-${evento.titulo}`}>
                      <span
                        className="activos-timeline__dot"
                        aria-hidden="true"
                      />
                      <div>
                        <strong>{evento.titulo || evento.tipo}</strong>
                        <p>{evento.detalle || "Sin detalle"}</p>
                        {evento.estadoAnterior || evento.estadoNuevo ? (
                          <small>
                            {evento.estadoAnterior || "—"} →{" "}
                            {evento.estadoNuevo || "—"}
                          </small>
                        ) : null}
                        <small>
                          {evento.por || "Sistema"} ·{" "}
                          {formatearFechaHora(evento.el)}
                        </small>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ActivoDetalleModal.propTypes = {
  equipoId: PropTypes.string,
  initialTab: PropTypes.oneOf(["resumen", "mantenimiento", "hoja"]),
  onClose: PropTypes.func,
};

export default ActivoDetalleModal;
