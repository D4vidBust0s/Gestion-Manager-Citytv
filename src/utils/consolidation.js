/**
 * Reglas puras de la pantalla Consolidate.
 *
 * No depende de React ni de la API: recibe listas ya cargadas y devuelve las
 * filas por trabajador, los resúmenes y los payloads de actualización.
 *
 * Principio clave: Consolidate solo actualiza turnos existentes de /shifts.
 * Aquí no se construye ningún POST ni DELETE.
 */

import {
  aFecha,
  duracionDeTurno,
  formatearMinutos,
  mismoDia,
} from "./plannerStack";
import { minutosEntreFechas } from "./stackDuration";
import { claveDiaLocal } from "./plannerCoverage";
import { obtenerEstadoAusencia } from "./absenceStatus";
import { isBalancerUser } from "../api/payroll";

export const ESTADOS_CONSOLIDACION = {
  PENDIENTE: "Pendiente",
  VALIDADO: "Validado",
  AJUSTADO: "Ajustado",
  NO_LABORADO: "NoLaborado",
};

export const ESTADOS_CONSOLIDACION_LISTA = Object.values(
  ESTADOS_CONSOLIDACION
);

export const PLANNERS = ["Todos", "MainPlanner", "MainPlanner +"];

export const META_ESTADO = {
  Pendiente: {
    label: "Pendiente",
    className: "consolidate-badge--pending",
  },
  Parcial: {
    label: "Parcial",
    className: "consolidate-badge--partial",
  },
  Validado: {
    label: "Validado",
    className: "consolidate-badge--ok",
  },
  Ajustado: {
    label: "Ajustado",
    className: "consolidate-badge--adjusted",
  },
  NoLaborado: {
    label: "No laborado",
    className: "consolidate-badge--absent",
  },
  SinTurno: {
    label: "Sin programación",
    className: "consolidate-badge--empty",
  },
  Ausencia: {
    label: "Ausencia",
    className: "consolidate-badge--absence",
  },
};

const ESTADO_PESO = {
  Parcial: 0,
  Pendiente: 1,
  Ajustado: 2,
  NoLaborado: 3,
  Validado: 4,
  Ausencia: 5,
  SinTurno: 6,
};

/* ==========================================
   TEXTO Y FECHAS
   ========================================== */

const texto = (valor) =>
  valor === null || valor === undefined ? "" : String(valor).trim();

export const normalizarTexto = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const dosDigitos = (valor) => String(valor).padStart(2, "0");

/** YYYY-MM-DD local, listo para un input type="date". */
export const isoDiaLocal = (fecha) => claveDiaLocal(fecha) ?? "";

/** Date local a medianoche a partir de YYYY-MM-DD. */
export const fechaDesdeIsoDia = (valor) => {
  if (!valor) return null;

  const partes = String(valor).split("-").map(Number);
  if (partes.length !== 3 || partes.some((parte) => !Number.isFinite(parte))) {
    return null;
  }

  const [anio, mes, dia] = partes;
  const fecha = new Date(anio, mes - 1, dia);
  fecha.setHours(0, 0, 0, 0);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

/** Ayer a medianoche local. */
export const ayerLocal = () => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - 1);
  fecha.setHours(0, 0, 0, 0);
  return fecha;
};

/** Devuelve el mensaje de error o null si la fecha se puede consolidar. */
export const validarFechaConsolidacion = (fecha, hoy = new Date()) => {
  const valor = aFecha(fecha);
  if (!valor) return "La fecha seleccionada no es válida.";

  const dia = new Date(valor.getTime());
  dia.setHours(0, 0, 0, 0);

  const limite = new Date(hoy.getTime());
  limite.setHours(0, 0, 0, 0);

  if (dia.getTime() > limite.getTime()) {
    return "No se puede consolidar una fecha futura.";
  }

  return null;
};

export const formatearFecha = (fecha) => {
  const valor = aFecha(fecha);
  if (!valor) return "Fecha no válida";

  return valor.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatearFechaHora = (fecha) => {
  const valor = aFecha(fecha);
  if (!valor) return "Sin fecha";

  return valor.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ==========================================
   ESTADOS
   ========================================== */

export const estadoTurno = (turno) => {
  const valor = texto(turno?.EstadoConsolidacion);

  if (ESTADOS_CONSOLIDACION_LISTA.includes(valor)) return valor;

  // Compatibilidad con documentos anteriores a los campos nuevos.
  return turno?.Consolidado
    ? ESTADOS_CONSOLIDACION.VALIDADO
    : ESTADOS_CONSOLIDACION.PENDIENTE;
};

export const turnoConsolidado = (turno) =>
  estadoTurno(turno) !== ESTADOS_CONSOLIDACION.PENDIENTE;

/** Estado agregado de todos los turnos de un trabajador en el día. */
export const estadoFila = (turnos = []) => {
  const lista = Array.isArray(turnos) ? turnos : [];
  if (lista.length === 0) return "SinTurno";

  const estados = lista.map(estadoTurno);
  const consolidados = estados.filter(
    (estado) => estado !== ESTADOS_CONSOLIDACION.PENDIENTE
  );

  if (consolidados.length === 0) return ESTADOS_CONSOLIDACION.PENDIENTE;
  if (consolidados.length < estados.length) return "Parcial";

  if (estados.some((estado) => estado === ESTADOS_CONSOLIDACION.NO_LABORADO)) {
    return ESTADOS_CONSOLIDACION.NO_LABORADO;
  }

  if (estados.some((estado) => estado === ESTADOS_CONSOLIDACION.AJUSTADO)) {
    return ESTADOS_CONSOLIDACION.AJUSTADO;
  }

  return ESTADOS_CONSOLIDACION.VALIDADO;
};

/* ==========================================
   DURACIONES Y HORARIOS
   ========================================== */

const buscarPrograma = (turno, catalogs = {}) =>
  (Array.isArray(catalogs.programs) ? catalogs.programs : []).find(
    (programa) =>
      String(programa?._id ?? "") === String(turno?.Event_name ?? "")
  );

const buscarProgrammer = (turno, catalogs = {}) =>
  (Array.isArray(catalogs.programmers) ? catalogs.programmers : []).find(
    (programmer) =>
      String(programmer?._id ?? "") === String(turno?.Event_name ?? "")
  );

/** Minutos que la programación original asigna al turno. */
export const minutosProgramadosTurno = (turno, catalogs = {}) => {
  const minutos = duracionDeTurno(turno, catalogs);
  return Number.isFinite(minutos) && minutos > 0 ? Math.round(minutos) : 0;
};

/** Minutos consolidados: el snapshot guardado manda; si no, los programados. */
export const minutosConsolidadosTurno = (turno, catalogs = {}) => {
  const snapshot = turno?.MinutosConsolidados;

  if (snapshot !== null && snapshot !== undefined && snapshot !== "") {
    const numero = Number(snapshot);
    if (Number.isFinite(numero) && numero >= 0) return Math.round(numero);
  }

  if (estadoTurno(turno) === ESTADOS_CONSOLIDACION.NO_LABORADO) return 0;

  return minutosProgramadosTurno(turno, catalogs);
};

export const fechaTurno = (turno) => ({
  inicio: aFecha(turno?.Inicio_main),
  fin: aFecha(turno?.Out),
});

const combinarDiaConHora = (fechaBase, valorHora) => {
  const base = aFecha(fechaBase);
  const hora = aFecha(valorHora);

  if (!base || !hora) return null;

  const resultado = new Date(base.getTime());
  resultado.setHours(hora.getHours(), hora.getMinutes(), hora.getSeconds(), 0);
  return resultado;
};

/**
 * Horas efectivas del turno, incluyendo eventos de catálogo cuyo Out es
 * "------". La fecha de referencia es Fecha_clave (o Inicio_main si existe).
 */
export const horarioEfectivoTurno = (turno, catalogs = {}) => {
  const tipo = texto(turno?.Type);
  const duracion = minutosProgramadosTurno(turno, catalogs);
  const { inicio, fin } = fechaTurno(turno);

  let inicioFinal = inicio;

  if (!inicioFinal && (tipo === "Programa" || tipo === "Secondary")) {
    inicioFinal = combinarDiaConHora(
      turno?.Fecha_clave,
      buscarPrograma(turno, catalogs)?.Start
    );
  }

  if (!inicioFinal && tipo === "Programmer") {
    inicioFinal = combinarDiaConHora(
      turno?.Fecha_clave,
      buscarProgrammer(turno, catalogs)?.Time_in
    );
  }

  let finFinal = fin;

  if (!finFinal && inicioFinal && duracion > 0) {
    finFinal = new Date(inicioFinal.getTime() + duracion * 60000);
  }

  if (!finFinal && (tipo === "Programa" || tipo === "Secondary")) {
    const programa = buscarPrograma(turno, catalogs);
    finFinal = combinarDiaConHora(turno?.Fecha_clave, programa?.End);

    if (finFinal && inicioFinal && finFinal.getTime() <= inicioFinal.getTime()) {
      finFinal = new Date(finFinal.getTime() + 24 * 60 * 60000);
    }
  }

  if (!finFinal && tipo === "Programmer") {
    const programmer = buscarProgrammer(turno, catalogs);
    finFinal = combinarDiaConHora(turno?.Fecha_clave, programmer?.Time_out);

    if (finFinal && inicioFinal && finFinal.getTime() <= inicioFinal.getTime()) {
      finFinal = new Date(finFinal.getTime() + 24 * 60 * 60000);
    }
  }

  return { inicio: inicioFinal, fin: finFinal, duracion };
};

export const formatearHoraCorta = (fecha) => {
  const valor = aFecha(fecha);
  if (!valor) return null;
  return `${dosDigitos(valor.getHours())}:${dosDigitos(valor.getMinutes())}`;
};

const mismoDiaCalendario = (a, b) => {
  const fechaA = aFecha(a);
  const fechaB = aFecha(b);
  if (!fechaA || !fechaB) return false;

  return (
    fechaA.getFullYear() === fechaB.getFullYear() &&
    fechaA.getMonth() === fechaB.getMonth() &&
    fechaA.getDate() === fechaB.getDate()
  );
};

/** Texto "HH:mm – HH:mm (+1d)" del turno. */
export const rangoHorarioTurno = (turno, catalogs = {}) => {
  const { inicio, fin, duracion } = horarioEfectivoTurno(turno, catalogs);
  const textoInicio = formatearHoraCorta(inicio);
  const textoFin = formatearHoraCorta(fin);

  if (!textoInicio && !textoFin) {
    return {
      inicio,
      fin,
      duracion,
      texto: "Horas incompletas",
      cruzaMedianoche: false,
    };
  }

  const cruzaMedianoche =
    Boolean(inicio) && Boolean(fin) && !mismoDiaCalendario(inicio, fin);

  return {
    inicio,
    fin,
    duracion,
    texto: `${textoInicio ?? "--:--"} – ${textoFin ?? "--:--"}${
      cruzaMedianoche ? " (+1d)" : ""
    }`,
    cruzaMedianoche,
  };
};

export const nombreEvento = (turno, catalogs = {}) => {
  const tipo = texto(turno?.Type);

  if (tipo === "Null") return "Null-30";
  if (tipo === "TimeOut") return "TimeOut";

  if (tipo === "Programa" || tipo === "Secondary") {
    const programa = buscarPrograma(turno, catalogs);
    return texto(programa?.nombre) || texto(turno?.Event_name) || "Programa";
  }

  if (tipo === "Programmer") {
    const programmer = buscarProgrammer(turno, catalogs);
    return (
      texto(programmer?.Nombre) ||
      texto(turno?.Event_name) ||
      "Programmer"
    );
  }

  return texto(turno?.Event_name) || "Turno";
};

export const formatearDuracion = (minutos) => formatearMinutos(minutos);

/** Texto de conteo de bloques horarios: "1 bloque" / "N bloques". */
export const textoBloques = (cantidad) => {
  const numero = Number(cantidad) || 0;
  return `${numero} ${numero === 1 ? "bloque" : "bloques"}`;
};

/* ==========================================
   FILAS POR TRABAJADOR
   ========================================== */

const idDe = (registro) => texto(registro?._id ?? registro?.id);

const nombrePersona = (persona) =>
  `${persona?.nombres ?? persona?.Nombres ?? ""} ${
    persona?.apellidos ?? persona?.Apellidos ?? ""
  }`.trim();

const grupoDePersona = (persona) =>
  persona?.grupoID ??
  persona?.GrupoID ??
  persona?.grupo ??
  persona?.Grupo ??
  "";

const estaActivo = (persona) =>
  persona?.activo === true || persona?.Activo === true;

const plannerDeGrupo = (grupo) => texto(grupo?.mainplanner);

const nombreGrupo = (grupo) => texto(grupo?.nombre) || "Sin grupo";

const ordenGrupo = (grupo) => {
  const valor = Number(grupo?.orden ?? grupo?.order);
  return Number.isFinite(valor) ? valor : 999;
};

const claveTurno = (turno) =>
  [
    texto(turno?.Index),
    texto(turno?.Event_name),
    texto(turno?.Inicio_main),
    texto(turno?.Out),
  ].join("|");

const construirFila = ({
  clave,
  persona,
  turnos,
  grupo,
  fecha,
  ausencias,
  substitutions,
  catalogs,
}) => {
  const idUsuario = persona ? idDe(persona) : texto(turnos?.[0]?.ID_user);
  const ordenados = [...(Array.isArray(turnos) ? turnos : [])].sort((a, b) => {
    const indexA = Number(a?.Index);
    const indexB = Number(b?.Index);

    if (Number.isFinite(indexA) && Number.isFinite(indexB) && indexA !== indexB) {
      return indexA - indexB;
    }

    return (
      (aFecha(a?.Inicio_main)?.getTime() ?? 0) -
      (aFecha(b?.Inicio_main)?.getTime() ?? 0)
    );
  });

  const claves = ordenados
    .filter((turno) => estadoTurno(turno) !== ESTADOS_CONSOLIDACION.NO_LABORADO)
    .map(claveTurno);
  const clavesDuplicadas = new Set(
    claves.filter((claveTurnoActual, indice) => claves.indexOf(claveTurnoActual) !== indice)
  );
  const duplicado = clavesDuplicadas.size > 0;

  const ausencia = obtenerEstadoAusencia({
    id: idUsuario,
    fecha,
    ausencias,
  });

  const sustitucionEntrante = (Array.isArray(substitutions)
    ? substitutions
    : []
  ).find(
    (sustitucion) =>
      String(sustitucion?.ID_user_sustituto ?? "") === String(idUsuario) &&
      mismoDia(sustitucion?.Fecha_dia, fecha)
  );

  const sustitucionSaliente = (Array.isArray(substitutions)
    ? substitutions
    : []
  ).find(
    (sustitucion) =>
      String(sustitucion?.ID_user_main ?? "") === String(idUsuario) &&
      mismoDia(sustitucion?.Fecha_dia, fecha)
  );

  const minutosProgramados = ordenados.reduce(
    (total, turno) => total + minutosProgramadosTurno(turno, catalogs),
    0
  );

  const minutosConsolidados = ordenados.reduce(
    (total, turno) => total + minutosConsolidadosTurno(turno, catalogs),
    0
  );

  const tieneHorasInvalidas = ordenados.some((turno) => {
    if (
      turnoConsolidado(turno) ||
      estadoTurno(turno) === ESTADOS_CONSOLIDACION.NO_LABORADO
    ) {
      return false;
    }

    const horario = horarioEfectivoTurno(turno, catalogs);
    return !horario.inicio || !horario.fin || horario.duracion <= 0;
  });

  const estado =
    ordenados.length === 0
      ? ausencia
        ? "Ausencia"
        : "SinTurno"
      : estadoFila(ordenados);
  const pendientes = ordenados.filter(
    (turno) => !turnoConsolidado(turno)
  ).length;

  const turnosConAuditoria = ordenados
    .filter((turno) => aFecha(turno?.ConsolidadoEn))
    .sort(
      (a, b) =>
        aFecha(b.ConsolidadoEn).getTime() -
        aFecha(a.ConsolidadoEn).getTime()
    );

  const consolidadoPor = texto(turnosConAuditoria[0]?.ConsolidadoPor);

  return {
    id: clave,
    idUsuario,
    persona: persona ?? null,
    nombre:
      nombrePersona(persona) ||
      texto(ordenados[0]?.Nombres) ||
      (idUsuario ? "Sin nombre" : "Turno sin trabajador"),
    cargo: texto(persona?.cargo ?? persona?.Cargo) || "—",
    activo: persona ? estaActivo(persona) : true,
    esBalancer: persona ? isBalancerUser(persona) : false,
    sinIdentificar: !idUsuario,
    grupoId: grupo ? idDe(grupo) : "",
    grupoNombre: grupo ? nombreGrupo(grupo) : "Sin grupo",
    grupoOrden: grupo ? ordenGrupo(grupo) : 999,
    plannerGrupo: grupo ? plannerDeGrupo(grupo) : "",
    turnos: ordenados,
    turnosProgramados: ordenados.length,
    turnosPendientes: pendientes,
    estado,
    ausencia,
    sustitutoDe: texto(sustitucionEntrante?.NombreLeft),
    reemplazo: texto(sustitucionSaliente?.NombreRight),
    duplicado,
    tieneHorasInvalidas,
    puedeValidar:
      ordenados.length > 0 && pendientes > 0 && !duplicado && !tieneHorasInvalidas,
    minutosProgramados,
    minutosConsolidados,
    diferencia: minutosConsolidados - minutosProgramados,
    eventosTexto: ordenados
      .map((turno) => nombreEvento(turno, catalogs))
      .join(" "),
    auditoriaEn: turnosConAuditoria[0]
      ? aFecha(turnosConAuditoria[0].ConsolidadoEn)
      : null,
    consolidadoPor: texto(consolidadoPor),
  };
};

/**
 * Construye las filas de la fecha para el planner y grupo indicados.
 * Incluye trabajadores con turno, trabajadores activos sin turno y turnos
 * sin ID_user (para que ningún registro quede fuera de la consolidación).
 */
export const agruparConsolidacion = ({
  groups = [],
  payroll = [],
  shifts = [],
  fecha,
  planner = "Todos",
  grupoId = "Todos",
  ausencias = {},
  substitutions = [],
  catalogs = {},
} = {}) => {
  const fechaDate = aFecha(fecha);
  if (!fechaDate) {
    return {
      filas: [],
      resumen: resumirFilas([]),
      estadoDia: "Sin programación",
      sinGrupo: 0,
      sinIdentificar: 0,
    };
  }

  const gruposValidos = (Array.isArray(groups) ? groups : []).filter((grupo) =>
    ["MainPlanner", "MainPlanner +"].includes(plannerDeGrupo(grupo))
  );

  const grupoPorId = new Map();
  const grupoPorNombre = new Map();

  gruposValidos.forEach((grupo) => {
    const id = idDe(grupo);
    if (id) grupoPorId.set(id, grupo);

    const nombre = normalizarTexto(grupo?.nombre);
    if (nombre) grupoPorNombre.set(nombre, grupo);
  });

  const resolverGrupo = (persona) => {
    const referencia = texto(grupoDePersona(persona));
    if (!referencia) return null;

    return (
      grupoPorId.get(referencia) ??
      grupoPorNombre.get(normalizarTexto(referencia)) ??
      null
    );
  };

  const payrollPorId = new Map();
  (Array.isArray(payroll) ? payroll : []).forEach((persona) => {
    const id = idDe(persona);
    if (id) payrollPorId.set(id, persona);
  });

  const turnosDelDia = (Array.isArray(shifts) ? shifts : []).filter((turno) =>
    mismoDia(turno?.Fecha_clave, fechaDate)
  );

  const turnosPorUsuario = new Map();
  const turnosSinId = [];

  turnosDelDia.forEach((turno) => {
    const id = texto(turno?.ID_user);

    if (!id) {
      turnosSinId.push(turno);
      return;
    }

    const lista = turnosPorUsuario.get(id) ?? [];
    lista.push(turno);
    turnosPorUsuario.set(id, lista);
  });

  const filas = [];

  turnosPorUsuario.forEach((turnos, id) => {
    const persona = payrollPorId.get(id) ?? null;
    const grupo = resolverGrupo(persona);

    filas.push(
      construirFila({
        clave: id,
        persona,
        turnos,
        grupo,
        fecha: fechaDate,
        ausencias,
        substitutions,
        catalogs,
      })
    );
  });

  turnosSinId.forEach((turno, indice) => {
    filas.push(
      construirFila({
        clave: `sin-id-${turno?._id ?? indice}`,
        persona: null,
        turnos: [turno],
        grupo: null,
        fecha: fechaDate,
        ausencias,
        substitutions,
        catalogs,
      })
    );
  });

  (Array.isArray(payroll) ? payroll : []).forEach((persona) => {
    if (!estaActivo(persona)) return;

    const id = idDe(persona);
    if (!id || turnosPorUsuario.has(id)) return;

    const grupo = resolverGrupo(persona);

    filas.push(
      construirFila({
        clave: id,
        persona,
        turnos: [],
        grupo,
        fecha: fechaDate,
        ausencias,
        substitutions,
        catalogs,
      })
    );
  });

  const sinGrupo = filas.filter((fila) => !fila.grupoId).length;
  const sinIdentificar = filas.filter((fila) => fila.sinIdentificar).length;

  const filtradas = filas.filter((fila) => {
    if (!fila.grupoId) {
      // Sin grupo o sin identificar solo se muestran cuando no hay filtro.
      return planner === "Todos" && grupoId === "Todos";
    }

    if (planner !== "Todos" && fila.plannerGrupo !== planner) return false;
    if (grupoId !== "Todos" && fila.grupoId !== grupoId) return false;

    return true;
  });

  filtradas.sort((a, b) => {
    if (a.grupoOrden !== b.grupoOrden) return a.grupoOrden - b.grupoOrden;

    const grupoA = normalizarTexto(a.grupoNombre);
    const grupoB = normalizarTexto(b.grupoNombre);
    if (grupoA !== grupoB) return grupoA.localeCompare(grupoB, "es");

    const pesoA = ESTADO_PESO[a.estado] ?? 9;
    const pesoB = ESTADO_PESO[b.estado] ?? 9;
    if (pesoA !== pesoB) return pesoA - pesoB;

    return normalizarTexto(a.nombre).localeCompare(
      normalizarTexto(b.nombre),
      "es"
    );
  });

  const resumen = resumirFilas(filtradas);

  return {
    filas: filtradas,
    resumen,
    estadoDia: estadoDelDia(resumen),
    sinGrupo,
    sinIdentificar,
  };
};

/* ==========================================
   FILTROS Y RESÚMENES
   ========================================== */

export const filtrarFilas = (
  filas = [],
  { estado = "Todos", busqueda = "", incluirSinProgramacion = false } = {}
) => {
  const consulta = normalizarTexto(busqueda);
  const lista = Array.isArray(filas) ? filas : [];

  return lista.filter((fila) => {
    const sinTurnos = fila.turnos.length === 0;

    if (!incluirSinProgramacion && sinTurnos && estado !== "Sin programación") {
      return false;
    }

    if (estado === "Pendientes") {
      if (
        fila.estado !== ESTADOS_CONSOLIDACION.PENDIENTE &&
        fila.estado !== "Parcial"
      ) {
        return false;
      }
    } else if (estado === "Validados") {
      if (fila.estado !== ESTADOS_CONSOLIDACION.VALIDADO) return false;
    } else if (estado === "Con novedad") {
      if (
        fila.estado !== ESTADOS_CONSOLIDACION.AJUSTADO &&
        fila.estado !== ESTADOS_CONSOLIDACION.NO_LABORADO
      ) {
        return false;
      }
    } else if (estado === "Sin programación") {
      if (!sinTurnos) return false;
    }

    if (!consulta) return true;

    return normalizarTexto(
      [fila.nombre, fila.grupoNombre, fila.cargo, fila.eventosTexto].join(" ")
    ).includes(consulta);
  });
};

export const resumirFilas = (filas = []) => {
  const lista = Array.isArray(filas) ? filas : [];
  const conTurnos = lista.filter((fila) => fila.turnos.length > 0);

  const pendientes = conTurnos.filter(
    (fila) =>
      fila.estado === ESTADOS_CONSOLIDACION.PENDIENTE ||
      fila.estado === "Parcial"
  );

  const validadas = conTurnos.filter(
    (fila) => fila.estado === ESTADOS_CONSOLIDACION.VALIDADO
  );

  const conNovedad = conTurnos.filter(
    (fila) =>
      fila.estado === ESTADOS_CONSOLIDACION.AJUSTADO ||
      fila.estado === ESTADOS_CONSOLIDACION.NO_LABORADO
  );

  const sinProgramacion = lista.filter(
    (fila) => fila.turnos.length === 0 && !fila.ausencia
  );

  const ausencias = lista.filter(
    (fila) => fila.turnos.length === 0 && Boolean(fila.ausencia)
  );

  const horasProgramadas = conTurnos.reduce(
    (total, fila) => total + fila.minutosProgramados,
    0
  );

  const horasConsolidadas = conTurnos.reduce(
    (total, fila) => total + fila.minutosConsolidados,
    0
  );

  return {
    totalConTurnos: conTurnos.length,
    totalTurnos: conTurnos.reduce(
      (total, fila) => total + fila.turnos.length,
      0
    ),
    pendientes: pendientes.length,
    turnosPendientes: pendientes.reduce(
      (total, fila) => total + fila.turnosPendientes,
      0
    ),
    validadas: validadas.length,
    conNovedad: conNovedad.length,
    sinProgramacion: sinProgramacion.length,
    ausencias: ausencias.length,
    horasProgramadas,
    horasConsolidadas,
    diferencia: horasConsolidadas - horasProgramadas,
  };
};

export const estadoDelDia = (resumen) => {
  if (!resumen || resumen.totalConTurnos === 0) return "Sin programación";
  if (resumen.pendientes === 0) return "Cerrado";
  if (resumen.validadas + resumen.conNovedad === 0) return "Abierto";

  return "Parcial";
};

/* ==========================================
   PAYLOADS Y VALIDACIONES
   ========================================== */

/**
 * Arma el body camelCase que espera el backend. Solo incluye los campos
 * opcionales que se le pasan: los no enviados se conservan en el turno.
 */
export const construirActualizacionTurno = ({
  turno,
  estado,
  inicio,
  fin,
  tipo,
  idPrograma,
  eventId,
  color,
  idSchema,
  index,
  observacion,
  observacionConsolidacion,
  usuario,
  minutos,
} = {}) => {
  const minutosNumericos = Math.round(Number(minutos) || 0);

  const payload = {
    id: idDe(turno),
    estadoConsolidacion: estado,
    observacionConsolidacion: texto(observacionConsolidacion),
    consolidadoPor: texto(usuario?.nombre),
    consolidadoPorId: texto(usuario?.id),
    minutosConsolidados: Math.max(
      0,
      Math.min(24 * 60, minutosNumericos)
    ),
  };

  if (index !== undefined) payload.index = index;
  if (tipo !== undefined) payload.tipo = tipo;
  if (idPrograma !== undefined) payload.idPrograma = idPrograma;
  if (eventId !== undefined) payload.eventId = eventId;
  if (color !== undefined) payload.color = color;
  if (idSchema !== undefined) payload.idSchema = idSchema;
  if (observacion !== undefined) payload.observacion = observacion;

  const inicioFecha = aFecha(inicio);
  if (inicioFecha) payload.inicioMain = inicioFecha.toISOString();

  const finFecha = aFecha(fin);
  if (finFecha) payload.out = finFecha.toISOString();

  return payload;
};

/** Devuelve un mensaje de error o null si el turno se puede guardar. */
export const validarTurnoParaConsolidar = ({
  estado,
  inicio,
  fin,
  minutos,
  observacionConsolidacion,
  tipo,
  idPrograma,
} = {}) => {
  if (estado === ESTADOS_CONSOLIDACION.NO_LABORADO) {
    if (!texto(observacionConsolidacion)) {
      return "Registre el motivo por el cual no laboró este turno.";
    }

    return null;
  }

  if (estado === ESTADOS_CONSOLIDACION.AJUSTADO) {
    if (!aFecha(inicio) || !aFecha(fin)) {
      return "Indique la hora de inicio y de fin del turno ajustado.";
    }

    if (aFecha(fin).getTime() <= aFecha(inicio).getTime()) {
      return "La hora de fin debe ser posterior a la hora de inicio.";
    }

    if (!(Number(minutos) > 0)) {
      return "La duración del turno ajustado debe ser mayor a cero.";
    }

    if (!texto(observacionConsolidacion)) {
      return "Registre la observación del ajuste.";
    }

    if (!texto(tipo) || !texto(idPrograma)) {
      return "Seleccione el tipo y el evento del turno ajustado.";
    }

    return null;
  }

  if (estado === ESTADOS_CONSOLIDACION.VALIDADO) {
    if (!(Number(minutos) > 0)) {
      return "No se pudo determinar la duración del turno; ajuste las horas o el evento.";
    }

    return null;
  }

  return null;
};

/**
 * Detecta intervalos cruzados entre los turnos de un trabajador.
 * Recibe objetos { id, nombre, estado, inicio, fin }.
 */
export const validarSolapamientos = (turnos = []) => {
  const intervalos = (Array.isArray(turnos) ? turnos : [])
    .filter(
      (turno) =>
        turno.estado !== ESTADOS_CONSOLIDACION.NO_LABORADO &&
        aFecha(turno.inicio) &&
        aFecha(turno.fin) &&
        aFecha(turno.fin).getTime() > aFecha(turno.inicio).getTime()
    )
    .map((turno) => ({
      ...turno,
      inicio: aFecha(turno.inicio),
      fin: aFecha(turno.fin),
    }))
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

  for (let indice = 1; indice < intervalos.length; indice += 1) {
    const anterior = intervalos[indice - 1];
    const actual = intervalos[indice];

    if (actual.inicio.getTime() < anterior.fin.getTime()) {
      return { anterior, actual };
    }
  }

  return null;
};

/** Índice 1..N en orden cronológico para los turnos recibidos. */
export const siguienteIndexPorHora = (turnos = []) =>
  [...(Array.isArray(turnos) ? turnos : [])]
    .map((turno, posicion) => ({ ...turno, _posicionOriginal: posicion }))
    .sort((a, b) => {
      const inicioA = aFecha(a.inicio)?.getTime() ?? Number.POSITIVE_INFINITY;
      const inicioB = aFecha(b.inicio)?.getTime() ?? Number.POSITIVE_INFINITY;

      if (inicioA !== inicioB) return inicioA - inicioB;
      return a._posicionOriginal - b._posicionOriginal;
    })
    .map((turno, posicion) => ({ id: turno.id, index: posicion + 1 }));

/** Duración en minutos entre dos fechas, tolerando el cruce de medianoche. */
export const minutosDeRango = (inicio, fin) =>
  minutosEntreFechas(inicio, fin) ?? 0;

/**
 * Valida el conjunto de turnos antes de consolidar el día.
 * Devuelve un mensaje de error o null.
 */
export const validarTurnosParaConsolidar = (
  turnos = [],
  catalogs = {},
  estadoFinal = ESTADOS_CONSOLIDACION.VALIDADO
) => {
  const lista = Array.isArray(turnos) ? turnos : [];

  if (lista.length === 0) return "No hay turnos para consolidar.";
  if (estadoFinal === ESTADOS_CONSOLIDACION.NO_LABORADO) return null;

  const intervalos = [];
  const claves = new Set();

  for (const turno of lista) {
    const horario = horarioEfectivoTurno(turno, catalogs);

    if (!horario.inicio || !horario.fin || horario.duracion <= 0) {
      return `El turno #${
        turno?.Index ?? "?"
      } no tiene horas de inicio y fin válidas.`;
    }

    const clave = [
      texto(turno?.Index),
      texto(turno?.Event_name),
      texto(turno?.Inicio_main),
      texto(turno?.Out),
    ].join("|");

    if (claves.has(clave)) {
      return "Hay turnos duplicados en la fecha. Revise la programación antes de consolidar.";
    }

    claves.add(clave);
    intervalos.push({
      id: turno?._id,
      nombre: `#${turno?.Index ?? "?"} ${nombreEvento(turno, catalogs)}`,
      estado: estadoFinal,
      inicio: horario.inicio,
      fin: horario.fin,
    });
  }

  const cruce = validarSolapamientos(intervalos);

  if (cruce) {
    return `Los turnos "${cruce.anterior.nombre}" y "${cruce.actual.nombre}" se cruzan. Ajuste las horas antes de consolidar.`;
  }

  return null;
};
