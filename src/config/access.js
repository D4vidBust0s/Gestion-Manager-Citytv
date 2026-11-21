/**
 * Control de acceso de GM Citytv.
 *
 * GM Citytv es el sistema de gestión (planner, programación, nómina, etc.).
 * El almacén no entra aquí: su sistema es GM-Activos. Ver D-032.
 */

export const ROLES_ALMACEN = ["Almacenista", "Almaceneista"];

const normalizarRol = (valor) => String(valor ?? "").trim().toLowerCase();

/** ¿El rol del usuario pertenece al almacén (GM-Activos)? */
export const esRolAlmacen = (usuario) =>
  ROLES_ALMACEN.some((rol) => normalizarRol(rol) === normalizarRol(usuario?.rol));

/**
 * Sesión utilizable en GM Citytv: cualquier rol de gestión, nunca el almacén.
 * Un usuario sin rol también queda fuera.
 */
export const usuarioPermitido = (usuario) =>
  Boolean(usuario) &&
  Boolean(normalizarRol(usuario.rol)) &&
  !esRolAlmacen(usuario);

/** Lee y valida la sesión guardada en el navegador. */
export const leerSesionPermitida = () => {
  try {
    const guardado = localStorage.getItem("userAuth");
    if (!guardado) return null;

    const usuario = JSON.parse(guardado);
    return usuarioPermitido(usuario) ? usuario : null;
  } catch {
    return null;
  }
};
