import { shiftsApi } from "../api/shifts";
import { claveDiaLocal, isoInicioDiaLocal } from "./plannerCoverage";

const texto = (valor) =>
  valor === null || valor === undefined ? "" : String(valor).trim();

const aFecha = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const aIso = (valor) => {
  const fecha = aFecha(valor);
  return fecha ? fecha.toISOString() : valor;
};

const claveDia = (valor) => {
  const fecha = aFecha(valor);
  return fecha ? claveDiaLocal(fecha) : null;
};

const ordenarExistentes = (turnos = []) =>
  [...turnos].sort((a, b) => {
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

const ordenarPayloads = (payloads = []) =>
  [...payloads].sort((a, b) => {
    const indexA = Number(a?.index);
    const indexB = Number(b?.index);
    if (Number.isFinite(indexA) && Number.isFinite(indexB) && indexA !== indexB) {
      return indexA - indexB;
    }
    return (
      (aFecha(a?.inicioMain)?.getTime() || 0) -
      (aFecha(b?.inicioMain)?.getTime() || 0)
    );
  });

const diasUnicos = (fechas = []) => {
  const dias = new Map();

  (Array.isArray(fechas) ? fechas : []).forEach((fecha) => {
    const date = aFecha(fecha);
    if (!date) return;

    const dia = new Date(date.getTime());
    dia.setHours(0, 0, 0, 0);
    dias.set(claveDiaLocal(dia), dia);
  });

  return [...dias.values()];
};

/**
 * Trae los turnos del trabajador para las fechas afectadas por el stack.
 */
export const cargarTurnosStack = async ({ userId, fechas = [] }) => {
  const dias = diasUnicos(fechas);

  if (!userId || dias.length === 0) return [];

  const listas = await Promise.all(
    dias.map((dia) =>
      shiftsApi.getDayKey({
        params: { daykey: isoInicioDiaLocal(dia) },
      })
    )
  );

  const porId = new Map();

  listas.flat().forEach((turno) => {
    if (
      String(turno?.ID_user ?? "").trim() !== String(userId).trim()
    ) {
      return;
    }

    const id = texto(turno?._id);
    if (id) porId.set(id, turno);
  });

  return [...porId.values()];
};

const construirGrupos = (existentes = [], payloads = []) => {
  const grupos = new Map();

  const obtener = (clave) => {
    if (!clave) return null;
    if (!grupos.has(clave)) {
      grupos.set(clave, { clave, existentes: [], deseados: [] });
    }
    return grupos.get(clave);
  };

  existentes.forEach((turno) => {
    const grupo = obtener(claveDia(turno?.Fecha_clave));
    if (grupo) grupo.existentes.push(turno);
  });

  payloads.forEach((payload) => {
    const grupo = obtener(claveDia(payload?.fechaClave));
    if (grupo) grupo.deseados.push(payload);
  });

  const porFecha = [...grupos.values()]
    .map((grupo) => {
      const actuales = ordenarExistentes(grupo.existentes);
      const deseados = ordenarPayloads(grupo.deseados);
      return {
        clave: grupo.clave,
        existentes: actuales,
        deseados,
        actualizaciones: Math.min(actuales.length, deseados.length),
        eliminaciones: Math.max(actuales.length - deseados.length, 0),
        creaciones: Math.max(deseados.length - actuales.length, 0),
      };
    })
    .filter(
      (grupo) => grupo.existentes.length > 0 || grupo.deseados.length > 0
    );

  const resumen = porFecha.reduce(
    (total, grupo) => {
      total.actualizaciones += grupo.actualizaciones;
      total.eliminaciones += grupo.eliminaciones;
      total.creaciones += grupo.creaciones;
      return total;
    },
    { actualizaciones: 0, eliminaciones: 0, creaciones: 0 }
  );

  return { ...resumen, porFecha };
};

/**
 * Calcula cuántos shifts se actualizan, eliminan y crean para el nuevo stack.
 */
export const planificarStack = async ({ userId, payloads = [], fechas = [] }) => {
  const fechasConsulta = [
    ...fechas,
    ...payloads.map((payload) => payload?.fechaClave),
  ];
  const existentes = await cargarTurnosStack({
    userId,
    fechas: fechasConsulta,
  });

  return construirGrupos(existentes, payloads);
};

const payloadActualizacion = (payload = {}) => ({
  index: payload.index,
  idPrograma: payload.idPrograma,
  eventId: payload.eventId,
  tipo: payload.tipo,
  color: payload.color,
  observacion: payload.observacion,
  idSchema: payload.idSchema,
  inicioMain: aIso(payload.inicioMain),
  out: aIso(payload.out),
  estadoConsolidacion: "Pendiente",
  observacionConsolidacion: "",
});

/**
 * Actualiza el stack programado reutilizando primero los turnos existentes.
 * Solo crea los adicionales necesarios y elimina los sobrantes.
 */
export const aplicarStack = async ({
  userId,
  payloads = [],
  fechas = [],
  confirmarCreacion = false,
}) => {
  const plan = await planificarStack({ userId, payloads, fechas });

  if (plan.creaciones > 0 && !confirmarCreacion) {
    return { requiereConfirmacion: true, plan };
  }

  let actualizados = 0;
  let eliminados = 0;
  let creados = 0;

  for (const grupo of plan.porFecha) {
    const comparables = Math.min(
      grupo.existentes.length,
      grupo.deseados.length
    );

    for (let indice = 0; indice < comparables; indice += 1) {
      await shiftsApi.updateConsolidation(
        grupo.existentes[indice]._id,
        payloadActualizacion(grupo.deseados[indice])
      );
      actualizados += 1;
    }

    for (
      let indice = comparables;
      indice < grupo.existentes.length;
      indice += 1
    ) {
      await shiftsApi.remove(grupo.existentes[indice]._id);
      eliminados += 1;
    }

    for (
      let indice = comparables;
      indice < grupo.deseados.length;
      indice += 1
    ) {
      await shiftsApi.create(grupo.deseados[indice]);
      creados += 1;
    }
  }

  const fechasFinales = [
    ...fechas,
    ...payloads.map((payload) => payload?.fechaClave),
  ];
  const turnos = await cargarTurnosStack({ userId, fechas: fechasFinales });

  return { actualizados, eliminados, creados, turnos, plan };
};

export const consolidarTurnosStack = (updates = []) =>
  shiftsApi.consolidateBulk(updates);

export const fechasDeTurnos = (turnos = []) => {
  const fechas = [];

  (Array.isArray(turnos) ? turnos : []).forEach((turno) => {
    if (turno?.Inicio_main) fechas.push(turno.Inicio_main);
    if (turno?.Out && turno.Out !== "------") fechas.push(turno.Out);
    if (turno?.Fecha_clave) fechas.push(turno.Fecha_clave);
  });

  return fechas;
};
