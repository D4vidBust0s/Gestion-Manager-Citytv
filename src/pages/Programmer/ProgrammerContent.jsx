import { useEffect, useMemo, useRef, useState } from "react";import { Toaster, toast } from "react-hot-toast";
import Swal from "sweetalert2";
import {
  FiAlertTriangle,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiDownload,
  FiFileText,
  FiInfo,
  FiPlus,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";

import { programmerApi } from "../../api/programmer";
import { imagenEquipoPorId } from "../../api/equipment";
import { useEquipmentAvailability } from "../../Custom_Hooks/useEquipmentAvailability";
import { useProgrammerDepartments } from "../../Custom_Hooks/useProgrammerDepartments";
import { useDebouncedValue } from "../../Custom_Hooks/useDebouncedValue";
import { useProgrammerGroups } from "../../Custom_Hooks/useProgrammerGroups";
import { useProgrammerRequirements } from "../../Custom_Hooks/useProgrammerRequirements";
import { useProgrammerYears } from "../../Custom_Hooks/useProgrammerYears";
import { useRealtimeEvent } from "../../Custom_Hooks/useRealtimeEvent";
import {
  ESTADOS,
  PRIORIDADES,
  normalizarTexto,
} from "../Requirements/requirementsData";
import {
  CLASE_ESTADO,
  formatearFecha,
} from "../Requirements/requirementsView";
import ProgrammerRequirementModal from "./ProgrammerRequirementModal";
import ProgrammerRequirementPanel from "./ProgrammerRequirementPanel";
import ProgrammerPersonnelModal from "./ProgrammerPersonnelModal";
import ProgrammerEquipmentSwapModal from "./ProgrammerEquipmentSwapModal";
import { puedeGestionarProgrammer } from "./programmerPermissions";
import { evaluarEquiposProgrammer } from "./programmerEquipment";
import {
  claveDiaLocal,
  formatearDuracion,
  formularioAPayload,
  parseFechaLocal,
} from "./programmerView";
import "../Requirements/RequirementsContent.css";
import "./ProgrammerContent.css";

const OPCIONES_ESTADO = ["Todas", ...ESTADOS];
const OPCIONES_PRIORIDAD = ["Todas", ...PRIORIDADES];
const TAMANO_PAGINA = 25;

const escaparCsv = (valor) =>
  `"${String(valor ?? "").replace(/"/g, '""')}"`;

const escaparHtml = (valor) =>
  String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

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
 * Requerimientos manuales (Journal → Programmer).
 *
 * Cada registro es a la vez un requerimiento y el evento que ModalPlanner1
 * puede agregar como Type: "Programmer".
 */
export default function ProgrammerContent() {
  const puedeGestionar = useMemo(() => puedeGestionarProgrammer(), []);
  const [fechaClave, setFechaClave] = useState(() =>
    claveDiaLocal(new Date())
  );
  const anioActual = useMemo(() => new Date().getFullYear(), []);
  const [alcance, setAlcance] = useState("dia");
  const [anioArchivo, setAnioArchivo] = useState(() => anioActual - 1);
  const [busqueda, setBusqueda] = useState("");
  const busquedaServidor = useDebouncedValue(busqueda, 300);

  const esDia = alcance === "dia";
  const esAnioActual = alcance === "anio";
  const esArchivo = alcance === "archivo";
  const anioConsulta = esDia
    ? null
    : esAnioActual
      ? anioActual
      : anioArchivo;

  const {
    requerimientos,
    cargando,
    recargando,
    error,
    recargar,
  } = useProgrammerRequirements({
    fechaClave,
    anio: anioConsulta,
    q: busquedaServidor,
  });

  const {
    anios,
    cargando: cargandoAnios,
    recargar: recargarAnios,
  } = useProgrammerYears();

  const aniosAnteriores = useMemo(
    () => anios.filter((item) => item.anio < anioActual),
    [anios, anioActual]
  );

  const {
    grupos,
    cargando: cargandoGrupos,
    error: errorGrupos,
    recargar: recargarGrupos,
  } = useProgrammerGroups();

  const {
    departamentos: departamentosDB,
    error: errorDepartamentos,
    recargar: recargarDepartamentos,
  } = useProgrammerDepartments();

  useRealtimeEvent("programmer:changed", recargar);
  useRealtimeEvent("departments:changed", recargarDepartamentos);

  useEffect(() => {
    if (aniosAnteriores.length === 0) return;

    const existe = aniosAnteriores.some(
      (item) => item.anio === anioArchivo
    );

    if (!existe) setAnioArchivo(aniosAnteriores[0].anio);
  }, [aniosAnteriores, anioArchivo]);

  const [estadoFiltro, setEstadoFiltro] = useState("Todas");
  const [prioridadFiltro, setPrioridadFiltro] = useState("Todas");
  const [departamentoActivo, setDepartamentoActivo] = useState("todos");
  const [seleccionadoId, setSeleccionadoId] = useState(null);
  const [modal, setModal] = useState(null);
  const [personalAsignacion, setPersonalAsignacion] = useState(null);
  const [cambioEquipo, setCambioEquipo] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [pagina, setPagina] = useState(1);

  const seleccionPendienteRef = useRef(null);
  const guardandoRef = useRef(false);
  const eliminandoRef = useRef(false);
  const decidiendoRef = useRef(false);

  const departamentos = useMemo(() => {
    const base = departamentosDB.map((departamento) => departamento.nombre);
    const extras = [
      ...new Set(
        requerimientos
          .map((requerimiento) => requerimiento.departamento)
          .filter(
            (departamento) =>
              departamento &&
              departamento !== "Sin departamento" &&
              !base.includes(departamento)
          )
      ),
    ].sort((a, b) => a.localeCompare(b, "es"));

    const haySinDepartamento = requerimientos.some(
      (requerimiento) => requerimiento.departamento === "Sin departamento"
    );

    return [
      ...base,
      ...extras,
      ...(haySinDepartamento ? ["Sin departamento"] : []),
    ];
  }, [departamentosDB, requerimientos]);

  useEffect(() => {
    if (
      departamentoActivo !== "todos" &&
      !departamentos.includes(departamentoActivo)
    ) {
      setDepartamentoActivo("todos");
    }
  }, [departamentos, departamentoActivo]);

  const lista = useMemo(() => {
    const termino = normalizarTexto(busqueda);

    return requerimientos
      .filter((requerimiento) => {
        if (
          departamentoActivo !== "todos" &&
          requerimiento.departamento !== departamentoActivo
        ) {
          return false;
        }

        if (
          estadoFiltro !== "Todas" &&
          requerimiento.estado !== estadoFiltro
        ) {
          return false;
        }

        if (
          prioridadFiltro !== "Todas" &&
          requerimiento.prioridad !== prioridadFiltro
        ) {
          return false;
        }

        if (!termino) return true;

        const texto = normalizarTexto(
          [
            requerimiento.nombre,
            requerimiento.codigo,
            requerimiento.programa,
            requerimiento.tipoEvento,
            requerimiento.locacion,
            requerimiento.descripcion,
            requerimiento.observacion,
            requerimiento.departamento,
            requerimiento.solicitante?.nombre,
          ].join(" ")
        );

        return texto.includes(termino);
      })
      .sort((a, b) => {
        const fechaA = a.fechaClave || "9999-99-99";
        const fechaB = b.fechaClave || "9999-99-99";
        const horaA = a.horaInicio || "99:99";
        const horaB = b.horaInicio || "99:99";
        return (
          fechaA.localeCompare(fechaB) ||
          horaA.localeCompare(horaB) ||
          a.nombreVisible.localeCompare(b.nombreVisible, "es")
        );
      });
  }, [
    requerimientos,
    busqueda,
    estadoFiltro,
    prioridadFiltro,
    departamentoActivo,
  ]);

  const listaVisible = useMemo(
    () => lista.slice(0, pagina * TAMANO_PAGINA),
    [lista, pagina]
  );

  useEffect(() => {
    setPagina(1);
  }, [
    fechaClave,
    alcance,
    anioConsulta,
    busqueda,
    estadoFiltro,
    prioridadFiltro,
    departamentoActivo,
  ]);

  useEffect(() => {
    if (lista.length === 0) {
      if (seleccionadoId !== null) setSeleccionadoId(null);
      return;
    }

    if (!lista.some((requerimiento) => requerimiento.id === seleccionadoId)) {
      setSeleccionadoId(lista[0].id);
    }
  }, [lista, seleccionadoId]);

  useEffect(() => {
    const idPendiente = seleccionPendienteRef.current;
    if (!idPendiente) return;

    const encontrado = requerimientos.find(
      (requerimiento) => requerimiento.id === idPendiente
    );

    if (encontrado) {
      setSeleccionadoId(encontrado.id);
      seleccionPendienteRef.current = null;
    }
  }, [requerimientos]);

  const totales = useMemo(
    () => ({
      total: requerimientos.length,
      pendientes: requerimientos.filter(
        (requerimiento) => requerimiento.estado === "Pendiente"
      ).length,
      aprobadas: requerimientos.filter((requerimiento) =>
        ["Aprobada", "Agendado"].includes(requerimiento.estado)
      ).length,
      agendadas: requerimientos.filter(
        (requerimiento) => requerimiento.estado === "Agendado"
      ).length,
      listos: requerimientos.filter(
        (requerimiento) => requerimiento.listoPlanner
      ).length,
      minutos: requerimientos.reduce(
        (total, requerimiento) => total + (requerimiento.minutos || 0),
        0
      ),
    }),
    [requerimientos]
  );

  const seleccionado =
    requerimientos.find(
      (requerimiento) => requerimiento.id === seleccionadoId
    ) ?? null;

  const equiposEditables = Boolean(
    seleccionado?.puedeDecidir &&
      puedeGestionar &&
      (seleccionado?.equipos?.length ?? 0) > 0
  );

  const disponibilidadEquipos = useEquipmentAvailability({
    fechaClave: equiposEditables ? seleccionado?.fechaClave : null,
    timeIn: equiposEditables ? seleccionado?.timeIn : null,
    timeOut: equiposEditables ? seleccionado?.timeOut : null,
    incluirNoDisponibles: true,
    excluirOrigenTipo: "Programmer",
    excluirOrigenId: equiposEditables ? seleccionado?.id : "",
  });

  const evaluacionEquipos = useMemo(
    () =>
      evaluarEquiposProgrammer(
        seleccionado?.equipos ?? [],
        disponibilidadEquipos.equipos
      ),
    [seleccionado, disponibilidadEquipos.equipos]
  );

  const equiposValidando = Boolean(
    equiposEditables &&
      (disponibilidadEquipos.cargando || !disponibilidadEquipos.consultado)
  );

  const equiposConError = Boolean(
    equiposEditables && disponibilidadEquipos.error
  );

  const aprobacionBloqueada = Boolean(
    equiposEditables &&
      (equiposValidando ||
        equiposConError ||
        evaluacionEquipos.bloqueado)
  );

  const hayFiltros =
    Boolean(busqueda) ||
    estadoFiltro !== "Todas" ||
    prioridadFiltro !== "Todas" ||
    departamentoActivo !== "todos";

  const fechaLegible = formatearFecha(fechaClave, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const moverDia = (delta) => {
    const fecha = parseFechaLocal(fechaClave) ?? new Date();
    fecha.setDate(fecha.getDate() + delta);
    setFechaClave(claveDiaLocal(fecha));
  };

  const irHoy = () => {
    setAlcance("dia");
    setFechaClave(claveDiaLocal(new Date()));
  };

  const cambiarFecha = (evento) => {
    const valor = evento.target.value;
    if (parseFechaLocal(valor)) setFechaClave(valor);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setEstadoFiltro("Todas");
    setPrioridadFiltro("Todas");
    setDepartamentoActivo("todos");
  };

  const abrirCrear = () => {
    if (!puedeGestionar) {
      toast.error("Tu rol no tiene permiso para crear programadores");
      return;
    }
    setModal({ modo: "crear" });
  };

  const abrirEditar = (requerimiento) => {
    if (!puedeGestionar) {
      toast.error("Tu rol no tiene permiso para editar programadores");
      return;
    }

    setModal({ modo: "editar", requerimiento });
  };

  const cerrarModal = () => {
    if (!guardandoRef.current) setModal(null);
  };

  const guardar = async (formulario, requerimiento) => {
    if (guardandoRef.current) return;

    guardandoRef.current = true;
    setGuardando(true);

    try {
      const esEdicion = Boolean(requerimiento);
      const payload = formularioAPayload(formulario);

      if (esEdicion) {
        payload.revision = requerimiento.revision;
      }

      const guardado = esEdicion
        ? await programmerApi.update(requerimiento.id, payload)
        : await programmerApi.create(payload);

      const idGuardado = String(
        guardado?._id ?? guardado?.id ?? requerimiento?.id ?? ""
      );
      const fechaEvento = formulario.fechaClave;
      const eraFinal = esEdicion && Boolean(requerimiento?.esFinal);
      const anioEvento = Number(String(fechaEvento).slice(0, 4));

      toast.success(
        eraFinal
          ? "Programador actualizado y devuelto a Pendiente"
          : esEdicion
            ? "Programador actualizado"
            : "Programador creado y disponible en Programador de Turnos"
      );

      setModal(null);
      if (idGuardado) seleccionPendienteRef.current = idGuardado;
      recargarAnios();

      if (esDia) {
        if (fechaEvento !== fechaClave) {
          setFechaClave(fechaEvento);
        } else {
          await recargar();
        }
      } else if (anioEvento !== anioConsulta) {
        setAlcance("dia");
        setFechaClave(fechaEvento);
      } else {
        await recargar();
      }
    } catch (errorGuardado) {
      const mensaje =
        errorGuardado?.message || "No se pudo guardar el programador";
      toast.error(mensaje);

      if (/modificado por otro usuario/i.test(mensaje)) {
        setModal(null);
        await recargar();
      }
    } finally {
      guardandoRef.current = false;
      setGuardando(false);
    }
  };

  const decidir = async (requerimiento, estadoNuevo) => {
    if (!puedeGestionar || decidiendoRef.current) return;

    const esAprobacion = estadoNuevo === "Aprobada";
    const equipos = requerimiento.equipos ?? [];
    const hayRestricciones = equipos.some(
      (equipo) => Array.isArray(equipo.restricciones) && equipo.restricciones.length > 0
    );

    const htmlEquipos =
      esAprobacion && equipos.length > 0
        ? `<div class="programmer-approval-equipos">
            <p><strong>Equipos reservados al aprobar</strong></p>
            <ul>
              ${equipos
                .map((equipo) => {
                  const src = imagenEquipoPorId(
                    equipo.inventarioId || equipo.equipoId,
                    equipo.imagenActualizadaEn
                  );
                  const restricciones = (equipo.restricciones ?? [])
                    .map(
                      (restriccion) =>
                        `<li>⚠ ${escaparHtml(restriccion)}</li>`
                    )
                    .join("");

                  return `<li>
                    ${
                      src
                        ? `<img src="${src}" alt="${escaparHtml(
                            equipo.placa || equipo.equipo
                          )}" />`
                        : "<span class='programmer-approval-sin-imagen'>📷</span>"
                    }
                    <div>
                      <strong>${escaparHtml(
                        equipo.placa || equipo.equipo || "Equipo"
                      )}</strong>
                      <span>${escaparHtml(equipo.categoria)}${equipo.subcategoria ? ` · ${escaparHtml(equipo.subcategoria)}` : ""} · ${escaparHtml(
                        equipo.descripcion || equipo.equipo || ""
                      )}</span>
                      ${
                        restricciones
                          ? `<ul class="programmer-approval-restricciones">${restricciones}</ul>`
                          : ""
                      }
                    </div>
                  </li>`;
                })
                .join("")}
            </ul>
            ${
              hayRestricciones
                ? "<p class='programmer-approval-warning'>⚠ Al aprobar confirmas que leíste y aceptas las restricciones.</p>"
                : ""
            }
          </div>`
        : "";

    decidiendoRef.current = true;

    try {
      if (esAprobacion && equipos.length > 0) {
        const chequeo = await disponibilidadEquipos.recargar();

        if (chequeo?.error) {
          toast.error(
            "No se pudo validar la disponibilidad de los equipos. Intenta de nuevo."
          );
          return;
        }

        const evaluacion = evaluarEquiposProgrammer(
          equipos,
          chequeo?.equipos ?? []
        );

        if (evaluacion.bloqueado) {
          toast.error(
            "Aprobación bloqueada: reemplaza los equipos marcados en rojo antes de continuar."
          );
          return;
        }
      }

      const resultado = await Swal.fire({
        icon: "question",
        title: `¿Aprobar "${requerimiento.nombreVisible}"?`,
        html: htmlEquipos || undefined,
        input: "textarea",
        inputLabel: hayRestricciones
          ? "Observación (opcional). Al aprobar confirmas las restricciones."
          : "Observación (opcional)",
        inputPlaceholder: "Puedes dejar una nota de aprobación.",
        showCancelButton: true,
        confirmButtonText: "Sí, aprobar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#00094B",
        cancelButtonColor: "#00094B",
        reverseButtons: true,
        footer: "<h6>Gestión Manager Citytv</h6>",
      });

      if (!resultado.isConfirmed) return;

      const actualizado = await programmerApi.decide(
        requerimiento.id,
        {
          estadoNuevo,
          motivo: String(resultado.value ?? "").trim(),
          revision: requerimiento.revision,
          aceptaRestricciones: esAprobacion ? true : undefined,
        }
      );

      const quedoAgendado =
        actualizado?.Estado === "Agendado" ||
        actualizado?.estado === "Agendado";

      toast.success(
        quedoAgendado
          ? "Programador aprobado y agendado: personal completo"
          : "Programador aprobado y disponible en Programador de Turnos"
      );

      if (actualizado?._id) {
        seleccionPendienteRef.current = String(actualizado._id);
      }
      await recargar();
    } catch (errorDecision) {
      toast.error(
        errorDecision?.message || "No se pudo procesar la decisión"
      );

      if (errorDecision?.status === 409) {
        await recargar();
        await disponibilidadEquipos.recargar();
      }
    } finally {
      decidiendoRef.current = false;
    }
  };

  const eliminar = async (requerimiento) => {
    if (!requerimiento || eliminandoRef.current) return;

    if (!puedeGestionar) {
      toast.error("Tu rol no tiene permiso para eliminar programadores");
      return;
    }

    eliminandoRef.current = true;

    try {
      const resultado = await Swal.fire({
        icon: "warning",
        title: `¿Eliminar "${requerimiento.nombreVisible}"?`,
        text: "Si el programador ya tiene turnos programados, esos turnos no se eliminarán y quedarán sin referencia. Esta acción no se puede deshacer.",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#EB464B",
        cancelButtonColor: "#00094B",
        reverseButtons: true,
        footer: "<h6>Gestión Manager Citytv</h6>",
      });

      if (!resultado.isConfirmed) return;

      setEliminando(true);
      await programmerApi.remove(requerimiento.id);
      toast.success("Programador eliminado");

      if (seleccionadoId === requerimiento.id) setSeleccionadoId(null);
      await recargar();
    } catch (errorEliminar) {
      toast.error(
        errorEliminar?.message || "No se pudo eliminar el programador"
      );
    } finally {
      eliminandoRef.current = false;
      setEliminando(false);
    }
  };

  const abrirCambioEquipo = (linea, indice) => {
    if (!seleccionado || !puedeGestionar || !seleccionado.puedeDecidir) return;
    setCambioEquipo({ indice });
  };

  const cerrarCambioEquipo = () => setCambioEquipo(null);

  const alGuardarCambioEquipo = async (actualizado) => {
    if (actualizado?._id) {
      const idActualizado = String(actualizado._id);
      seleccionPendienteRef.current = idActualizado;
      setSeleccionadoId(idActualizado);
    }

    await recargar();
    setCambioEquipo(null);
  };

  const exportar = () => {
    if (lista.length === 0) {
      toast.error("No hay programadores para exportar");
      return;
    }

    const encabezados = [
      "Código",
      "Nombre",
      "Fecha clave",
      "Hora inicio",
      "Hora fin",
      "Departamento",
      "Prioridad",
      "Estado",
      "Programa",
      "Tipo de evento",
      "Locación",
      "Solicitante",
      "Personal requerido",
      "Equipos requeridos",
      "Descripción",
      "Observación",
    ];

    const filas = lista.map((requerimiento) => [
      requerimiento.codigo,
      requerimiento.nombreVisible,
      requerimiento.fechaClave,
      requerimiento.horaInicio,
      requerimiento.horaFin,
      requerimiento.departamento,
      requerimiento.prioridad,
      requerimiento.estado,
      requerimiento.programa,
      requerimiento.tipoEvento,
      requerimiento.locacion,
      requerimiento.solicitante?.nombre,
      (requerimiento.personal ?? [])
        .map(
          (linea) =>
            `${linea.rol} (${linea.asignados?.length ?? 0}/${linea.cantidad})`
        )
        .join(" | "),
      (requerimiento.equipos ?? [])
        .map((equipo) => `${equipo.equipo} (${equipo.cantidad})`)
        .join(" | "),
      requerimiento.descripcion,
      requerimiento.observacion,
    ]);

    const contenido = [encabezados, ...filas]
      .map((fila) => fila.map(escaparCsv).join(","))
      .join("\r\n");

    const blob = new Blob([`\ufeff${contenido}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `programmer-${
      esDia
        ? fechaClave
        : `${esArchivo ? "archivo" : "anio"}-${anioConsulta}`
    }.csv`;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Programadores exportados");
  };

  return (
    <div className="programmer-wrapper">
      <div className="requirements-topbar programmer-topbar">
        <div className="programmer-date-nav">
          <div
            className="programmer-scope"
            role="group"
            aria-label="Alcance de fechas"
          >
            <button
              type="button"
              className={`programmer-scope__button ${
                esDia ? "is-active" : ""
              }`}
              onClick={() => setAlcance("dia")}
              aria-pressed={esDia}
            >
              Día
            </button>
            <button
              type="button"
              className={`programmer-scope__button ${
                esAnioActual ? "is-active" : ""
              }`}
              onClick={() => setAlcance("anio")}
              aria-pressed={esAnioActual}
            >
              Año actual
            </button>
            <button
              type="button"
              className={`programmer-scope__button ${
                esArchivo ? "is-active" : ""
              }`}
              onClick={() => setAlcance("archivo")}
              aria-pressed={esArchivo}
            >
              Años anteriores
            </button>
          </div>

          {esArchivo ? (
            <label className="programmer-date-nav__field programmer-year-field">
              <span>Año</span>
              <select
                value={anioArchivo}
                onChange={(evento) =>
                  setAnioArchivo(Number(evento.target.value))
                }
                disabled={cargandoAnios || aniosAnteriores.length === 0}
                aria-label="Año archivado"
              >
                {aniosAnteriores.length > 0 ? (
                  aniosAnteriores.map((item) => (
                    <option key={item.anio} value={item.anio}>
                      {item.anio} ({item.total})
                    </option>
                  ))
                ) : (
                  <option value={anioArchivo}>
                    {cargandoAnios ? "Cargando años…" : "Sin años anteriores"}
                  </option>
                )}
              </select>
            </label>
          ) : null}

          <button
            type="button"
            className="programmer-date-nav__button"
            onClick={() => moverDia(-1)}
            title="Día anterior"
            aria-label="Día anterior"
            disabled={!esDia}
          >
            <FiChevronLeft aria-hidden="true" />
          </button>

          <label className="programmer-date-nav__field">
            <span>Fecha</span>
            <input
              type="date"
              value={fechaClave}
              onChange={cambiarFecha}
              aria-label="Fecha de los programadores"
              disabled={!esDia}
            />
          </label>

          <button
            type="button"
            className="programmer-date-nav__button"
            onClick={() => moverDia(1)}
            title="Día siguiente"
            aria-label="Día siguiente"
            disabled={!esDia}
          >
            <FiChevronRight aria-hidden="true" />
          </button>

          <button
            type="button"
            className="requirements-btn requirements-btn--outline requirements-btn--sm"
            onClick={irHoy}
          >
            Hoy
          </button>

          <span className="programmer-date-nav__label">
            {esDia
              ? fechaLegible
              : esAnioActual
                ? `Año ${anioActual}`
                : `Archivo ${anioArchivo}`}
          </span>
        </div>

        <div className="requirements-topbar__actions">
          <button
            type="button"
            className="requirements-btn requirements-btn--outline"
            onClick={exportar}
            disabled={lista.length === 0}
            title="Exportar los programadores filtrados a CSV"
          >
            <FiDownload aria-hidden="true" />
            Exportar
          </button>

          <button
            type="button"
            className="requirements-btn requirements-btn--outline"
            onClick={() => {
              recargar();
              recargarAnios();
            }}
            disabled={recargando}
          >
            <FiRefreshCw
              className={recargando ? "programmer-spin" : ""}
              aria-hidden="true"
            />
            Actualizar
          </button>

          <button
            type="button"
            className="requirements-btn requirements-btn--primary"
            onClick={abrirCrear}
            disabled={!puedeGestionar}
            title={
              puedeGestionar
                ? "Crear un programador manual"
                : "Tu rol no permite crear programadores"
            }
          >
            <FiPlus aria-hidden="true" />
            Nuevo programador
          </button>
        </div>
      </div>

      <div className="programmer-direct-banner" role="note">
        <FiInfo aria-hidden="true" />
        <div>
          <strong>Programación directa</strong>
          <p>
            Al asignar personal desde esta pantalla se crea su turno directo,
            sin stack. Para armar un stack con el evento Programmer, usa
            Programador de Turnos.
          </p>
        </div>
      </div>

      {!puedeGestionar ? (
        <div className="programmer-permission-banner" role="alert">
          <FiAlertTriangle aria-hidden="true" />
          <span>
            Tu rol no permite crear, editar, aprobar ni eliminar
            programadores. Puedes consultar el listado.
          </span>
        </div>
      ) : null}

      <section className="requirements-kpis" aria-label="Resumen de programadores">
        <article className="requirements-kpi">
          <div className="requirements-kpi__icon">
            <FiFileText aria-hidden="true" />
          </div>
          <div className="requirements-kpi__body">
            <span>
              {esDia
                ? "Total del día"
                : esAnioActual
                  ? "Total del año"
                  : "Total archivados"}
            </span>
            <strong>{totales.total}</strong>
            <small>
              {esDia
                ? `${departamentos.length} departamentos disponibles`
                : esAnioActual
                  ? `Año ${anioActual}`
                  : `Archivo ${anioArchivo}`}
            </small>
          </div>
        </article>

        <article className="requirements-kpi requirements-kpi--pending">
          <div className="requirements-kpi__icon">
            <FiAlertTriangle aria-hidden="true" />
          </div>
          <div className="requirements-kpi__body">
            <span>Pendientes</span>
            <strong>{totales.pendientes}</strong>
            <small>Por gestionar</small>
          </div>
        </article>

        <article className="requirements-kpi requirements-kpi--approved">
          <div className="requirements-kpi__icon">
            <FiCheckCircle aria-hidden="true" />
          </div>
          <div className="requirements-kpi__body">
            <span>Aprobados</span>
            <strong>{totales.aprobadas}</strong>
            <small>
              {totales.agendadas} agendado
              {totales.agendadas === 1 ? "" : "s"}
            </small>
          </div>
        </article>

        <article className="requirements-kpi requirements-kpi--review">
          <div className="requirements-kpi__icon">
            <FiCalendar aria-hidden="true" />
          </div>
          <div className="requirements-kpi__body">
            <span>Listos para programación</span>
            <strong>{totales.listos}</strong>
            <small>Con campos completos</small>
          </div>
        </article>

        <article className="requirements-kpi programmer-kpi--hours">
          <div className="requirements-kpi__icon">
            <FiClock aria-hidden="true" />
          </div>
          <div className="requirements-kpi__body">
            <span>Horas programadas</span>
            <strong>{formatearDuracion(totales.minutos)}</strong>
            <small>
              {esDia
                ? "Suma de los eventos del día"
                : esAnioActual
                  ? "Suma de los eventos del año"
                  : "Suma de los eventos archivados"}
            </small>
          </div>
        </article>
      </section>

      <section className="requirements-panel">
        <div
          className="requirements-tabs"
          role="tablist"
          aria-label="Filtrar por departamento"
        >
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
            <span className="requirements-tab__count">
              {requerimientos.length}
            </span>
          </button>

          {departamentos.map((departamento) => {
            const cantidad = requerimientos.filter(
              (requerimiento) =>
                requerimiento.departamento === departamento
            ).length;

            return (
              <button
                key={departamento}
                type="button"
                role="tab"
                aria-selected={departamentoActivo === departamento}
                className={`requirements-tab ${
                  departamentoActivo === departamento
                    ? "requirements-tab--active"
                    : ""
                }`}
                onClick={() => setDepartamentoActivo(departamento)}
              >
                {departamento}
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
              placeholder="Buscar por nombre, código o programa"
              aria-label="Buscar programadores"
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
                  estadoFiltro === estado
                    ? "requirements-status-chip--active"
                    : ""
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
              <span>Prioridad</span>
              <select
                value={prioridadFiltro}
                onChange={(evento) =>
                  setPrioridadFiltro(evento.target.value)
                }
                aria-label="Filtrar por prioridad"
              >
                {OPCIONES_PRIORIDAD.map((prioridad) => (
                  <option key={prioridad} value={prioridad}>
                    {prioridad}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <span className="requirements-results-count">
            {lista.length} de {requerimientos.length}
          </span>
        </div>

        <div className="requirements-layout programmer-layout">
          <div className="requirements-list-panel programmer-list-panel">
            {error ? (
              <div className="programmer-error" role="alert">
                <FiAlertTriangle aria-hidden="true" />
                <div>
                  <strong>No se pudieron cargar los programadores</strong>
                  <p>{error}</p>
                </div>
                <button
                  type="button"
                  className="requirements-btn requirements-btn--outline requirements-btn--sm"
                  onClick={recargar}
                >
                  <FiRefreshCw aria-hidden="true" />
                  Reintentar
                </button>
              </div>
            ) : null}

            {cargando ? (
              <div className="requirements-empty programmer-state">
                <span className="programmer-spinner" aria-hidden="true" />
                <h3>Cargando programadores</h3>
                <p>Consultando los programadores de la fecha.</p>
              </div>
            ) : lista.length === 0 ? (
              <div className="requirements-empty">
                <FiFileText aria-hidden="true" />
                <h3>{hayFiltros ? "Sin resultados" : "Sin programadores"}</h3>
                <p>
                  {hayFiltros
                    ? "No hay programadores que coincidan con los filtros."
                    : esArchivo
                      ? `No hay programadores archivados para ${anioArchivo}.`
                      : esAnioActual
                        ? `No hay programadores registrados en ${anioActual}.`
                        : "Crea el primer programador manual para esta fecha."}
                </p>
                {hayFiltros ? (
                  <button
                    type="button"
                    className="requirements-btn requirements-btn--outline"
                    onClick={limpiarFiltros}
                  >
                    Limpiar filtros
                  </button>
                ) : esArchivo ? (
                  <button
                    type="button"
                    className="requirements-btn requirements-btn--outline"
                    onClick={() => setAlcance("anio")}
                  >
                    Ver año actual
                  </button>
                ) : (
                  <button
                    type="button"
                    className="requirements-btn requirements-btn--primary"
                    onClick={abrirCrear}
                  >
                    <FiPlus aria-hidden="true" />
                    Crear programador
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="programmer-cards">
                  {listaVisible.map((requerimiento) => (
                    <button
                      key={requerimiento.id}
                      type="button"
                      className={`programmer-card ${
                        requerimiento.id === seleccionadoId
                          ? "is-active"
                          : ""
                      }`}
                      onClick={() => setSeleccionadoId(requerimiento.id)}
                      onDoubleClick={() => abrirEditar(requerimiento)}
                      onKeyDown={(evento) => {
                        if (evento.key !== "Enter") return;
                        evento.preventDefault();
                        abrirEditar(requerimiento);
                      }}
                      title="Un clic: ver detalle · Doble clic: editar"
                      aria-haspopup="dialog"
                      aria-label={`Seleccionar ${requerimiento.nombreVisible}. Doble clic o Enter para editar.`}
                    >
                      <span className="programmer-card__top">
                        <span className="programmer-card__title">
                          <span
                            className="programmer-color-dot"
                            style={{ background: requerimiento.color }}
                            aria-hidden="true"
                          />
                          <strong>{requerimiento.nombreVisible}</strong>
                        </span>
                        <span className="programmer-card__status">
                          {badgeEstado(requerimiento.estado)}
                        </span>
                      </span>

                      <span className="programmer-card__meta">
                        <span>{requerimiento.departamento}</span>
                        <span>
                          {!esDia
                            ? `${formatearFecha(requerimiento.fechaClave, {
                                day: "2-digit",
                                month: "short",
                              })} · `
                            : ""}
                          {requerimiento.codigo || "Sin código"}
                        </span>
                        <span>
                          {requerimiento.horaInicio || "--:--"} a{" "}
                          {requerimiento.horaFin || "--:--"}
                        </span>
                      </span>

                      <span className="programmer-card__footer">
                        {badgePrioridad(requerimiento.prioridad)}

                        {requerimiento.estado === "Aprobada" ? (
                          <span className="programmer-agenda-chip is-pending">
                            Sin agendar
                          </span>
                        ) : requerimiento.estado === "Agendado" ? (
                          <span className="programmer-agenda-chip is-ok">
                            Agendado
                          </span>
                        ) : null}

                        <span
                          className={`programmer-ready ${
                            requerimiento.listoPlanner ? "is-ok" : "is-warn"
                          }`}
                          title={
                            requerimiento.listoPlanner
                              ? "Tiene todos los campos que requiere Programador de Turnos"
                              : `Faltan: ${requerimiento.faltantesPlanner.join(
                                  ", "
                                )}`
                          }
                        >
                          {requerimiento.listoPlanner ? (
                            <FiCheckCircle aria-hidden="true" />
                          ) : (
                            <FiAlertTriangle aria-hidden="true" />
                          )}
                          {requerimiento.listoPlanner ? "Listo" : "Revisar"}
                        </span>

                        <FiChevronRight
                          className="programmer-card__chevron"
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                  ))}

                  {listaVisible.length < lista.length ? (
                    <div className="programmer-load-more">
                      <button
                        type="button"
                        className="requirements-btn requirements-btn--outline requirements-btn--sm"
                        onClick={() => setPagina((actual) => actual + 1)}
                      >
                        Cargar más ({lista.length - listaVisible.length}{" "}
                        restantes)
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>

          <ProgrammerRequirementPanel
            requerimiento={seleccionado}
            puedeGestionar={puedeGestionar}
            onEditar={() => seleccionado && abrirEditar(seleccionado)}
            onEliminar={() => seleccionado && eliminar(seleccionado)}
            onDecision={decidir}
            onAsignarPersonal={(linea) => {
              if (!seleccionado) return;
              if (!seleccionado.puedeAsignar) {
                toast.error(
                  "La asignación de personal no está disponible para este estado"
                );
                return;
              }
              setPersonalAsignacion({ requerimiento: seleccionado, linea });
            }}
            eliminando={eliminando}
            equiposEstado={evaluacionEquipos.lineas}
            equiposValidando={equiposValidando}
            equiposError={equiposConError ? disponibilidadEquipos.error : null}
            aprobacionBloqueada={aprobacionBloqueada}
            puedeCambiarEquipo={Boolean(
              seleccionado?.puedeDecidir && puedeGestionar
            )}
            onCambiarEquipo={abrirCambioEquipo}
            onReintentarEquipos={disponibilidadEquipos.recargar}
          />
        </div>
      </section>

      {cambioEquipo && seleccionado ? (
        <ProgrammerEquipmentSwapModal
          key={`swap-${seleccionado.id}-${cambioEquipo.indice}`}
          requerimiento={seleccionado}
          indice={cambioEquipo.indice}
          motivo={evaluacionEquipos.lineas[cambioEquipo.indice]?.motivo ?? ""}
          equipos={(disponibilidadEquipos.equipos ?? []).filter(
            (equipo) => equipo.disponible
          )}
          cargando={disponibilidadEquipos.cargando}
          error={disponibilidadEquipos.error}
          onRecargar={() => {
            disponibilidadEquipos.recargar();
            recargar();
          }}
          onClose={cerrarCambioEquipo}
          onGuardado={alGuardarCambioEquipo}
        />
      ) : null}

      {modal ? (
        <ProgrammerRequirementModal
          key={
            modal.modo === "editar"
              ? `editar-${modal.requerimiento.id}`
              : "nuevo"
          }
          requerimiento={
            modal.modo === "editar" ? modal.requerimiento : null
          }
          fechaInicial={esDia ? fechaClave : claveDiaLocal(new Date())}
          guardando={guardando}
          grupos={grupos}
          gruposCargando={cargandoGrupos}
          gruposError={errorGrupos}
          onRecargarGrupos={recargarGrupos}
          departamentos={departamentosDB}
          departamentosError={errorDepartamentos}
          onClose={cerrarModal}
          onSubmit={(formulario) =>
            guardar(
              formulario,
              modal.modo === "editar" ? modal.requerimiento : null
            )
          }
        />
      ) : null}

      {personalAsignacion ? (
        <ProgrammerPersonnelModal
          key={`${personalAsignacion.requerimiento.id}-${personalAsignacion.linea.rolId}`}
          requerimiento={personalAsignacion.requerimiento}
          linea={personalAsignacion.linea}
          onClose={() => setPersonalAsignacion(null)}
          onAsignado={(actualizado) => {
            setPersonalAsignacion(null);
            if (actualizado?._id) {
              seleccionPendienteRef.current = String(actualizado._id);
            }
            recargar();
          }}
        />
      ) : null}

      <Toaster />
    </div>
  );
}
