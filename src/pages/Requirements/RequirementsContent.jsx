import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Swal from "sweetalert2";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiEdit3,
  FiFileText,
  FiPlus,
  FiRotateCcw,
  FiSave,
  FiSearch,
  FiSettings,
  FiTrash2,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import { useRequirements } from "../../context/RequirementsProvider";
import { ESTADOS, PRIORIDADES, normalizarTexto } from "./requirementsData";
import {
  anioDeFecha,
  filtrarSolicitudesPorPeriodo,
  obtenerAniosArchivo,
} from "./requirementsYears";
import RequirementDetailModal from "./RequirementDetailModal";
import RequirementFormModal from "./RequirementFormModal";
import RequirementHistoryPanel from "./RequirementHistoryPanel";
import RequirementPersonnelModal from "./RequirementPersonnelModal";
import { CLASE_ESTADO } from "./requirementsView";
import { puedeGestionarProgrammer } from "../Programmer/programmerPermissions";
import "./RequirementsContent.css";

const OPCIONES_ESTADO = ["Todas", ...ESTADOS];

export default function RequirementsContent() {
  const {
    solicitudes,
    cargandoSolicitudes,
    errorSolicitudes,
    recargarSolicitudes,
    departamentos,
    departamentosCargando,
    departamentosError,
    recargarDepartamentos,
    agregarDepartamento,
    renombrarDepartamento,
    eliminarDepartamento,
    crearSolicitud,
    actualizarSolicitud,
    eliminarSolicitud,
  } = useRequirements();

  const [departamentoActivo, setDepartamentoActivo] = useState("todos");
  const [estadoFiltro, setEstadoFiltro] = useState("Todas");
  const [prioridadFiltro, setPrioridadFiltro] = useState("Todas");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const anioActual = useMemo(() => new Date().getFullYear(), []);
  const [periodo, setPeriodo] = useState("vigentes");
  const [anioArchivo, setAnioArchivo] = useState(() => anioActual - 1);
  const [solicitudActivaId, setSolicitudActivaId] = useState(() => {
    if (!solicitudes.length) return null;

    const conMasHistorial = solicitudes.reduce((actual, candidata) =>
      (candidata.historial?.length ?? 0) > (actual.historial?.length ?? 0)
        ? candidata
        : actual
    );

    return conMasHistorial.id;
  });
  const [solicitudAbiertaId, setSolicitudAbiertaId] = useState(null);
  const [personalAbierto, setPersonalAbierto] = useState(null);
  const [mostrarDepartamentos, setMostrarDepartamentos] = useState(false);
  const [nuevoDepartamento, setNuevoDepartamento] = useState("");
  const [departamentoEnEdicion, setDepartamentoEnEdicion] = useState(null);
  const [modalFormulario, setModalFormulario] = useState(null);
  const [guardandoFormulario, setGuardandoFormulario] = useState(false);
  const esGestor = useMemo(() => puedeGestionarProgrammer(), []);

  const mapaDepartamentos = useMemo(
    () => new Map(departamentos.map((departamento) => [departamento.id, departamento.nombre])),
    [departamentos]
  );

  const aniosArchivo = useMemo(
    () => obtenerAniosArchivo(solicitudes, anioActual),
    [solicitudes, anioActual]
  );

  const opcionesAnio = useMemo(() => {
    const anios = new Set(aniosArchivo);
    const anioFecha = anioDeFecha(fechaFiltro);

    if (
      periodo === "archivo" &&
      Number.isInteger(anioArchivo) &&
      (aniosArchivo.length > 0 || anioFecha === anioArchivo)
    ) {
      anios.add(anioArchivo);
    }

    return [...anios].sort((a, b) => b - a);
  }, [aniosArchivo, periodo, anioArchivo, fechaFiltro]);

  const solicitudesPeriodo = useMemo(
    () =>
      filtrarSolicitudesPorPeriodo(solicitudes, {
        periodo,
        anioArchivo,
        anioActual,
      }),
    [solicitudes, periodo, anioArchivo, anioActual]
  );

  useEffect(() => {
    if (periodo !== "archivo") return;
    if (aniosArchivo.length === 0) return;
    if (aniosArchivo.includes(anioArchivo)) return;
    if (fechaFiltro) return;
    setAnioArchivo(aniosArchivo[0]);
  }, [periodo, aniosArchivo, anioArchivo, fechaFiltro]);

  useEffect(() => {
    setSolicitudAbiertaId(null);
    setPersonalAbierto(null);
  }, [periodo, anioArchivo]);

  const totales = useMemo(
    () => ({
      total: solicitudesPeriodo.length,
      pendientes: solicitudesPeriodo.filter((solicitud) => solicitud.estado === "Pendiente").length,
      enRevision: solicitudesPeriodo.filter((solicitud) => solicitud.estado === "En revisión").length,
      aprobadas: solicitudesPeriodo.filter((solicitud) =>
        ["Aprobada", "Agendado"].includes(solicitud.estado)
      ).length,
      agendadas: solicitudesPeriodo.filter(
        (solicitud) => solicitud.estado === "Agendado"
      ).length,
      rechazadas: solicitudesPeriodo.filter((solicitud) => solicitud.estado === "Rechazada").length,
    }),
    [solicitudesPeriodo]
  );

  const solicitudesFiltradas = useMemo(() => {
    const termino = normalizarTexto(busqueda);

    return solicitudesPeriodo.filter((solicitud) => {
      if (
        departamentoActivo !== "todos" &&
        solicitud.departamentoId !== departamentoActivo
      ) {
        return false;
      }

      if (estadoFiltro !== "Todas" && solicitud.estado !== estadoFiltro) {
        return false;
      }

      if (prioridadFiltro !== "Todas" && solicitud.prioridad !== prioridadFiltro) {
        return false;
      }

      if (fechaFiltro && (solicitud.evento?.fecha ?? "") !== fechaFiltro) {
        return false;
      }

      if (!termino) return true;

      const evento = solicitud.evento ?? {};
      const texto = normalizarTexto(
        [
          solicitud.nombre,
          solicitud.codigo,
          evento.programa,
          evento.locacion,
          evento.tipoEvento,
          solicitud.solicitante?.nombre,
          mapaDepartamentos.get(solicitud.departamentoId),
        ].join(" ")
      );

      return texto.includes(termino);
    });
  }, [
    solicitudesPeriodo,
    departamentoActivo,
    estadoFiltro,
    prioridadFiltro,
    fechaFiltro,
    busqueda,
    mapaDepartamentos,
  ]);

  const solicitudActiva =
    solicitudes.find((solicitud) => solicitud.id === solicitudActivaId) ?? null;
  const solicitudAbierta =
    solicitudes.find((solicitud) => solicitud.id === solicitudAbiertaId) ?? null;
  const solicitudPersonal = personalAbierto
    ? solicitudes.find(
        (solicitud) => solicitud.id === personalAbierto.solicitudId
      ) ?? null
    : null;
  const lineaPersonal =
    solicitudPersonal?.personal.find(
      (linea) => linea.rolId === personalAbierto?.rolId
    ) ?? null;

  useEffect(() => {
    if (
      departamentoActivo !== "todos" &&
      !departamentos.some(
        (departamento) => departamento.id === departamentoActivo
      )
    ) {
      setDepartamentoActivo("todos");
    }
  }, [departamentos, departamentoActivo]);

  useEffect(() => {
    const sigueVisible = solicitudesFiltradas.some(
      (solicitud) => solicitud.id === solicitudActivaId
    );

    if (sigueVisible) return;

    setSolicitudActivaId(solicitudesFiltradas[0]?.id ?? null);
  }, [solicitudesFiltradas, solicitudActivaId]);

  useEffect(() => {
    if (!mostrarDepartamentos) return undefined;

    const alPresionarTecla = (evento) => {
      if (evento.key !== "Escape") return;

      setMostrarDepartamentos(false);
      setDepartamentoEnEdicion(null);
      setNuevoDepartamento("");
    };

    window.addEventListener("keydown", alPresionarTecla);
    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, [mostrarDepartamentos]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setEstadoFiltro("Todas");
    setPrioridadFiltro("Todas");
    setFechaFiltro("");
    setDepartamentoActivo("todos");
    setPeriodo("vigentes");
    setAnioArchivo(aniosArchivo[0] ?? anioActual - 1);
  };

  const cambiarPeriodo = (nuevoPeriodo) => {
    setPeriodo(nuevoPeriodo);
    setFechaFiltro("");
  };

  const cambiarAnioArchivo = (valor) => {
    setAnioArchivo(Number(valor));
    setFechaFiltro("");
  };

  const cambiarFechaFiltro = (evento) => {
    const valor = evento.target.value;
    setFechaFiltro(valor);

    const anio = anioDeFecha(valor);
    if (anio === null) return;

    if (anio < anioActual) {
      setPeriodo("archivo");
      setAnioArchivo(anio);
    } else {
      setPeriodo("vigentes");
    }
  };

  const abrirDetalle = (solicitud) => {
    setSolicitudActivaId(solicitud.id);
    setSolicitudAbiertaId(solicitud.id);
  };

  const seleccionarSolicitud = (solicitud) => {
    setSolicitudActivaId(solicitud.id);
  };

  const manejarTeclaFila = (evento, solicitud) => {
    if (evento.key !== "Enter") return;

    evento.preventDefault();
    abrirDetalle(solicitud);
  };

  const cerrarDetalle = () => {
    setSolicitudAbiertaId(null);
    setPersonalAbierto(null);
  };

  const abrirPersonal = (linea) => {
    if (!solicitudAbierta) return;
    setPersonalAbierto({
      solicitudId: solicitudAbierta.id,
      rolId: linea.rolId,
    });
  };

  const cerrarDepartamentos = () => {
    setMostrarDepartamentos(false);
    setDepartamentoEnEdicion(null);
    setNuevoDepartamento("");
  };

  const manejarAgregarDepartamento = async (evento) => {
    evento.preventDefault();

    const resultado = await agregarDepartamento(nuevoDepartamento);

    if (!resultado.ok) {
      toast.error(resultado.mensaje);
      return;
    }

    setNuevoDepartamento("");
    toast.success(resultado.mensaje);
  };

  const manejarRenombrado = async (evento) => {
    evento.preventDefault();
    if (!departamentoEnEdicion) return;

    const resultado = await renombrarDepartamento(
      departamentoEnEdicion.id,
      departamentoEnEdicion.nombre
    );

    if (!resultado.ok) {
      toast.error(resultado.mensaje);
      return;
    }

    setDepartamentoEnEdicion(null);
    toast.success(resultado.mensaje);
  };

  const manejarEliminacion = async (departamento) => {
    const resultado = await Swal.fire({
      icon: "warning",
      title: `¿Eliminar "${departamento.nombre}"?`,
      text: "Solo se eliminan departamentos sin solicitudes asociadas. Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#EB464B",
      cancelButtonColor: "#00094B",
      reverseButtons: true,
      footer: "<h6>Gestión Manager Citytv</h6>",
    });

    if (!resultado.isConfirmed) return;

    const respuesta = await eliminarDepartamento(departamento.id);

    if (!respuesta.ok) {
      toast.error(respuesta.mensaje);
      return;
    }

    if (departamentoActivo === departamento.id) {
      setDepartamentoActivo("todos");
    }

    toast.success(respuesta.mensaje);
  };

  const abrirNuevaSolicitud = () => setModalFormulario({ modo: "crear" });

  const abrirEditarSolicitud = (solicitud) =>
    setModalFormulario({ modo: "editar", solicitud });

  const cerrarFormulario = () => {
    if (guardandoFormulario) return;
    setModalFormulario(null);
  };

  const guardarFormulario = async (payload) => {
    if (!modalFormulario) return;

    setGuardandoFormulario(true);

    try {
      const respuesta =
        modalFormulario.modo === "editar"
          ? await actualizarSolicitud(modalFormulario.solicitud.id, payload)
          : await crearSolicitud(payload);

      if (!respuesta?.ok) {
        toast.error(respuesta?.mensaje || "No se pudo guardar la solicitud");
        return;
      }

      toast.success(
        modalFormulario.modo === "editar"
          ? "Solicitud actualizada"
          : "Solicitud creada"
      );

      if (respuesta.solicitud?.id) {
        setSolicitudActivaId(respuesta.solicitud.id);
      }

      setModalFormulario(null);
    } finally {
      setGuardandoFormulario(false);
    }
  };

  const eliminarSolicitudActiva = async () => {
    if (!solicitudActiva) return;

    const resultado = await Swal.fire({
      icon: "warning",
      title: `¿Eliminar "${solicitudActiva.nombre}"?`,
      text: "Se liberarán sus reservas de equipos. Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#EB464B",
      cancelButtonColor: "#00094B",
      reverseButtons: true,
      footer: "<h6>Gestión Manager Citytv</h6>",
    });

    if (!resultado.isConfirmed) return;

    const respuesta = await eliminarSolicitud(solicitudActiva.id);

    if (!respuesta?.ok) {
      toast.error(respuesta?.mensaje || "No se pudo eliminar la solicitud");
      return;
    }

    toast.success("Solicitud eliminada");
    setSolicitudActivaId(null);
  };

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

  return (
    <div className="requirements-wrapper">
      <div className="requirements-topbar">
        <div className="requirements-topbar__actions">
          <span className="requirements-demo-chip">
            Requirements · solicitudes por área
          </span>

          {esGestor && (
            <button
              type="button"
              className="requirements-btn requirements-btn--primary"
              onClick={abrirNuevaSolicitud}
            >
              <FiPlus aria-hidden="true" />
              Nueva solicitud
            </button>
          )}

          {esGestor && solicitudActiva && (
            <>
              <button
                type="button"
                className="requirements-btn requirements-btn--outline"
                onClick={() => abrirEditarSolicitud(solicitudActiva)}
              >
                <FiEdit3 aria-hidden="true" />
                Editar
              </button>
              <button
                type="button"
                className="requirements-btn requirements-btn--outline"
                onClick={eliminarSolicitudActiva}
              >
                <FiTrash2 aria-hidden="true" />
                Eliminar
              </button>
            </>
          )}

          <button
            type="button"
            className="requirements-btn requirements-btn--outline"
            onClick={() => setMostrarDepartamentos(true)}
          >
            <FiSettings aria-hidden="true" />
            Administrar departamentos
          </button>
        </div>
      </div>

      {cargandoSolicitudes && (
        <p className="requirements-loading-text">Cargando solicitudes…</p>
      )}
      {errorSolicitudes && (
        <div className="requirements-error-banner">
          {errorSolicitudes}
          <button type="button" onClick={recargarSolicitudes}>
            Reintentar
          </button>
        </div>
      )}

      <section className="requirements-kpis" aria-label="Resumen de solicitudes">
        <article className="requirements-kpi requirements-kpi--total">
          <div className="requirements-kpi__icon">
            <FiFileText aria-hidden="true" />
          </div>
          <div className="requirements-kpi__body">
            <span>
              {periodo === "archivo" ? "Total archivadas" : "Total vigentes"}
            </span>
            <strong>{totales.total}</strong>
            <small>
              {periodo === "archivo"
                ? `Archivo ${anioArchivo}`
                : `Año ${anioActual} y futuros`}
            </small>
          </div>
        </article>

        <article className="requirements-kpi requirements-kpi--pending">
          <div className="requirements-kpi__icon">
            <FiClock aria-hidden="true" />
          </div>
          <div className="requirements-kpi__body">
            <span>Pendientes</span>
            <strong>{totales.pendientes}</strong>
            <small>Por revisar y aprobar</small>
          </div>
        </article>

        <article className="requirements-kpi requirements-kpi--review">
          <div className="requirements-kpi__icon">
            <FiRotateCcw aria-hidden="true" />
          </div>
          <div className="requirements-kpi__body">
            <span>En revisión</span>
            <strong>{totales.enRevision}</strong>
            <small>Con ajustes solicitados</small>
          </div>
        </article>

        <article className="requirements-kpi requirements-kpi--approved">
          <div className="requirements-kpi__icon">
            <FiCheckCircle aria-hidden="true" />
          </div>
          <div className="requirements-kpi__body">
            <span>Aprobadas</span>
            <strong>{totales.aprobadas}</strong>
            <small>
              {totales.agendadas} agendada
              {totales.agendadas === 1 ? "" : "s"}
            </small>
          </div>
        </article>

        <article className="requirements-kpi requirements-kpi--rejected">
          <div className="requirements-kpi__icon">
            <FiXCircle aria-hidden="true" />
          </div>
          <div className="requirements-kpi__body">
            <span>Rechazadas</span>
            <strong>{totales.rechazadas}</strong>
            <small>Con observaciones registradas</small>
          </div>
        </article>
      </section>

      <section className="requirements-panel">
        <div className="requirements-tabs" role="tablist" aria-label="Filtrar por departamento">
          <button
            type="button"
            role="tab"
            aria-selected={departamentoActivo === "todos"}
            className={`requirements-tab ${
              departamentoActivo === "todos" ? "requirements-tab--active" : ""
            }`}
            onClick={() => setDepartamentoActivo("todos")}
          >
            Todas
            <span className="requirements-tab__count">{solicitudesPeriodo.length}</span>
          </button>

          {departamentos.map((departamento) => {
            const cantidad = solicitudesPeriodo.filter(
              (solicitud) => solicitud.departamentoId === departamento.id
            ).length;

            return (
              <button
                key={departamento.id}
                type="button"
                role="tab"
                aria-selected={departamentoActivo === departamento.id}
                className={`requirements-tab ${
                  departamentoActivo === departamento.id
                    ? "requirements-tab--active"
                    : ""
                }`}
                onClick={() => setDepartamentoActivo(departamento.id)}
              >
                {departamento.nombre}
                <span className="requirements-tab__count">{cantidad}</span>
              </button>
            );
          })}
        </div>

        <div className="requirements-toolbar">
          <div className="requirements-search">
            <FiSearch aria-hidden="true" />
            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por solicitud, código, programa o solicitante"
              aria-label="Buscar solicitudes"
            />
          </div>

          <div
            className="requirements-status-filters"
            role="group"
            aria-label="Filtrar por estado"
          >
            {OPCIONES_ESTADO.map((estado) => (
              <button
                key={estado}
                type="button"
                className={`requirements-status-chip ${
                  estadoFiltro === estado ? "requirements-status-chip--active" : ""
                }`}
                onClick={() => setEstadoFiltro(estado)}
                aria-pressed={estadoFiltro === estado}
              >
                {estado}
              </button>
            ))}
          </div>

          <div className="requirements-extra-filters">
            <label className="requirements-filter-field">
              <span>Periodo</span>
              <select
                value={periodo}
                onChange={(evento) => cambiarPeriodo(evento.target.value)}
                aria-label="Filtrar por periodo"
              >
                <option value="vigentes">Vigentes</option>
                <option value="archivo">Años anteriores</option>
              </select>
            </label>

            {periodo === "archivo" ? (
              <label className="requirements-filter-field">
                <span>Año</span>
                <select
                  value={anioArchivo}
                  onChange={(evento) => cambiarAnioArchivo(evento.target.value)}
                  disabled={opcionesAnio.length === 0}
                  aria-label="Filtrar por año archivado"
                >
                  {opcionesAnio.length > 0 ? (
                    opcionesAnio.map((anio) => (
                      <option key={anio} value={anio}>
                        {anio}
                      </option>
                    ))
                  ) : (
                    <option value={anioArchivo}>Sin años anteriores</option>
                  )}
                </select>
              </label>
            ) : null}

            <label className="requirements-filter-field">
              <span>Prioridad</span>
              <select
                value={prioridadFiltro}
                onChange={(evento) => setPrioridadFiltro(evento.target.value)}
                aria-label="Filtrar por prioridad"
              >
                <option value="Todas">Todas</option>
                {PRIORIDADES.map((prioridad) => (
                  <option key={prioridad} value={prioridad}>
                    {prioridad}
                  </option>
                ))}
              </select>
            </label>

            <label className="requirements-filter-field">
              <span>Fecha</span>
              <input
                type="date"
                value={fechaFiltro}
                onChange={cambiarFechaFiltro}
                aria-label="Filtrar por fecha del evento"
              />
            </label>

            {fechaFiltro ? (
              <button
                type="button"
                className="requirements-clear-filter"
                onClick={() => setFechaFiltro("")}
                title="Limpiar filtro de fecha"
                aria-label="Limpiar filtro de fecha"
              >
                <FiX aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <span className="requirements-results-count">
            {solicitudesFiltradas.length} de {solicitudesPeriodo.length}
          </span>
        </div>

        <div className="requirements-layout">
          <div className="requirements-list-panel" aria-label="Listado de solicitudes">
            {solicitudesFiltradas.length === 0 ? (
              <div className="requirements-empty">
                <FiAlertTriangle aria-hidden="true" />
                {solicitudesPeriodo.length === 0 ? (
                  <>
                    <h3>
                      {periodo === "archivo"
                        ? "Sin solicitudes archivadas"
                        : "Sin solicitudes vigentes"}
                    </h3>
                    <p>
                      {periodo === "archivo"
                        ? `No hay solicitudes archivadas para ${anioArchivo}.`
                        : "No hay solicitudes vigentes para el periodo actual."}
                    </p>
                    {periodo === "archivo" ? (
                      <button
                        type="button"
                        className="requirements-btn requirements-btn--outline"
                        onClick={() => cambiarPeriodo("vigentes")}
                      >
                        Ver vigentes
                      </button>
                    ) : null}
                  </>
                ) : (
                  <>
                    <h3>Sin resultados</h3>
                    <p>No hay solicitudes que coincidan con los filtros seleccionados.</p>
                    <button
                      type="button"
                      className="requirements-btn requirements-btn--outline"
                      onClick={limpiarFiltros}
                    >
                      Limpiar filtros
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="requirements-list-head" aria-hidden="true">
                  <span>Departamento</span>
                  <span>Nombre</span>
                  <span>Estado</span>
                  <span>Prioridad</span>
                  <span />
                </div>

                <div className="requirements-list">
                  {solicitudesFiltradas.map((solicitud) => {
                    const activa = solicitud.id === solicitudActivaId;
                    const departamento =
                      mapaDepartamentos.get(solicitud.departamentoId) ??
                      "Sin departamento";

                    return (
                      <button
                        key={solicitud.id}
                        type="button"
                        className={`requirements-list-row ${
                          activa ? "requirements-list-row--active" : ""
                        }`}
                        onClick={() => seleccionarSolicitud(solicitud)}
                        onDoubleClick={() => abrirDetalle(solicitud)}
                        onKeyDown={(evento) => manejarTeclaFila(evento, solicitud)}
                        title="Un clic: ver historial · Doble clic: abrir detalle"
                        aria-haspopup="dialog"
                        aria-label={`Seleccionar ${solicitud.nombre} para ver su historial. Doble clic o Enter para abrir el detalle.`}
                      >
                        <span className="requirements-list-row__department">
                          {departamento}
                        </span>
                        <span className="requirements-list-row__name">
                          <strong>{solicitud.nombre}</strong>
                          <small>{solicitud.codigo}</small>
                        </span>
                        <span className="requirements-list-row__status">
                          {badgeEstado(solicitud.estado)}
                        </span>
                        <span className="requirements-list-row__priority">
                          {badgePrioridad(solicitud.prioridad)}
                        </span>
                        <FiChevronRight
                          className="requirements-list-row__chevron"
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <RequirementHistoryPanel
            solicitud={solicitudActiva}
            departamentoNombre={
              solicitudActiva
                ? mapaDepartamentos.get(solicitudActiva.departamentoId) ?? "Sin departamento"
                : "Sin departamento"
            }
            onVerDetalle={() => solicitudActiva && abrirDetalle(solicitudActiva)}
          />
        </div>
      </section>

      {mostrarDepartamentos ? (
        <div
          className="requirements-modal-overlay"
          role="presentation"
          onClick={cerrarDepartamentos}
        >
          <div
            className="requirements-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="requirements-departments-title"
            onClick={(evento) => evento.stopPropagation()}
          >
            <header className="requirements-modal__header">
              <div>
                <h3 id="requirements-departments-title">Administrar departamentos</h3>
                <p>
                  Los departamentos se guardan en la base de datos y se
                  comparten con Programmer.
                </p>
              </div>
              <button
                type="button"
                className="requirements-icon-btn"
                onClick={cerrarDepartamentos}
                aria-label="Cerrar administración de departamentos"
              >
                <FiX aria-hidden="true" />
              </button>
            </header>

            <form className="requirements-department-add" onSubmit={manejarAgregarDepartamento}>
              <input
                type="text"
                value={nuevoDepartamento}
                onChange={(evento) => setNuevoDepartamento(evento.target.value)}
                placeholder="Nombre del nuevo departamento"
                aria-label="Nombre del nuevo departamento"
                maxLength={40}
              />
              <button type="submit" className="requirements-btn requirements-btn--primary">
                <FiPlus aria-hidden="true" />
                Agregar
              </button>
            </form>

            <ul className="requirements-department-list">
              {departamentos.map((departamento) => {
                const cantidad = solicitudes.filter(
                  (solicitud) => solicitud.departamentoId === departamento.id
                ).length;
                const esUnico = departamentos.length <= 1;
                const enUso = cantidad > 0;
                const motivoBloqueo = esUnico
                  ? "Debe existir al menos un departamento"
                  : enUso
                    ? "No puedes eliminar un departamento con solicitudes asociadas"
                    : "";
                const enEdicion = departamentoEnEdicion?.id === departamento.id;

                return (
                  <li key={departamento.id} className="requirements-department-item">
                    {enEdicion ? (
                      <form className="requirements-department-edit" onSubmit={manejarRenombrado}>
                        <input
                          type="text"
                          value={departamentoEnEdicion.nombre}
                          onChange={(evento) =>
                            setDepartamentoEnEdicion({
                              ...departamentoEnEdicion,
                              nombre: evento.target.value,
                            })
                          }
                          maxLength={40}
                          autoFocus
                          aria-label={`Nuevo nombre para ${departamento.nombre}`}
                        />
                        <button
                          type="submit"
                          className="requirements-icon-btn"
                          title="Guardar nombre"
                        >
                          <FiSave aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="requirements-icon-btn"
                          title="Cancelar"
                          onClick={() => setDepartamentoEnEdicion(null)}
                        >
                          <FiX aria-hidden="true" />
                        </button>
                      </form>
                    ) : (
                      <>
                        <div className="requirements-department-info">
                          <strong>{departamento.nombre}</strong>
                          <span>
                            {cantidad} {cantidad === 1 ? "solicitud" : "solicitudes"}
                          </span>
                        </div>
                        <div className="requirements-department-actions">
                          <button
                            type="button"
                            className="requirements-icon-btn"
                            title="Renombrar departamento"
                            aria-label={`Renombrar ${departamento.nombre}`}
                            onClick={() =>
                              setDepartamentoEnEdicion({
                                id: departamento.id,
                                nombre: departamento.nombre,
                              })
                            }
                          >
                            <FiEdit3 aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="requirements-icon-btn requirements-icon-btn--danger"
                            title={motivoBloqueo || "Eliminar departamento"}
                            aria-label={`Eliminar ${departamento.nombre}`}
                            disabled={Boolean(motivoBloqueo)}
                            onClick={() => manejarEliminacion(departamento)}
                          >
                            <FiTrash2 aria-hidden="true" />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>

            {departamentosError ? (
              <div className="requirements-note" role="alert">
                {departamentosError}{" "}
                <button
                  type="button"
                  className="requirements-btn requirements-btn--outline requirements-btn--sm"
                  onClick={recargarDepartamentos}
                >
                  Reintentar
                </button>
              </div>
            ) : null}

            {departamentosCargando ? (
              <p className="requirements-note">Cargando departamentos…</p>
            ) : null}

            <p className="requirements-note">
              Los cambios se guardan en la base de datos. Si renombras un
              departamento, también se actualiza en los requerimientos manuales.
            </p>

            <div className="requirements-modal__actions">
              <button
                type="button"
                className="requirements-btn requirements-btn--outline"
                onClick={cerrarDepartamentos}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {solicitudAbierta ? (
        <RequirementDetailModal
          solicitud={solicitudAbierta}
          departamentoNombre={
            mapaDepartamentos.get(solicitudAbierta.departamentoId) ??
            "Sin departamento"
          }
          onClose={cerrarDetalle}
          onAbrirPersonal={abrirPersonal}
          bloqueado={Boolean(personalAbierto)}
        />
      ) : null}

      {personalAbierto && solicitudPersonal && lineaPersonal ? (
        <RequirementPersonnelModal
          solicitud={solicitudPersonal}
          linea={lineaPersonal}
          onClose={() => setPersonalAbierto(null)}
        />
      ) : null}

      {modalFormulario ? (
        <RequirementFormModal
          key={
            modalFormulario.modo === "editar"
              ? `editar-${modalFormulario.solicitud.id}`
              : "nueva-solicitud"
          }
          solicitud={
            modalFormulario.modo === "editar"
              ? modalFormulario.solicitud
              : null
          }
          departamentos={departamentos}
          guardando={guardandoFormulario}
          onClose={cerrarFormulario}
          onSubmit={guardarFormulario}
        />
      ) : null}

      <Toaster />
    </div>
  );
}

