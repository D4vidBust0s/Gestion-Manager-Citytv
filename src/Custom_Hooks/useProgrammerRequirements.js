import { useCallback, useEffect, useRef, useState } from "react";

import { programmerApi } from "../api/programmer";
import { isCanceled } from "../api/client";
import { isoInicioDiaLocal } from "../utils/plannerCoverage";
import {
  normalizarRequerimiento,
  parseFechaLocal,
} from "../pages/Programmer/programmerView";

const listaSegura = (valor) => {
  if (Array.isArray(valor)) return valor;
  if (Array.isArray(valor?.data)) return valor.data;
  return [];
};

/**
 * Carga los requerimientos manuales.
 *
 * Si `anio` viene informado, consulta el año calendario (Año actual o
 * Años anteriores). Si no, consulta el día `fechaClave` enviando la medianoche
 * local en ISO, que es el mismo contrato que ya usan el planificador y
 * Consolidate.
 */
export const useProgrammerRequirements = ({
  fechaClave,
  anio = null,
  q = "",
} = {}) => {
  const [requerimientos, setRequerimientos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [recargando, setRecargando] = useState(false);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);
  const requestRef = useRef(0);
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const cargar = useCallback(
    async ({ silencioso = false } = {}) => {
      const fecha = parseFechaLocal(fechaClave);

      if (!anio && !fecha) return [];

      const fechaIso = anio ? null : isoInicioDiaLocal(fecha);
      const requestId = requestRef.current + 1;
      requestRef.current = requestId;

      if (abortRef.current) abortRef.current.abort();
      const controlador = new AbortController();
      abortRef.current = controlador;

      if (silencioso) {
        setRecargando(true);
      } else {
        // Al cambiar de fecha o de alcance no se muestran los requerimientos
        // anteriores mientras llega la nueva respuesta.
        setRequerimientos([]);
        setCargando(true);
      }
      setError(null);

      try {
        const data = anio
          ? await programmerApi.getByYear(anio, {
              signal: controlador.signal,
              params: q ? { q } : {},
            })
          : await programmerApi.getByDate(fechaIso, {
              signal: controlador.signal,
              params: q ? { q } : {},
            });

        if (
          controlador.signal.aborted ||
          requestId !== requestRef.current ||
          !montadoRef.current
        ) {
          return [];
        }

        const lista = listaSegura(data).map(normalizarRequerimiento);
        setRequerimientos(lista);
        return lista;
      } catch (errorCarga) {
        if (
          isCanceled(errorCarga) ||
          controlador.signal.aborted ||
          requestId !== requestRef.current
        ) {
          return [];
        }

        if (montadoRef.current) {
          setError(
            errorCarga?.message ||
              "No se pudieron cargar los requerimientos"
          );
        }

        return [];
      } finally {
        if (requestId === requestRef.current && montadoRef.current) {
          setCargando(false);
          setRecargando(false);
        }
      }
    },
    [fechaClave, anio, q]
  );

  useEffect(() => {
    cargar();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [cargar]);

  const recargar = useCallback(() => cargar({ silencioso: true }), [cargar]);

  return {
    requerimientos,
    cargando,
    recargando,
    error,
    recargar,
  };
};
