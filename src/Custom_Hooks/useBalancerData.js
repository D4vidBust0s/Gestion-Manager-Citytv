import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";

/* SERVICIOS */
import { isCanceled } from "../api/client";
import { groupsApi } from "../api/groups";
import { payrollApi } from "../api/payroll";
import { programsApi } from "../api/programs";
import { projectionsApi } from "../api/projections";
import { rulesApi } from "../api/rules";
import { shiftsApi } from "../api/shifts";
import { stacksApi } from "../api/stacks";

/* UTILIDADES */
import {
  calcularRango,
  construirDias,
  construirEncabezados,
  indexarHorasPorUsuario,
} from "../utils/balancer";

/**
 * Datos de la pantalla Balancer.
 *
 * El componente solo pinta: aquí vive la carga contra la API (una sola tanda
 * cancelable), la indexación de turnos y el guardado debounced de las
 * proyecciones.
 */

/** Milisegundos de espera antes de persistir una celda mientras se escribe. */
const ESPERA_GUARDADO = 500;

export const useBalancerData = (refreshToken) => {
  /* ESTADOS */
  const [groups, setGroups] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [rules, setRules] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [stacks, setStacks] = useState([]);
  const [proyecciones, setProyecciones] = useState({});

  /* REFERENCIAS */
  // Guardados pendientes por celda: clave -> { timer, payload, persistido, clave }
  const temporizadoresRef = useRef(new Map());
  // Último valor persistido por celda, para no repetir el POST si no cambió
  const ultimoGuardadoRef = useRef(new Map());

  /* ESCRITURA DE PROYECCIONES */

  const persistirProyeccion = useCallback(async (clave, payload, valor) => {
    try {
      await projectionsApi.create(payload);
      ultimoGuardadoRef.current.set(clave, String(valor));
    } catch (error) {
      console.error(
        "Error al sincronizar proyección con la base de datos:",
        error
      );
      toast.error("No se pudo guardar la proyección");
    }
  }, []);

  /**
   * Actualiza la celda al instante y persiste 500 ms después del último
   * cambio. Descarta el guardado si el valor coincide con el ya persistido.
   */
  const setProyeccion = useCallback(
    (userId, fechaIso, valorCrudo, grupoId) => {
      const clave = `${userId}_${fechaIso}`;
      const num = valorCrudo === "" ? "" : parseFloat(valorCrudo) || 0;

      setProyecciones((prev) => ({ ...prev, [clave]: num }));

      // Cualquier cambio invalida el guardado pendiente de esa celda.
      const pendiente = temporizadoresRef.current.get(clave);
      if (pendiente) {
        clearTimeout(pendiente.timer);
        temporizadoresRef.current.delete(clave);
      }

      const persistido = num === "" ? 0 : num;
      if (ultimoGuardadoRef.current.get(clave) === String(persistido)) {
        return;
      }

      const payload = {
        userId,
        fechaClave: fechaIso,
        valorProyeccion: persistido,
        grupoId: grupoId || "GENERAL",
      };

      const timer = setTimeout(() => {
        temporizadoresRef.current.delete(clave);
        persistirProyeccion(clave, payload, persistido);
      }, ESPERA_GUARDADO);

      temporizadoresRef.current.set(clave, {
        timer,
        payload,
        persistido,
        clave,
      });
    },
    [persistirProyeccion]
  );

  /* CARGA INICIAL */

  useEffect(() => {
    const controller = new AbortController();
    const config = { signal: controller.signal };
    let activo = true;

    const cargar = async (servicio, asignar, mensaje) => {
      try {
        const data = await servicio(config);
        if (!activo) return;
        asignar(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!activo || isCanceled(error)) return;
        console.error(mensaje, error);
        toast.error(error?.message || mensaje);
      }
    };

    const cargarProyecciones = async () => {
      try {
        const data = await projectionsApi.getAll(config);
        if (!activo) return;

        const mapa = {};
        (Array.isArray(data) ? data : []).forEach((item) => {
          const clave = `${item.userId}_${item.fechaClave}`;
          mapa[clave] = item.valorProyeccion;
          ultimoGuardadoRef.current.set(
            clave,
            String(item.valorProyeccion ?? 0)
          );
        });

        // Lo que se alcance a escribir mientras llega la respuesta se conserva.
        setProyecciones((prev) => ({ ...mapa, ...prev }));
      } catch (error) {
        if (!activo || isCanceled(error)) return;
        console.error("Error al cargar proyecciones guardadas:", error);
        toast.error(error?.message || "Error al cargar las proyecciones");
      }
    };

    cargar(groupsApi.getAll, setGroups, "Error al cargar los grupos");
    cargar(payrollApi.getAll, setPayroll, "Error al cargar el personal");
    cargar(rulesApi.getAll, setRules, "Error al cargar las reglas");
    cargar(programsApi.getAll, setPrograms, "Error al cargar los programas");
    cargar(stacksApi.getAll, setStacks, "Error al cargar los esquemas");
    cargarProyecciones();

    return () => {
      activo = false;
      controller.abort();
    };
  }, []);

  /* TURNOS DEL PERIODO (dependen de las reglas) */

  const rango = useMemo(() => calcularRango(rules), [rules]);
  const rangoIn = rango?.in ?? "";
  const rangoOut = rango?.out ?? "";

  useEffect(() => {
    if (!rangoIn || !rangoOut) {
      setShifts([]);
      return undefined;
    }

    const controller = new AbortController();
    let activo = true;

    const cargarTurnos = async () => {
      try {
        const data = await shiftsApi.getDay({
          params: { in: rangoIn, out: rangoOut },
          signal: controller.signal,
        });
        if (!activo) return;
        setShifts(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!activo || isCanceled(error)) return;
        console.error("Error al cargar los turnos del periodo:", error);
        toast.error(error?.message || "Error al cargar los turnos del periodo");
      }
    };

    cargarTurnos();

    return () => {
      activo = false;
      controller.abort();
    };
  }, [rangoIn, rangoOut, refreshToken]);

  /* DERIVADOS */

  const dias = useMemo(() => {
    const regla = rules.length > 0 ? rules[rules.length - 1] : null;
    return regla ? construirDias(regla) : [];
  }, [rules]);

  const encabezados = useMemo(() => construirEncabezados(rules), [rules]);

  const intensidadDefecto = useMemo(() => {
    const valor = rules?.[0]?.IntensidadHorariaDiaria;
    return valor ? parseFloat(valor) || 8 : 8;
  }, [rules]);

  const horasPorUsuarioDia = useMemo(
    () => indexarHorasPorUsuario(shifts, stacks, programs),
    [shifts, stacks, programs]
  );

  /* AL SALIR: enviar lo que quedó pendiente de guardar */

  useEffect(() => {
    const temporizadores = temporizadoresRef.current;
    return () => {
      temporizadores.forEach(({ timer, payload, persistido, clave }) => {
        clearTimeout(timer);
        persistirProyeccion(clave, payload, persistido);
      });
      temporizadores.clear();
    };
  }, [persistirProyeccion]);

  return {
    groups,
    payroll,
    rules,
    shifts,
    programs,
    stacks,
    proyecciones,
    dias,
    encabezados,
    horasPorUsuarioDia,
    intensidadDefecto,
    setProyeccion,
  };
};
