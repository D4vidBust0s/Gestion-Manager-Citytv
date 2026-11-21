import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiRefreshCw,
  FiSearch,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { useRequirements } from "../../context/RequirementsProvider";
import { obtenerEstadoAusencia } from "../../utils/absenceStatus";
import { construirDias, indexarHorasPorUsuario } from "../../utils/balancer";
import { calcularAlertaContrato } from "../../utils/contractAlert";
import { mismoDia } from "../../utils/plannerStack";
import { proyectarRotacion } from "../../utils/rotationForecast";
import {
  calcularCargaPeriodo,
  filtrarPersonalDeGrupo,
  formatearHora,
  formatearHoraValor,
  formatearHoras,
  hayCruceHorario,
  intervaloEvento,
  normalizarNombre,
  obtenerIdGrupo,
  obtenerIdPersona,
  obtenerNombrePersona,
  obtenerTurnosDelDia,
} from "../../utils/requirementPersonnel";
import { useRequirementPersonnelData } from "./useRequirementPersonnelData";
import "./RequirementPersonnelModal.css";

const formatearFechaCorta = (fecha) => {
  if (!fecha) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
  }).format(fecha);
};

const claseCarga = (porcentaje) => {
  if (porcentaje > 110) return "requirements-load--high";
  if (porcentaje < 80) return "requirements-load--low";
  return "requirements-load--ok";
};

export default function RequirementPersonnelModal({
  solicitud,
  linea,
  onClose,
}) {
  const { asignarPersonalSolicitud } = useRequirements();
  const fechaISO = solicitud?.evento?.fecha ?? "";
  const {
    datos,
    cargando,
    error,
    recargar,
    rolNombre,
    coincidencia,
    grupoInicialId,
  } = useRequirementPersonnelData(fechaISO, linea?.rolId, linea?.rol);

  const [grupoId, setGrupoId] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionados, setSeleccionados] = useState([]);

  const evento = useMemo(() => intervaloEvento(solicitud), [solicitud]);

  useEffect(() => {
    if (!datos.groups.length) return;

    const existe = datos.groups.some(
      (grupo) => String(obtenerIdGrupo(grupo)) === String(grupoId)
    );

    if (existe) return;

    setGrupoId(
      grupoInicialId || String(obtenerIdGrupo(datos.groups[0]))
    );
  }, [datos.groups, grupoId, grupoInicialId]);

  useEffect(() => {
    setSeleccionados([]);
  }, [grupoId]);

  useEffect(() => {
    const alPresionarTecla = (eventoTeclado) => {
      if (eventoTeclado.key === "Escape") onClose();
    };

    window.addEventListener("keydown", alPresionarTecla);
    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, [onClose]);

  const personalGrupo = useMemo(
    () => filtrarPersonalDeGrupo(datos.payroll, grupoId),
    [datos.payroll, grupoId]
  );

  const reglaActual =
    datos.rules.length > 0 ? datos.rules[datos.rules.length - 1] : null;
  const dias = useMemo(
    () => (reglaActual ? construirDias(reglaActual) : []),
    [reglaActual]
  );
  const intensidad = Number(reglaActual?.IntensidadHorariaDiaria) || 8;
  const horasPorUsuarioDia = useMemo(
    () => indexarHorasPorUsuario(datos.shiftsPeriodo, datos.stacks, datos.programs),
    [datos.shiftsPeriodo, datos.stacks, datos.programs]
  );

  const asignados = useMemo(() => linea?.asignados ?? [], [linea]);
  const cantidad = Number(linea?.cantidad) || 0;
  const restantes = Math.max(0, cantidad - asignados.length);

  const filas = useMemo(() => {
    const catalogs = { programs: datos.programs, stacks: datos.stacks };

    return personalGrupo.map((persona) => {
      const id = obtenerIdPersona(persona);
      const ausencia = obtenerEstadoAusencia({
        id,
        fecha: evento.inicio,
        ausencias: datos.ausencias,
      });
      const rotacion = proyectarRotacion({
        persona,
        rotationsManager: datos.rotationsManager,
        rotationsManagerFs: datos.rotationsManagerFs,
        rotations: datos.rotations,
        fecha: evento.inicio,
        grupoId,
      });
      const turnos = obtenerTurnosDelDia({
        turnos: datos.shiftsDia,
        userId: id,
        fecha: evento.inicio,
        ...catalogs,
      });
      const cruce = turnos.find((turno) =>
        hayCruceHorario(evento.inicio, evento.fin, turno.inicio, turno.fin)
      );
      const yaAsignado = asignados.some(
        (asignado) => String(asignado.userId) === String(id)
      );
      const sustitucion = (datos.substitutions ?? []).find(
        (registro) =>
          mismoDia(registro?.Fecha_dia, evento.inicio) &&
          (String(registro?.ID_user_sustituto ?? "") === String(id) ||
            String(registro?.ID_user_main ?? "") === String(id))
      );
      const carga = calcularCargaPeriodo({
        userId: id,
        dias,
        horasPorUsuarioDia,
        intensidad,
      });
      const contrato = calcularAlertaContrato({
        fechaReferencia: evento.inicio,
        fechaIngreso: persona?.fechaIngreso,
        temporal: persona?.temporal,
        diasAlerta: reglaActual?.DiasAlert,
        diasPeriodo: reglaActual?.DiasPeriodo,
      });

      const bloqueos = [];
      if (ausencia) bloqueos.push(`Ausencia: ${ausencia.label}`);
      if (contrato.vencido) {
        bloqueos.push(
          `Contrato vencido desde ${formatearFechaCorta(contrato.finContrato)}`
        );
      }
      if (cruce) {
        bloqueos.push(
          `Cruce con turno ${formatearHora(cruce.inicio)}–${formatearHora(
            cruce.fin
          )}`
        );
      }

      const avisos = [];
      if (!turnos.length) avisos.push("Sin turno ese día");
      else if (!cruce) avisos.push("Tiene otro turno ese día");
      if (rotacion.estado === "sin-rotacion") avisos.push("Sin rotación");
      if (rotacion.estado === "antes") avisos.push("Antes del día clave");
      if (rotacion.esFijo) avisos.push("Turno fijo");
      if (sustitucion) avisos.push("Sustitución registrada");
      if (contrato.activa && !contrato.vencido) {
        avisos.push(`Contrato vence en ${contrato.diasParaFin} días`);
      }

      return {
        id,
        persona,
        nombre: obtenerNombrePersona(persona),
        cargo: persona?.cargo ?? persona?.Cargo ?? "Sin cargo",
        ausencia,
        rotacion,
        turnos,
        cruce,
        yaAsignado,
        contrato,
        carga,
        bloqueos,
        avisos,
        seleccionable: bloqueos.length === 0 && !yaAsignado && restantes > 0,
      };
    });
  }, [
    personalGrupo,
    datos.ausencias,
    datos.rotationsManager,
    datos.rotationsManagerFs,
    datos.rotations,
    datos.shiftsDia,
    datos.programs,
    datos.stacks,
    datos.substitutions,
    evento.inicio,
    evento.fin,
    grupoId,
    asignados,
    dias,
    horasPorUsuarioDia,
    intensidad,
    restantes,
    reglaActual,
  ]);

  const filasFiltradas = useMemo(() => {
    const termino = normalizarNombre(busqueda);
    if (!termino) return filas;

    return filas.filter((fila) =>
      normalizarNombre(`${fila.nombre} ${fila.cargo}`).includes(termino)
    );
  }, [filas, busqueda]);

  const promedioCarga = filas.length
    ? Math.round(
        filas.reduce((total, fila) => total + fila.carga.porcentaje, 0) /
          filas.length
      )
    : 0;

  const grupoSeleccionado = datos.groups.find(
    (grupo) => String(obtenerIdGrupo(grupo)) === String(grupoId)
  );

  const alternarSeleccion = (fila) => {
    if (!fila.seleccionable) return;

    setSeleccionados((previos) => {
      if (previos.includes(fila.id)) {
        return previos.filter((id) => id !== fila.id);
      }

      if (previos.length >= restantes) return previos;
      return [...previos, fila.id];
    });
  };

  const asignar = async () => {
    const personasNuevas = filas
      .filter((fila) => seleccionados.includes(fila.id))
      .map((fila) => ({
        userId: fila.id,
        nombre: fila.nombre,
        cargo: fila.cargo,
        turno: fila.rotacion?.nombreTurno ?? "",
        fijo: Boolean(fila.rotacion?.esFijo),
        fecha: solicitud?.evento?.fecha ?? "",
      }));

    const personas = [
      ...(linea?.asignados ?? []).map((asignado) => ({
        userId: asignado.userId,
        nombre: asignado.nombre,
        cargo: asignado.cargo,
      })),
      ...personasNuevas,
    ];

    const resultado = await asignarPersonalSolicitud(
      solicitud.id,
      linea.rolId,
      personas
    );

    if (!resultado.ok) {
      toast.error(resultado.mensaje);
      return;
    }

    toast.success(resultado.mensaje);
    onClose();
  };

  const periodoTexto =
    dias.length > 0
      ? `${formatearFechaCorta(new Date(dias[0].iso))} – ${formatearFechaCorta(
          new Date(dias[dias.length - 1].iso)
        )}`
      : "Sin periodo configurado";

  return createPortal(
    <div
      className="requirements-modal-overlay requirements-modal-overlay--personnel"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="requirements-modal requirements-modal--personnel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="requirements-personnel-title"
        onClick={(eventoClick) => eventoClick.stopPropagation()}
      >
        <header className="requirements-personnel__header">
          <div>
            <span className="requirements-personnel__eyebrow">
              Personal sugerido · {solicitud.codigo}
            </span>
            <h2 id="requirements-personnel-title">{rolNombre}</h2>
            <p>
              {solicitud.nombre} · {formatearFechaCorta(evento.inicio)}{" "}
              {evento.inicio ? formatearHora(evento.inicio) : ""} -{" "}
              {evento.fin ? formatearHora(evento.fin) : ""}
            </p>
          </div>

          <button
            type="button"
            className="requirements-modal__close"
            onClick={onClose}
            aria-label="Cerrar personal sugerido"
          >
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className="requirements-personnel__toolbar">
          <label className="requirements-filter-field">
            <span>Grupo</span>
            <select
              value={grupoId}
              onChange={(eventoSelect) => setGrupoId(eventoSelect.target.value)}
              aria-label="Seleccionar grupo de personal"
              disabled={!datos.groups.length}
            >
              {datos.groups.map((grupo) => (
                <option key={obtenerIdGrupo(grupo)} value={obtenerIdGrupo(grupo)}>
                  {grupo.nombre}
                </option>
              ))}
            </select>
          </label>

          <div className="requirements-personnel__search requirements-search">
            <FiSearch aria-hidden="true" />
            <input
              type="search"
              value={busqueda}
              onChange={(eventoInput) => setBusqueda(eventoInput.target.value)}
              placeholder="Buscar trabajador o cargo"
              aria-label="Buscar trabajador"
            />
          </div>

          <span className="requirements-personnel__required">
            Requeridos: <strong>{cantidad}</strong> · Asignados:{" "}
            <strong>{asignados.length}</strong>
          </span>
        </div>

        {!cargando && !error && coincidencia.tipo !== "exacta" && !grupoSeleccionado ? (
          <div className="requirements-personnel__notice">
            <FiInfo aria-hidden="true" />
            No se pudo determinar automáticamente el grupo. Selecciona uno para
            ver el personal.
          </div>
        ) : null}

        <div className="requirements-personnel__body">
          {cargando ? (
            <div className="requirements-personnel__state">
              <span className="requirements-personnel__spinner" aria-hidden="true" />
              <p>Cargando personal, rotaciones y balancer…</p>
            </div>
          ) : error ? (
            <div className="requirements-personnel__state requirements-personnel__state--error">
              <FiAlertTriangle aria-hidden="true" />
              <p>{error}</p>
              <button
                type="button"
                className="requirements-btn requirements-btn--outline"
                onClick={recargar}
              >
                <FiRefreshCw aria-hidden="true" />
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <div className="requirements-personnel__summary">
                <article>
                  <span>Periodo evaluado</span>
                  <strong>{periodoTexto}</strong>
                  <small>{dias.length} días</small>
                </article>
                <article>
                  <span>Carga promedio del grupo</span>
                  <strong>{promedioCarga}%</strong>
                  <div className="requirements-load">
                    <div
                      className={`requirements-load__fill ${claseCarga(
                        promedioCarga
                      )}`}
                      style={{ width: `${Math.min(100, promedioCarga)}%` }}
                    />
                  </div>
                </article>
                <article>
                  <span>Personal del grupo</span>
                  <strong>{filas.length}</strong>
                  <small>{grupoSeleccionado?.nombre ?? "Sin grupo"}</small>
                </article>
                <article>
                  <span>Cupo pendiente</span>
                  <strong>{restantes}</strong>
                  <small>de {cantidad} requeridos</small>
                </article>
              </div>

              <div className="requirements-personnel__list">
                <div className="requirements-personnel__head" aria-hidden="true">
                  <span />
                  <span>Trabajador</span>
                  <span>Rotación para la fecha</span>
                  <span>Turno / ausencia</span>
                  <span>Carga del periodo</span>
                  <span>Estado</span>
                </div>

                {filasFiltradas.length === 0 ? (
                  <div className="requirements-personnel__empty">
                    <FiUsers aria-hidden="true" />
                    <p>
                      {personalGrupo.length === 0
                        ? "El grupo no tiene personal activo."
                        : "No hay trabajadores que coincidan con la búsqueda."}
                    </p>
                  </div>
                ) : (
                  filasFiltradas.map((fila) => {
                    const seleccionada = seleccionados.includes(fila.id);
                    const limiteAlcanzado =
                      seleccionados.length >= restantes && !seleccionada;
                    const deshabilitada =
                      (!fila.seleccionable && !seleccionada) || limiteAlcanzado;

                    return (
                      <label
                        key={fila.id}
                        className={`requirements-personnel__row ${
                          seleccionada ? "is-selected" : ""
                        } ${deshabilitada ? "is-blocked" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={seleccionada}
                          onChange={() => alternarSeleccion(fila)}
                          disabled={deshabilitada}
                          aria-label={`Seleccionar a ${fila.nombre}`}
                        />

                        <span className="requirements-personnel__worker">
                          <strong>{fila.nombre}</strong>
                          <small>{fila.cargo}</small>
                          {fila.contrato.vencido ? (
                            <span
                              className="requirements-personnel__contract requirements-personnel__contract--expired"
                              title={`Fin de contrato: ${formatearFechaCorta(
                                fila.contrato.finContrato
                              )}`}
                            >
                              Contrato vencido
                            </span>
                          ) : fila.contrato.activa ? (
                            <span
                              className="requirements-personnel__contract requirements-personnel__contract--warning"
                              title={`Fin de contrato: ${formatearFechaCorta(
                                fila.contrato.finContrato
                              )}`}
                            >
                              Contrato vence en {fila.contrato.diasParaFin} días
                            </span>
                          ) : null}
                        </span>

                        <span
                          className="requirements-personnel__rotation"
                          title={
                            fila.rotacion.estado === "ok"
                              ? `Calculado desde ${formatearFechaCorta(
                                  fila.rotacion.dayKey
                                )} · ${fila.rotacion.semanas} semana${
                                  fila.rotacion.semanas === 1 ? "" : "s"
                                } transcurrida${
                                  fila.rotacion.semanas === 1 ? "" : "s"
                                }`
                              : undefined
                          }
                        >
                          {fila.rotacion.estado === "sin-rotacion" ? (
                            <span className="requirements-personnel__muted">
                              Sin rotación
                            </span>
                          ) : fila.rotacion.estado === "antes" ? (
                            <span className="requirements-personnel__muted">
                              Antes del día clave
                            </span>
                          ) : (
                            <>
                              <strong>{fila.rotacion.nombreTurno}</strong>
                              <small>
                                {formatearHoraValor(fila.rotacion.horaInicio)}
                                {fila.rotacion.horaFin
                                  ? ` - ${formatearHoraValor(
                                      fila.rotacion.horaFin
                                    )}`
                                  : ""}
                                {fila.rotacion.esFijo ? " · Fijo" : ""}
                              </small>
                            </>
                          )}
                        </span>

                        <span className="requirements-personnel__shift">
                          {fila.ausencia ? (
                            <span
                              className="requirements-personnel__absence"
                              style={{
                                background: fila.ausencia.color,
                                color: fila.ausencia.textColor,
                              }}
                            >
                              {fila.ausencia.label}
                            </span>
                          ) : null}

                          {fila.turnos.length > 0 ? (
                            <small>
                              Turno:{" "}
                              {fila.turnos
                                .map(
                                  (turno) =>
                                    `${formatearHora(turno.inicio)}–${formatearHora(
                                      turno.fin
                                    )}`
                                )
                                .join(", ")}
                            </small>
                          ) : (
                            <small className="requirements-personnel__muted">
                              Sin turno ese día
                            </small>
                          )}
                        </span>

                        <span className="requirements-personnel__load">
                          <div className="requirements-load">
                            <div
                              className={`requirements-load__fill ${claseCarga(
                                fila.carga.porcentaje
                              )}`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  fila.carga.porcentaje
                                )}%`,
                              }}
                            />
                          </div>
                          <small title={`${formatearHoras(fila.carga.horas)} de ${formatearHoras(fila.carga.meta)}`}>
                            {fila.carga.porcentaje}% ·{" "}
                            {formatearHoras(fila.carga.horas)}
                          </small>
                        </span>

                        <span className="requirements-personnel__status">
                          {fila.bloqueos.length > 0 ? (
                            <span
                              className="requirements-personnel__blocked"
                              title={fila.bloqueos.join(" · ")}
                            >
                              <FiAlertTriangle aria-hidden="true" />
                              Bloqueado
                            </span>
                          ) : fila.yaAsignado ? (
                            <span className="requirements-personnel__assigned">
                              <FiCheckCircle aria-hidden="true" />
                              Asignado
                            </span>
                          ) : restantes === 0 ? (
                            <span className="requirements-personnel__covered">
                              Cupo cubierto
                            </span>
                          ) : (
                            <span className="requirements-personnel__available">
                              <FiCheckCircle aria-hidden="true" />
                              Disponible
                            </span>
                          )}

                          {fila.avisos.length > 0 ? (
                            <small title={fila.avisos.join(" · ")}>
                              {fila.avisos.length} aviso
                              {fila.avisos.length === 1 ? "" : "s"}
                            </small>
                          ) : null}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        <footer className="requirements-personnel__footer">
          <p>
            {seleccionados.length} seleccionado
            {seleccionados.length === 1 ? "" : "s"} · La asignación se guarda en
            la solicitud y su historial (demostración).
          </p>

          <div className="requirements-personnel__footer-actions">
            <button
              type="button"
              className="requirements-btn requirements-btn--outline"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="requirements-btn requirements-btn--primary"
              onClick={asignar}
              disabled={seleccionados.length === 0 || restantes === 0}
            >
              <FiUsers aria-hidden="true" />
              Asignar seleccionados
            </button>
          </div>
        </footer>
      </section>
    </div>,
    document.body
  );
}

RequirementPersonnelModal.propTypes = {
  solicitud: PropTypes.object.isRequired,
  linea: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};
