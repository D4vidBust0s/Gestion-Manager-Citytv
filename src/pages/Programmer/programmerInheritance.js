const TEXTO = (valor) => String(valor ?? "").trim();

/** Programa / evento visible: siempre espejo del nombre del programador. */
export const programaHeredado = (nombre) => TEXTO(nombre);

/** Tipo de evento visible: siempre espejo del departamento. */
export const tipoEventoHeredado = (departamento) => {
  const valor = TEXTO(departamento);
  return valor === "Sin departamento" ? "" : valor;
};

/** Departamento normalizado para la UI: vacío se muestra como sin departamento. */
export const departamentoHeredado = (departamento) =>
  TEXTO(departamento) || "Sin departamento";
