import axios from "axios";

/**
 * Punto único de salida HTTP de la aplicación.
 *
 * Ningún componente debe volver a escribir "http://localhost:3000/api/...":
 * la URL base vive en .env (VITE_API_URL) y los servicios de src/api/*
 * son los únicos que conocen las rutas.
 */

const DEFAULT_API_URL = "http://localhost:3000/api";

const trimTrailingSlash = (url) => url.replace(/\/+$/, "");

export const API_URL = trimTrailingSlash(
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
);

/** URL del servidor de sockets: misma base, sin el prefijo /api. */
export const REALTIME_URL = trimTrailingSlash(
  import.meta.env.VITE_REALTIME_URL || API_URL.replace(/\/api$/, "")
);

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export const isCanceled = (error) =>
  axios.isCancel(error) || error?.code === "ERR_CANCELED";

/**
 * Convierte el error crudo de axios en un Error con mensaje legible,
 * para que los componentes solo tengan que hacer toast.error(error.message).
 */
const normalizeError = (error) => {
  if (isCanceled(error)) return error;

  const data = error.response?.data;
  const message =
    (typeof data === "string" && data) ||
    data?.message ||
    data?.error ||
    (error.code === "ECONNABORTED"
      ? "La solicitud tardó demasiado, intente de nuevo"
      : error.message || "No fue posible conectar con el servidor");

  const normalized = new Error(message);
  normalized.name = "ApiError";
  normalized.status = error.response?.status ?? null;
  normalized.response = error.response;
  normalized.cause = error;

  return normalized;
};

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error))
);
