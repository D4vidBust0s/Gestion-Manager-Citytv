import PropTypes from "prop-types";
import { FiClock, FiEye } from "react-icons/fi";

import {
  CLASE_ESTADO,
  CLASE_TIPO_HISTORIAL,
  ETIQUETA_TIPO_HISTORIAL,
  formatearFechaHora,
  ordenarHistorial,
} from "./requirementsView";
import "./RequirementsContent.css";

/**
 * Panel de historial del requerimiento activo. Vive en la ventana principal,
 * al lado de las tarjetas, y se actualiza cuando el administrador decide.
 */
export default function RequirementHistoryPanel({
  solicitud,
  departamentoNombre,
  onVerDetalle,
}) {
  if (!solicitud) {
    return (
      <aside className="requirements-history-panel requirements-history-panel--empty">
        <div className="requirements-history__empty">
          <FiClock aria-hidden="true" />
          <h3>Historial</h3>
          <p>Selecciona una tarjeta para ver los movimientos del requerimiento.</p>
        </div>
      </aside>
    );
  }

  const historial = ordenarHistorial(solicitud.historial, "desc");
  const movimientos = historial.length;

  return (
    <aside
      className="requirements-history-panel"
      aria-label={`Historial del requerimiento ${solicitud.nombre}`}
    >
      <header className="requirements-history__header">
        <span className="requirements-history__eyebrow">
          <FiClock aria-hidden="true" />
          Historial
        </span>

        <div className="requirements-history__title-row">
          <div>
            <h3>{solicitud.nombre}</h3>
            <span className="requirements-history__code">
              {solicitud.codigo} · {departamentoNombre}
            </span>
          </div>
          <span className={`requirements-badge ${CLASE_ESTADO[solicitud.estado] ?? ""}`}>
            {solicitud.estado}
          </span>
        </div>

        <div className="requirements-history__actions">
          <span>
            {movimientos} {movimientos === 1 ? "movimiento" : "movimientos"}
          </span>
          <button
            type="button"
            className="requirements-btn requirements-btn--outline requirements-btn--sm"
            onClick={onVerDetalle}
          >
            <FiEye aria-hidden="true" />
            Ver detalle
          </button>
        </div>
      </header>

      <div className="requirements-history__body">
        {movimientos === 0 ? (
          <p className="requirements-empty-text">Sin movimientos registrados.</p>
        ) : (
          <ol className="requirements-history__list">
            {historial.map((entrada) => (
              <li
                key={entrada.id}
                className={`requirements-history__item ${
                  CLASE_TIPO_HISTORIAL[entrada.tipo] ?? ""
                }`}
              >
                <span className="requirements-history__dot" aria-hidden="true" />
                <div className="requirements-history__content">
                  <div className="requirements-history__top">
                    <strong>
                      {ETIQUETA_TIPO_HISTORIAL[entrada.tipo] ?? "Movimiento"}
                    </strong>
                    <time dateTime={entrada.el}>
                      {formatearFechaHora(entrada.el)}
                    </time>
                  </div>

                  <span className="requirements-history__author">{entrada.por}</span>

                  {entrada.estadoNuevo &&
                  entrada.estadoAnterior !== entrada.estadoNuevo ? (
                    <span className="requirements-history__transition">
                      {entrada.estadoAnterior ?? "Nuevo"} → {entrada.estadoNuevo}
                    </span>
                  ) : null}

                  {entrada.nota ? (
                    <p className="requirements-history__note">“{entrada.nota}”</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}

RequirementHistoryPanel.propTypes = {
  solicitud: PropTypes.object,
  departamentoNombre: PropTypes.string,
  onVerDetalle: PropTypes.func.isRequired,
};
