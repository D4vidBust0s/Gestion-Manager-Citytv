import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";

/* SERVICIOS */
import { api, isCanceled } from "../api/client";
import { breaksApi } from "../api/breaks";
import { compensatoriesApi } from "../api/compensatories";
import { incapacityApi } from "../api/incapacity";
import { licensesApi } from "../api/licenses";
import { payrollApi } from "../api/payroll";
import { permissionsApi } from "../api/permissions";
import { programmerApi } from "../api/programmer";
import { programsApi } from "../api/programs";
import { recessApi } from "../api/recess";
import { rotationsApi } from "../api/rotations";
import { rotationsManagerApi } from "../api/rotationsManager";
import { rulesApi } from "../api/rules";
import { savedStacksApi } from "../api/savedStacks";
import { shiftsApi } from "../api/shifts";
import { stacksApi } from "../api/stacks";
import { substitutionsApi } from "../api/substitutions";

/* UTILIDADES */
// El planificador y Balancer obtienen el mismo rango de /shifts/day a partir
// de Rules, así que se reutiliza la fórmula ya verificada.
import { calcularRango } from "../utils/balancer";
import { mismoDia } from "../utils/plannerStack";

/** Las notas pueden venir como arreglo o dentro de un objeto paginado. */
const extraerLista = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.notations)) return data.notations;

  return [];
};

/**
 * Compara el día de la nota de forma tolerante: las fechas guardadas son
 * medianoche local (p. ej. 05:00Z en Colombia) y viajan como ISO; comparar
 * tanto el día local como el día UTC evita el desfase de un día al
 * interpretar la fecha del planificador.
 */
const mismaFechaNota = (valor, fechaReferencia) => {
  if (mismoDia(valor, fechaReferencia)) return true;

  const nota = new Date(valor);
  const referencia = new Date(fechaReferencia);
  if (Number.isNaN(nota.getTime()) || Number.isNaN(referencia.getTime())) {
    return false;
  }

  return (
    nota.getUTCFullYear() === referencia.getUTCFullYear() &&
    nota.getUTCMonth() === referencia.getUTCMonth() &&
    nota.getUTCDate() === referencia.getUTCDate()
  );
};

/**
 * Datos del planificador de turnos (ModalPlanner1).
 *
 * Aquí vive toda la conversación con la API: una carga inicial cancelable,
 * los refrescos que dependen del trabajador o de la fecha y las escrituras.
 * El componente solo arma payloads y pinta.
 *
 * Los refrescos se agrupan: si se crean N turnos seguidos (stack sugerido o
 * stack guardado), se hace una sola consulta de /shifts y /shifts/full al
 * terminar la ráfaga, en lugar de dos por cada alta.
 */
export const usePlannerData = ({
  iduser,
  fechaPlaner,
  auxiliar,
  showRight,
}) => {
  /* DATOS */
  const [programs, setPrograms] = useState([]);
  const [turnosUsuario, setTurnosUsuario] = useState([]);
  const [rules, setRules] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [breaks, setBreaks] = useState([]);
  const [incapacitys, setIncapacitys] = useState([]);
  const [recess, setRecess] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [rotations, setRotations] = useState([]);
  const [rotationsManager, setRotationsManager] = useState([]);
  const [stacks, setStacks] = useState([]);
  const [shiftsFull, setShiftsFull] = useState([]);
  const [substitutions, setSubstitutions] = useState([]);
  const [programmers, setProgrammers] = useState([]);
  const [notations, setNotations] = useState([]);
  const [savedStacks, setSavedStacks] = useState([]);
  const [shiftsDay, setShiftsDay] = useState([]);
  const [compensatorios, setCompensatorios] = useState([]);

  /* CANCELACIÓN */
  const controladoresRef = useRef(new Map());
  const notationsSeqRef = useRef(0);
  const notasAbortRef = useRef(null);

  useEffect(() => {
    const controladores = controladoresRef.current;
    return () => {
      controladores.forEach((controlador) => controlador.abort());
      controladores.clear();
      if (notasAbortRef.current) notasAbortRef.current.abort();
    };
  }, []);

  /**
   * Ejecuta una lectura con su propio AbortController (una por recurso).
   * Una petición nueva del mismo recurso cancela la anterior, así una
   * respuesta tardía nunca pisa datos más recientes.
   */
  const cargarRecurso = useCallback(
    async (clave, peticion, asignar, mensaje) => {
      const anterior = controladoresRef.current.get(clave);
      if (anterior) anterior.abort();

      const controlador = new AbortController();
      controladoresRef.current.set(clave, controlador);

      try {
        const respuesta = await peticion(controlador.signal);
        if (controlador.signal.aborted) return null;

        const lista = Array.isArray(respuesta) ? respuesta : [];
        asignar(lista);
        return lista;
      } catch (error) {
        if (controlador.signal.aborted || isCanceled(error)) return null;
        console.error(mensaje, error);
        toast.error(error?.message || mensaje);
        return null;
      } finally {
        if (controladoresRef.current.get(clave) === controlador) {
          controladoresRef.current.delete(clave);
        }
      }
    },
    []
  );

  /* LECTURAS INDEPENDIENTES */

  const cargarTurnosUsuario = useCallback(() => {
    if (!iduser) return Promise.resolve(null);

    return cargarRecurso(
      "turnosUsuario",
      (signal) =>
        shiftsApi.getAll({ params: { id: iduser, fecha: fechaPlaner }, signal }),
      setTurnosUsuario,
      "Error al cargar los turnos del trabajador"
    );
  }, [cargarRecurso, iduser, fechaPlaner]);

  const cargarShiftsFull = useCallback(
    () =>
      cargarRecurso(
        "shiftsFull",
        (signal) => shiftsApi.getFull({ signal }),
        setShiftsFull,
        "Error al cargar el listado general de turnos"
      ),
    [cargarRecurso]
  );

  const cargarCompensatorios = useCallback(
    () =>
      cargarRecurso(
        "compensatorios",
        (signal) => compensatoriesApi.getAll({ signal }),
        setCompensatorios,
        "Error al cargar los compensatorios"
      ),
    [cargarRecurso]
  );

  const cargarBreaks = useCallback(
    () =>
      cargarRecurso(
        "breaks",
        (signal) => breaksApi.getAll({ signal }),
        setBreaks,
        "Error al cargar los descansos"
      ),
    [cargarRecurso]
  );

  const cargarRotations = useCallback(
    () =>
      cargarRecurso(
        "rotations",
        (signal) => rotationsApi.getAll({ signal }),
        setRotations,
        "Error al cargar las rotaciones"
      ),
    [cargarRecurso]
  );

  const cargarStacks = useCallback(
    () =>
      cargarRecurso(
        "stacks",
        (signal) => stacksApi.getAll({ signal }),
        setStacks,
        "Error al cargar los esquemas de turnos"
      ),
    [cargarRecurso]
  );

  const cargarStacksGuardados = useCallback(
    () =>
      cargarRecurso(
        "savedStacks",
        (signal) => savedStacksApi.getAll({ signal }),
        setSavedStacks,
        "Error al cargar los stacks guardados"
      ),
    [cargarRecurso]
  );

  const cargarProgrammers = useCallback(
    () =>
      cargarRecurso(
        "programmers",
        (signal) =>
          programmerApi.getAll({ params: { fecha: fechaPlaner }, signal }),
        setProgrammers,
        "Error al cargar los eventos programados"
      ),
    [cargarRecurso, fechaPlaner]
  );

  const cargarNotations = useCallback(async () => {
    if (!iduser || !fechaPlaner) return null;

    //Solo la última carga solicitada puede escribir el estado
    const solicitud = notationsSeqRef.current + 1;
    notationsSeqRef.current = solicitud;

    //Se cancela cualquier consulta de notas anterior
    if (notasAbortRef.current) notasAbortRef.current.abort();
    const controlador = new AbortController();
    notasAbortRef.current = controlador;

    const fechaIso = new Date(fechaPlaner).toISOString();
    const fechaDia = fechaIso.slice(0, 10);
    const fechaTexto = new Date(fechaPlaner).toDateString();

    const consultar = async (params) => {
      try {
        const { data } = await api.get("/notations", {
          params,
          signal: controlador.signal,
        });

        return extraerLista(data);
      } catch (error) {
        if (isCanceled(error)) throw error;
        return [];
      }
    };

    //Estrategias por si el backend exige fecha, la compara distinto o filtra
    //solo por trabajador. Se detiene en la primera que traiga notas del día.
    const estrategias = [
      { id: iduser },
      { id: iduser, fecha: fechaIso },
      { id: iduser, fecha: fechaDia },
      { id: iduser, fecha: fechaTexto },
      { iduser: iduser },
      { fecha: fechaIso },
      {},
    ];

    let filtradas = [];

    try {
      for (const params of estrategias) {
        const lista = await consultar(params);
        if (controlador.signal.aborted) return null;

        const delUsuario = lista.filter(
          (nota) => String(nota?.ID_user ?? "") === String(iduser)
        );
        const delDia = delUsuario.filter((nota) =>
          mismaFechaNota(nota?.Fecha_clave, fechaPlaner)
        );

        if (delDia.length > 0) {
          filtradas = delDia;
          break;
        }
      }
    } catch (error) {
      if (isCanceled(error)) return null;
      console.error("Error al cargar las anotaciones:", error);
      return null;
    }

    if (solicitud !== notationsSeqRef.current) return null;

    setNotations(filtradas);
    return filtradas;
  }, [iduser, fechaPlaner]);

  /* TURNOS DEL PERIODO (dependen de Rules) */

  const rango = useMemo(() => calcularRango(rules), [rules]);
  const rangoIn = rango?.in ?? "";
  const rangoOut = rango?.out ?? "";

  const cargarTurnosDia = useCallback(() => {
    if (!rangoIn || !rangoOut) return Promise.resolve(null);

    return cargarRecurso(
      "shiftsDay",
      (signal) =>
        shiftsApi.getDay({
          params: { in: rangoIn, out: rangoOut },
          signal,
        }),
      setShiftsDay,
      "Error al cargar los turnos del periodo"
    );
  }, [cargarRecurso, rangoIn, rangoOut]);

  /* REFRESCO AGRUPADO DE TURNOS */

  const refrescoPendienteRef = useRef(false);
  const refrescoEnCursoRef = useRef(null);

  /**
   * Vuelve a leer /shifts (del trabajador) y /shifts/full. Las llamadas que
   * llegan mientras hay un refresco en curso se acumulan en uno solo.
   */
  const recargarTurnos = useCallback(() => {
    refrescoPendienteRef.current = true;

    if (!refrescoEnCursoRef.current) {
      refrescoEnCursoRef.current = (async () => {
        try {
          while (refrescoPendienteRef.current) {
            refrescoPendienteRef.current = false;
            await Promise.all([cargarTurnosUsuario(), cargarShiftsFull()]);
          }
        } finally {
          refrescoEnCursoRef.current = null;
        }
      })();
    }

    return refrescoEnCursoRef.current;
  }, [cargarTurnosUsuario, cargarShiftsFull]);

  /* CARGA INICIAL DE CATÁLOGOS */

  const cargarCatalogos = useCallback(() => {
    cargarRecurso(
      "programs",
      (signal) => programsApi.getAll({ signal }),
      setPrograms,
      "Error al cargar los programas"
    );
    cargarRecurso(
      "rules",
      (signal) => rulesApi.getAll({ signal }),
      setRules,
      "Error al cargar las reglas"
    );
    cargarRecurso(
      "payroll",
      (signal) => payrollApi.getAll({ signal }),
      setPayroll,
      "Error al cargar el personal"
    );
    cargarRecurso(
      "permissions",
      (signal) => permissionsApi.getAll({ signal }),
      setPermissions,
      "Error al cargar los permisos"
    );
    cargarRecurso(
      "incapacitys",
      (signal) => incapacityApi.getAll({ signal }),
      setIncapacitys,
      "Error al cargar las incapacidades"
    );
    cargarRecurso(
      "recess",
      (signal) => recessApi.getAll({ signal }),
      setRecess,
      "Error al cargar las vacaciones"
    );
    cargarRecurso(
      "licenses",
      (signal) => licensesApi.getAll({ signal }),
      setLicenses,
      "Error al cargar las licencias"
    );
    cargarRecurso(
      "rotations",
      (signal) => rotationsApi.getAll({ signal }),
      setRotations,
      "Error al cargar las rotaciones"
    );
    cargarRecurso(
      "rotationsManager",
      (signal) => rotationsManagerApi.getAll({ signal }),
      setRotationsManager,
      "Error al cargar el estado de las rotaciones"
    );
    cargarRecurso(
      "stacks",
      (signal) => stacksApi.getAll({ signal }),
      setStacks,
      "Error al cargar los esquemas de turnos"
    );
    cargarRecurso(
      "substitutions",
      (signal) => substitutionsApi.getAll({ signal }),
      setSubstitutions,
      "Error al cargar las sustituciones"
    );
  }, [cargarRecurso]);

  /* EFECTOS */

  useEffect(() => {
    cargarCatalogos();
    cargarShiftsFull();
  }, [cargarCatalogos, cargarShiftsFull]);

  // El turno mostrado depende del trabajador y de la fecha del planificador.
  useEffect(() => {
    cargarTurnosUsuario();
  }, [cargarTurnosUsuario]);

  // Los compensatorios se validan contra el trabajador y la fecha abiertos.
  useEffect(() => {
    cargarCompensatorios();
  }, [cargarCompensatorios, iduser, fechaPlaner]);

  // Los descansos se refrescan cuando la pantalla avisa de un cambio.
  useEffect(() => {
    cargarBreaks();
  }, [cargarBreaks, auxiliar]);

  // Los stacks guardados y los eventos programados solo se usan en el panel
  // lateral, por eso se recargan al abrirlo (y al cambiar de fecha).
  useEffect(() => {
    cargarStacksGuardados();
  }, [cargarStacksGuardados, showRight]);

  useEffect(() => {
    cargarProgrammers();
  }, [cargarProgrammers, showRight]);

  // Sin reglas no hay rango: se evita la consulta con parámetros vacíos.
  useEffect(() => {
    if (!rangoIn || !rangoOut) {
      setShiftsDay([]);
      return;
    }

    cargarTurnosDia();
  }, [cargarTurnosDia, rangoIn, rangoOut]);

  /* ESCRITURAS */

  const guardarTurno = useCallback(
    async (payload) => {
      try {
        await shiftsApi.create(payload);
        recargarTurnos();
        return true;
      } catch (error) {
        console.error("Error al guardar el turno:", error);
        toast.error(error?.message || "No se pudo guardar el turno");
        return false;
      }
    },
    [recargarTurnos]
  );

  const guardarStackGuardado = useCallback(async (payload) => {
    try {
      await savedStacksApi.create(payload);
      return true;
    } catch (error) {
      console.error("Error al guardar el stack:", error);
      toast.error(error?.message || "No se pudo guardar el stack");
      return false;
    }
  }, []);

  const limpiarTurnos = useCallback(
    async (userId, fechaIso) => {
      try {
        await shiftsApi.update({ ids: userId, fch: fechaIso });
        await Promise.all([recargarTurnos(), cargarTurnosDia()]);
        return true;
      } catch (error) {
        console.error("Error al limpiar los turnos:", error);
        toast.error(error?.message || "No se pudieron limpiar los turnos");
        return false;
      }
    },
    [recargarTurnos, cargarTurnosDia]
  );

  const eliminarTurno = useCallback(
    async (id) => {
      try {
        await shiftsApi.remove(id);
        await Promise.all([recargarTurnos(), cargarTurnosDia()]);
        return true;
      } catch (error) {
        console.error("Error al eliminar el turno:", error);
        toast.error(error?.message || "No se pudo eliminar el turno");
        return false;
      }
    },
    [recargarTurnos, cargarTurnosDia]
  );

  /**
   * Crea varios turnos seguidos y refresca una sola vez.
   * Devuelve true solo si todos se crearon; el llamador decide qué hacer
   * con el estado a medias (el planificador limpia la fecha).
   */
  const crearTurnosEnBloque = useCallback(
    async (payloads = []) => {
      const lista = Array.isArray(payloads) ? payloads : [];

      try {
        for (const payload of lista) {
          await shiftsApi.create(payload);
        }
        await Promise.all([recargarTurnos(), cargarTurnosDia()]);
        return true;
      } catch (error) {
        console.error("Error al guardar el stack de turnos:", error);
        toast.error(error?.message || "No se pudo guardar el stack de turnos");
        return false;
      }
    },
    [recargarTurnos, cargarTurnosDia]
  );

  /**
   * Reemplaza el día completo de un trabajador: limpia sus turnos de la fecha
   * y crea el stack recibido. Es la operación base para mantener la cadena de
   * horas coherente (manual, sugerido y stacks guardados aplicados).
   */
  const reemplazarTurnosDeFecha = useCallback(
    async (payloads = [], { userId = iduser, fecha = fechaPlaner } = {}) => {
      const lista = Array.isArray(payloads) ? payloads : [];

      try {
        await shiftsApi.update({
          ids: userId,
          fch: new Date(fecha).toISOString(),
        });

        for (const payload of lista) {
          await shiftsApi.create(payload);
        }

        await Promise.all([recargarTurnos(), cargarTurnosDia()]);
        return true;
      } catch (error) {
        console.error("Error al reemplazar los turnos del día:", error);
        toast.error(error?.message || "No se pudo reemplazar el stack del día");

        // No dejar el día a medias: se intenta limpiar lo que quedó.
        try {
          await shiftsApi.update({
            ids: userId,
            fch: new Date(fecha).toISOString(),
          });
          await Promise.all([recargarTurnos(), cargarTurnosDia()]);
        } catch (limpiezaError) {
          console.error("Error al limpiar el stack a medias:", limpiezaError);
        }

        return false;
      }
    },
    [iduser, fechaPlaner, recargarTurnos, cargarTurnosDia]
  );

  /** Trae las filas de un stack guardado sin tocar los turnos del día. */
  const obtenerStackGuardado = useCallback(async (nombre) => {
    if (!nombre) return null;

    try {
      const filas = await savedStacksApi.getShort(nombre);
      return Array.isArray(filas) ? filas : [];
    } catch (error) {
      console.error("Error al cargar el stack guardado:", error);
      toast.error(error?.message || "No se pudo cargar el stack guardado");
      return null;
    }
  }, []);

  const crearCompensatorio = useCallback(
    async (payload) => {
      try {
        await compensatoriesApi.create(payload);
        await cargarCompensatorios();
        return true;
      } catch (error) {
        console.error("Error al registrar el compensatorio:", error);
        toast.error(error?.message || "Error al registrar el compensatorio");
        return false;
      }
    },
    [cargarCompensatorios]
  );

  /** Trae el stack corto de un nombre y lo deja como stack actual. */
  const cargarStackCorto = useCallback(
    (nombre) =>
      cargarRecurso(
        "turnosUsuario",
        (signal) => savedStacksApi.getShort(nombre, { signal }),
        setTurnosUsuario,
        "Error al cargar el stack guardado"
      ),
    [cargarRecurso]
  );

  const renombrarStackGuardado = useCallback(
    async (nombreActual, nuevoNombre) => {
      try {
        await savedStacksApi.update(nombreActual, { nombre: nuevoNombre });
        await cargarStacksGuardados();
        return true;
      } catch (error) {
        console.error("Error al renombrar el stack:", error);
        toast.error(error?.message || "No se pudo renombrar el stack");
        return false;
      }
    },
    [cargarStacksGuardados]
  );

  const eliminarStackGuardado = useCallback(
    async (nombre) => {
      try {
        await savedStacksApi.remove(nombre);
        await cargarStacksGuardados();
        setTurnosUsuario([]);
        return true;
      } catch (error) {
        console.error("Error al eliminar el stack guardado:", error);
        toast.error(error?.message || "No se pudo eliminar el stack guardado");
        return false;
      }
    },
    [cargarStacksGuardados]
  );

  const vaciarStacks = useCallback(() => setStacks([]), []);
  const vaciarRotations = useCallback(() => setRotations([]), []);
  const vaciarTurnos = useCallback(() => setTurnosUsuario([]), []);

  return {
    /* datos */
    programs,
    turnosUsuario,
    rules,
    permissions,
    breaks,
    incapacitys,
    recess,
    licenses,
    payroll,
    rotations,
    rotationsManager,
    stacks,
    shiftsFull,
    substitutions,
    programmers,
    notations,
    savedStacks,
    shiftsDay,
    compensatorios,

    /* lecturas bajo demanda */
    recargarTurnos,
    recargarTurnosUsuario: cargarTurnosUsuario,
    recargarShiftsFull: cargarShiftsFull,
    recargarShiftsDay: cargarTurnosDia,
    recargarCompensatorios: cargarCompensatorios,
    recargarRotations: cargarRotations,
    recargarStacks: cargarStacks,
    recargarStacksGuardados: cargarStacksGuardados,
    recargarBreaks: cargarBreaks,
    recargarProgrammers: cargarProgrammers,
    recargarNotations: cargarNotations,

    /* escrituras */
    guardarTurno,
    crearTurnosEnBloque,
    reemplazarTurnosDeFecha,
    guardarStackGuardado,
    limpiarTurnos,
    eliminarTurno,
    crearCompensatorio,
    cargarStackCorto,
    obtenerStackGuardado,
    renombrarStackGuardado,
    eliminarStackGuardado,
    vaciarStacks,
    vaciarRotations,
    vaciarTurnos,
  };
};
