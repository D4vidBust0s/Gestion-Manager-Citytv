import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import {
  FiCalendar,
  FiCheckCircle,
  FiRotateCcw,
  FiUsers,
  FiVideo,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import { useRequirements } from "../../context/RequirementsProvider";
import {
  CLASE_ESTADO,
  formatearFecha,
  formatearFechaHora,
  nombreRol,
  sumarCantidad,
} from "./requirementsView";
import { imagenEquipoPorId } from "../../api/equipment";
import "./RequirementsContent.css";

const ESTADOS_GESTIONABLES = ["Pendiente", "En revisión"];

/**
 * Modal de detalle del requerimiento. Muestra la información completa y las
 * acciones del administrador; el historial vive en el panel principal.
 */
export default function RequirementDetailModal({
  solicitud,
  departamentoNombre,
  onClose,
  onAbrirPersonal,
  bloqueado = false,
}) {
  const {
    aprobarSolicitud,
    denegarSolicitud,
    solicitarRevisionSolicitud,
  } = useRequirements();
  const [nota, setNota] = useState("");

  const evento = solicitud.evento ?? {};
  const puedeGestionar = ESTADOS_GESTIONABLES.includes(solicitud.estado);
  const puedeAsignarPersonal = solicitud.estado !== "Rechazada";
  const estaAprobada = ["Aprobada", "Agendado"].includes(solicitud.estado);

  useEffect(() => {
    if (bloqueado) return undefined;

    const alPresionarTecla = (eventoTeclado) => {
      if (eventoTeclado.key === "Escape") onClose();
    };

    window.addEventListener("keydown", alPresionarTecla);
    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, [onClose, bloqueado]);

  const ejecutarAccion = async (accion) => {
    const texto = nota.trim();
    const esRevision = accion === "revision";
    const esDenegacion = accion === "denegar";

    if (esRevision && !texto) {
      toast.error("Escribe las anotaciones para solicitar la revisión");
      return;
    }

    if (esDenegacion && !texto) {
      toast.error("Escribe el motivo de la denegación");
      return;
    }

    const configuraciones = {
      aprobar: {
        icon: "question",
        title: "¿Aprobar esta solicitud?",
        text: `${solicitud.codigo} · ${solicitud.nombre}`,
        confirmButtonText: "Sí, aprobar",
        confirmButtonColor: "#00094B",
        cancelButtonColor: "#EB464B",
      },
      denegar: {
        icon: "warning",
        title: "¿Denegar esta solicitud?",
        text: texto,
        confirmButtonText: "Sí, denegar",
        confirmButtonColor: "#EB464B",
        cancelButtonColor: "#00094B",
      },
      revision: {
        icon: "warning",
        title: "¿Solicitar revisión al solicitante?",
        text: texto,
        confirmButtonText: "Sí, solicitar revisión",
        confirmButtonColor: "#EB464B",
        cancelButtonColor: "#00094B",
      },
    };

    const resultado = await Swal.fire({
      ...configuraciones[accion],
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      footer: "<h6>Gestión Manager Citytv</h6>",
    });

    if (!resultado.isConfirmed) return;

    const respuesta = await (accion === "aprobar"
      ? aprobarSolicitud(solicitud.id, texto)
      : accion === "denegar"
        ? denegarSolicitud(solicitud.id, texto)
        : solicitarRevisionSolicitud(solicitud.id, texto));

    if (!respuesta.ok) {
      toast.error(respuesta.mensaje);
      return;
    }

    toast.success(respuesta.mensaje);
    onClose();
  };

  const badgeEstado = (estado) => (
    <span className={`requirements-badge ${CLASE_ESTADO[estado] ?? ""}`}>
      {estado}
    </span>
  );

  return createPortal(
    <div
      className="requirements-modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="requirements-modal requirements-modal--detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="requirements-detail-title"
        onClick={(eventoClick) => eventoClick.stopPropagation()}
      >
        <header className="requirements-modal__header requirements-modal__header--detail">
          <div className="requirements-modal__heading">
            <span className="requirements-modal__eyebrow">
              Requerimiento · {solicitud.codigo}
            </span>
            <h2 id="requirements-detail-title">{solicitud.nombre}</h2>
            <p>
              {formatearFecha(evento.fecha, {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}{" "}
              · {evento.horaInicio} - {evento.horaFin}
            </p>
            <div className="requirements-detail__tags">
              {/* TODO(requirements): replicar los badges Aprobada/Agendado de Programmer. */}
              {badgeEstado(solicitud.estado)}
              <span className="requirements-department-tag">
                {departamentoNombre}
              </span>
              <span
                className={`requirements-priority requirements-priority--${String(
                  solicitud.prioridad
                ).toLowerCase()}`}
              >
                {solicitud.prioridad}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="requirements-modal__close"
            onClick={onClose}
            aria-label="Cerrar detalle del requerimiento"
            autoFocus
          >
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className="requirements-modal__body">
          <section className="requirements-block">
            <h4>
              <FiCalendar aria-hidden="true" />
              Datos del evento
            </h4>
            <dl className="requirements-data-grid">
              <div>
                <dt>Departamento solicitante</dt>
                <dd>{departamentoNombre}</dd>
              </div>
              <div>
                <dt>Programa / evento</dt>
                <dd>{evento.programa || "Sin programa"}</dd>
              </div>
              <div>
                <dt>Tipo de evento</dt>
                <dd>{evento.tipoEvento || "Sin definir"}</dd>
              </div>
              <div>
                <dt>Fecha</dt>
                <dd>
                  {formatearFecha(evento.fecha, {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>
              <div>
                <dt>Horario</dt>
                <dd>
                  {evento.horaInicio} - {evento.horaFin}
                </dd>
              </div>
              <div>
                <dt>Locación</dt>
                <dd>{evento.locacion || "Sin locación"}</dd>
              </div>
              <div>
                <dt>Solicitante</dt>
                <dd>
                  {solicitud.solicitante?.nombre}
                  {solicitud.solicitante?.cargo
                    ? ` · ${solicitud.solicitante.cargo}`
                    : ""}
                </dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{solicitud.solicitante?.correo || "Sin correo"}</dd>
              </div>
              <div className="requirements-data-grid__wide">
                <dt>Descripción</dt>
                <dd>{solicitud.descripcion}</dd>
              </div>
            </dl>
          </section>

          <section className="requirements-block">
            <h4>
              <FiUsers aria-hidden="true" />
              Personal requerido
              <span className="requirements-block__meta">
                {sumarCantidad(solicitud.personal)} personas
              </span>
            </h4>

            {solicitud.personal.length > 0 ? (
              <div className="requirements-table-wrap">
                {estaAprobada ? (
                  <p className="requirements-note requirements-personnel-note">
                    Puedes asignar personal después de aprobar. Al completar
                    todos los cupos, la solicitud pasa a <strong>Agendado</strong>.
                  </p>
                ) : null}
                <table className="requirements-table">
                  <caption className="requirements-sr-only">
                    Personal requerido para {solicitud.nombre}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Rol</th>
                      <th scope="col">Cantidad</th>
                      <th scope="col">Horas</th>
                      <th scope="col">Notas</th>
                      <th scope="col">Asignados</th>
                      <th scope="col">Personal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitud.personal.map((item, indice) => {
                      const asignados = item.asignados ?? [];
                      const nombres = asignados
                        .map((asignado) => asignado.nombre)
                        .filter(Boolean);

                      return (
                        <tr key={`${item.rolId}-${indice}`}>
                          <td>{nombreRol(item.rolId)}</td>
                          <td>{item.cantidad}</td>
                          <td>{item.horas}</td>
                          <td>{item.notas || "—"}</td>
                          <td>
                            <span className="requirements-assigned-count">
                              {asignados.length}/{item.cantidad}
                            </span>
                            {nombres.length > 0 ? (
                              <span
                                className="requirements-assigned-names"
                                title={nombres.join(", ")}
                              >
                                {nombres.join(", ")}
                              </span>
                            ) : null}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="requirements-btn requirements-btn--outline requirements-btn--sm"
                              onClick={() => onAbrirPersonal(item)}
                              disabled={!puedeAsignarPersonal}
                              title={
                                puedeAsignarPersonal
                                  ? "Asignar o gestionar el personal del grupo"
                                  : "La solicitud rechazada no permite asignaciones"
                              }
                            >
                              <FiUsers aria-hidden="true" />
                              {asignados.length > 0
                                ? "Gestionar personal"
                                : "Asignar personal"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="requirements-empty-text">Sin personal solicitado.</p>
            )}
          </section>

          <section className="requirements-block">
            <h4>
              <FiVideo aria-hidden="true" />
              Equipos técnicos
              <span className="requirements-block__meta">
                {sumarCantidad(solicitud.equipos)} equipos
              </span>
            </h4>

            {solicitud.equipos.length > 0 ? (
              <div className="requirements-table-wrap">
                <table className="requirements-table">
                  <caption className="requirements-sr-only">
                    Equipos técnicos requeridos para {solicitud.nombre}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Imagen</th>
                      <th scope="col">Categoría</th>
                      <th scope="col">Equipo / placa</th>
                      <th scope="col">Restricciones</th>
                      <th scope="col">Cantidad</th>
                      <th scope="col">Inventario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitud.equipos.map((item, indice) => {
                      const imagen = imagenEquipoPorId(
                        item.inventarioId || item.equipoId,
                        item.imagenActualizadaEn
                      );

                      return (
                        <tr key={`${item.equipoId}-${indice}`}>
                          <td>
                            {imagen ? (
                              <a
                                href={imagenEquipoPorId(
                                  item.inventarioId || item.equipoId,
                                  item.imagenActualizadaEn,
                                  "full"
                                )}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  src={imagen}
                                  alt={item.placa || item.descripcion || "Equipo"}
                                  className="programmer-equipment-thumb"
                                />
                              </a>
                            ) : (
                              <span aria-hidden="true">📷</span>
                            )}
                          </td>
                          <td>{item.categoria || "Sin categoría"}</td>
                          <td>
                            {item.placa || item.descripcion || "Equipo"}
                            {item.subcategoria && (
                              <span className="requirements-table__note">
                                {item.subcategoria}
                              </span>
                            )}
                            {item.descripcion && item.placa ? (
                              <span className="requirements-table__note">
                                {item.descripcion}
                              </span>
                            ) : null}
                            {item.notas ? (
                              <span className="requirements-table__note">
                                {item.notas}
                              </span>
                            ) : null}
                          </td>
                          <td>
                            {Array.isArray(item.restricciones) &&
                            item.restricciones.length > 0 ? (
                              <span className="programmer-restriction-inline">
                                ⚠ {item.restricciones.join(" · ")}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td>{item.cantidad}</td>
                          <td>
                            <span
                              className="requirements-inventory-tag"
                              title="Se reserva contra el inventario de GM-Activos"
                            >
                              {item.estadoInventario || "Pendiente"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="requirements-empty-text">Sin equipos solicitados.</p>
            )}

            <p className="requirements-note">
              Los equipos se reservan en GM-Activos al aprobar la solicitud. Si
              hay restricciones, debes aceptarlas antes de continuar.
            </p>
          </section>

          <section className="requirements-block requirements-decision">
            <h4>
              <FiCheckCircle aria-hidden="true" />
              Gestión del requerimiento
            </h4>

            {puedeGestionar ? (
              <>
                <label
                  className="requirements-decision__label"
                  htmlFor="requirements-nota-gestion"
                >
                  Anotaciones para el solicitante
                </label>
                <textarea
                  id="requirements-nota-gestion"
                  className="requirements-decision__textarea"
                  rows={3}
                  value={nota}
                  onChange={(eventoTexto) => setNota(eventoTexto.target.value)}
                  placeholder="Ej.: Revisar solicitud para la fecha o alguna otra novedad."
                />
              </>
            ) : (
              <div className="requirements-decision__summary">
                {badgeEstado(solicitud.estado)}
                <p>
                  por <strong>{solicitud.decision?.por ?? "Administrador"}</strong>
                  {" · "}
                  {formatearFechaHora(solicitud.decision?.el)}
                </p>
                {solicitud.decision?.motivo ? (
                  <p className="requirements-decision__motivo">
                    Motivo: {solicitud.decision.motivo}
                  </p>
                ) : null}
              </div>
            )}

            <p className="requirements-note">
              El historial completo del requerimiento se muestra en el panel
              derecho de la ventana principal.
            </p>
          </section>
        </div>

        <footer className="requirements-modal__footer">
          <p className="requirements-modal__footer-text">
            {puedeGestionar
              ? "La decisión y las anotaciones quedarán registradas en el historial del requerimiento."
              : "Solicitud decidida. El historial completo está en el panel principal."}
          </p>

          <div className="requirements-modal__footer-actions">
            {puedeGestionar ? (
              <>
                <button
                  type="button"
                  className="requirements-btn requirements-btn--review-outline"
                  onClick={() => ejecutarAccion("revision")}
                >
                  <FiRotateCcw aria-hidden="true" />
                  Solicitar revisión
                </button>
                <button
                  type="button"
                  className="requirements-btn requirements-btn--danger-outline"
                  onClick={() => ejecutarAccion("denegar")}
                >
                  <FiXCircle aria-hidden="true" />
                  Denegar
                </button>
                <button
                  type="button"
                  className="requirements-btn requirements-btn--primary"
                  onClick={() => ejecutarAccion("aprobar")}
                >
                  <FiCheckCircle aria-hidden="true" />
                  Aprobar
                </button>
              </>
            ) : (
              <button
                type="button"
                className="requirements-btn requirements-btn--outline"
                onClick={onClose}
              >
                Cerrar
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}

RequirementDetailModal.propTypes = {
  solicitud: PropTypes.object.isRequired,
  departamentoNombre: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onAbrirPersonal: PropTypes.func.isRequired,
  bloqueado: PropTypes.bool,
};
