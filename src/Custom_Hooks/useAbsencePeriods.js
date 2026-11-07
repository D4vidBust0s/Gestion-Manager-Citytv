import { useCallback, useEffect, useRef, useState } from "react";
import { PERIOD_RESOURCES } from "../api/periods";
import { isCanceled } from "../api/client";

const listaSegura = (valor) => (Array.isArray(valor) ? valor : []);

/**
 * Carga los periodos de ausencia una sola vez para colorear y validar
 * sustituciones en el Listado.
 *
 * Se refresca cuando cambia `refreshKey` (por ejemplo, al modificar un
 * descanso). Si una consulta falla, conserva los datos anteriores y expone
 * el error para que el flujo de sustitución no asuma que la persona está apta.
 */
export const useAbsencePeriods = ({ refreshKey } = {}) => {
  const [ausencias, setAusencias] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);
  const montadoRef = useRef(true);

  const cargar = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();

    const controlador = new AbortController();
    abortRef.current = controlador;

    setCargando(true);
    setError(null);

    try {
      const respuestas = await Promise.all(
        PERIOD_RESOURCES.map((recurso) =>
          recurso.api.getAll({ signal: controlador.signal })
        )
      );

      if (controlador.signal.aborted) return null;

      const siguiente = {};
      PERIOD_RESOURCES.forEach((recurso, indice) => {
        siguiente[recurso.api.resource] = listaSegura(respuestas[indice]);
      });

      setAusencias(siguiente);
      return siguiente;
    } catch (err) {
      if (isCanceled(err) || controlador.signal.aborted) return null;

      if (montadoRef.current) {
        setError(
          err?.message ||
            "No se pudieron cargar los estados de ausencia para validar la sustitución."
        );
      }

      return null;
    } finally {
      if (montadoRef.current) setCargando(false);
    }
  }, []);

  useEffect(() => {
    montadoRef.current = true;
    cargar();

    return () => {
      montadoRef.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, [cargar, refreshKey]);

  return {
    ausencias,
    cargando,
    error,
    recargar: cargar,
  };
};
