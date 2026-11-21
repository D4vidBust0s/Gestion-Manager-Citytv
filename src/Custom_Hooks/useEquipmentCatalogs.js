import { useCallback, useEffect, useRef, useState } from "react";

import { equipmentApi } from "../api/equipment";
import { useRealtimeEvent } from "../Custom_Hooks/useRealtimeEvent";

/**
 * Categorías, subcategorías y ubicaciones del inventario de GM-Activos.
 * Las imágenes de los filtros son las genéricas de cada catálogo; el equipo
 * hereda la suya, por eso no se guarda una imagen por placa.
 */
export const useEquipmentCatalogs = () => {
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [errorUbicaciones, setErrorUbicaciones] = useState(null);
  const activoRef = useRef(true);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    setErrorUbicaciones(null);

    try {
      const [resCategorias, resSubcategorias, resUbicaciones] =
        await Promise.allSettled([
          equipmentApi.getCategorias(),
          equipmentApi.getSubcategorias(),
          equipmentApi.getUbicaciones(),
        ]);

      if (!activoRef.current) return;

      const falloCategoria = resCategorias.status === "rejected";
      const falloSubcategoria = resSubcategorias.status === "rejected";

      setCategorias(
        resCategorias.status === "fulfilled" && Array.isArray(resCategorias.value)
          ? resCategorias.value
          : []
      );
      setSubcategorias(
        resSubcategorias.status === "fulfilled" &&
          Array.isArray(resSubcategorias.value)
          ? resSubcategorias.value
          : []
      );
      setUbicaciones(
        resUbicaciones.status === "fulfilled" &&
          Array.isArray(resUbicaciones.value)
          ? resUbicaciones.value
          : []
      );

      if (falloCategoria || falloSubcategoria) {
        const razon = falloCategoria
          ? resCategorias.reason
          : resSubcategorias.reason;
        setError(
          razon?.message || "No se pudieron cargar las categorías del inventario"
        );
      }

      if (resUbicaciones.status === "rejected") {
        setErrorUbicaciones(
          resUbicaciones.reason?.message ||
            "No se pudieron cargar las ubicaciones del inventario"
        );
      }
    } catch (err) {
      if (!activoRef.current) return;
      setCategorias([]);
      setSubcategorias([]);
      setUbicaciones([]);
      setError(
        err?.message || "No se pudieron cargar los catálogos del inventario"
      );
    } finally {
      if (activoRef.current) setCargando(false);
    }
  }, []);

  useEffect(() => {
    activoRef.current = true;
    recargar();

    return () => {
      activoRef.current = false;
    };
  }, [recargar]);

  useRealtimeEvent("equipment-categories:changed", recargar);
  useRealtimeEvent("equipment-subcategories:changed", recargar);
  useRealtimeEvent("equipment-locations:changed", recargar);

  return {
    categorias,
    subcategorias,
    ubicaciones,
    cargando,
    error,
    errorUbicaciones,
    recargar,
  };
};
