/**
 * Días de la semana de los programas (/programs).
 *
 * Los programas guardan los días en ambos casing (lunes/Lunes, Martes/martes,
 * ...). Se leen las dos grafías. Un programa sin ningún día activo se trata
 * como sin restricción para no afectar datos heredados.
 */

export const DIAS_SEMANA = [
  { valor: 1, clave: "lunes", nombre: "Lunes", corto: "Lun" },
  { valor: 2, clave: "martes", nombre: "Martes", corto: "Mar" },
  { valor: 3, clave: "miercoles", nombre: "Miércoles", corto: "Mié" },
  { valor: 4, clave: "jueves", nombre: "Jueves", corto: "Jue" },
  { valor: 5, clave: "viernes", nombre: "Viernes", corto: "Vie" },
  { valor: 6, clave: "sabado", nombre: "Sábado", corto: "Sáb" },
  { valor: 0, clave: "domingo", nombre: "Domingo", corto: "Dom" },
];

const DIAS_POR_VALOR = new Map(DIAS_SEMANA.map((dia) => [dia.valor, dia]));

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

const clavesDia = (clave) => [clave, capitalizar(clave)];

const esVerdadero = (valor) => {
  const texto = String(valor ?? "").toLowerCase();
  return valor === true || valor === 1 || texto === "true" || texto === "1";
};

const fechaValida = (fecha) => {
  const valor = fecha instanceof Date ? fecha : new Date(fecha);
  return Number.isNaN(valor.getTime()) ? null : valor;
};

/** `[1,2,3,4,5,6,0]` → "Lun–Vie", "Fin de semana", "Todos los días", ... */
export const resumenDiasPrograma = (diasActivos = []) => {
  const activos = new Set(
    (Array.isArray(diasActivos) ? diasActivos : []).map(Number)
  );
  const todos = DIAS_SEMANA.every((dia) => activos.has(dia.valor));
  if (todos) return "Todos los días";

  const laborables = [1, 2, 3, 4, 5];
  if (
    activos.size === laborables.length &&
    laborables.every((dia) => activos.has(dia))
  ) {
    return "Lun–Vie";
  }

  const finDeSemana = [6, 0];
  if (
    activos.size === finDeSemana.length &&
    finDeSemana.every((dia) => activos.has(dia))
  ) {
    return "Fin de semana";
  }

  const etiquetas = DIAS_SEMANA.filter((dia) => activos.has(dia.valor)).map(
    (dia) => dia.corto
  );

  return etiquetas.length > 0 ? etiquetas.join(", ") : "Sin días configurados";
};

/**
 * Estado de un programa para la fecha indicada.
 * Devuelve { configurado, activo, dia, diasActivos, resumen }.
 */
export const estadoDiaPrograma = (programa, fecha) => {
  const valorFecha = fechaValida(fecha);
  const dia = valorFecha ? valorFecha.getDay() : null;

  const dias = DIAS_SEMANA.map((diaSemana) => ({
    ...diaSemana,
    activo: clavesDia(diaSemana.clave).some((clave) =>
      esVerdadero(programa?.[clave])
    ),
  }));

  const diasActivos = dias.filter((diaSemana) => diaSemana.activo).map((diaSemana) => diaSemana.valor);
  const configurado = diasActivos.length > 0;
  const diaActual = dia === null ? null : dias.find((item) => item.valor === dia) ?? null;

  return {
    configurado,
    activo:
      dia === null || !configurado ? true : Boolean(diaActual?.activo),
    dia,
    diasActivos,
    resumen: resumenDiasPrograma(diasActivos),
  };
};

/** Nombre del día de la fecha, para mensajes y avisos. */
export const nombreDiaFecha = (fecha) => {
  const valor = fechaValida(fecha);
  if (!valor) return { nombre: "", corto: "", fechaLarga: "" };

  const dia = DIAS_POR_VALOR.get(valor.getDay());

  return {
    nombre: dia ? dia.nombre.toLowerCase() : "",
    corto: dia ? dia.corto.toLowerCase() : "",
    fechaLarga: valor.toLocaleDateString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
};

/** Mensaje de aviso cuando el programa no emite en la fecha. */
export const mensajeDiaPrograma = (programa, fecha) => {
  const estado = estadoDiaPrograma(programa, fecha);
  const dia = nombreDiaFecha(fecha);

  if (!estado.configurado || estado.activo || !dia.nombre) return "";

  const nombre = programa?.nombre ?? programa?.Nombre ?? "El programa";

  if (estado.resumen === "Fin de semana") {
    return `${nombre} es un programa de fin de semana y no emite este ${dia.nombre}.`;
  }

  if (estado.resumen === "Lun–Vie") {
    return `${nombre} es un programa entre semana y no emite este ${dia.nombre}.`;
  }

  return `${nombre} solo emite ${estado.resumen} y no emite este ${dia.nombre}.`;
};
