/**
 * Reglas puras del planificador de turnos (ModalPlanner1).
 *
 * Aquí vive todo lo que se puede calcular sin React ni API:
 *   - clasificación de los turnos del día (manual vs sugerido)
 *   - duración real de un turno guardado (custom, timeout, programa, programmer)
 *   - cadena de horas de un stack (cada evento empieza donde termina el anterior)
 *   - estado del día, comparación de fechas por día y acumulados del período
 *
 * Ninguna función de este archivo muta estados globales: son la base para
 * reemplazar las variables de módulo de ModalPlanner1 (validador*, DURACIONGLOBAL,
 * HORAINGLOBAL, auxOut, globalCantidad, index, ...).
 */

import {
  minutosEntreFechas,
  duracionPrograma,
  duracionItemStack,
} from "./stackDuration";

/* ==========================================
   FECHAS
   ========================================== */

export const aFecha = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

export const mismoDia = (a, b) => {
  const fechaA = aFecha(a);
  const fechaB = aFecha(b);
  if (!fechaA || !fechaB) return false;

  return (
    fechaA.getFullYear() === fechaB.getFullYear() &&
    fechaA.getMonth() === fechaB.getMonth() &&
    fechaA.getDate() === fechaB.getDate()
  );
};

export const normalizarHoraDelDia = (valor, fechaBase = new Date()) => {
  const base = aFecha(fechaBase) ?? new Date();

  if (valor instanceof Date) {
    const copia = new Date(valor.getTime());
    return Number.isNaN(copia.getTime()) ? null : copia;
  }

  if (typeof valor === "number" && Number.isFinite(valor)) {
    const fecha = new Date(base.getTime());
    fecha.setHours(0, 0, 0, 0);
    fecha.setMinutes(valor);
    return fecha;
  }

  const texto = String(valor ?? "").trim();
  if (!texto) return null;

  const horaSimple = texto.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (horaSimple) {
    const fecha = new Date(base.getTime());
    fecha.setHours(
      Number(horaSimple[1]),
      Number(horaSimple[2]),
      Number(horaSimple[3] ?? 0),
      0
    );
    return fecha;
  }

  return aFecha(texto);
};

export const formatearHora = (fecha) => {
  const valor = aFecha(fecha);
  if (!valor) return "--:--:--";
  const dos = (numero) => String(numero).padStart(2, "0");
  return `${dos(valor.getHours())}:${dos(valor.getMinutes())}:${dos(
    valor.getSeconds()
  )}`;
};

export const formatearMinutos = (minutos) => {
  const total = Math.max(0, Math.round(Number(minutos) || 0));
  const horas = Math.floor(total / 60);
  const resto = total % 60;
  return `${horas} h ${resto} min`;
};

/* ==========================================
   CLASIFICACIÓN DEL DÍA
   ========================================== */

export const esTurnoSugerido = (turno) =>
  String(turno?.Color ?? "").trim().toLowerCase() === "brown";

/** Todo lo que no es marrón se considera manual/especial (los + usan "red"). */
export const esTurnoManual = (turno) => !esTurnoSugerido(turno);

export const clasificarDia = (turnos = []) => {
  const sugeridos = [];
  const manuales = [];

  (Array.isArray(turnos) ? turnos : []).forEach((turno) => {
    if (!turno) return;
    if (esTurnoSugerido(turno)) sugeridos.push(turno);
    else manuales.push(turno);
  });

  return {
    sugeridos,
    manuales,
    haySugerido: sugeridos.length > 0,
    hayManual: manuales.length > 0,
  };
};

export const compensatorioEnFecha = (compensatorios = [], iduser, fecha) =>
  (Array.isArray(compensatorios) ? compensatorios : []).some(
    (registro) =>
      String(registro?.Id_Empleado ?? registro?.idempleado ?? "") ===
        String(iduser ?? "") &&
      mismoDia(registro?.FechaInicio ?? registro?.fechainicio, fecha)
  );

export const rangoCubreFecha = (registros = [], iduser, fecha) => {
  const objetivo = aFecha(fecha);
  if (!objetivo) return false;

  const dia = new Date(objetivo.getTime());
  dia.setHours(0, 0, 0, 0);

  return (Array.isArray(registros) ? registros : []).some((registro) => {
    if (
      String(registro?.Id_Empleado ?? registro?.idempleado ?? "") !==
      String(iduser ?? "")
    ) {
      return false;
    }

    const inicio = aFecha(registro?.FechaInicio ?? registro?.fechainicio);
    const fin = aFecha(registro?.FechaFinal ?? registro?.fechafinal);
    if (!inicio || !fin) return false;

    const diaInicio = new Date(inicio.getTime());
    diaInicio.setHours(0, 0, 0, 0);
    const diaFin = new Date(fin.getTime());
    diaFin.setHours(0, 0, 0, 0);

    return diaInicio <= dia && dia <= diaFin;
  });
};

/**
 * Estado del día. Prioridad:
 * compensatorio > descanso > mixto > sugeridoGuardado > manual > vacío
 */
export const estadoDelDia = ({
  turnos = [],
  compensatorios = [],
  breaks = [],
  iduser,
  fecha,
} = {}) => {
  if (compensatorioEnFecha(compensatorios, iduser, fecha)) {
    return "compensatorio";
  }
  if (rangoCubreFecha(breaks, iduser, fecha)) {
    return "descanso";
  }

  const { haySugerido, hayManual } = clasificarDia(turnos);
  if (haySugerido && hayManual) return "mixto";
  if (haySugerido) return "sugeridoGuardado";
  if (hayManual) return "manual";
  return "vacio";
};

/* ==========================================
   DURACIONES
   ========================================== */

const buscarProgrammer = (programmers, id) =>
  (Array.isArray(programmers) ? programmers : []).find(
    (programmer) => String(programmer?._id) === String(id)
  );

/** Minutos de un elemento de stack de esquema (plantilla /stacks). */
export const duracionDeElemento = (
  item,
  { programs = [], programmers = [] } = {}
) => {
  if (!item) return 0;

  if (item.Type === "Programmer") {
    const programmer = buscarProgrammer(programmers, item.ID_programa);
    const minutos = minutosEntreFechas(programmer?.Time_in, programmer?.Time_out);
    if (minutos && minutos > 0) return minutos;
  }

  return duracionItemStack(item, programs);
};

const plantillaDelTurno = (turno, stacks) => {
  if (!Array.isArray(stacks) || stacks.length === 0) return null;
  const delEsquema = stacks.filter(
    (stack) => String(stack?.ID_esquema) === String(turno?.Id_Schema)
  );
  if (delEsquema.length === 0) return null;

  return (
    delEsquema.find(
      (stack) => Number(stack?.Order) === Number(turno?.Index)
    ) ??
    delEsquema.find(
      (stack) =>
        stack?.Type === turno?.Type &&
        String(stack?.ID_programa) === String(turno?.Event_name)
    ) ??
    delEsquema.find((stack) => stack?.Type === turno?.Type) ??
    null
  );
};

/**
 * Minutos que aporta un turno guardado en /shifts.
 *
 * Prioridad: Null (30) -> Programa/Secondary/Requerimiento (horario del
 * programa) -> Programmer (Time_in/Time_out) -> horas propias del turno
 * (Inicio_main -> Out) -> plantilla del esquema (respaldo para datos heredados).
 */
export const duracionDeTurno = (
  turno,
  { programs = [], programmers = [], stacks = [] } = {}
) => {
  if (!turno) return 0;
  const tipo = turno.Type;

  if (tipo === "Null" || turno.Event_name === "Null-30") return 30;

  if (tipo === "Programa" || tipo === "Secondary" || tipo === "Requerimiento") {
    const programa = (Array.isArray(programs) ? programs : []).find(
      (item) => String(item?._id) === String(turno.Event_name)
    );
    const minutos = duracionPrograma(programa);
    if (minutos > 0) return minutos;
  }

  if (tipo === "Programmer") {
    //Las horas guardadas en el turno manual mandan (coinciden con lo que
    //muestra el Listado); si no existen se usa el horario del evento programado.
    const propiosProgrammer = minutosEntreFechas(turno.Inicio_main, turno.Out);
    if (propiosProgrammer !== null && propiosProgrammer > 0) {
      return propiosProgrammer;
    }

    const programmer = buscarProgrammer(
      programmers,
      turno.ID_event ?? turno.Event_name
    );
    const minutos = minutosEntreFechas(programmer?.Time_in, programmer?.Time_out);
    if (minutos && minutos > 0) return minutos;
  }

  const propios = minutosEntreFechas(turno.Inicio_main, turno.Out);
  if (propios !== null && propios > 0) return propios;

  const plantilla = plantillaDelTurno(turno, stacks);
  if (plantilla) {
    const minutos = duracionDeElemento(plantilla, { programs, programmers });
    if (minutos > 0) return minutos;
  }

  return 0;
};

/* ==========================================
   CADENA DE HORAS DEL STACK
   ========================================== */

export const ordenarStack = (items, clave = "Order") =>
  [...(Array.isArray(items) ? items : [])].sort(
    (a, b) => (Number(a?.[clave]) || 0) - (Number(b?.[clave]) || 0)
  );

/**
 * Encadena los elementos del stack desde `horaInicio` (hora del esquema,
 * "HH:mm:ss", Date o minutos del día). Cada fila empieza donde termina la
 * anterior; si una duración es 0 la fila queda sin horas.
 *
 * Devuelve { filas, totalMin, inicio, fin } donde cada fila es
 * { item, orden, duracionMin, inicio, fin }.
 */
export const construirCadena = (
  items,
  horaInicio,
  fechaBase = new Date(),
  obtenerDuracion = () => 0
) => {
  const lista = Array.isArray(items) ? items : [];
  let cursor = normalizarHoraDelDia(horaInicio, fechaBase);

  const filas = lista.map((item, posicion) => {
    const duracion = Number(obtenerDuracion(item, posicion));
    const duracionMin =
      Number.isFinite(duracion) && duracion > 0 ? Math.round(duracion) : 0;

    const inicio = cursor ? new Date(cursor.getTime()) : null;
    const fin = cursor ? new Date(cursor.getTime() + duracionMin * 60000) : null;
    if (fin) cursor = fin;

    return { item, orden: posicion + 1, duracionMin, inicio, fin };
  });

  return {
    filas,
    totalMin: filas.reduce((total, fila) => total + fila.duracionMin, 0),
    inicio: filas[0]?.inicio ?? null,
    fin: filas.length > 0 ? filas[filas.length - 1].fin : cursor,
  };
};

/** Cadena de una plantilla /stacks (se ordena por Order). */
export const cadenaDePlantilla = (
  stacks,
  horaInicio,
  fechaBase,
  { programs = [], programmers = [] } = {}
) =>
  construirCadena(
    ordenarStack(stacks, "Order"),
    horaInicio,
    fechaBase,
    (item) => duracionDeElemento(item, { programs, programmers })
  );

/** Cadena de turnos guardados en /shifts (se ordena por Index). */
export const cadenaDeTurnos = (
  turnos,
  horaInicio,
  fechaBase,
  { programs = [], programmers = [], stacks = [] } = {}
) =>
  construirCadena(
    ordenarStack(turnos, "Index"),
    horaInicio,
    fechaBase,
    (turno) => duracionDeTurno(turno, { programs, programmers, stacks })
  );

export const totalMinutosTurnos = (turnos, dependencias = {}) =>
  (Array.isArray(turnos) ? turnos : []).reduce(
    (total, turno) => total + duracionDeTurno(turno, dependencias),
    0
  );

/* ==========================================
   ACUMULADOS DEL PERÍODO
   ========================================== */

/** Map userId -> minutos trabajados dentro del rango de /shifts/day. */
export const minutosPorUsuario = (shiftsDay, dependencias = {}) => {
  const mapa = new Map();

  (Array.isArray(shiftsDay) ? shiftsDay : []).forEach((turno) => {
    const id = String(turno?.ID_user ?? "");
    if (!id) return;
    const minutos = duracionDeTurno(turno, dependencias);
    mapa.set(id, (mapa.get(id) ?? 0) + minutos);
  });

  return mapa;
};

export const minutosDelUsuario = (mapa, iduser) =>
  mapa instanceof Map ? mapa.get(String(iduser ?? "")) ?? 0 : 0;

/* ==========================================
   ESQUEMA DEL TURNO
   ========================================== */

export const horaInicioSchema = (rotations, schemaId) => {
  const schema = (Array.isArray(rotations) ? rotations : []).find(
    (rotation) => String(rotation?._id) === String(schemaId)
  );
  return schema?.HoraInicio ?? schema?.horaInicio ?? null;
};
