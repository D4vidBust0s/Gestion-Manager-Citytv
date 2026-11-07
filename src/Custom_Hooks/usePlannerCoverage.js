import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { groupsApi } from "../api/groups";
import { payrollApi } from "../api/payroll";
import { shiftsApi } from "../api/shifts";
import { permissionsApi } from "../api/permissions";
import { breaksApi } from "../api/breaks";
import { incapacityApi } from "../api/incapacity";
import { recessApi } from "../api/recess";
import { licensesApi } from "../api/licenses";
import { compensatoriesApi } from "../api/compensatories";
import { substitutionsApi } from "../api/substitutions";
import { isCanceled } from "../api/client";
import {
  calcularCoberturaPlanner,
  claveDiaLocal,
  isoInicioDiaLocal,
} from "../utils/plannerCoverage";

const listaSegura = (valor) => (Array.isArray(valor) ? valor : []);

/**
 * Carga y calcula la cobertura del MainPlanner para una fecha.
 *
 * Las lecturas se agrupan en una sola promesa: si alguna fuente falla, el
 * resumen no se publica a medias (un 100% falso sería peor que un error).
 */
export const usePlannerCoverage = ({ fecha, activo = true } = {}) => {
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [actualizadoEn, setActualizadoEn] = useState(null);

  const abortRef = useRef(null);
  const requestRef = useRef(0);
  const montadoRef = useRef(true);

  const fechaKey = claveDiaLocal(fecha);

  // Se construye desde la clave estable del día: el Date que llega desde el
  // contexto cambia de identidad en cada render y no debe disparar lecturas.
  const fechaNormalizada = useMemo(() => {
    if (!fechaKey) return null;

    const [anio, mes, dia] = fechaKey.split("-").map(Number);
    const valor = new Date(anio, mes - 1, dia);
    if (Number.isNaN(valor.getTime())) return null;

    valor.setHours(0, 0, 0, 0);
    return valor;
  }, [fechaKey]);

  const cargar = useCallback(async () => {
    if (!activo || !fechaKey || !fechaNormalizada) return null;

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    if (abortRef.current) abortRef.current.abort();
    const controlador = new AbortController();
    abortRef.current = controlador;

    setCargando(true);
    setError(null);

    try {
      const daykey = isoInicioDiaLocal(fechaNormalizada);
      const [
        groups,
        payroll,
        shifts,
        substitutions,
        permissions,
        breaks,
        incapacitys,
        recess,
        licenses,
        compensatorios,
      ] = await Promise.all([
        groupsApi.getAll({ signal: controlador.signal }),
        payrollApi.getAll({ signal: controlador.signal }),
        shiftsApi.getDayKey({
          params: { daykey },
          signal: controlador.signal,
        }),
        substitutionsApi.getAll({ signal: controlador.signal }),
        permissionsApi.getAll({ signal: controlador.signal }),
        breaksApi.getAll({ signal: controlador.signal }),
        incapacityApi.getAll({ signal: controlador.signal }),
        recessApi.getAll({ signal: controlador.signal }),
        licensesApi.getAll({ signal: controlador.signal }),
        compensatoriesApi.getAll({ signal: controlador.signal }),
      ]);

      if (controlador.signal.aborted || requestId !== requestRef.current) {
        return null;
      }

      const ausencias = {
        permissions: listaSegura(permissions),
        breaks: listaSegura(breaks),
        incapacitys: listaSegura(incapacitys),
        recess: listaSegura(recess),
        licenses: listaSegura(licenses),
        compensatories: listaSegura(compensatorios),
      };

      const resultado = calcularCoberturaPlanner({
        groups: listaSegura(groups),
        payroll: listaSegura(payroll),
        shifts: listaSegura(shifts),
        ausencias,
        substitutions: listaSegura(substitutions),
        fecha: fechaNormalizada,
      });

      if (!montadoRef.current) return null;

      setResumen(resultado);
      setActualizadoEn(new Date());
      return resultado;
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
            "No se pudo evaluar el estado del MainPlanner. Intente actualizar."
        );
      }

      return null;
    } finally {
      if (requestId === requestRef.current && montadoRef.current) {
        setCargando(false);
      }
    }
  }, [activo, fechaKey, fechaNormalizada]);

  useEffect(() => {
    montadoRef.current = true;
    cargar();

    return () => {
      montadoRef.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, [cargar]);

  const resumenVigente =
    resumen && resumen.fechaKey === fechaKey ? resumen : null;

  return {
    resumen: resumenVigente,
    cargando,
    error,
    actualizadoEn,
    recargar: cargar,
  };
};
