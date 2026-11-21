import { useCallback, useEffect, useRef, useState } from "react";

import { programmerApi } from "../api/programmer";
import { isCanceled } from "../api/client";
import { useRealtimeEvent } from "./useRealtimeEvent";

const listaSegura = (valor) => (Array.isArray(valor) ? valor : []);

/**
 * Años con requerimientos registrados.
 * El archivo está compuesto por los años anteriores al año actual.
 */
export const useProgrammerYears = () => {
  const [anios, setAnios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const cargar = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controlador = new AbortController();
    abortRef.current = controlador;

    setCargando(true);
    setError(null);

    try {
      const data = await programmerApi.getYears({
        signal: controlador.signal,
      });

      if (controlador.signal.aborted || !montadoRef.current) return [];

      const lista = listaSegura(data)
        .map((item) => ({
          anio: Number(item?.anio),
          total: Number(item?.total) || 0,
        }))
        .filter((item) => Number.isInteger(item.anio))
        .sort((a, b) => b.anio - a.anio);

      setAnios(lista);
      return lista;
    } catch (errorCarga) {
      if (isCanceled(errorCarga) || controlador.signal.aborted) return [];

      if (montadoRef.current) {
        setError(
          errorCarga?.message ||
            "No se pudieron cargar los años de requerimientos"
        );
      }

      return [];
    } finally {
      if (montadoRef.current) setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [cargar]);

  useRealtimeEvent("programmer:changed", cargar);

  return {
    anios,
    cargando,
    error,
    recargar: cargar,
  };
};
