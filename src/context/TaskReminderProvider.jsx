import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import { tasksApi } from "../api/tasks";
import { TaskReminderContext } from "./TaskReminderContext";
import {
  claveDiaLocal,
  formatearHorario,
  recordatorioDelMinuto,
} from "../utils/taskReminders";

const CLAVE_DISPARADOS = "task_reminders_fired";
const CLAVE_PENDIENTES = "task_pending_reminders";
const INTERVALO_REVISION_MS = 30000;
const VOLUMEN_AVISO = 0.45;
const MAX_PENDIENTES = 20;

const obtenerUsuarioId = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem("userAuth"));
    return usuario?.id || usuario?._id || null;
  } catch {
    return null;
  }
};

const leerDisparados = () => {
  try {
    const crudo = sessionStorage.getItem(CLAVE_DISPARADOS);
    if (!crudo) return new Set();

    const datos = JSON.parse(crudo);
    if (
      !datos ||
      datos.fecha !== claveDiaLocal() ||
      !Array.isArray(datos.claves)
    ) {
      return new Set();
    }

    return new Set(datos.claves);
  } catch {
    return new Set();
  }
};

const guardarDisparados = (claves) => {
  try {
    sessionStorage.setItem(
      CLAVE_DISPARADOS,
      JSON.stringify({
        fecha: claveDiaLocal(),
        claves: [...claves].slice(-100),
      })
    );
  } catch {
    /* Sin almacenamiento: la deduplicacion sigue funcionando en memoria. */
  }
};

const leerPendientes = (usuarioId) => {
  if (!usuarioId) return [];

  try {
    const crudo = sessionStorage.getItem(CLAVE_PENDIENTES);
    if (!crudo) return [];

    const datos = JSON.parse(crudo);
    if (
      !datos ||
      datos.usuarioId !== usuarioId ||
      !Array.isArray(datos.items)
    ) {
      return [];
    }

    const hace24Horas = Date.now() - 24 * 60 * 60 * 1000;

    return datos.items.filter((item) => {
      if (!item || !item.taskId || typeof item.titulo !== "string") {
        return false;
      }

      const fecha = item.fecha ? new Date(item.fecha).getTime() : NaN;
      return Number.isFinite(fecha) && fecha >= hace24Horas;
    });
  } catch {
    return [];
  }
};

const guardarPendientes = (usuarioId, items) => {
  try {
    sessionStorage.setItem(
      CLAVE_PENDIENTES,
      JSON.stringify({
        usuarioId,
        items: items.slice(0, MAX_PENDIENTES),
      })
    );
  } catch {
    /* Sin almacenamiento: el aviso sigue visible en memoria. */
  }
};

/**
 * Proveedor global de recordatorios: consulta las tareas del usuario,
 * reproduce el sonido, lanza el toast y conserva los avisos pendientes que
 * alimentan el indicador superior.
 */
export default function TaskReminderProvider({ children }) {
  const usuarioId = useMemo(obtenerUsuarioId, []);
  const [pendientes, setPendientes] = useState(() =>
    leerPendientes(usuarioId)
  );
  const disparadosRef = useRef(null);
  const audioRef = useRef(null);

  if (disparadosRef.current === null) {
    disparadosRef.current = leerDisparados();
  }

  const reproducirSonido = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(`${import.meta.env.BASE_URL}beep.mp3`);
        audioRef.current.preload = "auto";
        audioRef.current.volume = VOLUMEN_AVISO;
      }

      audioRef.current.currentTime = 0;
      const reproduccion = audioRef.current.play();

      if (reproduccion && typeof reproduccion.catch === "function") {
        reproduccion.catch(() => {
          /* El navegador puede bloquear el audio hasta una interaccion. */
        });
      }
    } catch {
      /* Sin audio disponible: el aviso visual sigue funcionando. */
    }
  }, []);

  const limpiarPendientes = useCallback(() => {
    setPendientes([]);
    try {
      sessionStorage.removeItem(CLAVE_PENDIENTES);
    } catch {
      /* Sin almacenamiento no hay nada extra que limpiar. */
    }
  }, []);

  // La lista de avisos pendientes se conserva entre rutas y recargas.
  useEffect(() => {
    if (usuarioId) {
      guardarPendientes(usuarioId, pendientes);
    }
  }, [pendientes, usuarioId]);

  const registrarPendiente = useCallback((task, ahora) => {
    setPendientes((prev) => {
      const nuevo = {
        taskId: String(task._id || task.id || `tarea-${ahora.getTime()}`),
        titulo: task.titulo || "Recordatorio",
        horario: formatearHorario(task),
        fecha: ahora.toISOString(),
      };

      const sinDuplicado = prev.filter(
        (item) => item.taskId !== nuevo.taskId
      );
      return [nuevo, ...sinDuplicado].slice(0, MAX_PENDIENTES);
    });
  }, []);

  const revisar = useCallback(
    (tareas) => {
      const ahora = new Date();
      const hoy = claveDiaLocal(ahora);

      // Se descartan las claves de dias anteriores para no crecer sin limite.
      for (const clave of disparadosRef.current) {
        if (!clave.startsWith(`${hoy}|`)) {
          disparadosRef.current.delete(clave);
        }
      }

      // Los avisos de tareas eliminadas o completadas dejan de mostrarse.
      setPendientes((prev) => {
        if (!prev.length) return prev;

        const tareasPorId = new Map(
          tareas.map((task) => [String(task._id || task.id), task])
        );
        const vigentes = prev.filter((item) => {
          const tarea = tareasPorId.get(item.taskId);
          return tarea && !tarea.completada;
        });

        return vigentes;
      });

      let huboNuevoRecordatorio = false;

      tareas.forEach((task) => {
        const clave = recordatorioDelMinuto(task, ahora);
        if (!clave || disparadosRef.current.has(clave)) return;

        disparadosRef.current.add(clave);
        guardarDisparados(disparadosRef.current);
        huboNuevoRecordatorio = true;

        registrarPendiente(task, ahora);

        toast.success(
          <div>
            <strong>⏰ {task.titulo}</strong>
            <div style={{ fontSize: "0.8rem", marginTop: "2px" }}>
              {formatearHorario(task) || "Recordatorio"}
            </div>
          </div>,
          { id: clave, duration: 10000 }
        );
      });

      // Un solo sonido aunque coincidan varios recordatorios en el minuto.
      if (huboNuevoRecordatorio) reproducirSonido();
    },
    [registrarPendiente, reproducirSonido]
  );

  useEffect(() => {
    if (!usuarioId) return undefined;

    let cancelado = false;
    let avisoApiMostrado = false;

    const cargarYRevisar = async () => {
      try {
        const tareas = await tasksApi.getByUser(usuarioId);
        if (cancelado) return;
        revisar(Array.isArray(tareas) ? tareas : []);
      } catch (error) {
        if (!avisoApiMostrado) {
          console.warn(
            "No se pudieron revisar los recordatorios:",
            error?.message || error
          );
          avisoApiMostrado = true;
        }
      }
    };

    cargarYRevisar();

    const intervalo = setInterval(cargarYRevisar, INTERVALO_REVISION_MS);
    const alEnfocar = () => cargarYRevisar();
    const alCambiarVisibilidad = () => {
      if (!document.hidden) cargarYRevisar();
    };

    window.addEventListener("focus", alEnfocar);
    document.addEventListener("visibilitychange", alCambiarVisibilidad);

    return () => {
      cancelado = true;
      clearInterval(intervalo);
      window.removeEventListener("focus", alEnfocar);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
    };
  }, [usuarioId, revisar]);

  const valor = useMemo(
    () => ({
      pendientes,
      total: pendientes.length,
      limpiarPendientes,
    }),
    [pendientes, limpiarPendientes]
  );

  return (
    <TaskReminderContext.Provider value={valor}>
      {children}
    </TaskReminderContext.Provider>
  );
}

TaskReminderProvider.propTypes = {
  children: PropTypes.node,
};
