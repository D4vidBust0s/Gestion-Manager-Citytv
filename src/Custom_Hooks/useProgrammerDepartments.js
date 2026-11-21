import { useCallback, useEffect, useRef, useState } from "react";

import { departmentsApi } from "../api/departments";
import { isCanceled } from "../api/client";

const listaSegura = (valor) => {
  if (Array.isArray(valor)) return valor;
  if (Array.isArray(valor?.data)) return valor.data;
  return [];
};

/**
 * Departamentos persistidos en la base de datos.
 *
 * Requirements administra el catálogo y Programmer lo consume para las
 * pestañas y el datalist de la modal.
 */
export const useProgrammerDepartments = () => {
  const [departamentos, setDepartamentos] = useState([]);
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
      const data = await departmentsApi.getAll({
        signal: controlador.signal,
      });

      if (controlador.signal.aborted || !montadoRef.current) return [];

      const lista = listaSegura(data)
        .filter((departamento) => departamento?.nombre)
        .map((departamento) => ({
          id: String(departamento._id ?? departamento.id ?? ""),
          nombre: String(departamento.nombre).trim(),
          orden: Number(departamento.orden) || 0,
        }))
        .sort(
          (a, b) =>
            (a.orden || 999) - (b.orden || 999) ||
            a.nombre.localeCompare(b.nombre, "es")
        );

      setDepartamentos(lista);
      return lista;
    } catch (errorCarga) {
      if (isCanceled(errorCarga) || controlador.signal.aborted) return [];

      if (montadoRef.current) {
        setError(
          errorCarga?.message ||
            "No se pudieron cargar los departamentos del sistema"
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
    departamentos,
    cargando,
    error,
    recargar: cargar,
  };
};
