import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import {
  FiAlertTriangle,
  FiArrowDown,
  FiArrowUp,
  FiCheck,
  FiClock,
  FiEdit3,
  FiInfo,
  FiLayers,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import AvatarPorDefecto from "../../assets/avatar.webp";
import { aFecha, construirCadena, duracionDeTurno } from "../../utils/plannerStack";
import { duracionPrograma, minutosEntreFechas } from "../../utils/stackDuration";
import {
  estadoDiaPrograma,
  mensajeDiaPrograma,
  nombreDiaFecha,
} from "../../utils/programDays";
import {
  ESTADOS_CONSOLIDACION,
  construirActualizacionTurno,
  formatearDuracion,
  formatearHoraCorta,
  horarioEfectivoTurno,
  nombreEvento,
  textoBloques,
  validarTurnosParaConsolidar,
} from "../../utils/consolidation";
import {
  aplicarStack,
  cargarTurnosStack,
  consolidarTurnosStack,
  planificarStack,
} from "../../utils/consolidationStack";

import "./ConsolidateStackModal.css";

const TIPOS = ["Programa", "Secondary", "Requerimiento", "Programmer", "Null", "Custom", "TimeOut"];

const ETIQUETA_TIPO = {
  Programa: "Programa",
  Secondary: "Secondario",
  Requerimiento: "Requerimiento",
  Programmer: "Programador",
  Null: "Null-30",
  Custom: "Custom",
  TimeOut: "TimeOut",
};

const TIPOS_CON_EVENTO = ["Programa", "Secondary", "Requerimiento", "Programmer"];

const claveNueva = (prefijo = "fila") =>
  `${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const textoNombreStack = (valor) =>
  valor === null || valor === undefined ? "" : String(valor).trim();

const escaparHtml = (valor) =>
  String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * SweetAlert2 se monta en <body>; esta clase lo deja por encima de la modal
 * (que tiene z-index 6000), de lo contrario los diálogos quedan ocultos.
 */
const abrirSwal = (opciones = {}) =>
  Swal.fire({
    ...opciones,
    customClass: {
      ...(opciones.customClass ?? {}),
      container: "csm-swal-container",
    },
  });

/** Muestra los errores de la modal en un diálogo, no en un toast. */
const mostrarError = (mensaje) =>
  abrirSwal({
    icon: "error",
    title: "Error",
    text: String(mensaje ?? "Ocurrió un error inesperado."),
    confirmButtonText: "Entendido",
    confirmButtonColor: "#EB464B",
    footer: "<h6>Gestión Manager Citytv</h6>",
  });

const horaDe = (fecha) => formatearHoraCorta(fecha) ?? "";

const conHora = (fechaBase, valorHora) => {
  if (!valorHora || !String(valorHora).includes(":")) return null;

  const [horas, minutos] = String(valorHora).split(":").map(Number);
  if (!Number.isFinite(horas) || !Number.isFinite(minutos)) return null;

  const fecha = new Date(fechaBase ?? new Date());
  fecha.setHours(horas, minutos, 0, 0);
  return fecha;
};

const normalizarTipo = (tipo) => {
  if (TIPOS.includes(tipo)) return tipo;
  if (tipo === "Programa" || tipo === "Requerimiento") return tipo;
  if (tipo === "Null-30") return "Null";
  return tipo ? "Custom" : "Custom";
};

const programasDeTipo = (programs, tipo) => {
  const lista = Array.isArray(programs) ? programs : [];

  if (tipo === "Secondary") {
    return lista.filter((programa) => String(programa?.Type ?? "").trim() === "Secondary");
  }

  if (tipo === "Programa" || tipo === "Requerimiento") {
    return lista.filter((programa) => {
      const tipoPrograma = String(programa?.Type ?? "").trim();
      return tipoPrograma === "Main" || tipoPrograma === "";
    });
  }

  return [];
};

const nombrePrograma = (programa) =>
  programa?.nombre ?? programa?.Nombre ?? programa?._id ?? "Programa";

const nombreProgrammer = (programmer) =>
  programmer?.Nombre ?? programmer?.nombre ?? programmer?._id ?? "Programador";

const buscarPrograma = (programs, id) =>
  (Array.isArray(programs) ? programs : []).find(
    (programa) => String(programa?._id) === String(id)
  );

const buscarProgrammer = (programmers, id) =>
  (Array.isArray(programmers) ? programmers : []).find(
    (programmer) => String(programmer?._id) === String(id)
  );

const duracionPorProgrammer = (programmer) => {
  const minutos = minutosEntreFechas(programmer?.Time_in, programmer?.Time_out);
  return minutos && minutos > 0 ? minutos : 0;
};

const duracionNatural = (fila, catalogs = {}) => {
  if (!fila) return 0;
  const { programs = [], programmers = [] } = catalogs;

  if (fila.tipo === "Null") return 30;
  if (fila.tipo === "Custom" || fila.tipo === "TimeOut") {
    return Number(fila.duracion) || 0;
  }
  if (fila.tipo === "Programa" || fila.tipo === "Secondary" || fila.tipo === "Requerimiento") {
    const programa = buscarPrograma(programs, fila.idPrograma);
    const minutos = duracionPrograma(programa);
    return minutos > 0 ? minutos : Number(fila.duracion) || 0;
  }
  if (fila.tipo === "Programmer") {
    const programmer = buscarProgrammer(programmers, fila.idPrograma);
    const minutos = duracionPorProgrammer(programmer);
    return minutos > 0 ? minutos : Number(fila.duracion) || 0;
  }
  return Number(fila.duracion) || 0;
};

const etiquetaEvento = (fila, catalogs = {}) => {
  if (!fila) return "Sin evento";
  if (fila.tipo === "Null") return "Null-30";
  if (fila.tipo === "TimeOut") return "TimeOut";
  if (fila.tipo === "Custom") return fila.idPrograma || "Custom";
  if (fila.tipo === "Programmer") {
    const programmer = buscarProgrammer(catalogs.programmers, fila.idPrograma);
    return programmer ? nombreProgrammer(programmer) : fila.nombre || "Programador";
  }
  const programa = buscarPrograma(catalogs.programs, fila.idPrograma);
  return programa ? nombrePrograma(programa) : fila.nombre || "Programa";
};

const horaEventoEnFecha = (valorHora, fechaReferencia) => {
  const hora = aFecha(valorHora);
  const referencia = aFecha(fechaReferencia);
  if (!hora || !referencia) return null;

  const fecha = new Date(referencia.getTime());
  fecha.setHours(hora.getHours(), hora.getMinutes(), 0, 0);
  return fecha;
};

/**
 * Valida que la hora real del evento coincida con la hora que ocupa en el
 * stack. Programa/Secondary/Requerimiento usan program.Start; Programmer
 * usa Time_in. Null/Custom/TimeOut no tienen hora fija.
 */
const validarHoraEvento = (fila, tramo, catalogs = {}) => {
  if (!fila || !tramo?.inicio || !tramo?.fin) return "";

  if (
    fila.tipo === "Programa" ||
    fila.tipo === "Secondary" ||
    fila.tipo === "Requerimiento"
  ) {
    const programa = buscarPrograma(catalogs.programs, fila.idPrograma);
    if (!programa) return "";

    const nombre = etiquetaEvento(fila, catalogs);
    const inicioReal = horaEventoEnFecha(programa.Start, tramo.inicio);

    if (!inicioReal) {
      return `${nombre} no tiene una hora de inicio válida.`;
    }

    const diferenciaInicio =
      Math.abs(inicioReal.getTime() - tramo.inicio.getTime()) / 60000;

    if (diferenciaInicio > 1) {
      return `${nombre} inicia a las ${formatearHoraCorta(
        inicioReal
      )}, pero en el stack quedaría a las ${formatearHoraCorta(
        tramo.inicio
      )}. Ajusta la hora inicio o el orden de los eventos.`;
    }

    const finReal = horaEventoEnFecha(programa.End, tramo.fin);
    if (finReal) {
      const diferenciaFin =
        Math.abs(finReal.getTime() - tramo.fin.getTime()) / 60000;

      if (diferenciaFin > 1) {
        return `${nombre} termina a las ${formatearHoraCorta(
          finReal
        )}, pero en el stack quedaría a las ${formatearHoraCorta(
          tramo.fin
        )}.`;
      }
    }

    return "";
  }

  if (fila.tipo === "Programmer") {
    const programmer = buscarProgrammer(catalogs.programmers, fila.idPrograma);
    if (!programmer) return "";

    const nombre = etiquetaEvento(fila, catalogs);
    const inicioReal = horaEventoEnFecha(programmer.Time_in, tramo.inicio);

    if (!inicioReal) {
      return `${nombre} no tiene una hora de inicio válida.`;
    }

    const diferencia =
      Math.abs(inicioReal.getTime() - tramo.inicio.getTime()) / 60000;

    if (diferencia > 1) {
      return `${nombre} inicia a las ${formatearHoraCorta(
        inicioReal
      )}, pero en el stack quedaría a las ${formatearHoraCorta(
        tramo.inicio
      )}. Ajusta la hora inicio o el orden de los eventos.`;
    }
  }

  return "";
};

const inicioEsperadoDeFila = (
  filas,
  indice,
  horaInicio,
  fecha,
  catalogs
) => {
  const inicio = conHora(fecha, horaInicio);
  if (!inicio) return null;
  if (indice <= 0) return inicio;

  const previas = (Array.isArray(filas) ? filas : []).slice(0, indice);
  const duraciones = previas.map((fila) => duracionNatural(fila, catalogs));

  if (duraciones.some((minutos) => minutos <= 0)) return null;

  const cadena = construirCadena(
    previas,
    inicio,
    fecha,
    (_, posicion) => duraciones[posicion]
  );

  return cadena.fin;
};

const crearFilaDesdeTurno = (turno, indice, catalogs) => {
  const horario = horarioEfectivoTurno(turno, catalogs);
  const tipo = normalizarTipo(turno?.Type);

  return {
    key: `base-${turno?._id ?? indice}`,
    idTurno: turno?._id,
    tipo,
    idPrograma: turno?.Event_name ?? "",
    eventId: turno?.ID_event ?? "------",
    idSchema: turno?.Id_Schema ?? "------",
    color: turno?.Color ?? "red",
    observacion: turno?.Observacion ?? "",
    duracion: duracionDeTurno(turno, catalogs) || 30,
    inicio: horario.inicio ?? aFecha(turno?.Inicio_main),
    fin: horario.fin ?? aFecha(turno?.Out),
    nombre: nombreEvento(turno, catalogs),
  };
};

const crearFilasBase = (turnos, catalogs) => {
  const ordenados = (Array.isArray(turnos) ? turnos : [])
    .slice()
    .sort((a, b) => {
      const fechaA = aFecha(a?.Fecha_clave)?.getTime() || 0;
      const fechaB = aFecha(b?.Fecha_clave)?.getTime() || 0;
      if (fechaA !== fechaB) return fechaA - fechaB;

      const indexA = Number(a?.Index);
      const indexB = Number(b?.Index);
      if (Number.isFinite(indexA) && Number.isFinite(indexB) && indexA !== indexB) {
        return indexA - indexB;
      }
      return (
        (aFecha(a?.Inicio_main)?.getTime() || 0) -
        (aFecha(b?.Inicio_main)?.getTime() || 0)
      );
    });

  const filas = ordenados.map((turno, indice) => crearFilaDesdeTurno(turno, indice, catalogs));
  if (filas.length === 0) return [];

  const primerInicio =
    filas[0].inicio ?? aFecha(ordenados[0]?.Inicio_main) ?? aFecha(new Date());
  const cadena = construirCadena(
    filas,
    primerInicio,
    primerInicio,
    (fila) => fila.duracion
  );

  return cadena.filas.map(({ item, inicio, fin }) => ({
    ...item,
    inicio,
    fin,
  }));
};

const crearFilaNueva = (tipo = "Custom") => {
  if (tipo === "Null") {
    return {
      key: claveNueva(),
      tipo,
      idPrograma: "Null-30",
      eventId: "------",
      idSchema: "------",
      color: "red",
      observacion: "",
      duracion: 30,
    };
  }

  if (tipo === "TimeOut") {
    return {
      key: claveNueva(),
      tipo,
      idPrograma: "TimeOut",
      eventId: "------",
      idSchema: "------",
      color: "red",
      observacion: "",
      duracion: 60,
    };
  }

  if (tipo === "Programmer") {
    return {
      key: claveNueva(),
      tipo,
      idPrograma: "",
      eventId: "------",
      idSchema: "------",
      color: "red",
      observacion: "",
      duracion: 0,
    };
  }

  if (tipo === "Programa" || tipo === "Secondary" || tipo === "Requerimiento") {
    return {
      key: claveNueva(),
      tipo,
      idPrograma: "",
      eventId: "------",
      idSchema: "------",
      color: "Brown",
      observacion: "",
      duracion: 0,
    };
  }

  return {
    key: claveNueva(),
    tipo: "Custom",
    idPrograma: "",
    eventId: "------",
    idSchema: "------",
    color: "red",
    observacion: "",
    duracion: 30,
  };
};

const estadoDeTurnos = (turnos = []) => {
  const estados = (Array.isArray(turnos) ? turnos : []).map(
    (turno) => turno?.EstadoConsolidacion
  );
  if (estados.includes(ESTADOS_CONSOLIDACION.NO_LABORADO)) return ESTADOS_CONSOLIDACION.NO_LABORADO;
  if (estados.includes(ESTADOS_CONSOLIDACION.AJUSTADO)) return ESTADOS_CONSOLIDACION.AJUSTADO;
  return ESTADOS_CONSOLIDACION.VALIDADO;
};

const observacionDeTurnos = (turnos = []) =>
  (Array.isArray(turnos) ? turnos : []).find((turno) => turno?.ObservacionConsolidacion)
    ?.ObservacionConsolidacion ?? "";

const validarFilas = (filas, ventana) => {
  if (!filas.length) return "Agrega al menos un evento al stack.";
  if (ventana.error) return ventana.error;

  for (let indice = 0; indice < filas.length; indice += 1) {
    const fila = filas[indice];
    if (
      ["Programa", "Secondary", "Requerimiento", "Programmer", "Custom"].includes(
        fila.tipo
      ) &&
      !String(fila.idPrograma ?? "").trim()
    ) {
      return `Selecciona el evento de la fila #${indice + 1}.`;
    }
  }

  return "";
};

const totalFilas = (filas, catalogs) =>
  (Array.isArray(filas) ? filas : []).reduce((total, fila) => {
    const minutos = minutosEntreFechas(fila?.inicio, fila?.fin);
    return total + (minutos > 0 ? minutos : duracionNatural(fila, catalogs));
  }, 0);

const validarCoherenciaCadena = (cadena) => {
  const filas = Array.isArray(cadena?.filas) ? cadena.filas : [];

  if (filas.length === 0) {
    return { ok: false, detalle: "El stack no tiene eventos." };
  }

  for (let indice = 0; indice < filas.length; indice += 1) {
    const fila = filas[indice];
    const esperado =
      indice === 0 ? cadena.inicio : filas[indice - 1].fin;

    if (!fila.inicio || !fila.fin || !esperado) {
      return {
        ok: false,
        detalle: `El evento #${indice + 1} no tiene horas válidas.`,
      };
    }

    if (Math.abs(fila.inicio.getTime() - esperado.getTime()) > 60000) {
      return {
        ok: false,
        detalle: `El evento #${indice + 1} no comienza donde termina el anterior.`,
      };
    }

    if (fila.fin.getTime() <= fila.inicio.getTime()) {
      return {
        ok: false,
        detalle: `El evento #${indice + 1} termina antes de comenzar.`,
      };
    }
  }

  return { ok: true, detalle: "" };
};

const construirVentana = (filas, horaInicio, horaFin, fecha, catalogs) => {
  const inicio = conHora(fecha, horaInicio);
  const finBase = conHora(fecha, horaFin);

  if (!inicio || !finBase) {
    return {
      error: "Indica una hora de inicio y una hora de fin válidas.",
      filas: [],
      coherente: false,
    };
  }

  const finObjetivo = new Date(finBase.getTime());
  if (finObjetivo.getTime() <= inicio.getTime()) {
    finObjetivo.setDate(finObjetivo.getDate() + 1);
  }

  if (!Array.isArray(filas) || filas.length === 0) {
    return {
      error: "Agrega al menos un evento al stack.",
      filas: [],
      coherente: false,
    };
  }

  const duraciones = filas.map((fila) => duracionNatural(fila, catalogs));

  if (duraciones.some((minutos) => minutos <= 0)) {
    return {
      error: "Hay un evento sin duración válida. Revisa las filas marcadas.",
      filas: [],
      coherente: false,
    };
  }

  const cadena = construirCadena(filas, inicio, fecha, (_, indice) => duraciones[indice]);
  const finCalculado = cadena.fin;
  const coherencia = validarCoherenciaCadena(cadena);
  const erroresFilas = cadena.filas
    .map((tramo) => {
      const mensaje = validarHoraEvento(tramo.item, tramo, catalogs);
      return mensaje ? { key: tramo.item.key, mensaje } : null;
    })
    .filter(Boolean);
  const diferenciaMinutos = finCalculado
    ? Math.abs(finCalculado.getTime() - finObjetivo.getTime()) / 60000
    : Number.POSITIVE_INFINITY;
  const finCoincide = diferenciaMinutos <= 1;
  const total = duraciones.reduce((suma, minutos) => suma + minutos, 0);

  let error = "";

  if (!coherencia.ok) {
    error = coherencia.detalle;
  } else if (erroresFilas.length > 0) {
    error = erroresFilas[0].mensaje;
  } else if (!finCoincide) {
    error = `La cadena de eventos termina a las ${formatearHoraCorta(
      finCalculado
    )}, pero la hora fin indicada es ${formatearHoraCorta(
      finObjetivo
    )}. Ajusta las duraciones o usa el fin calculado.`;
  }

  return {
    error,
    erroresFilas,
    inicio,
    fin: finCalculado,
    finCalculado,
    finObjetivo,
    finCoincide,
    coherente: coherencia.ok,
    total,
    duraciones,
    cadena,
    filas: cadena.filas,
  };
};

const formatearFechaCorta = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
      })
    : "";

const diaLocal = (valor) => {
  const fecha = aFecha(valor) ?? aFecha(new Date());
  const dia = new Date(fecha.getTime());
  dia.setHours(0, 0, 0, 0);
  return dia;
};

export default function ConsolidateStackModal({
  abierto = false,
  fila = null,
  fecha = new Date(),
  catalogs = {},
  savedStacks = [],
  usuario = {},
  onCerrar,
}) {
  const [vista, setVista] = useState("resumen");
  const [fuente, setFuente] = useState("programado");
  const [filas, setFilas] = useState([]);
  const [baseActual, setBaseActual] = useState([]);
  const [stackActual, setStackActual] = useState([]);
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFin, setHoraFin] = useState("16:00");
  const [estado, setEstado] = useState(ESTADOS_CONSOLIDACION.VALIDADO);
  const [observacion, setObservacion] = useState("");
  const [nombreGuardado, setNombreGuardado] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [huboCambiosProgramacion, setHuboCambiosProgramacion] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const filaIdRef = useRef(null);
  const cerrarRef = useRef(null);

  const fotoTrabajador = String(
    fila?.persona?.foto ?? fila?.persona?.Foto ?? ""
  ).trim();
  const avatarSrc =
    !avatarError && fotoTrabajador ? fotoTrabajador : AvatarPorDefecto;

  const filasBase = useMemo(
    () => crearFilasBase(fila?.turnos ?? [], catalogs),
    [fila, catalogs]
  );

  const stacksGuardados = useMemo(() => {
    const grupos = new Map();

    (Array.isArray(savedStacks) ? savedStacks : []).forEach((turno) => {
      const nombre = textoNombreStack(turno?.Nombre_Stack);
      if (!nombre) return;

      if (!grupos.has(nombre)) grupos.set(nombre, []);
      grupos.get(nombre).push(turno);
    });

    return [...grupos.entries()]
      .map(([nombre, turnos]) => ({
        nombre,
        filas: turnos
          .slice()
          .sort((a, b) => Number(a?.Index) - Number(b?.Index))
          .map((turno, indice) => crearFilaDesdeTurno(turno, indice, catalogs)),
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [savedStacks, catalogs]);

  useEffect(() => {
    if (!abierto || !fila) {
      filaIdRef.current = null;
      return;
    }

    if (filaIdRef.current === fila.id) return;
    filaIdRef.current = fila.id;

    const base = crearFilasBase(fila.turnos ?? [], catalogs);
    setFilas(base);
    setBaseActual(base);
    setStackActual(base);
    setFuente("programado");
    setVista("resumen");
    setHoraInicio(horaDe(base[0]?.inicio) || "08:00");
    setHoraFin(horaDe(base[base.length - 1]?.fin) || "16:00");
    setEstado(estadoDeTurnos(fila.turnos));
    setObservacion(observacionDeTurnos(fila.turnos));
    setNombreGuardado("");
    setGuardando(false);
    setHuboCambiosProgramacion(false);
    setAvatarError(false);

    requestAnimationFrame(() => cerrarRef.current?.focus());
  }, [abierto, fila, catalogs]);

  useEffect(() => {
    if (!abierto) return undefined;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const alPresionar = (evento) => {
      if (evento.key === "Escape" && onCerrar) onCerrar();
    };

    document.addEventListener("keydown", alPresionar);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", alPresionar);
    };
  }, [abierto, onCerrar]);

  const ventana = useMemo(
    () => construirVentana(filas, horaInicio, horaFin, fecha, catalogs),
    [filas, horaInicio, horaFin, fecha, catalogs]
  );

  const diaConsolidacion = useMemo(() => nombreDiaFecha(fecha), [fecha]);

  const programasConDia = useMemo(
    () =>
      (Array.isArray(catalogs.programs) ? catalogs.programs : []).map(
        (programa) => ({
          ...programa,
          _dia: estadoDiaPrograma(programa, fecha),
        })
      ),
    [catalogs.programs, fecha]
  );

  const coherenciaStackActual = useMemo(() => {
    if (!stackActual.length) return { error: "" };

    const inicioStack = stackActual[0]?.inicio;
    const finStack = stackActual[stackActual.length - 1]?.fin;

    return construirVentana(
      stackActual,
      horaDe(inicioStack),
      horaDe(finStack),
      fecha,
      catalogs
    );
  }, [stackActual, fecha, catalogs]);

  if (!abierto || !fila) return null;

  const error = ventana.error || validarFilas(filas, ventana);
  const esEditor = vista === "editor";
  const totalResumen = totalFilas(stackActual, catalogs);
  const totalVentana = ventana.total || 0;
  const finDiaSiguiente =
    ventana.fin && ventana.inicio && ventana.fin.getDate() !== ventana.inicio.getDate();

  /** Aviso cuando el evento de la fila no emite el día de la consolidación. */
  const estadoDiaEvento = (item) => {
    if (
      !item ||
      !["Programa", "Secondary", "Requerimiento"].includes(item.tipo)
    ) {
      return null;
    }

    const programa = buscarPrograma(catalogs.programs, item.idPrograma);
    if (!programa) return null;

    const dia = estadoDiaPrograma(programa, fecha);
    if (!dia.configurado || dia.activo) return null;

    return { ...dia, programa, mensaje: mensajeDiaPrograma(programa, fecha) };
  };

  const eventosFueraDeDia = (items) => {
    const vistos = new Set();

    return (Array.isArray(items) ? items : [])
      .map((item) => {
        const aviso = estadoDiaEvento(item);
        if (!aviso) return null;

        const clave = String(item.idPrograma ?? "");
        if (vistos.has(clave)) return null;
        vistos.add(clave);

        return {
          nombre: etiquetaEvento(item, catalogs),
          mensaje: aviso.mensaje,
        };
      })
      .filter(Boolean);
  };

  const confirmarEventosFueraDeDia = async (items) => {
    const avisos = eventosFueraDeDia(items);

    if (avisos.length === 0) return true;

    const confirmacion = await abrirSwal({
      icon: "warning",
      title: "Eventos fuera de su día habitual",
      html: `<p style="text-align:left;margin:0 0 .5rem">La consolidación es del <b>${escaparHtml(
        diaConsolidacion.fechaLarga
      )}</b> y estos eventos no emiten ese día:</p><ul style="text-align:left;margin:0 0 .6rem">${avisos
        .slice(0, 8)
        .map((aviso) => `<li>${escaparHtml(aviso.mensaje)}</li>`)
        .join("")}</ul><p style="text-align:left;margin:0">¿Deseas continuar de todos modos?</p>`,
      showCancelButton: true,
      confirmButtonText: "Continuar de todos modos",
      cancelButtonText: "Revisar stack",
      confirmButtonColor: "#00094B",
      cancelButtonColor: "#EB464B",
      reverseButtons: true,
      focusCancel: true,
      footer: "<h6>Gestión Manager Citytv</h6>",
    });

    return Boolean(confirmacion.isConfirmed);
  };

  const opcionesPrograma = (tipo) => programasDeTipo(programasConDia, tipo);

  const eventosFueraDeDiaFilas = eventosFueraDeDia(filas);

  const usarFinCalculado = () => {
    if (ventana.finCalculado) setHoraFin(horaDe(ventana.finCalculado));
  };

  const actualizarFila = (key, cambios) => {
    setFilas((actuales) =>
      actuales.map((actual) => (actual.key === key ? { ...actual, ...cambios } : actual))
    );
  };

  const handleTipo = (filaActual, tipo) => {
    const nueva = crearFilaNueva(tipo, catalogs);
    actualizarFila(filaActual.key, {
      tipo: nueva.tipo,
      idPrograma: nueva.idPrograma,
      eventId: nueva.eventId,
      idSchema: nueva.idSchema,
      color: nueva.color,
      duracion: nueva.duracion,
      nombre: "",
    });
  };

  const handleEvento = async (filaActual, idPrograma) => {
    const tipo = filaActual.tipo;

    // El select es controlado: al rechazar una selección hay que forzar un
    // render para que vuelva a mostrar el evento que realmente está guardado.
    const restaurarSeleccion = () =>
      setFilas((actuales) =>
        actuales.map((actual) =>
          actual.key === filaActual.key ? { ...actual } : actual
        )
      );

    if (!idPrograma) {
      actualizarFila(filaActual.key, {
        idPrograma: "",
        duracion: 0,
        nombre: "",
      });
      return;
    }

    const programa = buscarPrograma(catalogs.programs, idPrograma);
    const programmer = buscarProgrammer(catalogs.programmers, idPrograma);
    const esEventoDePrograma =
      tipo === "Programa" ||
      tipo === "Secondary" ||
      tipo === "Requerimiento";

    if (esEventoDePrograma && programa) {
      const dia = estadoDiaPrograma(programa, fecha);

      if (dia.configurado && !dia.activo) {
        const confirmacion = await abrirSwal({
          icon: "warning",
          title: "Programa fuera de su día habitual",
          text: `${mensajeDiaPrograma(
            programa,
            fecha
          )} ¿Deseas usarlo de todos modos?`,
          showCancelButton: true,
          confirmButtonText: "Usar de todos modos",
          cancelButtonText: "Elegir otro",
          confirmButtonColor: "#00094B",
          cancelButtonColor: "#EB464B",
          reverseButtons: true,
          focusCancel: true,
          footer: "<h6>Gestión Manager Citytv</h6>",
        });

        if (!confirmacion.isConfirmed) {
          restaurarSeleccion();
          return;
        }
      }
    }

    const indice = filas.findIndex((item) => item.key === filaActual.key);
    const esperado = inicioEsperadoDeFila(
      filas,
      indice,
      horaInicio,
      fecha,
      catalogs
    );

    if (!esperado) {
      mostrarError(
        "Completa los eventos anteriores para validar la hora de este evento."
      );
      restaurarSeleccion();
      return;
    }

    if (esEventoDePrograma) {
      const inicioReal = horaEventoEnFecha(programa?.Start, esperado);

      if (!programa || !inicioReal) {
        mostrarError(
          `El evento ${nombrePrograma(programa)} no tiene una hora de inicio válida.`
        );
        restaurarSeleccion();
        return;
      }

      if (
        Math.abs(inicioReal.getTime() - esperado.getTime()) / 60000 >
        1
      ) {
        mostrarError(
          `${nombrePrograma(programa)} inicia a las ${formatearHoraCorta(
            inicioReal
          )}, pero el stack lo ubicaría a las ${formatearHoraCorta(
            esperado
          )}. Ajusta la hora inicio o elige otro evento.`
        );
        restaurarSeleccion();
        return;
      }
    }

    if (tipo === "Programmer") {
      const inicioReal = horaEventoEnFecha(programmer?.Time_in, esperado);

      if (!programmer || !inicioReal) {
        mostrarError(
          `El programador ${nombreProgrammer(
            programmer
          )} no tiene una hora de inicio válida.`
        );
        restaurarSeleccion();
        return;
      }

      if (
        Math.abs(inicioReal.getTime() - esperado.getTime()) / 60000 >
        1
      ) {
        mostrarError(
          `${nombreProgrammer(programmer)} inicia a las ${formatearHoraCorta(
            inicioReal
          )}, pero el stack lo ubicaría a las ${formatearHoraCorta(
            esperado
          )}. Ajusta la hora inicio o elige otro evento.`
        );
        restaurarSeleccion();
        return;
      }
    }

    const duracion =
      tipo === "Programmer"
        ? duracionPorProgrammer(programmer) || filaActual.duracion
        : duracionPrograma(programa) || filaActual.duracion;

    actualizarFila(filaActual.key, {
      idPrograma,
      duracion,
      nombre: tipo === "Programmer" ? nombreProgrammer(programmer) : nombrePrograma(programa),
    });
  };

  const agregarFila = () => {
    const nueva = crearFilaNueva("Custom", catalogs);
    const finActual = conHora(fecha, horaFin);

    if (finActual) {
      const duracion = duracionNatural(nueva, catalogs) || 30;
      const finExtendido = new Date(finActual.getTime() + duracion * 60000);
      setHoraFin(horaDe(finExtendido));
    }

    setFilas((actuales) => [...actuales, nueva]);
  };

  const eliminarFila = (key) => {
    setFilas((actuales) => actuales.filter((filaActual) => filaActual.key !== key));
  };

  const moverFila = (key, direccion) => {
    setFilas((actuales) => {
      const indice = actuales.findIndex((filaActual) => filaActual.key === key);
      const destino = indice + direccion;
      if (indice < 0 || destino < 0 || destino >= actuales.length) return actuales;
      const copia = [...actuales];
      [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
      return copia;
    });
  };

  const irAEditar = () => {
    const base = stackActual.length > 0 ? stackActual : filasBase;
    setFilas(base);
    setFuente("programado");
    setVista("editor");
    setHoraInicio(horaDe(stackActual[0]?.inicio ?? filasBase[0]?.inicio) || "08:00");
    setHoraFin(
      horaDe(stackActual[stackActual.length - 1]?.fin ?? filasBase[filasBase.length - 1]?.fin) ||
        "16:00"
    );
  };

  const cambiarFuente = (nuevaFuente) => {
    if (nuevaFuente === "programado") {
      const base = baseActual.length > 0 ? baseActual : filasBase;
      setFilas(base);
      setFuente("programado");
      setHoraInicio(horaDe(base[0]?.inicio) || "08:00");
      setHoraFin(horaDe(base[base.length - 1]?.fin) || "16:00");
      return;
    }

    if (nuevaFuente === "guardado") {
      const stack = stacksGuardados.find((item) => item.nombre === nombreGuardado) ?? stacksGuardados[0];
      if (!stack) {
        mostrarError("No hay stacks guardados disponibles.");
        return;
      }

      const inicio = conHora(fecha, horaInicio) ?? new Date(fecha);
      const total = stack.filas.reduce(
        (suma, item) => suma + duracionNatural(item, catalogs),
        0
      );
      const fin = new Date(inicio.getTime() + Math.max(total, 30) * 60000);
      setFilas(stack.filas.map((item) => ({ ...item })));
      setFuente("guardado");
      setNombreGuardado(stack.nombre);
      setHoraFin(horaDe(fin));
      return;
    }

    const nueva = crearFilaNueva("Custom", catalogs);
    const inicio = conHora(fecha, horaInicio) ?? new Date(fecha);
    const fin = new Date(inicio.getTime() + 30 * 60000);
    setFilas([nueva]);
    setFuente("nuevo");
    setHoraFin(horaDe(fin));
  };

  const cargarGuardado = () => {
    const stack = stacksGuardados.find((item) => item.nombre === nombreGuardado) ?? stacksGuardados[0];
    if (!stack) {
      mostrarError("No hay stacks guardados disponibles.");
      return;
    }

    const inicio = conHora(fecha, horaInicio) ?? new Date(fecha);
    const total = stack.filas.reduce(
      (suma, item) => suma + duracionNatural(item, catalogs),
      0
    );
    const fin = new Date(inicio.getTime() + Math.max(total, 30) * 60000);
    setFilas(stack.filas.map((item) => ({ ...item })));
    setFuente("guardado");
    setNombreGuardado(stack.nombre);
    setHoraFin(horaDe(fin));
    toast.success(`Stack "${stack.nombre}" cargado`);
  };

  const restablecer = () => {
    const base = baseActual.length > 0 ? baseActual : filasBase;
    setFilas(base);
    setFuente("programado");
    setHoraInicio(horaDe(base[0]?.inicio) || "08:00");
    setHoraFin(horaDe(base[base.length - 1]?.fin) || "16:00");
    toast.info("Stack programado restablecido");
  };

  const handleValidar = () => {
    if (huboCambiosProgramacion) {
      mostrarError(
        "La programación fue modificada. Debes consolidar como Ajustado y registrar la observación."
      );
      return;
    }

    setEstado(ESTADOS_CONSOLIDACION.VALIDADO);
    toast.success("Turno marcado como validado. Revisa y presiona Consolidar stack.");
  };

  const handleNoLaborado = () => {
    setEstado(ESTADOS_CONSOLIDACION.NO_LABORADO);
    setVista("resumen");
    toast("Turno marcado como No laborado. Registra la observación y consolida.");
  };

  const construirPayloads = () => {
    if (error || !ventana.cadena?.filas?.length) return null;

    const userId = fila?.idUsuario;
    if (!userId) return null;

    const indicesPorDia = new Map();

    return ventana.cadena.filas
      .map(({ item, inicio, fin }) => {
        if (!inicio || !fin) return null;

        const fechaClave = diaLocal(inicio);
        const claveDia = fechaClave.toISOString();
        const index = (indicesPorDia.get(claveDia) ?? 0) + 1;
        indicesPorDia.set(claveDia, index);

        const esPrograma =
          item.tipo === "Programa" ||
          item.tipo === "Secondary" ||
          item.tipo === "Requerimiento";
        const idPrograma =
          item.tipo === "Null"
            ? "Null-30"
            : item.tipo === "TimeOut"
              ? "TimeOut"
              : item.idPrograma;

        return {
          idUser: userId,
          nombres: fila.nombre,
          index,
          idPrograma,
          eventId: item.eventId ?? "------",
          color: item.color || (esPrograma ? "Brown" : "red"),
          observacion: item.observacion ?? "",
          fechaClave,
          idSchema: item.idSchema ?? "------",
          inicioMain: inicio.toISOString(),
          out: fin.toISOString(),
          tipo: item.tipo,
        };
      })
      .filter(Boolean);
  };

  const handleActualizar = async () => {
    if (guardando) return;

    if (error) {
      mostrarError(error);
      return;
    }

    const continuarFueraDeDia = await confirmarEventosFueraDeDia(filas);

    if (!continuarFueraDeDia) return;

    const payloads = construirPayloads();

    if (!payloads?.length) {
      mostrarError("No hay eventos válidos para actualizar el stack.");
      return;
    }

    const userId = fila?.idUsuario;

    if (!userId) {
      mostrarError("El stack no tiene un trabajador asociado.");
      return;
    }

    setGuardando(true);

    try {
      const plan = await planificarStack({
        userId,
        payloads,
        fechas: [fecha],
      });

      const total =
        plan.actualizaciones + plan.eliminaciones + plan.creaciones;

      if (total === 0) {
        toast.info("El stack no tiene cambios para guardar.");
        return;
      }

      const confirmacion = await abrirSwal({
        icon: "warning",
        title: "Actualizar stack programado",
        html: `<p style="text-align:left;margin:0 0 .6rem">Se reutilizarán primero los bloques programados.</p><ul style="text-align:left;margin:0"><li><b>${textoBloques(
          plan.actualizaciones
        )}</b> ${
          plan.actualizaciones === 1 ? "se actualizará" : "se actualizarán"
        }.</li><li><b>${textoBloques(plan.eliminaciones)}</b> ${
          plan.eliminaciones === 1
            ? "sobrante se eliminará"
            : "sobrantes se eliminarán"
        }.</li><li><b>${textoBloques(plan.creaciones)}</b> ${
          plan.creaciones === 1
            ? "adicional se creará"
            : "adicionales se crearán"
        }.</li></ul><p style="text-align:left;margin:.6rem 0 0">Ventana: <b>${formatearHoraCorta(ventana.inicio)} – ${formatearHoraCorta(ventana.fin)}</b> · ${formatearDuracion(ventana.total)}</p>`,
        showCancelButton: true,
        confirmButtonText: "Sí, actualizar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#00094B",
        cancelButtonColor: "#EB464B",
        reverseButtons: true,
        footer: "<h6>Gestión Manager Citytv</h6>",
      });

      if (!confirmacion.isConfirmed) return;

      const resultado = await aplicarStack({
        userId,
        payloads,
        fechas: [fecha],
        confirmarCreacion: true,
      });

      if (!resultado || resultado.requiereConfirmacion) {
        mostrarError("No se pudo actualizar el stack programado.");
        return;
      }

      if (!resultado.turnos?.length) {
        mostrarError("La actualización no devolvió bloques. Revisa la programación.");
        return;
      }

      const nuevaBase = crearFilasBase(resultado.turnos, catalogs);
      setBaseActual(nuevaBase);
      setStackActual(nuevaBase);
      setFilas(nuevaBase);
      setFuente("programado");
      setVista("resumen");
      setEstado(ESTADOS_CONSOLIDACION.AJUSTADO);
      setObservacion("");
      setHuboCambiosProgramacion(true);
      setHoraInicio(horaDe(nuevaBase[0]?.inicio) || "08:00");
      setHoraFin(
        horaDe(nuevaBase[nuevaBase.length - 1]?.fin) || "16:00"
      );

      toast.success(
        `Stack actualizado: ${resultado.actualizados} actualizados, ${resultado.creados} creados, ${resultado.eliminados} eliminados`
      );
    } catch (actualizacionError) {
      console.error("Error al actualizar el stack:", actualizacionError);
      mostrarError(
        actualizacionError?.message ||
          "No se pudo actualizar el stack programado."
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleConsolidar = async () => {
    if (guardando) return;

    if (esEditor) {
      mostrarError("Primero actualiza o cancela la edición del stack.");
      return;
    }

    if (!stackActual.length) {
      mostrarError("No hay bloques en el stack para consolidar.");
      return;
    }

    if (coherenciaStackActual.error) {
      mostrarError(coherenciaStackActual.error);
      return;
    }

    if (
      huboCambiosProgramacion &&
      estado === ESTADOS_CONSOLIDACION.VALIDADO
    ) {
      mostrarError(
        "La programación fue modificada. Consolida como Ajustado y registra la observación."
      );
      return;
    }

    if (
      (estado === ESTADOS_CONSOLIDACION.AJUSTADO ||
        estado === ESTADOS_CONSOLIDACION.NO_LABORADO) &&
      !observacion.trim()
    ) {
      mostrarError("Para Ajustado o No laborado debes registrar una observación.");
      return;
    }

    const userId = fila?.idUsuario;
    const usuarioId = usuario?.id || usuario?._id || "";
    const usuarioNombre = usuario?.nombre || "Administrador";

    if (!userId) {
      mostrarError("El stack no tiene un trabajador asociado.");
      return;
    }

    if (!usuarioId) {
      mostrarError("No se pudo identificar al usuario que consolida.");
      return;
    }

    if (estado !== ESTADOS_CONSOLIDACION.NO_LABORADO) {
      const continuarFueraDeDia = await confirmarEventosFueraDeDia(stackActual);

      if (!continuarFueraDeDia) return;
    }

    setGuardando(true);

    try {
      const fechas = [
        fecha,
        ...stackActual
          .flatMap((item) => [item.inicio, item.fin])
          .filter(Boolean),
      ];
      const turnos = await cargarTurnosStack({ userId, fechas });

      if (!turnos.length) {
        mostrarError("No se encontraron bloques actuales para consolidar.");
        return;
      }

      // Los stacks heredados guardan todos los turnos con la misma
      // Inicio_main; las horas reales por evento se obtienen al encadenar.
      // Valida la cadena, no los solapamientos artificiales del registro crudo.
      const filasValidadas = crearFilasBase(turnos, catalogs);
      const filasPorId = new Map(
        filasValidadas.map((fila) => [String(fila.idTurno), fila])
      );
      const turnosParaValidar = turnos.map((turno, indice) => {
        const fila =
          filasPorId.get(String(turno?._id)) ?? filasValidadas[indice];

        if (!fila) return turno;

        return {
          ...turno,
          Inicio_main: fila.inicio,
          Out: fila.fin,
          Type: turno.Type ?? fila.tipo,
          Event_name: turno.Event_name ?? fila.idPrograma,
        };
      });

      const errorValidacion = validarTurnosParaConsolidar(
        turnosParaValidar,
        catalogs,
        estado
      );

      if (errorValidacion) {
        mostrarError(errorValidacion);
        return;
      }

      const updates = turnos.map((turno) => {
        let minutos = 0;

        if (estado !== ESTADOS_CONSOLIDACION.NO_LABORADO) {
          const reales = minutosEntreFechas(
            turno.Inicio_main,
            turno.Out
          );
          const programados = duracionDeTurno(turno, catalogs);

          minutos =
            estado === ESTADOS_CONSOLIDACION.AJUSTADO
              ? (reales > 0 ? reales : programados)
              : programados;
        }

        return construirActualizacionTurno({
          turno,
          estado,
          observacionConsolidacion: observacion.trim(),
          usuario: { id: usuarioId, nombre: usuarioNombre },
          minutos,
        });
      });

      if (
        estado !== ESTADOS_CONSOLIDACION.NO_LABORADO &&
        updates.some((update) => !(update.minutosConsolidados > 0))
      ) {
        mostrarError(
          "Hay bloques sin duración válida. Ajusta sus horas antes de consolidar."
        );
        return;
      }

      const confirmacion = await abrirSwal({
        icon: "question",
        title: "Consolidar stack",
        html: `<p style="text-align:left;margin:0 0 .6rem">Se consolidarán <b>${textoBloques(
          updates.length
        )}</b> del stack con estado <b>${estado}</b>.</p><p style="text-align:left;margin:0">La programación y la auditoría quedarán guardadas.</p>`,
        showCancelButton: true,
        confirmButtonText: "Sí, consolidar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#2F800D",
        cancelButtonColor: "#EB464B",
        reverseButtons: true,
        footer: "<h6>Gestión Manager Citytv</h6>",
      });

      if (!confirmacion.isConfirmed) return;

      const respuesta = await consolidarTurnosStack(updates);

      if (!respuesta) {
        mostrarError("No se pudo consolidar el stack.");
        return;
      }

      if (Array.isArray(respuesta.fallidos) && respuesta.fallidos.length > 0) {
        await abrirSwal({
          icon: "warning",
          title: "Consolidación incompleta",
          html: `<p style="text-align:left">Se actualizaron <b>${textoBloques(
            respuesta.actualizados ?? 0
          )}</b>. Los siguientes no pudieron guardarse:</p><ul style="text-align:left">${respuesta.fallidos
            .slice(0, 12)
            .map(
              (fallido) =>
                `<li>${String(fallido.id || "Bloque")}: ${String(
                  fallido.mensaje || "No se pudo actualizar"
                )}</li>`
            )
            .join("")}</ul>`,
          confirmButtonText: "Entendido",
          confirmButtonColor: "#00094B",
          footer: "<h6>Gestión Manager Citytv</h6>",
        });
        return;
      }

      toast.success(
        estado === ESTADOS_CONSOLIDACION.NO_LABORADO
          ? "Día consolidado como No laborado"
          : estado === ESTADOS_CONSOLIDACION.AJUSTADO
            ? "Stack consolidado con ajustes"
            : "Stack consolidado sin novedad"
      );

      if (onCerrar) onCerrar();
    } catch (consolidacionError) {
      console.error("Error al consolidar el stack:", consolidacionError);
      mostrarError(
        consolidacionError?.message ||
          "No se pudo consolidar el stack."
      );
    } finally {
      setGuardando(false);
    }
  };

  const cerrar = () => {
    if (onCerrar) onCerrar();
  };

  const renderResumenTabla = (items) => (
    <div className="csm-table-wrap">
      <table className="csm-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Tipo</th>
            <th>Evento</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Min</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, indice) => {
            const inicio = item.inicio ?? null;
            const fin = item.fin ?? null;
            const minutos = minutosEntreFechas(inicio, fin) || item.duracion || 0;
            const avisoDia = estadoDiaEvento(item);
            return (
              <tr
                key={item.key ?? `${item.tipo}-${indice}`}
                className={avisoDia ? "csm-row--warning" : ""}
              >
                <td>{indice + 1}</td>
                <td>
                  <span className={`csm-type csm-type--${(item.tipo ?? "custom").toLowerCase()}`}>
                    {ETIQUETA_TIPO[item.tipo] ?? item.tipo ?? "Custom"}
                  </span>
                </td>
                <td>
                  {etiquetaEvento(item, catalogs)}
                  {avisoDia && (
                    <span className="csm-day-flag" title={avisoDia.mensaje}>
                      <FiAlertTriangle aria-hidden="true" /> No emite este{" "}
                      {diaConsolidacion.corto || "día"}
                    </span>
                  )}
                </td>
                <td>{inicio ? formatearHoraCorta(inicio) : "--:--"}</td>
                <td>{fin ? formatearHoraCorta(fin) : "--:--"}</td>
                <td>{minutos} min</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const contenido = (
    <div
      className="csm-overlay"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) cerrar();
      }}
    >
      <section
        className="csm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="csm-title"
        onMouseDown={(evento) => evento.stopPropagation()}
      >
        <header className="csm-header">
          <div className="csm-avatar">
            <img
              src={avatarSrc}
              alt={fila.nombre ?? "Trabajador"}
              onError={() => setAvatarError(true)}
            />
          </div>

          <div className="csm-identidad">
            <h2 id="csm-title">Consolidar stack</h2>
            <p>
              {fila.nombre ?? "Trabajador"} · {fila.cargo ?? "—"} ·{" "}
              {formatearFechaCorta(fecha)}
            </p>
          </div>

          <span className="csm-diseno">Consolidación</span>

          <button
            ref={cerrarRef}
            type="button"
            className="csm-close"
            onClick={cerrar}
            aria-label="Cerrar"
          >
            <FiX />
          </button>
        </header>

        <div className="csm-body">
          <aside className="csm-summary">
            <div className="csm-card">
              <div className="csm-card-head">
                <div>
                  <span className="csm-eyebrow">Programado</span>
                  <h3>Stack programado</h3>
                </div>
                <span className="csm-count">{stackActual.length} bloques</span>
              </div>

              {stackActual.length > 0 ? (
                renderResumenTabla(stackActual)
              ) : (
                <div className="csm-empty">
                  <FiLayers />
                  <p>No hay bloques programados en esta fecha.</p>
                </div>
              )}

              <div className="csm-total">
                <span>Total del stack</span>
                <strong>{formatearDuracion(totalResumen)}</strong>
              </div>
            </div>

            <div className="csm-card csm-card--muted">
              <div className="csm-card-head">
                <div>
                  <span className="csm-eyebrow">Estado</span>
                  <h3>Consolidación actual</h3>
                </div>
                <span className={`csm-state csm-state--${String(estado).toLowerCase()}`}>
                  {estado}
                </span>
              </div>
              <p className="csm-muted">
                Un turno es el conjunto de bloques del stack. La validación y la
                consolidación se aplican al stack completo, no a un bloque aislado.
              </p>

              {coherenciaStackActual.error && (
                <div className="csm-summary-warning" role="alert">
                  <FiAlertTriangle aria-hidden="true" />
                  <span>{coherenciaStackActual.error}</span>
                </div>
              )}
            </div>
          </aside>

          <main className="csm-content">
            {!esEditor ? (
              <section className="csm-intro">
                <div className="csm-intro-head">
                  <span className="csm-eyebrow">Paso 1 de 2</span>
                  <h3>¿Qué pasó con este turno?</h3>
                  <p>
                    Puedes confirmar que el trabajador cumplió exactamente el stack
                    programado o construir el stack que realmente trabajó.
                  </p>
                </div>

                <div className="csm-choice-grid">
                  <button type="button" className="csm-choice csm-choice--primary" onClick={handleValidar}>
                    <span className="csm-choice-icon">
                      <FiCheck />
                    </span>
                    <span>
                      <strong>Validar turno programado</strong>
                      <small>El trabajador cumplió el stack tal como estaba.</small>
                    </span>
                  </button>

                  <button type="button" className="csm-choice" onClick={irAEditar}>
                    <span className="csm-choice-icon">
                      <FiEdit3 />
                    </span>
                    <span>
                      <strong>Modificar stack</strong>
                      <small>Crear el stack que realmente trabajó.</small>
                    </span>
                  </button>

                  <button type="button" className="csm-choice csm-choice--ghost" onClick={handleNoLaborado}>
                    <span className="csm-choice-icon">
                      <FiAlertTriangle />
                    </span>
                    <span>
                      <strong>No se laboró</strong>
                      <small>El día quedó sin trabajo; se consolidará en cero.</small>
                    </span>
                  </button>
                </div>

                <div className="csm-note">
                  <FiInfo aria-hidden="true" />
                  <p>
                    Al modificar, puedes cargar un stack guardado o construir uno
                    nuevo. No se guarda un stack nuevo desde esta ventana; al
                    actualizar, el stack programado se reemplaza reutilizando sus
                    bloques.
                  </p>
                </div>
              </section>
            ) : (
              <section className="csm-editor">
                <div className="csm-editor-head">
                  <div>
                    <span className="csm-eyebrow">Paso 2 de 2</span>
                    <h3>Stack trabajado</h3>
                    <p>Define la ventana y los eventos que forman el stack.</p>
                  </div>
                  <span className="csm-ajuste">Ajustado</span>
                </div>

                <div className="csm-source-tabs" role="tablist" aria-label="Origen del stack">
                  {[
                    ["programado", "Programado"],
                    ["guardado", "Stack guardado"],
                    ["nuevo", "Nuevo stack"],
                  ].map(([clave, etiqueta]) => (
                    <button
                      key={clave}
                      type="button"
                      role="tab"
                      aria-selected={fuente === clave}
                      className={fuente === clave ? "csm-tab is-active" : "csm-tab"}
                      onClick={() => cambiarFuente(clave)}
                    >
                      {etiqueta}
                    </button>
                  ))}
                </div>

                {diaConsolidacion.fechaLarga && (
                  <div className="csm-day-hint">
                    <FiAlertTriangle aria-hidden="true" />
                    <span>
                      Consolidación del{" "}
                      <strong>{diaConsolidacion.fechaLarga}</strong>. Los
                      programas que no emiten este día aparecen marcados y
                      requieren confirmación.
                      {eventosFueraDeDiaFilas.length > 0
                        ? ` ${eventosFueraDeDiaFilas.length} evento(s) del stack no emiten este día.`
                        : ""}
                    </span>
                  </div>
                )}

                {fuente === "guardado" && (
                  <div className="csm-saved">
                    <label htmlFor="csm-saved-stack">Stack guardado</label>
                    <div className="csm-saved-row">
                      <select
                        id="csm-saved-stack"
                        value={nombreGuardado}
                        onChange={(evento) => setNombreGuardado(evento.target.value)}
                        disabled={stacksGuardados.length === 0}
                      >
                        {stacksGuardados.length === 0 && (
                          <option value="">No hay stacks guardados</option>
                        )}
                        {stacksGuardados.map((stack) => (
                          <option key={stack.nombre} value={stack.nombre}>
                            {stack.nombre}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="csm-btn csm-btn--soft"
                        onClick={cargarGuardado}
                        disabled={stacksGuardados.length === 0}
                      >
                        Cargar
                      </button>
                    </div>
                    <p>No se puede guardar un stack nuevo desde esta ventana.</p>
                  </div>
                )}

                <div className="csm-window">
                  <label>
                    <span>Hora inicio</span>
                    <input
                      type="time"
                      value={horaInicio}
                      onChange={(evento) => setHoraInicio(evento.target.value)}
                    />
                  </label>
                  <div className="csm-window-arrow" aria-hidden="true">
                    <FiClock />
                  </div>
                  <label>
                    <span>Hora fin esperada {finDiaSiguiente ? "(+1 día)" : ""}</span>
                    <input
                      type="time"
                      className={
                        ventana.finCalculado && !ventana.finCoincide ? "is-invalid" : ""
                      }
                      value={horaFin}
                      onChange={(evento) => setHoraFin(evento.target.value)}
                    />
                  </label>
                  <div className="csm-window-total">
                    <span>Duración del stack</span>
                    <strong>{totalVentana ? formatearDuracion(totalVentana) : "—"}</strong>
                  </div>
                </div>

                <div
                  className={`csm-coherence ${
                    ventana.coherente && ventana.finCoincide ? "is-ok" : "is-bad"
                  }`}
                >
                  <span className="csm-coherence-calc">
                    <FiClock aria-hidden="true" />
                    Fin calculado:{" "}
                    <strong>
                      {ventana.finCalculado
                        ? formatearHoraCorta(ventana.finCalculado)
                        : "—"}
                    </strong>
                  </span>

                  {ventana.finCalculado && !ventana.finCoincide && (
                    <button
                      type="button"
                      className="csm-btn csm-btn--soft csm-coherence-btn"
                      onClick={usarFinCalculado}
                    >
                      Usar fin calculado
                    </button>
                  )}

                  <span className="csm-coherence-chip">
                    {ventana.coherente && ventana.finCoincide ? (
                      <>
                        <FiCheck aria-hidden="true" /> Horas encadenadas
                      </>
                    ) : (
                      <>
                        <FiAlertTriangle aria-hidden="true" /> Revisar horas
                      </>
                    )}
                  </span>
                </div>

                <p className="csm-chain-help">
                  Cada Programa, Secondary o Programmer empieza donde termina el
                  evento anterior. La hora fin esperada debe coincidir con el fin
                  calculado.
                </p>

                <div className="csm-table-wrap csm-table-wrap--editor">
                  <table className="csm-table csm-table--editor">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Tipo</th>
                        <th>Evento</th>
                        <th>Duración</th>
                        <th>Inicio</th>
                        <th>Fin</th>
                        <th aria-label="Acciones" />
                      </tr>
                    </thead>
                    <tbody>
                      {filas.map((filaActual, indice) => {
                        const esUltima = indice === filas.length - 1;
                        const tramo = ventana.cadena?.filas?.[indice];
                        const inicioEsperado =
                          indice === 0
                            ? ventana.inicio
                            : ventana.cadena?.filas?.[indice - 1]?.fin;
                        const encadenado =
                          Boolean(tramo?.inicio) &&
                          Boolean(inicioEsperado) &&
                          Math.abs(tramo.inicio.getTime() - inicioEsperado.getTime()) <=
                            60000;
                        const natural = duracionNatural(filaActual, catalogs);
                        const opciones = opcionesPrograma(filaActual.tipo);
                        const puedeEditarDuracion =
                          filaActual.tipo === "Custom" || filaActual.tipo === "TimeOut";
                        const tipoEncadenado = TIPOS_CON_EVENTO.includes(filaActual.tipo);
                        const errorFila = ventana.erroresFilas?.find(
                          (item) => item.key === filaActual.key
                        )?.mensaje;
                        const avisoDia = estadoDiaEvento(filaActual);

                        return (
                          <tr
                            key={filaActual.key}
                            className={
                              errorFila
                                ? "csm-row--invalid"
                                : avisoDia
                                  ? "csm-row--warning"
                                  : ""
                            }
                          >
                            <td className="csm-index">{indice + 1}</td>
                            <td>
                              <select
                                className="csm-select csm-select--tipo"
                                value={filaActual.tipo}
                                onChange={(evento) => handleTipo(filaActual, evento.target.value)}
                                aria-label={`Tipo del evento ${indice + 1}`}
                              >
                                {TIPOS.map((tipo) => (
                                  <option key={tipo} value={tipo}>
                                    {ETIQUETA_TIPO[tipo]}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              {filaActual.tipo === "Custom" ? (
                                <input
                                  className="csm-input"
                                  value={filaActual.idPrograma}
                                  placeholder="Nombre del evento"
                                  onChange={(evento) =>
                                    actualizarFila(filaActual.key, {
                                      idPrograma: evento.target.value,
                                    })
                                  }
                                />
                              ) : TIPOS_CON_EVENTO.includes(filaActual.tipo) ? (
                                <select
                                  className="csm-select"
                                  value={filaActual.idPrograma}
                                  onChange={(evento) =>
                                    handleEvento(filaActual, evento.target.value)
                                  }
                                >
                                  <option value="">Seleccionar evento</option>
                                  {(filaActual.tipo === "Programmer"
                                    ? catalogs.programmers ?? []
                                    : opciones
                                  ).map((opcion) => {
                                    if (filaActual.tipo === "Programmer") {
                                      return (
                                        <option key={opcion._id} value={opcion._id}>
                                          {nombreProgrammer(opcion)}
                                        </option>
                                      );
                                    }

                                    const dia = opcion._dia;
                                    const sufijoDias =
                                      dia?.configurado ? ` · ${dia.resumen}` : "";
                                    const sufijoAviso =
                                      dia?.configurado && !dia.activo
                                        ? ` — No activo este ${
                                            diaConsolidacion.nombre || "día"
                                          }`
                                        : "";

                                    return (
                                      <option key={opcion._id} value={opcion._id}>
                                        {`${nombrePrograma(
                                          opcion
                                        )}${sufijoDias}${sufijoAviso}`}
                                      </option>
                                    );
                                  })}
                                </select>
                              ) : (
                                <span className="csm-fixed-event">
                                  {filaActual.tipo === "Null" ? "Null-30" : "TimeOut"}
                                </span>
                              )}

                              {errorFila && (
                                <span className="csm-row-error">{errorFila}</span>
                              )}

                              {avisoDia && (
                                <span className="csm-row-warning" title={avisoDia.mensaje}>
                                  <FiAlertTriangle aria-hidden="true" />{" "}
                                  {avisoDia.mensaje}
                                </span>
                              )}
                            </td>
                            <td>
                              {puedeEditarDuracion ? (
                                <div className="csm-duration">
                                  <input
                                    type="number"
                                    min="1"
                                    step="5"
                                    value={filaActual.duracion}
                                    onChange={(evento) =>
                                      actualizarFila(filaActual.key, {
                                        duracion: Number(evento.target.value) || 0,
                                      })
                                    }
                                  />
                                  <span>min</span>
                                </div>
                              ) : (
                                <span className="csm-fixed-duration">{natural} min</span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`csm-chain-time ${
                                  errorFila
                                    ? "is-bad"
                                    : encadenado
                                      ? "is-ok"
                                      : "is-bad"
                                }`}
                                title={
                                  errorFila
                                    ? errorFila
                                    : encadenado
                                      ? "Empieza donde termina el evento anterior"
                                      : "No coincide con el fin del evento anterior"
                                }
                              >
                                {tramo?.inicio
                                  ? formatearHoraCorta(tramo.inicio)
                                  : "--:--"}
                                {tipoEncadenado &&
                                  (errorFila || !encadenado ? (
                                    <FiAlertTriangle />
                                  ) : (
                                    <FiCheck />
                                  ))}
                              </span>
                            </td>
                            <td>{tramo?.fin ? formatearHoraCorta(tramo.fin) : "--:--"}</td>
                            <td>
                              <div className="csm-row-actions">
                                <button
                                  type="button"
                                  onClick={() => moverFila(filaActual.key, -1)}
                                  disabled={indice === 0}
                                  title="Subir"
                                >
                                  <FiArrowUp />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moverFila(filaActual.key, 1)}
                                  disabled={esUltima}
                                  title="Bajar"
                                >
                                  <FiArrowDown />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => eliminarFila(filaActual.key)}
                                  title="Eliminar"
                                  className="csm-row-delete"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button type="button" className="csm-add" onClick={agregarFila}>
                  <FiPlus />
                  Agregar evento
                </button>

                {error && (
                  <div className="csm-error" role="alert">
                    <FiAlertTriangle />
                    <span>{error}</span>
                  </div>
                )}

                <div className="csm-preview">
                  <div className="csm-preview-head">
                    <div>
                      <span className="csm-eyebrow">Previsualización</span>
                      <h4>Stack que se generaría</h4>
                    </div>
                    <strong>{totalVentana ? formatearDuracion(totalVentana) : "—"}</strong>
                  </div>

                  <div className="csm-preview-list">
                    {(ventana.cadena?.filas ?? []).map((tramo, indice) => (
                      <div className="csm-preview-item" key={tramo.item.key ?? indice}>
                        <span className="csm-preview-index">{indice + 1}</span>
                        <span className="csm-preview-name">
                          {etiquetaEvento(tramo.item, catalogs)}
                        </span>
                        <span className="csm-preview-time">
                          {tramo.inicio ? formatearHoraCorta(tramo.inicio) : "--:--"} –{" "}
                          {tramo.fin ? formatearHoraCorta(tramo.fin) : "--:--"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>

        <footer className="csm-footer">
          <div className="csm-footer-state">
            <label>
              <span>Estado</span>
              <select
                value={estado}
                onChange={(evento) => setEstado(evento.target.value)}
              >
                <option value={ESTADOS_CONSOLIDACION.VALIDADO}>Validado (sin novedad)</option>
                <option value={ESTADOS_CONSOLIDACION.AJUSTADO}>Ajustado (con novedad)</option>
                <option value={ESTADOS_CONSOLIDACION.NO_LABORADO}>No laborado</option>
              </select>
            </label>

            <label className="csm-footer-observation">
              <span>Observación de consolidación</span>
              <input
                value={observacion}
                onChange={(evento) => setObservacion(evento.target.value)}
                placeholder="Obligatoria para Ajustado o No laborado"
              />
            </label>
          </div>

          <div className="csm-footer-actions">
            {esEditor ? (
              <>
                <button
                  type="button"
                  className="csm-btn csm-btn--ghost"
                  onClick={restablecer}
                  disabled={guardando}
                >
                  Restablecer
                </button>
                <button
                  type="button"
                  className="csm-btn csm-btn--ghost"
                  onClick={() => setVista("resumen")}
                  disabled={guardando}
                >
                  Cancelar edición
                </button>
                <button
                  type="button"
                  className="csm-btn csm-btn--primary"
                  onClick={handleActualizar}
                  disabled={Boolean(error) || guardando}
                >
                  {guardando ? "Guardando..." : "Actualizar programación"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="csm-btn csm-btn--ghost"
                  onClick={cerrar}
                  disabled={guardando}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="csm-btn csm-btn--success"
                  onClick={handleConsolidar}
                  disabled={
                    stackActual.length === 0 ||
                    guardando ||
                    Boolean(coherenciaStackActual.error)
                  }
                  title={
                    coherenciaStackActual.error
                      ? coherenciaStackActual.error
                      : "Consolidar stack"
                  }
                >
                  {guardando ? "Consolidando..." : "Consolidar stack"}
                </button>
              </>
            )}
          </div>
        </footer>
      </section>
    </div>
  );

  if (typeof document === "undefined") return contenido;
  return createPortal(contenido, document.body);
}

ConsolidateStackModal.propTypes = {
  abierto: PropTypes.bool,
  fila: PropTypes.object,
  fecha: PropTypes.instanceOf(Date),
  catalogs: PropTypes.shape({
    programs: PropTypes.array,
    programmers: PropTypes.array,
    stacks: PropTypes.array,
  }),
  savedStacks: PropTypes.array,
  usuario: PropTypes.shape({
    id: PropTypes.string,
    nombre: PropTypes.string,
  }),
  onCerrar: PropTypes.func.isRequired,
};
