/**
 * Lectura del usuario autenticado.
 *
 * Login.jsx guarda en localStorage.userAuth el objeto que devuelve
 * /auth/login: { id, nombres, apellidos, rol, imagen }.
 * Estas utilidades toleran datos ausentes o corruptos para que las pantallas
 * puedan seguir funcionando con un valor por defecto.
 */

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem("userAuth");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Nombre completo del usuario autenticado ("Nombres Apellidos").
 * Si no hay sesión válida devuelve el fallback indicado.
 */
export function getCurrentUserName(fallback = "Administrador") {
  const user = getCurrentUser();
  if (!user) return fallback;

  const fullName = [user.nombres, user.apellidos]
    .filter((part) => typeof part === "string" && part.trim())
    .join(" ")
    .trim();

  return fullName || user.usuario || user.name || fallback;
}
