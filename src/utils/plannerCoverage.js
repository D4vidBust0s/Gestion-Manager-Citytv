/**
 * Cálculo puro de la cobertura del MainPlanner.
 *
 * No depende de React ni de la API: recibe las listas ya cargadas y devuelve
 * el resumen global, el detalle por grupo y la lista de pendientes.
 *
 * Regla de clasificación por persona (una sola vez):
 *   1. Ausencia activa -> requiere sustitución.
 *   2. UserBalancer -> requiere sustitución.
 *   3. Trabajador normal -> requiere turno.
 */

import { isBalancerUser } from "../api/payroll";
import { mismoDia, rangoCubreFecha } from "./plannerStack";

export const TIPOS_AUSENCIA = [
  {
    key: "permiso",
    source: "permissions",
    label: "Permiso",
    color: "#E9BD1A",
  },
  {
    key: "incapacidad",
    source: "incapacitys",
    label: "Incapacidad",
    color: "#EB464B",
  },
  {
    key: "vacaciones",
    source: "recess",
    label: "Vacaciones",
    color: "#dd6c21",
  },
  {
    key: "licencia",
    source: "licenses",
    label: "Licencia",
    color: "#00094B",
  },
  {
    key: "descanso",
    source: "breaks",
    label: "Descanso",
    color: "#2f800d",
  },
  {
    key: "compensatorio",
    source: "compensatories",
    label: "Compensatorio",
    color: "#a308a8",
  },
];

const dosDigitos = (valor) => String(valor).padStart(2, "0");

/** Clave local de un día: YYYY-MM-DD. */
export const claveDiaLocal = (fecha) => {
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return null;

  return [
    valor.getFullYear(),
    dosDigitos(valor.getMonth() + 1),
    dosDigitos(valor.getDate()),
  ].join("-");
};

/** Medianoche local expresada como ISO, que es lo que espera /shifts/daykey. */
export const isoInicioDiaLocal = (fecha) => {
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return null;

  valor.setHours(0, 0, 0, 0);
  return valor.toISOString();
};

const idDe = (registro) => String(registro?._id ?? registro?.id ?? "");

const nombreDe = (persona) => {
  const nombre = `${persona?.nombres ?? persona?.Nombres ?? ""} ${
    persona?.apellidos ?? persona?.Apellidos ?? ""
  }`.trim();

  return nombre || "Sin nombre";
};

const grupoDe = (persona) =>
  persona?.grupoID ?? persona?.GrupoID ?? persona?.grupo ?? persona?.Grupo ?? "";

const estaActivo = (persona) =>
  persona?.activo === true || persona?.Activo === true;

const esBalancer = (persona) => {
  const cargo = String(
    persona?.cargo ?? persona?.Cargo ?? ""
  )
    .trim()
    .toUpperCase();

  return cargo === "USERBALANCER" || isBalancerUser(persona);
};

const esGrupoDelPlanner = (grupo) =>
  String(grupo?.mainplanner ?? "").trim() === "MainPlanner";

const calcularPorcentaje = (cubiertos, personal) => {
  if (!personal) return null;
  if (cubiertos >= personal) return 100;

  return Math.max(0, Math.min(99, Math.floor((cubiertos / personal) * 100)));
};

const crearResumenGrupo = (grupo) => ({
  id: idDe(grupo),
  nombre: grupo?.nombre ?? "Sin nombre",
  personal: 0,
  programados: 0,
  sinTurno: 0,
  ausencias: 0,
  ausenciasCubiertas: 0,
  ausenciasPendientes: 0,
  balancers: 0,
  balancersCubiertos: 0,
  balancersPendientes: 0,
  cubiertos: 0,
  pendientes: 0,
  porcentaje: null,
  ausenciasConTurno: 0,
});

const cerrarResumenGrupo = (resumen) => {
  resumen.cubiertos =
    resumen.programados + resumen.ausenciasCubiertas + resumen.balancersCubiertos;
  resumen.pendientes =
    resumen.sinTurno + resumen.ausenciasPendientes + resumen.balancersPendientes;
  resumen.porcentaje = calcularPorcentaje(resumen.cubiertos, resumen.personal);

  return resumen;
};

/**
 * @param {Object} entrada
 * @param {Array} entrada.groups
 * @param {Array} entrada.payroll
 * @param {Array} entrada.shifts
 * @param {Object} entrada.ausencias  Listas por fuente: permissions, breaks, ...
 * @param {Array} entrada.substitutions
 * @param {Date|string} entrada.fecha
 */
export const calcularCoberturaPlanner = ({
  groups = [],
  payroll = [],
  shifts = [],
  ausencias = {},
  substitutions = [],
  fecha,
} = {}) => {
  const fechaDate = new Date(fecha);
  const fechaKey = claveDiaLocal(fechaDate);

  if (!fechaKey) {
    return {
      fecha: null,
      fechaKey: null,
      totales: {
        personal: 0,
        grupos: 0,
        gruposConPersonal: 0,
        programados: 0,
        sinTurno: 0,
        ausencias: 0,
        ausenciasCubiertas: 0,
        ausenciasPendientes: 0,
        balancers: 0,
        balancersCubiertos: 0,
        balancersPendientes: 0,
        cubiertos: 0,
        pendientes: 0,
        porcentaje: null,
        ausenciasConTurno: 0,
        inactivos: 0,
        excluidos: 0,
      },
      porGrupo: [],
      porTipo: [],
      pendientes: [],
      alertas: ["La fecha seleccionada no es válida."],
    };
  }

  const gruposPlanner = (Array.isArray(groups) ? groups : []).filter(
    esGrupoDelPlanner
  );

  const grupoPorId = new Map();
  const grupoPorNombre = new Map();

  gruposPlanner.forEach((grupo) => {
    const id = idDe(grupo);
    if (id) grupoPorId.set(id, grupo);

    const nombre = String(grupo?.nombre ?? "").trim().toLowerCase();
    if (nombre) grupoPorNombre.set(nombre, grupo);
  });

  const resolverGrupo = (persona) => {
    const referencia = String(grupoDe(persona) ?? "").trim();
    if (!referencia) return null;

    return (
      grupoPorId.get(referencia) ??
      grupoPorNombre.get(referencia.toLowerCase()) ??
      null
    );
  };

  const resumenesPorGrupo = new Map();
  gruposPlanner.forEach((grupo) => {
    resumenesPorGrupo.set(idDe(grupo), crearResumenGrupo(grupo));
  });

  /* Turnos del día: cualquier turno del trabajador cubre su programación. */
  const usuariosConTurno = new Set();
  (Array.isArray(shifts) ? shifts : []).forEach((turno) => {
    const id = String(turno?.ID_user ?? "").trim();
    if (!id || !mismoDia(turno?.Fecha_clave, fechaDate)) return;

    usuariosConTurno.add(id);
  });

  /* Reemplazos del día: uno por persona, con sustituto real. */
  const sustitucionesPorMain = new Map();
  (Array.isArray(substitutions) ? substitutions : []).forEach((sustitucion) => {
    const idMain = String(sustitucion?.ID_user_main ?? "").trim();
    const idSustituto = String(
      sustitucion?.ID_user_sustituto ?? ""
    ).trim();

    if (!idMain || !idSustituto) return;
    if (!mismoDia(sustitucion?.Fecha_dia, fechaDate)) return;
    if (sustitucionesPorMain.has(idMain)) return;

    sustitucionesPorMain.set(idMain, sustitucion);
  });

  /* Ausencias activas por persona y tipo. */
  const ausenciasPorUsuario = new Map();

  TIPOS_AUSENCIA.forEach((tipo) => {
    const registros = Array.isArray(ausencias?.[tipo.source])
      ? ausencias[tipo.source]
      : [];

    registros.forEach((registro) => {
      const idUsuario = String(
        registro?.Id_Empleado ?? registro?.idempleado ?? ""
      ).trim();

      if (!idUsuario) return;
      if (!rangoCubreFecha([registro], idUsuario, fechaDate)) return;

      const tipos = ausenciasPorUsuario.get(idUsuario) ?? new Set();
      tipos.add(tipo.key);
      ausenciasPorUsuario.set(idUsuario, tipos);
    });
  });

  const porTipo = Object.fromEntries(
    TIPOS_AUSENCIA.map((tipo) => [
      tipo.key,
      {
        key: tipo.key,
        label: tipo.label,
        color: tipo.color,
        total: 0,
        cubiertas: 0,
        pendientes: 0,
      },
    ])
  );

  const pendientes = [];
  const alertas = [];
  let inactivos = 0;
  let excluidos = 0;
  let ausenciasConTurno = 0;
  let personal = 0;

  const idsEvaluados = new Set();

  (Array.isArray(payroll) ? payroll : []).forEach((persona) => {
    const id = idDe(persona);
    if (!id || idsEvaluados.has(id)) return;
    idsEvaluados.add(id);

    if (!estaActivo(persona)) {
      inactivos += 1;
      return;
    }

    const grupo = resolverGrupo(persona);
    if (!grupo) {
      excluidos += 1;
      return;
    }

    const resumenGrupo = resumenesPorGrupo.get(idDe(grupo));
    if (!resumenGrupo) {
      excluidos += 1;
      return;
    }

    personal += 1;
    resumenGrupo.personal += 1;

    const nombre = nombreDe(persona);
    const tieneTurno = usuariosConTurno.has(id);
    const sustitucion = sustitucionesPorMain.get(id);
    const tieneReemplazo = Boolean(sustitucion);

    const tipos = ausenciasPorUsuario.get(id);
    const esPersonaBalancer = esBalancer(persona);

    if (tipos && tipos.size > 0) {
      const tipoPrimario = TIPOS_AUSENCIA.find((tipo) =>
        tipos.has(tipo.key)
      );

      const cubierto = tieneReemplazo;

      resumenGrupo.ausencias += 1;
      resumenGrupo.ausenciasCubiertas += cubierto ? 1 : 0;
      resumenGrupo.ausenciasPendientes += cubierto ? 0 : 1;

      if (tieneTurno) {
        ausenciasConTurno += 1;
        resumenGrupo.ausenciasConTurno += 1;
      }

      if (tipoPrimario) {
        const acumulado = porTipo[tipoPrimario.key];
        acumulado.total += 1;
        acumulado.cubiertas += cubierto ? 1 : 0;
        acumulado.pendientes += cubierto ? 0 : 1;
      }

      if (!cubierto) {
        pendientes.push({
          id,
          nombre,
          grupoId: idDe(grupo),
          grupoNombre: resumenGrupo.nombre,
          categoria: "ausencia",
          tipo: tipoPrimario?.key ?? "ausencia",
          motivo: `${tipoPrimario?.label ?? "Ausencia"} sin reemplazo`,
          detalle: TIPOS_AUSENCIA.filter((tipo) =>
            tipos.has(tipo.key)
          )
            .map((tipo) => tipo.label)
            .join(" · "),
          reemplazo: "",
          tieneTurno,
        });
      }

      return;
    }

    if (esPersonaBalancer) {
      const cubierto = tieneReemplazo;

      resumenGrupo.balancers += 1;
      resumenGrupo.balancersCubiertos += cubierto ? 1 : 0;
      resumenGrupo.balancersPendientes += cubierto ? 0 : 1;

      if (!cubierto) {
        pendientes.push({
          id,
          nombre,
          grupoId: idDe(grupo),
          grupoNombre: resumenGrupo.nombre,
          categoria: "balancer",
          tipo: "balancer",
          motivo: "UserBalancer sin reemplazo",
          detalle: "Usuario virtual de balanceo",
          reemplazo: "",
          tieneTurno,
        });
      }

      return;
    }

    if (tieneTurno) {
      resumenGrupo.programados += 1;
      return;
    }

    resumenGrupo.sinTurno += 1;
    pendientes.push({
      id,
      nombre,
      grupoId: idDe(grupo),
      grupoNombre: resumenGrupo.nombre,
      categoria: "turno",
      tipo: "turno",
      motivo: "Sin turno asignado",
      detalle: "Trabajador activo sin programación",
      reemplazo: "",
      tieneTurno: false,
    });
  });

  const porGrupo = [...resumenesPorGrupo.values()]
    .map(cerrarResumenGrupo)
    .sort((a, b) => {
      if (a.personal === 0 && b.personal > 0) return 1;
      if (b.personal === 0 && a.personal > 0) return -1;

      return a.nombre.localeCompare(b.nombre, "es");
    });

  const totales = porGrupo.reduce(
    (acumulado, grupo) => {
      acumulado.programados += grupo.programados;
      acumulado.sinTurno += grupo.sinTurno;
      acumulado.ausencias += grupo.ausencias;
      acumulado.ausenciasCubiertas += grupo.ausenciasCubiertas;
      acumulado.ausenciasPendientes += grupo.ausenciasPendientes;
      acumulado.balancers += grupo.balancers;
      acumulado.balancersCubiertos += grupo.balancersCubiertos;
      acumulado.balancersPendientes += grupo.balancersPendientes;
      acumulado.cubiertos += grupo.cubiertos;
      acumulado.pendientes += grupo.pendientes;
      acumulado.ausenciasConTurno += grupo.ausenciasConTurno;

      return acumulado;
    },
    {
      personal,
      grupos: gruposPlanner.length,
      gruposConPersonal: porGrupo.filter((grupo) => grupo.personal > 0).length,
      programados: 0,
      sinTurno: 0,
      ausencias: 0,
      ausenciasCubiertas: 0,
      ausenciasPendientes: 0,
      balancers: 0,
      balancersCubiertos: 0,
      balancersPendientes: 0,
      cubiertos: 0,
      pendientes: 0,
      porcentaje: null,
      ausenciasConTurno: 0,
      inactivos,
      excluidos,
    }
  );

  totales.porcentaje = calcularPorcentaje(totales.cubiertos, totales.personal);

  if (ausenciasConTurno > 0) {
    alertas.push(
      `${ausenciasConTurno} ${
        ausenciasConTurno === 1 ? "ausencia conserva" : "ausencias conservan"
      } turno asignado; revisar si es intencional.`
    );
  }

  if (excluidos > 0) {
    alertas.push(
      `${excluidos} ${
        excluidos === 1
          ? "trabajador activo está fuera"
          : "trabajadores activos están fuera"
      } de los grupos MainPlanner y no se evaluaron.`
    );
  }

  if (totales.personal === 0) {
    alertas.push("No hay personal activo en los grupos MainPlanner.");
  }

  return {
    fecha: fechaDate,
    fechaKey,
    totales,
    porGrupo,
    porTipo: Object.values(porTipo),
    pendientes,
    alertas,
  };
};
