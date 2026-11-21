import { getCurrentUser } from "../../utils/currentUser.js";

const ROLES_GESTORES = new Set([
  "administrador",
  "admin",
  "superadmin",
  "ingeniero",
  "coordinador",
  "jefe",
]);

const normalizar = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

/** Refleja en la interfaz la misma restricción que valida el backend. */
export const puedeGestionarProgrammer = (usuario = getCurrentUser()) =>
  ROLES_GESTORES.has(normalizar(usuario?.rol));
