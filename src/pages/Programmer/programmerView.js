/**
 * Reglas puras de la pantalla Programmer.
 *
 * El mismo registro cumple dos papeles:
 *   1. Evento que ModalPlanner1 agrega como Type: "Programmer".
 *   2. Requerimiento manual mientras no existe el sistema de Requirements.
 *
 * Aquí se normaliza la respuesta del API, se valida el formulario y se arma
 * el body que consume /programmer. No hay React ni llamadas HTTP.
 */

import { claveDiaLocal } from "../../utils/plannerCoverage";
import { minutosEntreFechas } from "../../utils/stackDuration";
import { formatearMinutos } from "../../utils/plannerStack";
import {
  ESTADOS,
  PRIORIDADES,
  normalizarTexto,
} from "../Requirements/requirementsData";
import { MAPA_EQUIPOS, MAPA_ROLES } from "../Requirements/requirementsView";
import {
  departamentoHeredado,
  programaHeredado,
  tipoEventoHeredado,
} from "./programmerInheritance";
import {
  horasEntreHoras,
  minutosDeHora,
  minutosEntreHoras,
} from "./programmerTime";
import { estadoProgrammerUI, resumenPersonalProgrammer } from "./programmerStatus";

export { claveDiaLocal };
export { minutosEntreHoras };

const TEXTO = (valor) => String(valor ?? "").trim();

const DOS_DIGITOS = (valor) => String(valor).padStart(2, "0");

const COLOR_HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export const colorValido = (valor) => COLOR_HEX.test(TEXTO(valor));

/** Devuelve un color #rrggbb válido; expande los formatos de 3 dígitos. */
export const colorSeguro = (valor) => {
  const color = TEXTO(valor);
  if (!COLOR_HEX.test(color)) return "#000000";

  if (color.length === 4) {
    return `#${color
      .slice(1)
      .split("")
      .map((caracter) => `${caracter}${caracter}`)
      .join("")}`.toLowerCase();
  }

  return color.toLowerCase();
};

/**
 * Convierte fechas del API o del formulario en una fecha local a medianoche.
 * Evita el desfase de interpretar YYYY-MM-DD como UTC.
 */
export const parseFechaLocal = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null;

  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) return null;
    return new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
  }

  const texto = TEXTO(valor);
  const soloDia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);

  if (soloDia) {
    const anio = Number(soloDia[1]);
    const mes = Number(soloDia[2]);
    const dia = Number(soloDia[3]);
    const fecha = new Date(anio, mes - 1, dia);

    if (
      fecha.getFullYear() !== anio ||
      fecha.getMonth() !== mes - 1 ||
      fecha.getDate() !== dia
    ) {
      return null;
    }

    return fecha;
  }

  const fecha = new Date(texto);
  if (Number.isNaN(fecha.getTime())) return null;

  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
};

export const horaTexto = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "";

  if (typeof valor === "string" && /^\d{2}:\d{2}/.test(valor)) {
    return valor.slice(0, 5);
  }

  const fecha = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";

  return `${DOS_DIGITOS(fecha.getHours())}:${DOS_DIGITOS(fecha.getMinutes())}`;
};

export const minutosDelDia = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null;

  const fecha = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(fecha.getTime())) return null;

  return fecha.getHours() * 60 + fecha.getMinutes();
};

/** Fecha del evento + hora local, expresada como epoch ms. */
export const construirFechaHora = (fechaClave, hora) => {
  const fecha = parseFechaLocal(fechaClave);
  const minutos = minutosDeHora(hora);

  if (!fecha || minutos === null) return null;

  const resultado = new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate(),
    Math.floor(minutos / 60),
    minutos % 60,
    0,
    0
  );

  return resultado.getTime();
};

export const formatearDuracion = formatearMinutos;

export const normalizarBusqueda = normalizarTexto;

const normalizarSolicitante = (solicitante) => ({
  nombre: TEXTO(solicitante?.Nombre ?? solicitante?.nombre),
  cargo: TEXTO(solicitante?.Cargo ?? solicitante?.cargo),
  correo: TEXTO(solicitante?.Correo ?? solicitante?.correo),
  telefono: TEXTO(solicitante?.Telefono ?? solicitante?.telefono),
});

const normalizarPersonal = (personal) =>
  (Array.isArray(personal) ? personal : []).map((item) => {
    const rolId = TEXTO(item?.RolId ?? item?.rolId);
    return {
      rolId,
      rol:
        TEXTO(item?.Rol ?? item?.rol) ||
        MAPA_ROLES.get(rolId) ||
        "Rol sin catalogar",
      cantidad: Number(item?.Cantidad ?? item?.cantidad) || 0,
      horas: Number(item?.Horas ?? item?.horas) || 0,
      notas: TEXTO(item?.Notas ?? item?.notas),
      asignados: (Array.isArray(item?.Asignados ?? item?.asignados)
        ? item.Asignados ?? item.asignados
        : []
      ).map((asignado) => ({
        id: TEXTO(asignado?.Id ?? asignado?.id),
        nombre: TEXTO(asignado?.Nombre ?? asignado?.nombre),
        cargo: TEXTO(asignado?.Cargo ?? asignado?.cargo),
        grupoId: TEXTO(asignado?.GrupoId ?? asignado?.grupoId),
        asignadoEl: asignado?.AsignadoEl ?? asignado?.asignadoEl ?? null,
        asignadoPor:
          TEXTO(asignado?.AsignadoPor ?? asignado?.asignadoPor) || "",
      })),
    };
  });

const normalizarEquipos = (equipos) =>
  (Array.isArray(equipos) ? equipos : []).map((item) => {
    const equipoId = TEXTO(item?.EquipoId ?? item?.equipoId);
    const inventarioId = TEXTO(item?.InventarioId ?? item?.inventarioId) || equipoId;
    const catalogo = MAPA_EQUIPOS.get(equipoId);

    return {
      equipoId: inventarioId || equipoId,
      inventarioId,
      equipo:
        TEXTO(item?.Equipo ?? item?.equipo) ||
        catalogo?.nombre ||
        "Equipo sin catalogar",
      placa: TEXTO(item?.Placa ?? item?.placa),
      categoria:
        TEXTO(item?.Categoria ?? item?.categoria) ||
        catalogo?.categoria ||
        "Sin categoría",
      subcategoria: TEXTO(item?.Subcategoria ?? item?.subcategoria),
      descripcion: TEXTO(item?.Descripcion ?? item?.descripcion),
      imagenActualizadaEn:
        item?.ImagenActualizadaEn ?? item?.imagenActualizadaEn ?? null,
      restricciones: (
        Array.isArray(item?.Restricciones ?? item?.restricciones)
          ? item.Restricciones ?? item.restricciones
          : []
      )
        .map((restriccion) => TEXTO(restriccion?.texto ?? restriccion))
        .filter(Boolean),
      restriccionesAceptadasPor: TEXTO(
        item?.RestriccionesAceptadasPor ?? item?.restriccionesAceptadasPor
      ),
      restriccionesAceptadasPorId: TEXTO(
        item?.RestriccionesAceptadasPorId ?? item?.restriccionesAceptadasPorId
      ),
      restriccionesAceptadasEl:
        item?.RestriccionesAceptadasEl ?? item?.restriccionesAceptadasEl ?? null,
      cantidad: Number(item?.Cantidad ?? item?.cantidad) || 1,
      notas: TEXTO(item?.Notas ?? item?.notas),
    };
  });

const normalizarHistorial = (historial, idRequerimiento) =>
  (Array.isArray(historial) ? historial : []).map((entrada, indice) => {
    const el = entrada?.El ?? entrada?.el ?? null;

    return {
      id: `${idRequerimiento || "req"}-hist-${indice}-${el || indice}`,
      tipo: TEXTO(entrada?.Tipo ?? entrada?.tipo) || "actualizacion",
      estadoAnterior:
        TEXTO(entrada?.EstadoAnterior ?? entrada?.estadoAnterior) || null,
      estadoNuevo:
        TEXTO(entrada?.EstadoNuevo ?? entrada?.estadoNuevo) || null,
      por: TEXTO(entrada?.Por ?? entrada?.por) || "Administrador",
      el,
      nota: TEXTO(entrada?.Nota ?? entrada?.nota),
    };
  });

export const checklistPlanner = (campos, { incluirId = false } = {}) => {
  const items = [];

  if (incluirId) {
    items.push({
      clave: "id",
      label: "Identificador del evento",
      ok: Boolean(TEXTO(campos?.id)),
    });
  }

  items.push(
    {
      clave: "nombre",
      label: "Nombre del evento",
      ok: Boolean(TEXTO(campos?.nombre)),
    },
    {
      clave: "fecha",
      label: "Fecha clave",
      ok: Boolean(campos?.fechaClave),
    },
    {
      clave: "horario",
      label: "Hora de inicio y fin distintas",
      ok: Boolean(
        campos?.horaInicio &&
          campos?.horaFin &&
          campos.horaInicio !== campos.horaFin
      ),
    },
    {
      clave: "color",
      label: "Color del evento",
      ok: colorValido(campos?.color),
    }
  );

  return items;
};

export const validarPlanner = (campos, opciones = {}) => {
  const items = checklistPlanner(campos, opciones);
  const faltantes = items
    .filter((item) => !item.ok)
    .map((item) => item.label);

  return {
    valido: faltantes.length === 0,
    faltantes,
    items,
  };
};

/** Normaliza un documento del API para que la UI no dependa de mayúsculas. */
export const normalizarRequerimiento = (doc) => {
  const raw = doc ?? {};
  const id = TEXTO(raw._id ?? raw.id);
  const nombre = TEXTO(raw.Nombre ?? raw.nombre);
  const fechaClave = claveDiaLocal(raw.Fecha_clave ?? raw.fechaClave) ?? "";
  const fechaEnd =
    claveDiaLocal(raw.Fecha_end ?? raw.fechaEnd) || fechaClave;
  const timeIn = raw.Time_in ?? raw.timeIn;
  const timeOut = raw.Time_out ?? raw.timeOut;
  const horaInicio = horaTexto(timeIn);
  const horaFin = horaTexto(timeOut);
  const horasCalculadas = horasEntreHoras(horaInicio, horaFin);
  const inicioMinutos = minutosDelDia(timeIn);
  const finMinutos = minutosDelDia(timeOut);
  const color = colorSeguro(raw.Color ?? raw.color);

  const prioridad = TEXTO(raw.Prioridad ?? raw.prioridad);
  const estado = TEXTO(raw.Estado ?? raw.estado);
  const departamento = departamentoHeredado(
    raw.Departamento ?? raw.departamento
  );

  const requerimiento = {
    id,
    nombre,
    nombreVisible: nombre || "Programador sin nombre",
    codigo: TEXTO(raw.Codigo ?? raw.codigo),
    departamento,
    prioridad: PRIORIDADES.includes(prioridad) ? prioridad : "Media",
    estado: ESTADOS.includes(estado) ? estado : "Pendiente",
    programa: programaHeredado(nombre),
    tipoEvento: tipoEventoHeredado(departamento),
    locacion: TEXTO(raw.Locacion ?? raw.locacion),
    descripcion: TEXTO(raw.Descripcion ?? raw.descripcion),
    observacion: TEXTO(raw.Observacion ?? raw.observacion),
    fechaClave,
    fechaEnd,
    horaInicio,
    horaFin,
    inicioMinutos,
    finMinutos,
    color,
    timeIn,
    timeOut,
    minutos: minutosEntreFechas(timeIn, timeOut) ?? 0,
    cruzaMedianoche:
      inicioMinutos !== null &&
      finMinutos !== null &&
      finMinutos < inicioMinutos,
    solicitante: normalizarSolicitante(raw.Solicitante ?? raw.solicitante),
    personal: normalizarPersonal(raw.Personal ?? raw.personal).map((item) => ({
      ...item,
      horas: horasCalculadas,
    })),
    equipos: normalizarEquipos(raw.Equipos ?? raw.equipos),
    historial: normalizarHistorial(
      raw.Historial ?? raw.historial,
      id || nombre
    ),
    revision: Number(raw.Revision ?? raw.revision) || 0,
    creadoPor: TEXTO(raw.CreadoPor ?? raw.creadoPor),
    creadoEn: raw.createdAt ?? raw.creadoEn ?? null,
    actualizadoPor: TEXTO(raw.ActualizadoPor ?? raw.actualizadoPor),
    decididoPor: TEXTO(raw.DecididoPor ?? raw.decididoPor),
    decididoEn: raw.DecididoEn ?? raw.decididoEn ?? null,
    motivoDecision: TEXTO(raw.MotivoDecision ?? raw.motivoDecision),
  };

  const validacion = validarPlanner(
    {
      id: requerimiento.id,
      nombre: requerimiento.nombre,
      fechaClave,
      horaInicio,
      horaFin,
      color,
    },
    { incluirId: true }
  );

  const estadoUI = estadoProgrammerUI(requerimiento.estado);
  const personalResumen = resumenPersonalProgrammer(requerimiento.personal);

  return {
    ...requerimiento,
    camposCompletos: validacion.valido,
    puedeEditar: true,
    puedeAsignar: estadoUI.puedeAsignar,
    puedeDecidir: estadoUI.puedeDecidir,
    esFinal: estadoUI.esFinal,
    listoPlanner: estadoUI.aprobado && validacion.valido,
    personalResumen,
    personalCompleto: personalResumen.completo,
    faltantesPlanner: validacion.faltantes,
    checklistPlanner: validacion.items,
  };
};

const esCorreoValido = (correo) =>
  !correo || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

export const validarRequerimiento = (formulario) => {
  const errores = {};

  if (!TEXTO(formulario?.nombre)) {
    errores.nombre = "Escribe el nombre del programador";
  }

  const fechaClave = parseFechaLocal(formulario?.fechaClave);
  if (!fechaClave) {
    errores.fechaClave = "Selecciona la fecha del evento";
  }

  const fechaEnd = parseFechaLocal(formulario?.fechaEnd);
  if (!fechaEnd) {
    errores.fechaEnd = "Selecciona la fecha de vigencia";
  } else if (fechaClave && fechaEnd.getTime() < fechaClave.getTime()) {
    errores.fechaEnd = "La vigencia no puede ser anterior a la fecha del evento";
  }

  const inicio = minutosDeHora(formulario?.horaInicio);
  const fin = minutosDeHora(formulario?.horaFin);

  if (inicio === null) {
    errores.horaInicio = "Indica una hora de inicio válida";
  }
  if (fin === null) {
    errores.horaFin = "Indica una hora de fin válida";
  } else if (inicio !== null && inicio === fin) {
    errores.horaFin = "La hora de fin debe ser distinta a la hora de inicio";
  }

  if (!colorValido(formulario?.color)) {
    errores.color = "Selecciona un color válido";
  }

  if (!esCorreoValido(TEXTO(formulario?.solicitante?.correo))) {
    errores.correo = "El correo del solicitante no es válido";
  }

  (Array.isArray(formulario?.personal) ? formulario.personal : []).forEach(
    (item, indice) => {
      const rolId = TEXTO(item?.rolId);
      const tieneDatos =
        Boolean(rolId) ||
        Boolean(TEXTO(item?.notas)) ||
        Number(item?.cantidad) > 0 ||
        Number(item?.horas) > 0;

      if (!rolId && tieneDatos) {
        errores[`personal_${indice}`] = "Selecciona el rol de esta fila";
      } else if (rolId && Number(item?.cantidad) <= 0) {
        errores[`personal_${indice}_cantidad`] =
          "Indica una cantidad mayor a 0";
      }
    }
  );

  (Array.isArray(formulario?.equipos) ? formulario.equipos : []).forEach(
    (item, indice) => {
      const equipoId = TEXTO(item?.equipoId) || TEXTO(item?.inventarioId);
      const tieneDatos =
        Boolean(equipoId) ||
        Boolean(TEXTO(item?.notas)) ||
        Number(item?.cantidad) > 0;

      if (!equipoId && tieneDatos) {
        errores[`equipo_${indice}`] = "Selecciona el equipo de esta fila";
      } else if (equipoId && Number(item?.cantidad) <= 0) {
        errores[`equipo_${indice}_cantidad`] =
          "Indica una cantidad mayor a 0";
      }
    }
  );

  const equiposConRestricciones = (Array.isArray(formulario?.equipos)
    ? formulario.equipos
    : []
  ).some(
    (item) =>
      (TEXTO(item?.equipoId) || TEXTO(item?.inventarioId)) &&
      Array.isArray(item?.restricciones) &&
      item.restricciones.length > 0
  );

  if (equiposConRestricciones && !formulario?.aceptaRestricciones) {
    errores.aceptaRestricciones =
      "Debes leer y aceptar las restricciones de los equipos seleccionados";
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
  };
};

export const requerimientoAFormulario = (
  requerimiento,
  fechaInicial
) => {
  const esEdicion = Boolean(requerimiento);
  const fechaBase =
    claveDiaLocal(parseFechaLocal(fechaInicial) ?? new Date()) ??
    claveDiaLocal(new Date());
  const req = requerimiento ?? {};
  const fechaClave = esEdicion ? req.fechaClave || fechaBase : fechaBase;
  const fechaEnd = esEdicion
    ? req.fechaEnd || req.fechaClave || fechaBase
    : fechaBase;
  const departamento = esEdicion
    ? tipoEventoHeredado(req.departamento)
    : "";
  const horaInicio = esEdicion ? req.horaInicio ?? "" : "08:00";
  const horaFin = esEdicion ? req.horaFin ?? "" : "09:00";
  const horasCalculadas = horasEntreHoras(horaInicio, horaFin);

  return {
    nombre: esEdicion ? req.nombre ?? "" : "",
    codigo: esEdicion ? req.codigo ?? "" : "",
    departamento,
    prioridad: req.prioridad ?? "Media",
    estado: req.estado ?? "Pendiente",
    programa: esEdicion ? programaHeredado(req.nombre) : "",
    tipoEvento: departamento,
    fechaClave,
    fechaEnd,
    horaInicio,
    horaFin,
    locacion: req.locacion ?? "",
    color: req.color ?? "#000000",
    descripcion: req.descripcion ?? "",
    observacion: req.observacion ?? "",
    solicitante: {
      nombre: req.solicitante?.nombre ?? "",
      cargo: req.solicitante?.cargo ?? "",
      correo: req.solicitante?.correo ?? "",
      telefono: req.solicitante?.telefono ?? "",
    },
    personal: (req.personal ?? []).map((item) => ({
      rolId: item.rolId ?? "",
      rol: item.rol ?? "",
      cantidad: item.cantidad ?? 0,
      horas: horasCalculadas,
      notas: item.notas ?? "",
    })),
    equipos: (req.equipos ?? []).map((item) => ({
      equipoId: item.equipoId ?? item.inventarioId ?? "",
      inventarioId: item.inventarioId ?? item.equipoId ?? "",
      equipo: item.equipo ?? "",
      placa: item.placa ?? "",
      categoria: item.categoria ?? "",
      subcategoria: item.subcategoria ?? "",
      descripcion: item.descripcion ?? "",
      imagenActualizadaEn: item.imagenActualizadaEn ?? null,
      restricciones: item.restricciones ?? [],
      restriccionesAceptadasPor: item.restriccionesAceptadasPor ?? "",
      restriccionesAceptadasPorId: item.restriccionesAceptadasPorId ?? "",
      restriccionesAceptadasEl: item.restriccionesAceptadasEl ?? null,
      cantidad: item.cantidad ?? 1,
      notas: item.notas ?? "",
    })),
    aceptaRestricciones: false,
    notaCambio: "",
  };
};

export const formularioAPayload = (formulario) => {
  const fechaClave = parseFechaLocal(formulario?.fechaClave);
  const fechaEnd = parseFechaLocal(formulario?.fechaEnd) ?? fechaClave;
  const horasCalculadas = horasEntreHoras(
    formulario?.horaInicio,
    formulario?.horaFin
  );

  const personal = (Array.isArray(formulario?.personal)
    ? formulario.personal
    : []
  )
    .filter((item) => TEXTO(item?.rolId))
    .map((item) => ({
      rolId: TEXTO(item.rolId),
      rol: TEXTO(item.rol) || MAPA_ROLES.get(item.rolId) || "",
      cantidad: Number(item.cantidad) || 0,
      horas: horasCalculadas,
      notas: TEXTO(item.notas),
    }));

  const equipos = (Array.isArray(formulario?.equipos)
    ? formulario.equipos
    : []
  )
    .filter((item) => TEXTO(item?.equipoId) || TEXTO(item?.inventarioId))
    .map((item) => {
      const inventarioId = TEXTO(item?.inventarioId) || TEXTO(item?.equipoId);
      const catalogo = MAPA_EQUIPOS.get(inventarioId);
      return {
        equipoId: inventarioId,
        inventarioId,
        equipo: TEXTO(item.equipo) || catalogo?.nombre || "",
        placa: TEXTO(item.placa),
        categoria: TEXTO(item.categoria) || catalogo?.categoria || "",
        subcategoria: TEXTO(item.subcategoria),
        descripcion: TEXTO(item.descripcion),
        imagenActualizadaEn: item.imagenActualizadaEn ?? null,
        restricciones: (Array.isArray(item.restricciones) ? item.restricciones : [])
          .map((restriccion) => TEXTO(restriccion?.texto ?? restriccion))
          .filter(Boolean),
        restriccionesAceptadasPor: TEXTO(item.restriccionesAceptadasPor),
        restriccionesAceptadasPorId: TEXTO(item.restriccionesAceptadasPorId),
        restriccionesAceptadasEl: item.restriccionesAceptadasEl ?? null,
        cantidad: 1,
        notas: TEXTO(item.notas),
      };
    });

  return {
    nombre: TEXTO(formulario?.nombre),
    codigo: TEXTO(formulario?.codigo) || undefined,
    departamento: TEXTO(formulario?.departamento),
    prioridad: TEXTO(formulario?.prioridad) || "Media",
    programa: programaHeredado(formulario?.nombre),
    tipoEvento: tipoEventoHeredado(formulario?.departamento),
    fechaClave,
    fechaStart: fechaClave,
    fechaEnd,
    timeIn: construirFechaHora(formulario?.fechaClave, formulario?.horaInicio),
    timeOut: construirFechaHora(formulario?.fechaClave, formulario?.horaFin),
    locacion: TEXTO(formulario?.locacion),
    color: colorSeguro(formulario?.color),
    descripcion: TEXTO(formulario?.descripcion),
    observacion: TEXTO(formulario?.observacion),
    notaCambio: TEXTO(formulario?.notaCambio),
    solicitante: {
      nombre: TEXTO(formulario?.solicitante?.nombre),
      cargo: TEXTO(formulario?.solicitante?.cargo),
      correo: TEXTO(formulario?.solicitante?.correo),
      telefono: TEXTO(formulario?.solicitante?.telefono),
    },
    personal,
    equipos,
    aceptaRestricciones: Boolean(formulario?.aceptaRestricciones),
  };
};
