import { useCallback, useEffect, useRef, useState } from "react";

import { groupsApi } from "../api/groups";
import { isCanceled } from "../api/client";

const listaSegura = (valor) => {
  if (Array.isArray(valor)) return valor;
  if (Array.isArray(valor?.data)) return valor.data;
  return [];
};

/**
 * Grupos reales definidos en Sistema → Groups.
 *
 * La pantalla Programmer los usa como roles del personal requerido para no
 * ofrecer cargos técnicos que todavía no existen como grupo en la aplicación.
 */
export const useProgrammerGroups = () => {
  const [grupos, setGrupos] = useState([]);
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
      const data = await groupsApi.getAll({ signal: controlador.signal });

      if (controlador.signal.aborted || !montadoRef.current) return [];

      const lista = listaSegura(data)
        .filter((grupo) => grupo?.nombre)
        .sort(
          (a, b) =>
            (Number(a?.orden ?? a?.order ?? 999) || 999) -
            (Number(b?.orden ?? b?.order ?? 999) || 999)
        );

      setGrupos(lista);
      return lista;
    } catch (errorCarga) {
      if (isCanceled(errorCarga) || controlador.signal.aborted) return [];

      if (montadoRef.current) {
        setError(
          errorCarga?.message ||
            "No se pudieron cargar los grupos del sistema"
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

  return {
    grupos,
    cargando,
    error,
    recargar: cargar,
  };
};
