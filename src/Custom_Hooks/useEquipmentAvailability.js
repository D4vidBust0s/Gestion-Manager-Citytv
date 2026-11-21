import { useCallback, useEffect, useRef, useState } from "react";

import { equipmentApi } from "../api/equipment";
import { useRealtimeEvent } from "../Custom_Hooks/useRealtimeEvent";

const RESUMEN_VACIO = {
  total: 0,
  inactivos: 0,
  reservadosEnFranja: 0,
  disponibles: 0,
};

/**
 * Disponibilidad real de equipos para una franja.
 * Por defecto el backend solo devuelve los disponibles; el resumen explica
 * cuántos hay en total, cuántos están inactivos y cuántos reservados.
 */
export const useEquipmentAvailability = ({
  fechaClave = null,
  timeIn = null,
  timeOut = null,
  categoriaId = "",
  q = "",
  excluirOrigenTipo = "",
  excluirOrigenId = "",
  incluirNoDisponibles = false,
} = {}) => {
  const [equipos, setEquipos] = useState([]);
  const [resumen, setResumen] = useState(RESUMEN_VACIO);
  const [cargando, setCargando] = useState(false);
  const [consultado, setConsultado] = useState(false);
  const [error, setError] = useState(null);
  const activoRef = useRef(true);

  // Las fechas se reducen a ISO para que el hook no se recree en cada render
  // (los modales construyen Date nuevos al renderizar).
  const fechaIso = fechaClave ? new Date(fechaClave).toISOString() : "";
  const inicioIso = timeIn ? new Date(timeIn).toISOString() : "";
  const finIso = timeOut ? new Date(timeOut).toISOString() : "";

  const recargar = useCallback(async () => {
    if (!fechaIso || !inicioIso || !finIso) {
      setEquipos([]);
      setResumen(RESUMEN_VACIO);
      setConsultado(true);
      return { equipos: [], resumen: RESUMEN_VACIO, error: null };
    }

    setCargando(true);
    setError(null);
    setConsultado(false);

    try {
      const data = await equipmentApi.getDisponibilidad({
        fechaClave: fechaIso,
        timeIn: inicioIso,
        timeOut: finIso,
        categoriaId: categoriaId || undefined,
        q: q?.trim() || undefined,
        excluirOrigenTipo: excluirOrigenTipo || undefined,
        excluirOrigenId: excluirOrigenId || undefined,
        incluirNoDisponibles: incluirNoDisponibles ? true : undefined,
      });

      const lista = Array.isArray(data?.equipos) ? data.equipos : [];
      const resumenData = { ...RESUMEN_VACIO, ...(data?.resumen ?? {}) };

      if (!activoRef.current) {
        return { equipos: lista, resumen: resumenData, error: null };
      }

      setEquipos(lista);
      setResumen(resumenData);
      return { equipos: lista, resumen: resumenData, error: null };
    } catch (err) {
      const mensaje =
        err?.message || "No se pudo consultar la disponibilidad";

      if (!activoRef.current) {
        return { equipos: [], resumen: RESUMEN_VACIO, error: mensaje };
      }

      setEquipos([]);
      setResumen(RESUMEN_VACIO);
      setError(mensaje);
      return { equipos: [], resumen: RESUMEN_VACIO, error: mensaje };
    } finally {
      if (activoRef.current) {
        setCargando(false);
        setConsultado(true);
      }
    }
  }, [
    fechaIso,
    inicioIso,
    finIso,
    categoriaId,
    q,
    excluirOrigenTipo,
    excluirOrigenId,
    incluirNoDisponibles,
  ]);

  useEffect(() => {
    activoRef.current = true;
    recargar();

    return () => {
      activoRef.current = false;
    };
  }, [recargar]);

  useRealtimeEvent("equipment:changed", recargar);
  useRealtimeEvent("equipment-assignment:changed", recargar);

  return { equipos, resumen, cargando, consultado, error, recargar };
};
