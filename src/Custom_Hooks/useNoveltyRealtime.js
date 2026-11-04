import { useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";

/** Eventos que emite el backend al cambiar una novedad. */
export const NOVELTY_EVENTS = {
  CREATED: "novedad_creada",
  RESOLVED: "novedad_solucionada",
  DELETED: "novedad_eliminada",
};

/**
 * Suscribe la pantalla a los cambios de novedades de otras sesiones.
 *
 * Reutiliza el socket único de ChatContext (el mismo del chat), por lo que no
 * se abre una segunda conexión ni se duplica la autenticación de usuario.
 *
 * Los callbacks se guardan en un ref para registrar los listeners una sola vez
 * por socket y evitar re-suscripciones en cada render.
 */
export function useNoveltyRealtime({
  onCreated,
  onResolved,
  onDeleted,
  onResync,
} = {}) {
  const { socket } = useChat() ?? {};
  const handlersRef = useRef({ onCreated, onResolved, onDeleted, onResync });

  useEffect(() => {
    handlersRef.current = { onCreated, onResolved, onDeleted, onResync };
  });

  useEffect(() => {
    if (!socket) return undefined;

    const handleCreated = (payload) => handlersRef.current.onCreated?.(payload);
    const handleResolved = (payload) => handlersRef.current.onResolved?.(payload);
    const handleDeleted = (payload) => handlersRef.current.onDeleted?.(payload);
    // Al reconectar (backend reiniciado, red caída) se resincroniza la lista.
    const handleReconnect = () => handlersRef.current.onResync?.();

    socket.on(NOVELTY_EVENTS.CREATED, handleCreated);
    socket.on(NOVELTY_EVENTS.RESOLVED, handleResolved);
    socket.on(NOVELTY_EVENTS.DELETED, handleDeleted);
    socket.on("connect", handleReconnect);

    return () => {
      socket.off(NOVELTY_EVENTS.CREATED, handleCreated);
      socket.off(NOVELTY_EVENTS.RESOLVED, handleResolved);
      socket.off(NOVELTY_EVENTS.DELETED, handleDeleted);
      socket.off("connect", handleReconnect);
    };
  }, [socket]);
}
