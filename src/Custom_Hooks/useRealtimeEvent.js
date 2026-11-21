import { useEffect } from "react";

import { realtimeSocket } from "../api/realtime";

/** Suscribe un handler al socket compartido y lo limpia al desmontar. */
export const useRealtimeEvent = (event, handler) => {
  useEffect(() => {
    if (!event || typeof handler !== "function") return undefined;

    realtimeSocket.on(event, handler);
    return () => {
      realtimeSocket.off(event, handler);
    };
  }, [event, handler]);
};
