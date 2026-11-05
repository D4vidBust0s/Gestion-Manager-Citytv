import { useEffect, useRef, useState } from 'react';

export const DEFAULT_IDLE_TIMEOUT_MS = 30000;

const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'wheel', 'keydown'];
const ACTIVITY_THROTTLE_MS = 250;

const normalizeTimeout = (value) => {
  const timeout = Number(value);
  return Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_IDLE_TIMEOUT_MS;
};

/**
 * Devuelve true mientras haya interacción reciente (mouse, teclado, scroll o toque)
 * y false cuando pasa `idleTimeoutMs` sin actividad. El estado se actualiza en tiempo
 * real al reiniciar el temporizador con cada evento.
 */
export function useUserActivity(idleTimeoutMs = DEFAULT_IDLE_TIMEOUT_MS) {
  const [isActive, setIsActive] = useState(true);
  const lastActivityRef = useRef(Date.now());
  const activeRef = useRef(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const timeout = normalizeTimeout(idleTimeoutMs);

    const clearIdleTimer = () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const markInactive = () => {
      clearIdleTimer();
      if (activeRef.current) {
        activeRef.current = false;
        setIsActive(false);
      }
    };

    const scheduleIdle = (delay = timeout) => {
      clearIdleTimer();
      timeoutRef.current = setTimeout(markInactive, Math.max(0, delay));
    };

    const handleActivity = () => {
      const now = Date.now();
      // Evita reiniciar el temporizador en cada píxel del mouse.
      if (now - lastActivityRef.current < ACTIVITY_THROTTLE_MS) return;
      lastActivityRef.current = now;
      if (!activeRef.current) {
        activeRef.current = true;
        setIsActive(true);
      }
      scheduleIdle();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearIdleTimer();
        return;
      }
      const remaining = timeout - (Date.now() - lastActivityRef.current);
      if (remaining <= 0) {
        markInactive();
      } else {
        scheduleIdle(remaining);
      }
    };

    lastActivityRef.current = Date.now();
    activeRef.current = true;
    setIsActive(true);
    scheduleIdle();

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });
    window.addEventListener('scroll', handleActivity, { passive: true, capture: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearIdleTimer();
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      window.removeEventListener('scroll', handleActivity, { capture: true });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [idleTimeoutMs]);

  return isActive;
}
