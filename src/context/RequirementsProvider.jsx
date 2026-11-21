import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import PropTypes from "prop-types";

import { departmentsApi } from "../api/departments";
import { requirementsApi } from "../api/requirements";
import { useRealtimeEvent } from "../Custom_Hooks/useRealtimeEvent";
import { DEPARTAMENTOS_INICIALES, normalizarTexto } from "../pages/Requirements/requirementsData";

/**
 * Estado compartido de Requirements.
 *
 * A diferencia de Programmer (proceso manual interno), Requirements es el
 * sistema de solicitudes por áreas. Persiste en su propia colección y comparte
 * con Programmer el inventario de GM-Activos.
 */
const RequirementsContext = createContext(null);

const ESTADOS_GESTIONABLES = ["Pendiente", "En revisión"];

const obtenerNombreAdministrador = () => {
  try {
    const guardado = localStorage.getItem("userAuth");
    if (!guardado) return "Administrador";

    const usuario = JSON.parse(guardado);
    const nombre = `${usuario?.nombres ?? usuario?.nombre ?? ""} ${
      usuario?.apellidos ?? ""
    }`.trim();

    return nombre || "Administrador";
  } catch {
    return "Administrador";
  }
};

const mapearDepartamento = (departamento) => ({
  id: String(departamento?._id ?? departamento?.id ?? ""),
  dbId: String(departamento?._id ?? departamento?.dbId ?? ""),
  nombre: String(departamento?.nombre ?? "").trim(),
  orden: Number(departamento?.orden) || 0,
});

const DEPARTAMENTOS_FALLBACK = DEPARTAMENTOS_INICIALES.map((departamento) => ({
  id: departamento.id,
  dbId: null,
  nombre: departamento.nombre,
  orden: 0,
}));

const dosDigitos = (valor) => String(valor).padStart(2, "0");

/** Fecha local `YYYY-MM-DD` para los filtros y la UI. */
const fechaSoloDia = (valor) => {
  if (!valor) return "";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(
    fecha.getDate()
  )}`;
};

const mapearAsignado = (asignado) => ({
  userId: String(asignado?.Id ?? asignado?.userId ?? ""),
  nombre: String(asignado?.Nombre ?? asignado?.nombre ?? "").trim(),
  cargo: String(asignado?.Cargo ?? asignado?.cargo ?? "").trim(),
  grupoId: String(asignado?.GrupoId ?? asignado?.grupoId ?? ""),
  asignadoEl: asignado?.AsignadoEl ?? asignado?.asignadoEl ?? null,
  por: String(asignado?.AsignadoPor ?? asignado?.por ?? "").trim(),
});

const mapearEquipo = (item) => {
  const inventarioId = String(item?.inventarioId ?? item?.equipoId ?? "");

  return {
    equipoId: inventarioId,
    inventarioId,
    placa: item?.placa ?? "",
    categoria: item?.categoria ?? "",
    subcategoria: item?.subcategoria ?? "",
    descripcion: item?.descripcion ?? "",
    imagenActualizadaEn: item?.imagenActualizadaEn ?? null,
    restricciones: (
      Array.isArray(item?.restricciones) ? item.restricciones : []
    )
      .map((restriccion) => String(restriccion?.texto ?? restriccion).trim())
      .filter(Boolean),
    cantidad: Number(item?.cantidad) || 1,
    notas: item?.notas ?? "",
    estadoInventario: item?.estadoInventario ?? "Pendiente",
  };
};

const mapearHistorial = (historial, solicitudId) =>
  (Array.isArray(historial) ? historial : []).map((entrada, indice) => ({
    id: `${solicitudId}-hist-${indice}-${entrada?.el ?? indice}`,
    tipo: entrada?.tipo ?? "actualizacion",
    estadoAnterior: entrada?.estadoAnterior ?? null,
    estadoNuevo: entrada?.estadoNuevo ?? null,
    por: entrada?.por ?? "Administrador",
    el: entrada?.el ?? null,
    nota: entrada?.nota ?? "",
  }));

const mapearSolicitud = (raw) => {
  const id = String(raw?._id ?? raw?.id ?? "");

  return {
    id,
    codigo: raw?.codigo ?? "",
    nombre: raw?.nombre ?? "",
    departamentoId: String(raw?.departamentoId ?? ""),
    departamentoNombre: raw?.departamentoNombre ?? "",
    evento: {
      programa: raw?.evento?.programa ?? "",
      tipoEvento: raw?.evento?.tipoEvento ?? "",
      fecha: fechaSoloDia(raw?.evento?.fecha),
      horaInicio: raw?.evento?.horaInicio ?? "",
      horaFin: raw?.evento?.horaFin ?? "",
      locacion: raw?.evento?.locacion ?? "",
    },
    personal: (Array.isArray(raw?.personal) ? raw.personal : []).map(
      (linea) => ({
        rolId: String(linea?.rolId ?? ""),
        rol: linea?.rol ?? "",
        cantidad: Number(linea?.cantidad) || 0,
        horas: Number(linea?.horas) || 0,
        notas: linea?.notas ?? "",
        asignados: (Array.isArray(linea?.asignados) ? linea.asignados : []).map(
          mapearAsignado
        ),
      })
    ),
    equipos: (Array.isArray(raw?.equipos) ? raw.equipos : []).map(mapearEquipo),
    prioridad: raw?.prioridad ?? "Media",
    estado: raw?.estado ?? "Pendiente",
    solicitante: {
      nombre: raw?.solicitante?.nombre ?? "",
      cargo: raw?.solicitante?.cargo ?? "",
      correo: raw?.solicitante?.correo ?? "",
      telefono: raw?.solicitante?.telefono ?? "",
    },
    descripcion: raw?.descripcion ?? "",
    observacion: raw?.observacion ?? "",
    historial: mapearHistorial(raw?.historial, id),
    revision: Number(raw?.revision) || 0,
    decision: raw?.decididoEn
      ? {
          estado: raw?.estado,
          por: raw?.decididoPor ?? "",
          el: raw?.decididoEn,
          motivo: raw?.motivoDecision ?? "",
        }
      : null,
    integracion: { origen: "requirements", sincronizado: false },
  };
};

const validarNombreDepartamento = (nombreOriginal, idExcluir, departamentos) => {
  const nombre = String(nombreOriginal ?? "").trim();

  if (!nombre) {
    return { valido: false, mensaje: "Escribe un nombre para el departamento" };
  }

  if (nombre.length > 40) {
    return { valido: false, mensaje: "El nombre no puede superar los 40 caracteres" };
  }

  const duplicado = departamentos.some(
    (departamento) =>
      departamento.id !== idExcluir &&
      normalizarTexto(departamento.nombre) === normalizarTexto(nombre)
  );

  if (duplicado) {
    return { valido: false, mensaje: "Ya existe un departamento con ese nombre" };
  }

  return { valido: true, nombre };
};

export function RequirementsProvider({ children }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true);
  const [errorSolicitudes, setErrorSolicitudes] = useState(null);
  const [departamentos, setDepartamentos] = useState(DEPARTAMENTOS_FALLBACK);
  const [departamentosCargando, setDepartamentosCargando] = useState(true);
  const [departamentosError, setDepartamentosError] = useState(null);
  const [adminNombre] = useState(obtenerNombreAdministrador);

  const recargarSolicitudes = useCallback(async () => {
    setCargandoSolicitudes(true);

    try {
      const data = await requirementsApi.getAll();
      setSolicitudes(
        (Array.isArray(data) ? data : []).map(mapearSolicitud)
      );
      setErrorSolicitudes(null);
    } catch (error) {
      setErrorSolicitudes(
        error?.message || "No se pudieron cargar las solicitudes"
      );
    } finally {
      setCargandoSolicitudes(false);
    }
  }, []);

  const recargarDepartamentos = useCallback(async () => {
    setDepartamentosCargando(true);

    try {
      const data = await departmentsApi.getAll();
      const lista = (Array.isArray(data) ? data : [])
        .map(mapearDepartamento)
        .filter((departamento) => departamento.id && departamento.nombre)
        .sort(
          (a, b) =>
            (a.orden || 999) - (b.orden || 999) ||
            a.nombre.localeCompare(b.nombre, "es")
        );

      if (lista.length > 0) setDepartamentos(lista);
      setDepartamentosError(null);
    } catch (error) {
      setDepartamentosError(
        error?.message || "No se pudieron cargar los departamentos"
      );
    } finally {
      setDepartamentosCargando(false);
    }
  }, []);

  useEffect(() => {
    recargarDepartamentos();
    recargarSolicitudes();
  }, [recargarDepartamentos, recargarSolicitudes]);

  useRealtimeEvent("departments:changed", recargarDepartamentos);
  useRealtimeEvent("requirements:changed", recargarSolicitudes);

  const agregarDepartamento = async (nombreOriginal) => {
    const validacion = validarNombreDepartamento(
      nombreOriginal,
      null,
      departamentos
    );
    if (!validacion.valido) return { ok: false, mensaje: validacion.mensaje };

    try {
      const creado = await departmentsApi.create({ nombre: validacion.nombre });
      const nuevo = mapearDepartamento(creado);
      setDepartamentos((previos) => [...previos, nuevo]);
      return { ok: true, mensaje: `Departamento "${validacion.nombre}" agregado` };
    } catch (error) {
      return {
        ok: false,
        mensaje: error?.message || "No se pudo agregar el departamento",
      };
    }
  };

  const renombrarDepartamento = async (id, nombreOriginal) => {
    const departamento = departamentos.find((item) => item.id === id);
    if (!departamento) return { ok: false, mensaje: "El departamento no existe" };
    if (!departamento.dbId) {
      return {
        ok: false,
        mensaje: "No se pudo conectar con los departamentos del servidor",
      };
    }

    const validacion = validarNombreDepartamento(
      nombreOriginal,
      id,
      departamentos
    );
    if (!validacion.valido) return { ok: false, mensaje: validacion.mensaje };

    try {
      const actualizado = await departmentsApi.update(departamento.dbId, {
        nombre: validacion.nombre,
      });
      const mapeado = mapearDepartamento(actualizado);
      setDepartamentos((previos) =>
        previos.map((item) => (item.id === id ? { ...item, ...mapeado } : item))
      );
      return {
        ok: true,
        mensaje: `Departamento renombrado a "${validacion.nombre}"`,
      };
    } catch (error) {
      return {
        ok: false,
        mensaje: error?.message || "No se pudo renombrar el departamento",
      };
    }
  };

  const eliminarDepartamento = async (id) => {
    const departamento = departamentos.find((item) => item.id === id);
    if (!departamento) return { ok: false, mensaje: "El departamento no existe" };
    if (departamentos.length <= 1) {
      return { ok: false, mensaje: "Debe existir al menos un departamento" };
    }
    if (solicitudes.some((solicitud) => solicitud.departamentoId === id)) {
      return {
        ok: false,
        mensaje: "No puedes eliminar un departamento con solicitudes asociadas",
      };
    }
    if (!departamento.dbId) {
      return {
        ok: false,
        mensaje: "No se pudo conectar con los departamentos del servidor",
      };
    }

    try {
      await departmentsApi.remove(departamento.dbId);
      setDepartamentos((previos) => previos.filter((item) => item.id !== id));
      return {
        ok: true,
        mensaje: `Departamento "${departamento.nombre}" eliminado`,
      };
    } catch (error) {
      return {
        ok: false,
        mensaje: error?.message || "No se pudo eliminar el departamento",
      };
    }
  };

  const crearSolicitud = async (payload) => {
    try {
      const creada = await requirementsApi.create(payload);
      await recargarSolicitudes();
      return { ok: true, solicitud: mapearSolicitud(creada) };
    } catch (error) {
      return {
        ok: false,
        mensaje: error?.message || "No se pudo crear la solicitud",
      };
    }
  };

  const actualizarSolicitud = async (id, payload) => {
    const solicitud = solicitudes.find((item) => item.id === id);
    if (!solicitud) return { ok: false, mensaje: "La solicitud no existe" };

    try {
      await requirementsApi.update(id, {
        ...payload,
        revision: solicitud.revision,
      });
      await recargarSolicitudes();
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        mensaje: error?.message || "No se pudo actualizar la solicitud",
      };
    }
  };

  const eliminarSolicitud = async (id) => {
    try {
      await requirementsApi.remove(id);
      await recargarSolicitudes();
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        mensaje: error?.message || "No se pudo eliminar la solicitud",
      };
    }
  };

  const registrarDecision = async (
    id,
    { estadoNuevo, nota, notaObligatoria, mensajeExito, mensajeError }
  ) => {
    const solicitud = solicitudes.find((item) => item.id === id);

    if (!solicitud) return { ok: false, mensaje: "La solicitud no existe" };
    if (!ESTADOS_GESTIONABLES.includes(solicitud.estado)) {
      return { ok: false, mensaje: "Esta solicitud ya fue decidida" };
    }

    const notaFinal = String(nota ?? "").trim();
    if (notaObligatoria && !notaFinal) {
      return { ok: false, mensaje: mensajeError };
    }

    try {
      const actualizada = await requirementsApi.decide(id, {
        estadoNuevo,
        motivo: notaFinal,
        revision: solicitud.revision,
        aceptaRestricciones: estadoNuevo === "Aprobada",
      });
      await recargarSolicitudes();

      const mensaje =
        estadoNuevo === "Aprobada" && actualizada?.estado === "Agendado"
          ? "Solicitud aprobada y agendada"
          : mensajeExito;

      return { ok: true, mensaje };
    } catch (error) {
      return {
        ok: false,
        mensaje: error?.message || "No se pudo procesar la decisión",
      };
    }
  };

  const aprobarSolicitud = (id, nota = "") =>
    registrarDecision(id, {
      estadoNuevo: "Aprobada",
      nota,
      notaObligatoria: false,
      mensajeExito: "Solicitud aprobada y equipos reservados",
      mensajeError: "",
    });

  const denegarSolicitud = (id, nota = "") =>
    registrarDecision(id, {
      estadoNuevo: "Rechazada",
      nota,
      notaObligatoria: true,
      mensajeExito: "Solicitud denegada",
      mensajeError: "Escribe el motivo de la denegación",
    });

  const solicitarRevisionSolicitud = (id, nota = "") =>
    registrarDecision(id, {
      estadoNuevo: "En revisión",
      nota,
      notaObligatoria: true,
      mensajeExito: "Revisión solicitada al solicitante",
      mensajeError: "Escribe las anotaciones para solicitar la revisión",
    });

  const asignarPersonalSolicitud = async (solicitudId, rolId, personas = []) => {
    const solicitud = solicitudes.find((item) => item.id === solicitudId);
    if (!solicitud) return { ok: false, mensaje: "La solicitud no existe" };

    const linea = (solicitud.personal ?? []).find(
      (item) => String(item.rolId) === String(rolId)
    );
    if (!linea) {
      return {
        ok: false,
        mensaje: "El área de personal no existe en la solicitud",
      };
    }

    const ids = [
      ...new Set(
        (Array.isArray(personas) ? personas : [])
          .map((persona) => String(persona?.userId ?? "").trim())
          .filter(Boolean)
      ),
    ];

    if (ids.length === 0) {
      return {
        ok: false,
        mensaje: "Las personas seleccionadas no son válidas",
      };
    }

    try {
      const actualizada = await requirementsApi.assignPersonnel(
        solicitudId,
        rolId,
        {
          asignados: ids.map((id) => ({ id })),
          revision: solicitud.revision,
        }
      );
      await recargarSolicitudes();

      const agendada = actualizada?.estado === "Agendado";

      return {
        ok: true,
        mensaje: agendada
          ? `Personal completo: ${linea.rol || linea.rolId} cubierto y solicitud agendada`
          : `Personal asignado a ${linea.rol || linea.rolId}`,
      };
    } catch (error) {
      return {
        ok: false,
        mensaje: error?.message || "No se pudo asignar el personal",
      };
    }
  };

  const valor = {
    solicitudes,
    cargandoSolicitudes,
    errorSolicitudes,
    recargarSolicitudes,
    departamentos,
    departamentosCargando,
    departamentosError,
    recargarDepartamentos,
    adminNombre,
    totalRequerimientos: solicitudes.length,
    totalPendientes: solicitudes.filter(
      (solicitud) => solicitud.estado === "Pendiente"
    ).length,
    totalEnRevision: solicitudes.filter(
      (solicitud) => solicitud.estado === "En revisión"
    ).length,
    crearSolicitud,
    actualizarSolicitud,
    eliminarSolicitud,
    aprobarSolicitud,
    denegarSolicitud,
    solicitarRevisionSolicitud,
    asignarPersonalSolicitud,
    agregarDepartamento,
    renombrarDepartamento,
    eliminarDepartamento,
  };

  return (
    <RequirementsContext.Provider value={valor}>
      {children}
    </RequirementsContext.Provider>
  );
}

RequirementsProvider.propTypes = {
  children: PropTypes.node,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRequirements = () => {
  const contexto = useContext(RequirementsContext);

  if (!contexto) {
    throw new Error("useRequirements debe usarse dentro de RequirementsProvider");
  }

  return contexto;
};
