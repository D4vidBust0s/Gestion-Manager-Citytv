/**
 * Catálogos y datos de demostración de la pantalla Requirements.
 *
 * Este módulo concentra el contrato de datos que en el futuro alimentará el
 * sistema real de requerimientos. Las solicitudes solo referencian catálogos
 * por ID (departamento, rol y equipo) y conservan un `historial` de actuaciones
 * para que la bitácora se pueda persistir sin rehacer la UI.
 *
 * TODO(requirements-system): reemplazar SOLICITUDES_INICIALES por la respuesta
 * del API de requerimientos y completar los IDs de inventario/planner.
 */

export const DEPARTAMENTOS_INICIALES = [
  { id: "comercial", nombre: "Comercial" },
  { id: "noticias", nombre: "Noticias" },
  { id: "bravissimo", nombre: "Bravissimo" },
  { id: "exteriores", nombre: "Exteriores" },
];

export const ROLES_TECNICOS = [
  { id: "luminotecnicos", nombre: "Luminotécnicos" },
  { id: "camarografos", nombre: "Camarógrafos" },
  { id: "audio", nombre: "Audio" },
  { id: "realizacion", nombre: "Realización" },
  { id: "produccion", nombre: "Producción" },
  { id: "maquillaje", nombre: "Maquillaje" },
  { id: "transporte", nombre: "Transporte" },
  { id: "transmision", nombre: "Transmisión" },
  { id: "utileria", nombre: "Utilería" },
];

/**
 * Catálogo técnico de referencia.
 * `inventarioId` quedará ligado al sistema de inventario de la empresa.
 */
export const CATALOGO_EQUIPOS = [
  { id: "cam-fx9", categoria: "Cámaras", nombre: "Cámara Sony FX9", inventarioId: null },
  { id: "cam-fx6", categoria: "Cámaras", nombre: "Cámara Sony FX6", inventarioId: null },
  { id: "cam-eng", categoria: "Cámaras", nombre: "Cámara ENG HD", inventarioId: null },
  { id: "luz-panel", categoria: "Iluminación", nombre: "Panel LED bicolor", inventarioId: null },
  { id: "luz-fresnel", categoria: "Iluminación", nombre: "Fresnel 300W", inventarioId: null },
  { id: "luz-softbox", categoria: "Iluminación", nombre: "Softbox 120 x 120", inventarioId: null },
  { id: "aud-consola", categoria: "Audio", nombre: "Consola de audio digital", inventarioId: null },
  { id: "aud-mic", categoria: "Audio", nombre: "Micrófono inalámbrico", inventarioId: null },
  { id: "aud-lav", categoria: "Audio", nombre: "Micrófono de solapa", inventarioId: null },
  { id: "tra-switcher", categoria: "Transmisión", nombre: "Switcher de video", inventarioId: null },
  { id: "tra-monitor", categoria: "Transmisión", nombre: "Monitor de referencia", inventarioId: null },
  { id: "tra-enlace", categoria: "Transmisión", nombre: "Enlace satelital", inventarioId: null },
  { id: "grua", categoria: "Grúa y soportes", nombre: "Grúa de 6 m", inventarioId: null },
  { id: "tripode", categoria: "Grúa y soportes", nombre: "Trípode de estudio", inventarioId: null },
];

export const ESTADOS = [
  "Pendiente",
  "En revisión",
  "Aprobada",
  "Agendado",
  "Rechazada",
];

export const PRIORIDADES = ["Alta", "Media", "Baja"];

/** Normaliza texto para búsquedas y validaciones (sin mayúsculas ni tildes). */
export const normalizarTexto = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const fechaLocalISO = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

/** Fecha `YYYY-MM-DD` relativa a hoy; evita que la demostración se vea vencida. */
export const fechaDesdeHoy = (dias) => {
  const fecha = new Date();
  fecha.setHours(12, 0, 0, 0);
  fecha.setDate(fecha.getDate() + dias);
  return fechaLocalISO(fecha);
};

const creadaHace = (dias) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fecha.toISOString();
};

const ANIO = new Date().getFullYear();
const codigo = (secuencia) => `REQ-${ANIO}-${String(secuencia).padStart(3, "0")}`;
const codigoArchivo = (anio, secuencia) =>
  `REQ-${anio}-${String(secuencia).padStart(3, "0")}`;

const fechaEnAnio = (anio, mes, dia) =>
  `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

const creadaEnAnio = (anio, mes, dia, hora = 9) =>
  new Date(anio, mes - 1, dia, hora, 0, 0).toISOString();

const crearSolicitud = (datos) => {
  const historial = [
    {
      id: `${datos.id}-hist-creacion`,
      tipo: "creacion",
      estadoAnterior: null,
      estadoNuevo: "Pendiente",
      por: datos.solicitante?.nombre ?? "Solicitante",
      el: datos.creadaEl,
      nota: "Solicitud creada y enviada al administrador.",
    },
    ...(Array.isArray(datos.historial) ? datos.historial : []),
  ];

  if (datos.decision) {
    const tipoDecision =
      datos.decision.estado === "Agendado"
        ? "agendamiento"
        : datos.decision.estado === "Aprobada"
          ? "aprobacion"
          : datos.decision.estado === "Rechazada"
            ? "rechazo"
            : "revision";

    const yaRegistrada = historial.some(
      (entrada) =>
        entrada.tipo === tipoDecision && entrada.el === datos.decision.el
    );

    if (!yaRegistrada) {
      historial.push({
        id: `${datos.id}-hist-decision`,
        tipo: tipoDecision,
        estadoAnterior: datos.decision.estadoAnterior ?? "Pendiente",
        estadoNuevo: datos.decision.estado,
        por: datos.decision.por ?? "Administrador",
        el: datos.decision.el,
        nota:
          datos.decision.motivo ||
          (tipoDecision === "agendamiento"
            ? "Solicitud aprobada y agendada."
            : tipoDecision === "aprobacion"
              ? "Solicitud aprobada."
              : tipoDecision === "rechazo"
                ? "Solicitud denegada."
                : "Revisión solicitada al solicitante."),
      });
    }
  }

  return {
    ...datos,
    evento: {
      programaId: null,
      idEventoPlanner: null,
      ...datos.evento,
    },
    personal: datos.personal.map((item) => ({
      ...item,
      notas: item.notas ?? "",
      asignados: item.asignados ?? [],
    })),
    equipos: datos.equipos.map((item) => ({
      inventarioId: null,
      estadoInventario: "Por verificar",
      notas: "",
      ...item,
    })),
    historial: historial.sort(
      (entradaA, entradaB) => new Date(entradaA.el) - new Date(entradaB.el)
    ),
    integracion: { origen: "demo", sincronizado: false },
  };
};

export const SOLICITUDES_INICIALES = [
  crearSolicitud({
    id: "sol-001",
    codigo: codigo(1),
    nombre: "Comercial Café Colombia",
    departamentoId: "comercial",
    evento: {
      programa: "Café Colombia",
      tipoEvento: "Comercial",
      fecha: fechaDesdeHoy(4),
      horaInicio: "08:00",
      horaFin: "13:00",
      locacion: "Estudio 3 - Citytv",
    },
    descripcion:
      "Grabación de piezas comerciales para la campaña de Café Colombia. Se requiere set de entrevistas y luces suaves para dos invitados.",
    prioridad: "Alta",
    estado: "Pendiente",
    creadaEl: creadaHace(5),
    solicitante: {
      nombre: "María Fernanda Rojas",
      cargo: "Directora Comercial",
      correo: "mf.rojas@citytv.com.co",
      telefono: "310 555 0142",
    },
    personal: [
      { rolId: "luminotecnicos", cantidad: 2, horas: 8, notas: "Montaje desde las 06:00" },
      { rolId: "camarografos", cantidad: 3, horas: 5 },
      { rolId: "audio", cantidad: 1, horas: 5 },
    ],
    equipos: [
      { equipoId: "cam-fx9", cantidad: 2, notas: "Una en trípode y una en mano" },
      { equipoId: "luz-panel", cantidad: 4 },
      { equipoId: "aud-mic", cantidad: 2 },
    ],
    decision: null,
  }),

  crearSolicitud({
    id: "sol-002",
    codigo: codigo(2),
    nombre: "Noticias Citytv 5AM",
    departamentoId: "noticias",
    evento: {
      programa: "Citytv 5AM",
      tipoEvento: "Emisión en vivo",
      fecha: fechaDesdeHoy(1),
      horaInicio: "04:30",
      horaFin: "08:00",
      locacion: "Estudio 1 - Citytv",
    },
    descripcion:
      "Emisión matutina con dos invitados en set y enlace con móvil de exteriores. Se requiere personal desde el montaje previo.",
    prioridad: "Alta",
    estado: "Aprobada",
    creadaEl: creadaHace(7),
    solicitante: {
      nombre: "Carlos Andrés Mejía",
      cargo: "Productor de Noticias",
      correo: "ca.mejia@citytv.com.co",
      telefono: "315 555 0198",
    },
    personal: [
      { rolId: "camarografos", cantidad: 2, horas: 4, notas: "Una cámara fija y una móvil" },
      { rolId: "audio", cantidad: 1, horas: 4 },
      { rolId: "realizacion", cantidad: 1, horas: 4 },
      { rolId: "luminotecnicos", cantidad: 1, horas: 6 },
    ],
    equipos: [
      { equipoId: "cam-fx6", cantidad: 2 },
      { equipoId: "aud-consola", cantidad: 1 },
      { equipoId: "tra-monitor", cantidad: 2 },
    ],
    decision: {
      estado: "Aprobada",
      por: "Administrador",
      el: creadaHace(1),
      motivo: "",
    },
  }),

  crearSolicitud({
    id: "sol-003",
    codigo: codigo(3),
    nombre: "Bravissimo Gala de Navidad",
    departamentoId: "bravissimo",
    evento: {
      programa: "Bravissimo",
      tipoEvento: "Especial",
      fecha: fechaDesdeHoy(21),
      horaInicio: "18:00",
      horaFin: "23:00",
      locacion: "Estudio 2 - Citytv",
    },
    descripcion:
      "Especial de Navidad con público en estudio, tres segmentos musicales y transmisión simultánea por redes.",
    prioridad: "Alta",
    estado: "Pendiente",
    creadaEl: creadaHace(3),
    solicitante: {
      nombre: "Laura Camila Pardo",
      cargo: "Productora de Entretenimiento",
      correo: "lc.pardo@citytv.com.co",
      telefono: "320 555 0137",
    },
    personal: [
      { rolId: "luminotecnicos", cantidad: 4, horas: 10, notas: "Montaje desde el día anterior" },
      { rolId: "camarografos", cantidad: 4, horas: 6 },
      { rolId: "audio", cantidad: 2, horas: 6 },
      { rolId: "maquillaje", cantidad: 2, horas: 5 },
      { rolId: "produccion", cantidad: 2, horas: 8 },
    ],
    equipos: [
      { equipoId: "luz-panel", cantidad: 6 },
      { equipoId: "luz-fresnel", cantidad: 4 },
      { equipoId: "grua", cantidad: 1 },
      { equipoId: "tra-switcher", cantidad: 1 },
      { equipoId: "aud-lav", cantidad: 4 },
    ],
    decision: null,
  }),

  crearSolicitud({
    id: "sol-004",
    codigo: codigo(4),
    nombre: "Exteriores Río Bogotá",
    departamentoId: "exteriores",
    evento: {
      programa: "Citytv Noticias - Exteriores",
      tipoEvento: "Grabación",
      fecha: fechaDesdeHoy(6),
      horaInicio: "06:00",
      horaFin: "12:00",
      locacion: "Puente de la Virgen - Bogotá",
    },
    descripcion:
      "Grabación de notas ambientales sobre la recuperación del río Bogotá. Se requiere equipo liviano y transporte para el desplazamiento.",
    prioridad: "Media",
    estado: "Pendiente",
    creadaEl: creadaHace(4),
    solicitante: {
      nombre: "Andrés Felipe Gómez",
      cargo: "Jefe de Exteriores",
      correo: "af.gomez@citytv.com.co",
      telefono: "312 555 0166",
    },
    personal: [
      { rolId: "camarografos", cantidad: 2, horas: 6 },
      { rolId: "audio", cantidad: 1, horas: 6 },
      { rolId: "produccion", cantidad: 1, horas: 6 },
      { rolId: "transporte", cantidad: 1, horas: 7, notas: "Van de equipo" },
    ],
    equipos: [
      { equipoId: "cam-fx6", cantidad: 1 },
      { equipoId: "aud-mic", cantidad: 1 },
      { equipoId: "tra-monitor", cantidad: 1 },
      { equipoId: "tripode", cantidad: 1 },
    ],
    historial: [
      {
        id: "sol-004-hist-revision",
        tipo: "revision",
        estadoAnterior: "Pendiente",
        estadoNuevo: "En revisión",
        por: "Administrador",
        el: creadaHace(2),
        nota:
          "Revisar la fecha de grabación: coincide con el especial de Bravissimo. Confirmar también la disponibilidad de la van de equipo.",
      },
      {
        id: "sol-004-hist-actualizacion",
        tipo: "actualizacion",
        estadoAnterior: "En revisión",
        estadoNuevo: "Pendiente",
        por: "Andrés Felipe Gómez",
        el: creadaHace(1),
        nota:
          "Se ajustó la fecha de grabación y se confirmó la van de equipo. Solicitud actualizada para una nueva revisión.",
      },
    ],
    decision: null,
  }),

  crearSolicitud({
    id: "sol-005",
    codigo: codigo(5),
    nombre: "Comercial Bancolombia",
    departamentoId: "comercial",
    evento: {
      programa: "Franja Comercial",
      tipoEvento: "Comercial",
      fecha: fechaDesdeHoy(9),
      horaInicio: "10:00",
      horaFin: "15:00",
      locacion: "Estudio 2 - Citytv",
    },
    descripcion:
      "Grabación de testimoniales para la campaña de Bancolombia. Set con fondo neutro y tres cambios de vestuario.",
    prioridad: "Media",
    estado: "Aprobada",
    creadaEl: creadaHace(6),
    solicitante: {
      nombre: "María Fernanda Rojas",
      cargo: "Directora Comercial",
      correo: "mf.rojas@citytv.com.co",
      telefono: "310 555 0142",
    },
    personal: [
      { rolId: "luminotecnicos", cantidad: 2, horas: 7 },
      { rolId: "camarografos", cantidad: 2, horas: 5 },
      { rolId: "audio", cantidad: 1, horas: 5 },
      { rolId: "maquillaje", cantidad: 1, horas: 4 },
    ],
    equipos: [
      { equipoId: "cam-fx9", cantidad: 1 },
      { equipoId: "luz-softbox", cantidad: 2 },
      { equipoId: "aud-lav", cantidad: 2 },
    ],
    decision: {
      estado: "Aprobada",
      por: "Administrador",
      el: creadaHace(2),
      motivo: "",
    },
  }),

  crearSolicitud({
    id: "sol-006",
    codigo: codigo(6),
    nombre: "Noticias Especial Elecciones",
    departamentoId: "noticias",
    evento: {
      programa: "Noticiero Central",
      tipoEvento: "Especial",
      fecha: fechaDesdeHoy(14),
      horaInicio: "17:00",
      horaFin: "23:30",
      locacion: "Estudio 1 - Citytv",
    },
    descripcion:
      "Cubrimiento especial de la jornada electoral con mesa de análisis, pantallas y enlaces en vivo desde tres ciudades.",
    prioridad: "Alta",
    estado: "Rechazada",
    creadaEl: creadaHace(8),
    solicitante: {
      nombre: "Carlos Andrés Mejía",
      cargo: "Productor de Noticias",
      correo: "ca.mejia@citytv.com.co",
      telefono: "315 555 0198",
    },
    personal: [
      { rolId: "camarografos", cantidad: 4, horas: 7 },
      { rolId: "luminotecnicos", cantidad: 3, horas: 9 },
      { rolId: "audio", cantidad: 2, horas: 7 },
      { rolId: "realizacion", cantidad: 2, horas: 7 },
      { rolId: "transmision", cantidad: 2, horas: 7 },
    ],
    equipos: [
      { equipoId: "cam-fx9", cantidad: 2 },
      { equipoId: "tra-enlace", cantidad: 3 },
      { equipoId: "tra-switcher", cantidad: 1 },
      { equipoId: "grua", cantidad: 1 },
    ],
    decision: {
      estado: "Rechazada",
      por: "Administrador",
      el: creadaHace(2),
      motivo:
        "Cruce de horario con el especial de Bravissimo y disponibilidad insuficiente de grúa. Replantear fecha o reducir equipos.",
    },
  }),

  crearSolicitud({
    id: "sol-007",
    codigo: codigo(7),
    nombre: "Bravissimo Backstage",
    departamentoId: "bravissimo",
    evento: {
      programa: "Bravissimo Digital",
      tipoEvento: "Grabación",
      fecha: fechaDesdeHoy(11),
      horaInicio: "14:00",
      horaFin: "18:00",
      locacion: "Estudio 4 - Citytv",
    },
    descripcion:
      "Contenido detrás de cámaras para redes sociales: recorrido por camerinos, entrevistas cortas y tomas de detalle.",
    prioridad: "Baja",
    estado: "En revisión",
    creadaEl: creadaHace(3),
    solicitante: {
      nombre: "Laura Camila Pardo",
      cargo: "Productora de Entretenimiento",
      correo: "lc.pardo@citytv.com.co",
      telefono: "320 555 0137",
    },
    personal: [
      { rolId: "camarografos", cantidad: 1, horas: 4 },
      { rolId: "audio", cantidad: 1, horas: 4 },
      { rolId: "produccion", cantidad: 1, horas: 4 },
    ],
    equipos: [
      { equipoId: "cam-fx6", cantidad: 1 },
      { equipoId: "aud-lav", cantidad: 1 },
      { equipoId: "luz-panel", cantidad: 2 },
    ],
    decision: {
      estado: "En revisión",
      por: "Administrador",
      el: creadaHace(1),
      motivo:
        "Revisar la disponibilidad de luces y confirmar la fecha propuesta por Bravissimo antes de aprobar.",
    },
  }),

  crearSolicitud({
    id: "sol-008",
    codigo: codigo(8),
    nombre: "Exteriores Feria de Cali",
    departamentoId: "exteriores",
    evento: {
      programa: "Citytv Noticias",
      tipoEvento: "Especial",
      fecha: fechaDesdeHoy(33),
      horaInicio: "15:00",
      horaFin: "22:00",
      locacion: "Feria de Cali - Valle del Cauca",
    },
    descripcion:
      "Cubrimiento de la apertura de la Feria de Cali con móvil, entrevistas y despachos para las emisiones del fin de semana.",
    prioridad: "Media",
    estado: "Aprobada",
    creadaEl: creadaHace(10),
    solicitante: {
      nombre: "Andrés Felipe Gómez",
      cargo: "Jefe de Exteriores",
      correo: "af.gomez@citytv.com.co",
      telefono: "312 555 0166",
    },
    personal: [
      { rolId: "camarografos", cantidad: 2, horas: 8 },
      { rolId: "audio", cantidad: 1, horas: 8 },
      { rolId: "produccion", cantidad: 1, horas: 8 },
      { rolId: "transmision", cantidad: 1, horas: 6 },
      { rolId: "transporte", cantidad: 1, horas: 10 },
    ],
    equipos: [
      { equipoId: "cam-fx9", cantidad: 1 },
      { equipoId: "tra-enlace", cantidad: 1 },
      { equipoId: "tra-monitor", cantidad: 1 },
      { equipoId: "aud-mic", cantidad: 2 },
    ],
    decision: {
      estado: "Aprobada",
      por: "Administrador",
      el: creadaHace(4),
      motivo: "",
    },
  }),

  crearSolicitud({
    id: "sol-arch-001",
    codigo: codigoArchivo(ANIO - 1, 901),
    nombre: "Especial Fin de Año",
    departamentoId: "bravissimo",
    evento: {
      programa: "Bravissimo",
      tipoEvento: "Especial",
      fecha: fechaEnAnio(ANIO - 1, 12, 18),
      horaInicio: "19:00",
      horaFin: "23:30",
      locacion: "Estudio 2 - Citytv",
    },
    descripcion:
      "Especial de fin de año con música en vivo, público en estudio y cierre de emisión. Solicitud conservada como referencia del archivo.",
    prioridad: "Alta",
    estado: "Aprobada",
    creadaEl: creadaEnAnio(ANIO - 1, 12, 1, 10),
    solicitante: {
      nombre: "Laura Sofía Cárdenas",
      cargo: "Productora de Entretenimiento",
      correo: "ls.cardenas@citytv.com.co",
      telefono: "311 555 0177",
    },
    personal: [
      { rolId: "camarografos", cantidad: 2, horas: 6 },
      { rolId: "audio", cantidad: 1, horas: 6 },
      { rolId: "luminotecnicos", cantidad: 2, horas: 8 },
      { rolId: "realizacion", cantidad: 1, horas: 6 },
    ],
    equipos: [
      { equipoId: "cam-fx9", cantidad: 2 },
      { equipoId: "luz-panel", cantidad: 6 },
      { equipoId: "aud-consola", cantidad: 1 },
    ],
    decision: {
      estado: "Aprobada",
      por: "Administrador",
      el: creadaEnAnio(ANIO - 1, 12, 3, 15),
      motivo: "",
    },
  }),

  crearSolicitud({
    id: "sol-arch-002",
    codigo: codigoArchivo(ANIO - 2, 902),
    nombre: "Aniversario Citytv",
    departamentoId: "noticias",
    evento: {
      programa: "Citytv Noticias",
      tipoEvento: "Especial",
      fecha: fechaEnAnio(ANIO - 2, 6, 12),
      horaInicio: "17:00",
      horaFin: "21:00",
      locacion: "Plaza Central - Citytv",
    },
    descripcion:
      "Cubrimiento del aniversario del canal con móvil, invitados y transmisión especial. Solicitud conservada como referencia del archivo.",
    prioridad: "Media",
    estado: "Rechazada",
    creadaEl: creadaEnAnio(ANIO - 2, 5, 20, 11),
    solicitante: {
      nombre: "Julián Esteban Ríos",
      cargo: "Coordinador de Noticias",
      correo: "je.rios@citytv.com.co",
      telefono: "316 555 0134",
    },
    personal: [
      { rolId: "camarografos", cantidad: 2, horas: 4 },
      { rolId: "audio", cantidad: 1, horas: 4 },
      { rolId: "produccion", cantidad: 1, horas: 4 },
    ],
    equipos: [
      { equipoId: "cam-fx6", cantidad: 2 },
      { equipoId: "aud-mic", cantidad: 2 },
    ],
    decision: {
      estado: "Rechazada",
      por: "Administrador",
      el: creadaEnAnio(ANIO - 2, 5, 25, 9),
      motivo:
        "La fecha se cruzaba con la emisión especial de noticias y no había disponibilidad del equipo técnico.",
    },
  }),
];
