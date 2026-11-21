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

/**
 * Identidad de la sesión para las operaciones que el backend restringe por
 * rol. El backend vuelve a consultar el usuario en la base de datos; el header
 * no sustituye un token firmado, pero evita que la interfaz opere sin sesión.
 */
api.interceptors.request.use((config) => {
  try {
    const guardado = localStorage.getItem("userAuth");
    if (!guardado) return config;

    const usuario = JSON.parse(guardado);
    const id = usuario?.id ?? usuario?._id ?? usuario?.uid;
    const nombre = [usuario?.nombres, usuario?.apellidos]
      .filter(Boolean)
      .join(" ")
      .trim();

    config.headers = config.headers ?? {};
    if (id) config.headers["x-user-id"] = String(id);
    if (nombre) config.headers["x-user-name"] = nombre;
    if (usuario?.rol) config.headers["x-user-role"] = String(usuario.rol);
  } catch {
    /* Sin sesión legible: la petición sigue sin headers de identidad */
  }

  return config;
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
