import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { rulesApi } from "../api/rules";
import { isCanceled } from "../api/client";
import {
  ESTADOS_PERIODO,
  calcularPeriodoEvaluacion,
  calcularSiguientePeriodo,
} from "../utils/evaluationPeriod";

const INTERVALO_RELOJ_MS = 60 * 1000;
const INTERVALO_REGLAS_MS = 5 * 60 * 1000;

/**
 * Lee el periodo de evaluación de /rules y lo mantiene actualizado.
 *
 * El avance se recalcula cada minuto; las reglas se vuelven a consultar al
 * recuperar el foco, al volver a la pestaña y cada cinco minutos.
 */
export const useEvaluationPeriod = () => {
  const [rules, setRules] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [ahora, setAhora] = useState(() => new Date());

  const abortRef = useRef(null);
  const montadoRef = useRef(true);
  const sincronizandoRef = useRef(false);
  const ultimaSincronizacionRef = useRef({ clave: null, momento: 0 });

  const cargar = useCallback(async () => {
    if (sincronizandoRef.current) return null;
    if (abortRef.current) abortRef.current.abort();

    const controlador = new AbortController();
    abortRef.current = controlador;

    setCargando(true);
    setError(null);

    try {
      const data = await rulesApi.getAll({ signal: controlador.signal });
      if (controlador.signal.aborted) return null;

      setRules(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      if (isCanceled(err) || controlador.signal.aborted) return null;

      if (montadoRef.current) {
        setError(
          err?.message ||
            "No se pudo cargar el periodo de evaluación configurado."
        );
      }

      return null;
    } finally {
      if (montadoRef.current) setCargando(false);
    }
  }, []);

  const sincronizarPeriodo = useCallback(async (regla, periodoActual) => {
    if (sincronizandoRef.current) return null;
    if (!regla || !periodoActual?.inicio) return null;

    const idRegla = regla._id ?? regla.id;
    if (!idRegla) return null;

    const siguiente = calcularSiguientePeriodo({
      inicio: periodoActual.inicio,
      totalDias: periodoActual.totalDias,
      ahora: new Date(),
    });

    if (!siguiente) return null;

    if (siguiente.limiteAlcanzado) {
      setError(
        "El periodo de evaluación lleva demasiados ciclos vencidos; revise las reglas."
      );
      return null;
    }

    if (siguiente.periodosAvanzados === 0) return null;

    const nuevaFecha = siguiente.inicio.toISOString();
    const claveSincronizacion = `${idRegla}:${nuevaFecha}`;

    // Evita un segundo PUT idéntico si el efecto se vuelve a disparar con el
    // mismo periodo viejo antes de que React aplique el estado local.
    const ultima = ultimaSincronizacionRef.current;
    const intentoReciente =
      ultima.clave === claveSincronizacion &&
      Date.now() - ultima.momento < 60 * 1000;

    if (intentoReciente) return null;

    sincronizandoRef.current = true;
    ultimaSincronizacionRef.current = {
      clave: claveSincronizacion,
      momento: Date.now(),
    };

    // Una lectura en curso podría devolver la regla anterior después del PUT
    // y disparar una segunda actualización.
    if (abortRef.current) abortRef.current.abort();

    try {
      await rulesApi.update(idRegla, { DiaPeriod: nuevaFecha });

      if (!montadoRef.current) return null;

      setRules((anteriores) => {
        if (!Array.isArray(anteriores) || anteriores.length === 0) {
          return anteriores;
        }

        const copia = [...anteriores];
        const indice = copia.length - 1;
        copia[indice] = { ...copia[indice], DiaPeriod: nuevaFecha };
        return copia;
      });
      setAhora(new Date());
      setError(null);

      return siguiente;
    } catch (err) {
      if (ultimaSincronizacionRef.current.clave === claveSincronizacion) {
        ultimaSincronizacionRef.current = { clave: null, momento: 0 };
      }

      if (montadoRef.current) {
        setError(
          err?.message ||
            "No se pudo registrar el nuevo periodo de evaluación."
        );
      }

      return null;
    } finally {
      sincronizandoRef.current = false;
    }
  }, []);

  useEffect(() => {
    montadoRef.current = true;
    cargar();

    const reloj = setInterval(() => setAhora(new Date()), INTERVALO_RELOJ_MS);
    const refrescoReglas = setInterval(() => {
      setAhora(new Date());
      cargar();
    }, INTERVALO_REGLAS_MS);

    const alVolver = () => {
      setAhora(new Date());
      cargar();
    };

    const alCambiarVisibilidad = () => {
      if (document.visibilityState === "visible") alVolver();
    };

    window.addEventListener("focus", alVolver);
    document.addEventListener("visibilitychange", alCambiarVisibilidad);

    return () => {
      montadoRef.current = false;
      clearInterval(reloj);
      clearInterval(refrescoReglas);
      window.removeEventListener("focus", alVolver);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [cargar]);

  const periodo = useMemo(
    () => calcularPeriodoEvaluacion({ rules, ahora }),
    [rules, ahora]
  );

  // El efecto de sincronización no debe depender del objeto `periodo`: cambia
  // cada minuto y, si el PUT falla, reintentaría demasiado seguido. El ref
  // conserva el periodo vigente y el efecto se dispara por estado o reglas.
  const periodoRef = useRef(periodo);
  periodoRef.current = periodo;

  useEffect(() => {
    if (periodo.estado !== ESTADOS_PERIODO.FINALIZADO) return;
    if (rules.length === 0) return;

    sincronizarPeriodo(rules[rules.length - 1], periodoRef.current);
  }, [periodo.estado, rules, sincronizarPeriodo]);

  return {
    periodo,
    cargando,
    error,
    recargar: cargar,
  };
};
