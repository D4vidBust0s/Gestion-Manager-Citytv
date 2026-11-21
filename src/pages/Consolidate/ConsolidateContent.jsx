import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Toaster, toast } from "react-hot-toast";
import Swal from "sweetalert2";
import {
  FiAlertTriangle,
  FiCheck,
  FiEdit2,
  FiRefreshCw,
  FiSearch,
  FiX,
} from "react-icons/fi";

/* HOOKS */
import { useAbsencePeriods } from "../../Custom_Hooks/useAbsencePeriods";
import { useConsolidateData } from "../../Custom_Hooks/useConsolidateData";

/* UTILIDADES */
import { getCurrentUser, getCurrentUserName } from "../../utils/currentUser";
import {
  ESTADOS_CONSOLIDACION,
  META_ESTADO,
  PLANNERS,
  agruparConsolidacion,
  ayerLocal,
  construirActualizacionTurno,
  fechaDesdeIsoDia,
  filtrarFilas,
  formatearDuracion,
  formatearFechaHora,
  isoDiaLocal,
  minutosProgramadosTurno,
  nombreEvento,
  rangoHorarioTurno,
  textoBloques,
  turnoConsolidado,
  validarFechaConsolidacion,
} from "../../utils/consolidation";

/* SERVICIOS */
import { shiftsApi } from "../../api/shifts";

/* COMPONENTES */
import ConsolidateStackModal from "../../Components/Modals/ConsolidateStackModal";

import "./ConsolidateContent.css";

const LOTE_ACTUALIZACION = 50;

const FILTROS_ESTADO = [
  { key: "Todos", label: "Todos" },
  { key: "Pendientes", label: "Pendientes" },
  { key: "Validados", label: "Validados" },
  { key: "Con novedad", label: "Con novedad" },
  { key: "Sin programación", label: "Sin programación" },
];

const ESTADO_DIA_META = {
  Abierto: { className: "abierto", texto: "Día abierto" },
  Parcial: { className: "parcial", texto: "Consolidación parcial" },
  Cerrado: { className: "cerrado", texto: "Día cerrado" },
  "Sin programación": {
    className: "sin-programacion",
    texto: "Sin programación",
  },
};

const escapeHtml = (valor) =>
  String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const claseEstado = (estado) =>
  String(estado ?? "")
    .toLowerCase()
    .replace(/\s+/g, "");

const claveGrupoDe = (fila) => fila.grupoId || "__sin_grupo__";

export default function ConsolidateContent() {
  const [fecha, setFecha] = useState(() => ayerLocal());
  const [planner, setPlanner] = useState("Todos");
  const [grupoId, setGrupoId] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarSinProgramacion, setMostrarSinProgramacion] = useState(false);
  const [seleccionados, setSeleccionados] = useState(() => new Set());
  const [filaModal, setFilaModal] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [refrescando, setRefrescando] = useState(false);

  const usuario = useMemo(() => getCurrentUser(), []);
  const idUsuario = usuario?.id || usuario?._id || "";
  const nombreUsuario = useMemo(
    () => getCurrentUserName("Administrador"),
    []
  );

  const {
    groups,
    payroll,
    shifts,
    programs,
    programmers,
    stacks,
    savedStacks,
    substitutions,
    cargando,
    recargando,
    error,
    actualizadoEn,
    recargarTodo,
    recargarTurnos,
  } = useConsolidateData({ fecha });

  const {
    ausencias,
    error: errorAusencias,
    recargar: recargarAusencias,
  } = useAbsencePeriods({});

  const catalogs = useMemo(
    () => ({ programs, programmers, stacks }),
    [programs, programmers, stacks]
  );

  const datos = useMemo(
    () =>
      agruparConsolidacion({
        groups,
        payroll,
        shifts,
        fecha,
        planner,
        grupoId,
        ausencias,
        substitutions,
        catalogs,
      }),
    [
      groups,
      payroll,
      shifts,
      fecha,
      planner,
      grupoId,
      ausencias,
      substitutions,
      catalogs,
    ]
  );

  const filasVisibles = useMemo(
    () =>
      filtrarFilas(datos.filas, {
        estado: filtroEstado,
        busqueda,
        incluirSinProgramacion: mostrarSinProgramacion,
      }),
    [datos.filas, filtroEstado, busqueda, mostrarSinProgramacion]
  );

  const gruposDisponibles = useMemo(
    () =>
      (Array.isArray(groups) ? groups : [])
        .filter((grupo) =>
          ["MainPlanner", "MainPlanner +"].includes(
            String(grupo?.mainplanner ?? "").trim()
          )
        )
        .filter(
          (grupo) =>
            planner === "Todos" ||
            String(grupo?.mainplanner ?? "").trim() === planner
        )
        .slice()
        .sort((a, b) => {
          const ordenA = Number(a?.orden ?? a?.order);
          const ordenB = Number(b?.orden ?? b?.order);

          return (
            (Number.isFinite(ordenA) ? ordenA : 999) -
              (Number.isFinite(ordenB) ? ordenB : 999) ||
            String(a?.nombre ?? "").localeCompare(String(b?.nombre ?? ""), "es")
          );
        }),
    [groups, planner]
  );

  const filasSeleccionadas = useMemo(
    () =>
      filasVisibles.filter(
        (fila) => seleccionados.has(fila.id) && fila.seleccionable
      ),
    [filasVisibles, seleccionados]
  );

  const seleccionablesVisibles = useMemo(
    () => filasVisibles.filter((fila) => fila.seleccionable),
    [filasVisibles]
  );

  const todosVisiblesSeleccionados =
    seleccionablesVisibles.length > 0 &&
    seleccionablesVisibles.every((fila) => seleccionados.has(fila.id));

  const grupoStats = useMemo(() => {
    const mapa = new Map();

    filasVisibles.forEach((fila) => {
      const clave = claveGrupoDe(fila);
      const actual = mapa.get(clave) ?? {
        nombre: fila.grupoNombre,
        total: 0,
        pendientes: 0,
      };

      actual.total += 1;
      if (
        fila.estado === ESTADOS_CONSOLIDACION.PENDIENTE ||
        fila.estado === "Parcial"
      ) {
        actual.pendientes += 1;
      }

      mapa.set(clave, actual);
    });

    return mapa;
  }, [filasVisibles]);

  const hoyIso = isoDiaLocal(new Date());
  const fechaDia = isoDiaLocal(fecha);
  const esHoy = fechaDia === hoyIso;
  const resumen = datos.resumen;
  const turnosEnLaFecha = Array.isArray(shifts) ? shifts.length : 0;
  const estadoDiaMeta =
    ESTADO_DIA_META[datos.estadoDia] ?? ESTADO_DIA_META.Abierto;
  const porcentajeConsolidado =
    resumen.totalConTurnos > 0
      ? Math.round(
          ((resumen.totalConTurnos - resumen.pendientes) /
            resumen.totalConTurnos) *
            100
        )
      : 0;

  /* ------------------------------------------------------------
     EFECTOS DE FILTROS
     ------------------------------------------------------------ */

  useEffect(() => {
    if (grupoId === "Todos") return;

    const sigueExistiendo = gruposDisponibles.some(
      (grupo) => String(grupo._id) === String(grupoId)
    );

    if (!sigueExistiendo) setGrupoId("Todos");
  }, [gruposDisponibles, grupoId]);

  /* ------------------------------------------------------------
     LECTURA Y ESCRITURA
     ------------------------------------------------------------ */

  const ejecutarConsolidacion = useCallback(
    async (updates) => {
      const lista = Array.isArray(updates) ? updates : [];

      if (lista.length === 0) {
        return { ok: false, actualizados: 0, fallidos: [] };
      }

      let actualizados = 0;
      const fallidos = [];

      for (let indice = 0; indice < lista.length; indice += LOTE_ACTUALIZACION) {
        const lote = lista.slice(indice, indice + LOTE_ACTUALIZACION);

        try {
          const respuesta = await shiftsApi.consolidateBulk(lote, {
            timeout: 30000,
          });

          actualizados += Number(respuesta?.actualizados) || 0;

          if (Array.isArray(respuesta?.fallidos)) {
            fallidos.push(...respuesta.fallidos);
          }
        } catch (errorLote) {
          lote.forEach((actualizacion) => {
            fallidos.push({
              id: actualizacion.id,
              mensaje:
                errorLote?.message || "No se pudo consolidar el lote de bloques.",
            });
          });
          break;
        }
      }

      const refresco = await recargarTurnos();

      if (!refresco) {
        toast.error(
          "Los cambios se enviaron, pero no se pudo refrescar la tabla. Presione Actualizar."
        );
      }

      return {
        ok: fallidos.length === 0,
        actualizados,
        fallidos,
      };
    },
    [recargarTurnos]
  );

  const construirActualizacionesValidado = useCallback(
    (filas) => {
      const updates = [];

      for (const fila of filas) {
        for (const turno of fila.turnos) {
          if (turnoConsolidado(turno)) continue;

          const minutos = minutosProgramadosTurno(turno, catalogs);

          if (!minutos || minutos <= 0) {
            return {
              error: `${fila.nombre}: el bloque #${
                turno.Index ?? "-"
              } no tiene una duración válida. Abra el detalle y ajuste las horas.`,
            };
          }

          updates.push(
            construirActualizacionTurno({
              turno,
              estado: ESTADOS_CONSOLIDACION.VALIDADO,
              observacionConsolidacion:
                turno.ObservacionConsolidacion ?? "",
              usuario: { id: idUsuario, nombre: nombreUsuario },
              minutos,
            })
          );
        }
      }

      return { updates };
    },
    [catalogs, idUsuario, nombreUsuario]
  );

  const validarFilas = useCallback(
    async (filas, { esCierre = false } = {}) => {
      const elegibles = (Array.isArray(filas) ? filas : []).filter(
        (fila) => fila.puedeValidar
      );

      if (elegibles.length === 0) {
        toast.info(
          esCierre
            ? "No hay bloques pendientes para cerrar el día."
            : "No hay bloques pendientes en la selección."
        );
        return;
      }

      const { updates, error: errorConstruccion } =
        construirActualizacionesValidado(elegibles);

      if (errorConstruccion) {
        toast.error(errorConstruccion);
        return;
      }

      const minutos = elegibles.reduce(
        (total, fila) =>
          total +
          fila.turnos
            .filter((turno) => !turnoConsolidado(turno))
            .reduce(
              (subtotal, turno) =>
                subtotal + minutosProgramadosTurno(turno, catalogs),
              0
            ),
        0
      );

      const ausenciasEnSeleccion = elegibles.filter((fila) => fila.ausencia);

      const totalBloques = updates.length;
      const etiquetaBloque = totalBloques === 1 ? "bloque" : "bloques";
      const verboValidar =
        totalBloques === 1 ? "Se validará" : "Se validarán";

      const titulo =
        elegibles.length === 1
          ? `¿Validar ${
              totalBloques === 1 ? "el bloque" : "los bloques"
            } de ${elegibles[0].nombre}?`
          : esCierre
            ? "¿Cerrar el día?"
            : `¿Validar ${elegibles.length} trabajadores?`;

      const detalle = esCierre
        ? `${verboValidar} <b>${totalBloques}</b> ${etiquetaBloque} de <b>${
            elegibles.length
          }</b> trabajadores por <b>${formatearDuracion(
            minutos
          )}</b>.<br/>El cierre aplica solo al planner y grupo seleccionados.`
        : `${verboValidar} <b>${totalBloques}</b> ${etiquetaBloque} por <b>${formatearDuracion(
            minutos
          )}</b> sin modificar horas ni eventos.`;

      const confirmacion = await Swal.fire({
        icon: ausenciasEnSeleccion.length > 0 ? "warning" : "question",
        title: titulo,
        html: `${
          ausenciasEnSeleccion.length > 0
            ? `<p style="text-align:left;margin-bottom:.6rem"><b>Atención:</b> ${escapeHtml(
                ausenciasEnSeleccion
                  .map((fila) => `${fila.nombre} (${fila.ausencia.label})`)
                  .join(", ")
              )} tiene(n) una ausencia activa y un turno programado.</p>`
            : ""
        }<p style="text-align:left;margin:0">${detalle}</p>${
          esCierre && resumen.sinProgramacion > 0
            ? `<p style="text-align:left;margin-top:.6rem">${resumen.sinProgramacion} trabajador(es) sin programación no se consolidan.</p>`
            : ""
        }`,
        showCancelButton: true,
        confirmButtonText: esCierre ? "Sí, cerrar día" : "Sí, validar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#26610d",
        cancelButtonColor: "#00094B",
        reverseButtons: true,
        footer: "<h6>Gestión Manager Citytv</h6>",
      });

      if (!confirmacion.isConfirmed) return;

      setGuardando(true);

      try {
        const resultado = await ejecutarConsolidacion(updates);

        if (resultado.fallidos.length > 0) {
          await Swal.fire({
            icon: "warning",
            title: "Consolidación incompleta",
            html: `<p style="text-align:left">Se actualizaron <b>${textoBloques(
              resultado.actualizados
            )}</b>. Los siguientes no pudieron guardarse:</p><ul style="text-align:left">${resultado.fallidos
              .slice(0, 12)
              .map(
                (fallido) =>
                  `<li>${escapeHtml(fallido.id || "Bloque")}: ${escapeHtml(
                    fallido.mensaje
                  )}</li>`
              )
              .join("")}</ul>`,
            confirmButtonText: "Entendido",
            confirmButtonColor: "#00094B",
            footer: "<h6>Gestión Manager Citytv</h6>",
          });
        } else {
          toast.success(
            esCierre
              ? `Día cerrado: ${textoBloques(
                  resultado.actualizados
                )} consolidados`
              : resultado.actualizados === 1
                ? "1 bloque validado"
                : `${resultado.actualizados} bloques validados`
          );
        }

        setSeleccionados(new Set());
      } catch (errorValidacion) {
        toast.error(
          errorValidacion?.message ||
            "No se pudo ejecutar la consolidación."
        );
      } finally {
        setGuardando(false);
      }
    },
    [
      catalogs,
      construirActualizacionesValidado,
      ejecutarConsolidacion,
      resumen.sinProgramacion,
    ]
  );

  const handleValidarFila = useCallback(
    (fila) => validarFilas([fila]),
    [validarFilas]
  );

  const handleValidarSeleccionados = useCallback(
    () => validarFilas(filasSeleccionadas),
    [filasSeleccionadas, validarFilas]
  );

  const handleValidarGrupo = useCallback(
    (claveGrupo) => {
      const filas = filasVisibles.filter(
        (fila) => claveGrupoDe(fila) === claveGrupo && fila.puedeValidar
      );

      return validarFilas(filas);
    },
    [filasVisibles, validarFilas]
  );

  const handleCerrarDia = useCallback(async () => {
    const pendientes = datos.filas.filter(
      (fila) => fila.turnosPendientes > 0
    );
    const requierenRevision = pendientes.filter((fila) => !fila.puedeValidar);

    if (requierenRevision.length > 0) {
      await Swal.fire({
        icon: "warning",
        title: "Hay turnos que requieren revisión",
        html: `<p style="text-align:left">No se puede cerrar el día hasta resolver los siguientes casos:</p><ul style="text-align:left">${requierenRevision
          .slice(0, 12)
          .map(
            (fila) =>
              `<li>${escapeHtml(fila.nombre)}: ${
                fila.duplicado
                  ? "bloques duplicados"
                  : "horas incompletas"
              }</li>`
          )
          .join("")}</ul>${
          requierenRevision.length > 12
            ? `<p style="text-align:left">y ${
                requierenRevision.length - 12
              } más.</p>`
            : ""
        }`,
        confirmButtonText: "Entendido",
        confirmButtonColor: "#00094B",
        footer: "<h6>Gestión Manager Citytv</h6>",
      });
      return;
    }

    return validarFilas(pendientes, { esCierre: true });
  }, [datos.filas, validarFilas]);

  const handleFechaChange = (evento) => {
    const nuevaFecha = fechaDesdeIsoDia(evento.target.value);
    if (!nuevaFecha) return;

    const errorFecha = validarFechaConsolidacion(nuevaFecha, new Date());

    if (errorFecha) {
      toast.error(errorFecha);
      return;
    }

    setFecha(nuevaFecha);
    setSeleccionados(new Set());
    setFilaModal(null);
  };

  const irAFecha = (dias) => {
    const nuevaFecha = new Date();
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    nuevaFecha.setHours(0, 0, 0, 0);
    setFecha(nuevaFecha);
    setSeleccionados(new Set());
    setFilaModal(null);
  };

  const handleActualizar = async () => {
    if (cargando || refrescando || guardando) return;

    setRefrescando(true);

    try {
      const [datosOk] = await Promise.all([
        recargarTodo(),
        recargarAusencias(),
      ]);

      if (datosOk) toast.success("Datos actualizados");
    } finally {
      setRefrescando(false);
    }
  };

  const handlePlannerChange = (evento) => {
    setPlanner(evento.target.value);
    setGrupoId("Todos");
    setSeleccionados(new Set());
  };

  const handleGrupoChange = (evento) => {
    setGrupoId(evento.target.value);
    setSeleccionados(new Set());
  };

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) => {
      const siguiente = new Set(prev);

      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);

      return siguiente;
    });
  };

  const toggleTodosVisibles = () => {
    setSeleccionados((prev) => {
      const siguiente = new Set(prev);
      const todos = seleccionablesVisibles.every((fila) =>
        siguiente.has(fila.id)
      );

      seleccionablesVisibles.forEach((fila) => {
        if (todos) siguiente.delete(fila.id);
        else siguiente.add(fila.id);
      });

      return siguiente;
    });
  };

  const abrirModal = (fila) => {
    if (!fila || fila.turnos.length === 0) {
      toast.info("Este trabajador no tiene bloques programados para consolidar.");
      return;
    }

    if (!fila.idUsuario) {
      toast.error(
        "El turno no tiene un trabajador asociado; no se puede abrir el detalle del stack."
      );
      return;
    }

    setFilaModal(fila);
  };

  const cerrarModal = () => {
    setFilaModal(null);
    Promise.all([recargarTurnos(), recargarAusencias()]);
  };

  const hayFiltrosActivos =
    planner !== "Todos" ||
    grupoId !== "Todos" ||
    filtroEstado !== "Todos" ||
    Boolean(busqueda.trim());

  const claseDia = estadoDiaMeta.className;

  return (
    <div className="consolidate-wrapper">
      <Toaster />

      <div className="consolidate-main">
        {/* CONTROLES + FILTROS */}
        <section
          className="consolidate-filters"
          aria-label="Controles y filtros del día"
        >
          <div className="consolidate-filters__top">
            <div className="consolidate-filters__status">
              <span
                className={`consolidate-day-status consolidate-day-status--${claseDia}`}
              >
                {estadoDiaMeta.texto}
              </span>
              <span className="consolidate-filters__progress-text">
                {porcentajeConsolidado}% de {resumen.totalConTurnos}{" "}
                {resumen.totalConTurnos === 1 ? "turno" : "turnos"}
              </span>
              <div className="consolidate-progress" aria-hidden="true">
                <span
                  className={`consolidate-progress__fill consolidate-progress__fill--${claseDia}`}
                  style={{ width: `${porcentajeConsolidado}%` }}
                />
              </div>
            </div>

            <div className="consolidate-filters__actions">
              <button
                type="button"
                className="consolidate-btn consolidate-btn--ghost"
                onClick={handleActualizar}
                disabled={cargando || refrescando || guardando}
              >
                <FiRefreshCw
                  aria-hidden="true"
                  className={
                    cargando || refrescando
                      ? "consolidate-icon consolidate-icon--spin"
                      : "consolidate-icon"
                  }
                />
                {cargando || refrescando ? "Actualizando..." : "Actualizar"}
              </button>

              <button
                type="button"
                className="consolidate-btn consolidate-btn--close"
                onClick={handleCerrarDia}
                disabled={
                  guardando ||
                  resumen.pendientes === 0 ||
                  resumen.totalTurnos === 0
                }
                title="Validar todos los bloques pendientes del planner y grupo seleccionados"
              >
                <FiCheck aria-hidden="true" />
                Cerrar día ({resumen.pendientes})
              </button>
            </div>
          </div>

          <div className="consolidate-filters__grid">
            <div className="consolidate-filter">
              <label htmlFor="consolidate-fecha">Fecha</label>
              <input
                id="consolidate-fecha"
                type="date"
                value={fechaDia}
                max={hoyIso}
                onChange={handleFechaChange}
                disabled={cargando || guardando}
              />
            </div>

            <div className="consolidate-quick-dates">
              <button
                type="button"
                className="consolidate-chip"
                onClick={() => irAFecha(-1)}
                disabled={cargando || guardando}
              >
                Ayer
              </button>
              <button
                type="button"
                className="consolidate-chip"
                onClick={() => irAFecha(0)}
                disabled={cargando || guardando}
              >
                Hoy
              </button>
            </div>

            <div className="consolidate-filter">
              <label htmlFor="consolidate-planner">Planner</label>
              <select
                id="consolidate-planner"
                value={planner}
                onChange={handlePlannerChange}
                disabled={cargando || guardando}
              >
                {PLANNERS.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion === "Todos" ? "Todos los planners" : opcion}
                  </option>
                ))}
              </select>
            </div>

            <div className="consolidate-filter">
              <label htmlFor="consolidate-grupo">Grupo</label>
              <select
                id="consolidate-grupo"
                value={grupoId}
                onChange={handleGrupoChange}
                disabled={cargando || guardando}
              >
                <option value="Todos">Todos los grupos</option>
                {gruposDisponibles.map((grupo) => (
                  <option key={grupo._id} value={grupo._id}>
                    {grupo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="consolidate-filter consolidate-filter--search">
              <label htmlFor="consolidate-busqueda">Buscar</label>
              <div className="consolidate-search">
                <FiSearch aria-hidden="true" />
                <input
                  id="consolidate-busqueda"
                  type="search"
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                  placeholder="Trabajador, grupo o evento..."
                  disabled={cargando || guardando}
                />
              </div>
            </div>
          </div>
        </section>

        {/* RESUMEN */}
        <section className="consolidate-cards" aria-label="Resumen del día">
          <article className="consolidate-card">
            <span>Programados</span>
            <strong>{resumen.totalConTurnos}</strong>
            <small>{textoBloques(resumen.totalTurnos)} en total</small>
          </article>

          <article className="consolidate-card consolidate-card--pending">
            <span>Pendientes</span>
            <strong>{resumen.pendientes}</strong>
            <small>{textoBloques(resumen.turnosPendientes)} por validar</small>
          </article>

          <article className="consolidate-card consolidate-card--ok">
            <span>Validados</span>
            <strong>{resumen.validadas}</strong>
            <small>Sin novedad</small>
          </article>

          <article className="consolidate-card consolidate-card--novelty">
            <span>Con novedad</span>
            <strong>{resumen.conNovedad}</strong>
            <small>Ajustados o no laborados</small>
          </article>
        </section>

        <section className="consolidate-hours" aria-label="Resumen de horas">
          <div>
            <span>Horas programadas</span>
            <strong>{formatearDuracion(resumen.horasProgramadas)}</strong>
          </div>
          <div>
            <span>Horas consolidadas</span>
            <strong>{formatearDuracion(resumen.horasConsolidadas)}</strong>
          </div>
          <div
            className={
              resumen.diferencia === 0
                ? "consolidate-hours__diff"
                : "consolidate-hours__diff consolidate-hours__diff--changed"
            }
          >
            <span>Diferencia</span>
            <strong>
              {resumen.diferencia > 0
                ? "+"
                : resumen.diferencia < 0
                  ? "-"
                  : ""}
              {formatearDuracion(Math.abs(resumen.diferencia))}
            </strong>
          </div>
          <div className="consolidate-hours__updated">
            <span>Última actualización</span>
            <strong>
              {actualizadoEn
                ? formatearFechaHora(actualizadoEn)
                : "Sin actualizar"}
            </strong>
          </div>
        </section>

        {/* AVISOS */}
        {error && (
          <div className="consolidate-alert" role="alert">
            <FiAlertTriangle aria-hidden="true" />
            <div>
              <strong>No se pudo cargar el día</strong>
              <span>{error}</span>
            </div>
            <button
              type="button"
              className="consolidate-btn consolidate-btn--ghost"
              onClick={handleActualizar}
              disabled={cargando || refrescando}
            >
              Reintentar
            </button>
          </div>
        )}

        {errorAusencias && (
          <div className="consolidate-inline-warning">
            <FiAlertTriangle aria-hidden="true" />
            <span>
              No se pudieron cargar las ausencias. La consolidación sigue
              disponible, pero revise manualmente los casos con novedad.
            </span>
          </div>
        )}

        {esHoy && (
          <div className="consolidate-inline-warning consolidate-inline-warning--info">
            <FiAlertTriangle aria-hidden="true" />
            <span>
              Está consolidando el día de hoy. Los turnos todavía pueden
              cambiar durante la jornada.
            </span>
          </div>
        )}

        {datos.sinGrupo > 0 && (
          <div className="consolidate-inline-warning">
            <FiAlertTriangle aria-hidden="true" />
            <span>
              {datos.sinGrupo} trabajador(es) con turnos no pertenecen a un
              grupo MainPlanner. Seleccione planner y grupo &quot;Todos&quot;
              para verlos.
            </span>
          </div>
        )}

        {datos.sinIdentificar > 0 && (
          <div className="consolidate-inline-warning consolidate-inline-warning--danger">
            <FiAlertTriangle aria-hidden="true" />
            <span>
              Hay {datos.sinIdentificar} turno(s) sin ID de trabajador. Se
              muestran al final para que no queden fuera de la consolidación.
            </span>
          </div>
        )}

        {resumen.sinProgramacion > 0 && (
          <div className="consolidate-inline-warning consolidate-inline-warning--info">
            <FiAlertTriangle aria-hidden="true" />
            <span>
              {resumen.sinProgramacion} trabajador(es) activo(s) no tienen
              programación para esta fecha. No se consolidan.
            </span>
          </div>
        )}

        {/* BARRA DE FILTROS Y SELECCIÓN */}
        <section className="consolidate-toolbar" aria-label="Filtros de estado">
          <div className="consolidate-chips">
            {FILTROS_ESTADO.map((filtro) => (
              <button
                key={filtro.key}
                type="button"
                className={`consolidate-chip ${
                  filtroEstado === filtro.key ? "consolidate-chip--active" : ""
                }`}
                onClick={() => setFiltroEstado(filtro.key)}
                disabled={guardando}
              >
                {filtro.label}
              </button>
            ))}
          </div>

          <label className="consolidate-switch">
            <input
              type="checkbox"
              checked={mostrarSinProgramacion}
              onChange={(evento) =>
                setMostrarSinProgramacion(evento.target.checked)
              }
              disabled={guardando}
            />
            <span>Mostrar sin programación</span>
          </label>
        </section>

        {filasSeleccionadas.length > 0 && (
          <section className="consolidate-selection" aria-live="polite">
            <span>
              <strong>{filasSeleccionadas.length}</strong> trabajador(es)
              seleccionado(s) ·{" "}
              {textoBloques(
                filasSeleccionadas.reduce(
                  (total, fila) => total + fila.turnosPendientes,
                  0
                )
              )}{" "}
              pendientes
            </span>

            <div className="consolidate-selection__actions">
              <button
                type="button"
                className="consolidate-btn consolidate-btn--primary"
                onClick={handleValidarSeleccionados}
                disabled={guardando}
              >
                <FiCheck aria-hidden="true" />
                Validar seleccionados
              </button>
              <button
                type="button"
                className="consolidate-btn consolidate-btn--ghost"
                onClick={() => setSeleccionados(new Set())}
                disabled={guardando}
              >
                <FiX aria-hidden="true" />
                Limpiar
              </button>
            </div>
          </section>
        )}

        {/* TABLA */}
        <section
          className={`consolidate-table-wrap ${
            recargando ? "consolidate-table-wrap--loading" : ""
          }`}
          aria-busy={cargando || recargando}
        >
          <table className="consolidate-table">
            <caption className="consolidate-sr">
              Turnos programados por trabajador para la fecha seleccionada
            </caption>

            <thead>
              <tr>
                <th scope="col" className="consolidate-col--check">
                  <input
                    type="checkbox"
                    checked={todosVisiblesSeleccionados}
                    onChange={toggleTodosVisibles}
                    disabled={seleccionablesVisibles.length === 0 || guardando}
                    aria-label="Seleccionar todos los trabajadores visibles"
                  />
                </th>
                <th scope="col">Trabajador</th>
                <th scope="col" className="consolidate-col--cargo">
                  Cargo
                </th>
                <th scope="col">Bloques programados</th>
                <th scope="col" className="consolidate-col--hours">
                  Horas prog.
                </th>
                <th scope="col" className="consolidate-col--hours">
                  Horas consol.
                </th>
                <th scope="col">Estado</th>
                <th scope="col" className="consolidate-col--actions">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {filasVisibles.length === 0 && !cargando ? (
                <tr>
                  <td colSpan={8} className="consolidate-table__empty">
                    <div className="consolidate-empty">
                      <FiSearch aria-hidden="true" />
                      <strong>
                        {turnosEnLaFecha === 0
                          ? "No hay bloques programados para esta fecha"
                          : resumen.totalTurnos === 0
                            ? "No hay bloques en el planner o grupo seleccionado"
                            : "No hay trabajadores con el filtro actual"}
                      </strong>
                      <span>
                        {turnosEnLaFecha === 0
                          ? "Programe los bloques en MainPlanner y vuelva a consolidar."
                          : resumen.totalTurnos === 0
                            ? "Cambie el planner o el grupo para ver la programación."
                            : "Cambie el estado, el grupo o limpie la búsqueda."}
                      </span>
                      {hayFiltrosActivos && (
                        <button
                          type="button"
                          className="consolidate-btn consolidate-btn--ghost"
                          onClick={() => {
                            setFiltroEstado("Todos");
                            setBusqueda("");
                            setPlanner("Todos");
                            setGrupoId("Todos");
                          }}
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filasVisibles.map((fila, indice) => {
                  const claveGrupo = claveGrupoDe(fila);
                  const anterior =
                    indice > 0 ? claveGrupoDe(filasVisibles[indice - 1]) : null;
                  const mostrarGrupo = indice === 0 || anterior !== claveGrupo;
                  const stats = grupoStats.get(claveGrupo) ?? {
                    total: 0,
                    pendientes: 0,
                  };
                  const meta = META_ESTADO[fila.estado] ?? META_ESTADO.Pendiente;
                  const tituloAuditoria = fila.auditoriaEn
                    ? `Consolidado por ${
                        fila.consolidadoPor || "usuario"
                      } el ${formatearFechaHora(fila.auditoriaEn)}`
                    : "Sin auditoría de consolidación";

                  return (
                    <Fragment key={fila.id}>
                      {mostrarGrupo && (
                        <tr className="consolidate-group-row">
                          <td colSpan={8}>
                            <div className="consolidate-group-row__content">
                              <span className="consolidate-group-row__name">
                                {fila.grupoNombre}
                              </span>
                              <span className="consolidate-group-row__stats">
                                {stats.total} trabajador(es) ·{" "}
                                {stats.pendientes} pendiente(s)
                              </span>
                              {stats.pendientes > 0 && (
                                <button
                                  type="button"
                                  className="consolidate-link"
                                  onClick={() =>
                                    handleValidarGrupo(claveGrupo)
                                  }
                                  disabled={guardando}
                                >
                                  Validar grupo
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}

                      <tr
                        className={`consolidate-row consolidate-row--${claseEstado(
                          fila.estado
                        )}${
                          seleccionados.has(fila.id)
                            ? " consolidate-row--selected"
                            : ""
                        }`}
                        onDoubleClick={() => abrirModal(fila)}
                        onKeyDown={(evento) => {
                          if (evento.key === "Enter") abrirModal(fila);
                        }}
                        tabIndex={fila.turnos.length > 0 ? 0 : -1}
                        title={
                          fila.turnos.length > 0
                            ? "Doble clic para abrir la consolidación"
                            : "Sin bloques programados"
                        }
                      >
                        <td
                          className="consolidate-col--check"
                          onDoubleClick={(evento) => evento.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={seleccionados.has(fila.id)}
                            onChange={() => toggleSeleccion(fila.id)}
                            onClick={(evento) => evento.stopPropagation()}
                            disabled={!fila.seleccionable || guardando}
                            aria-label={`Seleccionar a ${fila.nombre}`}
                          />
                        </td>

                        <td className="consolidate-worker">
                          <div className="consolidate-worker__name">
                            <span>{fila.nombre}</span>

                            {fila.ausencia && (
                              <span
                                className="consolidate-tag"
                                style={{
                                  backgroundColor: fila.ausencia.color,
                                  color: fila.ausencia.textColor,
                                }}
                                title={`Ausencia activa: ${fila.ausencia.label}`}
                              >
                                {fila.ausencia.label}
                              </span>
                            )}

                            {fila.esBalancer && (
                              <span className="consolidate-tag consolidate-tag--balancer">
                                Balancer
                              </span>
                            )}

                            {!fila.activo && (
                              <span className="consolidate-tag consolidate-tag--inactive">
                                Inactivo
                              </span>
                            )}

                            {fila.duplicado && (
                              <span className="consolidate-tag consolidate-tag--danger">
                                Duplicado
                              </span>
                            )}

                            {fila.tieneHorasInvalidas && (
                              <span className="consolidate-tag consolidate-tag--warning">
                                Horas incompletas
                              </span>
                            )}

                            {fila.sinIdentificar && (
                              <span className="consolidate-tag consolidate-tag--danger">
                                Sin ID
                              </span>
                            )}
                          </div>

                          {(fila.sustitutoDe || fila.reemplazo) && (
                            <div className="consolidate-worker__substitution">
                              {fila.sustitutoDe && (
                                <span>Sustituto de {fila.sustitutoDe}</span>
                              )}
                              {fila.reemplazo && (
                                <span>Reemplazado por {fila.reemplazo}</span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="consolidate-col--cargo">
                          <span className="consolidate-cargo">{fila.cargo}</span>
                        </td>

                        <td className="consolidate-shifts-cell">
                          {fila.turnos.length === 0 ? (
                            <span className="consolidate-shifts-empty">
                              {fila.ausencia
                                ? `Ausencia: ${fila.ausencia.label}`
                                : "Sin bloques programados"}
                            </span>
                          ) : (
                            <>
                              {fila.turnos.slice(0, 3).map((turno) => (
                                <span
                                  className="consolidate-shift-chip"
                                  key={turno._id}
                                  title={`${nombreEvento(
                                    turno,
                                    catalogs
                                  )} · ${
                                    rangoHorarioTurno(turno, catalogs).texto
                                  }`}
                                >
                                  {nombreEvento(turno, catalogs)} ·{" "}
                                  {rangoHorarioTurno(turno, catalogs).texto}
                                </span>
                              ))}

                              {fila.turnos.length > 3 && (
                                <span className="consolidate-shift-chip consolidate-shift-chip--more">
                                  +{fila.turnos.length - 3} más
                                </span>
                              )}

                              {fila.duplicado && (
                                <span className="consolidate-shifts-warning">
                                  Revise los bloques duplicados
                                </span>
                              )}
                            </>
                          )}
                        </td>

                        <td className="consolidate-col--hours">
                          {formatearDuracion(fila.minutosProgramados)}
                        </td>

                        <td className="consolidate-col--hours">
                          <span
                            className={
                              fila.diferencia === 0
                                ? "consolidate-hours-value"
                                : "consolidate-hours-value consolidate-hours-value--changed"
                            }
                          >
                            {formatearDuracion(fila.minutosConsolidados)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`consolidate-badge ${meta.className}`}
                            title={tituloAuditoria}
                          >
                            {meta.label}
                          </span>

                          {fila.auditoriaEn && (
                            <span className="consolidate-audit">
                              {fila.consolidadoPor || "Auditado"}
                            </span>
                          )}
                        </td>

                        <td
                          className="consolidate-col--actions"
                          onDoubleClick={(evento) => evento.stopPropagation()}
                        >
                          <div className="consolidate-actions">
                            {fila.puedeValidar && (
                              <button
                                type="button"
                                className="consolidate-action consolidate-action--ok"
                                onClick={(evento) => {
                                  evento.stopPropagation();
                                  handleValidarFila(fila);
                                }}
                                disabled={guardando}
                                title="Validar sin novedad"
                                aria-label={`Validar sin novedad a ${fila.nombre}`}
                              >
                                <FiCheck aria-hidden="true" />
                              </button>
                            )}

                            {fila.turnos.length > 0 && (
                              <button
                                type="button"
                                className="consolidate-action"
                                onClick={(evento) => {
                                  evento.stopPropagation();
                                  abrirModal(fila);
                                }}
                                disabled={guardando}
                                title="Abrir consolidación"
                                aria-label={`Abrir consolidación de ${fila.nombre}`}
                              >
                                <FiEdit2 aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>

          {cargando && (
            <div className="consolidate-loading" role="status">
              <span className="consolidate-spinner" aria-hidden="true" />
              Cargando la programación del día...
            </div>
          )}
        </section>

        <p className="consolidate-hint">
          Doble clic en una fila para abrir el detalle del stack. La modal
          muestra el conjunto de bloques programados y permite validarlo o
          construir el stack que realmente se trabajó. Las horas consolidadas
          quedan como base para la nómina. Si reprograma este día en
          MainPlanner, la consolidación se pierde y debe repetirse.
        </p>
      </div>

      <ConsolidateStackModal
        abierto={Boolean(filaModal)}
        fila={filaModal}
        fecha={fecha}
        catalogs={catalogs}
        savedStacks={savedStacks}
        usuario={{ id: idUsuario, nombre: nombreUsuario }}
        onCerrar={cerrarModal}
      />
    </div>
  );
}
