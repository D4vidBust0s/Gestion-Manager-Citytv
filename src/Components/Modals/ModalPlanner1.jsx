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
import savedShift from '../../assets/savedShift.svg';
import bandera from '../../assets/Flag-Colombia.gif';




/* Import dependencies */
import { useEffect, useRef, useState, useContext } from 'react';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import {Toaster, toast} from 'react-hot-toast';



//Import Contextos
import { FechaBarraContext } from '../../context/FechaBarraProvider';
import { PronosticoContext } from '../../context/PronosticoTurnosProvider'

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
let index = 0;

//Variables 
let DiaClave;
let totalSche;
let totalGP;
let actual;
let IDGLOBAL;
let IDSCHEMAGLOBAL;
let HORAINGLOBAL;
let INDEXGLOBAL;
//let FECHAINICIOGLOBAL  = new Date();
//let FECHAFINALGLOBAL;

let validador = 0;
let validador2 = 0;
let validador3 = 0;
let validador4 = 0;
let validador5 = 0;
let validador6 = 0;
let inicioMain;
let validaUser = 0;

let fechaAuxGlobal;
let fechaAuxGlobalIn = "--:--:--";
let nameEventSavedGlobal = "";
let IDITEMGLOBAL = "";

let validaDiaFestivo = 0;
let mensaje = "-------";




export default function ModalPlanner1({estado,cambiarEstado,nombres,cargo,fechaPlaner,iduser,subGrupo,color,gp,gpid,holy,datos}) {

/* CONTEXTOS*/
const [fechaBarra,setFechaBarra] = useContext(FechaBarraContext);  //Define un estado para la fecha de la barra
const [auxiliar,setAuxiliar] = useContext(PronosticoContext); //


  //Estados
  const [, setDate] = useState()
  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [data4, setData4] = useState([]);
  const [data5, setData5] = useState([]);
  const [data6, setData6] = useState([]);
  const [data7, setData7] = useState([]);
  const [data8, setData8] = useState([]);
  const [data9, setData9] = useState([]);
  const [data10, setData10] = useState([]);
  const [data11, setData11] = useState([]);
  const [data12, setData12] = useState([]);
  const [data13, setData13] = useState([]);
  const [data14, setData14] = useState([]);
  const [data15, setData15] = useState([]);
  const [data16, setData16] = useState([]);
  const [showNotas, setShowNotas] = useState(false);
  

 

  const [startHour, setStartHour] = useState(new Date());
  const [EndHour, setEndHour] = useState(new Date());
  const [IDUSER, setIDUSER] = useState();
  const [FECHA, setFECHA] = useState();
  const [EVENTO, SETEVENTO] = useState("---------------------------------");

  /* Estados para el datepicker */
  const [calendar, setCalendar] = useState(new Date());
  /* Estados para los controles del formulario de acciones */
  const [pgm, setPgm] = useState("---------------------------------");
  const [event, setEvent] = useState("---------------------------------");
  const [custom, setCustom] = useState("");
  const [obs, setObs] = useState("");

  const [pr,setPr]= useState(0);
  const [showAlert,setShowAlert]= useState(false);
  const [showRight,setShowRight]= useState(false);

  const [messageTitle,setMessageTitle]= useState("Titulo");
  const [messageContenido,setMessageContenido]= useState("Contenido");
  const [messageBtn1,setMessageBtn1]= useState("-----");
  const [messageBtn2,setMessageBtn2]= useState("-----");
  const [messageBtn1Show,setMessageBtn1Show]= useState(false);
  const [messageBtn2Show,setMessageBtn2Show]= useState(false);
  const [validaColor,setValidaColor]= useState(false);

  const [fechaFull,setFechaFull]= useState([]);
  


 
 

  //Referencias
  const mainEventRef = useRef();
  const pgmRef = useRef();
  const secRef = useRef();
  const eventRef = useRef();
  const customRef = useRef();
  const startRef = useRef();
  const endRef = useRef();
  const observationRef = useRef();
  const pruebaRef = useRef();
  const stackRef = useRef();
  const saveStackRef = useRef();

 
  
  //FUNCIONES
  //Funcion que obtiene la data de la api - listado de programs
  const obtenerListadoPrograms = async () => {
    return await axios
      .get("http://localhost:3000/api/programs")
      .then((response) => setData(response.data));
  };

   //Funcion que obtiene la data de la api - listado de turnos segun id y fecha especifica
   const obtenerListadoTurnos = async () => {
    return await axios
      .get("http://localhost:3000/api/shifts",
      {
        params:{
          id: IDUSER,
          fecha: fechaPlaner,
        }
      })
      .then((response) => setData1(response.data));
  };


   //Funcion que trae los datos o reglas de Rules
   const getRules = async () => {
    return await axios
      .get("http://localhost:3000/api/rules")
      .then((response) => setData2(response.data));
      
  };


  const traerPermisosTrabajador = async ()=>{
    return await axios
    .get("http://localhost:3000/api/permissions/")
    .then((response) => setData3(response.data));
    
  }

  const traerBreaksTrabajador = async ()=>{
    return await axios
    .get("http://localhost:3000/api/breaks/")
    .then((response) => setData4(response.data));
    
  }

  const traerIncapacitysTrabajador = async ()=>{
    return await axios
    .get("http://localhost:3000/api/incapacitys/")
    .then((response) => setData5(response.data));
    
  }

  const traerRecessTrabajador = async ()=>{
    return await axios
    .get("http://localhost:3000/api/recess/")
    .then((response) => setData6(response.data));
    
  }

  const traerLicensesTrabajador = async ()=>{
    return await axios
    .get("http://localhost:3000/api/licenses/")
    .then((response) => setData7(response.data));
    
  }

  const traerPayroll = async ()=>{
    return await axios
    .get("http://localhost:3000/api/payroll")
    .then((response) => setData8(response.data));
    
  }

  const traerRotations = async ()=>{
    return await axios
    .get("http://localhost:3000/api/rotations")
    .then((response) => setData9(response.data));
    
  }


   //Traer todos los registros de rotationsManager
const getAllRotationsManager= async () => {
    
  return await axios
    .get("http://localhost:3000/api/rotationsmanager/")
    .then((response) => setData10(response.data));
}

  //Traer todos los registros Stacks
  const getAllStacks= async () => {
    
    return await axios
      .get("http://localhost:3000/api/stacks/")
      .then((response) => setData11(response.data));
  }

  //Funcion que obtiene todos los shifts
  const obtenerListadoTurnosFull = async () => {
    return await axios
      .get("http://localhost:3000/api/shifts/full/")
      .then((response) => setData12(response.data));
  };


  //Funcion que obtiene la data de la api - listado Substitutions
const getSubstitutions = async () => {
  return await axios
    .get("http://localhost:3000/api/substitutions/")
    .then((response) => setData13(response.data));
};

 //Funcion que obtiene la data de la api - Programmers
 const getProgrammers = async () => {
  return await axios
    .get("http://localhost:3000/api/programmer/",
    {
      params:{
        fecha: fechaPlaner,
      }
    })
    .then((response) => setData14(response.data));
};




 //Funcion que obtiene la data de la api - listado de anotaciones segun id y fecha especifica
 const getNotatiosIdFecha = async () => {
  return await axios
    .get("http://localhost:3000/api/notations/",
    {
      params:{
        id: iduser,
        fecha: new Date(fechaBarra).toISOString(),
      }
    })
    .then((response) => setData15(response.data));
};

 //Funcion que obtiene la data de la api - de la pila de stacks Guardados
 const obtenerListadoStacksSaved= async () => {
  return await axios
    .get("http://localhost:3000/api/savedstacks/")
    .then((response) => setData16(response.data));
};


  const crear = async (IDUSER,NOMBRES,INDEX,IDPROGRAMA,EVENT_ID,COLOR,OBSERVACION,FECHA_CLAVE,ID_SCHEMA,INICIO_MAIN,OUT,TIPO)=>{

    
    await axios.post("http://localhost:3000/api/shifts/", {
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

    obtenerListadoTurnos()
    obtenerListadoTurnosFull()

    INDEXGLOBAL = INDEX;

      //limpiamos los campos
      //customRef.current.value="";
      observationRef.current.value="";

  }


  const crearSaveStack = async (NOMBRESTACK,IDUSER,NOMBRES,INDEX,IDPROGRAMA,EVENT_ID,COLOR,OBSERVACION,FECHA_CLAVE,ID_SCHEMA,INICIO_MAIN,OUT,TIPO)=>{

    
    await axios.post("http://localhost:3000/api/savedstacks/", {
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

    }).then(()=>obtenerListadoStacksSaved());

  }

  const cleanRegistro = async ()=>{
    //new Date(Fecha_Barra).toISOString()

    return await axios
    .put("http://localhost:3000/api/shifts/",
      {   
        
        ids: iduser,
        fch: new Date(fechaBarra).toISOString()

      })
      .then((response) => obtenerListadoTurnos())
      .then((response) => obtenerListadoTurnosFull());

      
      

  };

  const confirmacionAlert = () =>{

    //Limpiamos los registros en la base de datos
    cleanRegistro();
    
    setData11([]);  
    setData9([]);
    auxOut = "--:--:--";
    validador = 1;
    setShowAlert(!showAlert);
    setAuxiliar(!auxiliar);  //este estado notifica al contexto para ser usado en listado
    
    toast.success("Limpieza de lista ejecutado correctamente");
  }

  
  const borrarStack = ()=>{
  
    setMessageTitle("¿Realmente desea eliminar el stack actual?");
    setMessageContenido("Una vez eliminado, no podrá recuperarse.");
    setMessageBtn1Show(true);
    setMessageBtn2Show(true);
    setMessageBtn1("No borrar");
    setMessageBtn2("SI BORRAR");
    setShowAlert(!showAlert);
  }

  const validarTimes = ()=>{
    let respuesta = 0;
    let inicio = new Date(startHour).getTime();
    let salida = new Date(EndHour).getTime();

    if(inicio > salida)
    {     respuesta = 1;
          setMessageTitle("No puede agregar el evento Custom " + "-" + customRef.current.value);
          setMessageContenido("La hora de inicio del evento es mayor que la hora de salida");
          setMessageBtn1Show(true);
          setMessageBtn2Show(false);
          setMessageBtn1("Ok lo corregiré");
          setShowAlert(!showAlert);
    }

    else if(inicio == salida)
    {
          respuesta = 1;
          setMessageTitle("No puede agregar el evento Custom " + "-" + customRef.current.value + "-");
          setMessageContenido("La hora de inicio del evento y la hora de salida son iguales");
          setMessageBtn1Show(true);
          setMessageBtn2Show(false);
          setMessageBtn1("Ok lo corregiré");
          setShowAlert(!showAlert);
    }

    else{
      respuesta = 0;
    }

    return respuesta;
  }

  const validarTimesTimeOut = ()=>{
    let respuesta = 0;
    let inicio = new Date(startHour).toLocaleTimeString();
    let salida = new Date(EndHour).toLocaleTimeString();

    if(inicio > salida)
    {     respuesta = 1;
          setMessageTitle("No se puede agregar el evento TimeOut ");
          setMessageContenido("La hora de inicio del evento es mayor que la hora de salida");
          setMessageBtn1Show(true);
          setMessageBtn2Show(false);
          setMessageBtn1("Ok lo corregiré");
          setShowAlert(!showAlert);
    }

    else if(inicio == salida)
    {
          respuesta = 1;
          setMessageTitle("No se puede agregar el evento TimeOut ");
          setMessageContenido("La hora de inicio del evento y la hora de salida son iguales");
          setMessageBtn1Show(true);
          setMessageBtn2Show(false);
          setMessageBtn1("Ok lo corregiré");
          setShowAlert(!showAlert);
    }

    else{
      respuesta = 0;
    }

    return respuesta;
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

  const desabilitar = ()=>{
    
    
       /* valido que el trabajador tenga rotaciones */
        data10.map((rotationsM)=>(
          rotationsM.totalGrupo == 0 && rotationsM.userId == iduser &&  (validador5 = 1)
        ))

  }

  const getIndex = () =>{
    let actual = index;
    let aumentado = actual +1;
    index = aumentado;
    return aumentado;
  }

const transformarNullIndex1 = ()=>{
  let normal = new Date(fechaBarra);
  let horas = new Date(startHour).getHours();
  let minutos = new Date(startHour).getMinutes();

  let nueva = new Date(normal).setHours(horas);
  let nueva2 = new Date(nueva).setMinutes(minutos);

  return new Date(nueva2);
}

const transformarPGMIndex1 = ()=>{
  let normal = new Date(fechaBarra);
  let horas = new Date(startHour).getHours();
  let minutos = new Date(startHour).getMinutes();

  let nueva = new Date(normal).setHours(horas);
  let nueva2 = new Date(nueva).setMinutes(minutos);

  return new Date(nueva2);
}

const transformarCustomIndexIn = ()=>{
  let normal = new Date(fechaBarra);
  let horas = new Date(startHour).getHours();
  let minutos = new Date(startHour).getMinutes();

  let nueva = new Date(normal).setHours(horas);
  let nueva2 = new Date(nueva).setMinutes(minutos);

  return new Date(nueva2);
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

const transformarCustomIndexOut = ()=>{
  let normal = new Date(fechaBarra);
  let horas = new Date(EndHour).getHours();
  let minutos = new Date(EndHour).getMinutes();

  let nueva = new Date(normal).setHours(horas);
  let nueva2 = new Date(nueva).setMinutes(minutos);

  return new Date(nueva2);
}

const validacion = ()=>{
  let respuesta = 0;

  if( new Date(startHour).toLocaleTimeString() != new Date(fechaAuxGlobal).toLocaleTimeString() )
  {
    respuesta = 1;
  }

 return respuesta;
}




  const add = ()=>{

    //obtenerListadoTurnos(); pendiente por optimizar esto ya que a medida que crezca el sistema se volvera mas lenta la consulta
    index = data1.length;

    //PROCESO PARA AGREGAR UN EVENTO TIPO (Programa - Requerimiento - Secundario - custom - programmer - null-30 - time-out)
    //-------------------------------------------------------------------------------------------------------------------------


    if(EVENTO == "pgm")
    {
       
      //Valida que se halla seleccionado un programa
      if(pgmRef.current.value == "" || pgmRef.current.value == "none" )
      {
          toast.error("Para agregar un Programa, primero seleccionelo de la lista desplegable");
      }

  
      else{

        if(index==0)
        {
          crear(iduser,nombres,getIndex(),pgmRef.current.value,"------","red",observationRef.current.value,new Date(fechaPlaner),"------",transformarPGMIndex1(),"------","Programa");
          setAuxiliar(!auxiliar);  //este estado notifica al contexto para ser usado en listado
          toast.success("Programa agregado al Stack");
        }

        else if(index >= 1)
        {

          if(validacion() == 1)
          {
            setMessageTitle("No puede agregar el programa "+ getNameProgram(pgmRef.current.value,"Programa") +" al stack");
            setMessageContenido("La hora de inicio del programa debe coincidir con la final del evento anterior");
            setMessageBtn1Show(true);
            setMessageBtn2Show(false);
            setMessageBtn1("Ok lo corregiré");
            setShowAlert(!showAlert);
          }

          else{
            crear(iduser,nombres,getIndex(),pgmRef.current.value,"------","red",observationRef.current.value,new Date(fechaPlaner),"------",new Date(fechaAuxGlobal),"------","Programa");
            setAuxiliar(!auxiliar);  //este estado notifica al contexto para ser usado en listado
            toast.success("Programa agregado al Stack");
          }
          
        }

           
      }
      
    }

    else if(EVENTO == "req")
    {
      toast.error("Aun esta pendiente por implemetar el sistema de gestion de requerimientos...");
    }
    
    else if(EVENTO == "secundary")
    {
      
      //Valida que se halla seleccionado un programa
      if(secRef.current.value == "" || secRef.current.value == "none" )
      {
          toast.error("Para agregar un Evento Secundario, primero seleccionelo de la lista desplegable");
      }

      else
      {
        if(index==0)
        {
          crear(iduser,nombres,getIndex(),secRef.current.value,"------","red",observationRef.current.value,new Date(fechaPlaner),"------",transformarPGMIndex1(),"------","Secondary");
          setAuxiliar(!auxiliar);  //este estado notifica al contexto para ser usado en listado
          toast.success("Evento secundario agregado al Stack");
        }

        else if(index >= 1)
        {

          if(validacion() == 1)
          {
            setMessageTitle("No puede agregar el evento secundario "+ getNameProgram(secRef.current.value,"Secondary") +" al stack");
            setMessageContenido("La hora de inicio del evento secundario debe coincidir con la final del evento anterior");
            setMessageBtn1Show(true);
            setMessageBtn2Show(false);
            setMessageBtn1("Ok lo corregiré");
            setShowAlert(!showAlert);
            
          }

          else{
            crear(iduser,nombres,getIndex(),secRef.current.value,"------","red",observationRef.current.value,new Date(fechaPlaner),"------",new Date(fechaAuxGlobal),"------","Secondary");
            setAuxiliar(!auxiliar);  //este estado notifica al contexto para ser usado en listado
            toast.success("Evento secundario agregado al Stack");
          }
          
        }
      }
    }

    else if(EVENTO == "custom")
    {
       //Valida que se halla escrito un nombre para el evento custom
       if(customRef.current.value == "" || customRef.current.value == "none" )
       {
           toast.error("Para agregar un evento Custom, por favor, especifique un nombre descriptivo.");
           customRef.current.focus();
       }

       else{
        //Validamos que los horarios time sean coherentes
        if(validarTimes() == 0)
        {
          if(index==0)
          {
            crear(iduser,nombres,getIndex(),customRef.current.value,"------","red",observationRef.current.value,new Date(fechaPlaner),"------",transformarCustomIndexIn(),transformarCustomIndexOut(),"Custom");
            setAuxiliar(!auxiliar);  //este estado notifica al contexto para ser usado en listado
            toast.success("Evento custom agregado al Stack");
          }
  
          else if(index >= 1)
          {
            if(validacion() == 1)
            {
              setMessageTitle("No puede agregar el evento custom " + customRef.current.value +" al stack");
              setMessageContenido("La hora de inicio del evento debe coincidir con la final del evento anterior");
              setMessageBtn1Show(true);
              setMessageBtn2Show(false);
              setMessageBtn1("Ok lo corregiré");
              setShowAlert(!showAlert);
            }
  
            else{
              crear(iduser,nombres,getIndex(),customRef.current.value,"------","red",observationRef.current.value,new Date(fechaPlaner),"------",new Date(fechaAuxGlobal),transformarCustomIndexOut(),"Custom");
              setAuxiliar(!auxiliar);  //este estado notifica al contexto para ser usado en listado
              toast.success("Evento custom agregado al Stack");
            }
          }
        }
       }


      
     
     


      
    }

    else if(EVENTO == "programmer")
    {
      //Valida que se halla seleccionado un programmer de la lista desplegable
      if(pgmRef.current.value == "" || pgmRef.current.value == "none" )
      {
          toast.error("Para agregar un evento Programmer, primero seleccionelo de la lista desplegable");
      }
      else
      {
        if(index==0)
        {
          crear(iduser,nombres,getIndex(),pgmRef.current.value,"------","red",observationRef.current.value,new Date(fechaPlaner),"------",transformarPGMIndex1(),transformarCustomIndexOut(),"Programmer");
          setAuxiliar(!auxiliar);  //este estado notifica al contexto para ser usado en listado
          toast.success("Programmer agregado al Stack");
        }

        else if(index >= 1)
        {

          if(validacion() == 1)
          {
            setMessageTitle("No puede agregar el evento Programmer "+ getNameProgram(pgmRef.current.value,"Programmer") +" al stack");
            setMessageContenido("La hora de inicio del evento programmer debe coincidir con la final del evento anterior");
            setMessageBtn1Show(true);
            setMessageBtn2Show(false);
            setMessageBtn1("Ok lo corregiré");
            setShowAlert(!showAlert);
          }

          else{
            crear(iduser,nombres,getIndex(),pgmRef.current.value,"------","red",observationRef.current.value,new Date(fechaPlaner),"------",new Date(fechaAuxGlobal),transformarCustomIndexOut(),"Programmer");
            setAuxiliar(!auxiliar);  //este estado notifica al contexto para ser usado en listado
            toast.success("Programmer agregado al Stack");
          }
          
        }
      }
    }

    else if(EVENTO == "null30")
    {
      
      //valido si es el primer elemento o no y opero segun corresponda para un null-30
      if(index==0)
      {
          crear(iduser,nombres,getIndex(),"Null-30","------","red",observationRef.current.value,new Date(fechaPlaner),"------",transformarNullIndex1(),"------","Null");
          toast.success("Null-30 agregado al Stack");
          setAuxiliar(!auxiliar);  //este estado notifica al contexto para ser usado en listado
          
      }

      else if(index >= 1)
      {
        crear(iduser,nombres,getIndex(),"Null-30","------","red",observationRef.current.value,new Date(fechaPlaner),"------",new Date(fechaAuxGlobal),"------","Null");
        toast.success("Null-30 agregado al Stack");
        setAuxiliar(!auxiliar);  //este estado notifica al contexto para ser usado en listado

      }
      
    }

    else if(EVENTO == "timeout")
    {
       //Validamos que los horarios time sean coherentes
       if(validarTimesTimeOut() == 0)
       {
        if(index==0)
        {
          crear(iduser,nombres,getIndex(),"TimeOut","------","red",observationRef.current.value,new Date(fechaPlaner),"------",transformarCustomIndexIn(),transformarCustomIndexOut(),"TimeOut");
          setAuxiliar(!auxiliar);  //este estado notifica al contexto para ser usado en listado
          toast.success("Evento TimeOut agregado al Stack");
        }

        else if(index >= 1)
          {
            if(validacion() == 1)
            {
              setMessageTitle("No se puede agregar TimeOut ");
              setMessageContenido("La hora de inicio del evento debe coincidir con la final del evento anterior");
              setMessageBtn1Show(true);
              setMessageBtn2Show(false);
              setMessageBtn1("Ok lo corregiré");
              setShowAlert(!showAlert);
            }
  
            else{
              crear(iduser,nombres,getIndex(),"TimeOut","------","red",observationRef.current.value,new Date(fechaPlaner),"------",new Date(fechaAuxGlobal),transformarCustomIndexOut(),"TimeOut");
              setAuxiliar(!auxiliar);  //este estado notifica al contexto para ser usado en listado
              toast.success("Evento TimeOut agregado al Stack");
            }
          }

       }



    }

    else{
      //Valida que se halla escrito un nombre para el evento custom
      if(mainEventRef.current.value == "" || mainEventRef.current.value == "none" )
      {
          toast.error("Debe seleccionar un tipo de evento de la lista desplegable.");
          mainEventRef.current.focus();
      }
    }


  }

  const deleteStackSavedSingle = async ()=>{

    return await axios
    .delete("http://localhost:3000/api/shifts/single/"+IDITEMGLOBAL)
  
      .then(() => obtenerListadoTurnos())
      .then(() => IDITEMGLOBAL="")
      .then(()=> setAuxiliar(!auxiliar))  //este estado notifica al contexto para ser usado en listado)
      .then(toast.success("Item eliminado correctamente"));
      
  
  }


  const del = ()=>{

   if(IDITEMGLOBAL == "")
   {
      toast.error("Para eliminar un elemento del stack, primero debe seleccionarlo");
   }

   else{
    deleteStackSavedSingle();
   }
    
  }




  const updateAcciones = (tipo,evento,obse,start,end,e)=>{

     //Actualizamos la info en el formulario

     setStartHour(new Date(start).getTime());
     setEndHour(new Date(end).getTime());
     
     observationRef.current.value=obse;

     if(tipo == "PROGRAMA")
     {
      pgmRef.current.value=evento;
     }

     else if(tipo == "REQUERIMIENTO")
     {
      eventRef.current.value = evento;
     }

     else if(tipo == "CUSTOM")
     {
      customRef.current.value = evento;
     }




      //Aqui lo que nhago es cambiar los estilos para el turno seleccionado;

    if (e.target.classList=="liItem") 
    {

      let aux = document.getElementsByClassName("hover");

      for (let index = 0; index < aux.length; index++) 
      {
        aux[index].classList.remove("hover");
      }

      e.target.classList.add("hover");
    }

     
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
  
  fullPermisions = parseInt(data2[0].Dia);
  fullBreaks = parseInt(data2[0].Dia);
  fullIncapacitys = parseInt(data2[0].Dia);
  fullRecess = parseInt(data2[0].Dia);
  fullLicenses = parseInt(data2[0].Dia);
  
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
   

   const antes = (FECHAINICIO,FECHAFINAL)=>{
    //para el antes debo contar cuantas semanas han pasado desde la registrada hasta la semana actual y hacer la operacion correcta
    //para dejar al dia la rotacion correcta de los turnos
  
    console.log("Entró a ANTES")
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

  function showCalendar(){
    <DatePicker
    className='input-especial'
          selected={calendar}
          onChange={(date) => setCalendar(date)}
          showYearDropdown
          dateFormatCalendar="MMMM"
          yearDropdownItemNumber={15}
          scrollableYearDropdown
    />
  }


  const ciclo = (totalgrupo,actual,domingos,idGrupo,isFijo,nombre,sid)=>{

    let index = 0;
    let turno = "";
    
    //ordenamos de menor a mayor el array de turnos variables
    arrayVariables.sort(function(a,b){return a-b})
    
    
    //Numero de semanas transcurridas (actual aumentado progresivamente)
    for(let i=0; i<domingos; i++ )                                                     
    {
      //Procedimiento exclusivo para los turnos que NO son fijos 
      if(isFijo == false)  
      {
      
        let contador = 1;
        for (let a = 0; a < arrayVariables.length; a++)
        {
          if (contador == arrayVariables.length) 
          {
            index = arrayVariables[0];
            a = arrayVariables.length;
            actual = index;
          }
  
          else{
            if (actual == arrayVariables[a]) 
            {
              index = arrayVariables[a+1];
              a = arrayVariables.length;
              actual=index;
            }
          }
  
          contador++;
          
        }
       
      }
  
      //Procedimiento exclusivo para los turnos que SI son fijos 
      else if(isFijo == true)
      {
          index=actual;
      }
  
      else{
        console.log("isfijo no se definio");
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

  const Pronostico = (PAYROLLID)=>{ 
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

    //creo un nuevo arreglo con los datos de turnos variables para enviarlos a ciclo, y excluyo el actual 0 que es para las personas desactivadas
    data10?.map((RM)=>(
      RM.groupId == globalIdGroup && RM.fijo == false && RM.actual != 0
      ? arrayVariables.push(RM.actual) 
      :null
   ))

   
  
  
  
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
          
          let fechaActual = new Date(fechaBarra).setHours(0,0,0,0);
  
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
    console.log("LA FECHA ACTUAL CORRESPONDE A LA SEMANA ACTUAL " + new Date(FECHAINICIO).toDateString() + " ---- " + new Date(FECHAFINAL).toDateString())
    
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
  
    //OBTENGO LA DIFERENCIA EN DIAS DE LA FECHA FUTURA  Y EL DIA CLAVE
    let fechaInicio = new Date(new Date(DIACLAVE).getTime()).setHours(0,0,0,0);
    let fechaFin    = new Date(new Date(fechaBarra).getTime()).setHours(0,0,0,0);
  
    let diff = fechaFin - fechaInicio;
    let diasPasados = diff/(1000*60*60*24) // (1000*60*60*24) --> milisegundos -> segundos -> minutos -> horas -> días
    //console.log("Dias pasados "+diasPasados + " -- " + new Date(DIACLAVE).toDateString());  
  
    //ya que tengo los dias que han pasado, debo calcular cuantas semanas han pasado
    let Domingos = 0;
  
    for (let index = 1; index <= diasPasados; index++) 
    {
       let fecha = new Date (new Date(DIACLAVE).setHours(0,0,0,0)).setDate(new Date(DIACLAVE).getDate()+index)
       
       if(new Date(fecha).getUTCDay()==0) //cero es el dia domingo
       {
          Domingos++;
       }
  
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

  

  const ok =  ()=>{ 

    obtenerListadoTurnosFull();

    //Validamos que tipo de agregado es, si es del stack sugerido o uno custom (0 => sugerido, 1 => custom)
    if(validador == 0)
    {
      
      //valido que no haya un registro realizado previamente 
      data12.map((shifts)=>(
        shifts.Fecha_clave == new Date(fechaPlaner).toISOString() && shifts.ID_user == iduser &&  (validador2 = 1)
      ))

      /* valido que no se haya asignado un descanso al trabajador*/
      data4?.map((breaks)=>(
        breaks.FechaInicio == new Date(fechaPlaner).toISOString() && breaks.Id_Empleado == iduser &&  (validador3 = 1)
      ))

      
      

      if(validador2 == 1)
      {
        setIDUSER(iduser);
        validador2 = 0;
        toast.error("Ya se ha guardado el stack sugerido para la fecha actual ");
      }

      else if(validador3 == 1)
      {
        validador3 = 0;
        toast.error("El Trabajador ya tiene asignado un descanso, para asignar un turno primero elimine el descanso asignado ");
      }

      else{
        validador2 = 0;
        
        setIDUSER(iduser);
      
      data11.map((stacks,index)=>(stacks.ID_esquema == IDSCHEMAGLOBAL 
        ?
         crear(iduser,
          nombres,
          index,
          stacks.ID_programa,
          stacks._id,
          "Brown",
          observationRef.current.value,
          new Date(fechaPlaner),
          stacks.ID_esquema,
          inicioMain,
          "------",
          stacks.Type,
          stacks.Value,

         )
        : null))

        
         setAuxiliar(!auxiliar);  //este estado notifica al contexto para ser usado en listado
         toast.success("Stack sugerido agregado correctamente");
         

        }
      

      if(observationRef.current.value=="")
        {
          observationRef.current.value = "-----"
        }

        
    }

    else if(validador == 1){
      toast.success("Estack CUSTOM");
    }

    else{
        toast.error("NO SE PUDO DEFINIR EL TIPO DE OPERACION QUE SE DESEA REALIZAR");
    }



    //setIdUsuario(iduser);
    //setIdTurno(IDSCHEMAGLOBAL);
    //setNombreCompleto(nombres);
    //setSubG(subGrupo);
    //setFechaActiva(new Date(fechaPlaner).toString());
    //setStart(new Date(startHour).toString());
    //setEnd(new Date(EndHour).toString());
    //setNombreEvento(Pronostico(iduser));
    //setClr("Brown");
    //setObservacion(observationRef.current.value);

    //agregarTurno(iduser,IDSCHEMAGLOBAL,nombres,subGrupo,fechaPlaner,startHour,EndHour,Pronostico(iduser),"Brown",observationRef.current.value);


    //-----------------------------------------------------------------------------------------------------------------------
    //toast.success("Turno aprobado");
  }

  
  const regalo = async ()=>{

    traerBreaksTrabajador();

    //valido que no haya un registro realizado previamente 
    data12.map((shifts)=>(
      shifts.Fecha_clave == new Date(fechaPlaner).toISOString() && shifts.ID_user == iduser &&  (validador2 = 1)
    ))

    /* valido que no se haya asignafdo un descanso al trabajador*/
    data4?.map((breaks)=>(
      breaks.FechaInicio == new Date(fechaPlaner).toISOString() && breaks.Id_Empleado == iduser && (validador3 = 1)
    ))

    

    if(validador2 == 1)
    {
      setIDUSER(iduser);
      validador2 = 0;
      toast.error("El trabajador ya tiene asiganado un turno para la fecha actual, para asignar un descanso, primero elimine el turno asignado")
    }

    else if(validador3 == 1)
    {
      validador3 = 0;
      toast.error("El trabajador ya tiene asignado un descanso para esta fecha, no es necesario confirmarla") 
    }

    else{

      validador2 = 0;
      validador3 = 0;

      //Asignamos un descanso al trabajador
      await axios.post("http://localhost:3000/api/breaks/", {

          nombre: "Descanso Normal o Genérico",
          año:new Date(fechaBarra).getFullYear().toString(),
          fechainicio: new Date(fechaBarra).toISOString(),
          fechafinal:  new Date(fechaBarra).toISOString(),
          observacion: "Este es un descanso asignado directamente desde el programador de turnos",
          estado: true,
          nombreempleado: nombres,
          idempleado: iduser,
      });

      toast.success("Se asignó un descanso al trabajador");
    }


    //Notificamos de el cambio a la barra para que se ponga en color verde de fondo que es el color asignado a un descanso
    setAuxiliar(!auxiliar);  //este estado notifica al contexto para ser usado en listado

    
  }

  const clean = ()=>{

     /* valido que no se haya asignafdo un descanso al trabajador*/
     data4.map((breaks)=>(
      breaks.FechaInicio == new Date(fechaPlaner).toISOString() && breaks.Id_Empleado == iduser &&  (validador3 = 1)
    ))

    if(validador3 == 1)
    {
      validador3 = 0;
      toast.error("El trabajador ya tiene asignado un descanso para esta fecha, para realizar cualquier otra acción primero elimine el descanso asignado")
    }

    else{
      borrarStack();
    }
    
  }

  

  

  const edit = ()=>{

    toast.success("Turno actualizado");
  }

  const stack = ()=>{


      /* valido que no se haya asignafdo un descanso al trabajador*/
      data4.map((breaks)=>(
        breaks.FechaInicio == new Date(fechaPlaner).toISOString() && breaks.Id_Empleado == iduser &&  (validador3 = 1)
      ))
  
      if(validador3 == 1)
      {
        validador3 = 0;
        toast.error("El trabajador ya tiene asignado un descanso para esta fecha, para realizar cualquier otra acción primero elimine el descanso asignado")
      }

      else{
        getAllStacks();
        traerRotations();
        validador = 0;
        toast.success("Stack según turno actualizado");
      }


    
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

   const devolverIN = ()=>{
    let respuesta;
    let fecha;

    data9?.map((rotations)=>(
      rotations._id == IDSCHEMAGLOBAL && (respuesta = rotations.HoraInicio, HORAINGLOBAL = rotations.HoraInicio )
    ))

    respuesta = new Date(respuesta);
    inicioMain = respuesta;
    respuesta = new Date(respuesta).toLocaleTimeString();
  
    
    return respuesta;
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
    getProgrammers();
    SETEVENTO(mainEventRef.current.value);
  }

  const getTime = (fecha) =>{
    let recibida = new Date(fecha).getTime();
    let nueva = new Date(recibida).toLocaleTimeString();

    //Valido si es el primer index para guardar el valor en una variable
    if(index==1)
    {
      //FECHAINICIOGLOBAL = nueva;
    }
    
    return nueva;
  }


  const guardar = ()=>{

    setMessageTitle("Ho puede agregar el programa al stack");
    setMessageContenido("La hora de inicio debe ser igual al la final del evento anterior");
    setMessageBtn1Show(true);
    setMessageBtn2Show(false);
    setMessageBtn1("Ok lo corregiré");
    setShowAlert(!showAlert);
  }

  const limpiar = ()=>{

    setMessageTitle("¿Realmente desea borrar todos los registros del stack?");
    setMessageContenido("Si el stack no se ha guardado se perderá");
    setMessageBtn1Show(false);
    setMessageBtn2Show(true);
    setMessageBtn2("Sí limpiar");
    setShowAlert(!showAlert);
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
    let salida =  new Date(transformarGenericSalida()).getTime();
    let inicio =  new Date(transformarGenericIn()).getTime();
    let nueva = (salida - inicio)/ (1000 * 60);

    let respuesta = new Date().setHours(0,0,0,0);
    respuesta = new Date(respuesta).setMinutes(nueva);

    return new Date(respuesta).toLocaleTimeString();
  }

  const guardarStack = ()=>{
    let identificador = 0;

    data16?.map((savedStacks)=>(
      saveStackRef.current.value == savedStacks.Nombre_Stack && (identificador = 1)
    ))

    if(saveStackRef.current.value == "")
    {
      toast.error("Para salvar un stack creado, primero debe asignarle un nombre");
      saveStackRef.current.focus();
    }

    else if(identificador == 1)
    { 
      //Validar si ya existe el nombre
      toast.error("El nombre que desea asignar al stack ya existe");
    }

    else if(data1.length==0)
    { 
      //Validar si hay un stack para guardar, es decir que no este en blanco
      toast.error("No hay un stack para guardar... la ventana de Stacks esta vacia");
    }
    else{
     
      data1?.map((shift)=>(

        crearSaveStack(
          saveStackRef.current.value,
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

      saveStackRef.current.value = "";
      toast.success("Stack guardao correctamente");
    }
  }
 
  //Funcion que sobrescribe la indormacion en data1
 const traer= async (nombreStack) => {

  nameEventSavedGlobal = nombreStack;

  return await axios
    .get("http://localhost:3000/api/savedstacks/corto/",
    {
      params:{
        nombre: nombreStack,
      }
    })
    .then((response) => setData1(response.data))
    .then(saveStackRef.current.value = nombreStack)
    .then(()=>(setValidaColor(true)))
    .then(toast.success("Stack actualizado"));

}

const updateStackSaved = async ()=>{

  return await axios
  .put("http://localhost:3000/api/savedstacks/"+nameEventSavedGlobal,
    {
      nombre:saveStackRef.current.value,
    })
    .then(() => obtenerListadoStacksSaved())
    .then(toast.success("Nombre del stack guardado, editado correctamente"));
    

}

const deleteStackSaved = async ()=>{

  return await axios
  .delete("http://localhost:3000/api/savedstacks/"+nameEventSavedGlobal)

    .then(() => obtenerListadoStacksSaved())
    .then(toast.success("Stack eliminado correctamente"))
    .then(()=>setData1([]));
    

}




//boton editar stack
const editSaveStack = ()=>{
  if(nameEventSavedGlobal == "")
  {
    toast.error("Para editar el nombre de un stack guardado, primero seleccionelo dando doble click");
  }

  else{
    updateStackSaved();
    saveStackRef.current.value = "";
    nameEventSavedGlobal="";
  }
}

const openRight = ()=>{

  //traemos la data
  obtenerListadoTurnos();

  //Limpiamos el input de nombre stcak saved
  saveStackRef.current.value="";

  //reiniciamos la variable que indica que se habia llamado un stack guardado
  nameEventSavedGlobal = "";

  //Mostramos o ocultamos la ventana
  setShowRight(!showRight);

  //reiniciamos el color por defecto del item
  setValidaColor(false);

  //limpiamos la variable que tiene el id de un item previamente seleccionado
  IDITEMGLOBAL = "";
}

const eliminarItemSavedStack = ()=>{

  if(nameEventSavedGlobal == "")
  {
    toast.error("Para eliminar un stack guardado, primero seleccionelo dando doble click");
  }

  else{
    deleteStackSaved();
    saveStackRef.current.value = "";
    nameEventSavedGlobal="";
  }
  
}


const reGet = ()=>{

  //traemos la data
  obtenerListadoTurnos();

  //Limpiamos el input de nombre stcak saved
  saveStackRef.current.value="";

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

const restaurarValor = ()=>{
  validador6 = 0;
}


const traerValores =()=>{
  data1?.map((shifts)=>(
    shifts.Color=="red" && (validador6 = 1)
  ))
}


const aplicarStack = ()=>{
  if(nameEventSavedGlobal == "")
  {
    toast.error("Para aplicar un stack guardado, primero seleccionelo dando doble click");
  }

  else{

    //toast.success("Es.. " + data1.length);
    
    data1?.map((savedStacks)=>(

      crear(
        iduser,
        nombres,
        savedStacks.Index,
        savedStacks.Event_name,
        savedStacks.ID_event,
        savedStacks.Color,
        savedStacks.Observacion,
        new Date(fechaBarra),
        savedStacks.Id_Schema,
        new Date(savedStacks.Inicio_main),
        savedStacks.Out,
        savedStacks.Type)
    ))

      obtenerListadoTurnos();
      obtenerListadoTurnosFull();

      //Notificamos de el cambio a la barra para que se ponga en color verde de fondo que es el color asignado a un descanso
      setAuxiliar(!auxiliar);  //este estado notifica al contexto para ser usado en listado

      saveStackRef.current.value = "";
      toast.success("Stack aplicadocorrectamente");
  
          
  }
}

//Funcion que obtiene la data de la api - listado de holidays segun el año actual

const llamarAño = async()=>{
  return await axios
    .get('http://localhost:3000/api/holidays/'+new Date(fechaBarra).getFullYear())
    .then((respuesta1) => setFechaFull(respuesta1.data));
    
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



   /* *********************************************************************************************************************** */
     /* EFECTOS
   /* *********************************************************************************************************************** */
  

  useEffect(() => {
    obtenerListadoPrograms();
  }, []);

  useEffect(()=> {
    obtenerListadoTurnos();
    setPgm("---------------------------------");
    setEvent("---------------------------------");
    setCustom("");
    setObs("");
  }, [IDUSER, FECHA]);

  useEffect(() => {
    getRules();
  }, []);

  
 useEffect(()=>{
  traerPermisosTrabajador();
 },[])

 useEffect(()=>{
  traerBreaksTrabajador();
 },[auxiliar])

 useEffect(()=>{
  traerIncapacitysTrabajador();
 },[])

 useEffect(()=>{
  traerRecessTrabajador();
 },[])

 useEffect(()=>{
  traerLicensesTrabajador();
 },[])

 useEffect(()=>{
  traerPayroll();
 },[])

 useEffect(()=>{
  traerRotations();
 },[])

 useEffect(()=>{
  getAllRotationsManager();
 },[])

 useEffect(()=>{
  getAllStacks();
 },[])

 useEffect(()=>{
  obtenerListadoTurnosFull();
 },[])

 useEffect(()=>{
  getSubstitutions();
 },[])
 

 useEffect(()=>{
  getNotatiosIdFecha();
 }, [IDUSER, FECHA])

 useEffect(()=>{
  getProgrammers();
 },[showRight])

 useEffect(()=>{
  obtenerListadoStacksSaved();
 },[showRight])


 useEffect(()=>{
  traerValores();
 },[]);

 useEffect(()=>{
  //llamarAño();
 },[fechaBarra]);



 

 

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
            <img src={Calendar} alt="calendar" className="img-calendar" onClick={showCalendar}/>
          </div>

          <div className="actividad">
              <div className="actividad_title">
                Time Out
              </div>
              <div className="actividad_container">
              <div className="actividad_lista">
                  <ul>
                    <li className='liLista' key={iduser}>Permissions<span className='indicador'>
                      {
                       fullPermissionsUser(iduser)
                      }
                    </span><progress 
                      value={fullPermissionsUser(iduser)} 
                      max={parseInt(data2[0].Dia)} 
                      className='progress'/>
                    </li>


                    <li className='liLista' key={iduser}>Breaks<span className='indicador'>
                      {
                       fullBreaksUser(iduser)
                      }
                      </span><progress 
                      value={fullBreaksUser(iduser)} 
                      max={parseInt(data2[0].Dia)} 
                      className='progress'/>
                    </li>

                    
                    <li className='liLista' key={iduser}>Incapacitys<span className='indicador'>
                      {
                        fullIncapacitysUser(iduser)
                      }
                     </span><progress 
                       value={fullIncapacitysUser(iduser)} 
                       max={parseInt(data2[0].Dia)} 
                       className='progress'/>
                    </li>




                    <li className='liLista' key={iduser}>Recess<span className='indicador'>
                       {
                        fullRecessUser(iduser)
                       }
                      </span><progress 
                        value={fullRecessUser(iduser)} 
                        max={parseInt(data2[0].Dia)} 
                        className='progress'/>
                    </li>



                    <li className='liLista' key={iduser}>Licenses<span className='indicador'>
                       {
                        fullLicensesUser(iduser)
                       }
                      </span><progress
                        value={fullLicensesUser(iduser)} 
                        max={parseInt(data2[0].Dia)} 
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

          <div className={showAlert == true ? "alert" : "hideAlert"}>
            <img src={handStop} alt="stop" className='handStop'/>
            <div className="cierre" onClick={()=>setShowAlert(!showAlert)}>x</div>
            <div className="alert-conten">
              {messageTitle}
            </div>
            <div className="alert-subtitulo">
            {messageContenido}
            </div>
            <div className="alert-butoms">
              { messageBtn1Show == true && <div className="btn-no" onClick={()=>setShowAlert(!showAlert)}>{messageBtn1}</div>}
              { messageBtn2Show == true && <div className="btn-confirm" onClick={()=>confirmacionAlert()}>{messageBtn2}</div>}
            </div>

          </div>


            <div className={showNotas == true ? "notasShow" : "notasHide"}>
              <h3 className='notas-title'>
                Notas para <span className='nombreTitulo'>{nombres}</span> <br /> 
                _____________________________________________________
              </h3>

              {
                data15?.map((anotaciones,index)=>(  
                  <span className='main-nt' key={anotaciones._id}>
                    <h5 key={index} className='numero-notas'>{index+1}</h5>
                    <p className='notas-contenido' key={anotaciones._id}>
                      {anotaciones.Contenido}
                    </p>
                  </span>
                ))
              }
              
            </div>

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
                        item.grupo == gp && item.activo == true ? <li className={nombres == item.nombres + " " + item.apellidos ? 'liListaItemActual' : 'liListaItem'} key={item._id}>{item.nombres + "  " + item.apellidos} <span className='indicador'>75</span><progress value={75} max={100} className='progress'/></li>:null
                        
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
                            validador4 = 0,
                            validador5 = 0,
                            desabilitar(),

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
                  <img src={Pencil} alt="pencil" className='img-butons' onClick={edit}/>
                </div>
                <div className="containerSingleButtom">
                 <img src={Plus} alt="plus" className='img-butons' onClick={add}/>
                </div>
                <div className="containerSingleButtomDel">
                 <img src={Trash} alt="trash" className='img-butons' onClick={del}/>
                </div>
               
              </div>


                {
                  traerValores()
                }

                {
                  validador6 == 1
                  ?

                  <div className="containerSingleButtom-open">
                   <img src={flechaLeft} alt="plus" className='img-butons' onClick={()=>openRight()}/>
                  </div>

                  :

                  validador6 == 0

                  ? 

                     <div className="containerSingleButtom-agendado">
                      <img src={Ok} alt="plus" className='img-butons' onClick={()=>toast.success("Para el trabajador actual ya se ha asignado el turno sugerido según rotación.")}/>
                     </div>

                  : null

                }
                
              
                

            
            </div>

           

            <div className="list-turnos">
              <div className="titulo">
                <h2>TURNO SEGUN ROTACION</h2>
                
                <p className='name-turno-rotacion'>{Pronostico(iduser)}</p>
                
              </div>


              {/* ANTES QUE NADA DEBO VALIDAR SI YA HAY O NO UNA PROGRAMACION GUARDADA PARA EL USUARIO  */}

              {
                /* valido que no se haya asignado un descanso al trabajador*/
                  data4.map((breaks)=>(
                    breaks.FechaInicio == new Date(fechaPlaner).toISOString() && breaks.Id_Empleado == iduser &&  (validador4 = 1)
                  ))
              }

             {
              traerValores()
             }

              {
                data1.length == 0 
                ?
                
                <ul className="ulLista-rotation">

                  {/* Esta imagen se debe mostrar solo si se asigno un descanso al trabajador*/}
                  {validador5 == 1 
                    ? 
                      <img src={less} alt="less"  className='img-coffe'/> 
                      
                    : validador4 == 1 && 
                    
                    <img src={cafe} alt="coffe"  className='img-coffe'/>
                  }
                  
                  
                  {
                    validador5 == 0 && validador4 == 0 &&
                    <span className='horaIN' key={data1.length}>{devolverIN() == "Invalid Date" ? "--:--:--" : devolverIN() }{validador6=1}</span>
                    
                  }

                 
                  

                  {
                    
                    data11?.map((stack)=>( 
                  
                  stack.ID_esquema == IDSCHEMAGLOBAL && validador4 == 0 && validador5 == 0 ? 
                  (
                   
                    <li className="liItem-rotation" onClick={(e)=>updateAcciones()}   ref={pruebaRef} key={stack._id}>
                    
                      {resolver(stack.ID_programa,stack.Type,stack.ID_programa,stack.Duration,stack.Order,stack.Value)}
                      
                    </li>
                  )

                  : null
                  
                  
                ))
                }
                {
                  validador5 == 0 && validador4 == 0 &&
                  <span className='horaOUT'>{auxOut == "Invalid Date" ? "--:--:--" : auxOut }</span>
                }
                
                  </ul>
                  
                
                    
                :   
                
                //validar color rojo aqui
                //---------------------------------------------------------------------------------------------------


                
                
                validador6 == 1 
                ?

             
            
                  <ul className="ulLista-rotation-saved">
                  <span className='horaIN'>{devolverIN() == "Invalid Date" ? "--:--:--" : devolverIN() }</span>
                  {
                    data11?.map((stack)=>( 
                  
                    stack.ID_esquema == IDSCHEMAGLOBAL 
                    ? 
                      (
                        <li className="liItem-rotation" onClick={(e)=>updateAcciones()}   ref={pruebaRef} key={stack._id}>
                        
                          {resolver(stack.ID_programa,stack.Type,stack.ID_programa,stack.Duration,stack.Order,stack.Value)}
                          
                        </li>
                      )

                    : null
                  
                  
                    ))
                   }
                    <span className='horaOUT'>{auxOut == "Invalid Date" ? "--:--:--" : auxOut }</span>
                    {restaurarValor()}
                  </ul>

                  : 

                  validador6 == 0

                  ?

                

                  <ul className="ulLista-rotation-ok">
                  <span className='horaIN'>{devolverIN() == "Invalid Date" ? "--:--:--" : devolverIN() }</span>
                  {
                    data11?.map((stack)=>( 
                  
                    stack.ID_esquema == IDSCHEMAGLOBAL 
                    ? 
                      (
                        <li className="liItem-rotation" onClick={(e)=>updateAcciones()}   ref={pruebaRef} key={stack._id}>
                        
                          {resolver(stack.ID_programa,stack.Type,stack.ID_programa,stack.Duration,stack.Order,stack.Value)}
                          
                        </li>
                      )

                    : null
                  
                  
                    ))
                   }
                    <span className='horaOUT'>{auxOut == "Invalid Date" ? "--:--:--" : auxOut }</span>

                    {restaurarValor()}
                  </ul>

                  
                : null
              }
    
              



              <div className={validador5 == 1 ? "seccionButons2-hide" :"seccionButons2"}>
              <div className="containerSingleButtom">
              {
                data15 != 0 ?

                <span className='noti'>
                  {data15.length}
                </span>

                :

                null
              }
                

                  <img src={documento} alt="pencil" className='img-butons' onClick={()=>setShowNotas(!showNotas)}/>
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
          </div> 

         

          <div className='aux1'>
           <div className="aux1_title">
            Time Remating
           </div>
           <div className="aux1_label">
            120.5
           </div>
          </div>







         

          <div className="barraButom">
           <div className="inspectorContainer">

                  <ul>
                    <li className='liInspector2' key={iduser}>
                      <span className='nameUS'></span>
                      <div className="cajaNumero">
                       
                       { 
                         data2.map((rules_Dia)=>(
                          createArray(rules_Dia.Dia)
                        ))
                        
                       }

                       {
                        
                          numDias2?.map((item,index)=>(
                            <div className="cuadro201" key={index}>{item.dia}</div>
                          ))
                          
                       }
                      </div>
                    </li>
                  </ul>

                  {
                    data8?.map((item)=>(
                      item.grupo == gp &&  
                      
                      <ul className='Separador' key={item._id}>
                        <li className='liInspector'>
                          <span className={nombres == item.nombres + " " + item.apellidos ? 'nameUSActual' : 'nameUS'}>{item.nombres + " " + item.apellidos}</span>
                          <div className="cajaNumero">
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                            <div className="cuadro20">10</div>
                          </div>
                        </li>
                     </ul>
                      
                      
                    ))
                  }
                
           </div>
          </div>











          <div className='aux2'>
          <div className="aux1_title">
            Full Time
           </div>
           <div className="aux1_label">
            {fullTime() + " Minutos"}
            <p className='aux_label-1'>{(fullTime()/60).toFixed(1) + " Horas"}</p>
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
            
    </>
  );

  
}