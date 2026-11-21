import { aFecha, duracionDeTurno, mismoDia } from "./plannerStack";

/** Excluye los usuarios virtuales usados por el balanceador. */
const esUsuarioBalancer = (persona) => {
  const cargo = String(persona?.cargo ?? persona?.Cargo ?? "")
    .trim()
    .toUpperCase();
  if (cargo === "USERBALANCER") return true;

  const nombre = String(persona?.nombres ?? persona?.Nombres ?? "")
    .trim()
    .toLowerCase();

  return nombre === "userbalancer" || /^userbalancer-\d+$/.test(nombre);
};

/** Normaliza nombres para comparar grupos, roles y personas. */
export const normalizarNombre = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * Alias entre los roles de la solicitud y los nombres reales de los grupos
 * del backend. La comparación siempre es normalizada; el selector de grupo
 * cubre cualquier nombre que no aparezca aquí.
 */
export const ALIAS_GRUPO_POR_ROL = {
  luminotecnicos: ["iluminacion", "luces", "luminotecnicos"],
  camarografos: [
    "camarografos de estudio",
    "camarografos",
    "camarografos de reporteria",
  ],
  audio: ["audio", "audio estudio"],
  realizacion: ["realizacion", "coordinadores de piso", "switcher"],
  produccion: ["produccion", "productores"],
  maquillaje: ["maquillaje"],
  transporte: ["transporte"],
  transmision: ["emision", "transmision", "liveu", "ingenieros"],
  utileria: ["utileria", "almacenistas"],
};

export const obtenerIdGrupo = (grupo) => grupo?._id ?? grupo?.id ?? "";

export const obtenerIdPersona = (persona) =>
  persona?._id ?? persona?.id ?? persona?.userId ?? "";

export const obtenerGrupoPersona = (persona) =>
  persona?.grupoID ??
  persona?.GrupoID ??
  persona?.grupo ??
  persona?.Grupo ??
  "";

export const obtenerNombrePersona = (persona) => {
  const nombre = `${persona?.nombres ?? persona?.Nombres ?? ""} ${
    persona?.apellidos ?? persona?.Apellidos ?? ""
  }`.trim();

  return nombre || "Sin nombre";
};

export const esPersonaActiva = (persona) => {
  const activo = persona?.activo ?? persona?.Activo;
  return activo === undefined ? true : activo === true || activo === "true";
};

/** Busca el grupo del backend que corresponde al rol de la solicitud. */
export const buscarGrupoParaRol = (grupos, rolId, rolNombre) => {
  const objetivos = [
    ...(ALIAS_GRUPO_POR_ROL[rolId] ?? []),
    rolNombre,
    rolId,
  ]
    .map(normalizarNombre)
    .filter(Boolean);

  const lista = (Array.isArray(grupos) ? grupos : []).map((grupo) => ({
    grupo,
    nombre: normalizarNombre(grupo?.nombre),
  }));

  const exacto = lista.find(({ nombre }) => objetivos.includes(nombre));
  if (exacto) {
    return { grupo: exacto.grupo, tipo: "exacta", candidatos: [exacto.grupo] };
  }

  const parciales = lista.filter(({ nombre }) =>
    objetivos.some(
      (objetivo) =>
        objetivo &&
        (nombre.includes(objetivo) || objetivo.includes(nombre))
    )
  );

  if (parciales.length === 1) {
    return {
      grupo: parciales[0].grupo,
      tipo: "parcial",
      candidatos: [parciales[0].grupo],
    };
  }

  return {
    grupo: null,
    tipo: parciales.length ? "ambigua" : "sin-coincidencia",
    candidatos: parciales.map(({ grupo }) => grupo),
  };
};

/** Personal activo del grupo, sin usuarios virtuales de balanceo. */
export const filtrarPersonalDeGrupo = (payroll, grupoId) =>
  (Array.isArray(payroll) ? payroll : []).filter(
    (persona) =>
      String(obtenerGrupoPersona(persona)) === String(grupoId) &&
      esPersonaActiva(persona) &&
      !esUsuarioBalancer(persona)
  );

/** Fecha local a partir de la fecha y hora del evento del requerimiento. */
export const crearFechaHora = (fechaISO, hora) => {
  if (!fechaISO) return null;

  const [anio, mes, dia] = String(fechaISO).split("-").map(Number);
  const [horas, minutos] = String(hora ?? "00:00").split(":").map(Number);

  if (!anio || !mes || !dia) return null;

  const fecha = new Date(
    anio,
    mes - 1,
    dia,
    Number.isFinite(horas) ? horas : 0,
    Number.isFinite(minutos) ? minutos : 0,
    0,
    0
  );

  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

export const intervaloEvento = (solicitud) => {
  const evento = solicitud?.evento ?? {};
  const inicio = crearFechaHora(evento.fecha, evento.horaInicio);
  const fin = crearFechaHora(evento.fecha, evento.horaFin);

  return { inicio, fin };
};

export const hayCruceHorario = (inicioA, finA, inicioB, finB) => {
  if (!inicioA || !finA || !inicioB || !finB) return false;
  return inicioA < finB && inicioB < finA;
};

export const formatearHora = (fecha) => {
  if (!fecha) return "—";

  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
};

/** Formatea una hora ISO guardada en los esquemas de rotación. */
export const formatearHoraValor = (valor) => {
  const fecha = aFecha(valor);
  return fecha ? formatearHora(fecha) : "Hora sin definir";
};

export const formatearHoras = (horas) => {
  const valor = Number(horas);
  if (!Number.isFinite(valor)) return "0 h";
  return `${Number.isInteger(valor) ? valor : valor.toFixed(1)} h`;
};

/**
 * Turnos guardados de una persona en la fecha, con su intervalo real.
 * Usa duracionDeTurno para resolver turnos sin hora de salida explícita.
 */
export const obtenerTurnosDelDia = ({
  turnos,
  userId,
  fecha,
  programs = [],
  stacks = [],
}) => {
  const id = String(userId ?? "");

  return (Array.isArray(turnos) ? turnos : [])
    .filter((turno) => {
      const idTurno = String(
        turno?.ID_user ?? turno?.idUser ?? turno?.ID_User ?? ""
      );
      return idTurno === id && mismoDia(turno?.Inicio_main, fecha);
    })
    .map((turno) => {
      const inicio = aFecha(turno?.Inicio_main);
      if (!inicio) return null;

      const minutos = duracionDeTurno(turno, {
        programs,
        stacks,
        programmers: [],
      });

      let fin = aFecha(turno?.Out);
      if (!fin || fin <= inicio) {
        fin =
          minutos > 0
            ? new Date(inicio.getTime() + minutos * 60000)
            : new Date(inicio.getTime() + 60 * 60000);
      }

      return { turno, inicio, fin };
    })
    .filter(Boolean);
};

/** Horas del periodo y porcentaje frente a la intensidad diaria configurada. */
export const calcularCargaPeriodo = ({
  userId,
  dias = [],
  horasPorUsuarioDia,
  intensidad = 8,
}) => {
  const minutos = (Array.isArray(dias) ? dias : []).reduce(
    (total, dia) =>
      total + (horasPorUsuarioDia?.get(String(userId))?.get(dia.iso) ?? 0),
    0
  );

  const horas = minutos / 60;
  const meta = Math.max(0, (Number(intensidad) || 0) * (dias?.length ?? 0));
  const porcentaje = meta > 0 ? Math.round((horas / meta) * 100) : 0;

  return { horas, meta, porcentaje };
};
