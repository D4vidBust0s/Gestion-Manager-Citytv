/* ESTILOS */
import "./RotationsContent.css"

/* IMAGENES */
import dia from '../../assets/daily.png';
import Sunday from '../../assets/Sunday.png';
import Plus from '../../assets/Plus.svg';
import Edit from '../../assets/pencil.svg';
import Delete from '../../assets/trash.svg';
import Brush from '../../assets/brush.svg';
import Coffee from '../../assets/coffee.svg';
import Up from '../../assets/up.svg';
import Down from '../../assets/down.svg';

/* DEPENDENCIAS */
import DatePicker from 'react-datepicker';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import Swal from "sweetalert2";

/* SERVICIOS */
import { groupsApi } from '../../api/groups';
import { payrollApi } from '../../api/payroll';
import { rotationsApi } from '../../api/rotations';
import { rotationsManagerApi, rotationsManagerFsApi } from '../../api/rotationsManager';
import {
  stacksApi,
  duracionItemStack,
  minutosEntreFechas,
  resumirStackDuracion,
} from '../../api/stacks';
import { stacksSavedApi } from '../../api/stacksSaved';
import { programsApi } from '../../api/programs';

/* CONSTANTES */
const SIN_ESQUEMA = "------------------";
const SIN_ESQUEMA_UNIVERSAL = "------------";
const SIN_GRUPO = "none";
const TIPO_ES = "ES";
const TIPO_FS = "FS";

/* FUNCIONES AUXILIARES */

// Normaliza una fecha al lunes de su semana
const obtenerLunesSemana = (fechaRef = new Date()) => {
  let d = new Date(fechaRef);
  let day = d.getDay();
  let diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).setHours(0, 0, 0, 0);
};

// Convierte lo que devuelve la API en Date, sin romper si viene vacío o inválido
const aFecha = (valor) => {
  if (!valor) return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

// Hora corta para el listado del stack: "9:00 AM" / "--:--" si no hay fecha
const formatearHora = (fecha) => {
  if (!fecha) return "--:--";

  const horas24 = fecha.getHours();
  const horas = horas24 % 12 === 0 ? 12 : horas24 % 12;
  const minutos = String(fecha.getMinutes()).padStart(2, "0");
  return `${horas}:${minutos} ${horas24 < 12 ? "AM" : "PM"}`;
};

// api/client.js ya normaliza el error de axios; aquí solo se elige el texto
const mensajeError = (error, porDefecto) => error?.message || porDefecto;

const RotationsContent = () => {

  /* Estados para los datepicker */
  const [startDate1, setStartDate1] = useState(new Date());
  const [endDate1, setEndDate1] = useState(new Date());
  const [startDate2, setStartDate2] = useState(new Date());
  const [endDate2, setEndDate2] = useState(new Date());

  /* Catálogos y Datos principales de la API */
  const [data, setData] = useState([]);         // Grupos
  const [data4, setData4] = useState([]);       // Esquemas Entre Semana
  const [data5, setData5] = useState([]);       // Esquemas Fin de Semana
  const [data6, setData6] = useState([]);       // Personal del grupo seleccionado
  const [data8, setData8] = useState([]);       // Rotations Manager ES
  const [data10, setData10] = useState([]);     // Programs
  const [data11, setData11] = useState([]);     // Secondary Programs
  const [data12, setData12] = useState([]);     // Primary Programs
  const [data13, setData13] = useState([]);     // Stacks por esquema
  const [stacksPorEsquema, setStacksPorEsquema] = useState({}); // Stacks cacheados por id de esquema
  const [data15, setData15] = useState([]);     // Stacks Guardados (Saved)
  const [data16, setData16] = useState([]);     // Rotations Manager FS

  /* Estados de controles UI */
  const [coffeeES, setCoffeeES] = useState(false);
  const [coffeeFS, setCoffeeFS] = useState(false);

  const [titleDaily, setTitleDaily] = useState(SIN_ESQUEMA);
  const [titleFs, setTitleFs] = useState(SIN_ESQUEMA);

  const [newValueOne, setNweValueOne] = useState("");
  const [idRegES, setIdRegES] = useState("");

  const [newValueTwo, setNweValueTwo] = useState("");
  const [idRegFS, setIdRegFS] = useState("");

  const [order, setOrder] = useState("");
  const [orderFS, setOrderFS] = useState("");

  const [excluirES, setexcluirES] = useState(false);
  const [excluirFS, setexcluirFS] = useState(false);

  /* Elemento seleccionado del Stack para mover/borrar */
  const [idItem, setIdItem] = useState(null);

  /* Identificadores visuales activos para esquemas */
  const [activeSchemaESId, setActiveSchemaESId] = useState(null);
  const [activeSchemaFSId, setActiveSchemaFSId] = useState(null);

  const [titleDailyUniversal, setTitleDailyUniversal] = useState(SIN_ESQUEMA_UNIVERSAL);
  const [idRegUniversal, setIdRegUniversal] = useState("");

  /* Stack guardado seleccionado */
  const [savedStackId, setSavedStackId] = useState("");

  /* Referencias DOM */
  const groupsRef = useRef();
  const newEntresemana = useRef();
  const newFinsemana = useRef();
  const newOrder = useRef();
  const newOrderFS = useRef();

  const progRef = useRef();
  const secondaryRef = useRef();
  const customRef = useRef();
  const nameStackRef = useRef();
  const timeOutRef = useRef();
  const durationRef = useRef();

  /* Referencias de control */
  const savingRef = useRef(false);
  // Identifican la última petición de cada recurso para descartar respuestas tardías
  const schemasEsRequestRef = useRef(0);
  const schemasFsRequestRef = useRef(0);
  const peopleRequestRef = useRef(0);
  const stacksRequestRef = useRef(0);

  /* ==========================================
     DATOS DERIVADOS
     ========================================== */
  // Solo las personas activas cuentan para el balance esquemas / personas
  const personasActivas = useMemo(
    () => data6.filter((persona) => persona?.activo === true),
    [data6]
  );

  const getGroupId = () => groupsRef.current?.value ?? SIN_GRUPO;

  const buscarEsquema = (tipo, schemaId) =>
    (tipo === TIPO_FS ? data5 : data4).find((esquema) => esquema._id === schemaId);

  const corroborarNombre = (schemaId, tipo) => buscarEsquema(tipo, schemaId)?.Nombre;
  const corroborarActual = (schemaId, tipo) => buscarEsquema(tipo, schemaId)?.Order;

  const managerEsDe = (userId) => data8.find((rm) => rm?.userId === userId);
  const managerFsDe = (userId) => data16.find((rm) => rm?.userId === userId);

  // Esquema que el planificador tiene asignado a un trabajador (valores controlados de los selects)
  const esquemaAsignado = (userId, tipo) => {
    const manager = tipo === TIPO_FS ? managerFsDe(userId) : managerEsDe(userId);
    return manager?.schemaId ?? "";
  };

  const nombreSchemaAsignado = (userId, tipo) => {
    const manager = tipo === TIPO_FS ? managerFsDe(userId) : managerEsDe(userId);
    return manager?.SchemaName ?? "";
  };

  // Esquema seleccionado de cada día: cada acumulado usa el suyo
  const esquemaEs = useMemo(
    () => data4.find((esquema) => esquema._id === idRegES) ?? null,
    [data4, idRegES]
  );

  const esquemaFs = useMemo(
    () => data5.find((esquema) => esquema._id === idRegFS) ?? null,
    [data5, idRegFS]
  );

  // Acumulado independiente por día, a partir del stack cacheado de su esquema
  const resumenEs = useMemo(
    () => resumirStackDuracion(stacksPorEsquema[idRegES] ?? [], esquemaEs, data10),
    [stacksPorEsquema, idRegES, esquemaEs, data10]
  );

  const resumenFs = useMemo(
    () => resumirStackDuracion(stacksPorEsquema[idRegFS] ?? [], esquemaFs, data10),
    [stacksPorEsquema, idRegFS, esquemaFs, data10]
  );

  const textoTotalAcumulado = (resumen) =>
    `Acumulado: ${resumen.total} min (${(resumen.total / 60).toFixed(1)} h)`;

  const esEsquemaDescanso = (esquema) =>
    Boolean(esquema?.Descanso || esquema?.descanso);

  const textoEstadoAcumulado = (resumen) => {
    if (resumen.ventana === null) return "Turno: --";
    if (resumen.estado === "ok") return `Turno ${resumen.ventana} min · Coincide`;
    if (resumen.estado === "faltante") {
      return `Turno ${resumen.ventana} min · Faltan ${resumen.diferencia} min`;
    }
    return `Turno ${resumen.ventana} min · Excede ${Math.abs(resumen.diferencia)} min`;
  };

  /* Horas del stack que se está editando en el panel */
  const esquemaDelPanel = useMemo(() => {
    if (!idRegUniversal) return null;
    return (
      data4.find((esquema) => esquema._id === idRegUniversal) ??
      data5.find((esquema) => esquema._id === idRegUniversal) ??
      null
    );
  }, [data4, data5, idRegUniversal]);

  const stackEnOrden = useMemo(
    () => [...data13].sort((a, b) => (Number(a.Order) || 0) - (Number(b.Order) || 0)),
    [data13]
  );

  // Hora de inicio y fin de cada elemento, encadenadas desde la hora del esquema
  const tiemposStack = useMemo(() => {
    const inicio = aFecha(esquemaDelPanel?.HoraInicio ?? esquemaDelPanel?.horaInicio);
    const mapa = new Map();
    let cursor = inicio ? new Date(inicio.getTime()) : null;

    stackEnOrden.forEach((item) => {
      const duracion = duracionItemStack(item, data10);
      const desde = cursor ? new Date(cursor.getTime()) : null;
      let hasta = null;

      if (cursor) {
        hasta = new Date(cursor.getTime() + duracion * 60000);
        cursor = hasta;
      }

      mapa.set(item._id, { inicio: desde, fin: hasta, duracion });
    });

    return { mapa, inicio, fin: cursor };
  }, [stackEnOrden, data10, esquemaDelPanel]);

  /**
   * Un Program o Secondary solo se puede agregar si la hora acumulada del stack
   * coincide con su hora de inicio. Null, Custom y Time Out no se validan.
   */
  const validarHoraPrograma = async (tipo, idProg) => {
    const etiqueta = tipo === "Secondary" ? "Secondary Event" : "Programa";
    const inicioEsquema = aFecha(esquemaDelPanel?.HoraInicio ?? esquemaDelPanel?.horaInicio);

    if (!inicioEsquema) {
      await Swal.fire({
        title: "El esquema no tiene hora de inicio",
        html: `<p>No se puede validar el ${etiqueta} porque el esquema seleccionado no tiene una hora de inicio válida.</p>`,
        icon: "warning",
        confirmButtonText: "Entendido",
        footer: "<h6>Gestión Manager Citytv</h6>",
      });
      return false;
    }

    const programa = data10.find((p) => p._id === idProg);
    const horaEvento = aFecha(programa?.Start ?? programa?.start);

    if (!horaEvento) {
      await Swal.fire({
        title: "El evento no tiene hora de inicio",
        html: `<p>No se puede validar el ${etiqueta} <b>${programa?.nombre ?? ""}</b> porque no tiene una hora de inicio válida.</p>`,
        icon: "warning",
        confirmButtonText: "Entendido",
        footer: "<h6>Gestión Manager Citytv</h6>",
      });
      return false;
    }

    const acumulada = tiemposStack.fin ?? inicioEsquema;
    const minutosAcumulados = acumulada.getHours() * 60 + acumulada.getMinutes();
    const minutosEvento = horaEvento.getHours() * 60 + horaEvento.getMinutes();

    if (minutosAcumulados === minutosEvento) return true;

    await Swal.fire({
      title: "La hora acumulada no corresponde",
      html: `
        <p>Hora acumulada del stack: <b>${formatearHora(acumulada)}</b></p>
        <p>Hora de inicio del ${etiqueta} <b>${programa?.nombre ?? ""}</b>: <b>${formatearHora(horaEvento)}</b></p>
        <p>El stack debe llegar a esa hora antes de agregar el evento.</p>
      `,
      icon: "warning",
      confirmButtonText: "Entendido",
      footer: "<h6>Gestión Manager Citytv</h6>",
    });
    return false;
  };

  /* Texto y color del evento en la tabla del stack */
  const claseEventoStack = (item) => {
    if (item.Type === "Programa" || item.Type === "Secondary" || item.Type === "Label") {
      return "stack-evento--programa";
    }
    if (item.Type === "Custom") return "stack-evento--custom";
    return "stack-evento--operativo"; // Null y Time Out
  };

  const textoEventoStack = (item, duracion) => {
    if (item.Type === "Programa" || item.Type === "Secondary" || item.Type === "Label") {
      const programa = data10.find((p) => p._id === item.ID_programa);
      return programa
        ? `${programa.nombre} (${duracion} Minutos)`
        : item.ID_programa ?? item.Type;
    }
    if (item.Type === "Custom") {
      return `${item.ID_programa ?? "Custom"} (${item.Duration} Minutos)`;
    }
    if (item.Type === "Null" || item.ID_programa === "Null-30") {
      return `${item.ID_programa ?? "Null"} (${duracion} Minutos)`;
    }
    return `${item.ID_programa ?? item.Type}${
      item.Value !== undefined ? " " + item.Value + " Minutos" : ""
    }`;
  };

  /* ==========================================
     PETICIONES A LA API (GETTERS)
     ========================================== */
  const cargarGrupos = useCallback(async () => {
    try {
      const listado = await groupsApi.getAll();
      setData(Array.isArray(listado) ? listado : []);
    } catch (error) {
      console.error("Error al cargar los grupos:", error);
      toast.error(mensajeError(error, "Error al cargar los grupos"), { id: "rotations-groups" });
    }
  }, []);

  const cargarProgramas = useCallback(async (tipo) => {
    try {
      let listado;
      if (tipo === "primary") listado = await programsApi.getPrimary();
      else if (tipo === "secondary") listado = await programsApi.getSecondary();
      else listado = await programsApi.getAll();

      const programas = Array.isArray(listado) ? listado : [];
      if (tipo === "primary") setData12(programas);
      else if (tipo === "secondary") setData11(programas);
      else setData10(programas);
    } catch (error) {
      console.error("Error al cargar los programas:", error);
      toast.error(mensajeError(error, "Error al cargar los programas"), { id: "rotations-programs" });
    }
  }, []);

  const cargarStacksGuardados = useCallback(async () => {
    try {
      const listado = await stacksSavedApi.getAll();
      setData15(Array.isArray(listado) ? listado : []);
    } catch (error) {
      console.error("Error al cargar los stacks guardados:", error);
      toast.error(mensajeError(error, "Error al cargar los stacks guardados"), { id: "rotations-saved-stacks" });
    }
  }, []);

  const cargarManager = useCallback(async (tipo) => {
    try {
      const listado =
        tipo === TIPO_FS
          ? await rotationsManagerFsApi.getAll()
          : await rotationsManagerApi.getAll();

      const registros = Array.isArray(listado) ? listado : [];
      if (tipo === TIPO_FS) setData16(registros);
      else setData8(registros);
    } catch (error) {
      console.error("Error al cargar el planificador:", error);
      toast.error(mensajeError(error, "Error al cargar el planificador"), { id: "rotations-manager" });
    }
  }, []);

  const cargarPersonal = useCallback(async (groupId) => {
    if (!groupId || groupId === SIN_GRUPO) {
      // Invalida la petición en curso para que no repinte datos del grupo anterior
      peopleRequestRef.current += 1;
      setData6([]);
      return;
    }

    const requestId = ++peopleRequestRef.current;
    try {
      const listado = await payrollApi.getPeopleByGroup(groupId);
      if (requestId !== peopleRequestRef.current) return;
      setData6(Array.isArray(listado) ? listado : []);
    } catch (error) {
      if (requestId !== peopleRequestRef.current) return;
      console.error("Error al cargar el personal:", error);
      toast.error(mensajeError(error, "Error al cargar el personal"), { id: "rotations-people" });
    }
  }, []);

  const cargarEsquemas = useCallback(async (groupId, tipo) => {
    const esFinDeSemana = tipo === TIPO_FS;
    const requestRef = esFinDeSemana ? schemasFsRequestRef : schemasEsRequestRef;

    if (!groupId || groupId === SIN_GRUPO) {
      // Invalida la petición en curso para que no repinte esquemas del grupo anterior
      requestRef.current += 1;
      if (esFinDeSemana) setData5([]);
      else setData4([]);
      return [];
    }

    const requestId = ++requestRef.current;

    try {
      const listado = esFinDeSemana
        ? await rotationsApi.getByGroupFs(groupId)
        : await rotationsApi.getByGroup(groupId);

      if (requestId !== requestRef.current) return [];

      const esquemas = Array.isArray(listado) ? listado : [];
      if (esFinDeSemana) setData5(esquemas);
      else setData4(esquemas);
      return esquemas;
    } catch (error) {
      if (requestId !== requestRef.current) return [];
      console.error("Error al cargar los esquemas:", error);
      toast.error(mensajeError(error, "Error al cargar los esquemas"), { id: "rotations-schemas" });
      return [];
    }
  }, []);

  const cargarStacksDelEsquema = useCallback(async (schemaId) => {
    if (!schemaId) {
      // Invalida la petición en curso de un esquema anterior
      stacksRequestRef.current += 1;
      setData13([]);
      return [];
    }

    const requestId = ++stacksRequestRef.current;
    try {
      const listado = await stacksApi.getBySchema(schemaId);
      const stacks = Array.isArray(listado) ? listado : [];

      // Se cachea siempre para que el acumulado de cada día tenga su propio stack,
      // aunque la respuesta ya no sea la que debe mostrar el panel
      setStacksPorEsquema((prev) => ({ ...prev, [schemaId]: stacks }));

      if (requestId !== stacksRequestRef.current) return stacks;

      setData13(stacks);
      return stacks;
    } catch (error) {
      if (requestId !== stacksRequestRef.current) return [];
      console.error("Error al cargar el stack:", error);
      toast.error(mensajeError(error, "Error al cargar el stack"), { id: "rotations-stacks" });
      return [];
    }
  }, []);

  /* ==========================================
     ESCRITURAS COMPARTIDAS ES / FS
     ========================================== */
  const actualizarDiaClave = async (groupId, tipo) => {
    const payload = {
      newDayKey: new Date(obtenerLunesSemana()),
      totalschema: (tipo === TIPO_FS ? data5 : data4).length,
      totalgrupo: personasActivas.length,
    };

    if (tipo === TIPO_FS) return rotationsManagerFsApi.updateGroup(groupId, payload);
    return rotationsManagerApi.updateGroup(groupId, payload);
  };

  const actualizarTotalSchema = async (groupId, tipo) => {
    // Se invoca justo después de borrar y antes de recargar: la lista aún tiene el esquema borrado
    const total = Math.max(0, (tipo === TIPO_FS ? data5 : data4).length - 1);
    const payload = { total };

    if (tipo === TIPO_FS) return rotationsManagerFsApi.updateTotalSchema(groupId, payload);
    return rotationsManagerApi.updateTotalSchema(groupId, payload);
  };

  //Actualiza los totales del grupo sin tocar el dayKey (ancla de rotación).
  const actualizarTotalesGrupo = async (groupId, tipo) => {
    const payload = {
      totalschema: (tipo === TIPO_FS ? data5 : data4).length,
      totalgrupo: personasActivas.length,
    };

    if (tipo === TIPO_FS) {
      return rotationsManagerFsApi.updateGroupTotals(groupId, payload);
    }

    return rotationsManagerApi.updateGroupTotals(groupId, payload);
  };

  //Única acción que mueve el ancla de rotación. Debe ser explícita.
  const reiniciarRotacion = async (tipo) => {
    const managers = tipo === TIPO_FS ? data16 : data8;
    const grupoSeleccionado = getGroupId();
    const manager = managers.find(
      (item) => String(item.groupName) === String(grupoSeleccionado)
    );

    if (!manager) {
      toast.error("Seleccione el grupo cuya rotación desea reiniciar");
      return;
    }

    const grupoId = manager.groupName;
    if (!grupoId) {
      toast.error("No se pudo identificar el grupo de la rotación");
      return;
    }

    const lunes = new Date(obtenerLunesSemana());
    const dos = (numero) => String(numero).padStart(2, "0");
    const fechaInicial = `${lunes.getFullYear()}-${dos(lunes.getMonth() + 1)}-${dos(lunes.getDate())}`;

    const resultado = await Swal.fire({
      title: "Reiniciar rotación",
      text: "Esta acción cambia la fecha base de toda la rotación del grupo. Úsela solo si va a iniciar un ciclo nuevo.",
      input: "date",
      inputValue: fechaInicial,
      showCancelButton: true,
      confirmButtonText: "Sí, reiniciar",
      cancelButtonText: "Cancelar",
      footer: '<h6>Gestión Manager Citytv</h6>',
    });

    if (!resultado.isConfirmed || !resultado.value) return;

    const nuevaFecha = new Date(`${resultado.value}T00:00:00`);
    if (Number.isNaN(nuevaFecha.getTime())) {
      toast.error("La fecha seleccionada no es válida");
      return;
    }

    try {
      const payload = {
        newDayKey: nuevaFecha,
        totalschema: tipo === TIPO_FS ? data5.length : data4.length,
        totalgrupo: personasActivas.length,
      };

      if (tipo === TIPO_FS) {
        await rotationsManagerFsApi.updateGroup(grupoId, payload);
      } else {
        await rotationsManagerApi.updateGroup(grupoId, payload);
      }

      await cargarManager(tipo);
      toast.success("Rotación reiniciada correctamente");
    } catch (error) {
      console.error("Error al reiniciar la rotación:", error);
      toast.error(mensajeError(error, "No se pudo reiniciar la rotación"));
    }
  };

  const limpiarSeleccionDeEsquema = (tipo, limpiarStacks) => {
    if (tipo === TIPO_FS) {
      setTitleFs(SIN_ESQUEMA);
      setActiveSchemaFSId(null);
      setIdRegFS("");
      setNweValueTwo("");
      setOrderFS("");
      setexcluirFS(false);
    } else {
      setTitleDaily(SIN_ESQUEMA);
      setActiveSchemaESId(null);
      setIdRegES("");
      setNweValueOne("");
      setOrder("");
      setexcluirES(false);
    }

    if (limpiarStacks) {
      setIdItem(null);
      setData13([]);
      setIdRegUniversal("");
      setTitleDailyUniversal(SIN_ESQUEMA_UNIVERSAL);
    }
  };

  const borrarEsquema = async (schemaId, tipo) => {
    const groupId = getGroupId();
    const eraUniversal = idRegUniversal === schemaId;
    let rotacionEliminada = false;

    const olvidarStacks = () => {
      setStacksPorEsquema((prev) => {
        if (!(schemaId in prev)) return prev;
        const siguiente = { ...prev };
        delete siguiente[schemaId];
        return siguiente;
      });
    };

    try {
      await rotationsApi.removeByBody({ idreg: schemaId });
      rotacionEliminada = true;
      await stacksApi.removeAllBySchema(schemaId);
      olvidarStacks();

      if (tipo === TIPO_FS) await rotationsManagerFsApi.updatePostDelete(schemaId);
      else await rotationsManagerApi.updatePostDelete(schemaId);

      await actualizarTotalSchema(groupId, tipo);

      await Promise.all([cargarEsquemas(groupId, tipo), cargarManager(tipo)]);
      limpiarSeleccionDeEsquema(tipo, eraUniversal);
      return true;
    } catch (error) {
      console.error("Error al eliminar el esquema:", error);
      toast.error(mensajeError(error, "Error al eliminar el esquema"));

      // Si la rotación ya se había borrado, se resincroniza la pantalla con el servidor
      await Promise.all([cargarEsquemas(groupId, tipo), cargarManager(tipo)]);
      if (rotacionEliminada) {
        olvidarStacks();
        limpiarSeleccionDeEsquema(tipo, eraUniversal);
      }
      return false;
    }
  };

  /* ==========================================
     AGREGAR / ACTUALIZAR / ELIMINAR ESQUEMAS
     ========================================== */
  const agregar = async () => {
    const groupId = getGroupId();

    if (groupId === SIN_GRUPO || groupId === "") {
      toast.error("Para agregar o editar un registro, primero debe seleccionar un grupo de la lista");
      groupsRef.current?.focus();
      return;
    }
    if (!newEntresemana.current?.value || newEntresemana.current.value === SIN_ESQUEMA) {
      toast.error("Debe especificar un nombre válido para el esquema");
      newEntresemana.current?.focus();
      return;
    }
    const orderValue = parseInt(newOrder.current?.value, 10);
    if (!newOrder.current?.value || Number.isNaN(orderValue) || orderValue <= 0) {
      newOrder.current?.focus();
      toast.error("Debe especificar un número que defina el orden de la rotación");
      return;
    }
    if (!startDate1 || !endDate1) {
      toast.error("Debe especificar la hora de inicio y la hora final del esquema");
      return;
    }
    if (coffeeES && excluirES) {
      toast.error("¿Descanso Transversal entre semana?");
      return;
    }
    if (savingRef.current) return;

    savingRef.current = true;
    try {
      await rotationsApi.create({
        nombre: newEntresemana.current.value,
        hinicio: startDate1,
        hfin: endDate1,
        grupoid: groupId,
        tipo: "Entre Semana",
        order: orderValue,
        excluir: excluirES,
        descanso: coffeeES,
        stack: []
      });

      await Promise.all([
        cargarEsquemas(groupId, TIPO_ES),
        cargarEsquemas(groupId, TIPO_FS),
      ]);

      newEntresemana.current.value = "";
      setOrder("");
      setNweValueOne("");
      setexcluirES(false);
      toast.success("Registro agregado correctamente");
    } catch (error) {
      console.error("Error al agregar el esquema:", error);
      toast.error(mensajeError(error, "Error al agregar el esquema"));
    } finally {
      savingRef.current = false;
    }
  };

  const agregarFS = async () => {
    const groupId = getGroupId();

    if (groupId === SIN_GRUPO || groupId === "") {
      toast.error("Para agregar o editar un registro, primero debe seleccionar un grupo de la lista");
      groupsRef.current?.focus();
      return;
    }
    if (!newFinsemana.current?.value || newFinsemana.current.value === SIN_ESQUEMA) {
      toast.error("Debe especificar un nombre válido para el esquema de fin de semana");
      newFinsemana.current?.focus();
      return;
    }
    const orderValue = parseInt(newOrderFS.current?.value, 10);
    if (!newOrderFS.current?.value || Number.isNaN(orderValue) || orderValue <= 0) {
      newOrderFS.current?.focus();
      toast.error("Debe especificar un número que defina el orden de la rotación para fines de semana");
      return;
    }
    if (!startDate2 || !endDate2) {
      toast.error("Debe especificar la hora de inicio y la hora final del esquema de fin de semana");
      return;
    }
    if (coffeeFS && excluirFS) {
      toast.error("¿Descanso Transversal en Fin de semana?");
      return;
    }
    if (savingRef.current) return;

    savingRef.current = true;
    try {
      await rotationsApi.create({
        nombre: newFinsemana.current.value,
        hinicio: startDate2,
        hfin: endDate2,
        grupoid: groupId,
        tipo: "Fin de Semana",
        order: orderValue,
        excluir: excluirFS,
        descanso: coffeeFS
      });

      await Promise.all([
        cargarEsquemas(groupId, TIPO_ES),
        cargarEsquemas(groupId, TIPO_FS),
      ]);

      newFinsemana.current.value = "";
      setOrderFS("");
      setNweValueTwo("");
      setexcluirFS(false);
      toast.success("Registro agregado correctamente");
    } catch (error) {
      console.error("Error al agregar el esquema de fin de semana:", error);
      toast.error(mensajeError(error, "Error al agregar el esquema de fin de semana"));
    } finally {
      savingRef.current = false;
    }
  };

  const programClick = async () => {
    const groupId = getGroupId();

    setTitleDaily(SIN_ESQUEMA);
    setTitleFs(SIN_ESQUEMA);
    setActiveSchemaESId(null);
    setActiveSchemaFSId(null);

    setNweValueOne("");
    setOrder("");
    setNweValueTwo("");
    setOrderFS("");
    setexcluirES(false);
    setexcluirFS(false);
    setCoffeeES(false);
    setCoffeeFS(false);

    setIdRegES("");
    setIdRegFS("");
    setData13([]);
    setStacksPorEsquema({});
    setIdItem(null);

    // Se limpia también el identificador universal para obligar a seleccionar un esquema nuevo
    setTitleDailyUniversal(SIN_ESQUEMA_UNIVERSAL);
    setIdRegUniversal("");

    await Promise.all([
      cargarEsquemas(groupId, TIPO_ES),
      cargarEsquemas(groupId, TIPO_FS),
      cargarManager(TIPO_ES),
      cargarManager(TIPO_FS),
      cargarPersonal(groupId),
    ]);
  };

  const callItem1 = (Nombres, horaInicio, horaFinal, id, orderVal, ex, descanso) => {
    setTitleDaily(Nombres);
    const fechaInicio = aFecha(horaInicio);
    const fechaFinal = aFecha(horaFinal);
    if (fechaInicio) setStartDate1(fechaInicio);
    if (fechaFinal) setEndDate1(fechaFinal);
    setIdRegES(id);
    setNweValueOne(Nombres);
    setOrder(orderVal ?? "");
    setexcluirES(Boolean(ex));
    setCoffeeES(Boolean(descanso));
    cargarStacksDelEsquema(id);
    setTitleDailyUniversal(Nombres);
    setIdRegUniversal(id);
    setActiveSchemaESId(id);
    setActiveSchemaFSId(null);
  };

  const callItem2 = (Nombres, horaInicio, horaFinal, id, orderVal, ex, descanso) => {
    setTitleFs(Nombres);
    const fechaInicio = aFecha(horaInicio);
    const fechaFinal = aFecha(horaFinal);
    if (fechaInicio) setStartDate2(fechaInicio);
    if (fechaFinal) setEndDate2(fechaFinal);
    setIdRegFS(id);
    setNweValueTwo(Nombres);
    setOrderFS(orderVal ?? "");
    setexcluirFS(Boolean(ex));
    setCoffeeFS(Boolean(descanso));
    cargarStacksDelEsquema(id);
    setTitleDailyUniversal(Nombres);
    setIdRegUniversal(id);
    setActiveSchemaFSId(id);
    setActiveSchemaESId(null);
  };

  const updateES = async () => {
    if (!idRegES) {
      toast.error("Para actualizar la información, primero debe seleccionar un esquema de la lista");
      return;
    }
    if (newValueOne === "") {
      newEntresemana.current?.focus();
      toast.error("Para actualizar la información, debe especificar un nombre para el Schema");
      return;
    }
    const orderValue = parseInt(newOrder.current?.value, 10);
    if (!newOrder.current?.value || Number.isNaN(orderValue) || orderValue <= 0) {
      newOrder.current?.focus();
      toast.error("Debe especificar un número que defina el orden de la rotación");
      return;
    }
    if (!startDate1 || !endDate1) {
      toast.error("Debe especificar la hora de inicio y la hora final del esquema");
      return;
    }
    if (coffeeES && excluirES) {
      toast.error("¿Descanso Transversal entre semana?");
      return;
    }
    if (savingRef.current) return;

    const groupId = getGroupId();
    savingRef.current = true;
    try {
      await rotationsApi.update({
        id_registro: idRegES,
        nombreActual: titleDaily,
        nuevaHoraInicio: startDate1,
        nuevaHoraFinal: endDate1,
        nuevoNombre: newValueOne,
        order: orderValue,
        excluir: excluirES,
        descanso: coffeeES
      });

      await rotationsManagerApi.setName({
        id_esquema: idRegES,
        nuevonombre: newValueOne
      });

      await Promise.all([
        cargarEsquemas(groupId, TIPO_ES),
        cargarManager(TIPO_ES),
      ]);

      // El esquema seleccionado para editar es el que se muestra en la cabecera del día
      setTitleDaily(newValueOne);
      if (idRegES === idRegUniversal) setTitleDailyUniversal(newValueOne);

      setNweValueOne("");
      setOrder("");
      setexcluirES(false);
      toast.success("Datos entre semana actualizados correctamente");
    } catch (error) {
      console.error("Error al actualizar el esquema entre semana:", error);
      toast.error(mensajeError(error, "Error al actualizar el esquema entre semana"));
    } finally {
      savingRef.current = false;
    }
  };

  const updateFS = async () => {
    if (!idRegFS) {
      toast.error("Para actualizar la información, primero debe seleccionar un esquema de fin de semana de la lista");
      return;
    }
    if (newValueTwo === "") {
      newFinsemana.current?.focus();
      toast.error("Para actualizar la información, debe especificar un nombre para el Schema");
      return;
    }
    const orderValue = parseInt(newOrderFS.current?.value, 10);
    if (!newOrderFS.current?.value || Number.isNaN(orderValue) || orderValue <= 0) {
      newOrderFS.current?.focus();
      toast.error("Debe especificar un número que defina el orden de la rotación para fines de semana");
      return;
    }
    if (!startDate2 || !endDate2) {
      toast.error("Debe especificar la hora de inicio y la hora final del esquema de fin de semana");
      return;
    }
    if (coffeeFS && excluirFS) {
      toast.error("¿Descanso Transversal en Fin de semana?");
      return;
    }
    if (savingRef.current) return;

    const groupId = getGroupId();
    savingRef.current = true;
    try {
      await rotationsApi.update({
        id_registro: idRegFS,
        nombreActual: titleFs,
        nuevaHoraInicio: startDate2,
        nuevaHoraFinal: endDate2,
        nuevoNombre: newValueTwo,
        order: orderValue,
        excluir: excluirFS,
        descanso: coffeeFS
      });

      await Promise.all([
        cargarEsquemas(groupId, TIPO_FS),
        cargarManager(TIPO_FS),
      ]);

      // El esquema seleccionado para editar es el que se muestra en la cabecera del día
      setTitleFs(newValueTwo);
      if (idRegFS === idRegUniversal) setTitleDailyUniversal(newValueTwo);

      setNweValueTwo("");
      setOrderFS("");
      setexcluirFS(false);
      toast.success("Datos de fin de semana actualizados correctamente");
    } catch (error) {
      console.error("Error al actualizar el esquema de fin de semana:", error);
      toast.error(mensajeError(error, "Error al actualizar el esquema de fin de semana"));
    } finally {
      savingRef.current = false;
    }
  };

  const deleteES = async () => {
    if (titleDaily === SIN_ESQUEMA || !idRegES) {
      toast.error("No se ha seleccionado un Esquema semanal para eliminar");
      return;
    }

    const result = await Swal.fire({
      title: "¿Realmente desea eliminar el esquema?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "No",
      denyButtonText: `Confirmar`,
      footer: '<h6>Gestión Manager Citytv</h6>',
    });

    if (!result.isDenied) return;

    const eliminado = await borrarEsquema(idRegES, TIPO_ES);
    if (eliminado) Swal.fire("Esquema eliminado", "", "success");
  };

  const deleteFS = async () => {
    if (titleFs === SIN_ESQUEMA || !idRegFS) {
      toast.error("No se ha seleccionado un Esquema de fin de semana para eliminar");
      return;
    }

    const result = await Swal.fire({
      title: "¿Realmente desea eliminar el esquema de fin de semana?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "No",
      denyButtonText: `Confirmar`,
      footer: '<h6>Gestión Manager Citytv</h6>',
    });

    if (!result.isDenied) return;

    const eliminado = await borrarEsquema(idRegFS, TIPO_FS);
    if (eliminado) Swal.fire("Esquema eliminado", "", "success");
  };

  /* ==========================================
     ASIGNACIÓN DE ESQUEMAS AL PERSONAL
     ========================================== */

  /**
   * Impide asignar a una persona un esquema cuyo stack no sume exactamente
   * la duración de su horario. Los esquemas de Descanso y los que no tienen
   * un horario válido quedan exentos.
   */
  const validarStackDelEsquema = async (esquema) => {
    if (!esquema) return true;

    // Los esquemas de Descanso no requieren un stack completo: solo se informa
    if (esquema.Descanso || esquema.descanso) return true;

    const ventana = minutosEntreFechas(
      esquema.HoraInicio ?? esquema.horaInicio,
      esquema.HoraFinal ?? esquema.horaFinal
    );

    // Sin horario válido no hay contra qué comparar
    if (!ventana || ventana <= 0) return true;

    let stacks;
    try {
      stacks = await stacksApi.getBySchema(esquema._id);
    } catch (error) {
      console.error("No se pudo verificar el stack del esquema:", error);
      toast.error(mensajeError(error, "No se pudo verificar el stack del esquema"));
      return false;
    }

    const total = (Array.isArray(stacks) ? stacks : []).reduce(
      (acumulado, item) => acumulado + duracionItemStack(item, data10),
      0
    );

    if (total === ventana) return true;

    const diferencia = ventana - total;
    const detalle =
      diferencia > 0 ? `faltan ${diferencia} min` : `sobran ${Math.abs(diferencia)} min`;

    toast.error(
      `El stack del esquema "${esquema.Nombre}" no cuadra con su horario: ${total} min de stack vs ${ventana} min de turno (${detalle}).`
    );
    return false;
  };

  const actualizar = async (userId, event) => {
    const schemaId = event.target.value;
    if (!schemaId) return;

    const manager = managerEsDe(userId);
    if (!manager) {
      toast.error("No se encontró el registro del planificador para este trabajador");
      return;
    }

    const totalSchema = data4.length;
    const totalGrupo = personasActivas.length;

    if (totalSchema !== totalGrupo) {
      Swal.fire({
        title: "<h6>El número de personas y de esquemas, no es el mismo. Corrija agregando Users Balancers o agregando o quitando esquemas para equilibrar el sistema.</h6>",
        showDenyButton: false,
        confirmButtonText: "OK",
        footer: `<h4>Hay ${totalGrupo} Personas activas y ${totalSchema} Esquemas</h4>`,
      });
      // Refresca para que el select controlado vuelva a mostrar lo realmente guardado
      await cargarManager(TIPO_ES);
      return;
    }

    if (savingRef.current) return;
    savingRef.current = true;
    const esquemaDestino = data4.find((esquema) => esquema._id === schemaId) ?? null;
    try {
      if (!(await validarStackDelEsquema(esquemaDestino))) {
        // Revierte el select controlado al valor realmente guardado
        await cargarManager(TIPO_ES);
        return;
      }

      //Asignar un trabajador no debe reiniciar el ancla del grupo.
      //Solo se inicializa si el grupo todavía no tiene dayKey.
      if (!manager.dayKey) {
        await actualizarDiaClave(manager.groupName, TIPO_ES);
      } else {
        await actualizarTotalesGrupo(manager.groupName, TIPO_ES);
      }

      await rotationsManagerApi.updateIndex(userId, {
        nameschema: corroborarNombre(schemaId, TIPO_ES),
        actual: corroborarActual(schemaId, TIPO_ES),
        idschema: schemaId,
        totalsc: parseInt(totalSchema, 10),
        totalgr: parseInt(totalGrupo, 10),
      });
      await cargarManager(TIPO_ES);
      toast.success("Información actualizada");
    } catch (error) {
      console.error("Error al actualizar el planificador:", error);
      toast.error(mensajeError(error, "Error al actualizar el planificador"));
      await cargarManager(TIPO_ES);
    } finally {
      savingRef.current = false;
    }
  };

  const actualizarFS = async (userId, event) => {
    const schemaId = event.target.value;
    if (!schemaId) return;

    const manager = managerFsDe(userId);
    if (!manager) {
      toast.error("No se encontró el registro del planificador para este trabajador");
      return;
    }

    const totalSchema = data5.length;
    const totalGrupo = personasActivas.length;

    if (totalSchema !== totalGrupo) {
      Swal.fire({
        title: "<h6>El número de personas y de esquemas para fines de semana, no es el mismo. Corrija agregando Users Balancers o esquemas.</h6>",
        showDenyButton: false,
        confirmButtonText: "OK",
        footer: `<h4>Hay ${totalGrupo} Personas activas y ${totalSchema} Esquemas</h4>`,
      });
      await cargarManager(TIPO_FS);
      return;
    }

    if (savingRef.current) return;
    savingRef.current = true;
    const esquemaDestino = data5.find((esquema) => esquema._id === schemaId) ?? null;
    try {
      if (!(await validarStackDelEsquema(esquemaDestino))) {
        // Revierte el select controlado al valor realmente guardado
        await cargarManager(TIPO_FS);
        return;
      }

      if (!manager.dayKey) {
        await actualizarDiaClave(manager.groupName, TIPO_FS);
      } else {
        await actualizarTotalesGrupo(manager.groupName, TIPO_FS);
      }

      await rotationsManagerFsApi.updateIndex(userId, {
        nameschema: corroborarNombre(schemaId, TIPO_FS),
        actual: corroborarActual(schemaId, TIPO_FS),
        idschema: schemaId,
        totalsc: parseInt(totalSchema, 10),
        totalgr: parseInt(totalGrupo, 10),
      });
      await cargarManager(TIPO_FS);
      toast.success("Información actualizada");
    } catch (error) {
      console.error("Error al actualizar el planificador de fin de semana:", error);
      toast.error(mensajeError(error, "Error al actualizar el planificador de fin de semana"));
      await cargarManager(TIPO_FS);
    } finally {
      savingRef.current = false;
    }
  };

  const setChangeFijo = async (iduser, event) => {
    const nuevoValor = event.target.checked;

    setData8(prevData =>
      prevData.map(rm => rm.userId === iduser ? { ...rm, fijo: nuevoValor } : rm)
    );

    try {
      await rotationsManagerApi.updateFixed(iduser, { fijo: nuevoValor });
      await cargarManager(TIPO_ES);
    } catch (error) {
      console.error(error);
      await cargarManager(TIPO_ES);
      toast.error("No se pudo actualizar el estado fijo");
    }
  };

  /* ==========================================
     FUNCIONES DE STACKS (AGREGAR)
     ========================================== */
  const addStackGenerico = async (tipo, idProg, extraData = {}) => {
    if (!idRegUniversal) {
      toast.error("Para agregar un elemento al stack primeramente debe haber seleccionado un grupo y posteriormente un esquema");
      return;
    }
    if (savingRef.current) return;

    // Solo Program y Secondary se validan contra la hora acumulada del stack
    if (tipo === "Programa" || tipo === "Secondary") {
      const horaValida = await validarHoraPrograma(tipo, idProg);
      if (!horaValida) return;
    }

    // Calculamos el siguiente orden real buscando el máximo Order actual en data13, o 1 si está vacío
    let siguienteOrden = 1;
    if (data13 && data13.length > 0) {
      const maxOrder = Math.max(...data13.map(item => item.Order || 0));
      siguienteOrden = maxOrder + 1;
    }

    savingRef.current = true;
    try {
      await stacksApi.create({
        idschema: idRegUniversal,
        type: tipo,
        order: siguienteOrden,
        idprograma: idProg,
        ...extraData
      });
      await cargarStacksDelEsquema(idRegUniversal);
      toast.success("Elemento agregado al stack");
    } catch (error) {
      console.error("Error al agregar el elemento al stack:", error);
      toast.error(mensajeError(error, "Error al agregar el elemento al stack"));
    } finally {
      savingRef.current = false;
    }
  };

  const programa = () => addStackGenerico("Programa", progRef.current?.value);
  const SecondaryEvent = () => addStackGenerico("Secondary", secondaryRef.current?.value);

  const custom = () => {
    const minutos = Number(durationRef.current?.value);

    if (!durationRef.current?.value) {
      toast.error("La duración en minutos del Custom no puede estar vacía");
      durationRef.current?.focus();
      return;
    }
    if (!Number.isFinite(minutos) || minutos <= 0) {
      toast.error("La duración en minutos del Custom debe ser mayor a cero");
      durationRef.current?.focus();
      return;
    }
    if (!customRef.current?.value) {
      toast.error("El evento Custom no puede estar vacío");
      customRef.current?.focus();
      return;
    }
    addStackGenerico("Custom", customRef.current.value, { duration: durationRef.current.value });
  };

  const null30 = () => addStackGenerico("Null", "Null-30");

  const timeOut = () => {
    const minutos = Number(timeOutRef.current?.value);

    if (!timeOutRef.current?.value || !Number.isFinite(minutos) || minutos <= 0) {
      toast.error("Debe especificar un tiempo en minutos mayor a cero");
      timeOutRef.current?.focus();
      return;
    }
    addStackGenerico("TimeOut", "TimeOut", { valor: timeOutRef.current.value });
    timeOutRef.current.value = "0";
  };

  /* ==========================================
     STACKS: CARGAR, GUARDAR Y REORDENAR (UP/DOWN)
     ========================================== */
  const loadStack = async () => {
    const schemaId = idRegUniversal;

    if (!schemaId) {
      toast.error("Para cargar un stack primero debe seleccionar un grupo y un esquema de la lista.");
      return false;
    }

    const target = data15.find(s => s._id === savedStackId);

    if (!target) {
      toast.error("Debe seleccionar un stack guardado de la lista desplegable para poder cargarlo.");
      return false;
    }

    try {
      await stacksApi.removeAllBySchema(schemaId);
      for (let st of target.Stack ?? []) {
        await stacksApi.create({
          idschema: schemaId,
          type: st.type,
          order: st.order,
          idprograma: st.itemName,
          duration: st.Duration,
          valor: st.Value
        });
      }
      await cargarStacksDelEsquema(schemaId);
      return true;
    } catch (error) {
      console.error("Error al cargar el stack:", error);
      toast.error(mensajeError(error, "No se pudo cargar el stack"));
      // La carga pudo quedar a medias: se muestra el estado real del servidor
      await cargarStacksDelEsquema(schemaId);
      return false;
    }
  };

  const load = async () => {
    // Validación estricta: Si no hay un esquema seleccionado, se bloquea de inmediato
    if (!idRegUniversal) {
      toast.error("Para cargar un stack primero debe seleccionar un grupo y un esquema de la lista.");
      return;
    }
    if (!savedStackId) {
      toast.error("Debe seleccionar un stack guardado de la lista desplegable para poder cargarlo.");
      return;
    }

    const result = await Swal.fire({
      title: "¿Realmente desea cargar el stack seleccionado? El actual stack se perderá si no se ha guardado previamente.",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "No",
      denyButtonText: `Si, Borrar actual y cargar`,
      footer: '<h6>Gestión Manager Citytv</h6>',
    });

    if (!result.isDenied) return;

    const cargado = await loadStack();
    if (cargado) Swal.fire("Stack cargado con éxito", "", "success");
  };

  const saveStack = async () => {
    // 1. Validar que el campo de nombre no esté vacío
    if (!nameStackRef.current?.value || nameStackRef.current.value.trim() === "") {
      toast.error("No se puede guardar un stack sin proporcionar un nombre que lo defina");
      nameStackRef.current?.focus();
      return;
    }

    // 2. Validar que realmente existan elementos en el stack actual (data13) para guardar
    if (!data13 || data13.length === 0) {
      toast.error("El stack actual está vacío. No se puede guardar un stack sin elementos.");
      return;
    }
    if (savingRef.current) return;

    savingRef.current = true;
    try {
      await stacksSavedApi.create({
        namestack: nameStackRef.current.value,
        stack: data13.map((item) => ({
          "itemID": item._id,
          "itemName": item.ID_programa,
          "order": item.Order,
          "type": item.Type,
          "Value": item.Value,
          "Duration": item.Duration,
        }))
      });
      await cargarStacksGuardados();
      nameStackRef.current.value = "";
      toast.success("Stack guardado con éxito");
    } catch (error) {
      console.error("Error al guardar el stack:", error);
      toast.error(mensajeError(error, "Error al guardar el stack"));
    } finally {
      savingRef.current = false;
    }
  };

  const delItem = async () => {
    if (!idItem) return false;

    try {
      await stacksApi.remove(idItem);
      await cargarStacksDelEsquema(idRegUniversal);
      setIdItem(null);
      return true;
    } catch (error) {
      console.error("Error al eliminar el elemento del stack:", error);
      toast.error(mensajeError(error, "Error al eliminar el elemento del stack"));
      return false;
    }
  };

  const del = async () => {
    if (!idItem) {
      toast.error("Para eliminar un elemento del Stack primero debe seleccionarlo");
      return;
    }

    const result = await Swal.fire({
      title: "¿Realmente desea eliminar el item del Stack?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "No",
      denyButtonText: `Si, Borrar`,
      footer: '<h6>Gestión Manager Citytv</h6>',
    });

    if (!result.isDenied) return;

    const eliminado = await delItem();
    if (eliminado) Swal.fire("Item Eliminado", "", "success");
  };

  const cleanStack = async () => {
    try {
      await stacksApi.removeAllBySchema(idRegUniversal);
      await cargarStacksDelEsquema(idRegUniversal);
      setIdItem(null);
      return true;
    } catch (error) {
      console.error("Error al limpiar el stack:", error);
      toast.error(mensajeError(error, "Error al limpiar el stack"));
      return false;
    }
  };

  const clean = async () => {
    if (getGroupId() === SIN_GRUPO || !idRegUniversal) {
      toast.error("Para limpiar un stack primero debe seleccionar un grupo y luego un esquema");
      return;
    }

    const result = await Swal.fire({
      title: "¿Realmente desea limpiar la lista del stack seleccionado?.",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "No",
      denyButtonText: `Si, Limpiar`,
      footer: '<h6>Gestión Manager Citytv</h6>',
    });

    if (!result.isDenied) return;

    const limpiado = await cleanStack();
    if (limpiado) Swal.fire("Elementos del Stack eliminados", "", "success");
  };

  /* Funciones UP y DOWN con intercambio directo (Swap) */
  const up = async () => {
    if (!idItem) {
      toast.error("Primero debe seleccionar un elemento del Stack");
      return;
    }

    const stackOrdenado = [...data13].sort((a, b) => (a.Order || 0) - (b.Order || 0));
    const indexActual = stackOrdenado.findIndex(item => item._id === idItem);

    if (indexActual <= 0) return;

    const elementoActual = stackOrdenado[indexActual];
    const elementoAnterior = stackOrdenado[indexActual - 1];

    let nuevoOrdenActual = elementoAnterior.Order !== undefined && elementoAnterior.Order !== null ? elementoAnterior.Order : indexActual;
    let nuevoOrdenAnterior = elementoActual.Order !== undefined && elementoActual.Order !== null ? elementoActual.Order : indexActual + 1;

    if (nuevoOrdenActual === nuevoOrdenAnterior) {
      nuevoOrdenActual = indexActual;
      nuevoOrdenAnterior = indexActual + 1;
    }

    if (savingRef.current) return;
    savingRef.current = true;
    try {
      await stacksApi.update(elementoActual._id, { nuevo: nuevoOrdenActual });
      await stacksApi.update(elementoAnterior._id, { nuevo: nuevoOrdenAnterior });
      await cargarStacksDelEsquema(idRegUniversal);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo subir el elemento");
    } finally {
      savingRef.current = false;
    }
  };

  const down = async () => {
    if (!idItem) {
      toast.error("Primero debe seleccionar un elemento del Stack");
      return;
    }

    const stackOrdenado = [...data13].sort((a, b) => (a.Order || 0) - (b.Order || 0));
    const indexActual = stackOrdenado.findIndex(item => item._id === idItem);

    if (indexActual === -1 || indexActual >= stackOrdenado.length - 1) return;

    const elementoActual = stackOrdenado[indexActual];
    const elementoSiguiente = stackOrdenado[indexActual + 1];

    let nuevoOrdenActual = elementoSiguiente.Order !== undefined && elementoSiguiente.Order !== null ? elementoSiguiente.Order : indexActual + 2;
    let nuevoOrdenSiguiente = elementoActual.Order !== undefined && elementoActual.Order !== null ? elementoActual.Order : indexActual + 1;

    if (nuevoOrdenActual === nuevoOrdenSiguiente) {
      nuevoOrdenActual = indexActual + 2;
      nuevoOrdenSiguiente = indexActual + 1;
    }

    if (savingRef.current) return;
    savingRef.current = true;
    try {
      await stacksApi.update(elementoActual._id, { nuevo: nuevoOrdenActual });
      await stacksApi.update(elementoSiguiente._id, { nuevo: nuevoOrdenSiguiente });
      await cargarStacksDelEsquema(idRegUniversal);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo bajar el elemento");
    } finally {
      savingRef.current = false;
    }
  };

  const delStackSaved = async () => {
    try {
      await stacksSavedApi.remove(savedStackId);
      await cargarStacksGuardados();
      return true;
    } catch (error) {
      console.error("Error al eliminar el stack guardado:", error);
      toast.error(mensajeError(error, "Error al eliminar el stack guardado"));
      return false;
    }
  };

  const delSaved = async () => {
    if (!savedStackId) {
      toast.error("Para eliminar un stack guardado primero debe seleccionarlo de la lista desplegable");
      return;
    }

    const result = await Swal.fire({
      title: "¿Realmente desea eliminar el stack guardado?.",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "No",
      denyButtonText: `Si, Borrar`,
      footer: '<h6>Gestión Manager Citytv</h6>',
    });

    if (!result.isDenied) return;

    const eliminado = await delStackSaved();
    if (eliminado) Swal.fire("Stack Borrado", "", "success");
  };

  /* Efectos de carga inicial */
  useEffect(() => { cargarGrupos(); }, [cargarGrupos]);
  useEffect(() => { cargarProgramas("all"); }, [cargarProgramas]);
  useEffect(() => { cargarProgramas("primary"); }, [cargarProgramas]);
  useEffect(() => { cargarProgramas("secondary"); }, [cargarProgramas]);
  useEffect(() => { cargarStacksGuardados(); }, [cargarStacksGuardados]);
  useEffect(() => { cargarManager(TIPO_ES); }, [cargarManager]);
  useEffect(() => { cargarManager(TIPO_FS); }, [cargarManager]);

  // Mantiene seleccionado un stack guardado válido mientras la lista cambia
  useEffect(() => {
    setSavedStackId((actual) => {
      if (data15.length === 0) return "";
      if (actual && data15.some((stack) => stack._id === actual)) return actual;
      return data15[0]._id;
    });
  }, [data15]);

  return (
    <div className="contentRotations">
      <Toaster />

      {/* ASIGNACIONES DE PERSONAL */}
      <div className="rotationReset">
        <button
          type="button"
          className="rotationReset_btn"
          onClick={() => reiniciarRotacion(TIPO_ES)}
        >
          Reiniciar rotación ES
        </button>
        <button
          type="button"
          className="rotationReset_btn"
          onClick={() => reiniciarRotacion(TIPO_FS)}
        >
          Reiniciar rotación FS
        </button>
      </div>

      <div className="asignations">
        <div>
          {personasActivas.map((persona) => {
            const managerES = managerEsDe(persona._id);

            return (
              <div className="asiganation_li" key={persona._id}>
                <span className={persona.cargo === "USERBALANCER" ? "usersRotations2" : "usersRotations"}>
                  {persona.nombres + " " + persona.apellidos}
                </span>

                <div className="asiganations_option">
                  <select
                    className="asignation_select"
                    value={esquemaAsignado(persona._id, TIPO_ES)}
                    onChange={(e) => actualizar(persona._id, e)}
                  >
                    <option value="">{nombreSchemaAsignado(persona._id, TIPO_ES)}</option>
                    {data4?.map((schemaname) => (
                      <option key={schemaname._id} value={schemaname._id}>
                        {schemaname.Nombre}
                      </option>
                    ))}
                  </select>

                  <select
                    className="asignation_select"
                    value={esquemaAsignado(persona._id, TIPO_FS)}
                    onChange={(e) => actualizarFS(persona._id, e)}
                  >
                    <option value="">{nombreSchemaAsignado(persona._id, TIPO_FS)}</option>
                    {data5?.map((schemaname) => (
                      <option key={schemaname._id} value={schemaname._id}>
                        {schemaname.Nombre}
                      </option>
                    ))}
                  </select>

                  <span className="fijoSpan">Fijo</span>
                  {managerES && (
                    <input
                      type="checkbox"
                      checked={Boolean(managerES.fijo)}
                      className="checkFijo"
                      onChange={(e) => setChangeFijo(persona._id, e)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="subTitulo">
        Grupos
        <select className="inputDir" onChange={() => programClick()} ref={groupsRef}>
          <option value={"none"}>{"-----------------------------------"}</option>
          {data?.map((program) => (
            <option key={program._id} value={program._id}>{program.nombre}</option>
          ))}
        </select>
      </div>

      {/* SECCIÓN ENTRE SEMANA */}
      <div className="sectionDaily">
        <img src={dia} alt="" className="imgDaily"/>
        <h2 className="seleccionadoDaily">{titleDaily}</h2>
        <div className="mainCajas">
          <div className="subTitulo">Esquema</div>
          <div className="caja1">
              {data4?.map((nombres) => (
                <p
                  className={`item ${activeSchemaESId === nombres._id ? "activo1" : ""}`}
                  key={nombres._id}
                  onClick={() => callItem1(nombres.Nombre, nombres.HoraInicio, nombres.HoraFinal, nombres._id, nombres.Order, nombres.Excluir, nombres.Descanso)}
                >
                  {nombres.Nombre}<span className="id">P : {nombres.Order}</span>
                </p>
              ))}
          </div>
        </div>

        <div className="mainCajas">
          <div className="subTitulo">Horario</div>
          <div className="caja2">
            <div className="horaIn">
              <DatePicker
                className ='input'
                selected={startDate1}
                onChange={(date) => setStartDate1(date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="H Inicio"
                dateFormat="h:mm aa"
              />
              <DatePicker
                className ='input'
                selected={endDate1}
                onChange={(date) => setEndDate1(date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="H Final"
                dateFormat="h:mm aa"
              />
            </div>
          </div>

          {esEsquemaDescanso(esquemaEs) ? (
            <div className="stackAcumulado stackAcumulado--no-aplica">No aplica</div>
          ) : (
            <div className={`stackAcumulado stackAcumulado--${resumenEs.estado}`}>
              <span className="stackAcumulado-total">{textoTotalAcumulado(resumenEs)}</span>
              <span className="stackAcumulado-estado">{textoEstadoAcumulado(resumenEs)}</span>
            </div>
          )}
        </div>

        <div className="mainCajas">
          <div className="subTitulo">Acciones</div>
          <div className="caja4">
            <div className="containerSingleButtom">
              <img src={Plus} alt="plus" className="img-butons" onClick={agregar}/>
            </div>
            <div className="containerSingleButtom">
              <img src={Edit} alt="edit" className="img-butons" onClick={updateES}/>
            </div>
            <div className="containerDeleteButtom">
              <img src={Delete} alt="trash" className="img-butons" onClick={deleteES}/>
            </div>
            <div className={coffeeES ? "containerBreak2" : "containerBreak"}>
              <img src={Coffee} alt="Break" className="img-butons" onClick={() => setCoffeeES(!coffeeES)}/>
            </div>
            <input type="checkbox" className="checkHidden" checked={coffeeES} onChange={() => setCoffeeES(!coffeeES)}/>
          </div>
          <input type="text" name="nuevoEntre" className="inputDir3" ref={newEntresemana} value={newValueOne} placeholder={titleDaily} onChange={(e) => setNweValueOne(e.target.value)}/>
          <input type="text" name="nuevoEntre" className="inputDir4" ref={newOrder} value={order} placeholder={titleDaily} onChange={(e) => setOrder(e.target.value)}/>
          <span className="excluir">Turno transversal</span>
          <input className="check" type="checkbox" checked={excluirES} onChange={() => setexcluirES(!excluirES)}/>
        </div>
      </div>

      {/* MÓDULO DE STACKS (CON SUS CLASES ORIGINALES MAIN1, MAIN2, MAIN3) */}
      <div className="pgms1">
        <div className="pgms1_cabezal">
          Stack Programs {" " + titleDailyUniversal}
        </div>
        <div className="contenedorLista">
          <div className="pgms">
            <table className="stack-tabla">
              <thead>
                <tr>
                  <th>Inicio</th>
                  <th>Evento</th>
                  <th>Final</th>
                </tr>
              </thead>
              <tbody>
                {stackEnOrden.map((pgms) => {
                  const tiempos = tiemposStack.mapa.get(pgms._id);
                  const duracion = tiempos?.duracion ?? 0;

                  return (
                    <tr
                      key={pgms._id}
                      className={idItem === pgms._id ? "stack-fila--activa" : ""}
                      onClick={() => setIdItem(pgms._id)}
                    >
                      <td className="stack-hora">{formatearHora(tiempos?.inicio)}</td>
                      <td className={`stack-evento ${claseEventoStack(pgms)}`}>
                        {textoEventoStack(pgms, duracion)}
                      </td>
                      <td className="stack-hora">{formatearHora(tiempos?.fin)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="levels">
            <p><img src={Up} className="levels-image" onClick={up} alt="up"></img></p>
            <p><img src={Down} className="levels-image" onClick={down} alt="down"></img></p>
          </div>

          <div className="pgms-actions">
            <div className="pgms-actions-clean" onClick={clean}>
              <img src={Brush} alt="limpiar" />
            </div>
            <div className="pgms-actions-del" onClick={del}>
              <img src={Delete} alt="eliminar" />
            </div>
          </div>
        </div>

        <div className="funciones">
          <div className="Title">Program</div>
          <select className="Title-program" ref={progRef}>
            {data12?.map((program) => (
              <option key={program._id} value={program._id}>{program.nombre}</option>
            ))}
          </select>
          <div className="pgm-bottom" onClick={programa}>Agregar</div>

          <hr className="separadorHR"></hr>

          <div className="Title">Secondary Event</div>
          <select className="Title-program" ref={secondaryRef}>
            {data11?.map((program) => (
              <option key={program._id} value={program._id}>{program.nombre}</option>
            ))}
          </select>
          <div className="pgm-bottom" onClick={SecondaryEvent}>Agregar</div>
          <hr className="separadorHR"></hr>

          <div className="Title">Custom</div>
          <input type="number" className="timeOutInput" ref={durationRef} /> Minutos
          <input type="text" className="custom" ref={customRef} placeholder="Especifique..."/>
          <div className="pgm-bottom" onClick={custom}>Agregar</div>
          <hr className="separadorHR"></hr>

          <div className="Title">Null</div>
          <div className="pgm-bottom-2" onClick={null30}>Null 30 Minutos</div>
          <hr className="separadorHR"></hr>

          <div className="Title space">Time Out</div>
          <input type="number" className="timeOutInput" ref={timeOutRef} /> Minutos
          <div className="pgm-bottom-3" onClick={timeOut}>
            <label className="timeOutLb1">Time Out</label>
          </div>
          <hr className="separadorHR"></hr>

          <div className="Title">Load Stack</div>
          <select className="Title-program" value={savedStackId} onChange={(e) => setSavedStackId(e.target.value)}>
            {data15?.map((saved) => (
              <option key={saved._id} value={saved._id}>{saved.NameStack}</option>
            ))}
          </select>
          <div className="pgm-bottom" onClick={load}>Load..</div>
          <div className="pgm-bottom-del" onClick={delSaved}>Delete</div>
          <hr className="separadorHR"></hr>

          <div className="Title">Save Stack</div>
          <input type="text" className="custom" ref={nameStackRef}/>
          <div className="pgm-bottom" onClick={saveStack}>Save</div>
          <hr className="separadorHR"></hr>
        </div>
      </div>

      {/* SECCIÓN FIN DE SEMANA */}
      <div className="sectionSunday">
        <img src={Sunday} alt="" className="imgSunday"/>
        <h2 className="seleccionadoSunday">{titleFs}</h2>
        <div className="mainCajas">
          <div className="subTitulo">Esquema</div>
          <div className="caja1">
             {data5?.map((nombres) => (
                <p
                  className={`item ${activeSchemaFSId === nombres._id ? "activo2" : ""}`}
                  key={nombres._id}
                  onClick={() => callItem2(nombres.Nombre, nombres.HoraInicio, nombres.HoraFinal, nombres._id, nombres.Order, nombres.Excluir, nombres.Descanso)}
                >
                  {nombres.Nombre}<span className="id">P : {nombres.Order}</span>
                </p>
              ))}
          </div>
        </div>

        <div className="mainCajas">
          <div className="subTitulo">Horario</div>
          <div className="caja2">
            <div className="horaIn">
              <DatePicker
                className ='input'
                selected={startDate2}
                onChange={(date) => setStartDate2(date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="H Inicio"
                dateFormat="h:mm aa"
              />
              <DatePicker
                className ='input'
                selected={endDate2}
                onChange={(date) => setEndDate2(date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="H Final"
                dateFormat="h:mm aa"
              />
            </div>
          </div>

          {esEsquemaDescanso(esquemaFs) ? (
            <div className="stackAcumulado stackAcumulado--no-aplica">No aplica</div>
          ) : (
            <div className={`stackAcumulado stackAcumulado--${resumenFs.estado}`}>
              <span className="stackAcumulado-total">{textoTotalAcumulado(resumenFs)}</span>
              <span className="stackAcumulado-estado">{textoEstadoAcumulado(resumenFs)}</span>
            </div>
          )}
        </div>

        <div className="mainCajas">
          <div className="subTitulo">Acciones</div>
          <div className="caja4">
            <div className="containerSingleButtom">
              <img src={Plus} alt="plus" className="img-butons" onClick={agregarFS}/>
            </div>
            <div className="containerSingleButtom">
              <img src={Edit} alt="edit" className="img-butons" onClick={updateFS}/>
            </div>
            <div className="containerDeleteButtom">
              <img src={Delete} alt="trash" className="img-butons" onClick={deleteFS}/>
            </div>
            <div className={coffeeFS ? "containerBreak2" : "containerBreak"}>
              <img src={Coffee} alt="Breaks" className="img-butons" onClick={() => setCoffeeFS(!coffeeFS)}/>
             <input type="checkbox" className="checkHidden" checked={coffeeFS} onChange={() => setCoffeeFS(!coffeeFS)}/>
            </div>
          </div>
          <input type="text" name="nuevoFinde" className="inputDir3" value={newValueTwo} ref={newFinsemana} placeholder={titleFs} onChange={(e) => setNweValueTwo(e.target.value)} />
          <input type="text" name="nuevoFinde" className="inputDir4" ref={newOrderFS} value={orderFS} placeholder={titleDaily} onChange={(e) => setOrderFS(e.target.value)}/>
          <span className="excluir">Turno transversal</span>
          <input className="check" type="checkbox" checked={excluirFS} onChange={() => setexcluirFS(!excluirFS)}/>
        </div>
      </div>
    </div>
  );
};

export default RotationsContent;
