/* eslint-disable react/prop-types */

import  './ModalPlanner1.css'

/* Import recursos */
import Anita from '../../assets/Anita.jpg'
import Calendar from '../../assets/calendar.webp'
import Clock from '../../assets/bx-time-five.svg'
import Pencil from '../../assets/pencil.svg'
import Plus from '../../assets/Plus.svg'
import Trash from '../../assets/trash.svg'
import Clean from '../../assets/brush.svg'


import Balanza from '../../assets/balanza.png'
import cafe from '../../assets/coffee.svg'
import Calendario from '../../assets/calendario.png'
import Ok from '../../assets/Ok.svg'
import documento from '../../assets/document.svg'
import capas from '../../assets/capas.svg'



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

let totalGrupo = 0;
let totalSchema = 0;
let auxOut;
let fullTime = 0;

//Variables 
let DiaClave;
let totalSche;
let totalGP;
let actual;
let IDGLOBAL;
let IDSCHEMAGLOBAL;
let HORAINGLOBAL;

let validador = 0;
let inicioMain;
let startEvent;
let endtEvent;

export default function ModalPlanner1({estado,cambiarEstado,nombres,cargo,fechaPlaner,iduser,subGrupo,color,gp,gpid}) {

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
  const [showNotas, setShowNotas] = useState(false);

 

  const [startHour, setStartHour] = useState(new Date());
  const [EndHour, setEndHour] = useState(new Date());
  const [IDUSER, setIDUSER] = useState();
  const [FECHA, setFECHA] = useState();

  /* Estados para el datepicker */
  const [calendar, setCalendar] = useState(new Date());
  /* Estados para los controles del formulario de acciones */
  const [pgm, setPgm] = useState("---------------------------------");
  const [event, setEvent] = useState("---------------------------------");
  const [custom, setCustom] = useState("");
  const [obs, setObs] = useState("");

  const [pr,setPr]= useState(0);

  //Referencias
  const pgmRef = useRef();
  const eventRef = useRef();
  const customRef = useRef();
  const startRef = useRef();
  const endRef = useRef();
  const observationRef = useRef();
  const pruebaRef = useRef();

 
  
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
      .get("http://localhost:3000/api/shifts")
      .then((response) => setData12(response.data));
  };



  const crear = async (IDUSER,NOMBRES,INDEX,ID_PROGRAMA,EVENT_ID,COLOR,OBSERVACION,FECHA_CLAVE,ID_SCHEMA,INICIO_MAIN,TIPO)=>{

    await axios.post("http://localhost:3000/api/shifts/", {
      idUser: IDUSER,
      nombres: NOMBRES,
      index: INDEX,
      idPrograma: ID_PROGRAMA,
      eventId: EVENT_ID,
      color: COLOR,
      observacion: OBSERVACION,
      fechaClave: FECHA_CLAVE,
      idSchema: ID_SCHEMA,
      inicioMain: INICIO_MAIN,
      tipo: TIPO

    });

    obtenerListadoTurnos();

      //limpiamos los campos
      customRef.current.value="";
      observationRef.current.value="";

  }


  const add = ()=>{

    if(pgmRef.current.value!='none')
    {
      //Validacion para solo PGM
      if(eventRef.current.value=='none' && customRef.current.value == '')
      {
        crear(iduser,nombres,subGrupo,fechaPlaner,startHour,EndHour,pgmRef.current.value,color,"PROGRAMA",observationRef.current.value);
        toast.success("Programa agregado a los turnos");
      }
      else{
        toast.error("Si desea agregar un programa, la casilla Requerimiento y Custom no deben especificarse");
      }

    }


    if(eventRef.current.value!='none')
    {
      //Validacion para solo REQUERIMIENTO
      if(pgmRef.current.value=='none' && customRef.current.value == '')
      {
        crear(iduser,nombres,subGrupo,fechaPlaner,startHour,EndHour,eventRef.current.value,color,"REQUERIMIENTO",observationRef.current.value);
        toast.success("Requerimiento agregado a los turnos correctamente");
      }
      else{
        toast.error("Si desea agregar un Requerimiento, la casilla Programa y custom no deben especificarse");
      }
    }

    if(customRef.current.value!='')
    {
      //Validacion para solo CUSTOM
      if(pgmRef.current.value=='none' && eventRef.current.value == 'none')
      {
        crear(iduser,nombres,subGrupo,fechaPlaner,startHour,EndHour,customRef.current.value,color,"CUSTOM",observationRef.current.value);
        toast.success("Evento Custom agregado a los turnos correctamente");
      }
      else{
        toast.error("Si desea agregar un Custom , la casilla Programa y Requerimiento no deben especificarse");
      }
    }


    if(pgmRef.current.value=='none' && eventRef.current.value=='none' && customRef.current.value=='')
    {
        toast.error("Debe especificar una de los tres opciones, Programa - Requerimiento - Custom");
    }

     /* 
       
     
       3) AL HACER CLICK SOBRE EL EVENTO O PROGRAMA TRAER LA HORA DE INICIO Y FINAL
       3.1) AL HACER CLICK SOBRE EL TURNO ACTUALIZAR LA INFORMACION EN ACCIONES
       4) ORGANIZARLOS LOS TURNOS SEGUN LA HORA DE INICIO O START

     */
   
      
  }

  


  const del = ()=>{

   toast.error("quiere eliminar?");
    
  }

  const turnoFree = ()=>{

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


  const reset1 = () =>{
   customRef.current.value="";
   


   data?.map((pgm)=>(
     pgmRef.current.value == pgm.nombre ? setStartHour(new Date(pgm.Start).getTime()) : null
  ))

  data?.map((pgm)=>(
    pgmRef.current.value == pgm.nombre ? setEndHour(new Date(pgm.End).getTime()) : null
 ))
  }

  const reset2 = () =>{
    customRef.current.value="";
  }

  /*
  const validate = ()=>{
    toast.success("Aqui se valida los turnos por defecto segun programaci'on");
  }

  */

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
      idUsuario==rotationsManager.userId && (turno = rotationsManager.SchemaName)
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
  
    //primero valido si el numero de grupos es igual al numero de schemas
  
      let pronostico;
      
      //hago el pronostico 
      data10?.map((rotationsManager)=>(
        idUsuario==rotationsManager.userId && (
          pronostico=ciclo(rotationsManager.totalGrupo,rotationsManager.actual,Domingos,rotationsManager.groupId,rotationsManager.fijo,rotationsManager.userName,rotationsManager.schemaId)
        )
      ))
  
  
      return pronostico;
  
    
  }

  const getInicio = ()=>{

  }

  const ok = ()=>{ 

    //Validamos que tipo de agregado es, si es del stack sugerido o uno custom (0 => sugerido, 1 => custom)
    if(validador == 0)
    {
      obtenerListadoTurnos();

      if(observationRef.current.value=="")
      {observationRef.current.value = "-----"}

      //agregarTurno(iduser,IDSCHEMAGLOBAL,nombres,subGrupo,fechaPlaner,startHour,EndHour,Pronostico(iduser),"Brown",observationRef.current.value);
      
        
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
          stacks.Type,

         )
        : null))
        



         setAuxiliar(!auxiliar);  //este estado notifica al contexto para ser usado en listado
         toast.success("Estack Sugerido");
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

  
  const regalo = ()=>{
    //Asignamos un descanso al trabajador
    toast.success("Se asignó un descanso al trabajador");
  }

  const clean = ()=>{
    toast.success("Limpieza de lista ejecutado correctamente");
    setData11([]);
    setData9([]);
    auxOut = "--:--:--";
    validador = 1;
  }

  const edit = ()=>{

    toast.success("Turno actualizado");
  }

  const stack = ()=>{
    toast.success("Stack según turno actualizado");
    getAllStacks();
    traerRotations();
    validador = 0;
  }

  const getDurationprogram = (start, end) =>{
    let diferencia;
    var fechaInicio = new Date(start).getTime();
    var fechaFin    = new Date(end).getTime();

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
 },[])

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
 


  return (
    <>
    <Toaster />
      {estado && (
        <div className="container-modal1">
          
          {/*CABECERA */}
          <div className="cabecera">
            
            <img src={Anita} alt="anita" className="img-Profile" />
            <h3 className="nombre">
              {nombres}
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
                    <li className='liLista'>Permissions<span className='indicador'>
                      {
                       fullPermissionsUser(iduser)
                      }
                    </span><progress 
                      value={fullPermissionsUser(iduser)} 
                      max={parseInt(data2[0].Dia)} 
                      className='progress'/>
                    </li>


                    <li className='liLista'>Breaks<span className='indicador'>
                      {
                       fullBreaksUser(iduser)
                      }
                      </span><progress 
                      value={fullBreaksUser(iduser)} 
                      max={parseInt(data2[0].Dia)} 
                      className='progress'/>
                    </li>

                    
                    <li className='liLista'>Incapacitys<span className='indicador'>
                      {
                        fullIncapacitysUser(iduser)
                      }
                     </span><progress 
                       value={fullIncapacitysUser(iduser)} 
                       max={parseInt(data2[0].Dia)} 
                       className='progress'/>
                    </li>




                    <li className='liLista'>Recess<span className='indicador'>
                       {
                        fullRecessUser(iduser)
                       }
                      </span><progress 
                        value={fullRecessUser(iduser)} 
                        max={parseInt(data2[0].Dia)} 
                        className='progress'/>
                    </li>



                    <li className='liLista'>Licenses<span className='indicador'>
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

            <div className={showNotas == true ? "notasShow" : "notasHide"}>
              <h3 className='notas-title'>
                Notas para {nombres} <br />
                _____________________________________________________
              </h3>

              <p className='notas-contenido'>
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit. 
                  Veniam, ipsum! Quis illum reprehenderit, sequi voluptatem tempore aliquam aut. 
                  Officia reprehenderit dolorem laudantium! Tempore deserunt vel dignissimos optio animi eveniet at.
              </p>
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
              <div className="leftTime">
                Time-Pre
                <input type="number" className='leftTime-input' placeholder='minutos' />
              </div>

              <div className="rightTime">
                Time-Post
                <input type="number" className='leftTime-input' placeholder='minutos'/>
              </div>

              <div className="titulo">
                <h2>ACCIONES</h2>
              </div>
              <div className="mainContainer">
              

                <h3 className="subTitulo">PROGRAMA - REQUERIMIENTO</h3>
                <h5 className='tipo'>Programa</h5>
                <select name="turnoSeleccionado" className='selectedBox' ref={pgmRef} onChange={reset1}>
                <option key="none" value="none" className='selecteItem' >{pgm}</option>
                  {
                    data?.map((pgm)=>(
                      pgm.Type=="Main"&&
                      <option key={pgm._id} value={pgm.nombre} className='selecteItem' ref={pgmRef}>{pgm.nombre}</option>
                    ))
                  }
                  
                </select>

                <h5 className='tipo'>Requerimiento</h5>
                <select name="turnoSeleccionado" className='selectedBox' ref={eventRef} id='pgm' onChange={reset2}>
                <option key="none" value="none" className='selecteItem'>{event}</option>
                  {
                    data?.map((pgm)=>(
                      <option key={pgm._id} value={pgm.nombre} className='selecteItem' ref={eventRef}>{pgm.nombre}</option>
                    ))
                  }
                  
                </select>

                <h5 className='tipo'>Custom</h5>
                <input type='text' className='selectedBox2' ref={customRef} id='custom' placeholder='---------------------------------' defaultValue={custom}/>
                
                
                

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
                            timeIntervals={15}
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
                            timeIntervals={15}
                            timeCaption="End"
                            dateFormat="HH:mm aa"
                            ref={endRef}
                          />
                  </div>
                </div>


                <h3 className="subTitulo">OBSERVACIONES</h3>
                <textarea name="observaciones" className='observaciones' ref={observationRef} defaultValue={obs}></textarea>
                
              </div>

              <div className="seccionButons">
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
                /*
                <div className='validar'>
                 <img src={Arrow} alt="trash" className='imgBtnValidate' onClick={validate}/>
                </div>
                */
              }
              
            </div>

            <div className="list-turnos">
              <div className="titulo">
                <h2>TURNOS PROGRAMADOS</h2>
                <p className='name-turno-rotacion'>{Pronostico(iduser)}</p>
                
              </div>

              

              {/* ANTES QUE NADA DEBO VALIDAR SI YA HAY O NO UNA PROGRAMACION GUARDADA PARA EL USUARIO  */}

              {
                data1.length == 0 
                ?
                
                
                <ul className="ulLista-rotation">
                  <span className='horaIN'>{devolverIN() == "Invalid Date" ? "--:--:--" : devolverIN() }</span>

                  {
                    data11?.map((stack)=>(
                  
                  stack.ID_esquema == IDSCHEMAGLOBAL ? 
                  (
                    <li className="liItem-rotation" onClick={(e)=>updateAcciones()}   ref={pruebaRef} key={stack._id}>
                     
                      {resolver(stack.ID_programa,stack.Type,stack.ID_programa,stack.Duration,stack.Order,stack.Value)}
                      
                    </li>
                  )

                  : null
                  
                  
                ))
                }
                <span className='horaOUT'>{auxOut == "Invalid Date" ? "--:--:--" : auxOut }</span>
                  </ul>
                  
                
                    
                : 

                <ul className="ulLista-rotation-ok">
                  <span className='horaIN'>{devolverIN() == "Invalid Date" ? "--:--:--" : devolverIN() }</span>
                  {
                    data11?.map((stack)=>(
                  
                  stack.ID_esquema == IDSCHEMAGLOBAL ? 
                  (
                    <li className="liItem-rotation" onClick={(e)=>updateAcciones()}   ref={pruebaRef} key={stack._id}>
                     
                      {resolver(stack.ID_programa,stack.Type,stack.ID_programa,stack.Duration,stack.Order,stack.Value)}
                      
                    </li>
                  )

                  : null
                  
                  
                ))
                }
                <span className='horaOUT'>{auxOut == "Invalid Date" ? "--:--:--" : auxOut }</span>
                  </ul>
              }
    
              



              <div className="seccionButons2">
              <div className="containerSingleButtom">
                <span className='noti'>
                  3
                </span>
                  <img src={documento} alt="pencil" className='img-butons' onClick={()=>setShowNotas(!showNotas)}/>
                </div>
                <div className="containerSingleButtom">
                  <img src={capas} alt="pencil" className='img-butons' onClick={stack}/>
                </div>
                <div className="containerSingleButtom">
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
                    <li className='liInspector2'>
                      <span className='nameUS'></span>
                      <div className="cajaNumero">
                        <div className="cuadro201">S</div>
                        <div className="cuadro201">D</div>
                        <div className="cuadro201">L</div>
                        <div className="cuadro201">M</div>
                        <div className="cuadro201">M</div>
                        <div className="cuadro201">J</div>
                        <div className="cuadro201">V</div>
                        <div className="cuadro201">S</div>
                        <div className="cuadro201">D</div>
                        <div className="cuadro201">L</div>
                        <div className="cuadro201">M</div>
                        <div className="cuadro201">M</div>
                        <div className="cuadro201">J</div>
                        <div className="cuadro201">V</div>
                        <div className="cuadro201">S</div>
                        <div className="cuadro201">D</div>
                        <div className="cuadro201">L</div>
                        <div className="cuadro201">M</div>
                        <div className="cuadro201">M</div>
                        <div className="cuadro201">J</div>
                        <div className="cuadro201">V</div>
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
      
    </>
  );
}