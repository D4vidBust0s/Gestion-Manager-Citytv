import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
  FiSearch,
  FiUserPlus,
  FiX,
} from "react-icons/fi";

import { programmerApi } from "../../api/programmer";
import { payrollApi } from "../../api/payroll";
import { shiftsApi } from "../../api/shifts";
import { programsApi } from "../../api/programs";
import { stacksApi } from "../../api/stacks";
import { permissionsApi } from "../../api/permissions";
import { incapacityApi } from "../../api/incapacity";
import { recessApi } from "../../api/recess";
import { licensesApi } from "../../api/licenses";
import { breaksApi } from "../../api/breaks";
import { compensatoriesApi } from "../../api/compensatories";
import { rotationsApi } from "../../api/rotations";
import {
  rotationsManagerApi,
  rotationsManagerFsApi,
} from "../../api/rotationsManager";
import { isCanceled } from "../../api/client";
import { obtenerEstadoAusencia } from "../../utils/absenceStatus";
import { isoInicioDiaLocal } from "../../utils/plannerCoverage";
import { proyectarRotacion } from "../../utils/rotationForecast";
import {
  crearFechaHora,
  filtrarPersonalDeGrupo,
  formatearHora,
  formatearHoraValor,
  hayCruceHorario,
  obtenerIdPersona,
  obtenerNombrePersona,
  obtenerTurnosDelDia,
} from "../../utils/requirementPersonnel";
import { parseFechaLocal, normalizarRequerimiento } from "./programmerView";
import "../Requirements/RequirementsContent.css";
import "../Requirements/RequirementPersonnelModal.css";
import "./ProgrammerContent.css";

const listaSegura = (valor) => (Array.isArray(valor) ? valor : []);

const intervaloRequerimiento = (requerimiento) => {
  const inicio = crearFechaHora(
    requerimiento?.fechaClave,
    requerimiento?.horaInicio
  );
  const finBase = crearFechaHora(
    requerimiento?.fechaClave,
    requerimiento?.horaFin
  );

  if (!inicio || !finBase) return { inicio: null, fin: null };

  const fin = new Date(finBase);
  if (fin.getTime() <= inicio.getTime()) {
    fin.setDate(fin.getDate() + 1);
  }

  return { inicio, fin };
};

/**
 * Asignación real de trabajadores a un grupo requerido.
 *
 * Muestra el personal activo del grupo y bloquea a quien tenga ausencia,
 * turno cruzado o una asignación simultánea en otro requerimiento.
 */
export default function ProgrammerPersonnelModal({
  requerimiento,
  linea,
  onClose,
  onAsignado,
}) {
  const [datos, setDatos] = useState({
    personas: [],
    turnos: [],
    programs: [],
    stacks: [],
    rotations: [],
    rotationsManager: [],
    rotationsManagerFs: [],
    ausencias: {
      permissions: [],
      incapacitys: [],
      recess: [],
      licenses: [],
      breaks: [],
      compensatories: [],
    },
    otrosRequerimientos: [],
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [rotacionError, setRotacionError] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [seleccionados, setSeleccionados] = useState([]);
  const [recarga, setRecarga] = useState(0);
  const inicializadoRef = useRef(false);

  const asignadosActuales = useMemo(
    () => linea?.asignados ?? [],
    [linea]
  );  const cupo = Number(linea?.cantidad) || 0;
  const evento = useMemo(
    () => intervaloRequerimiento(requerimiento),
    [requerimiento]
  );

  useEffect(() => {
    const controller = new AbortController();
    let activo = true;

    const cargar = async () => {
      setCargando(true);
      setError(null);
      setRotacionError(false);

      try {
        const fecha = parseFechaLocal(requerimiento?.fechaClave) ?? new Date();
        const daykey = isoInicioDiaLocal(fecha);
        const fechaIso = daykey;

        const rotacionesPromise = Promise.allSettled([
          rotationsApi.getAll({ signal: controller.signal }),
          rotationsManagerApi.getAll({ signal: controller.signal }),
          rotationsManagerFsApi.getAll({ signal: controller.signal }),
        ]).then(([rotations, manager, managerFs]) => ({
          rotations:
            rotations.status === "fulfilled"
              ? listaSegura(rotations.value)
              : [],
          rotationsManager:
            manager.status === "fulfilled" ? listaSegura(manager.value) : [],
          rotationsManagerFs:
            managerFs.status === "fulfilled"
              ? listaSegura(managerFs.value)
              : [],
          error: [rotations, manager, managerFs].some(
            (resultado) => resultado.status === "rejected"
          ),
        }));

        const [
          payroll,
          turnos,
          programs,
          stacks,
          otrosRequerimientos,
          permissions,
          incapacitys,
          recess,
          licenses,
          breaks,
          compensatories,
          rotaciones,
        ] = await Promise.all([
          payrollApi.getAll({ signal: controller.signal }),
          shiftsApi.getDayKey({
            signal: controller.signal,
            params: { daykey },
          }),
          programsApi.getAll({ signal: controller.signal }),
          stacksApi.getAll({ signal: controller.signal }),
          programmerApi.getByDate(fechaIso, { signal: controller.signal }),
          permissionsApi.getAll({ signal: controller.signal }),
          incapacityApi.getAll({ signal: controller.signal }),
          recessApi.getAll({ signal: controller.signal }),
          licensesApi.getAll({ signal: controller.signal }),
          breaksApi.getAll({ signal: controller.signal }),
          compensatoriesApi.getAll({ signal: controller.signal }),
          rotacionesPromise,
        ]);

        if (!activo || controller.signal.aborted) return;

        setRotacionError(rotaciones.error);

        setDatos({
          personas: filtrarPersonalDeGrupo(
            listaSegura(payroll),
            linea?.rolId
          ),
          turnos: listaSegura(turnos),
          programs: listaSegura(programs),
          stacks: listaSegura(stacks),
          rotations: rotaciones.rotations,
          rotationsManager: rotaciones.rotationsManager,
          rotationsManagerFs: rotaciones.rotationsManagerFs,
          ausencias: {
            permissions: listaSegura(permissions),
            incapacitys: listaSegura(incapacitys),
            recess: listaSegura(recess),
            licenses: listaSegura(licenses),
            breaks: listaSegura(breaks),
            compensatories: listaSegura(compensatories),
          },
          otrosRequerimientos: listaSegura(otrosRequerimientos)
            .map(normalizarRequerimiento)
            .filter(
              (otro) =>
                String(otro.id) !== String(requerimiento?.id) &&
                otro.estado !== "Rechazada"
            ),
        });

        if (!inicializadoRef.current) {
          const idsDisponibles = new Set(
            listaSegura(payroll).map((persona) =>
              String(obtenerIdPersona(persona))
            )
          );
          setSeleccionados(
            asignadosActuales
              .map((asignado) => String(asignado.id))
              .filter((id) => idsDisponibles.has(id))
          );
          inicializadoRef.current = true;
        }
      } catch (errorCarga) {
        if (!activo || isCanceled(errorCarga) || controller.signal.aborted) {
          return;
        }
        setError(
          errorCarga?.message ||
            "No se pudo cargar la disponibilidad del personal"
        );
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();

    return () => {
      activo = false;
      controller.abort();
    };
  }, [asignadosActuales, linea?.rolId, recarga, requerimiento]);

  useEffect(() => {
    const alPresionarTecla = (eventoTeclado) => {
      if (eventoTeclado.key === "Escape" && !guardando) onClose();
    };

    window.addEventListener("keydown", alPresionarTecla);
    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, [guardando, onClose]);

  const filas = useMemo(() => {
    const termino = String(busqueda ?? "").trim().toLowerCase();
    const otrasLineas = (requerimiento?.personal ?? []).filter(
      (lineaActual) => String(lineaActual.rolId) !== String(linea?.rolId)
    );

    return datos.personas
      .map((persona) => {
        const id = String(obtenerIdPersona(persona));
        const nombre = obtenerNombrePersona(persona);
        const ausencia = obtenerEstadoAusencia({
          id,
          fecha: evento.inicio,
          ausencias: datos.ausencias,
        });
        const turnos = obtenerTurnosDelDia({
          turnos: datos.turnos,
          userId: id,
          fecha: evento.inicio,
          programs: datos.programs,
          stacks: datos.stacks,
        });
        const rotacion = proyectarRotacion({
          persona,
          rotationsManager: datos.rotationsManager,
          rotationsManagerFs: datos.rotationsManagerFs,
          rotations: datos.rotations,
          fecha: evento.inicio,
          grupoId: linea?.rolId,
        });
        const cruce = turnos.find((turno) =>
          hayCruceHorario(evento.inicio, evento.fin, turno.inicio, turno.fin)
        );

        const otro = (datos.otrosRequerimientos ?? []).find((candidato) => {
          const intervaloOtro = intervaloRequerimiento(candidato);
          if (
            !intervaloOtro.inicio ||
            !hayCruceHorario(
              evento.inicio,
              evento.fin,
              intervaloOtro.inicio,
              intervaloOtro.fin
            )
          ) {
            return false;
          }

          return (candidato.personal ?? []).some((lineaOtro) =>
            (lineaOtro.asignados ?? []).some(
              (asignado) => String(asignado.id) === id
            )
          );
        });

        const otraLinea = otrasLineas.find((lineaActual) =>
          (lineaActual.asignados ?? []).some(
            (asignado) => String(asignado.id) === id
          )
        );

        const bloqueos = [];
        if (ausencia) bloqueos.push(`Ausencia: ${ausencia.label}`);
        if (cruce) {
          bloqueos.push(
            `Turno ${formatearHora(cruce.inicio)}–${formatearHora(cruce.fin)}`
          );
        }
        if (otro) {
          bloqueos.push(`Ya asignado en "${otro.nombreVisible || otro.Nombre}"`);
        }
        if (otraLinea) {
          bloqueos.push(
            `Ya asignado en el grupo "${otraLinea.rol || otraLinea.Rol}" de este programador`
          );
        }

        return {
          id,
          persona,
          nombre,
          cargo: persona?.cargo ?? persona?.Cargo ?? "Sin cargo",
          turnos,
          rotacion,
          ausencia,
          bloqueos,
          seleccionable: bloqueos.length === 0,
        };
      })
      .filter((fila) => {
        if (!termino) return true;
        return `${fila.nombre} ${fila.cargo}`
          .toLowerCase()
          .includes(termino);
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [
    busqueda,
    datos,
    evento.fin,
    evento.inicio,
    linea?.rolId,
    requerimiento?.personal,
  ]);

  const seleccionables = filas.filter((fila) => fila.seleccionable);

  const personasPorId = useMemo(() => {
    const mapa = new Map();
    datos.personas.forEach((persona) => {
      mapa.set(String(obtenerIdPersona(persona)), persona);
    });
    return mapa;
  }, [datos.personas]);

  const alternar = (fila) => {
    if (!fila.seleccionable) return;

    setSeleccionados((previos) => {
      if (previos.includes(fila.id)) {
        return previos.filter((id) => id !== fila.id);
      }

      if (previos.length >= cupo) return previos;
      return [...previos, fila.id];
    });
  };

  const guardar = async () => {
    if (guardando) return;

    const asignados = seleccionados
      .map((id) => {
        const persona = personasPorId.get(id);
        if (!persona) return null;

        return {
          id,
          nombre: obtenerNombrePersona(persona),
          cargo: persona?.cargo ?? persona?.Cargo ?? "Sin cargo",
        };
      })
      .filter(Boolean);

    setGuardando(true);

    try {
      const actualizado = await programmerApi.assignPersonnel(
        requerimiento.id,
        linea.rolId,
        {
          asignados,
          revision: requerimiento.revision,
        }
      );

      toast.success(
        actualizado?.Estado === "Agendado"
          ? "Personal completo: programador agendado"
          : "Personal asignado correctamente"
      );
      onAsignado(actualizado);
      onClose();
    } catch (errorGuardado) {
      toast.error(
        errorGuardado?.message || "No se pudo asignar el personal"
      );
    } finally {
      setGuardando(false);
    }
  };

  return createPortal(
    <div
      className="requirements-modal-overlay requirements-modal-overlay--personnel"
      role="presentation"
      onClick={() => {
        if (!guardando) onClose();
      }}
    >
      <div
        className="requirements-modal requirements-modal--personnel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="programmer-personnel-title"
        onClick={(eventoClick) => eventoClick.stopPropagation()}
      >
        <header className="requirements-personnel__header">
          <div>
            <span className="requirements-personnel__eyebrow">
              Programación directa
            </span>
            <h2 id="programmer-personnel-title">{linea?.rol || "Grupo"}</h2>
            <p>
              {requerimiento?.nombreVisible} ·{" "}
              {requerimiento?.fechaClave
                ? requerimiento.fechaClave
                : "Sin fecha"}{" "}
              · {requerimiento?.horaInicio || "--:--"} a{" "}
              {requerimiento?.horaFin || "--:--"}
            </p>
            <p className="requirements-note programmer-direct-note">
              Al asignar aquí se crea un turno directo para la fecha del
              programador, sin stack.
            </p>
          </div>
          <button
            type="button"
            className="requirements-icon-btn"
            onClick={onClose}
            aria-label="Cerrar asignación de personal"
            disabled={guardando}
          >
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className="requirements-personnel__toolbar">
          <div className="requirements-search requirements-personnel__search">
            <FiSearch aria-hidden="true" />
            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar trabajador"
              aria-label="Buscar trabajador"
            />
          </div>
          <span className="requirements-personnel__required">
            Requeridos: <strong>{cupo}</strong> · Asignados:{" "}
            <strong>{seleccionados.length}</strong>
          </span>
        </div>

        <div className="requirements-personnel__body">
          {cargando ? (
            <div className="requirements-personnel__state">
              <span
                className="requirements-personnel__spinner"
                aria-hidden="true"
              />
              <p>Cargando personal, turnos y ausencias…</p>
            </div>
          ) : error ? (
            <div className="requirements-personnel__state requirements-personnel__state--error">
              <FiAlertTriangle aria-hidden="true" />
              <p>{error}</p>
              <button
                type="button"
                className="requirements-btn requirements-btn--outline"
                onClick={() => setRecarga((actual) => actual + 1)}
              >
                <FiRefreshCw aria-hidden="true" />
                Reintentar
              </button>
            </div>
          ) : filas.length === 0 ? (
            <div className="requirements-personnel__empty">
              <FiUserPlus aria-hidden="true" />
              <p>
                No hay personal activo en este grupo o el rol es de un
                registro anterior. Actualiza el grupo en la edición del
                programador.
              </p>
            </div>
          ) : (
            <>
              <div className="requirements-personnel__summary">
                <article>
                  <span>Personal activo</span>
                  <strong>{filas.length}</strong>
                  <small>en el grupo</small>
                </article>
                <article>
                  <span>Disponibles</span>
                  <strong>{seleccionables.length}</strong>
                  <small>sin bloqueos</small>
                </article>
                <article>
                  <span>Cupo</span>
                  <strong>{cupo}</strong>
                  <small>personas requeridas</small>
                </article>
                <article>
                  <span>Seleccionados</span>
                  <strong>{seleccionados.length}</strong>
                  <small>para asignar</small>
                </article>
              </div>

              <div className="requirements-personnel__list">
                <div className="requirements-personnel__head" aria-hidden="true">
                  <span />
                  <span>Trabajador</span>
                  <span>Turno / rotación</span>
                  <span>Ausencia</span>
                  <span>Disponibilidad</span>
                  <span>Estado</span>
                </div>

                {filas.map((fila) => {
                  const seleccionada = seleccionados.includes(fila.id);
                  const limiteAlcanzado =
                    seleccionados.length >= cupo && !seleccionada;
                  const deshabilitada =
                    !fila.seleccionable || limiteAlcanzado;

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
                        onChange={() => alternar(fila)}
                        disabled={deshabilitada}
                        aria-label={`Seleccionar a ${fila.nombre}`}
                      />

                      <span className="requirements-personnel__worker">
                        <strong>{fila.nombre}</strong>
                        <small>{fila.cargo}</small>
                      </span>

                      <span className="requirements-personnel__shift">
                        {fila.turnos.length > 0 ? (
                          <small>
                            Turno:{" "}
                            {fila.turnos
                              .map(
                                (turno) =>
                                  `${formatearHora(
                                    turno.inicio
                                  )}–${formatearHora(turno.fin)}`
                              )
                              .join(" · ")}
                          </small>
                        ) : null}

                        {fila.rotacion.estado === "ok" ? (
                          <small>
                            Rotación: {fila.rotacion.nombreTurno}
                            {fila.rotacion.horaInicio
                              ? ` · ${formatearHoraValor(
                                  fila.rotacion.horaInicio
                                )}${
                                  fila.rotacion.horaFin
                                    ? `–${formatearHoraValor(
                                        fila.rotacion.horaFin
                                      )}`
                                    : ""
                                }`
                              : ""}
                            {fila.rotacion.esFijo ? " · Fijo" : ""}
                          </small>
                        ) : fila.rotacion.estado === "antes" ? (
                          <small>Antes del día clave</small>
                        ) : fila.turnos.length === 0 ? (
                          <small>
                            {rotacionError
                              ? "Rotación no disponible"
                              : "Sin rotación"}
                          </small>
                        ) : null}
                      </span>

                      <span className="requirements-personnel__status">
                        {fila.ausencia ? (
                          <span className="requirements-personnel__blocked">
                            {fila.ausencia.label}
                          </span>
                        ) : (
                          <span className="requirements-personnel__muted">
                            Sin ausencia
                          </span>
                        )}
                      </span>

                      <span className="requirements-personnel__status">
                        {fila.bloqueos.length > 0 ? (
                          <span className="requirements-personnel__blocked">
                            {fila.bloqueos.join(" · ")}
                          </span>
                        ) : (
                          <span className="requirements-personnel__available">
                            <FiCheckCircle aria-hidden="true" />
                            Disponible
                          </span>
                        )}
                      </span>

                      <span className="requirements-personnel__status">
                        {seleccionada ? (
                          <span className="requirements-personnel__assigned">
                            Seleccionado
                          </span>
                        ) : (
                          <span className="requirements-personnel__covered">
                            —
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <footer className="requirements-personnel__footer">
          <p>
            Los bloqueos por ausencia, turno cruzado o doble asignación no se
            pueden seleccionar.
          </p>
          <div className="requirements-personnel__footer-actions">
            <button
              type="button"
              className="requirements-btn requirements-btn--outline"
              onClick={onClose}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="requirements-btn requirements-btn--primary"
              onClick={guardar}
              disabled={guardando || cargando || Boolean(error)}
            >
              <FiUserPlus aria-hidden="true" />
              {guardando ? "Guardando…" : "Guardar asignación"}
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}

ProgrammerPersonnelModal.propTypes = {
  requerimiento: PropTypes.object.isRequired,
  linea: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onAsignado: PropTypes.func.isRequired,
};
