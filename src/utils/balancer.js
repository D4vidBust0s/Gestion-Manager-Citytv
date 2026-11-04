/**
 * Utilidades puras de la pantalla Balancer.
 *
 * Reproducen exactamente las fórmulas que tenía el componente original
 * (createArray, createMont, traerRangoFechas, operarMatrizDias) para que los
 * días, encabezados y horas visibles sean los mismos. Al no depender de React
 * ni de la API se pueden probar con datos reales de forma aislada.
 */

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const formatearNumero = (numero) =>
  numero >= 0 && numero <= 9 ? `0${numero}` : numero;

/** Igual que el formateador anterior, pero sumando uno antes de rellenar. */
const formatearNumero2 = (numero) => formatearNumero(numero + 1);

export const sumaDias = (fecha, dias) =>
  new Date(
    new Date(fecha).setDate(new Date(fecha).getDate() + parseInt(dias, 10))
  ).getDate();

export const sumaMes = (fecha, dias) =>
  new Date(
    new Date(fecha).setDate(new Date(fecha).getDate() + parseInt(dias, 10))
  ).getMonth();

export const sumaAño = (fecha, dias) =>
  new Date(
    new Date(fecha).setDate(new Date(fecha).getDate() + parseInt(dias, 10))
  ).getFullYear();

export const validateMonts = (mes) => MESES[mes];

/** Fecha local a medianoche, o null si el valor no es una fecha válida. */
const fechaBase = (valor) => {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return null;
  fecha.setHours(0, 0, 0, 0);
  return fecha;
};

/**
 * Misma conversión que la pantalla original: fecha local "YYYY-MM-DDt00:00:00"
 * a ISO UTC. Devuelve "" si la fecha no es válida.
 */
const aIso = (anio, mes, dia) => {
  const fecha = new Date(
    `${anio}-${formatearNumero(mes + 1)}-${formatearNumero(dia)}T00:00:00`
  );
  return Number.isNaN(fecha.getTime()) ? "" : fecha.toISOString();
};

/** Días del periodo de una regla: { dia, mes, anio, iso }. */
export const construirDias = (regla) => {
  const base = fechaBase(regla?.DiaPeriod);
  const total = parseInt(regla?.Dia, 10);
  if (!base || !Number.isFinite(total) || total < 0) return [];

  const dias = [];
  for (let i = 0; i <= total; i++) {
    const fecha = new Date(base);
    fecha.setDate(fecha.getDate() + i);
    const dia = fecha.getDate();
    const mes = fecha.getMonth();
    const anio = fecha.getFullYear();
    dias.push({ dia, mes, anio, iso: aIso(anio, mes, dia) });
  }
  return dias;
};

/**
 * Encabezado de meses por regla, con los mismos anchos y colores que tenía
 * createMont: un bloque si el periodo cabe en un mes, dos si cruza de mes.
 */
export const construirEncabezados = (rules) =>
  (Array.isArray(rules) ? rules : []).map((regla, index) => {
    const dias = construirDias(regla);
    const key = `rules-${regla?._id ?? index}`;
    if (dias.length === 0) return { key, parts: [] };

    const total = dias.length - 1;
    const ancho = total * 29;
    const primerMes = dias[0].mes;
    const ultimoMes = dias[dias.length - 1].mes;
    const variosMeses = dias.some((dia) => dia.mes !== primerMes);

    if (!variosMeses) {
      return {
        key,
        parts: [
          {
            label: validateMonts(ultimoMes),
            width: ancho + 29,
            background: "#EB464B",
          },
        ],
      };
    }

    // Días consecutivos del primer mes: corta en el primer salto de día.
    let ancho1 = 0;
    let ancho2 = 0;
    for (let i = 0; i <= total; i++) {
      if (dias[i + 1]?.dia === dias[i].dia + 1) {
        ancho1++;
      } else {
        ancho2 = total - ancho1;
        break;
      }
    }

    return {
      key,
      parts: [
        {
          label: validateMonts(primerMes),
          width: (ancho1 + 1) * 29,
          background: "#EB464B",
        },
        {
          label: validateMonts(ultimoMes),
          width: ancho2 * 29,
          background: "#701CF5",
        },
      ],
    };
  });

/** Rango in/out de /shifts/day a partir de la última regla, como antes. */
export const calcularRango = (rules) => {
  if (!Array.isArray(rules) || rules.length === 0) return null;

  const regla = rules[rules.length - 1];
  const diaPeriodo = new Date(regla?.DiaPeriod);
  if (Number.isNaN(diaPeriodo.getTime())) return null;

  return {
    in: `${diaPeriodo.getFullYear()}-${formatearNumero2(
      diaPeriodo.getMonth()
    )}-${formatearNumero(diaPeriodo.getDate())}T00:00:00`,
    out: `${sumaAño(regla.DiaPeriod, regla.Dia)}-${formatearNumero(
      sumaMes(regla.DiaPeriod, regla.Dia) + 1
    )}-${formatearNumero(sumaDias(regla.DiaPeriod, regla.Dia))}T00:00:00`,
  };
};

/**
 * Minutos por trabajador y día, indexados una sola vez por carga.
 * Réplica de operarMatrizDias / extraerHorasCustom / extraerHorasProgram:
 * se conserva incluso la aritmética original (NaN de programas inválidos).
 */
export const indexarHorasPorUsuario = (shifts, stacks, programs) => {
  const indice = new Map();

  const stacksCustom = (Array.isArray(stacks) ? stacks : []).filter(
    (stack) => stack?.Type === "Custom"
  );

  const programasPorId = new Map();
  (Array.isArray(programs) ? programs : []).forEach((programa) => {
    if (programa?._id !== undefined) {
      programasPorId.set(String(programa._id), programa);
    }
  });

  const minutosCustom = (idStack) => {
    let respuesta = 0;
    stacksCustom.forEach((stack) => {
      if (stack.ID_esquema == idStack) {
        respuesta = stack.Duration;
      }
    });
    return respuesta;
  };

  const minutosPrograma = (idPrograma) => {
    const programa =
      idPrograma !== undefined
        ? programasPorId.get(String(idPrograma))
        : undefined;
    const timeIn = new Date(programa?.Start);
    const timeOut = new Date(programa?.End);
    return Math.round((timeOut.getTime() - timeIn.getTime()) / (1000 * 60));
  };

  const minutosTurno = (turno) => {
    if (turno.Type === "Null") return 30;
    if (turno.Type === "Custom") return minutosCustom(turno.Id_Schema);
    if (
      turno.Type === "Programa" ||
      turno.Type === "Secondary" ||
      turno.Type === "Requerimiento"
    ) {
      return minutosPrograma(turno.Event_name);
    }
    if (turno.Type === "Programmer") return minutosCustom(undefined);
    return 0;
  };

  (Array.isArray(shifts) ? shifts : []).forEach((turno) => {
    if (!turno) return;

    const usuario = String(turno.ID_user ?? "");
    const fecha = String(turno.Fecha_clave ?? "");
    if (!usuario || !fecha) return;

    const porFecha = indice.get(usuario) ?? new Map();
    porFecha.set(fecha, (porFecha.get(fecha) ?? 0) + minutosTurno(turno));
    indice.set(usuario, porFecha);
  });

  return indice;
};
