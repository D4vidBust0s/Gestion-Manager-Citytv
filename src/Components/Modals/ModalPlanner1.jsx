/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-self-assign */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import  './ModalPlanner1.css'

/* Import recursos */
import Anita from '../../assets/Anita.jpg';
import Calendar from '../../assets/calendar.webp';
import Clock from '../../assets/bx-time-five.svg';
import Pencil from '../../assets/pencil.svg';
import Plus from '../../assets/Plus.svg';
import Trash from '../../assets/trash.svg';
import Clean from '../../assets/brush.svg';
import Balanza from '../../assets/balanza.png';
import cafe from '../../assets/coffee.svg';
import Calendario from '../../assets/calendario.png';
import Ok from '../../assets/Ok.svg';
import documento from '../../assets/document.svg';
import capas from '../../assets/capas.svg';
import less from '../../assets/Default.svg';
import save from '../../assets/bxs-save.svg';
import flechaLeft from '../../assets/arrow4.svg';
import handStop from '../../assets/handStop.gif';
import trashFull from '../../assets/trashFull.svg';
import bandera from '../../assets/Flag-Colombia.gif';




/* Import dependencies */
import { Fragment, useEffect, useMemo, useRef, useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { FiMaximize2, FiX } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import {Toaster, toast} from 'react-hot-toast';



//Import Contextos
import { FechaBarraContext } from '../../context/FechaBarraProvider';
import { PronosticoContext } from '../../context/PronosticoTurnosProvider'
import { usePlannerData } from '../../Custom_Hooks/usePlannerData';
import {
  clasificarDia,
  estadoDelDia,
  compensatorioEnFecha,
  rangoCubreFecha,
  cadenaDeTurnos,
  formatearHora,
  horaInicioSchema,
  construirCadena,
  duracionDeTurno,
  duracionDeElemento,
  aFecha,
  normalizarHoraDelDia,
} from '../../utils/plannerStack';
import { construirDias, indexarHorasPorUsuario } from '../../utils/balancer';

/* VARIABLES */
let fullPermisions = 0;
let fullBreaks  = 0;
let fullIncapacitys   = 0;
let fullRecess  = 0;
let fullLicenses   = 0;

let globalIdGroup;
let arrayVariables = [];

let numDias2 = [];
let numDias = [];

let fechaRules;
let fechaRulesFormat;
let auxDias;
let auxDias2;
let auxDias3; 

let auxDias0;
let auxDias22;
let auxDias33;

let mes;
let año;

let totalGrupo = 0;
let totalSchema = 0;
let auxOut = "--:--:--";
let fullTime = 0;

//Variables 
let DiaClave;
let totalSche;
let totalGP;
let actual;
let IDGLOBAL;
let IDSCHEMAGLOBAL;
let HORAINGLOBAL;
let INDEXGLOBAL;
let DURACIONGLOBAL  = 0;

let validador = 0;
let validador2 = 0;
let validador3 = 0;
let inicioMain;
let validaUser = 0;
let validador8 = 0;


let fechaAuxGlobal;
let fechaAuxGlobalIn = "--:--:--";
let IDITEMGLOBAL = "";
let globalCantidad = 0;

let validaDiaFestivo = 0;
let mensaje = "-------";


let ax;




export default function ModalPlanner1({estado,cambiarEstado,nombres,cargo,fechaPlaner,iduser,subGrupo,color,gp,gpid,holy,datos}) {

/* CONTEXTOS*/
const [fechaBarra,setFechaBarra] = useContext(FechaBarraContext);  //Define un estado para la fecha de la barra
const [auxiliar,setAuxiliar] = useContext(PronosticoContext); //



  //Estados
  const [, setDate] = useState()
  const [showNotas, setShowNotas] = useState(false);
  

 

  const [startHour, setStartHour] = useState(new Date());
  const [EndHour, setEndHour] = useState(new Date());
  const [IDUSER, setIDUSER] = useState();
  const [FECHA, setFECHA] = useState();
  const [EVENTO, SETEVENTO] = useState("---------------------------------");

  /* Estados para el datepicker */
  /* Estados para los controles del formulario de acciones */
  const [pgm, setPgm] = useState("---------------------------------");
  const [event, setEvent] = useState("---------------------------------");
  const [custom, setCustom] = useState("");
  const [obs, setObs] = useState("");

  const [pr,setPr]= useState(0);
  const [showRight,setShowRight]= useState(false);
  const [continuacion, setContinuacion] = useState([]);
  const [showMatrizCompleta, setShowMatrizCompleta] = useState(false);
  const [stackSeleccionado, setStackSeleccionado] = useState("");
  const [filasStackSeleccionado, setFilasStackSeleccionado] = useState([]);

  //Datos del planificador: única conversación con la API (Custom_Hooks/usePlannerData).
  //Los alias conservan los nombres históricos del componente (data, data1, ...).
  const {
    programs: data,
    turnosUsuario: data1,
    rules: data2,
    permissions: data3,
    breaks: data4,
    incapacitys: data5,
    recess: data6,
    licenses: data7,
    payroll: data8,
    rotations: data9,
    rotationsManager: data10,
    stacks: data11,
    shiftsFull: data12,
    substitutions: data13,
    programmers: data14,
    notations: data15,
    savedStacks: data16,
    shiftsDay: data17,
    compensatorios: data18,
    projections: data19,
    recargarTurnos,
    recargarShiftsFull,
    recargarShiftsDay,
    recargarCompensatorios: obtenerCompensatorios,
    recargarRotations,
    recargarStacks,
    recargarStacksGuardados,
    recargarProgrammers,
    recargarNotations,
    recargarProjections,
    guardarTurno,
    guardarStackGuardado,
    limpiarTurnos,
    reemplazarTurnosDeFecha,
    reemplazarTurnosDeFechas,
    crearCompensatorio,
    cargarStackCorto,
    obtenerStackGuardado,
    renombrarStackGuardado,
    eliminarStackGuardado,
    vaciarStacks,
    vaciarRotations,
    vaciarTurnos,
  } = usePlannerData({ iduser, fechaPlaner, auxiliar, showRight });

  const regla = data2?.[0];

  const [alerta, setAlerta] = useState(null);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [validaColor,setValidaColor]= useState(false);
  


 
 

  //Referencias
  const mainEventRef = useRef();
  const pgmRef = useRef();
  const secRef = useRef();
  const eventRef = useRef();
  const customRef = useRef();
  const startRef = useRef();
  const endRef = useRef();
  const observationRef = useRef();
  const stackRef = useRef();
  const saveStackRef = useRef();
  const guardandoRef = useRef(false);

 
  
  //FUNCIONES
  //Las lecturas y escrituras de la API viven en usePlannerData
  //(Custom_Hooks/usePlannerData.js); aquí solo se arman los payloads.

  const crear = async (IDUSER,NOMBRES,INDEX,IDPROGRAMA,EVENT_ID,COLOR,OBSERVACION,FECHA_CLAVE,ID_SCHEMA,INICIO_MAIN,OUT,TIPO)=>{

    await guardarTurno({
      idUser: IDUSER,
      nombres: NOMBRES,
      index: INDEX,
      idPrograma: IDPROGRAMA,
      eventId: EVENT_ID,
      color: COLOR,
      observacion: OBSERVACION,
      fechaClave: FECHA_CLAVE,
      idSchema: ID_SCHEMA,
      inicioMain: INICIO_MAIN,
      out: OUT,
      tipo: TIPO,
    });

    INDEXGLOBAL = INDEX;

    //limpiamos el campo de observación después de guardar
    observationRef.current.value="";

  }


  const crearSaveStack = async (NOMBRESTACK,IDUSER,NOMBRES,INDEX,IDPROGRAMA,EVENT_ID,COLOR,OBSERVACION,FECHA_CLAVE,ID_SCHEMA,INICIO_MAIN,OUT,TIPO)=>{

    return await guardarStackGuardado({
      nombreStack: NOMBRESTACK,
      idUser: IDUSER,
      nombres: NOMBRES,
      index: INDEX,
      idPrograma: IDPROGRAMA,
      eventId: EVENT_ID,
      color: COLOR,
      observacion: OBSERVACION,
      fechaClave: FECHA_CLAVE,
      idSchema: ID_SCHEMA,
      inicioMain: INICIO_MAIN,
      out: OUT,
      tipo: TIPO,
    });

  }

  const cleanRegistro = async ()=>{

    //La fecha que se está programando es la del modal (no la de la barra).
    //Si el stack tiene continuación en días siguientes, también se limpia.
    const fechas = [
      new Date(fechaPlaner),
      ...(continuacion ?? [])
        .map((turno) => aFecha(turno?.Inicio_main))
        .filter(Boolean),
    ];

    return await reemplazarTurnosDeFechas([], {
      userId: iduser,
      fechas,
    });

  };

  const limpiarTodo = async () => {

    //Limpiamos los registros en la base de datos y refrescamos las vistas
    await cleanRegistro();
    setContinuacion([]);
    setAuxiliar(!auxiliar);  //este estado notifica al contexto para ser usado en listado

    toast.success("Limpieza de lista ejecutado correctamente");
  }

  const getNameProgram = (idEvento,tipo,ID_event) =>{

    let nombre;

    //Null-30
    if(tipo=="Null")
    {
      nombre = "Null-30"
    }

    //Program 
    else if(tipo=="Programa")
    {
      data?.map((programas)=>(
        programas._id == idEvento && (nombre = programas.nombre) 
      ))
    }

    //Secondary
    else if(tipo=="Secondary")
    {
      data?.map((programas)=>(
        programas._id == idEvento && (nombre = programas.nombre) 
      ))
      

    }

     //Custom
     else if(tipo=="Custom")
     {
       nombre = idEvento;
     }

    
    //Custom
     else if(tipo=="TimeOut")
     {
       nombre = idEvento;
     }

      //Custom
      else if(tipo=="Programmer")
      {
        data14?.map((programmers)=>(
          programmers._id == idEvento && (nombre = programmers.Nombre) 
        ))
      }

    return  nombre;

  }

const transformarGenericSalida = ()=>{
  let normal = new Date(fechaBarra);
  let horas = new Date(fechaAuxGlobal).getHours();
  let minutos = new Date(fechaAuxGlobal).getMinutes();

  let nueva = new Date(normal).setHours(horas);
  let nueva2 = new Date(nueva).setMinutes(minutos);

  return new Date(nueva2);
}

const transformarGenericIn = ()=>{
  let normal = new Date(fechaBarra);
  let horas = new Date(fechaAuxGlobalIn).getHours();
  let minutos = new Date(fechaAuxGlobalIn).getMinutes();

  let nueva = new Date(normal).setHours(horas);
  let nueva2 = new Date(nueva).setMinutes(minutos);

  return new Date(nueva2);
}

  const add = async ()=>{

    if(estadoDia === "compensatorio")
    {
      toast.error("El trabajador tiene asignado un compensatorio para esta fecha, no se le puede asignar una programación");
      return;
    }

    if(estadoDia === "descanso")
    {
      toast.error("El trabajador ya tiene asignado un descanso, para asignar un turno primero elimine el descanso asignado");
      return;
    }

    if(estadoDia === "sugeridoGuardado")
    {
      toast.error("Ya existe el turno sugerido guardado para esta fecha. Use la escoba si desea crear un stack manual.");
      return;
    }

    if(estadoDia === "mixto")
    {
      toast.error("Hay turnos sugeridos y manuales mezclados en esta fecha. Limpie el día antes de continuar.");
      return;
    }

    //Evita altas duplicadas por doble clic
    if(guardandoRef.current) return;

    guardandoRef.current = true;

    try {
      const observacion = observationRef.current?.value ?? "";
      const { manuales, horaEsperada } = calcularCadenaManual();
      const esPrimerEvento = manuales.length === 0;
      const inicioPanel = enFechaPlaner(aFecha(startHour));
      const finPanel = enFechaPlaner(aFecha(EndHour));
      const validarCadena = !esPrimerEvento && Boolean(horaEsperada);

      const esMedianoche = (fecha) => {
        const valor = aFecha(fecha);
        return (
          !!valor &&
          valor.getHours() === 0 &&
          valor.getMinutes() === 0 &&
          valor.getSeconds() === 0
        );
      };

      const sumarUnDia = (fecha) => {
        const valor = aFecha(fecha);
        return valor ? new Date(valor.getTime() + 24 * 60 * 60 * 1000) : null;
      };

      let borrador = null;
      let mensajeExito = "Evento agregado al stack manual";
      let rangoCruce = null;

      const guardarEvento = async (borradores, mensaje = mensajeExito) => {
        const ultimoIndex = Number(manuales[manuales.length - 1]?.Index);
        const base = Number.isFinite(ultimoIndex) ? ultimoIndex : manuales.length;

        const lista = borradores.map((evento, posicion) => ({
          ...evento,
          Index: base + posicion + 1,
        }));

        const guardado = await reemplazarStackManual([...manuales, ...lista]);

        if (guardado) {
          if (observationRef.current) observationRef.current.value = "";
          toast.success(mensaje);
        }

        return guardado;
      };

      if(EVENTO == "pgm" || EVENTO == "secundary")
      {
        const referencia = EVENTO == "pgm" ? pgmRef : secRef;
        const idPrograma = referencia?.current?.value;

        if(!idPrograma || idPrograma == "none")
        {
          toast.error(EVENTO == "pgm"
            ? "Para agregar un Programa, primero seleccionelo de la lista desplegable"
            : "Para agregar un Evento Secundario, primero seleccionelo de la lista desplegable");
          return;
        }

        const programa = data?.find((item) => String(item?._id) === String(idPrograma));
        let inicioPrograma = enFechaPlaner(programa?.Start);

        if(!inicioPrograma)
        {
          toast.error("El evento seleccionado no tiene una hora de inicio válida");
          return;
        }

        //Un evento que abre el stack a las 00:00 pertenece al día siguiente.
        if(esPrimerEvento && esMedianoche(inicioPrograma))
        {
          inicioPrograma = sumarUnDia(inicioPrograma);
        }

        if(validarCadena && !mismaHoraMinuto(inicioPrograma, horaEsperada))
        {
          toast.error(`La hora de inicio debe ser ${formatearHora(horaEsperada)} para mantener la cadena del stack`);
          return;
        }

        borrador = {
          Type: EVENTO == "pgm" ? "Programa" : "Secondary",
          Event_name: idPrograma,
          ID_event: "------",
          Inicio_main: inicioPrograma,
          Out: "------",
          Observacion: observacion,
        };
        mensajeExito = EVENTO == "pgm"
          ? "Programa agregado al Stack"
          : "Evento secundario agregado al Stack";
      }

      else if(EVENTO == "req")
      {
        toast.error("Aun esta pendiente por implemetar el sistema de gestion de requerimientos...");
        return;
      }

      else if(EVENTO == "custom" || EVENTO == "timeout" || EVENTO == "programmer")
      {
        let inicio = inicioPanel;
        let fin = finPanel;

        //El primer Programmer arranca con la hora real del programador,
        //no con la hora del panel central.
        if(EVENTO == "programmer" && esPrimerEvento)
        {
          const idProgrammer = pgmRef.current?.value;
          const programmer = data14?.find(
            (item) => String(item?._id) === String(idProgrammer)
          );

          inicio = enFechaPlaner(programmer?.Time_in);
          fin = enFechaPlaner(programmer?.Time_out);

          if(!inicio || !fin)
          {
            toast.error("El programador seleccionado no tiene horas de inicio y fin válidas");
            return;
          }
        }

        //Si el evento abre el stack a las 00:00, pertenece al día siguiente.
        if(esPrimerEvento && esMedianoche(inicio))
        {
          inicio = sumarUnDia(inicio);
          fin = fin ? sumarUnDia(fin) : fin;
        }

        //Fin a las 00:00 o antes del inicio: termina al día siguiente.
        //La fecha del evento sigue siendo la del inicio.
        if(inicio && fin && fin.getTime() < inicio.getTime())
        {
          fin = sumarUnDia(fin);
        }

        if(!inicio || !fin || fin.getTime() <= inicio.getTime())
        {
          toast.error("La hora de salida debe ser mayor a la hora de inicio");
          return;
        }

        if(validarCadena && !mismaHoraMinuto(inicio, horaEsperada))
        {
          toast.error(`La hora de inicio debe ser ${formatearHora(horaEsperada)} para mantener la cadena del stack`);
          return;
        }

        rangoCruce = { inicio, fin };

        if(EVENTO == "custom")
        {
          const nombre = customRef.current?.value?.trim();

          if(!nombre)
          {
            toast.error("Para agregar un evento Custom, por favor, especifique un nombre descriptivo.");
            customRef.current?.focus();
            return;
          }

          borrador = {
            Type: "Custom",
            Event_name: nombre,
            ID_event: "------",
            Inicio_main: inicio,
            Out: fin.toISOString(),
            Observacion: observacion,
          };
          mensajeExito = "Evento custom agregado al Stack";
        }

        else if(EVENTO == "timeout")
        {
          borrador = {
            Type: "TimeOut",
            Event_name: "TimeOut",
            ID_event: "------",
            Inicio_main: inicio,
            Out: fin.toISOString(),
            Observacion: observacion,
          };
          mensajeExito = "Evento TimeOut agregado al Stack";
        }

        else
        {
          const idProgrammer = pgmRef.current?.value;

          if(!idProgrammer || idProgrammer == "none")
          {
            toast.error("Para agregar un evento Programmer, primero seleccionelo de la lista desplegable");
            return;
          }

          borrador = {
            Type: "Programmer",
            Event_name: idProgrammer,
            ID_event: "------",
            Inicio_main: inicio,
            Out: fin.toISOString(),
            Observacion: observacion,
          };
          mensajeExito = "Programmer agregado al Stack";
        }
      }

      else if(EVENTO == "null30")
      {
        //El primer Null-30 parte de la hora del panel central. En eventos
        //posteriores manda el fin del evento anterior.
        let inicioNull = esPrimerEvento
          ? inicioPanel
          : (enFechaPlaner(horaEsperada) ?? inicioPanel);

        //Un Null-30 que abre el stack a las 00:00 pertenece al día siguiente.
        if(esPrimerEvento && esMedianoche(inicioNull))
        {
          inicioNull = sumarUnDia(inicioNull);
        }

        if(!inicioNull)
        {
          toast.error("Seleccione una hora de inicio válida en el panel central");
          return;
        }

        borrador = {
          Type: "Null",
          Event_name: "Null-30",
          ID_event: "------",
          Inicio_main: inicioNull,
          Out: "------",
          Observacion: observacion,
        };
        mensajeExito = "Null-30 agregado al Stack";
      }

      else
      {
        if(mainEventRef.current.value == "" || mainEventRef.current.value == "none")
        {
          toast.error("Debe seleccionar un tipo de evento de la lista desplegable.");
          mainEventRef.current.focus();
        }
        return;
      }

      const medianoche = rangoCruce
        ? new Date(
            rangoCruce.inicio.getFullYear(),
            rangoCruce.inicio.getMonth(),
            rangoCruce.inicio.getDate() + 1,
            0,
            0,
            0,
            0
          )
        : null;

      const cruzaMedianoche =
        rangoCruce &&
        medianoche &&
        rangoCruce.fin.getTime() > medianoche.getTime();

      if(cruzaMedianoche)
      {
        const inicio = rangoCruce.inicio;
        const fin = rangoCruce.fin;
        const diaActual = inicio.toLocaleDateString("es-CO", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });
        const diaSiguiente = medianoche.toLocaleDateString("es-CO", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });

        const primeraParte = {
          ...borrador,
          Inicio_main: inicio,
          Out: medianoche.toISOString(),
          Observacion: observacion,
        };

        const segundaParte = {
          ...borrador,
          Inicio_main: medianoche,
          Out: fin.toISOString(),
          Observacion: "",
        };

        confirmarAccion({
          titulo: "El turno cruza la medianoche",
          contenido: `El turno de ${formatearHora(inicio)} a ${formatearHora(fin)} termina después de las 00:00. ¿Deseas dividirlo en dos registros? La parte de ${formatearHora(inicio)} a 00:00 quedará en ${diaActual} y la parte de 00:00 a ${formatearHora(fin)} quedará en ${diaSiguiente}.`,
          textoConfirmar: "Sí, dividir turno",
          textoCancelar: "No, cancelar",
          accion: async () => {
            if(guardandoRef.current) return;

            guardandoRef.current = true;

            try {
              await guardarEvento(
                [primeraParte, segundaParte],
                "Turno dividido y agregado al Stack"
              );
            } finally {
              guardandoRef.current = false;
            }
          },
        });
        return;
      }

      await guardarEvento([borrador]);
    } finally {
      guardandoRef.current = false;
    }
  }

  const del = ()=>{

   if(estadoDia !== "manual")
   {
      toast.error("Solo se puede eliminar un elemento de un stack manual");
      return;
   }

   const seleccionado = turnoSeleccionadoData;

   if(!seleccionado)
   {
      toast.error("Para eliminar un elemento del stack, primero debe seleccionarlo en el panel derecho");
      return;
   }

   confirmarAccion({
     titulo: "¿Eliminar el turno seleccionado?",
     contenido: "Se recalcularán las horas del stack manual para no dejar huecos entre los eventos.",
     textoConfirmar: "Sí, eliminar",
     accion: async () => {
       const restantes = turnosVisibles.filter(
         (turno) => String(turno?._id) !== String(seleccionado._id)
       );

       const exito = await reemplazarStackManual(restantes);

       if (exito) {
         setTurnoSeleccionado(null);
         IDITEMGLOBAL = "";
         toast.success(
           restantes.length === 0
             ? "Stack manual eliminado"
             : "Turno eliminado del stack"
         );
       }
     },
   });
  }




  const extraerHora = (fecha)=>{
    
    let hora = new Date(fecha);
    let horareal;

    if(hora.getMinutes()==0)
    {
      let minutosCorregidos = "00";
      horareal = hora.getHours()+":"+minutosCorregidos;
    }
    else{
      let minutosCorregidos = hora.getMinutes();
      horareal = hora.getHours()+":"+minutosCorregidos;
    }
    
    return horareal;
  }

  const eventMain = () =>{

    data?.map((pgm)=>(
        pgmRef.current.value == pgm._id && setStartHour(new Date(pgm.Start).getTime()),

      data?.map((pgm)=>(
        pgmRef.current.value == pgm._id && setEndHour(new Date(pgm.End).getTime()) 
     ))

   )) 
 
  }

  const eventSec = () =>{

    data?.map((pgm)=>(
        secRef.current.value == pgm._id && setStartHour(new Date(pgm.Start).getTime()),

      data?.map((pgm)=>(
        secRef.current.value == pgm._id && setEndHour(new Date(pgm.End).getTime()) 
     ))

   )) 
 
  }


  const eventProgrammer = () =>{

    data14?.map((pgm)=>(
        pgmRef.current.value == pgm._id && setStartHour(new Date(pgm.Time_in).getTime()),

      data14?.map((pgm)=>(
        pgmRef.current.value == pgm._id && setEndHour(new Date(pgm.Time_out).getTime()) 
     ))

   )) 
 
  }


  const resetPGM = () =>{

   toast.success("Información Horaria Actualizada"),
    EVENTO == "pgm" ||  EVENTO == "secundary" ? eventMain() : null
 
   }

   const resetSEC = () =>{

    toast.success("Información Horaria Actualizada"),
     EVENTO == "pgm" ||  EVENTO == "secundary" ? eventSec() : null
  
    }

   const resetPROGRAMMER = () =>{

    toast.success("Información Horaria Actualizada"),
     EVENTO == "programmer" ? eventProgrammer() : null
  
    }

  const reset1 = () =>{
   

  }

 

  const validateMonts = (mont)=>{
    if(mont == 0)
    {
        return "Enero";
    }
    else if(mont == 1){
      return "Febrero";
    }

    else if(mont == 2){
      return "Marzo";
    }

    else if(mont == 3){
      return "Abril";
    }

    else if(mont == 4){
      return "Mayo";
    }

    else if(mont == 5){
      return "Junio";
    }

    else if(mont == 6){
      return "Julio";
    }

    else if(mont == 7){
      return "Agosto";
    }

    else if(mont == 8){
      return "Septiembre";
    }

    else if(mont == 9){
      return "Octubre";
    }

    else if(mont == 10){
      return "Noviembre";
    }

    else if(mont == 11){
      return "Diciembre";
    }
  }

  
  const sumaDias = (fecha,dias)=>{
    return new Date(new Date(fecha).setDate( new Date (fecha).getDate()+parseInt(dias))).getDate();
  }

  const sumaMes = (fecha,dias)=>{
    return new Date(new Date(fecha).setDate( new Date (fecha).getDate()+parseInt(dias))).getMonth();
  }

  const sumaAño = (fecha,dias)=>{
    return new Date(new Date(fecha).setDate( new Date (fecha).getDate()+parseInt(dias))).getFullYear();
  }

 
 const obtenerFechaRules = ()=>{
  let fecha;

    data2?.map((item)=>(
      fecha = item.DiaPeriod
    ))

    return fecha;
 }

 const obtenerFechaRulesPlus = ()=>{
  let fecha;

    data2?.map((item)=>(
      fecha = new Date (item.DiaPeriod).setDate(new Date(item.DiaPeriod).getDate()+parseInt(obtenerDiaRules()))
    ))

    return fecha;
 }

 const obtenerDiaRules = ()=>{
  let dia;

    data2?.map((item)=>(
      dia = item.Dia
    ))

    return dia;
 }

 const entrando = (inicioPeriodo,finalPermiso)=>{
  fullPermisions=0;
  fullBreaks=0;
  fullIncapacitys = 0;
  fullRecess = 0;
  fullLicenses = 0;
  
  let totalDias = new Date(finalPermiso).getTime()-new Date(inicioPeriodo).getTime();

  fullPermisions = parseInt( totalDias/(1000*60*60*24) +1);
  fullBreaks = parseInt( totalDias/(1000*60*60*24) +1);
  fullIncapacitys = parseInt( totalDias/(1000*60*60*24) +1);
  fullRecess = parseInt( totalDias/(1000*60*60*24) +1);
  fullLicenses = parseInt( totalDias/(1000*60*60*24) +1);
  
 }

 const saliendo = (inicioPermiso,finalPeriodo)=>{
  fullPermisions=0;
  fullBreaks = 0;
  fullIncapacitys = 0;
  fullRecess = 0;
  fullLicenses = 0;
  
  let totalDias = new Date(finalPeriodo).getTime()-new Date(inicioPermiso).getTime();

  fullPermisions = parseInt( totalDias/(1000*60*60*24) +1);
  fullBreaks = parseInt( totalDias/(1000*60*60*24) +1);
  fullIncapacitys = parseInt( totalDias/(1000*60*60*24) +1);
  fullRecess = parseInt( totalDias/(1000*60*60*24) +1);
  fullLicenses = parseInt( totalDias/(1000*60*60*24) +1);
  
 }

 const dentro = (inicioPermiso,finalPermiso)=>{
  fullPermisions=0;
  fullBreaks = 0;
  fullIncapacitys = 0;
  fullRecess = 0;
  fullLicenses = 0;
  
  let totalDias = new Date(finalPermiso).getTime()-new Date(inicioPermiso).getTime();

  fullPermisions = parseInt( totalDias/(1000*60*60*24) +1);
  fullBreaks = parseInt( totalDias/(1000*60*60*24) +1);
  fullIncapacitys = parseInt( totalDias/(1000*60*60*24) +1);
  fullRecess = parseInt( totalDias/(1000*60*60*24) +1);
  fullLicenses = parseInt( totalDias/(1000*60*60*24) +1);
  
 }

 const todo = ()=>{
  fullPermisions=0;
  fullBreaks = 0;
  fullIncapacitys = 0;
  fullRecess = 0;
  fullLicenses = 0;
  
  fullPermisions = parseInt(data2?.[0]?.Dia ?? 0);
  fullBreaks = parseInt(data2?.[0]?.Dia ?? 0);
  fullIncapacitys = parseInt(data2?.[0]?.Dia ?? 0);
  fullRecess = parseInt(data2?.[0]?.Dia ?? 0);
  fullLicenses = parseInt(data2?.[0]?.Dia ?? 0);
  
 }

 
  const fullPermissionsUser = (idUser)=>{
    fullPermisions=0;

    data3?.map((item)=>(
    
     //PARA ENTRANDO
     new Date(item.FechaInicio).setHours(0,0,0,0) < new Date(obtenerFechaRules()).setHours(0,0,0,0) && new Date(item.FechaFinal).setHours(0,0,0,0) <  new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0)  && new Date(item.FechaFinal).setHours(0,0,0,0) > new Date(obtenerFechaRules()).setHours(0,0,0,0)  && item.Id_Empleado==idUser  ? entrando(new Date(obtenerFechaRules()).setHours(0,0,0,0),new Date(item.FechaFinal).setHours(0,0,0,0)) :null,
     
     //PARA SALIENDO
     new Date(item.FechaInicio).setHours(0,0,0,0) > new Date(obtenerFechaRules()).setHours(0,0,0,0) && new Date(item.FechaInicio).setHours(0,0,0,0) < new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && new Date(item.FechaFinal).setHours(0,0,0,0) > new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && item.Id_Empleado==idUser  ? saliendo(new Date(item.FechaInicio).setHours(0,0,0,0),new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0)) :null,

     //PARA DENTRO 
     new Date(item.FechaInicio).setHours(0,0,0,0) >= new Date(obtenerFechaRules()).setHours(0,0,0,0) && new Date(item.FechaInicio).setHours(0,0,0,0) <= new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) &&  new Date(item.FechaFinal).setHours(0,0,0,0)  >=  new Date(obtenerFechaRules()).setHours(0,0,0,0) &&  new Date(item.FechaFinal).setHours(0,0,0,0) <= new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && new Date(item.FechaInicio).setHours(0,0,0,0) <= new Date(item.FechaFinal).setHours(0,0,0,0) && new Date(item.FechaFinal).setHours(0,0,0,0) >= new Date(item.FechaInicio).setHours(0,0,0,0) && item.Id_Empleado==idUser ? dentro(new Date(item.FechaInicio).setHours(0,0,0,0),new Date(item.FechaFinal).setHours(0,0,0,0)) :null,

     //PARA CUBRE TODO
     new Date(item.FechaInicio).setHours(0,0,0,0) < new Date(obtenerFechaRules()).setHours(0,0,0,0) &&  new Date(item.FechaFinal).setHours(0,0,0,0) > new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && item.Id_Empleado==idUser ? todo() : null

    ))

    return fullPermisions;
  }

  const fullBreaksUser = (idUser)=>{
    fullBreaks=0;

    data4?.map((item)=>(
    
     //PARA ENTRANDO
     new Date(item.FechaInicio).setHours(0,0,0,0) < new Date(obtenerFechaRules()).setHours(0,0,0,0) && new Date(item.FechaFinal).setHours(0,0,0,0) <  new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0)  && new Date(item.FechaFinal).setHours(0,0,0,0) > new Date(obtenerFechaRules()).setHours(0,0,0,0)  && item.Id_Empleado==idUser  ? entrando(new Date(obtenerFechaRules()).setHours(0,0,0,0),new Date(item.FechaFinal).setHours(0,0,0,0)) :null,
     
     //PARA SALIENDO
     new Date(item.FechaInicio).setHours(0,0,0,0) > new Date(obtenerFechaRules()).setHours(0,0,0,0) && new Date(item.FechaInicio).setHours(0,0,0,0) < new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && new Date(item.FechaFinal).setHours(0,0,0,0) > new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && item.Id_Empleado==idUser  ? saliendo(new Date(item.FechaInicio).setHours(0,0,0,0),new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0)) :null,

     //PARA DENTRO 
     new Date(item.FechaInicio).setHours(0,0,0,0) >= new Date(obtenerFechaRules()).setHours(0,0,0,0) && new Date(item.FechaInicio).setHours(0,0,0,0) <= new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) &&  new Date(item.FechaFinal).setHours(0,0,0,0)  >=  new Date(obtenerFechaRules()).setHours(0,0,0,0) &&  new Date(item.FechaFinal).setHours(0,0,0,0) <= new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && new Date(item.FechaInicio).setHours(0,0,0,0) <= new Date(item.FechaFinal).setHours(0,0,0,0) && new Date(item.FechaFinal).setHours(0,0,0,0) >= new Date(item.FechaInicio).setHours(0,0,0,0) && item.Id_Empleado==idUser ? dentro(new Date(item.FechaInicio).setHours(0,0,0,0),new Date(item.FechaFinal).setHours(0,0,0,0)) :null,

     //PARA CUBRE TODO
     new Date(item.FechaInicio).setHours(0,0,0,0) < new Date(obtenerFechaRules()).setHours(0,0,0,0) &&  new Date(item.FechaFinal).setHours(0,0,0,0) > new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && item.Id_Empleado==idUser ? todo() : null

    ))

    return fullBreaks;
  }


  const fullIncapacitysUser = (idUser)=>{
    fullIncapacitys=0;

    data5?.map((item)=>(
    
     //PARA ENTRANDO
     new Date(item.FechaInicio).setHours(0,0,0,0) < new Date(obtenerFechaRules()).setHours(0,0,0,0) && new Date(item.FechaFinal).setHours(0,0,0,0) <  new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0)  && new Date(item.FechaFinal).setHours(0,0,0,0) > new Date(obtenerFechaRules()).setHours(0,0,0,0)  && item.Id_Empleado==idUser  ? entrando(new Date(obtenerFechaRules()).setHours(0,0,0,0),new Date(item.FechaFinal).setHours(0,0,0,0)) :null,
     
     //PARA SALIENDO
     new Date(item.FechaInicio).setHours(0,0,0,0) > new Date(obtenerFechaRules()).setHours(0,0,0,0) && new Date(item.FechaInicio).setHours(0,0,0,0) < new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && new Date(item.FechaFinal).setHours(0,0,0,0) > new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && item.Id_Empleado==idUser  ? saliendo(new Date(item.FechaInicio).setHours(0,0,0,0),new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0)) :null,

     //PARA DENTRO 
     new Date(item.FechaInicio).setHours(0,0,0,0) >= new Date(obtenerFechaRules()).setHours(0,0,0,0) && new Date(item.FechaInicio).setHours(0,0,0,0) <= new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) &&  new Date(item.FechaFinal).setHours(0,0,0,0)  >=  new Date(obtenerFechaRules()).setHours(0,0,0,0) &&  new Date(item.FechaFinal).setHours(0,0,0,0) <= new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && new Date(item.FechaInicio).setHours(0,0,0,0) <= new Date(item.FechaFinal).setHours(0,0,0,0) && new Date(item.FechaFinal).setHours(0,0,0,0) >= new Date(item.FechaInicio).setHours(0,0,0,0) && item.Id_Empleado==idUser ? dentro(new Date(item.FechaInicio).setHours(0,0,0,0),new Date(item.FechaFinal).setHours(0,0,0,0)) :null,

     //PARA CUBRE TODO
     new Date(item.FechaInicio).setHours(0,0,0,0) < new Date(obtenerFechaRules()).setHours(0,0,0,0) &&  new Date(item.FechaFinal).setHours(0,0,0,0) > new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && item.Id_Empleado==idUser ? todo() : null

    ))

    return fullIncapacitys;
  }


  const fullRecessUser = (idUser)=>{
    fullRecess = 0;

    data6?.map((item)=>(
    
     //PARA ENTRANDO
     new Date(item.FechaInicio).setHours(0,0,0,0) < new Date(obtenerFechaRules()).setHours(0,0,0,0) && new Date(item.FechaFinal).setHours(0,0,0,0) <  new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0)  && new Date(item.FechaFinal).setHours(0,0,0,0) > new Date(obtenerFechaRules()).setHours(0,0,0,0)  && item.Id_Empleado==idUser  ? entrando(new Date(obtenerFechaRules()).setHours(0,0,0,0),new Date(item.FechaFinal).setHours(0,0,0,0)) :null,
     
     //PARA SALIENDO
     new Date(item.FechaInicio).setHours(0,0,0,0) > new Date(obtenerFechaRules()).setHours(0,0,0,0) && new Date(item.FechaInicio).setHours(0,0,0,0) < new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && new Date(item.FechaFinal).setHours(0,0,0,0) > new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && item.Id_Empleado==idUser  ? saliendo(new Date(item.FechaInicio).setHours(0,0,0,0),new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0)) :null,

     //PARA DENTRO 
     new Date(item.FechaInicio).setHours(0,0,0,0) >= new Date(obtenerFechaRules()).setHours(0,0,0,0) && new Date(item.FechaInicio).setHours(0,0,0,0) <= new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) &&  new Date(item.FechaFinal).setHours(0,0,0,0)  >=  new Date(obtenerFechaRules()).setHours(0,0,0,0) &&  new Date(item.FechaFinal).setHours(0,0,0,0) <= new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && new Date(item.FechaInicio).setHours(0,0,0,0) <= new Date(item.FechaFinal).setHours(0,0,0,0) && new Date(item.FechaFinal).setHours(0,0,0,0) >= new Date(item.FechaInicio).setHours(0,0,0,0) && item.Id_Empleado==idUser ? dentro(new Date(item.FechaInicio).setHours(0,0,0,0),new Date(item.FechaFinal).setHours(0,0,0,0)) :null,

     //PARA CUBRE TODO
     new Date(item.FechaInicio).setHours(0,0,0,0) < new Date(obtenerFechaRules()).setHours(0,0,0,0) &&  new Date(item.FechaFinal).setHours(0,0,0,0) > new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && item.Id_Empleado==idUser ? todo() : null

    ))

    return fullRecess;
  }

  const fullLicensesUser = (idUser)=>{
    fullLicenses = 0;

    data7?.map((item)=>(
    
     //PARA ENTRANDO
     new Date(item.FechaInicio).setHours(0,0,0,0) < new Date(obtenerFechaRules()).setHours(0,0,0,0) && new Date(item.FechaFinal).setHours(0,0,0,0) <  new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0)  && new Date(item.FechaFinal).setHours(0,0,0,0) > new Date(obtenerFechaRules()).setHours(0,0,0,0)  && item.Id_Empleado==idUser  ? entrando(new Date(obtenerFechaRules()).setHours(0,0,0,0),new Date(item.FechaFinal).setHours(0,0,0,0)) :null,
     
     //PARA SALIENDO
     new Date(item.FechaInicio).setHours(0,0,0,0) > new Date(obtenerFechaRules()).setHours(0,0,0,0) && new Date(item.FechaInicio).setHours(0,0,0,0) < new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && new Date(item.FechaFinal).setHours(0,0,0,0) > new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && item.Id_Empleado==idUser  ? saliendo(new Date(item.FechaInicio).setHours(0,0,0,0),new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0)) :null,

     //PARA DENTRO 
     new Date(item.FechaInicio).setHours(0,0,0,0) >= new Date(obtenerFechaRules()).setHours(0,0,0,0) && new Date(item.FechaInicio).setHours(0,0,0,0) <= new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) &&  new Date(item.FechaFinal).setHours(0,0,0,0)  >=  new Date(obtenerFechaRules()).setHours(0,0,0,0) &&  new Date(item.FechaFinal).setHours(0,0,0,0) <= new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && new Date(item.FechaInicio).setHours(0,0,0,0) <= new Date(item.FechaFinal).setHours(0,0,0,0) && new Date(item.FechaFinal).setHours(0,0,0,0) >= new Date(item.FechaInicio).setHours(0,0,0,0) && item.Id_Empleado==idUser ? dentro(new Date(item.FechaInicio).setHours(0,0,0,0),new Date(item.FechaFinal).setHours(0,0,0,0)) :null,

     //PARA CUBRE TODO
     new Date(item.FechaInicio).setHours(0,0,0,0) < new Date(obtenerFechaRules()).setHours(0,0,0,0) &&  new Date(item.FechaFinal).setHours(0,0,0,0) > new Date(obtenerFechaRulesPlus()).setHours(0,0,0,0) && item.Id_Empleado==idUser ? todo() : null

    ))

    return fullLicenses;
  }


   const reset = ()=>{
    totalGrupo=0;
   }
   

   const antes = ()=>{
    //La rama "antes" no predice el turno sugerido: la vista muestra
    //únicamente lo que ya esté guardado para esa fecha.
    return "Respuesta desde antes"
   }


  useEffect(() => {
    const fecha =  Date.now();
      const hoy = new Date(fecha);
      setDate(hoy.toDateString());
  },[]);

  useEffect(() => {
   setIDUSER(iduser);
   setFECHA(fechaPlaner);
  },[iduser,fechaPlaner]);


  const ciclo = (totalgrupo,actual,domingos,idGrupo,isFijo,nombre,sid)=>{

    let index = actual;
    let turno = "";
    const esFijo = isFijo === true || isFijo === "true" || isFijo === 1;

    //Solo las rotaciones de los trabajadores no fijos participan.
    //Se eliminan duplicados para que la secuencia no se repita.
    arrayVariables = [...new Set(arrayVariables.map(Number))].sort((a, b) => a - b);

    //Número de semanas completas transcurridas
    for(let i=0; i<domingos; i++ )
    {
      if(!esFijo && arrayVariables.length > 0)
      {
        const posicion = arrayVariables.indexOf(Number(actual));

        if(posicion !== -1)
        {
          actual = arrayVariables[(posicion + 1) % arrayVariables.length];
          index = actual;
        }
      }
      else if(esFijo)
      {
        index = actual;
      }
    }
    
  
    arrayVariables=[]; 
  
  
  
  
  
  
  
  
  
  
    //-------------------------------------------------------------------------------------------------------------------------------
       //Segun el index obtenido busco el nombre del schema y lo muestro 
    //-------------------------------------------------------------------------------------------------------------------------------
    data9?.map((schemas)=>
    (
      idGrupo == schemas.Grupo_ID && schemas.Order == index && schemas.Tipo == "Entre Semana" &&
        (turno = schemas.Nombre, IDSCHEMAGLOBAL = schemas._id )
      
    ))
  
    
  
    //para el proceso de turno fijo debo validar si isfijo == a true, false o undefined  
    return turno;  /*+ "  ----- " + (domingos == 0 ? "Semana actual" :  domingos == 1 ? domingos +" Semana " : domingos + " Semanas ");*/
  }

  //Estado de la fecha frente al período de evaluación de Rules.
  //Es independiente del trabajador: no usa dayKey ni el esquema.
  const obtenerEstadoPeriodo = (idUsuario, fechaReferencia = fechaPlaner) => {
    const regla = data2?.[0];
    const referencia = aFecha(fechaReferencia);

    const textoPeriodo = String(regla?.DiaPeriod ?? "");
    const partesPeriodo = textoPeriodo.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const inicioPeriodo = partesPeriodo
      ? new Date(
          Number(partesPeriodo[1]),
          Number(partesPeriodo[2]) - 1,
          Number(partesPeriodo[3])
        )
      : aFecha(regla?.DiaPeriod);

    if (!regla || !referencia || !inicioPeriodo) {
      return "sin-rotacion";
    }

    const inicio = new Date(
      inicioPeriodo.getFullYear(),
      inicioPeriodo.getMonth(),
      inicioPeriodo.getDate()
    );
    const fin = new Date(inicio.getTime());
    fin.setDate(inicio.getDate() + (Number(regla.Dia) || 0));

    const fecha = new Date(
      referencia.getFullYear(),
      referencia.getMonth(),
      referencia.getDate()
    );

    if (fecha.getTime() < inicio.getTime()) return "antes";
    if (fecha.getTime() > fin.getTime()) return "despues";
    return "entre";
  };

  const Pronostico = (PAYROLLID)=>{ 
    IDSCHEMAGLOBAL = "";
    const periodo = obtenerEstadoPeriodo(PAYROLLID, fechaPlaner);

    if(periodo === "antes")
    {
      return "Respuesta desde antes";
    }

    if(periodo === "sin-rotacion")
    {
      return "Sin rotación";
    }

    data10.map((rotationsManager)=>(
      PAYROLLID == rotationsManager.userId  &&  
  
        //TRAIGO LA INFORMACION NECESARIA PARA LUEGO USARLA
        //Traigo el dia clave
        (
          DiaClave = new Date(rotationsManager.dayKey).setHours(0,0,0,0),
          totalSche = rotationsManager.totalSchema,
          totalGP = rotationsManager.totalGrupo,
          actual = rotationsManager.actual,
          globalIdGroup = rotationsManager.groupId
        ) 
        
    ))

    //Turnos variables del grupo: solo personal no fijo, sin duplicados.
    data10?.forEach((RM) => {
      const esFijo = RM.fijo === true || RM.fijo === "true" || RM.fijo === 1;

      if (
        RM.groupId == globalIdGroup &&
        !esFijo &&
        RM.actual != 0 &&
        !arrayVariables.includes(RM.actual)
      ) {
        arrayVariables.push(RM.actual);
      }
    });

    //Tanto “entre” como “después” avanzan por semanas completas.
    //“Antes” ya salió arriba y no predice.
    if(periodo === "entre" || periodo === "despues")
    {
      return despues(null, null, DiaClave, totalSche, totalGP, actual, PAYROLLID);
    }

   
  
  
  
    //OPERACIONES PARA DETERMINAR LOS RANGOS DE LA SEMANA EN QUE SE ENCUENTRA EL TRABAJADOR
    /***************************************************************************************** */
  
    //DayKey aumentado 8 dias, es decir una semana
    let daykeyPlus = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+8);
  
    //Traer cual es el nombre del dia "Lunes..martes.." del dayKey  1 Lunes, 2 Martes, 3 Miercoles, 4 Jueves, 5 Viernes, 6 Sabado, 0 Domingo
    let NombreDia = new Date(DiaClave).getUTCDay();
  
    //Traigo el # del dia "1,3,5" del dayKey
    let diaDayKey = new Date(DiaClave).getDate();
  
    //Traigo el mes "0,1,2 hasta 11 que es diciembre" del dayKey
    let mesDayKey = new Date(DiaClave).getMonth();
  
    //Traigo el año del dayKey
    let añoDayKey = new Date(DiaClave).getFullYear();
  
  
     //VALIDACION PARA SABER SI EL DIA DEL (diaclave) ESTA ENTRE SEMANA O FIN DE SEMANA
          //--------------------------------------------------------------------------
          //Defino la nueva fecha de inicio de semana segun DiaClave
          let fechaInicioSemana;
          let fechaFinalSemana;
  
          let respuesta;
  
           /*Esta instruccion define un dia entre semana, es decir de lunes a viernes*/
           NombreDia <= 5 && NombreDia >= 1 
           ? NombreDia == 1 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+0) , fechaFinalSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+4)) :     //Lunes
             NombreDia == 2 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-1) , fechaFinalSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+3)) :     //Martes
             NombreDia == 3 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-2) , fechaFinalSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+2)) :     //Miercoles
             NombreDia == 4 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-3) , fechaFinalSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+1)) :     //Jueves
             NombreDia == 5 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-4) , fechaFinalSemana = new Date(DiaClave)): null                                         //Viernes
  
             //Como no es entre semana si no (6) que es sabado, o (0) que es domingo pues seteo como corresponde
           :  
              NombreDia == 6 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-5) , fechaFinalSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-1)) :          //Sabado
              NombreDia == 0 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-6) , fechaFinalSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-2)) : null     //Domingo           
  
  
          //Ya obtenido las fechas de inicio y final de la semana segun el dia clave procedo a operar con la fecha actual según sea el caso "menor,actual,mayor (antes-entre-despues)" - es necesario recordar
          //que des alguna de estas tres opciones por el dia actual con respecto al dia clave ejemplo:  si el dia actual es menor que el dia clave entonces se usara la funcion "antes", si el dia actual es
          //mayor al dia clave, se usara la funcion despues, y si el dia actual corresponde a la semana del dia clave, se usara la funcion "entre"
          
          let fechaActual = new Date(fechaPlaner).setHours(0,0,0,0);
  
            //validacion 1 (si la fecha actual eesta dentro de del rango de fechas de inicio y final del dia clave)
            fechaActual >= fechaInicioSemana && fechaActual <= fechaFinalSemana 
            ? 
              //La fecha actual esta dentro del rango de inicio y final 
              //NO HAGO NADA YA QUE LA INFORMACION EN LA BASE DE DATOS DEBE SEGUIR IGUAL
              respuesta = entre(PAYROLLID,fechaInicioSemana,fechaFinalSemana)
              
            : 
              //La fecha actual NO esta dentro del rango de inicio y final, y como no corresponde, entonces valido si es menor o mayor
              fechaActual < fechaInicioSemana
              ?
                //Es MENOR pero debo preguntar si es sabado o domingo para operar segun corresponda
                new Date().getUTCDay() == 6 || new Date().getUTCDay() == 0 
                ?
                  console.log("La fecha actual es menor y es fin de semana " + new Date(fechaInicioSemana).toLocaleString() + "--" + new Date(fechaFinalSemana).toLocaleString())
                :
                
                //console.log("La fecha actual es menor y entre semana " + new Date(fechaInicioSemana).toLocaleString() + "--" + new Date(fechaFinalSemana).toLocaleString()) 
                respuesta = antes()
                
              : 
                //Es MAYOR pero debo preguntar si es sabado o domingo para operar segun corresponda
                fechaActual > new Date(fechaFinalSemana).setHours(0,0,0,0)  
              &&
                  new Date().getUTCDay() == 6 || new Date().getUTCDay() == 0 
                   ?
                     //console.log("La fecha actual es MAYOR y es fin de semana " +  new Date(fechaInicioSemana).toLocaleString() + "--" + new Date(fechaFinalSemana).toLocaleString())
                     respuesta = "FS PENDIENTE POR IMPLEMENTAR"
                   : 
                     respuesta = despues(fechaInicioSemana,fechaFinalSemana,DiaClave,totalSche,totalGP,actual,PAYROLLID)
  
  
              return respuesta;
   } 

   const entre = (idUsuario,FECHAINICIO,FECHAFINAL)=>{
    //console.log("LA FECHA ACTUAL CORRESPONDE A LA SEMANA ACTUAL " + new Date(FECHAINICIO).toDateString() + " ---- " + new Date(FECHAFINAL).toDateString())
    
    let turno = "";
  
    //HAGO LA OPERACION PARA TRAER EL TURNO EN EL QUE DEBE ESTAR EL USUARIO EN LA SEMANA QUE ES (ACTUAL) POR QUE ESTA "ENTRE"
    data10?.map((rotationsManager)=>(
      idUsuario==rotationsManager.userId && (turno = rotationsManager.SchemaName, IDSCHEMAGLOBAL = rotationsManager.schemaId)
    ))
  

    return turno
  
  }


  const despues = (FECHAINICIO,FECHAFINAL,DIACLAVE,TOTALSCHEMA,TOTALGP,ACTUAL,idUsuario)=>{
    //para el despues tambien debo contar cuantas semanas han pasado y hacer la operacion correcta simplemete que no debo actualizar nada 
    //en la base de datos si no solo mostrar en que turno estaria el trabajador para esa fecha
  
    //Se cuentan semanas completas: el domingo de la semana en curso no
    //adelanta la rotación; solo el paso al lunes siguiente.
    const inicio = aFecha(DIACLAVE);
    const fin = aFecha(fechaPlaner);

    let Domingos = 0;

    if (inicio && fin) {
      const inicioDia = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
      const finDia = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate());
      const diasPasados = Math.floor(
        (Date.UTC(finDia.getFullYear(), finDia.getMonth(), finDia.getDate()) -
          Date.UTC(inicioDia.getFullYear(), inicioDia.getMonth(), inicioDia.getDate())) /
          (1000 * 60 * 60 * 24)
      );

      Domingos = diasPasados > 0 ? Math.floor(diasPasados / 7) : 0;
    }
  
    
  
    //Por ultimo hagao las operaciones para saber en que turno estaria el trabajador en la fecha escogida
  
      let pronostico;
      
      //hago el pronostico 
      data10?.map((rotationsManager)=>(
        idUsuario==rotationsManager.userId && (
          pronostico=ciclo(rotationsManager.totalGrupo,rotationsManager.actual,Domingos,rotationsManager.groupId,rotationsManager.fijo,rotationsManager.userName,rotationsManager.schemaId)
        )
      ))
  
  
      return pronostico;
  
    
  }

  

 const ejecutarOk = async () => { 

    //Se revalida el día justo antes de escribir: entre la confirmación y la
    //acción el estado pudo cambiar (compensatorio, descanso u otro stack).
    const compensatoriosActuales = (await obtenerCompensatorios()) ?? [];

    if (compensatorioEnFecha(compensatoriosActuales, iduser, fechaPlaner)) {
      toast.error("El trabajador ya tiene asignado un compensatorio para esta fecha, no se le puede asignar una programación");
      return;
    }

    if (rangoCubreFecha(data4, iduser, fechaPlaner)) {
      toast.error("El trabajador ya tiene asignado un descanso, para asignar un turno primero elimine el descanso asignado");
      return;
    }

    const items = [...(data11 ?? [])]
      .filter((stack) => String(stack?.ID_esquema) === String(IDSCHEMAGLOBAL))
      .sort((a, b) => (Number(a?.Order) || 0) - (Number(b?.Order) || 0));

    if (items.length === 0) {
      toast.error("No hay un stack sugerido configurado para el turno de este trabajador");
      return;
    }

    //Respaldo: conserva el guardado anterior si la cadena no se puede calcular.
    const guardarSugeridoAnterior = async () => {
      const promesas = (data11 ?? []).map((stacks, index) => {
        if (String(stacks.ID_esquema) === String(IDSCHEMAGLOBAL)) {
          return crear(
            iduser,
            nombres,
            index,
            stacks.ID_programa,
            stacks._id,
            "Brown",
            observationRef.current?.value ?? "",
            new Date(fechaPlaner),
            stacks.ID_esquema,
            inicioMain,
            "------",
            stacks.Type,
            stacks.Value
          );
        }
        return null;
      });

      await Promise.all(promesas);
      await recargarTurnos();
      await recargarShiftsDay();
      await recargarShiftsFull();

      if (observationRef.current?.value === "") {
        observationRef.current.value = "-----";
      }

      setAuxiliar(!auxiliar);
      toast.success("Stack sugerido agregado correctamente");
    };

    const usarRespaldo = async (motivo) => {
      await guardarSugeridoAnterior();
      toast(motivo);
    };

    const inicioNormalizado = enFechaPlaner(
      horaInicioRotacion() ?? horaInicioSchema(data9, IDSCHEMAGLOBAL)
    );

    if (!inicioNormalizado) {
      await usarRespaldo("No se pudo calcular la hora inicial; el stack se guardó con el método anterior.");
      return;
    }

    //Cada evento empieza donde termina el anterior. La cadena puede cruzar
    //la medianoche; por eso se guardan las fechas reales de Inicio y Out.
    const cadena = construirCadena(
      items,
      inicioNormalizado,
      fechaPlaner,
      (item) =>
        duracionDeElemento(item, {
          programs: data,
          programmers: data14,
        })
    );

    if (cadena.filas.some((fila) => fila.duracionMin <= 0)) {
      await usarRespaldo("No se pudieron calcular todas las duraciones; el stack se guardó con el método anterior.");
      return;
    }

    const observacion =
      (observationRef.current?.value ?? "").trim() || "-----";

    const payloads = cadena.filas.map((fila, posicion) => {
      const item = fila.item;
      const guardaHora =
        item.Type === "Custom" ||
        item.Type === "TimeOut" ||
        item.Type === "Programmer";

      return {
        idUser: iduser,
        nombres,
        index: fila.orden,
        idPrograma: item.ID_programa,
        eventId: item._id ?? "------",
        color: "Brown",
        observacion: posicion === 0 ? observacion : "-----",
        fechaClave: new Date(fechaPlaner),
        idSchema: item.ID_esquema,
        inicioMain: fila.inicio,
        out: guardaHora && fila.fin ? fila.fin.toISOString() : "------",
        tipo: item.Type,
      };
    });

    //Reemplaza el día completo para no dejar turnos a medias si algo falla.
    const guardado = await reemplazarTurnosDeFecha(payloads, {
      userId: iduser,
      fecha: fechaPlaner,
    });

    if (!guardado) return;

    if (observationRef.current) observationRef.current.value = "";

    await Promise.all([
      recargarShiftsFull(),
      recargarShiftsDay(),
    ]);
    setAuxiliar(!auxiliar);
    toast.success("Stack sugerido agregado correctamente");
  }

  const ok = () => {

    if (esTurnoAnterior) {
      toast.error("Esta fecha es anterior a la rotación. No hay un turno sugerido para aceptar.");
      return;
    }

    if(estadoDia === "compensatorio")
    {
      toast.error("El trabajador ya tiene asignado un compensatorio para esta fecha, no se le puede asignar una programación");
      return;
    }

    if(estadoDia === "descanso")
    {
      toast.error("El trabajador ya tiene asignado un descanso, para asignar un turno primero elimine el descanso asignado");
      return;
    }

    if(estadoDia === "mixto")
    {
      toast.error("Hay turnos manuales y sugeridos mezclados en esta fecha. Limpie el día antes de continuar.");
      return;
    }

    if(estadoDia === "sugeridoGuardado")
    {
      toast.error("Ya existe el turno sugerido guardado para esta fecha. Use la escoba si desea limpiarlo.");
      return;
    }

    if(estadoDia === "manual")
    {
      toast.error("Hay un stack manual en esta fecha. Use la escoba si desea volver al turno sugerido.");
      return;
    }

    if(estadoDia !== "vacio")
    {
      toast.error("Ya hay un turno asignado para esta fecha. Límpielo con la escoba si desea volver a programar.");
      return;
    }

    if(sinRotacion)
    {
      toast.error("El trabajador no tiene una rotación configurada; no hay turno sugerido que asignar");
      return;
    }

    if(!IDSCHEMAGLOBAL)
    {
      toast.error("El trabajador no tiene un turno según rotación configurado para esta fecha");
      return;
    }

    if(!(data11 ?? []).some((stack) => String(stack.ID_esquema) === String(IDSCHEMAGLOBAL)))
    {
      toast.error("No hay un stack sugerido configurado para el turno de este trabajador");
      return;
    }

    confirmarAccion({
      titulo: "¿Guardar el turno sugerido según rotación?",
      contenido: "Se asignarán los eventos del turno actual con sus horas encadenadas. Después no se podrá crear un stack manual sin limpiar el día.",
      textoConfirmar: "Sí, guardar",
      accion: ejecutarOk,
    });
  }

 const regalo = async () => {

    if(estadoDia === "compensatorio")
    {
      toast.error("El trabajador ya tiene asignado un compensatorio para esta fecha");
      return;
    }

    if(estadoDia === "descanso")
    {
      toast.error("El trabajador ya tiene asignado un descanso para esta fecha, primero elimine el descanso asignado");
      return;
    }

    if(estadoDia !== "vacio")
    {
      toast.error("Solo se puede asignar un compensatorio cuando el día no tiene un turno programado");
      return;
    }

    try {
      // 1. Traemos los compensatorios actualizados antes de validar
      const compensatoriosActuales = (await obtenerCompensatorios()) ?? [];

      // Variables locales de validación para evitar problemas de sincronía con estados globales
      let turnoAsignadoPreviamente = false;
      let compensatorioAsignadoPreviamente = false;

      // Valido que no haya un turno registrado previamente en shifts (data12)
      data12.map((shifts) => {
        if (shifts.Fecha_clave == new Date(fechaPlaner).toISOString() && shifts.ID_user == iduser) {
          turnoAsignadoPreviamente = true;
        }
      });

      // Valido que no se haya asignado un compensatorio al trabajador en la fecha
      compensatoriosActuales?.forEach((compensatory) => {
        if (compensatory.FechaInicio && new Date(compensatory.FechaInicio).toISOString() === new Date(fechaPlaner).toISOString() && compensatory.Id_Empleado === iduser) {
          compensatorioAsignadoPreviamente = true;
        }
      });

      if (turnoAsignadoPreviamente) {
        setIDUSER(iduser);
        toast.error("El trabajador ya tiene asignado un turno para la fecha actual, para asignar un descanso, primero elimine el turno asignado");
      } else if (compensatorioAsignadoPreviamente) {
        toast.error("El trabajador ya tiene asignado un compensatorio para esta fecha, no es necesario confirmarla");
      } else {
        // Obtenemos el usuario autenticado que inició sesión desde localStorage
        const storedUser = JSON.parse(localStorage.getItem('userAuth') || '{}');
        const loggedUserName = storedUser.nombres && storedUser.apellidos 
          ? `${storedUser.nombres} ${storedUser.apellidos}` 
          : (storedUser.nombre || "Usuario");

        confirmarAccion({
          titulo: "¿Asignar un compensatorio al trabajador?",
          contenido: "Se registrará un compensatorio para la fecha seleccionada y no se podrá programar un turno ese día.",
          textoConfirmar: "Sí, asignar",
          accion: async () => {
            await crearCompensatorio({
                nombre: "Compensatorio General",
                año: new Date(fechaBarra).getFullYear().toString(),
                fechainicio: new Date(fechaPlaner).toISOString(),
                fechafinal: new Date(fechaPlaner).toISOString(),
                observacion: "Este es un compensatorio asignado directamente desde el programador de turnos",
                estado: true,
                nombreempleado: loggedUserName,
                idempleado: iduser,
            });

            // Notificamos el cambio al contexto para refrescar listados
            setAuxiliar(!auxiliar);
            toast.success("Se asignó un compensatorio al trabajador");
          },
        });
      }

    } catch (error) {
      console.error("Error al procesar el compensatorio:", error);
      toast.error("Error al registrar el compensatorio");
    }
  };

  const clean = ()=>{

    if(estadoDia === "compensatorio")
    {
      toast.error("El trabajador tiene asignado un compensatorio para esta fecha, no se puede limpiar el turno desde aquí");
      return;
    }

    if(estadoDia === "descanso")
    {
      toast.error("El trabajador ya tiene asignado un descanso para esta fecha, para realizar cualquier otra acción primero elimine el descanso asignado");
      return;
    }

    if(estadoDia === "vacio")
    {
      confirmarAccion({
        titulo: "¿Limpiar el stack sugerido mostrado?",
        contenido: "No hay turnos guardados para esta fecha; solo se limpiará la vista del stack sugerido.",
        textoConfirmar: "Sí, limpiar",
        accion: () => toast.success("Vista del stack sugerido limpiada"),
      });
      return;
    }

    const titulo =
      estadoDia === "sugeridoGuardado"
        ? "¿Eliminar el turno sugerido guardado?"
        : estadoDia === "mixto"
          ? "¿Eliminar los turnos de esta fecha?"
          : "¿Eliminar el stack manual de esta fecha?";

    confirmarAccion({
      titulo,
      contenido: "Una vez eliminado no podrá recuperarse. Si el stack no está guardado, se perderá.",
      textoConfirmar: "Sí, eliminar",
      accion: limpiarTodo,
    });
  }

  const stack = ()=>{

    if(estadoDia === "compensatorio")
    {
      toast.error("El trabajador tiene asignado un compensatorio para esta fecha, no se puede traer el turno sugerido");
      return;
    }

    if(estadoDia === "descanso")
    {
      toast.error("El trabajador ya tiene asignado un descanso para esta fecha, para realizar cualquier otra acción primero elimine el descanso asignado");
      return;
    }

    if(estadoDia === "sugeridoGuardado")
    {
      toast.error("El turno sugerido ya está guardado para esta fecha. Use la escoba si desea limpiarlo.");
      return;
    }

    if(estadoDia === "manual" || estadoDia === "mixto")
    {
      confirmarAccion({
        titulo: "¿Traer el turno sugerido según rotación?",
        contenido: "El stack manual actual se eliminará para volver al turno sugerido. Si no está guardado, se perderá.",
        textoConfirmar: "Sí, traer sugerido",
        accion: async () => {
          await limpiarTodo();
          recargarStacks();
          recargarRotations();
        },
      });
      return;
    }

    recargarStacks();
    recargarRotations();
    toast.success("Stack según turno actualizado");
  }

  const getDurationprogram = (start, end) =>{
    let diferencia;
    var fechaInicio = new Date(start).getTime();
    var fechaFin    = new Date(end).getTime();

    diferencia = fechaFin - fechaInicio;
    return  (diferencia/1000)/60;

  }

  const getDurationprogram2 = (idEvento) =>{

    let inicio;
    let salida;

    data?.map((programas)=>(
      programas._id == idEvento && (inicio = programas.Start, salida = programas.End) 
    ))

    let diferencia;
    var fechaInicio = new Date(inicio).getTime();
    var fechaFin    = new Date(salida).getTime();

    diferencia = fechaFin - fechaInicio;
    return  (diferencia/1000)/60;

  }

  const getDurationCustom = (inicio,salida) =>{

    let diferencia;
    var fechaInicio = new Date(inicio).getTime();
    var fechaFin    = new Date(salida).getTime();

    diferencia = fechaFin - fechaInicio;
    return  (diferencia/1000)/60;

  }

 

  const resolver = (id,tipo,idPrograma,duracion,orden,valor)=>{

    

    if(id == "Null-30")
    {
    
        //Sumo tiempos
        auxOut = new Date(new Date(HORAINGLOBAL).setMinutes(new Date(HORAINGLOBAL).getMinutes() + 30)).getTime();
        HORAINGLOBAL = new Date(auxOut);
        auxOut = new Date(auxOut).toLocaleTimeString();
        
        
        return <span className='nulo'>{"Null-30"}</span>
    }

    else if(id == "Turno Custom" || tipo == "Custom")
    {
      DURACIONGLOBAL = duracion;
       //Sumo tiempos
       auxOut = new Date(new Date(HORAINGLOBAL).setMinutes(new Date(HORAINGLOBAL).getMinutes() + parseInt(duracion))).getTime();
       HORAINGLOBAL = new Date(auxOut);
       auxOut = new Date(auxOut).toLocaleTimeString();

       //return <span className='Tcustom'>{idPrograma + " (" + parseInt(duracion) + " Minutos)"}</span>
       return <span className='Tcustom'>{idPrograma} <span className='customDuration'>{ " (" + parseInt(duracion) + " Minutos)"}</span></span>
    }

    else if(id == "TimeOut")
    {
      

        //Sumo tiempos
        auxOut = new Date(new Date(HORAINGLOBAL).setMinutes(new Date(HORAINGLOBAL).getMinutes() + parseInt(valor))).getTime();
        HORAINGLOBAL = new Date(auxOut);
        auxOut = new Date(auxOut).toLocaleTimeString();

        return "TimeOut " + valor + " Minutos";
    }

    else if(tipo == "Secondary")
    {
      
      let PGM;
      let DURACION;

       data?.map((pgm)=>(
        pgm._id == idPrograma && (PGM = pgm.nombre, DURACION = getDurationprogram(pgm.Start,pgm.End))
       ))

       //Sumo tiempos
       auxOut = new Date(new Date(HORAINGLOBAL).setMinutes(new Date(HORAINGLOBAL).getMinutes() + parseInt(DURACION))).getTime();
       HORAINGLOBAL = new Date(auxOut);
       auxOut = new Date(auxOut).toLocaleTimeString();
       
       return <span className='TSecondary'>{PGM}<span className='SecondaryDuration'>{" (" +DURACION + " Minutos)"}</span></span>
    }

    else if(tipo == "Programa")
    {

      let PGM;
      let DURACION;

       data?.map((pgm)=>(
        pgm._id == idPrograma && (PGM = pgm.nombre, DURACION = getDurationprogram(pgm.Start,pgm.End))
       ))

       //Sumo tiempos
       auxOut = new Date(new Date(HORAINGLOBAL).setMinutes(new Date(HORAINGLOBAL).getMinutes() + parseInt(DURACION))).getTime();
       HORAINGLOBAL = new Date(auxOut);
       auxOut = new Date(auxOut).toLocaleTimeString();

       return <span className='TProgram'>{PGM + " "}<span className='pgmDuration'>{" (" + DURACION + " Minutos)"}</span></span> 
      
    }

    else{

      return "ERROR TURNO NO ESPECIFICADO";
    }

    
  }

  const devolverIN = () => {
    const schemaEncontrado = data9?.find((rotations) => rotations._id === IDSCHEMAGLOBAL);

    let respuesta = "--:--:--";

    if (schemaEncontrado && schemaEncontrado.HoraInicio) {
      respuesta = schemaEncontrado.HoraInicio;
      HORAINGLOBAL = schemaEncontrado.HoraInicio;
    }

    const fechaObj = new Date(respuesta);
    inicioMain = fechaObj;
    
    if (isNaN(fechaObj.getTime())) return "--:--:--";

    // Extraemos horas, minutos y segundos por separado
    let horas = fechaObj.getHours();
    let minutos = fechaObj.getMinutes();
    let segundos = fechaObj.getSeconds();

    // Les aplicamos formato de doble dígito (agregando el '0' si son menores a 10)
    let horaFormateada = 
      (horas < 10 ? "0" + horas : horas) + ":" +
      (minutos < 10 ? "0" + minutos : minutos) + ":" +
      (segundos < 10 ? "0" + segundos : segundos);
    
    return horaFormateada;
   }

   const fullTime = () =>{

    
    let dr=0;
    let D= 10;
    

    data11?.map((stack)=>(

      data?.map((pgm)=>(
        pgm._id == stack.ID_programa && ( D = getDurationprogram(pgm.Start,pgm.End))
       )),

      stack.ID_esquema == IDSCHEMAGLOBAL 
      ?
        stack.ID_programa == "Null-30" ? dr = dr + 30 : 

        stack.ID_programa == "Turno Custom" || stack.Type == "Custom" ? dr = dr + parseInt(stack.Duration) : 

        stack.ID_programa == "TimeOut" ? dr = dr + parseInt(stack.Value) : 

        stack.Type == "Secondary" ? dr = dr + parseInt(D) :

        stack.Type == "Programa" ? dr = dr + parseInt(D) : null

       

      :
      null
    ))

    return dr; 
  }
   
  
  const traerSustituto = () =>{

    let respuesta = "";

    data13?.map((substitution)=>(
      substitution.ID_user_main == iduser && substitution.Fecha_dia == new Date(fechaPlaner).toISOString()  ? ( respuesta = " / " + substitution.NombreLeft) : null
    ))

    return respuesta;
  }



  const selectEvent = () =>{
    recargarProgrammers();
    SETEVENTO(mainEventRef.current.value);
  }

  const limpiar = ()=>{

    if(estadoDia === "compensatorio")
    {
      toast.error("El trabajador tiene asignado un compensatorio para esta fecha");
      return;
    }

    if(estadoDia === "descanso")
    {
      toast.error("El trabajador ya tiene asignado un descanso para esta fecha, primero elimine el descanso asignado");
      return;
    }

    if(estadoDia === "vacio")
    {
      toast.error("No hay un stack guardado para limpiar en esta fecha");
      return;
    }

    confirmarAccion({
      titulo: "¿Eliminar todos los turnos de esta fecha?",
      contenido: "Se eliminará el stack completo del trabajador. Si no está guardado, se perderá.",
      textoConfirmar: "Sí, eliminar",
      accion: limpiarTodo,
    });
  }

 
  const operacion = (FechaIn,idEvento,tipo,out)=>{
    //valido que tipo de vento es y opero segun corresponda


    //NULL
    if(tipo == "Null")
    {
      
      let recibida = new Date(FechaIn).getTime();
      recibida = new Date(recibida).setMinutes(new Date(recibida).getMinutes() + parseInt(30));

      fechaAuxGlobal = recibida;
       return recibida
    }

    else  if(tipo == "Programa" || tipo == "Secondary")
    {   
      let recibida = new Date(FechaIn).getTime();
      recibida = new Date(recibida).setMinutes(new Date(recibida).getMinutes() + parseInt(getDurationprogram2(idEvento)));

      fechaAuxGlobal = recibida;
       return recibida
    }

    else if(tipo == "Custom")
    {
      let recibida = new Date(FechaIn).getTime();
      recibida = new Date(recibida).setMinutes(new Date(recibida).getMinutes() + parseInt(getDurationCustom(FechaIn,out)));

      fechaAuxGlobal = recibida;
      return recibida

    }

    else if(tipo == "TimeOut")
    {
      let recibida = new Date(FechaIn).getTime();
      recibida = new Date(recibida).setMinutes(new Date(recibida).getMinutes() + parseInt(getDurationCustom(FechaIn,out)));

      fechaAuxGlobal = recibida;
      return recibida

    }

    else if(tipo == "Programmer")
    {
      let recibida = new Date(FechaIn).getTime();
      recibida = new Date(recibida).setMinutes(new Date(recibida).getMinutes() + parseInt(getDurationCustom(FechaIn,out)));

      fechaAuxGlobal = recibida;
      return recibida

    }
  }

  const salvar = (fechaInicio,index)=>{
    if(index == 1)
    {
      fechaAuxGlobalIn = fechaInicio;
    }

    return new Date(fechaInicio).toLocaleTimeString();
  }

  const timeAcumulado = ()=>{
    const minutos = Math.max(0, Number(minutosDelDia()) || 0);
    const respuesta = new Date();
    respuesta.setHours(0, 0, 0, 0);
    respuesta.setMinutes(minutos);
    return respuesta.toLocaleTimeString();
  }

  const guardarStack = async ()=>{

    const nombreStack = saveStackRef.current?.value?.trim() ?? "";

    if(!nombreStack)
    {
      toast.error("Para salvar un stack creado, primero debe asignarle un nombre");
      saveStackRef.current?.focus();
      return;
    }

    const nombreDuplicado = (data16 ?? []).some(
      (savedStacks) => String(savedStacks?.Nombre_Stack) === String(nombreStack)
    );

    if(nombreDuplicado)
    {
      toast.error("El nombre que desea asignar al stack ya existe");
      return;
    }

    if((data1 ?? []).length === 0)
    {
      toast.error("No hay un stack para guardar... la ventana de Stacks esta vacia");
      return;
    }

    const resultados = await Promise.all(
      (data1 ?? []).map((shift)=>(
        crearSaveStack(
          nombreStack,
          shift.ID_user,
          shift.Nombres,
          shift.Index,
          shift.Event_name,
          shift.ID_event,
          shift.Color,
          shift.Observacion,
          new Date(shift.Fecha_clave),
          shift.Id_Schema,
          new Date(shift.Inicio_main),
          shift.Out,
          shift.Type)
      ))
    );

    if(resultados.some((resultado) => resultado === false))
    {
      toast.error("No se pudo guardar el stack completo");
      return;
    }

    await recargarStacksGuardados();
    saveStackRef.current.value = "";
    toast.success("Stack guardado correctamente");
  }
 
 //Carga el stack seleccionado sin tocar los turnos reales del día.
 const traer= async (nombreStack) => {

  const filas = await obtenerStackGuardado(nombreStack);

  if(filas === null) return;

  setStackSeleccionado(nombreStack);
  setFilasStackSeleccionado(Array.isArray(filas) ? filas : []);
  saveStackRef.current.value = nombreStack;
  setValidaColor(true);
  toast.success("Stack cargado. Revísalo y usa Aplicar Stack.");
}

const updateStackSaved = async (nombreActual, nuevoNombre)=>{

  const actualizado = await renombrarStackGuardado(nombreActual, nuevoNombre);

  if(actualizado)
  {
    setStackSeleccionado(nuevoNombre);
    toast.success("Nombre del stack guardado, editado correctamente");
  }

  return actualizado;
}

const deleteStackSaved = async (nombre)=>{

  const eliminado = await eliminarStackGuardado(nombre);

  if(eliminado)
  {
    setStackSeleccionado("");
    setFilasStackSeleccionado([]);
    toast.success("Stack eliminado correctamente");
  }

  return eliminado;
}




//boton editar stack
const editSaveStack = async ()=>{
  const nombreActual = stackSeleccionado;
  const nuevoNombre = saveStackRef.current?.value?.trim() ?? "";

  if(nombreActual === "")
  {
    toast.error("Para editar el nombre de un stack guardado, primero seleccionelo dando doble click");
    return;
  }

  if(nuevoNombre === "")
  {
    toast.error("El stack debe tener un nombre");
    saveStackRef.current?.focus();
    return;
  }

  if(nuevoNombre === nombreActual)
  {
    toast.error("El nuevo nombre debe ser diferente al actual");
    return;
  }

  const nombreDuplicado = (data16 ?? []).some(
    (savedStacks) =>
      String(savedStacks?.Nombre_Stack) === String(nuevoNombre) &&
      String(savedStacks?.Nombre_Stack) !== String(nombreActual)
  );

  if(nombreDuplicado)
  {
    toast.error("El nombre que desea asignar al stack ya existe");
    return;
  }

  const actualizado = await updateStackSaved(nombreActual, nuevoNombre);

  if(actualizado)
  {
    saveStackRef.current.value = "";
    setStackSeleccionado("");
    setFilasStackSeleccionado([]);
  }
}

const openRight = ()=>{

  //traemos la data
  recargarTurnos();

  //Limpiamos el input de nombre stcak saved
  saveStackRef.current.value="";

  //Reiniciamos el stack seleccionado
  setStackSeleccionado("");
  setFilasStackSeleccionado([]);

  //Mostramos o ocultamos la ventana
  setShowRight(!showRight);

  //reiniciamos el color por defecto del item
  setValidaColor(false);

  //limpiamos la variable que tiene el id de un item previamente seleccionado
  IDITEMGLOBAL = "";
}

const eliminarItemSavedStack = async ()=>{

  if(stackSeleccionado === "")
  {
    toast.error("Para eliminar un stack guardado, primero seleccionelo dando doble click");
    return;
  }

  const eliminado = await deleteStackSaved(stackSeleccionado);

  if(eliminado)
  {
    saveStackRef.current.value = "";
  }
}


const reGet = ()=>{

  //traemos la data
  recargarTurnos();

  //Limpiamos el input de nombre stcak saved
  saveStackRef.current.value="";

  //Reiniciamos el stack seleccionado
  setStackSeleccionado("");
  setFilasStackSeleccionado([]);

  //reiniciamos el color por defecto del item
  setValidaColor(false);

  toast.success("Stack actual actualizado");
}

const operarItem = (iditem,e)=>{

  IDITEMGLOBAL = iditem;

   //Aqui lo que hago es cambiar los estilos para el iems seleccionado;
   if (e.target.classList=="center") 
   {

     let aux = document.getElementsByClassName("Activo");

     for (let index = 0; index < aux.length; index++) 
     {
       aux[index].classList.remove("Activo");
     }

     e.target.classList.add("Activo");
   }

}

const corroborarDia = (l,m,mi,j,v,s,d)=>{

  let respuesta = 0;

  let DiaActual = new Date(fechaBarra).getDay();
 
  if(DiaActual == 1 || DiaActual == 2 || DiaActual == 3 || DiaActual == 4 || DiaActual == 5)
  {
    if(DiaActual == 1 && l == true)
    {
      respuesta = 1;
    }

    else if(DiaActual == 2 && m == true)
    {
      respuesta = 1;
    }

    else if(DiaActual == 3 && mi == true)
    {
      respuesta = 1;
    }

    else if(DiaActual == 4 && j == true)
    {
      respuesta = 1;
    }

    else if(DiaActual == 5 && v == true)
    {
      respuesta = 1;
    }
    
  }

  else if(DiaActual == 0 || DiaActual == 6)
  {
    if(DiaActual == 6 && s == true)
    {
      respuesta = 1;
    }

    else if(DiaActual == 0 && d == true)
    {
      respuesta = 1;
    }
  }

  return respuesta;
}

const aplicarStack = async ()=>{
  if(stackSeleccionado === "" || filasStackSeleccionado.length === 0)
  {
    toast.error("Para aplicar un stack guardado, primero seleccionelo dando doble click");
    return;
  }

  const filas = [...filasStackSeleccionado].sort(
    (a, b) => (Number(a?.Index) || 0) - (Number(b?.Index) || 0)
  );

  const horaBase = enFechaPlaner(filas[0]?.Inicio_main);

  if(!horaBase)
  {
    toast.error("El stack guardado no tiene una hora de inicio válida");
    return;
  }

  const cadena = construirCadena(
    filas,
    horaBase,
    fechaPlaner,
    (turno) =>
      duracionDeTurno(turno, {
        programs: data,
        programmers: data14,
        stacks: data11,
      })
  );

  if(cadena.filas.some((fila) => fila.duracionMin <= 0))
  {
    toast.error("No se pudo aplicar el stack: revise las horas de sus eventos");
    return;
  }

  const diaLocal = (valor) => {
    const fecha = aFecha(valor) ?? aFecha(fechaPlaner) ?? new Date();
    const dia = new Date(fecha.getTime());
    dia.setHours(0, 0, 0, 0);
    return dia;
  };

  const diaPlaner = diaLocal(fechaPlaner);
  const indicesPorDia = new Map();

  const payloads = cadena.filas.map((fila) => {
    const turno = fila.item;
    const guardaHora =
      turno.Type === "Custom" ||
      turno.Type === "TimeOut" ||
      turno.Type === "Programmer";

    const fechaClave = diaLocal(fila.inicio);
    const claveDia = fechaClave.toISOString();
    const index = (indicesPorDia.get(claveDia) ?? 0) + 1;
    indicesPorDia.set(claveDia, index);

    return {
      idUser: iduser,
      nombres,
      index,
      idPrograma: turno.Type === "Null" ? "Null-30" : turno.Event_name,
      eventId: turno.ID_event ?? "------",
      color: "red",
      observacion: turno.Observacion ?? "",
      fechaClave,
      idSchema: "------",
      inicioMain: fila.inicio ?? fechaClave,
      out: guardaHora && fila.fin ? fila.fin.toISOString() : "------",
      tipo: turno.Type,
    };
  });

  const guardado = await reemplazarTurnosDeFechas(payloads, {
    userId: iduser,
    fechas: [diaPlaner, ...payloads.map((payload) => payload.fechaClave)],
  });

  if(!guardado) return;

  setStackSeleccionado("");
  setFilasStackSeleccionado([]);
  saveStackRef.current.value = "";
  setValidaColor(false);
  setAuxiliar(!auxiliar);
  toast.success("Stack aplicado correctamente");
}

 //Funcion que agrega un cero si el numero recibido es de 0 a 9
const formatearNumero = (Nuevonumero)=>{
   
    
  if(Nuevonumero == 0 || Nuevonumero == 1 || Nuevonumero == 2 || Nuevonumero == 3|| Nuevonumero == 4 || Nuevonumero == 5 || Nuevonumero == 6 || Nuevonumero == 7 || Nuevonumero == 8 || Nuevonumero == 9)
  {
      Nuevonumero = "0"+Nuevonumero;
  }

  else{
    Nuevonumero =  Nuevonumero;
  }

  return Nuevonumero;
}

 const createArray = (diasRules)=>{

  //Proceso para traer los dias correctos segun fecha definida
  data2?.map((item)=>{

    fechaRules = new Date(item.DiaPeriod).setHours(0,0,0,0);
    fechaRulesFormat = new Date(fechaRules);
    fechaRulesFormat.setDate(fechaRulesFormat.getDate() + parseInt(item.Dia) + 1);
 
})
 
  //Limpiamos el array
  for (let index = 0; index < parseInt(diasRules); index++) {
    numDias.splice(0,numDias.length);
  }

    //Limpiamos el array
    for (let index = 0; index < parseInt(diasRules); index++) {
      numDias2.splice(0,numDias2.length);
    }

  //Llenamos el array
  for (let i = 0; i <= parseInt(diasRules); i++) {

    //Proceso para llenar el nuevo array con los dias correspondientes
    auxDias = new Date(fechaRules);
    auxDias2 =  new Date(auxDias.setDate(auxDias.getDate()+i));
    auxDias3 =  new Date(auxDias2).getDate();

    numDias.push(auxDias3);
  }



 //Llenamos el array
 for (let i = 0; i <= parseInt(diasRules); i++) {

  //Proceso para llenar el nuevo array con los dias correspondientes
  auxDias0 = new Date(fechaRules);
  auxDias22 =  new Date(auxDias0.setDate(auxDias0.getDate()+i));
  auxDias33 =  new Date(auxDias22).getDate();

  mes = new Date(auxDias0).getMonth();
  año = new Date(auxDias0).getFullYear();

  numDias2.push({dia:auxDias33,mes:mes,año:año});
}

}

const extraerHorasProgram = (idPrograma)=>{

  let fechaIn;
  let fechaOut;

  data?.map((programa)=>(
    programa._id==idPrograma && (fechaIn=programa.Start, fechaOut=programa.End)
  ))

  let timeIn = new Date(fechaIn);
  let timeOut = new Date(fechaOut);


  let respuesta = timeOut.getTime()-timeIn.getTime();
      respuesta = Math.round(respuesta / (1000 * 60 ));
  


  return respuesta;

}

const extraerHorasCustom = (inicio,final)=>{
    
 

  let respuesta = DURACIONGLOBAL;
      

  return respuesta;
}

const operarMatrizDias = (iduser,fechaEvaluada)=>{
  let horas = 0;

  

  data17.map((shiftsLimited)=>(
    shiftsLimited.ID_user == iduser && shiftsLimited.Fecha_clave == new Date(fechaEvaluada).toISOString() &&
     (
         //Tipo Null-30
         shiftsLimited.Type == "Null" 
         ?
           (horas = horas +30 )

         : 

         
         //Tipo Custom
         shiftsLimited.Type == "Custom"
         ?
           (horas =  horas + extraerHorasCustom(shiftsLimited.Inicio_main,shiftsLimited.Out) )  //AQUI ESTA EL ERROR
         : 
        
         
         //Tipo Programa
         shiftsLimited.Type == "Programa"
         ?
           (horas =  horas + extraerHorasProgram(shiftsLimited.Event_name) )
         : 

         
         //Tipo Secondary
         shiftsLimited.Type == "Secondary"
         ?
           (horas =  horas + extraerHorasProgram(shiftsLimited.Event_name) )
         :  

         
         //Tipo Requerimiento  (PENDIENTE POR IMPLEMENTAR - PERO FUNCIONA IGUAL QUE UN PROGRAMA)
         shiftsLimited.Type == "Requerimiento"
         ?
           (horas =  horas + extraerHorasProgram(shiftsLimited.Event_name) )
         : 


         //Tipo Programmer  
         shiftsLimited.Type == "Programmer"
         ?
           (horas =  horas + extraerHorasCustom(shiftsLimited.Inicio_main, shiftsLimited.Out) )
         : null

     )
  ));

  return horas/60;
}



const operarDiaslaborados = (mes, dia, año, iduser)=>{
  mes ++;
  

  let HorasLaboradas = 0;
  let nuevafecha;
 

  // 1) crear una fecha aprtir de un string
  nuevafecha = ""+año+"-"+formatearNumero(mes)+"-"+formatearNumero(dia)+"T00:00:00";
  nuevafecha = new Date(nuevafecha).toISOString();

  // 2) Con la fecha y el id de usuario operar la base de datos coleccion shifts para saber las horas laboradas ese dia
  HorasLaboradas = operarMatrizDias(iduser,nuevafecha);
 
  return HorasLaboradas;

}

const formatearHorasBalance = (valor, decimales = 2) => {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return "0";
  return String(Number(numero.toFixed(decimales)));
};

const exist2 = (payrollId,payrollGrupo,groupNombre,payrollNombres, payrollApellidos ) =>{

  ax = 0;

  numDias2?.map((item)=>(
        
    ax=ax + operarDiaslaborados(item.mes,item.dia,item.año,payrollId)
      
  ))

  if(iduser == payrollId)
  {
    globalCantidad = ax;
  }

  return ax;

}

const convertir= (dia,mes,año)=>{
  mes ++;
  
  let nuevafecha;
  let NameDay;
  let respuesta = "-";
 

  // 1) crear una fecha aprtir de un string
  nuevafecha = ""+año+"-"+formatearNumero(mes)+"-"+formatearNumero(dia)+"T00:00:00";
  nuevafecha = new Date(nuevafecha).toISOString();

  NameDay = parseInt(new Date(nuevafecha).getUTCDay());

  if(NameDay == 0)
  {
    respuesta = "D";
  }

  else if(NameDay == 1)
  {
    respuesta = "L";
  }

  else if(NameDay == 2)
  {
    respuesta = "Ma";
  }

  else if(NameDay == 3)
  {
    respuesta = "Mi";
  }

  else if(NameDay == 4)
  {
    respuesta = "J";
  }

  else if(NameDay == 5)
  {
    respuesta = "V";
  }

  else if(NameDay == 6)
  {
    respuesta = "S";
  }



  return respuesta;

}


const calcular = ()=>{

  const totalPeriodoActual =
    balancePorUsuario.get(String(iduser))?.laboradas ?? 0;

  return (Number(data2?.[0]?.Horas) || 0) - totalPeriodoActual;
}

  /* *********************************************************************************************************************** */
  /* ESTADO DEL DÍA (derivado de la base, sin variables globales)                                                            */
  /* *********************************************************************************************************************** */

  const clasificacion = useMemo(() => clasificarDia(data1), [data1]);

  const hayCompensatorio = useMemo(
    () => compensatorioEnFecha(data18, iduser, fechaPlaner),
    [data18, iduser, fechaPlaner]
  );

  const hayDescanso = useMemo(
    () => rangoCubreFecha(data4, iduser, fechaPlaner),
    [data4, iduser, fechaPlaner]
  );

  //Trabajadores sin rotación configurada (antes validador5)
  const sinRotacion = useMemo(() => {
    if (!Array.isArray(data10) || data10.length === 0) return false;

    const registros = data10.filter(
      (registro) => String(registro?.userId) === String(iduser)
    );

    if (registros.length === 0) return true;

    return registros.some((registro) => Number(registro?.totalGrupo) === 0);
  }, [data10, iduser]);

  const estadoDia = useMemo(
    () =>
      estadoDelDia({
        turnos: data1,
        compensatorios: data18,
        breaks: data4,
        iduser,
        fecha: fechaPlaner,
      }),
    [data1, data18, data4, iduser, fechaPlaner]
  );

  //El estado se calcula con el período de evaluación de Rules:
  //antes = anterior a DiaPeriod; entre = dentro del período; después = posterior.
  const estadoRotacion = useMemo(() => {
    const registro = (data10 ?? []).find(
      (item) => String(item?.userId) === String(iduser)
    );

    return {
      estado: obtenerEstadoPeriodo(iduser, fechaPlaner),
      schemaId: registro?.schemaId ?? "",
      schemaName: registro?.SchemaName ?? "",
    };
  }, [data2, data10, iduser, fechaPlaner]);

  const esTurnoAnterior = estadoRotacion.estado === "antes";

  //Hora de inicio del stack mostrado: la del esquema si hay turno guardado,
  //o la del primer elemento manual (así la cadena no depende de globales).
  const turnosVisibles = useMemo(
    () =>
      [...(data1 ?? []), ...(continuacion ?? [])].sort(
        (a, b) =>
          (aFecha(a?.Inicio_main)?.getTime() ?? 0) -
          (aFecha(b?.Inicio_main)?.getTime() ?? 0)
      ),
    [data1, continuacion]
  );

  const horaInicioDelDia = useMemo(() => {
    const ordenados = [...turnosVisibles].sort(
      (a, b) => (Number(a?.Index) || 0) - (Number(b?.Index) || 0)
    );

    const conSchema = ordenados.find(
      (turno) => turno?.Id_Schema && turno.Id_Schema !== "------"
    );

    if (conSchema) {
      return (
        horaInicioSchema(data9, conSchema.Id_Schema) ?? conSchema.Inicio_main ?? null
      );
    }

    const manual = ordenados.find((turno) => turno?.Inicio_main);

    return manual?.Inicio_main ?? null;
  }, [turnosVisibles, data9]);

  const cadenaGuardada = useMemo(
    () =>
      cadenaDeTurnos(turnosVisibles, horaInicioDelDia, fechaPlaner, {
        programs: data,
        programmers: data14,
        stacks: data11,
      }),
    [turnosVisibles, horaInicioDelDia, fechaPlaner, data, data14, data11]
  );

  //El stack puede cruzar la medianoche: se agrupa por día de inicio para
  //cerrar un timeline y abrir el siguiente en el panel derecho.
  const gruposCadena = useMemo(() => {
    const grupos = [];

    (cadenaGuardada.filas ?? []).forEach((fila) => {
      const inicio = aFecha(fila.inicio) ?? aFecha(fechaPlaner) ?? new Date();
      const dia = new Date(
        inicio.getFullYear(),
        inicio.getMonth(),
        inicio.getDate()
      );
      const clave = dia.toISOString();
      let grupo = grupos[grupos.length - 1];

      if (!grupo || grupo.clave !== clave) {
        grupo = {
          clave,
          dia,
          inicio: fila.inicio,
          fin: fila.fin,
          filas: [],
        };
        grupos.push(grupo);
      }

      grupo.filas.push(fila);
      grupo.fin = fila.fin ?? grupo.fin;
    });

    return grupos;
  }, [cadenaGuardada, fechaPlaner]);

  const turnoSeleccionadoData = useMemo(
    () =>
      (data1 ?? []).find(
        (turno) => String(turno?._id) === String(turnoSeleccionado)
      ) ?? null,
    [data1, turnoSeleccionado]
  );

  /* *********************************************************************************************************************** */
  /* ALERTAS Y TEXTOS DE APOYO                                                                                               */
  /* *********************************************************************************************************************** */

  const abrirAlerta = ({ titulo, contenido, botones = [] }) =>
    setAlerta({ titulo, contenido, botones });

  const cerrarAlerta = () => setAlerta(null);

  const confirmarAccion = ({
    titulo,
    contenido,
    textoConfirmar = "Sí, continuar",
    textoCancelar = "Cancelar",
    accion,
  }) =>
    abrirAlerta({
      titulo,
      contenido,
      botones: [
        { texto: textoCancelar },
        { texto: textoConfirmar, accion },
      ],
    });

  const etiquetaEstado = () => {
    if (esTurnoAnterior) {
      return estadoDia === "vacio"
        ? "Sin turno guardado"
        : "Turno guardado (anterior)";
    }

    if (estadoDia === "vacio") return "Sugerido según rotación";
    if (estadoDia === "manual") return `Stack manual (${clasificacion.manuales.length + continuacion.length})`;
    if (estadoDia === "sugeridoGuardado") return "Sugerido guardado";
    if (estadoDia === "mixto") return "Mixto: requiere limpieza";
    if (estadoDia === "compensatorio") return "Compensatorio";
    if (estadoDia === "descanso") return "Descanso";
    return "";
  };

  const textoDeTurno = (item, duracionMin) => {
    if (!item) return "";

    if (item.Type === "Null" || item.Event_name === "Null-30") {
      return <span className='nulo'>Null-30</span>;
    }

    if (item.Type === "Custom") {
      return (
        <span className='Tcustom'>
          {item.Event_name}
          <span className='customDuration'>{` (${duracionMin} Minutos)`}</span>
        </span>
      );
    }

    if (item.Type === "TimeOut") {
      return <span className='nulo'>{`TimeOut ${duracionMin} Minutos`}</span>;
    }

    if (item.Type === "Programmer") {
      const programmer = data14?.find(
        (programa) => String(programa?._id) === String(item.ID_event ?? item.Event_name)
      );
      return (
        <span className='TProgram'>
          {programmer?.Nombre ?? item.Event_name}
          <span className='pgmDuration'>{` (${duracionMin} Minutos)`}</span>
        </span>
      );
    }

    const programa = data?.find(
      (itemPrograma) => String(itemPrograma?._id) === String(item.Event_name)
    );

    return (
      <span className={item.Type === "Secondary" ? "TSecondary" : "TProgram"}>
        {programa?.nombre ?? item.Event_name}
        <span className='pgmDuration'>{` (${duracionMin} Minutos)`}</span>
      </span>
    );
  };

  const seleccionarTurno = (item) => {
    if (estadoDia !== "manual" || !item?._id) return;

    const id = String(item._id);
    const esElMismo = String(turnoSeleccionado) === id;
    const nuevo = esElMismo ? null : id;

    setTurnoSeleccionado(nuevo);
    IDITEMGLOBAL = nuevo ?? "";
  };

  const minutosDelDiaValor = (fecha) => {
    const valor = aFecha(fecha);
    if (!valor) return null;
    return valor.getHours() * 60 + valor.getMinutes();
  };

  const mismaHoraMinuto = (a, b, tolerancia = 1) => {
    const minutosA = minutosDelDiaValor(a);
    const minutosB = minutosDelDiaValor(b);

    if (minutosA === null || minutosB === null) return false;

    return Math.abs(minutosA - minutosB) <= tolerancia;
  };

  //La hora siempre pertenece al día que se está programando. Si el DatePicker
  //o un evento trae otra fecha, se conserva solo la hora y se ancla a fechaPlaner.
  const enFechaPlaner = (valor) => {
    const fecha = aFecha(valor);

    if (!fecha) {
      return normalizarHoraDelDia(valor, fechaPlaner);
    }

    const base = aFecha(fechaPlaner) ?? new Date();
    const anclada = new Date(base.getTime());

    anclada.setHours(
      fecha.getHours(),
      fecha.getMinutes(),
      fecha.getSeconds(),
      0
    );

    return anclada;
  };

  //Hora de inicio de la rotación solo si el trabajador realmente tiene rotación
  const horaInicioRotacion = () => {
    if (sinRotacion) return null;
    if (!Array.isArray(data10) || data10.length === 0) return null;
    return horaInicioSchema(data9, IDSCHEMAGLOBAL);
  };

  const calcularCadenaManual = () => {
    const manuales = [...turnosVisibles].sort((a, b) => {
      const indexA = Number(a?.Index);
      const indexB = Number(b?.Index);

      if (Number.isFinite(indexA) && Number.isFinite(indexB) && indexA !== indexB) {
        return indexA - indexB;
      }

      return (
        (aFecha(a?.Inicio_main)?.getTime() ?? 0) -
        (aFecha(b?.Inicio_main)?.getTime() ?? 0)
      );
    });

    const base =
      aFecha(manuales[0]?.Inicio_main) ??
      horaInicioRotacion() ??
      horaInicioDelDia;

    const cadena = construirCadena(
      manuales,
      base,
      fechaPlaner,
      (turno) =>
        duracionDeTurno(turno, {
          programs: data,
          programmers: data14,
          stacks: data11,
        })
    );

    return { manuales, base, horaEsperada: cadena.fin ?? base };
  };

  /**
   * Reemplaza el stack manual completo recalculando la cadena de horas.
   * Se usa al eliminar un elemento para no dejar huecos ni horas
   * incoherentes entre los turnos.
   */
  const reemplazarStackManual = async (turnos) => {
    const lista = (Array.isArray(turnos) ? turnos : [])
      .slice()
      .sort((a, b) => {
        const indexA = Number(a?.Index);
        const indexB = Number(b?.Index);

        if (
          Number.isFinite(indexA) &&
          Number.isFinite(indexB) &&
          indexA !== indexB
        ) {
          return indexA - indexB;
        }

        return (
          (aFecha(a?.Inicio_main)?.getTime() ?? 0) -
          (aFecha(b?.Inicio_main)?.getTime() ?? 0)
        );
      });
    const horaBase =
      aFecha(lista[0]?.Inicio_main) ??
      horaInicioRotacion() ??
      horaInicioDelDia;

    const cadena = construirCadena(
      lista,
      horaBase,
      fechaPlaner,
      (turno) =>
        duracionDeTurno(turno, {
          programs: data,
          programmers: data14,
          stacks: data11,
        })
    );

    if (cadena.filas.some((fila) => fila.duracionMin <= 0)) {
      toast.error("No se pudo recalcular el stack: revise las horas de los eventos");
      return false;
    }

    const diaLocal = (valor) => {
      const fecha = aFecha(valor) ?? aFecha(fechaPlaner) ?? new Date();
      const dia = new Date(fecha.getTime());
      dia.setHours(0, 0, 0, 0);
      return dia;
    };

    const diaPlaner = diaLocal(fechaPlaner);
    const indicesPorDia = new Map();

    const payloads = cadena.filas.map((fila) => {
      const turno = fila.item;
      const guardaHora =
        turno.Type === "Custom" ||
        turno.Type === "TimeOut" ||
        turno.Type === "Programmer";

      const fechaClave = diaLocal(fila.inicio);
      const claveDia = fechaClave.toISOString();
      const index = (indicesPorDia.get(claveDia) ?? 0) + 1;
      indicesPorDia.set(claveDia, index);

      return {
        idUser: iduser,
        nombres,
        index,
        idPrograma: turno.Type === "Null" ? "Null-30" : turno.Event_name,
        eventId: turno.ID_event ?? "------",
        color: "red",
        observacion: turno.Observacion ?? "",
        fechaClave,
        idSchema: "------",
        inicioMain: fila.inicio ?? fechaClave,
        out: guardaHora && fila.fin ? fila.fin.toISOString() : "------",
        tipo: turno.Type,
      };
    });

    const fechas = [
      diaPlaner,
      ...payloads.map((payload) => payload.fechaClave),
    ];

    const guardado = await reemplazarTurnosDeFechas(payloads, {
      userId: iduser,
      fechas,
    });

    if (!guardado) return false;

    const nuevaContinuacion = payloads
      .map((payload, posicion) => ({ payload, fila: cadena.filas[posicion] }))
      .filter(
        ({ payload }) => payload.fechaClave.getTime() > diaPlaner.getTime()
      )
      .map(({ payload, fila }) => {
        const turno = fila.item;

        return {
          ...turno,
          _id: `continuacion-${payload.fechaClave.toISOString()}-${payload.index}`,
          ID_user: iduser,
          Index: fila.orden,
          Inicio_main: payload.inicioMain,
          Out: payload.out,
          Event_name: turno.Event_name ?? payload.idPrograma,
          Id_Schema: payload.idSchema,
          Type: payload.tipo,
          Observacion: payload.observacion,
          Color: "red",
          EsContinuacion: true,
        };
      });

    setContinuacion(nuevaContinuacion);
    setAuxiliar(!auxiliar);
    return true;
  };

  const totalSugeridoMin = useMemo(() => {
    if (sinRotacion) return 0;

    const items = [...(data11 ?? [])]
      .filter((stack) => String(stack?.ID_esquema) === String(IDSCHEMAGLOBAL))
      .sort((a, b) => (Number(a?.Order) || 0) - (Number(b?.Order) || 0));

    if (items.length === 0) return 0;

    const inicio = horaInicioSchema(data9, IDSCHEMAGLOBAL);
    if (!inicio) return 0;

    return construirCadena(
      items,
      inicio,
      fechaPlaner,
      (item) =>
        duracionDeElemento(item, {
          programs: data,
          programmers: data14,
        })
    ).totalMin;
  }, [data11, data, data14, data9, fechaPlaner, sinRotacion]);

  const minutosDelDia = () =>
    estadoDia === "vacio" ? totalSugeridoMin : cadenaGuardada.totalMin;

  /* Referencia Balancer: proyectadas vs. laboradas (solo consulta) */

  const diasBalance = useMemo(
    () => construirDias(data2?.[data2.length - 1]),
    [data2]
  );

  const intensidadProyeccion = useMemo(() => {
    const valor = data2?.[0]?.IntensidadHorariaDiaria;
    return valor ? parseFloat(valor) || 8 : 8;
  }, [data2]);

  const turnosParaMatriz = useMemo(() => {
    const mapa = new Map();

    [...(data17 ?? []), ...(data12 ?? []), ...(data1 ?? [])].forEach((turno) => {
      if (!turno) return;

      const clave =
        turno._id ??
        `${turno.ID_user}_${turno.Fecha_clave}_${turno.Index}_${turno.Event_name}`;

      if (!mapa.has(clave)) mapa.set(clave, turno);
    });

    return [...mapa.values()];
  }, [data17, data12, data1]);

  const horasPorUsuarioDia = useMemo(
    () => indexarHorasPorUsuario(turnosParaMatriz, data11, data),
    [turnosParaMatriz, data11, data]
  );

  const proyeccionesMap = useMemo(() => {
    const mapa = {};

    (Array.isArray(data19) ? data19 : []).forEach((item) => {
      if (!item) return;
      mapa[`${item.userId}_${item.fechaClave}`] = item.valorProyeccion;
    });

    return mapa;
  }, [data19]);

  const balancePorUsuario = useMemo(() => {
    const mapa = new Map();

    (Array.isArray(data8) ? data8 : []).forEach((persona) => {
      let totalLaboradas = 0;
      let totalProyectadas = 0;

      const filas = diasBalance.map((dia) => {
        const minutos =
          horasPorUsuarioDia.get(String(persona?._id))?.get(dia.iso) ?? 0;
        const laboradas = Number.isFinite(Number(minutos))
          ? Number(minutos) / 60
          : 0;

        const guardado = proyeccionesMap[`${persona?._id}_${dia.iso}`];
        const valor =
          guardado !== undefined && guardado !== ""
            ? parseFloat(guardado)
            : intensidadProyeccion;
        const proyectadas = Number.isNaN(valor) ? 0 : valor;

        totalLaboradas += laboradas;
        totalProyectadas += proyectadas;

        return { ...dia, laboradas, proyectadas };
      });

      mapa.set(String(persona?._id), {
        filas,
        laboradas: totalLaboradas,
        proyectadas: totalProyectadas,
        diferencia: totalProyectadas - totalLaboradas,
      });
    });

    return mapa;
  }, [
    data8,
    diasBalance,
    horasPorUsuarioDia,
    proyeccionesMap,
    intensidadProyeccion,
  ]);

  const horasPeriodo = (idUsuario) =>
    balancePorUsuario.get(String(idUsuario))?.laboradas ?? 0;

  /* *********************************************************************************************************************** */
     /* EFECTOS
   /* *********************************************************************************************************************** */

  //Refresca proyecciones al abrir el modal para reflejar cambios hechos en Balancer
  useEffect(() => {
    if (estado) recargarProjections();
  }, [estado]);
  
  useEffect(()=> {
    //Al cambiar de trabajador o fecha se rearma el formulario de acciones
    setPgm("---------------------------------");
    setEvent("---------------------------------");
    setCustom("");
    setObs("");
  }, [IDUSER, FECHA]);

  //La continuación local solo vive mientras se trabaja la fecha actual.
  useEffect(() => {
    setContinuacion([]);
  }, [iduser, fechaPlaner]);

  //La selección solo tiene sentido sobre el stack manual
  useEffect(() => {
    if (estadoDia !== "manual") {
      setTurnoSeleccionado(null);
      IDITEMGLOBAL = "";
    }
  }, [estadoDia]);

  //Si el turno seleccionado desaparece (borrado) se limpia la selección
  useEffect(() => {
    if (!turnoSeleccionado) return;

    const sigueExistiendo = (data1 ?? []).some(
      (turno) => String(turno?._id) === String(turnoSeleccionado)
    );

    if (!sigueExistiendo) {
      setTurnoSeleccionado(null);
      IDITEMGLOBAL = "";
    }
  }, [data1, turnoSeleccionado]);

  //Las anotaciones se refrescan al abrir el modal y al cambiar de trabajador/fecha
  useEffect(() => {
    if (estado) recargarNotations();
  }, [estado, iduser, fechaPlaner]);

  //...y también al abrir el panel de notas, por si se crearon desde Barra
  useEffect(() => {
    if (showNotas) recargarNotations();
  }, [showNotas]);

  //Cerrar la matriz completa con la tecla Escape
  useEffect(() => {
    if (!showMatrizCompleta) return undefined;

    const alPresionarTecla = (evento) => {
      if (evento.key === "Escape") setShowMatrizCompleta(false);
    };

    window.addEventListener("keydown", alPresionarTecla);

    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, [showMatrizCompleta]);

  //Cerrar el panel de notas con la tecla Escape
  useEffect(() => {
    if (!showNotas) return undefined;

    const alPresionarTecla = (evento) => {
      if (evento.key === "Escape") setShowNotas(false);
    };

    window.addEventListener("keydown", alPresionarTecla);

    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, [showNotas]);

  //Al cerrar el modal, el panel de notas también se cierra
  useEffect(() => {
    if (!estado) {
      setShowNotas(false);
      setShowMatrizCompleta(false);
    }
  }, [estado]);



 

  //Matriz de horas reutilizada en el footer y en la modal completa.
  const renderMatrizInferior = () => (
    <div className="inspectorContainer">
      <ul>
        <li className='liInspector2' key={iduser}>
          <span className='nameUS'></span>
          <div className="cajaNumero">
            {data2.map((rules_Dia) => createArray(rules_Dia.Dia))}

            {diasBalance.map((dia) => (
              <div
                className="cuadro201"
                key={dia.iso}
                style={{
                  background:
                    dia.mes === diasBalance[0]?.mes ? "#EB464B" : "#701CF5",
                }}
              >
                {dia.dia}
                <p className='p_cuadro'>
                  {convertir(dia.dia, dia.mes, dia.anio)}
                </p>
              </div>
            ))}

            <div className="cuadroTotalHeader">
              TOTAL
              <p className='p_cuadro'>Lab / Proy</p>
            </div>

            <div className="cuadroDifHeader">
              POR PROG.
              <p className='p_cuadro'>Proy − Lab</p>
            </div>
          </div>
        </li>
      </ul>

      {data8?.map((item) => {
        if (item.grupo != gp) return null;

        const balance = balancePorUsuario.get(String(item._id));
        const esActual = nombres == item.nombres + " " + item.apellidos;

        if (!balance) return null;

        return (
          <ul className='Separador' key={item._id}>
            <li className={`liInspector${esActual ? " liInspectorActual" : ""}`}>
              <span className={esActual ? 'nameUSActual' : 'nameUS'}>
                {item.nombres + " " + item.apellidos}
              </span>
              <div className="cajaNumero">
                {balance.filas.map((fila) => (
                  <div
                    className="cuadro20"
                    key={fila.iso}
                    title={`${fila.dia}/${fila.mes + 1}: Laboradas ${formatearHorasBalance(fila.laboradas)} h`}
                  >
                    {formatearHorasBalance(fila.laboradas, 1)}
                  </div>
                ))}

                <div className="cuadroTotal" title="Total laboradas del período">
                  <span className="celda-lab">
                    {formatearHorasBalance(balance.laboradas)}
                  </span>
                </div>

                <div
                  className={`cuadroDif ${balance.diferencia > 0 ? "pendiente" : "excedido"}`}
                  title="Horas por programar = Proyectadas − Laboradas"
                >
                  {formatearHorasBalance(balance.diferencia)}
                </div>
              </div>
            </li>

            <li className={`liInspector liInspectorProy${esActual ? " liInspectorProyActual" : ""}`}>
              <span className='nameUS nameUSProy'>Proy.</span>
              <div className="cajaNumero">
                {balance.filas.map((fila) => (
                  <div
                    className="cuadro20 cuadro20Proy"
                    key={fila.iso}
                    title={`${fila.dia}/${fila.mes + 1}: Proyectadas ${formatearHorasBalance(fila.proyectadas)} h`}
                  >
                    {formatearHorasBalance(fila.proyectadas, 1)}
                  </div>
                ))}

                <div className="cuadroTotal cuadroTotalProy" title="Total proyectadas del período">
                  <span className="celda-proy">
                    {formatearHorasBalance(balance.proyectadas)}
                  </span>
                </div>

                <div className="cuadroDifVacio" aria-hidden="true"></div>
              </div>
            </li>
          </ul>
        );
      })}
    </div>
  );

  return (
    <>
    
    <Toaster />
      {estado && (
        <div className="container-modal1">
          
          {/*CABECERA */}
          <div className="cabecera">
            
            <img src={Anita} alt="anita" className="img-Profile" />
            <h3 className="nombre">
              {nombres + traerSustituto()}
              <br />
              <span className="roll">{cargo}</span>
            </h3>

            <h2 className="fecha">{fechaPlaner.toDateString()}</h2>
            <img src={Calendar} alt="calendar" className="img-calendar"/>
          </div>

          <div className="actividad">
              <div className="actividad_title">
                Tiempo fuera - en dias
              </div>
              <div className="actividad_container">
              <div className="actividad_lista">
                  <ul>
                    <li className='liLista' >Permissions<span className='indicador'>
                      {
                       fullPermissionsUser(iduser)
                      }
                    </span><progress 
                      value={fullPermissionsUser(iduser)} 
                      max={Math.max(1, parseInt(regla?.Dia ?? 0))} 
                      className='progress'/>
                    </li>


                    <li className='liLista'>Breaks<span className='indicador'>
                      {
                       fullBreaksUser(iduser)
                      }
                      </span><progress 
                      value={fullBreaksUser(iduser)} 
                      max={Math.max(1, parseInt(regla?.Dia ?? 0))} 
                      className='progress'/>
                    </li>

                    
                    <li className='liLista' >Incapacitys<span className='indicador'>
                      {
                        fullIncapacitysUser(iduser)
                      }
                     </span><progress 
                       value={fullIncapacitysUser(iduser)} 
                       max={Math.max(1, parseInt(regla?.Dia ?? 0))} 
                       className='progress'/>
                    </li>




                    <li className='liLista'>Recess<span className='indicador'>
                       {
                        fullRecessUser(iduser)
                       }
                      </span><progress 
                        value={fullRecessUser(iduser)} 
                        max={Math.max(1, parseInt(regla?.Dia ?? 0))} 
                        className='progress'/>
                    </li>



                    <li className='liLista' >Licenses<span className='indicador'>
                       {
                        fullLicensesUser(iduser)
                       }
                      </span><progress
                        value={fullLicensesUser(iduser)} 
                        max={Math.max(1, parseInt(regla?.Dia ?? 0))} 
                        className='progress'/>
                    </li> 

                  </ul>
                </div>
              </div>

              <div className="periodo">
                <h5 className='periodo'>
                {data2?.map((item)=>(
              new Date (item.DiaPeriod).getDate() + " de " + validateMonts(new Date (item.DiaPeriod).getMonth()) + " de " + new Date (item.DiaPeriod).getFullYear() + " ---- " + sumaDias(item.DiaPeriod,item.Dia) + " de " + validateMonts(sumaMes(item.DiaPeriod,item.Dia)) + " de " + sumaAño(item.DiaPeriod,item.Dia)
          ))}
                </h5>
              </div>
            </div>
                  
          <div className="cuerpoModal">

          {alerta && (
            <div className="alert" role="alertdialog" aria-modal="true">
              <img src={handStop} alt="stop" className='handStop'/>
              <div className="cierre" onClick={cerrarAlerta}>x</div>
              <div className="alert-conten">
                {alerta.titulo}
              </div>
              <div className="alert-subtitulo">
                {alerta.contenido}
              </div>
              <div className="alert-butoms">
                {(alerta.botones ?? []).map((boton, posicion) => (
                  <div
                    key={posicion}
                    className={posicion === (alerta.botones.length - 1) ? "btn-confirm" : "btn-no"}
                    onClick={() => {
                      cerrarAlerta();
                      boton.accion?.();
                    }}
                  >
                    {boton.texto}
                  </div>
                ))}
              </div>
            </div>
          )}


            {showNotas &&
              createPortal(
                <div
                  className="notas-overlay"
                  onClick={(evento) => {
                    if (evento.target === evento.currentTarget) setShowNotas(false);
                  }}
                >
                  <section
                    id="panel-anotaciones"
                    className="notasShow"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="notas-titulo"
                  >
                    <header className="notas-header">
                      <span className="notas-eyebrow">Anotaciones</span>
                      <h3 className="notas-title" id="notas-titulo">{nombres}</h3>
                      <span className="notas-fecha">{fechaPlaner.toDateString()}</span>
                      <button
                        type="button"
                        className="notas-cerrar"
                        onClick={() => setShowNotas(false)}
                        aria-label="Cerrar anotaciones"
                      >
                        ×
                      </button>
                    </header>

                    <ul className="notas-lista">
                      {data15.map((anotacion, index) => (
                        <li className="main-nt" key={anotacion._id}>
                          <span className="numero-notas">{index + 1}</span>
                          <p className="notas-contenido">{anotacion.Contenido}</p>
                        </li>
                      ))}

                      {data15.length === 0 && (
                        <li className="notas-vacio">
                          <img src={documento} alt="" aria-hidden="true" />
                          <p>Sin anotaciones para esta fecha</p>
                        </li>
                      )}
                    </ul>
                  </section>
                </div>,
                document.body
              )}

          <div className="close2" onClick={() => cambiarEstado(!estado)}>X</div>

         
          {/*SECCION # 1*/}
            <div className="list-turnos">
              <div className="titulo">
                <h2>INFORMACION</h2>
              </div>

              <div className="info1">
                <h6 className='titleBalancer'>Balancer</h6>
                <img src={Balanza} alt="balanza" className='balanza' />
                <div className="lista">
                  <ul>
                    {
                      data8?.map((item)=>(
                        item.grupo == gp && item.activo == true 
                        ? 
                        <li className={nombres == item.nombres + " " + item.apellidos ? 'liListaItemActual' : 'liListaItem'} key={item._id}>
                          {item.nombres + "  " + item.apellidos} 
                          <span className='indicador'>
                            {formatearHorasBalance(horasPeriodo(item._id), 1)}
                          </span>                                                                      
                          <progress value={horasPeriodo(item._id)} max={Number(regla?.Horas) || 1} className='progress'/>
                        </li>
                        :
                        null
                      ))
                    }
                   
                   
                  </ul>
                </div>
              </div>

              <div className="info2">
                  <h6 className='titleBalancer'>Turnos según rotación</h6>
                  <img src={Calendario} alt="balanza" className='balanza' />
                  <div className="lista">
                  <ul>
                    {reset()}
                    {   
                          data8.map((payroll)=>(
                            IDGLOBAL = payroll._id,

                            data10?.map((rotationsManager)=>(
                              IDGLOBAL == rotationsManager.userId && rotationsManager.groupId == gpid && payroll.activo == true ? 
                              
                              <li className={nombres == payroll.nombres + " " + payroll.apellidos ? 'liListaItemActual' : 'liListaItem'} key={payroll._id}>{payroll.nombres + "  " + payroll.apellidos}
                                <span className='indicador2'>
                                  {Pronostico(IDGLOBAL)}
                                </span>

                              </li>
                              
                
                              :  null
                            ))
                          ))
                    }

                    
                  </ul>
                </div>
              </div>
            </div>

           
            
            
            {/*SECCION # 2 */}
            <div className="acciones">

              <div className="titulo">
                <h2>ACCIONES</h2>
              </div>


              {
                //Validamos dia festivo para mostrar bandera
                holy ? 
                <div className='content_bandera'>
                  
                  <img src={bandera} alt="bandera" className='img_bandera' /> 
                  <p className='holiday_name'>
                  {
                    datos?.map((item)=>(
                      item.Mes == parseInt(new Date(fechaBarra).getMonth()) && item.Dias?.map((dato)=>(dato.dia) == parseInt(new Date(fechaBarra).getDate()) &&  dato.motivo)
                    ))
                    
                  }
                  </p> 
                </div>
                   
                : null
              }
              
              <div className="mainContainer">
              
              

                <h3 className="subTitulo">EVENTOS</h3>
                <h5 className='tipo'>Eventos del sistema</h5>
                <select name="turnoSeleccionado" className='selectedBox' ref={mainEventRef} onChange={selectEvent}>
                  <option key="nada" value="none" className='selecteItem' >---------------------------------</option>
                  <option key="none_pgm" value="pgm" className='selecteItem' >PROGRAMA</option>
                  <option key="none_req" value="req" className='selecteItem' >REQUERIMIENTO</option>
                  <option key="none_sec" value="secundary" className='selecteItem' >SECUNDARIO</option>
                  <option key="none_custom" value="custom" className='selecteItem' >CUSTOM</option>
                  <option key="none_programmer" value="programmer" className='selecteItem' >PROGRAMADOR</option>
                  <option key="none_null-30" value="null30" className='selecteItem' >NULL-30</option>
                  <option key="none_time_out" value="timeout" className='selecteItem' >TIME OUT</option>
                </select>


                {/* OPCIONES SEGUN CORRESPONDA */}

              {

                EVENTO == "pgm" ? 

                <>
                 <h5 className='tipo'>Programas</h5>
                 <select name="turnoSeleccionado" className='selectedBox' ref={pgmRef} onChange={resetPGM}>
                  <option key="none" value="none" className='selecteItem' >{pgm}</option>
                    {
                      data?.map((pgm)=>(
                        pgm.Type=="Main"&& corroborarDia(pgm.lunes,pgm.Martes,pgm.Miercoles,pgm.Jueves,pgm.Viernes,pgm.Sabado,pgm.Domingo) == 1 &&
                        <option key={pgm._id} value={pgm._id} className='selecteItem'>{pgm.nombre}
                    </option>
                    ))
                    }
                </select>
                </>
                
                

              : EVENTO == "req" ?

              <>
              <h5 className='tipo'>Requerimientos</h5>
              <select name="turnoSeleccionado" className='selectedBox' ref={eventRef} id='pgm' onChange={reset1}>
              <option key="none1" value="none" className='selecteItem'>{event}</option>
                {
                  data?.map((pgm)=>(
                    <option key={pgm._id} value={pgm.nombre} className='selecteItem'>Pendiente por implementar</option>
                  ))
                }
                
              </select>
              </>
              

              : EVENTO == "secundary" ?

              <>
               <h5 className='tipo'>Eventos Secundarios</h5>
               <select name="turnoSeleccionado" className='selectedBox' id='pgm' ref={secRef} onChange={resetSEC}>
              <option key="none2" value="none" className='selecteItem'>{event}</option>
                {
                  data?.map((pgm)=>(
                    pgm.Type=="Secondary" && corroborarDia(pgm.lunes,pgm.Martes,pgm.Miercoles,pgm.Jueves,pgm.Viernes,pgm.Sabado,pgm.Domingo) == 1 &&
                    <option key={pgm._id} value={pgm._id} className='selecteItem'>{pgm.nombre}</option>
                  ))
                }
                
              </select>
              </>
             



                : EVENTO == "custom" ?
                <>
                  <h5 className='tipo'>Evento Custom</h5>
                  <input type='text' className='selectedBox2' ref={customRef} id='custom' placeholder='---------------------------------' defaultValue={custom}/>
                </>

                : EVENTO == "programmer" ? 

                <>
                <h5 className='tipo'>Eventos programados</h5>
                <select name="turnoSeleccionado" className='selectedBox' ref={pgmRef} id='pgm' onChange={resetPROGRAMMER}>
               <option key="none2" value="none" className='selecteItem'>{event}</option>
                 {
                   data14?.map((pgm)=>(
                     <option key={pgm._id} value={pgm._id} className='selecteItem'>{pgm.Nombre}</option>
                   ))
                 }
                 
               </select>
               </>


                : EVENTO == "null30" ? 

                 <h3 className='null-30'>Null-30 es un campo nulo de media hora</h3>
                
                :  EVENTO == "timeout" ? 

                <h3 className='null-30'>Seleccione el rango horario del tiempo fuera</h3>

                : null

              }
                
                

                <h3 className="subTitulo">HORARIO</h3>
                <div className="container-datapickers">
                  <div className="contentGroup">
                    <img src={Clock} alt="reloj" className='clock'/>
                    <DatePicker
                    className='inputInicio'
                            selected={startHour}
                            onChange={(date) => setStartHour(date)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            timeCaption="Start"
                            dateFormat="HH:mm aa"
                            ref={startRef}
                          />
                  </div>

                  <div className="contentGroup">
                    <img src={Clock} alt="reloj" className='clock'/>
                    <DatePicker
                    className='inputInicio'
                            selected={EndHour}
                            onChange={(date) => setEndHour(date)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            timeCaption="End"
                            dateFormat="HH:mm aa"
                            ref={endRef}
                          />
                  </div>
                </div>


                <h3 className="subTitulo">OBSERVACIONES PERSONALES</h3>
                <textarea name="observaciones" className='observaciones' ref={observationRef} defaultValue={obs}></textarea>
               
                
              </div>

              <div className={validaColor == false ? "seccionButons" : "seccionButonsNone"}>
                <div className="containerSingleButtom">
                 <img src={Plus} alt="plus" title="Agregar evento al stack" className='img-butons' onClick={add}/>
                </div>
                <div className="containerSingleButtomDel">
                 <img src={Trash} alt="trash" title="Eliminar turno seleccionado" className='img-butons' onClick={del}/>
                </div>
               
              </div>


                {(estadoDia === "vacio" || estadoDia === "manual" || estadoDia === "mixto") && (
                  <div
                    className="containerSingleButtom-open"
                    title={showRight ? "Cerrar turnos especiales" : "Abrir turnos especiales"}
                    onClick={openRight}
                  >
                    <img src={flechaLeft} alt="Turnos especiales" className='img-butons'/>
                  </div>
                )}
                
              
                

            
            </div>

           

            <div className={`list-turnos${esTurnoAnterior ? " list-turnos--anterior" : ""}`}>
              <div className="titulo">
                <h2>TURNO SEGUN ROTACION</h2>
                
                <p className='name-turno-rotacion'>{Pronostico(iduser)}</p>
                <span className={`estado-dia estado-${estadoDia}${esTurnoAnterior ? " estado-anterior" : ""}`}>{etiquetaEstado()}</span>
              </div>

              {estadoDia === "vacio" && esTurnoAnterior && (
                <ul className="ulLista-rotation-anterior-vacia">
                  <li className="mensaje-turno-anterior">
                    <strong>No hay turno guardado para esta fecha.</strong>
                    <span>Esta fecha es anterior a la rotación del trabajador.</span>
                  </li>
                </ul>
              )}

              {estadoDia === "vacio" && !sinRotacion && !esTurnoAnterior && (
                <ul className="ulLista-rotation">
                  <span className='horaIN' key={data1.length}>
                    {devolverIN() == "Invalid Date" ? "--:--:--" : devolverIN()}
                  </span>

                  {data11?.map((stack)=>(
                    String(stack.ID_esquema) === String(IDSCHEMAGLOBAL) ? (
                      <li className="liItem-rotation" key={stack._id}>
                        {resolver(stack.ID_programa,stack.Type,stack.ID_programa,stack.Duration,stack.Order,stack.Value)}
                      </li>
                    ) : null
                  ))}

                  <span className='horaOUT'>{auxOut == "Invalid Date" ? "--:--:--" : auxOut }</span>
                </ul>
              )}

              {estadoDia === "vacio" && sinRotacion && (
                <ul className="ulLista-rotation">
                  <img src={less} alt="Sin rotación" className='img-coffe'/>
                </ul>
              )}

              {estadoDia === "descanso" && (
                <ul className="ulLista-rotation">
                  <img src={less} alt="Descanso" className='img-coffe'/>
                </ul>
              )}

              {estadoDia === "compensatorio" && (
                <ul className="ulLista-rotation-compensatory">
                  <img src={cafe} alt="Compensatorio" className='img-coffe'/>
                </ul>
              )}

              {(estadoDia === "manual" || estadoDia === "sugeridoGuardado" || estadoDia === "mixto") && (
                <ul className={`${estadoDia === "sugeridoGuardado" ? "ulLista-rotation-ok" : "ulLista-rotation-saved"}${estadoDia === "manual" ? " ulLista-editable" : ""}${esTurnoAnterior ? " ulLista-rotation-anterior" : ""}`}>
                  {estadoDia === "mixto" && (
                    <li className="aviso-mixto">
                      Hay un stack manual y un turno sugerido guardado en esta fecha. Limpie el día para continuar.
                    </li>
                  )}

                  {gruposCadena.map((grupo, indiceGrupo) => (
                    <Fragment key={grupo.clave}>
                      {indiceGrupo > 0 && (
                        <li className="separador-dia-stack">
                          Nuevo día ·{" "}
                          {grupo.dia.toLocaleDateString("es-CO", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </li>
                      )}

                      <span className='horaIN'>
                        {grupo.inicio ? formatearHora(grupo.inicio) : "--:--:--"}
                      </span>

                      {grupo.filas.map((fila) => (
                        <li
                          className={`liItem-rotation${
                            estadoDia === "manual" &&
                            !fila.item?.EsContinuacion &&
                            String(turnoSeleccionado) === String(fila.item?._id)
                              ? " liItem-rotation--activo"
                              : ""
                          }${fila.item?.EsContinuacion ? " liItem-rotation--continuacion" : ""}`}
                          key={fila.item?._id ?? `${grupo.clave}-${fila.orden}`}
                          onClick={
                            estadoDia === "manual" && !fila.item?.EsContinuacion
                              ? () => seleccionarTurno(fila.item)
                              : undefined
                          }
                          title={
                            estadoDia === "manual" && !fila.item?.EsContinuacion
                              ? "Clic para seleccionar el turno (la caneca lo elimina)"
                              : "Este evento pertenece al día siguiente"
                          }
                        >
                          <span className="turno-titulo">
                            {textoDeTurno(fila.item, fila.duracionMin)}
                          </span>

                          {estadoDia === "manual" &&
                            fila.item?.Observacion &&
                            fila.item.Observacion !== "-----" && (
                              <span className="turno-observacion">
                                {fila.item.Observacion}
                              </span>
                            )}
                        </li>
                      ))}

                      <span className='horaOUT'>
                        {grupo.fin ? formatearHora(grupo.fin) : "--:--:--"}
                      </span>
                    </Fragment>
                  ))}
                </ul>
              )}
    
              



              <div className={sinRotacion ? "seccionButons2-hide" :"seccionButons2"}>
              <div className="containerSingleButtom">
              {
                data15.length > 0 ?

                <span className='noti'>
                  {data15.length}
                </span>

                :

                null
              }
                

                  <img
                    src={documento}
                    alt="Ver anotaciones"
                    title="Ver anotaciones"
                    className='img-butons'
                    aria-expanded={showNotas}
                    aria-controls="panel-anotaciones"
                    onClick={()=>setShowNotas(!showNotas)}
                  />
                </div>
                <div className="containerSingleButtom">
                  <img src={capas} alt="pencil" className='img-butons' onClick={stack} ref={stackRef}/>
                </div>
                <div className="containerSingleButtomOk">
                 <img src={Ok} alt="plus" className='img-butons' onClick={ok}/>
                </div>
                <div className="containerSingleButtom">
                 <img src={cafe} alt="plus" className='img-butons' onClick={regalo}/>
                </div>
                <div className="containerSingleButtomDel">
                 <img src={Clean} alt="trash" className='img-butons' onClick={clean}/>
                </div>
              </div>
            </div>

            <div className='aux1'>
           <div className="aux1_title">
            Restante
           </div>
           <div className="aux1_label">
           {
              formatearHorasBalance(calcular(), 1)
           }
           <span className='aux_label-1'>Horas</span>
           </div>
          </div>

          <div className='aux2'>
          <div className="aux1_title">
            Acumulado
           </div>
           <div className="aux1_label">
            {minutosDelDia() + " Minutos"}
            <p className='aux_label-1'>{(minutosDelDia()/60).toFixed(1) + " Horas"}</p>
           </div>
          </div>
          </div> 

         

          







         

          <div className="barraButom">
            <button
              type="button"
              className="btn-expandir-matriz"
              title="Ver matriz completa"
              aria-label="Ver matriz completa"
              onClick={() => setShowMatrizCompleta(true)}
            >
              <FiMaximize2 />
            </button>

            <div className="matrizScroll">
              {renderMatrizInferior()}
            </div>
          </div>











          
        </div>

      )}

      {
         <div className={showRight==true ? "content_principal_custom" : "hideRight"} >
                <div className="titulo-custom1">
                  <h2>Stack de turnos especiales</h2>
                </div>

                <div className="cuerpoStackTurnos">
                  {
                    data1?.map((shifts)=>(
                      <div className="contentBoloque" key={shifts._id}>
                      <div className={validaColor == false ? "in" : "inSaved"} >{salvar(shifts.Inicio_main,shifts.Index)}</div>
                      <div className={validaColor == false ? "center" : "centerSaved"} onClick={(e)=>operarItem(shifts._id,e)}>{getNameProgram(shifts.Event_name,shifts.Type,shifts.ID_event)}</div>
                      <div className={validaColor == false ? "out" : "outSaved"} >{new Date(operacion(shifts.Inicio_main,shifts.Event_name,shifts.Type,shifts.Out)).toLocaleTimeString()}</div>
                    </div>
                    ))
                  }
                 

                  
                

                  <div className="timeIn"><span className='spanIn'>Time In</span>{new Date(fechaAuxGlobalIn).toLocaleTimeString()}</div>
                 
                 <div className="cleanButom">
                    <img src={capas} alt="Ok" onClick={reGet}/>
                 </div>

                 <div className="cleanButomFull" onClick={limpiar}>
                    <img src={trashFull} alt="Ok" />
                 </div>
                  <div className="timeOut"><span className='spanOut'>Time Out</span>{new Date(fechaAuxGlobal).toLocaleTimeString()}</div>

                  <div className="timeAcu"><span className='spanOut'>Accumulated time</span>{timeAcumulado()}</div>

                </div>


                <div className="titulo-custom2">
                    <h2>Stack Guardados</h2>
                </div>

                <div className="cuerpoStackGuardados">
                  <div className="guardadosLeft">
                    <ul>
                      {
                        data16?.map((savedStacks)=>(
                          savedStacks.Index==1 &&
                          <li className='guardadosItem'onDoubleClick={()=>traer(savedStacks.Nombre_Stack)} key={savedStacks._id}>{savedStacks.Nombre_Stack}</li>
                        ))
                      }
                     
                     
                    </ul>
                  </div>
                  <div className="guardadosRight">

                   <div className="contenControls">
                    Nombre
                    <input type='text' className='controsName' ref={saveStackRef}></input>
                      <div className="seccionButonsNew">
                          <div className="containerSingleButtomNew" onClick={editSaveStack}>
                            <img src={Pencil} alt="pencil"  />
                          </div>
                          <div className="containerSingleButtomNew" onClick={guardarStack}>
                            <img src={save} alt="plus"/>
                          </div>
                          <div className="containerSingleButtomDelNew" onClick={eliminarItemSavedStack}>
                            <img src={Trash} alt="trash"  />
                          </div> 
                          
                      </div>
                          <div className="containerSingleButtomAply" onClick={aplicarStack}>
                            <p className='label_aplicar'>Aplicar Stack</p>
                          </div> 
                   </div>
                   
                  </div>
                </div>
         </div>
      }

      {showMatrizCompleta &&
        createPortal(
          <div
            className="matriz-overlay"
            onClick={(evento) => {
              if (evento.target === evento.currentTarget) {
                setShowMatrizCompleta(false);
              }
            }}
          >
            <div className="matriz-modal">
              <div className="matriz-modal-header">
                <h2>Balancer · Matriz de horas</h2>

                <button
                  type="button"
                  className="btn-cerrar-matriz"
                  title="Cerrar matriz"
                  aria-label="Cerrar matriz"
                  onClick={() => setShowMatrizCompleta(false)}
                >
                  <FiX />
                </button>
              </div>

              <div className="matriz-modal-body">
                {renderMatrizInferior()}
              </div>
            </div>
          </div>,
          document.body
        )}
            
    </>
  );

  
}