import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import {
  FiAlertTriangle,
  FiCheck,
  FiClock,
  FiRotateCcw,
  FiSave,
  FiX,
} from "react-icons/fi";

import {
  ESTADOS_CONSOLIDACION,
  construirActualizacionTurno,
  estadoTurno,
  formatearDuracion,
  formatearFecha,
  formatearFechaHora,
  formatearHoraCorta,
  horarioEfectivoTurno,
  minutosDeRango,
  minutosProgramadosTurno,
  nombreEvento,
  siguienteIndexPorHora,
  validarSolapamientos,
  validarTurnoParaConsolidar,
} from "../../utils/consolidation";

import "./ModalConsolidate.css";

const conHora = (fechaBase, valorHora) => {
  if (!valorHora || !String(valorHora).includes(":")) return null;

  const [horas, minutos] = String(valorHora).split(":").map(Number);
  if (!Number.isFinite(horas) || !Number.isFinite(minutos)) return null;

  const fecha = new Date(fechaBase ?? new Date());
  fecha.setHours(horas, minutos, 0, 0);
  return fecha;
};

const horaTexto = (fecha) => formatearHoraCorta(fecha) ?? "";

const cruzaMedianoche = (inicio, fin) => {
  if (!inicio || !fin) return false;

  return (
    inicio.getFullYear() !== fin.getFullYear() ||
    inicio.getMonth() !== fin.getMonth() ||
    inicio.getDate() !== fin.getDate()
  );
};

const crearFormulario = (fila, fecha, catalogs) =>
  (Array.isArray(fila?.turnos) ? fila.turnos : []).map((turno, posicion) => {
    const horario = horarioEfectivoTurno(turno, catalogs);
    const tipo = turno.Type ?? "Custom";
    const estado = estadoTurno(turno);

    return {
      id: turno._id,
      turno,
      estado,
      inicio: horario.inicio,
      fin: horario.fin,
      fechaBase: horario.inicio ?? fecha,
      tipo,
      idPrograma: turno.Event_name ?? "",
      eventId: turno.ID_event ?? "------",
      color: turno.Color ?? "red",
      idSchema: turno.Id_Schema ?? "------",
      observacion: turno.Observacion ?? "",
      observacionConsolidacion: turno.ObservacionConsolidacion ?? "",
      index: Number(turno.Index) || posicion + 1,
      editandoEvento: false,
      nombre: nombreEvento(turno, catalogs),
      duracionProgramada: minutosProgramadosTurno(turno, catalogs),
      original: {
        inicio: horario.inicio?.getTime() ?? null,
        fin: horario.fin?.getTime() ?? null,
        tipo,
        idPrograma: turno.Event_name ?? "",
        estado,
      },
    };
  });

const estaSucioHoras = (item) =>
  (item.inicio?.getTime() ?? null) !== item.original.inicio ||
  (item.fin?.getTime() ?? null) !== item.original.fin;

const estaSucioEvento = (item) =>
  item.tipo !== item.original.tipo ||
  item.idPrograma !== item.original.idPrograma;

const estaSucio = (item) => estaSucioHoras(item) || estaSucioEvento(item);

const minutosItem = (item) => {
  if (item.estado === ESTADOS_CONSOLIDACION.NO_LABORADO) return 0;

  if (item.estado === ESTADOS_CONSOLIDACION.VALIDADO && !estaSucio(item)) {
    return item.duracionProgramada;
  }

  if (item.inicio && item.fin) {
    return minutosDeRango(item.inicio, item.fin);
  }

  return item.duracionProgramada;
};

export default function ModalConsolidate({
  abierto = false,
  fila = null,
  fecha = new Date(),
  catalogs = {},
  usuario = {},
  guardando = false,
  onCerrar,
  onGuardar,
}) {
  const [form, setForm] = useState([]);
  const [errores, setErrores] = useState([]);
  const [guardandoLocal, setGuardandoLocal] = useState(false);
  const [confirmarReapertura, setConfirmarReapertura] = useState(false);

  const filaIdRef = useRef(null);
  const guardandoRef = useRef(false);
  const cerrarRef = useRef(null);
  const bodyRef = useRef(null);

  const programs = Array.isArray(catalogs.programs) ? catalogs.programs : [];
  const programmers = Array.isArray(catalogs.programmers)
    ? catalogs.programmers
    : [];

  /* ------------------------------------------------------------
     CICLO DE VIDA DEL MODAL
     ------------------------------------------------------------ */

  useEffect(() => {
    if (!abierto || !fila) {
      filaIdRef.current = null;
      return;
    }

    // Solo se reconstruye al abrir o cambiar de trabajador: un refresco de
    // datos no debe borrar los ajustes que el administrador está editando.
    if (filaIdRef.current === fila.id) return;

    filaIdRef.current = fila.id;
    setForm(crearFormulario(fila, fecha, catalogs));
    setErrores([]);
    setConfirmarReapertura(false);
  }, [abierto, fila, fecha, catalogs]);

  useEffect(() => {
    if (!abierto) return undefined;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (cerrarRef.current) cerrarRef.current.focus();

    const alPresionarTecla = (evento) => {
      if (evento.key !== "Escape") return;
      if (guardando || guardandoLocal) return;
      onCerrar();
    };

    document.addEventListener("keydown", alPresionarTecla);

    return () => {
      document.removeEventListener("keydown", alPresionarTecla);
      document.body.style.overflow = overflowAnterior;
    };
  }, [abierto, guardando, guardandoLocal, onCerrar]);

  useEffect(() => {
    if (errores.length === 0 || !bodyRef.current) return;
    bodyRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }, [errores]);

  if (!abierto || !fila) return null;

  /* ------------------------------------------------------------
     EDICIÓN DEL FORMULARIO
     ------------------------------------------------------------ */

  const actualizarItem = (id, cambios) => {
    setForm((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...cambios } : item))
    );
  };

  const handleHoraChange = (id, campo, valor) => {
    setForm((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const base = item.inicio ?? item.fechaBase ?? fecha;

        if (campo === "inicio") {
          const nuevoInicio = conHora(base, valor);
          if (!nuevoInicio) return item;

          let nuevoFin = item.fin;

          if (nuevoFin) {
            const finAjustado = new Date(nuevoInicio);
            finAjustado.setHours(
              nuevoFin.getHours(),
              nuevoFin.getMinutes(),
              0,
              0
            );

            if (finAjustado.getTime() <= nuevoInicio.getTime()) {
              finAjustado.setDate(finAjustado.getDate() + 1);
            }

            nuevoFin = finAjustado;
          }

          return {
            ...item,
            inicio: nuevoInicio,
            fin: nuevoFin,
            fechaBase: nuevoInicio,
          };
        }

        const nuevoFin = conHora(base, valor);
        if (!nuevoFin) return item;

        if (item.inicio && nuevoFin.getTime() <= item.inicio.getTime()) {
          nuevoFin.setDate(nuevoFin.getDate() + 1);
        }

        return { ...item, fin: nuevoFin };
      })
    );
  };

  const handleEstado = (id, estado) => {
    actualizarItem(id, { estado });
    setErrores([]);
  };

  const handleToggleEvento = (id) => {
    setForm((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, editandoEvento: !item.editandoEvento }
          : item
      )
    );
  };

  const handleTipo = (id, tipo) => {
    setForm((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        let idPrograma = item.idPrograma;
        let color = item.color;
        let idSchema = item.idSchema;

        if (tipo === "Null") {
          idPrograma = "Null-30";
          color = "red";
          idSchema = "------";
        } else if (tipo === "TimeOut") {
          idPrograma = "TimeOut";
          color = "red";
          idSchema = "------";
        } else if (tipo === "Custom" || tipo === "Programmer") {
          idPrograma = "";
          color = "red";
          idSchema = "------";
        } else if (tipo === "Programa" || tipo === "Secondary") {
          idPrograma = "";
          color = "Brown";
          idSchema = "------";
        }

        return { ...item, tipo, idPrograma, color, idSchema };
      })
    );
  };

  const handleEvento = (id, idPrograma) => {
    setForm((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        let color = item.color;

        if (item.tipo === "Programa" || item.tipo === "Secondary") {
          const programa = programs.find(
            (registro) => String(registro?._id) === String(idPrograma)
          );
          color = programa?.Color || "Brown";
        } else if (
          item.tipo === "Custom" ||
          item.tipo === "TimeOut" ||
          item.tipo === "Programmer"
        ) {
          color = "red";
        }

        return { ...item, idPrograma, color };
      })
    );
  };

  const handleObservacion = (id, valor) => {
    actualizarItem(id, { observacionConsolidacion: valor });
  };

  /* ------------------------------------------------------------
     PAYLOADS Y GUARDADO
     ------------------------------------------------------------ */

  const construirUpdates = () => {
    const erroresLocales = [];

    const normalizados = form.map((item) => {
      const sucioHoras = estaSucioHoras(item);
      const sucioEvento = estaSucioEvento(item);
      let estadoFinal = item.estado;

      if (
        estadoFinal === ESTADOS_CONSOLIDACION.VALIDADO &&
        (sucioHoras || sucioEvento)
      ) {
        estadoFinal = ESTADOS_CONSOLIDACION.AJUSTADO;
      }

      const minutos =
        estadoFinal === ESTADOS_CONSOLIDACION.NO_LABORADO
          ? 0
          : estadoFinal === ESTADOS_CONSOLIDACION.VALIDADO &&
              !sucioHoras &&
              !sucioEvento
            ? item.duracionProgramada
            : item.inicio && item.fin
              ? minutosDeRango(item.inicio, item.fin)
              : 0;

      return {
        ...item,
        estadoFinal,
        sucioHoras,
        sucioEvento,
        minutos,
      };
    });

    const reindexar = normalizados.some((item) => item.sucioHoras);
    const indices = reindexar
      ? new Map(
          siguienteIndexPorHora(
            normalizados.map((item) => ({
              id: item.id,
              inicio: item.inicio,
            }))
          ).map((registro) => [registro.id, registro.index])
        )
      : null;

    const intervalos = [];
    const updates = [];

    normalizados.forEach((item) => {
      const enviarHoras =
        item.estadoFinal !== ESTADOS_CONSOLIDACION.NO_LABORADO &&
        (item.sucioHoras ||
          item.estadoFinal === ESTADOS_CONSOLIDACION.AJUSTADO ||
          item.estado === ESTADOS_CONSOLIDACION.AJUSTADO);
      const enviarEvento =
        item.estadoFinal !== ESTADOS_CONSOLIDACION.NO_LABORADO &&
        item.sucioEvento;

      if (enviarEvento && (!item.tipo || !item.idPrograma)) {
        erroresLocales.push(
          `${item.nombre}: seleccione el tipo y el evento antes de guardar.`
        );
        return;
      }

      if (enviarHoras && (!item.inicio || !item.fin)) {
        erroresLocales.push(
          `${item.nombre}: indique la hora de inicio y de fin.`
        );
        return;
      }

      if (
        item.estadoFinal !== ESTADOS_CONSOLIDACION.PENDIENTE &&
        item.estadoFinal !== ESTADOS_CONSOLIDACION.NO_LABORADO &&
        (!item.inicio || !item.fin)
      ) {
        erroresLocales.push(
          `${item.nombre}: complete la hora de inicio y de fin antes de validar.`
        );
        return;
      }

      const error = validarTurnoParaConsolidar({
        estado: item.estadoFinal,
        inicio: item.inicio,
        fin: item.fin,
        minutos: item.minutos,
        observacionConsolidacion: item.observacionConsolidacion,
        tipo: item.tipo,
        idPrograma: item.idPrograma,
      });

      if (error) {
        erroresLocales.push(`${item.nombre}: ${error}`);
        return;
      }

      if (
        item.estadoFinal !== ESTADOS_CONSOLIDACION.NO_LABORADO &&
        item.inicio &&
        item.fin
      ) {
        intervalos.push({
          id: item.id,
          nombre: item.nombre,
          estado: item.estadoFinal,
          inicio: item.inicio,
          fin: item.fin,
        });
      }

      updates.push(
        construirActualizacionTurno({
          turno: item.turno,
          estado: item.estadoFinal,
          inicio: enviarHoras ? item.inicio : undefined,
          fin: enviarHoras ? item.fin : undefined,
          tipo: enviarEvento ? item.tipo : undefined,
          idPrograma: enviarEvento ? item.idPrograma : undefined,
          eventId: enviarEvento ? item.eventId : undefined,
          color: enviarEvento ? item.color : undefined,
          idSchema: enviarEvento ? item.idSchema : undefined,
          index: indices?.get(item.id),
          observacion: item.observacion,
          observacionConsolidacion: item.observacionConsolidacion,
          usuario,
          minutos: item.minutos,
        })
      );
    });

    if (erroresLocales.length > 0) {
      setErrores(erroresLocales);
      return null;
    }

    const cruce = validarSolapamientos(intervalos);

    if (cruce) {
      setErrores([
        `Los turnos "${cruce.anterior.nombre}" y "${cruce.actual.nombre}" se cruzan. Corrija las horas antes de guardar.`,
      ]);
      return null;
    }

    return updates;
  };

  const handleGuardar = async () => {
    if (guardandoRef.current || guardando || guardandoLocal) return;

    const updates = construirUpdates();
    if (!updates) return;

    if (updates.length === 0) {
      setErrores(["No hay turnos para guardar."]);
      return;
    }

    guardandoRef.current = true;
    setGuardandoLocal(true);
    setErrores([]);

    try {
      const resultado = await onGuardar(updates);
      const fallidos = Array.isArray(resultado?.fallidos)
        ? resultado.fallidos
        : [];

      if (fallidos.length > 0) {
        setErrores(
          fallidos.map(
            (fallido) =>
              `${fallido.id || "Turno"}: ${
                fallido.mensaje || "No se pudo actualizar."
              }`
          )
        );
        return;
      }

      if (!resultado?.ok) {
        setErrores([
          "No se pudo guardar la consolidación. Intente nuevamente.",
        ]);
        return;
      }

      toast.success(
        resultado.actualizados === 1
          ? "Turno consolidado"
          : `${resultado.actualizados} turnos consolidados`
      );
      onCerrar();
    } catch (error) {
      setErrores([
        error?.message || "No se pudo guardar la consolidación.",
      ]);
    } finally {
      guardandoRef.current = false;
      setGuardandoLocal(false);
    }
  };

  const handleMarcarValidado = () => {
    setForm((prev) =>
      prev.map((item) => ({
        ...item,
        estado: estaSucio(item)
          ? ESTADOS_CONSOLIDACION.AJUSTADO
          : ESTADOS_CONSOLIDACION.VALIDADO,
      }))
    );
    setErrores([]);
  };

  const handleReabrir = () => {
    if (!confirmarReapertura) {
      setConfirmarReapertura(true);
      return;
    }

    setForm((prev) =>
      prev.map((item) => ({
        ...item,
        estado: ESTADOS_CONSOLIDACION.PENDIENTE,
      }))
    );
    setConfirmarReapertura(false);
    setErrores([]);
  };

  const alHacerClicEnFondo = (evento) => {
    if (evento.target !== evento.currentTarget) return;
    if (guardando || guardandoLocal) return;
    onCerrar();
  };

  const resumen = form.reduce(
    (acumulado, item) => {
      acumulado.programados += item.duracionProgramada;
      acumulado.consolidados += minutosItem(item);
      return acumulado;
    },
    { programados: 0, consolidados: 0 }
  );

  const diferencia = resumen.consolidados - resumen.programados;
  const hayAlgoConsolidado = form.some(
    (item) => item.estado !== ESTADOS_CONSOLIDACION.PENDIENTE
  );

  const portal =
    (typeof document !== "undefined" && document.getElementById("portal")) ||
    (typeof document !== "undefined" ? document.body : null);

  if (!portal) return null;

  return createPortal(
    <div
      className="consolidate-modal-overlay"
      onMouseDown={alHacerClicEnFondo}
    >
      <section
        className="consolidate-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consolidate-modal-title"
      >
        <header className="consolidate-modal__header">
          <div className="consolidate-modal__heading">
            <span className="consolidate-modal__eyebrow">
              {fila.grupoNombre} · {fila.cargo}
            </span>
            <h2 id="consolidate-modal-title">
              Consolidar turnos de {fila.nombre}
            </h2>
            <p>
              {formatearFecha(fecha)} · {form.length}{" "}
              {form.length === 1 ? "turno programado" : "turnos programados"}
            </p>
          </div>

          <button
            type="button"
            className="consolidate-modal__close"
            onClick={onCerrar}
            ref={cerrarRef}
            disabled={guardando || guardandoLocal}
            aria-label="Cerrar consolidación"
          >
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className="consolidate-modal__body" ref={bodyRef}>
          {fila.ausencia && (
            <div
              className="consolidate-modal__notice"
              style={{
                borderColor: fila.ausencia.color,
                background: `${fila.ausencia.color}18`,
              }}
            >
              <FiAlertTriangle aria-hidden="true" />
              <div>
                <strong>
                  Ausencia registrada: {fila.ausencia.label}
                </strong>
                <span>
                  El trabajador tiene una ausencia activa y un turno
                  programado. Verifique si laboró antes de validar.
                </span>
              </div>
            </div>
          )}

          {fila.sustitutoDe && (
            <div className="consolidate-modal__notice consolidate-modal__notice--info">
              <FiCheck aria-hidden="true" />
              <div>
                <strong>Sustituto de {fila.sustitutoDe}</strong>
                <span>
                  Este turno corresponde a una sustitución temporal del día.
                </span>
              </div>
            </div>
          )}

          {fila.auditoriaEn && (
            <div className="consolidate-modal__notice consolidate-modal__notice--info">
              <FiCheck aria-hidden="true" />
              <div>
                <strong>Última consolidación</strong>
                <span>
                  {fila.consolidadoPor || "Usuario"} ·{" "}
                  {formatearFechaHora(fila.auditoriaEn)}
                </span>
              </div>
            </div>
          )}

          {fila.duplicado && (
            <div className="consolidate-modal__notice consolidate-modal__notice--danger">
              <FiAlertTriangle aria-hidden="true" />
              <div>
                <strong>Posibles turnos duplicados</strong>
                <span>
                  Hay turnos con el mismo índice, evento y horas. Marque el
                  duplicado como &quot;No laborado&quot; antes de validar.
                </span>
              </div>
            </div>
          )}

          {errores.length > 0 && (
            <div className="consolidate-modal__errors" role="alert">
              <FiAlertTriangle aria-hidden="true" />
              <div>
                <strong>Revise la consolidación</strong>
                <ul>
                  {errores.map((error, indice) => (
                    <li key={`error-consolidate-${indice}`}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="consolidate-modal__summary">
            <div>
              <span>Programadas</span>
              <strong>{formatearDuracion(resumen.programados)}</strong>
            </div>
            <div>
              <span>Consolidadas</span>
              <strong>{formatearDuracion(resumen.consolidados)}</strong>
            </div>
            <div
              className={
                diferencia === 0
                  ? "consolidate-modal__summary-diff"
                  : "consolidate-modal__summary-diff consolidate-modal__summary-diff--changed"
              }
            >
              <span>Diferencia</span>
              <strong>
                {diferencia > 0 ? "+" : diferencia < 0 ? "-" : ""}
                {formatearDuracion(Math.abs(diferencia))}
              </strong>
            </div>
          </div>

          <div className="consolidate-modal__shifts">
            {form.map((item) => {
              const cruce = cruzaMedianoche(item.inicio, item.fin);
              const minutosActuales = minutosItem(item);
              const requiereObservacion =
                item.estado === ESTADOS_CONSOLIDACION.AJUSTADO ||
                item.estado === ESTADOS_CONSOLIDACION.NO_LABORADO;

              return (
                <article
                  className={`consolidate-shift consolidate-shift--${item.estado.toLowerCase()}`}
                  key={item.id}
                >
                  <header className="consolidate-shift__header">
                    <span className="consolidate-shift__index">
                      #{item.index}
                    </span>

                    <div className="consolidate-shift__title">
                      <h3>{item.nombre}</h3>
                      <p>
                        <FiClock aria-hidden="true" />
                        {formatearHoraCorta(item.inicio) ?? "--:--"} –{" "}
                        {formatearHoraCorta(item.fin) ?? "--:--"}
                        {cruce ? " (+1 día)" : ""} ·{" "}
                        {formatearDuracion(item.duracionProgramada)} programadas
                      </p>
                    </div>

                    <select
                      className={`consolidate-shift__estado consolidate-shift__estado--${item.estado.toLowerCase()}`}
                      value={item.estado}
                      onChange={(evento) =>
                        handleEstado(item.id, evento.target.value)
                      }
                      aria-label={`Estado del turno ${item.nombre}`}
                    >
                      <option value={ESTADOS_CONSOLIDACION.VALIDADO}>
                        Validado
                      </option>
                      <option value={ESTADOS_CONSOLIDACION.AJUSTADO}>
                        Ajustado
                      </option>
                      <option value={ESTADOS_CONSOLIDACION.NO_LABORADO}>
                        No laborado
                      </option>
                      <option value={ESTADOS_CONSOLIDACION.PENDIENTE}>
                        Pendiente
                      </option>
                    </select>
                  </header>

                  <div className="consolidate-shift__times">
                    <label>
                      <span>Inicio</span>
                      <input
                        type="time"
                        value={horaTexto(item.inicio)}
                        onChange={(evento) =>
                          handleHoraChange(
                            item.id,
                            "inicio",
                            evento.target.value
                          )
                        }
                        disabled={
                          item.estado ===
                          ESTADOS_CONSOLIDACION.NO_LABORADO
                        }
                      />
                    </label>

                    <label>
                      <span>Fin</span>
                      <input
                        type="time"
                        value={horaTexto(item.fin)}
                        onChange={(evento) =>
                          handleHoraChange(item.id, "fin", evento.target.value)
                        }
                        disabled={
                          item.estado ===
                          ESTADOS_CONSOLIDACION.NO_LABORADO
                        }
                      />
                    </label>

                    {cruce && (
                      <span className="consolidate-shift__cross">
                        termina el día siguiente
                      </span>
                    )}

                    <span className="consolidate-shift__duration">
                      {formatearDuracion(minutosActuales)}
                    </span>
                  </div>

                  <label className="consolidate-shift__event-toggle">
                    <input
                      type="checkbox"
                      checked={item.editandoEvento}
                      onChange={() => handleToggleEvento(item.id)}
                    />
                    <span>Cambió el evento</span>
                  </label>

                  {item.editandoEvento && (
                    <div className="consolidate-shift__event">
                      <label>
                        <span>Tipo</span>
                        <select
                          value={item.tipo}
                          onChange={(evento) =>
                            handleTipo(item.id, evento.target.value)
                          }
                        >
                          <option value="Programa">Programa</option>
                          <option value="Secondary">Secondary</option>
                          <option value="Programmer">Programmer</option>
                          <option value="Custom">Custom</option>
                          <option value="TimeOut">TimeOut</option>
                          <option value="Null">Null-30</option>
                        </select>
                      </label>

                      {(item.tipo === "Programa" ||
                        item.tipo === "Secondary") && (
                        <label>
                          <span>Evento</span>
                          <select
                            value={item.idPrograma}
                            onChange={(evento) =>
                              handleEvento(item.id, evento.target.value)
                            }
                          >
                            <option value="">Seleccione un programa</option>
                            {programs.map((programa) => (
                              <option
                                key={programa._id}
                                value={programa._id}
                              >
                                {programa.nombre}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}

                      {item.tipo === "Programmer" && (
                        <label>
                          <span>Programmer</span>
                          <select
                            value={item.idPrograma}
                            onChange={(evento) =>
                              handleEvento(item.id, evento.target.value)
                            }
                          >
                            <option value="">Seleccione un evento</option>
                            {programmers.map((programmer) => (
                              <option
                                key={programmer._id}
                                value={programmer._id}
                              >
                                {programmer.Nombre}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}

                      {item.tipo === "Custom" && (
                        <label>
                          <span>Nombre del evento</span>
                          <input
                            type="text"
                            value={item.idPrograma}
                            onChange={(evento) =>
                              handleEvento(item.id, evento.target.value)
                            }
                            placeholder="Ej.: Cubrimiento especial"
                          />
                        </label>
                      )}

                      {(item.tipo === "Null" ||
                        item.tipo === "TimeOut") && (
                        <p className="consolidate-shift__event-fixed">
                          {item.tipo === "Null" ? "Null-30" : "TimeOut"}
                        </p>
                      )}
                    </div>
                  )}

                  {item.observacion && (
                    <p className="consolidate-shift__note">
                      Nota de programación: {item.observacion}
                    </p>
                  )}

                  <label className="consolidate-shift__observation">
                    <span>
                      Observación de consolidación
                      {requiereObservacion ? " *" : ""}
                    </span>
                    <textarea
                      rows={2}
                      maxLength={500}
                      value={item.observacionConsolidacion}
                      onChange={(evento) =>
                        handleObservacion(item.id, evento.target.value)
                      }
                      placeholder="Ej.: ingresó 30 min tarde, cubrió el evento de 10:30 a 14:00..."
                    />
                  </label>
                </article>
              );
            })}
          </div>
        </div>

        <footer className="consolidate-modal__footer">
          <div className="consolidate-modal__footer-text">
            {confirmarReapertura ? (
              <span className="consolidate-modal__reopen-warning">
                Se marcarán todos los turnos como pendientes y se limpiará la
                auditoría al guardar. Confirme nuevamente.
              </span>
            ) : (
              <span>
                {hayAlgoConsolidado
                  ? "Puede reabrir si necesita corregir una consolidación."
                  : "Valide sin novedad o ajuste las horas reales."}
              </span>
            )}
          </div>

          <div className="consolidate-modal__footer-actions">
            <button
              type="button"
              className="consolidate-btn consolidate-btn--ghost"
              onClick={handleReabrir}
              disabled={guardando || guardandoLocal}
            >
              <FiRotateCcw aria-hidden="true" />
              {confirmarReapertura ? "Confirmar reapertura" : "Reabrir"}
            </button>

            <button
              type="button"
              className="consolidate-btn consolidate-btn--soft"
              onClick={handleMarcarValidado}
              disabled={guardando || guardandoLocal}
            >
              <FiCheck aria-hidden="true" />
              Marcar todo validado
            </button>

            <button
              type="button"
              className="consolidate-btn consolidate-btn--ghost"
              onClick={onCerrar}
              disabled={guardando || guardandoLocal}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="consolidate-btn consolidate-btn--primary"
              onClick={handleGuardar}
              disabled={guardando || guardandoLocal}
            >
              <FiSave aria-hidden="true" />
              {guardando || guardandoLocal
                ? "Guardando..."
                : "Guardar consolidación"}
            </button>
          </div>
        </footer>
      </section>
    </div>,
    portal
  );
}

ModalConsolidate.propTypes = {
  abierto: PropTypes.bool,
  fila: PropTypes.object,
  fecha: PropTypes.instanceOf(Date),
  catalogs: PropTypes.shape({
    programs: PropTypes.array,
    programmers: PropTypes.array,
    stacks: PropTypes.array,
  }),
  usuario: PropTypes.shape({
    id: PropTypes.string,
    nombre: PropTypes.string,
  }),
  guardando: PropTypes.bool,
  onCerrar: PropTypes.func.isRequired,
  onGuardar: PropTypes.func.isRequired,
};
