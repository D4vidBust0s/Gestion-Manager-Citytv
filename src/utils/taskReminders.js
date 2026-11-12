/**
 * Utilidades puras para los recordatorios semanales de tareas/notas.
 *
 * Un recordatorio se ancla a la fecha limite (`fechaVencimiento`): la primera
 * ocurrencia nunca puede ser anterior a esa fecha. A partir de ahi se repite
 * cada semana en los dias y horas elegidos por el usuario.
 *
 * Las fechas de calendario se leen con componentes UTC porque el backend las
 * guarda como medianoche UTC (misma convencion que ya usa TasksContent). Las
 * horas de aviso se interpretan con el reloj local del navegador.
 */

const HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DOS_DIGITOS = (valor) => String(valor).padStart(2, "0");

/** Dias de la semana en el orden en que se muestran (0 = domingo, 6 = sabado). */
export const DIAS_RECORDATORIO = Object.freeze([
  { valor: 0, corto: "Dom", nombre: "Domingo" },
  { valor: 1, corto: "Lun", nombre: "Lunes" },
  { valor: 2, corto: "Mar", nombre: "Martes" },
  { valor: 3, corto: "Mié", nombre: "Miércoles" },
  { valor: 4, corto: "Jue", nombre: "Jueves" },
  { valor: 5, corto: "Vie", nombre: "Viernes" },
  { valor: 6, corto: "Sáb", nombre: "Sábado" },
]);

/** Convierte una fecha del backend o un "YYYY-MM-DD" en { year, month, day }. */
export const aFechaSoloDia = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null;

  if (typeof valor === "string") {
    const coincidencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor.trim());
    if (coincidencia) {
      return {
        year: Number(coincidencia[1]),
        month: Number(coincidencia[2]),
        day: Number(coincidencia[3]),
      };
    }
  }

  const fecha = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(fecha.getTime())) return null;

  return {
    year: fecha.getUTCFullYear(),
    month: fecha.getUTCMonth() + 1,
    day: fecha.getUTCDate(),
  };
};

/** Clave ordenable de una fecha de calendario: "YYYY-MM-DD". */
export const claveFecha = (fecha) => {
  if (!fecha) return "";
  return `${fecha.year}-${DOS_DIGITOS(fecha.month)}-${DOS_DIGITOS(fecha.day)}`;
};

/** Clave de la fecha local actual, usada para comparar y deduplicar avisos. */
export const claveDiaLocal = (ahora = new Date()) =>
  `${ahora.getFullYear()}-${DOS_DIGITOS(ahora.getMonth() + 1)}-${DOS_DIGITOS(
    ahora.getDate()
  )}`;

/** Dia de la semana (0 = domingo) de una fecha de calendario. */
export const diaSemanaDeFecha = (fecha) => {
  if (!fecha) return null;
  return new Date(Date.UTC(fecha.year, fecha.month - 1, fecha.day)).getUTCDay();
};

/** Normaliza la lista de dias: enteros 0..6, sin duplicados y ordenados. */
export const normalizarDias = (dias) => {
  if (!Array.isArray(dias)) return [];

  const unicos = new Set(
    dias
      .filter((dia) => dia !== null && dia !== undefined && dia !== "")
      .map((dia) => Number(dia))
      .filter((dia) => Number.isInteger(dia) && dia >= 0 && dia <= 6)
  );

  return [...unicos].sort((a, b) => a - b);
};

/** Normaliza la lista de horas: formato "HH:mm", sin duplicados y ordenadas. */
export const normalizarHoras = (horas) => {
  if (!Array.isArray(horas)) return [];

  const unicas = new Set(
    horas
      .map((hora) => String(hora ?? "").trim())
      .filter((hora) => HORA_REGEX.test(hora))
  );

  return [...unicas].sort();
};

/** Indica si la tarea debe generar avisos en este momento. */
export const esRecordatorioActivo = (task) => {
  if (!task || !task.esRecordatorio || task.completada) return false;

  const vencimiento = aFechaSoloDia(task.fechaVencimiento);
  if (!vencimiento) return false;

  return (
    normalizarDias(task.recordatorioDias).length > 0 &&
    normalizarHoras(task.recordatorioHoras).length > 0
  );
};

/**
 * Primera ocurrencia estrictamente posterior a `ahora`, partiendo del maximo
 * entre hoy y la fecha limite. Devuelve null si no hay configuracion valida.
 */
export const proximaOcurrencia = (task, ahora = new Date()) => {
  if (!esRecordatorioActivo(task)) return null;

  const vencimiento = aFechaSoloDia(task.fechaVencimiento);
  const dias = new Set(normalizarDias(task.recordatorioDias));
  const horas = normalizarHoras(task.recordatorioHoras);

  const hoy = {
    year: ahora.getFullYear(),
    month: ahora.getMonth() + 1,
    day: ahora.getDate(),
  };

  // Nunca se empieza antes de la fecha limite de la tarea.
  const inicio = claveFecha(vencimiento) > claveFecha(hoy) ? vencimiento : hoy;

  for (let desplazamiento = 0; desplazamiento < 8; desplazamiento += 1) {
    const cursor = new Date(
      Date.UTC(inicio.year, inicio.month - 1, inicio.day + desplazamiento)
    );

    const fechaCursor = {
      year: cursor.getUTCFullYear(),
      month: cursor.getUTCMonth() + 1,
      day: cursor.getUTCDate(),
    };

    if (!dias.has(cursor.getUTCDay())) continue;

    for (const hora of horas) {
      const [horasNumero, minutosNumero] = hora.split(":").map(Number);
      const candidato = new Date(
        fechaCursor.year,
        fechaCursor.month - 1,
        fechaCursor.day,
        horasNumero,
        minutosNumero,
        0,
        0
      );

      if (candidato.getTime() > ahora.getTime()) return candidato;
    }
  }

  return null;
};

/**
 * Si el recordatorio coincide con el dia y la hora actuales, devuelve una
 * clave de deduplicacion; en caso contrario devuelve null.
 */
export const recordatorioDelMinuto = (task, ahora = new Date()) => {
  if (!esRecordatorioActivo(task)) return null;

  const vencimiento = aFechaSoloDia(task.fechaVencimiento);
  if (!vencimiento) return null;

  const dias = normalizarDias(task.recordatorioDias);
  if (!dias.includes(ahora.getDay())) return null;

  const hora = `${DOS_DIGITOS(ahora.getHours())}:${DOS_DIGITOS(
    ahora.getMinutes()
  )}`;
  const horas = normalizarHoras(task.recordatorioHoras);
  if (!horas.includes(hora)) return null;

  const hoy = {
    year: ahora.getFullYear(),
    month: ahora.getMonth() + 1,
    day: ahora.getDate(),
  };

  // La tarea aun no ha llegado a su fecha limite.
  if (claveFecha(hoy) < claveFecha(vencimiento)) return null;

  const id = task._id || task.id || "tarea";
  return `${claveDiaLocal(ahora)}|${hora}|${id}`;
};

/** Texto compacto con los dias y horas configurados, por ejemplo "Lun, Mié · 08:00". */
export const formatearHorario = (task) => {
  if (!task) return "";

  const dias = normalizarDias(task.recordatorioDias);
  const horas = normalizarHoras(task.recordatorioHoras);
  const etiquetas = DIAS_RECORDATORIO.filter((dia) =>
    dias.includes(dia.valor)
  ).map((dia) => dia.corto);

  if (!etiquetas.length && !horas.length) return "";

  return `${etiquetas.join(", ")}${etiquetas.length && horas.length ? " · " : ""}${horas.join(", ")}`;
};

/** Formatea una fecha local como "DD/MM/YYYY HH:mm". */
export const formatearFechaHora = (fecha) => {
  if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) return "";

  return `${DOS_DIGITOS(fecha.getDate())}/${DOS_DIGITOS(
    fecha.getMonth() + 1
  )}/${fecha.getFullYear()} ${DOS_DIGITOS(fecha.getHours())}:${DOS_DIGITOS(
    fecha.getMinutes()
  )}`;
};

/** Texto de apoyo del formulario: primer aviso y regla de repeticion. */
export const textoPreviewRecordatorio = (datos) => {
  const fecha = aFechaSoloDia(datos?.fechaVencimiento);
  if (!fecha) {
    return "Selecciona la fecha límite para calcular el primer aviso.";
  }

  if (
    !normalizarDias(datos?.recordatorioDias).length ||
    !normalizarHoras(datos?.recordatorioHoras).length
  ) {
    return "Selecciona al menos un día y una hora para ver el primer aviso.";
  }

  const proxima = proximaOcurrencia(
    { ...datos, esRecordatorio: true, completada: false },
    new Date()
  );

  if (!proxima) {
    return "No se pudo calcular el próximo aviso; revisa los días y las horas.";
  }

  return `El primer aviso será el ${formatearFechaHora(proxima)} y se repetirá cada semana (nunca antes de la fecha límite).`;
};
