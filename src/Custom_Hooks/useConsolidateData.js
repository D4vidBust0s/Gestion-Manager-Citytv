import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* SERVICIOS */
import { groupsApi } from "../api/groups";
import { payrollApi } from "../api/payroll";
import { shiftsApi } from "../api/shifts";
import { programsApi } from "../api/programs";
import { stacksApi } from "../api/stacks";
import { programmerApi } from "../api/programmer";
import { savedStacksApi } from "../api/savedStacks";
import { substitutionsApi } from "../api/substitutions";
import { isCanceled } from "../api/client";

/* UTILIDADES */
import { isoInicioDiaLocal } from "../utils/plannerCoverage";

const listaSegura = (valor) => (Array.isArray(valor) ? valor : []);

/**
 * Datos de la pantalla Consolidate para una fecha.
 *
 * Una sola carga agrupa catálogos, personal, turnos, programadores y
 * sustituciones: si falla una fuente crítica no se publica un resumen a
 * medias. Las escrituras de consolidación solo refrescan turnos y
 * sustituciones con recargarTurnos().
 */
export const useConsolidateData = ({ fecha, activo = true } = {}) => {
  const [groups, setGroups] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [stacks, setStacks] = useState([]);
  const [programmers, setProgrammers] = useState([]);
  const [savedStacks, setSavedStacks] = useState([]);
  const [substitutions, setSubstitutions] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [recargando, setRecargando] = useState(false);
  const [error, setError] = useState(null);
  const [actualizadoEn, setActualizadoEn] = useState(null);

  const abortRef = useRef(null);
  const requestRef = useRef(0);
  const montadoRef = useRef(true);

  const fechaIso = useMemo(() => isoInicioDiaLocal(fecha), [fecha]);

  const cargar = useCallback(async () => {
    if (!activo || !fechaIso) return null;

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    if (abortRef.current) abortRef.current.abort();
    const controlador = new AbortController();
    abortRef.current = controlador;

    setCargando(true);
    setError(null);

    try {
      const [
        groupsRes,
        payrollRes,
        shiftsRes,
        programsRes,
        stacksRes,
        programmersRes,
        savedStacksRes,
        substitutionsRes,
      ] = await Promise.all([
        groupsApi.getAll({ signal: controlador.signal }),
        payrollApi.getAll({ signal: controlador.signal }),
        shiftsApi.getDayKey({
          params: { daykey: fechaIso },
          signal: controlador.signal,
        }),
        programsApi.getAll({ signal: controlador.signal }),
        stacksApi.getAll({ signal: controlador.signal }),
        programmerApi.getAll({
          params: { fecha: fechaIso, soloAprobados: true },
          signal: controlador.signal,
        }),
        savedStacksApi.getAll({ signal: controlador.signal }),
        substitutionsApi.getAll({ signal: controlador.signal }),
      ]);

      if (
        controlador.signal.aborted ||
        requestId !== requestRef.current ||
        !montadoRef.current
      ) {
        return null;
      }

      setGroups(listaSegura(groupsRes));
      setPayroll(listaSegura(payrollRes));
      setShifts(listaSegura(shiftsRes));
      setPrograms(listaSegura(programsRes));
      setStacks(listaSegura(stacksRes));
      setProgrammers(listaSegura(programmersRes));
      setSavedStacks(listaSegura(savedStacksRes));
      setSubstitutions(listaSegura(substitutionsRes));
      setActualizadoEn(new Date());

      return true;
    } catch (err) {
      if (
        isCanceled(err) ||
        controlador.signal.aborted ||
        requestId !== requestRef.current
      ) {
        return null;
      }

      if (montadoRef.current) {
        setError(
          err?.message ||
            "No se pudo cargar la información del día. Intente actualizar."
        );
      }

      return null;
    } finally {
      if (requestId === requestRef.current && montadoRef.current) {
        setCargando(false);
      }
    }
  }, [activo, fechaIso]);

  const recargarTurnos = useCallback(async () => {
    if (!fechaIso) return null;

    setRecargando(true);

    try {
      const [shiftsRes, substitutionsRes] = await Promise.all([
        shiftsApi.getDayKey({ params: { daykey: fechaIso } }),
        substitutionsApi.getAll(),
      ]);

      if (!montadoRef.current) return null;

      setShifts(listaSegura(shiftsRes));
      setSubstitutions(listaSegura(substitutionsRes));
      setActualizadoEn(new Date());
      setError(null);

      return true;
    } catch (err) {
      if (montadoRef.current) {
        setError(
          err?.message ||
            "Los cambios se guardaron, pero no se pudo refrescar el día."
        );
      }

      return null;
    } finally {
      if (montadoRef.current) setRecargando(false);
    }
  }, [fechaIso]);

  useEffect(() => {
    montadoRef.current = true;
    cargar();

    return () => {
      montadoRef.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, [cargar]);

  return {
    groups,
    payroll,
    shifts,
    programs,
    stacks,
    programmers,
    savedStacks,
    substitutions,
    cargando,
    recargando,
    error,
    actualizadoEn,
    fechaIso,
    recargarTodo: cargar,
    recargarTurnos,
  };
};
