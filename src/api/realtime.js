import io from "socket.io-client";

import { REALTIME_URL } from "./client";

/**
 * Conexión compartida para avisos de cambios de Programmer, departamentos y
 * otras pantallas. El chat mantiene su propia conexión por compatibilidad.
 */
export const realtimeSocket = io(REALTIME_URL, {
  autoConnect: true,
});
