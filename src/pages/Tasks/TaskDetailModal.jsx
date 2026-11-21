import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { formatearPeso, esImagen } from "../../utils/taskAttachments";
import TaskAttachmentPreview from "./TaskAttachmentPreview";

const formatearFechaHora = (valor) => {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "—";

  return fecha.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Detalle completo de una nota (solo lectura).
 * Se abre con doble clic en el listado de tareas.
 */
export default function TaskDetailModal({ tarea, onClose, onEdit, onDeleteAdjunto }) {
  // Adjunto abierto en la vista previa
  const [preview, setPreview] = useState(null);

  // Cerrar con Escape
  useEffect(() => {
    if (!tarea) return undefined;

    const alPresionar = (evento) => {
      if (evento.key === "Escape") onClose();
    };

    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [tarea, onClose]);

  if (!tarea) return null;

  const adjuntos = Array.isArray(tarea.adjuntos) ? tarea.adjuntos : [];
  const recordatorio =
    tarea.esRecordatorio && Array.isArray(tarea.recordatorioHoras)
      ? tarea.recordatorioHoras.join(" · ")
      : "";

  return (
    <div
      className="tasks-modal-overlay"
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) onClose();
      }}
    >
      <div
        className="tasks-modal-content tasks-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de ${tarea.titulo}`}
      >
        <div className="task-detail-head">
          <h3>{tarea.titulo}</h3>
          <span
            className={`badge-estado ${tarea.completada ? "badge-estado--ok" : "badge-estado--pendiente"}`}
          >
            {tarea.completada ? "Completada" : "Pendiente"}
          </span>
        </div>

        <div className="task-detail-badges">
          <span className={`badge-priority priority-${String(tarea.prioridad || "Media").toLowerCase()}`}>
            {tarea.prioridad || "Media"}
          </span>
          <span className="badge-category">{tarea.categoria || "General"}</span>
          <span className="task-detail-meta">
            Límite: {formatearFechaHora(tarea.fechaVencimiento)}
          </span>
          {tarea.createdAt && (
            <span className="task-detail-meta">
              Creada: {formatearFechaHora(tarea.createdAt)}
            </span>
          )}
        </div>

        {recordatorio && (
          <p className="task-detail-reminder">
            ⏰ Recordatorio: {recordatorio}
            {Array.isArray(tarea.recordatorioDias) && tarea.recordatorioDias.length > 0
              ? ` · días ${tarea.recordatorioDias.join(", ")}`
              : ""}
          </p>
        )}

        <div className="task-detail-block">
          <span className="task-detail-label">Descripción</span>
          <p className="task-detail-descripcion">
            {tarea.descripcion || "Sin descripción."}
          </p>
        </div>

        <div className="task-detail-block">
          <span className="task-detail-label">
            Adjuntos ({adjuntos.length})
          </span>

          {adjuntos.length === 0 ? (
            <p className="task-detail-vacio">Esta nota no tiene adjuntos.</p>
          ) : (
            <div className="adjuntos-grid adjuntos-grid--detalle">
              {adjuntos.map((adjunto, indice) => (
                <div className="adjunto-detalle" key={`${adjunto.nombre}-${indice}`}>
                  <button
                    type="button"
                    className="adjunto-preview-btn"
                    onClick={() => setPreview(adjunto)}
                    title={`Ver ${adjunto.nombre}`}
                  >
                    {esImagen(adjunto.tipo) ? (
                      <img
                        src={adjunto.url}
                        alt={adjunto.nombre}
                        className="adjunto-thumb adjunto-thumb--grande"
                      />
                    ) : (
                      <span className="adjunto-icono adjunto-icono--grande" aria-hidden="true">
                        📄
                      </span>
                    )}

                    <span className="adjunto-nombre">{adjunto.nombre}</span>
                    <span className="adjunto-peso">{formatearPeso(adjunto.tamano)}</span>
                    <span className="adjunto-ver">Ver</span>
                  </button>

                  <button
                    type="button"
                    className="adjunto-eliminar"
                    onClick={() => onDeleteAdjunto(tarea, indice)}
                    title="Eliminar adjunto"
                    aria-label={`Eliminar ${adjunto.nombre}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cerrar
          </button>
          <button type="button" className="btn-submit" onClick={() => onEdit(tarea)}>
            ✏️ Editar nota
          </button>
        </div>
      </div>

      {preview && (
        <TaskAttachmentPreview adjunto={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}

TaskDetailModal.propTypes = {
  tarea: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDeleteAdjunto: PropTypes.func.isRequired,
};
