import PropTypes from "prop-types";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiFileText,
  FiMapPin,
  FiRefreshCw,
  FiTrash2,
  FiUser,
  FiUserPlus,
  FiUsers,
  FiVideo,
} from "react-icons/fi";

import {
  CLASE_ESTADO,
  CLASE_TIPO_HISTORIAL,
  ETIQUETA_TIPO_HISTORIAL,
  formatearFecha,
  formatearFechaHora,
  ordenarHistorial,
  sumarCantidad,
} from "../Requirements/requirementsView";
import { imagenEquipoPorId } from "../../api/equipment";
import {
  checklistPlanner,
  formatearDuracion,
} from "./programmerView";
import "../Requirements/RequirementsContent.css";
import "./ProgrammerContent.css";

const badgeEstado = (estado) => (
  <span className={`requirements-badge ${CLASE_ESTADO[estado] ?? ""}`}>
    {estado}
  </span>
);

const badgePrioridad = (prioridad) => (
  <span
    className={`requirements-priority requirements-priority--${String(
      prioridad
    ).toLowerCase()}`}
  >
    {prioridad}
  </span>
);

/**
 * Ficha del requerimiento activo. Reúne los datos del requerimiento manual y
 * el checklist de los campos que realmente consume ModalPlanner1.
 */
export default function ProgrammerRequirementPanel({
  requerimiento,
  puedeGestionar = false,
  onEditar,
  onEliminar,
  onDecision,
  onAsignarPersonal,
  eliminando = false,
  equiposEstado = [],
  equiposValidando = false,
  equiposError = null,
  aprobacionBloqueada = false,
  puedeCambiarEquipo = false,
  onCambiarEquipo,
  onReintentarEquipos,
}) {
  if (!requerimiento) {
    return (
      <aside className="requirements-history-panel requirements-history-panel--empty programmer-detail-panel">
        <div className="requirements-history__empty">
          <FiFileText aria-hidden="true" />
          <h3>Programador</h3>
          <p>
            Selecciona un programador del listado para ver su detalle y su
            compatibilidad con Programador de Turnos.
          </p>
        </div>
      </aside>
    );
  }

  const checklistBase =
    requerimiento.checklistPlanner ??
    checklistPlanner(requerimiento, { incluirId: true });
  const checklist = [
    ...checklistBase,
    {
      clave: "estado",
      label: "Estado aprobado",
      ok: ["Aprobada", "Agendado"].includes(requerimiento.estado),
    },
  ];
  const historial = ordenarHistorial(requerimiento.historial, "desc");
  const personal = requerimiento.personal ?? [];
  const equipos = requerimiento.equipos ?? [];
  const solicitante = requerimiento.solicitante ?? {};
  const tieneSolicitante = Object.values(solicitante).some(Boolean);
  const puedeEditar = puedeGestionar;
  const puedeAsignar =
    puedeGestionar && Boolean(requerimiento.puedeAsignar);
  const puedeDecidir =
    puedeGestionar && Boolean(requerimiento.puedeDecidir);
  const conflictosEquipos = (Array.isArray(equiposEstado) ? equiposEstado : [])
    .filter((item) => item?.estado && item.estado !== "ok");
  const decisionDeshabilitada =
    equiposValidando || Boolean(equiposError) || aprobacionBloqueada;
  const resumenPersonal =
    requerimiento.personalResumen ?? {
      total: 0,
      asignados: 0,
      pendientes: 0,
      completo: false,
    };

  return (
    <aside
      className="requirements-history-panel programmer-detail-panel"
      aria-label={`Detalle del programador ${requerimiento.nombreVisible}`}
    >
      <header className="programmer-detail__header">
        <span className="requirements-history__eyebrow">
          <FiFileText aria-hidden="true" />
          Programador manual
        </span>

        <div className="requirements-history__title-row">
          <div>
            <h3>{requerimiento.nombreVisible}</h3>
            <span className="requirements-history__code">
              {requerimiento.codigo || "Sin código"} ·{" "}
              {requerimiento.departamento}
            </span>
          </div>
          {["Aprobada", "Agendado"].includes(requerimiento.estado) ? (
            <div className="programmer-agenda-badges">
              <span className="requirements-badge requirements-badge--approved">
                Aprobada
              </span>
              <span
                className={`requirements-badge ${
                  requerimiento.estado === "Agendado"
                    ? "requirements-badge--approved"
                    : "requirements-badge--scheduled-off"
                }`}
              >
                Agendado
              </span>
            </div>
          ) : (
            badgeEstado(requerimiento.estado)
          )}
        </div>

        <div className="programmer-detail__tags">
          <span className="programmer-direct-badge">Programación directa</span>
          {badgePrioridad(requerimiento.prioridad)}
          <span className="requirements-department-tag">
            {requerimiento.departamento}
          </span>
          <span
            className={`programmer-ready ${
              requerimiento.listoPlanner ? "is-ok" : "is-warn"
            }`}
          >
            {requerimiento.listoPlanner ? (
              <FiCheckCircle aria-hidden="true" />
            ) : (
              <FiAlertTriangle aria-hidden="true" />
            )}
            {requerimiento.listoPlanner ? "Listo para programación" : "Revisar"}
          </span>
        </div>

        <div className="programmer-detail__actions">
          <button
            type="button"
            className="requirements-btn requirements-btn--outline requirements-btn--sm"
            onClick={onEditar}
            disabled={!puedeEditar}
            title={
              puedeEditar
                ? "Editar el programador"
                : "Tu rol no permite editar programadores"
            }
          >
            <FiEdit2 aria-hidden="true" />
            Editar
          </button>
        </div>
      </header>

      <div className="programmer-detail__body">
        {requerimiento.estado === "Aprobada" ? (
          <div
            className={`programmer-agenda-notice ${
              resumenPersonal.total === 0 || resumenPersonal.completo
                ? "is-neutral"
                : "is-pending"
            }`}
            role="status"
          >
            {resumenPersonal.total > 0 && !resumenPersonal.completo ? (
              <FiAlertTriangle aria-hidden="true" />
            ) : (
              <FiClock aria-hidden="true" />
            )}
            <div>
              <strong>
                {resumenPersonal.total === 0
                  ? "Aprobado sin personal requerido"
                  : resumenPersonal.completo
                    ? "Personal completo, pendiente de agendar"
                    : "Aún no está agendado"}
              </strong>
              <p>
                {resumenPersonal.total === 0
                  ? "No se solicitaron cupos de personal; el programador permanece en Aprobada."
                  : resumenPersonal.completo
                    ? `Los ${resumenPersonal.total} cupos están cubiertos; el estado se actualizará a Agendado al sincronizar.`
                    : `Faltan ${resumenPersonal.pendientes} de ${resumenPersonal.total} personas por asignar. Al completar todos los cupos pasará a Agendado.`}
              </p>
            </div>
          </div>
        ) : requerimiento.estado === "Agendado" ? (
          <div className="programmer-agenda-notice is-ok" role="status">
            <FiCheckCircle aria-hidden="true" />
            <div>
              <strong>Agendado</strong>
              <p>
                Personal completo ({resumenPersonal.asignados}/
                {resumenPersonal.total}). Ya está disponible para programar
                turnos.
              </p>
            </div>
          </div>
        ) : null}

        <section className="programmer-detail__section programmer-detail__decision">
          <h4>
            <FiCheckCircle aria-hidden="true" />
            Gestión del programador
          </h4>

          {puedeDecidir ? (
            <div className="programmer-decisions">
              {equiposValidando ? (
                <p className="programmer-decision-alert is-info">
                  <FiRefreshCw
                    className="programmer-spin"
                    aria-hidden="true"
                  />
                  Validando la disponibilidad vigente de los equipos…
                </p>
              ) : null}

              {equiposError ? (
                <div className="programmer-decision-alert is-error" role="alert">
                  <FiAlertTriangle aria-hidden="true" />
                  <span>{equiposError}</span>
                  {onReintentarEquipos ? (
                    <button
                      type="button"
                      className="requirements-btn requirements-btn--outline requirements-btn--sm"
                      onClick={onReintentarEquipos}
                    >
                      <FiRefreshCw aria-hidden="true" />
                      Reintentar
                    </button>
                  ) : null}
                </div>
              ) : null}

              {!equiposValidando &&
              !equiposError &&
              conflictosEquipos.length > 0 ? (
                <div className="programmer-decision-alert is-error" role="alert">
                  <FiAlertTriangle aria-hidden="true" />
                  <div>
                    <strong>No puedes aprobar todavía</strong>
                    <p>
                      Estos equipos ya no están disponibles. Reemplázalos por
                      otro equipo disponible para continuar:
                    </p>
                    <ul>
                      {conflictosEquipos.map((item) => (
                        <li key={`${item.indice}-${item.id}`}>
                          <strong>{item.placa}</strong> · {item.motivo}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              <div className="programmer-decision-actions">
                <button
                  type="button"
                  className="requirements-btn requirements-btn--primary programmer-decision-approve"
                  onClick={() => onDecision(requerimiento, "Aprobada")}
                  disabled={decisionDeshabilitada}
                  title={
                    equiposValidando
                      ? "Validando la disponibilidad de los equipos"
                      : equiposError
                        ? "No se pudo validar la disponibilidad de los equipos"
                        : conflictosEquipos.length > 0
                          ? "Reemplaza los equipos marcados en rojo antes de aprobar"
                          : "Aprobar el programador"
                  }
                >
                  <FiCheckCircle aria-hidden="true" />
                  Aprobar
                </button>
                <button
                  type="button"
                  className="requirements-btn requirements-btn--danger-outline"
                  onClick={onEliminar}
                  disabled={eliminando}
                >
                  <FiTrash2 aria-hidden="true" />
                  {eliminando ? "Eliminando…" : "Eliminar"}
                </button>
              </div>
            </div>
          ) : (
            <div className="programmer-decision-summary">
              {badgeEstado(requerimiento.estado)}
              {requerimiento.decididoPor ? (
                <p>
                  por <strong>{requerimiento.decididoPor}</strong>
                  {requerimiento.decididoEn
                    ? ` · ${formatearFechaHora(requerimiento.decididoEn)}`
                    : ""}
                </p>
              ) : null}
              {requerimiento.motivoDecision ? (
                <p className="programmer-decision-motive">
                  Motivo: {requerimiento.motivoDecision}
                </p>
              ) : null}
              {!puedeGestionar ? (
                <p className="requirements-empty-text">
                  Tu rol no permite gestionar programadores.
                </p>
              ) : null}
              {puedeGestionar ? (
                <div className="programmer-decision-actions">
                  <button
                    type="button"
                    className="requirements-btn requirements-btn--danger-outline"
                    onClick={onEliminar}
                    disabled={eliminando}
                  >
                    <FiTrash2 aria-hidden="true" />
                    {eliminando ? "Eliminando…" : "Eliminar"}
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </section>

        <section className="programmer-detail__section programmer-detail__description">
          <h4>
            <FiMapPin aria-hidden="true" />
            Descripción y observaciones
          </h4>
          <p className="programmer-detail__text programmer-detail__text--lead">
            {requerimiento.descripcion || "Sin descripción registrada."}
          </p>
          {requerimiento.observacion ? (
            <p className="programmer-detail__note">
              {requerimiento.observacion}
            </p>
          ) : null}
        </section>

        <section className="programmer-detail__section">
          <h4>
            <FiClock aria-hidden="true" />
            Evento y horario
          </h4>

          <dl className="requirements-data-grid">
            <div>
              <dt>Programa / evento</dt>
              <dd>{requerimiento.programa || "Sin programa"}</dd>
            </div>
            <div>
              <dt>Tipo de evento</dt>
              <dd>{requerimiento.tipoEvento || "Sin definir"}</dd>
            </div>
            <div>
              <dt>Fecha clave</dt>
              <dd>{formatearFecha(requerimiento.fechaClave)}</dd>
            </div>
            <div>
              <dt>Horario</dt>
              <dd>
                {requerimiento.horaInicio || "--:--"} a{" "}
                {requerimiento.horaFin || "--:--"}
                {requerimiento.cruzaMedianoche ? " (+1 día)" : ""}
              </dd>
            </div>
            <div>
              <dt>Duración</dt>
              <dd>{formatearDuracion(requerimiento.minutos)}</dd>
            </div>
            <div>
              <dt>Vigente hasta</dt>
              <dd>{formatearFecha(requerimiento.fechaEnd)}</dd>
            </div>
            <div>
              <dt>Locación</dt>
              <dd>{requerimiento.locacion || "Sin locación"}</dd>
            </div>
            <div>
              <dt>Color</dt>
              <dd>
                <span className="programmer-color-value">
                  <span
                    className="programmer-color-dot"
                    style={{ background: requerimiento.color }}
                    aria-hidden="true"
                  />
                  {requerimiento.color}
                </span>
              </dd>
            </div>
          </dl>
        </section>

        <section className="programmer-detail__section">
          <h4>
            <FiUser aria-hidden="true" />
            Solicitante
          </h4>

          {tieneSolicitante ? (
            <dl className="requirements-data-grid">
              <div>
                <dt>Nombre</dt>
                <dd>{solicitante.nombre || "Sin nombre"}</dd>
              </div>
              <div>
                <dt>Cargo</dt>
                <dd>{solicitante.cargo || "Sin cargo"}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{solicitante.correo || "Sin correo"}</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>{solicitante.telefono || "Sin teléfono"}</dd>
              </div>
            </dl>
          ) : (
            <p className="requirements-empty-text">
              Sin solicitante registrado.
            </p>
          )}
        </section>

        <section className="programmer-detail__section">
          <h4>
            <FiUsers aria-hidden="true" />
            Personal requerido
            <span className="requirements-block__meta">
              {sumarCantidad(personal)} personas
            </span>
          </h4>

          {personal.length > 0 ? (
            <div className="requirements-table-wrap">
              <table className="requirements-table">
                <thead>
                  <tr>
                    <th scope="col">Grupo</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Horas</th>
                    <th scope="col">Asignados</th>
                    <th scope="col">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {personal.map((item, indice) => {
                    const asignados = item.asignados ?? [];
                    const nombres = asignados
                      .map((asignado) => asignado.nombre)
                      .filter(Boolean);

                    return (
                      <tr key={`${item.rolId}-${indice}`}>
                        <td>{item.rol || "Rol sin catalogar"}</td>
                        <td>{item.cantidad}</td>
                        <td>{item.horas}</td>
                        <td>
                          <span className="programmer-assigned-count">
                            {asignados.length}/{item.cantidad}
                          </span>
                          {nombres.length > 0 ? (
                            <span
                              className="programmer-assigned-names"
                              title={nombres.join(", ")}
                            >
                              {nombres.join(", ")}
                            </span>
                          ) : null}
                          <button
                            type="button"
                            className="requirements-btn requirements-btn--outline requirements-btn--sm programmer-assign-btn"
                            onClick={() => onAsignarPersonal(item)}
                            disabled={!puedeAsignar}
                            title={
                              puedeAsignar
                                ? "Asignar o gestionar el personal del grupo"
                                : "El programador está rechazado o tu rol no permite asignar"
                            }
                          >
                            <FiUserPlus aria-hidden="true" />
                            {asignados.length > 0 ? "Gestionar" : "Asignar"}
                          </button>
                        </td>
                        <td>{item.notas || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="requirements-empty-text">
              Sin personal requerido.
            </p>
          )}
        </section>

        <section className="programmer-detail__section">
          <h4>
            <FiVideo aria-hidden="true" />
            Equipos requeridos
            <span className="requirements-block__meta">
              {sumarCantidad(equipos)} equipos
            </span>
          </h4>

          {equipos.length > 0 ? (
            <>
              {conflictosEquipos.length > 0 &&
              !equiposValidando &&
              !equiposError ? (
                <p className="programmer-equipment-alert" role="alert">
                  <FiAlertTriangle aria-hidden="true" />
                  {conflictosEquipos.length} equipo
                  {conflictosEquipos.length === 1 ? "" : "s"} requiere
                  {conflictosEquipos.length === 1 ? "" : "n"} reemplazo antes
                  de aprobar. Están marcados en rojo.
                </p>
              ) : null}

              <div className="programmer-equipment-list">
                {equipos.map((item, indice) => {
                  const imagen = imagenEquipoPorId(
                    item.inventarioId || item.equipoId,
                    item.imagenActualizadaEn
                  );
                  const estadoEquipo = puedeDecidir
                    ? equiposEstado[indice]
                    : null;
                  const validandoEquipo =
                    puedeDecidir && equiposValidando;
                  const noDisponible =
                    !validandoEquipo &&
                    !equiposError &&
                    Boolean(estadoEquipo && estadoEquipo.estado !== "ok");

                  return (
                    <article
                      key={`${item.equipoId}-${indice}`}
                      className={`programmer-equipment-item ${
                        noDisponible ? "is-unavailable" : ""
                      } ${validandoEquipo ? "is-checking" : ""}`}
                    >
                      <div className="programmer-equipment-item__media">
                        {imagen ? (
                          <a
                            href={imagenEquipoPorId(
                              item.inventarioId || item.equipoId,
                              item.imagenActualizadaEn,
                              "full"
                            )}
                            target="_blank"
                            rel="noreferrer"
                            title="Ver imagen del equipo"
                          >
                            <img
                              src={imagen}
                              alt={item.placa || item.equipo}
                              className="programmer-equipment-thumb"
                              loading="lazy"
                            />
                          </a>
                        ) : (
                          <span
                            className="programmer-equipment-item__placeholder"
                            aria-hidden="true"
                          >
                            📷
                          </span>
                        )}
                      </div>

                      <div className="programmer-equipment-item__body">
                        <div className="programmer-equipment-item__top">
                          <strong>{item.placa || item.equipo}</strong>

                          {validandoEquipo ? (
                            <span className="programmer-equipment-item__badge is-checking">
                              Validando…
                            </span>
                          ) : noDisponible ? (
                            <span className="programmer-equipment-item__badge is-danger">
                              No disponible
                            </span>
                          ) : puedeDecidir && equiposError ? (
                            <span className="programmer-equipment-item__badge is-checking">
                              Sin validar
                            </span>
                          ) : estadoEquipo?.disponible ? (
                            <span className="programmer-equipment-item__badge is-ok">
                              Disponible
                            </span>
                          ) : null}
                        </div>

                        <span className="programmer-equipment-item__meta">
                          {[item.categoria, item.subcategoria]
                            .filter(Boolean)
                            .join(" · ") || "Sin categoría"}
                        </span>

                        {item.descripcion ? (
                          <p className="programmer-equipment-item__description">
                            {item.descripcion}
                          </p>
                        ) : null}

                        {noDisponible ? (
                          <p className="programmer-equipment-item__reason">
                            <FiAlertTriangle aria-hidden="true" />
                            {estadoEquipo?.motivo}
                          </p>
                        ) : null}

                        {Array.isArray(item.restricciones) &&
                        item.restricciones.length > 0 ? (
                          <span className="programmer-restriction-inline">
                            ⚠ {item.restricciones.join(" · ")}
                          </span>
                        ) : null}

                        <span className="programmer-equipment-item__meta">
                          Cantidad: {item.cantidad} · Notas:{" "}
                          {item.notas || "—"}
                        </span>
                      </div>

                      {noDisponible && puedeCambiarEquipo ? (
                        <button
                          type="button"
                          className="requirements-btn requirements-btn--danger-outline requirements-btn--sm programmer-equipment-item__change"
                          onClick={() => onCambiarEquipo?.(item, indice)}
                          title="Buscar otro equipo disponible para esta franja"
                        >
                          <FiRefreshCw aria-hidden="true" />
                          Cambiar equipo
                        </button>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="requirements-empty-text">Sin equipos requeridos.</p>
          )}
        </section>

        <section className="programmer-detail__section">
          <h4>
            <FiCheckCircle aria-hidden="true" />
            Compatibilidad con Programador de Turnos
          </h4>

          <ul className="programmer-checks programmer-checks--panel">
            {checklist.map((item) => (
              <li
                key={item.clave}
                className={item.ok ? "is-ok" : "is-warn"}
              >
                {item.ok ? (
                  <FiCheckCircle aria-hidden="true" />
                ) : (
                  <FiAlertTriangle aria-hidden="true" />
                )}
                {item.label}
                <span>{item.ok ? "OK" : "Pendiente"}</span>
              </li>
            ))}
          </ul>

          <p className="requirements-note">
            Solo los programadores aprobados o agendados aparecen en
            Programador de Turnos.
            El personal requerido es opcional y puede quedar sin asignar.
          </p>
        </section>

        <section className="programmer-detail__section">
          <h4>
            <FiClock aria-hidden="true" />
            Historial
          </h4>

          {historial.length > 0 ? (
            <ol className="requirements-history__list programmer-history__list">
              {historial.map((entrada) => (
                <li
                  key={entrada.id}
                  className={`requirements-history__item ${
                    CLASE_TIPO_HISTORIAL[entrada.tipo] ?? ""
                  }`}
                >
                  <span
                    className="requirements-history__dot"
                    aria-hidden="true"
                  />
                  <div className="requirements-history__content">
                    <div className="requirements-history__top">
                      <strong>
                        {ETIQUETA_TIPO_HISTORIAL[entrada.tipo] ??
                          "Movimiento"}
                      </strong>
                      <time dateTime={entrada.el ?? undefined}>
                        {formatearFechaHora(entrada.el)}
                      </time>
                    </div>
                    <span className="requirements-history__author">
                      {entrada.por}
                    </span>
                    {entrada.estadoNuevo &&
                    entrada.estadoAnterior !== entrada.estadoNuevo ? (
                      <span className="requirements-history__transition">
                        {entrada.estadoAnterior ?? "Nuevo"} →{" "}
                        {entrada.estadoNuevo}
                      </span>
                    ) : null}
                    {entrada.nota ? (
                      <p className="requirements-history__note">
                        “{entrada.nota}”
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="requirements-empty-text">
              Sin movimientos registrados.
            </p>
          )}
        </section>
      </div>
    </aside>
  );
}

ProgrammerRequirementPanel.propTypes = {
  requerimiento: PropTypes.object,
  puedeGestionar: PropTypes.bool,
  onEditar: PropTypes.func.isRequired,
  onEliminar: PropTypes.func.isRequired,
  onDecision: PropTypes.func.isRequired,
  onAsignarPersonal: PropTypes.func.isRequired,
  eliminando: PropTypes.bool,
  equiposEstado: PropTypes.array,
  equiposValidando: PropTypes.bool,
  equiposError: PropTypes.string,
  aprobacionBloqueada: PropTypes.bool,
  puedeCambiarEquipo: PropTypes.bool,
  onCambiarEquipo: PropTypes.func,
  onReintentarEquipos: PropTypes.func,
};
