/* ESTILOS */
import  './Listado.css'

//Imagenes 
import savedNull from '/src/assets/save-null.png';
import savedOk from '/src/assets/save-ok.png';

/* COMPONENTES MODALES*/
import ModalPlanner2 from "../../../Modals/ModalPlanner2";


/* DEPENDENCIAS */
import {useState,useEffect,useContext} from 'react'
import { createPortal } from 'react-dom';
import axios from 'axios';
import {toast, Toaster} from 'react-hot-toast'
import { FechaBarraContext } from '../../../../context/FechaBarraProvider';
import { PronosticoContext } from '../../../../context/PronosticoTurnosProvider';



export default function Listado() {
  /* estado para la ventana modal1 */
  const [modal2, setModal2] = useState(false);

  //Estados para la Data de groups
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
  const [saved, setSaved] = useState(false);
  const [semanasP, setSemanasP] = useState("----------");
  const [informador, setInformador] = useState(0);



  //Variables 
  let DiaClave;
  let DiaClaveFS;

  let totalSche;
  let totalScheFS;

  let totalGP;
  let totalGPFS;

  let actual;
  let actualFS;

  let globalIdGroup;
  let arrayVariables = [];

  let globalDomingos;



  
  

  //----------------------------------------------------------------------------------------------------------
  //FUNCIONES
  //Funcion que obtiene la data de la api - listado de grupos
  const obtenerListadoGrupos = async () => {
    return await axios
      .get("http://localhost:3000/api/groups")
      .then((response) => setData(response.data));
  };

  //Funcion que obtiene la data de la api - todos los usuario
  const getPeople = async ()=>{
    return await axios
    .get("http://localhost:3000/api/payroll")
    .then((response) => setData1(response.data));
  };

  //Traer todos los registros de rotationsManager
const getAllRotationsManager= async () => {
    
  return await axios
    .get("http://localhost:3000/api/rotationsmanager/")
    .then((response) => setData2(response.data));
}

 //Traer Rules
 const getRules= async () => {
    
  return await axios
    .get("http://localhost:3000/api/rules/")
    .then((response) => setData3(response.data));
}

//Traer rotations
const getRotations= async () => {
    
  return await axios
    .get("http://localhost:3000/api/rotations/")
    .then((response) => setData4(response.data));
}

//Traer todos los registros de rotationsManagerFS
const getAllRotationsManagerFS= async () => {
    
  return await axios
    .get("http://localhost:3000/api/rotationsmanager-fs/")
    .then((response) => setData5(response.data));
}

//Traer todos los registros de rotationsManager que sean de un grupo especifico y turno fijo
const getAllRotationsManagerFijos= async (idGrupo) => {
    
  return await axios
    .get("http://localhost:3000/api/rotationsmanager/fijos/"+idGrupo)
    .then((response) => setData6(response.data));
}

//Funcion que obtiene la data de la api - listado de turnos segun id y fecha especifica
const obtenerListadoTurnosFull = async () => {
  return await axios
    .get("http://localhost:3000/api/shifts/full")
    .then((response) => setData7(response.data));
};

//Trae todos los programas definidos en el sistema
const obtenerListadoPrograms = async () => {
  return await axios
    .get("http://localhost:3000/api/programs")
    .then((response) => setData8(response.data));
};

 //Traer todos los registros Stacks
 const getAllStacks= async () => {
    
  return await axios
    .get("http://localhost:3000/api/stacks/")
    .then((response) => setData9(response.data));
}


/* CONTEXTOS*/
const [fechaBarra,setFechaBarra] = useContext(FechaBarraContext); //Define un estado para la fecha de la barra
const [auxiliar,setAuxiliar] = useContext(PronosticoContext); //

//FUNCIONES
//----------------------------------------------------------------------------------------------------------------------------------------
const save = ()=>{
  setSaved(!saved);
}


//----------------------------------------------------------------------------------------------------------------------------------------
//END-FUNCIONES


/* ********************************************************************************************************************* */
 /* OPERACIONES PARA LA GESTION DE TURNOS */

 const entre = (idUsuario,FECHAINICIO,FECHAFINAL)=>{
  console.log("LA FECHA ACTUAL CORRESPONDE A LA SEMANA ACTUAL " + new Date(FECHAINICIO).toDateString() + " ---- " + new Date(FECHAFINAL).toDateString())
  
  let turno = "";

  //HAGO LA OPERACION PARA TRAER EL TURNO EN EL QUE DEBE ESTAR EL USUARIO EN LA SEMANA QUE ES (ACTUAL) POR QUE ESTA "ENTRE"
  data2?.map((rotationsManager)=>(
    idUsuario==rotationsManager.userId && (turno = rotationsManager.SchemaName)
  ))

  if(turno=="NombreSchema")
  {
    turno="No se han asignado rotaciones para este usuario";
  }
  

  return turno + "  ----- " + "Semana actual"

}

const ciclo = (totalgrupo,actual,domingos,idGrupo,isFijo,nombre)=>{

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
  data4?.map((schemas)=>
  (
    idGrupo == schemas.Grupo_ID && schemas.Order == index && schemas.Tipo == "Entre Semana" &&
      (turno = schemas.Nombre)
    
  ))

  

  //para el proceso de turno fijo debo validar si isfijo == a true, false o undefined  
  return turno;  /*+ "  ----- " + (domingos == 0 ? "Semana actual" :  domingos == 1 ? domingos +" Semana " : domingos + " Semanas ");*/
}









const cicloFS = (totalgrupo,actual,domingos,idGrupo)=>{

  let index = 0;
  let turno;

  //esta es la operacion que debe devolver el index del schema en el que deberia estar el trabajador un fin de semana
  for(let i=0; i<=domingos; i++ )
  {
    index = actual ++;

    if(index >= totalgrupo)
    {
      actual = 1;
    }

  }

  //Segun el index obtenido busco el nombre del schema de fin de semana y lo muestro 
  data4?.map((schemas)=>(
    idGrupo == schemas.Grupo_ID && schemas.Order == index && schemas.Tipo == "Fin de Semana" &&
      (turno = schemas.Nombre)
    
  ))
 
   return turno + " ____________________" + "( "+ domingos +  ( domingos == "1" ? " Fin de Semana )" : " Fines de Semana)");

}

const antes = (FECHAINICIO,FECHAFINAL)=>{
  //para el antes debo contar cuantas semanas han pasado desde la registrada hasta la semana actual y hacer la operacion correcta
  //para dejar al dia la rotacion correcta de los turnos

  console.log("Entró a ANTES")
  return "Respuesta desde antes"
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
     
     if(new Date(fecha).getDay()==0) //cero es el dia domingo
     {
        Domingos++;
        globalDomingos=Domingos;
     }

  }

  

  //Por ultimo hagao las operaciones para saber en que turno estaria el trabajador en la fecha escogida
    let pronostico;
    
    //hago el pronostico 
    data2?.map((rotationsManager)=>(
      idUsuario==rotationsManager.userId && (
       pronostico=ciclo(rotationsManager.totalGrupo,rotationsManager.actual,Domingos,rotationsManager.groupId,rotationsManager.fijo,rotationsManager.userName)
      )
    ))


    return pronostico;
  
  
  
}

const despuesFS = (FECHAINICIO,FECHAFINAL,DIACLAVE,TOTALSCHEMA,TOTALGP,ACTUAL,idUsuario)=>{
  
  //PROCEDIMIENTOS PARA ROTACION DE FIN DE SEMANA
  //----------------------------------------------------------------------------------------------------------------

  //DIACLAVEFS OK
  //TOTALSCHEMA OK -- PERO DEBO REALIZAR LA TAREA PENDIENTE DEL NOTEPAD (OJO)
  //TOTALGP OK     -- PERO OJO CON LA TAREA QUE ESTA PENDIENTE DEL NOTEPAD RESPECTO A LA CANTIDAD DE USUARIOS DEL GRUPO
  //ACTUAL OK
  //FECHAINICIO OK
  //FECHAFINAL OK

  let pronostico;

  //OBTENGO LA DIFERENCIA EN DIAS DE LA FECHA FUTURA  Y EL DIA CLAVE
  let fechaInicio = new Date(new Date(DIACLAVE).getTime()).setHours(0,0,0,0);
  let fechaFin    = new Date(new Date(fechaBarra).getTime()).setHours(0,0,0,0);

  let diff = fechaFin - fechaInicio;
  let diasPasados = diff/(1000*60*60*24) // (1000*60*60*24) --> milisegundos -> segundos -> minutos -> horas -> días

  //ya que tengo los dias que han pasado, debo calcular cuantas semanas han pasado
  let Domingos = 0;

  for (let index = 1; index <= diasPasados; index++) 
  {
     let fecha = new Date (new Date(DIACLAVE).setHours(0,0,0,0)).setDate(new Date(DIACLAVE).getDate()+index)
     
     if(new Date(fecha).getDay()==0) //cero es el dia domingo
     {
        Domingos++;
     }

  }


  //Por ultimo hagao las operaciones para saber en que turno estaria el trabajador en la fecha escogida
  //hago el pronostico 

  data5?.map((rotationsManagerFS)=>(
    idUsuario==rotationsManagerFS.userId && (
     pronostico=cicloFS(rotationsManagerFS.totalGrupo,rotationsManagerFS.actual,Domingos,rotationsManagerFS.groupId)
    )
  ))


    return pronostico;
  
}


const getStack = ()=>{
  return "Si hay datos";
}


const noStack = ()=>{
  return "-------- Sin Definir --------" ;
}



const tareaStack = (nombreEsquema,payrollID)=>{
 return nombreEsquema

}


 const Pronostico = (PAYROLLID)=>{
  data2.map((rotationsManager)=>(
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
    data2?.map((RM)=>(
      RM.groupId == globalIdGroup && RM.fijo == false && RM.actual != 0
      ? arrayVariables.push(RM.actual)
      :null
   ))


  data5.map((rotationsManagerFS)=>(
    PAYROLLID == rotationsManagerFS.userId  &&  

      //TRAIGO LA INFORMACION NECESARIA DE FIN DE SEMANA PARA LUEGO USARLA
      //Traigo el dia clave
      (
        DiaClaveFS = new Date(rotationsManagerFS.dayKey).setHours(0,0,0,0),
        totalScheFS = rotationsManagerFS.totalSchema,
        totalGPFS = rotationsManagerFS.totalGrupo,
        actualFS = rotationsManagerFS.actual
      ) 
      
  ))



  //OPERACIONES PARA DETERMINAR LOS RANGOS DE LA SEMANA EN QUE SE ENCUENTRA EL TRABAJADOR
  /***************************************************************************************** */

  //DayKey aumentado 8 dias, es decir una semana
  let daykeyPlus = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+8);

  //Traer cual es el nombre del dia "Lunes..martes.." del dayKey  1 Lunes, 2 Martes, 3 Miercoles, 4 Jueves, 5 Viernes, 6 Sabado, 0 Domingo
  let NombreDia = new Date(DiaClave).getDay();

  //Traigo el # del dia "1,3,5" del dayKey
  let diaDayKey = new Date(DiaClave).getDate();

  //Traigo el mes "0,1,2 hasta 11 que es diciembre" del dayKey
  let mesDayKey = new Date(DiaClave).getMonth();

  //Traigo el año del dayKey
  let añoDayKey = new Date(DiaClave).getFullYear();


   //VALIDACION PARA SABER SI EL DIA DEL (diaclave) ESTA ENTRE SEMANA O FIN DE SEMANA
        //--------------------------------------------------------------------------
        //Defino la nueva fecha de inicio de y fin de semana segun DiaClave
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
              new Date().getDay() == 6 || new Date().getDay() == 0 
              ?
                console.log("La fecha actual es menor y es fin de semana " + new Date(fechaInicioSemana).toLocaleString() + "--" + new Date(fechaFinalSemana).toLocaleString())
              :
              
              //console.log("La fecha actual es menor y entre semana " + new Date(fechaInicioSemana).toLocaleString() + "--" + new Date(fechaFinalSemana).toLocaleString()) 
              respuesta = antes()
              
            : 
              //Es MAYOR pero debo preguntar si es sabado o domingo para operar segun corresponda
              fechaActual > new Date(fechaFinalSemana).setHours(0,0,0,0)  
            &&
          
                new Date().getDay() == 6 || new Date().getDay() == 0 
                 ?
                   //-------------------------------------------------------------------------------
                    //ES SABADO O DOMINGO ENTONCES APLICO LA LOGICA PARA FINES DE SEMANA
                   //-------------------------------------------------------------------------------

                   respuesta = despuesFS(fechaInicioSemana,fechaFinalSemana,DiaClaveFS,totalScheFS,totalGPFS,actualFS,PAYROLLID)
                 : 
                     respuesta = despues(fechaInicioSemana,fechaFinalSemana,DiaClave,totalSche,totalGP,actual,PAYROLLID)


            return respuesta;
 } 


 /* END - OPERACIONES PARA LA GESTION DE TURNOS  */
 /* ********************************************************************************************************************* */

 const getColorPrimary = (nombreEvent)=>{
  let color;

    data8?.map((programas)=>(
      programas._id == nombreEvent && (color = programas.Color)
    ))

    return color;
 }


 const getNombre = (nombreEvent)=>{
  let nombre;

    data8?.map((programas)=>(
      programas._id == nombreEvent && (nombre = programas.nombre)
    ))

    return nombre;
 }






  let mainColor = "white";
  let nombreEvento = "---------";
  let anchoEvent = "0";
  let inicio = "";

 const getDurationCustom = (idEvent) =>{

  
  data9?.map((stacks)=>(
    stacks._id == idEvent && (anchoEvent = stacks.Duration+"px")
  )) 

  return anchoEvent;

 }

 const getDurationprogram = (start, end) =>{
  let diferencia;
  var fechaInicio = new Date(start).getTime();
  var fechaFin    = new Date(end).getTime();

  diferencia = fechaFin - fechaInicio;
  return  (diferencia/1000)/60;

}

const getDurationPGM = (idEvent) =>{
  
      let DURACION;

       data8?.map((pgm)=>(
        pgm._id == idEvent && ( DURACION = getDurationprogram(pgm.Start,pgm.End))
       ))

      return (DURACION * 60)/30 ;
       
}


 const magic = (nombreEvent,idEvent,tipo,horaInicio)=>{

    let fechaInicio = new Date(horaInicio);




  //Primero traigo el color que le corresponde segun el id de evento y tipo
  if(tipo == "Null")
  {
      mainColor = "#747474"
  }

  else if(tipo == "Custom")
  {
      mainColor = "#0c0c0c"
  }

  else if(tipo == "Secondary")
  {
      mainColor = "#b0ffad"
  }

  else if(tipo == "Programa")
  {
      mainColor = getColorPrimary(nombreEvent);
  }


  //procedemos a traer el nombre del evento

  if(tipo == "Null")
  {
      nombreEvento = ""
  }

  else if(tipo == "Custom")
  {
      nombreEvento = nombreEvent;
  }

  else if(tipo == "Secondary")
  {
      nombreEvento = getNombre(nombreEvent)
  }

  else if(tipo == "Programa")
  {
    nombreEvento = getNombre(nombreEvent);
  }


  //Definimos las anchuras de cada evento segun corresponda

  if(tipo == "Null")
  {
      anchoEvent = "60px";
  }

  else if(tipo == "Custom")
  {
    anchoEvent = getDurationCustom(idEvent);
  }

  else if(tipo == "Secondary")
  {
    anchoEvent = getDurationPGM(nombreEvent)+"px";
  }

  else if(tipo == "Programa")
  {
    anchoEvent = getDurationPGM(nombreEvent)+"px";
  }




  
    return  <li style={
      {
        float: "left",
        background: "#545454",
        height: "1.45rem",
        borderLeft: "1px solid #000000",
        width: anchoEvent,
        display: "flex"
      }
      } onClick={() => setModal2(!modal2)}>

      <a href="#" style={
        anchoEvent == "60px" || anchoEvent == "120px" 
        ?
      {
          position:'relative',
          padding: '0 2px',
          textDecoration: 'none',
          color: tipo == "Custom" ? "#DADADA" : '#000000' ,
          background: mainColor,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: ".6rem",
          fontWeight: "900",
          width: anchoEvent,
          
      }: 
      
      {
        position:'relative',
          padding: '0 2px',
          textDecoration: 'none',
          color: tipo == "Custom" ? "#DADADA" : '#000000' ,
          background: mainColor,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: ".9rem",
          fontWeight: "900",
          width: anchoEvent,
      }} >


             {nombreEvento}
      </a>
      </li>
 }


  const exist = (payrollId) =>{

    return <div className="contentListado">

{                    //Este bloque es para identificar con un color verde si el item se ha guardado o no
                     data7?.map((shift)=>(
                      shift.ID_user == payrollId && (new Date(shift.Fecha_clave).toLocaleDateString() == new Date(fechaBarra).toLocaleDateString()) 
                      
                        
                      
                      ?   <> <div className="estadoTurnoOk" key={shift._id}></div>

                            <ul className="ulEvent">
                              {
                                saved == false
                                 ?
                                    <li className={saved == false ? "liEventTipe0" : "liEventTipe000"} onClick={() => setModal2(!modal2)}>
                                      
                                        {magic(shift.Event_name,shift.ID_event,shift.Type,shift.Inicio_main) }
                                      
                                    </li>

                                 : null
                              }
                              
                            </ul>
                          </>

                      
                      :  null 
                      ))
                       
                        
                      
                    }

      {
        saved == true ?

        <ul className="ulEvent">
          <li className={saved == false ? "liEventTipe0" : "liEventTipe000"} onClick={() => setModal2(!modal2)}>
                  <a href="#" className="event"> 
                    {
                      
                      data2?.map((rotationsManager)=>(
                        payrollId == rotationsManager.userId && saved == true 
                        
                        ? Pronostico(payrollId)

                        
                        : 
                        //payrollId == rotationsManager.userId && saved == false && rotationsManager.SchemaName
                        null
                        
                      ))
                        
                    }

                  </a>
           </li>

           
      </ul>
        :null
      }
     
      


      
    </div>
    
  };

  const mes = (MES) =>{
   if(MES == 0)
    {
      return "Enero"
    }

    else if(MES == 1)
    {
      return "Febrero"
    }

    else if(MES == 2)
    {
      return "Marzo"
    }

    else if(MES == 3)
    {
      return "Abril"
    }

    else if(MES == 4)
    {
      return "Mayo"
    }

    else if(MES == 5)
    {
      return "Junio"
    }

    else if(MES == 6)
    {
      return "Julio"
    }

    else if(MES == 7)
    {
      return "Agosto"
    }

    else if(MES == 8)
    {
      return "Septiembre"
    }

    else if(MES == 9)
    {
      return "Octubre"
    }

    else if(MES == 10)
    {
      return "Noviembre"
    }

    else if(MES == 11)
    {
      return "Diciembre"
    }
  }


 


 
 

  useEffect(() => {
    obtenerListadoGrupos();
  }, [auxiliar]);


  useEffect(() => {
    getRules();
  }, [auxiliar]);

  useEffect(() => {
    getPeople();
  }, [auxiliar]);

  useEffect(() => {
    getAllRotationsManager();
  }, [auxiliar]);

  useEffect(() => {
    getAllRotationsManagerFS();
  }, [auxiliar]);


  useEffect(() => {
    getRotations();
  }, [auxiliar]);

  useEffect(()=>{
    obtenerListadoTurnosFull();
  },[auxiliar])

  useEffect(()=>{
    obtenerListadoPrograms();
  },[auxiliar])

  useEffect(()=>{
    getAllStacks();
  },[auxiliar])
  
  return (
    <>
     
      
      {createPortal(
        <ModalPlanner2 estado={modal2} cambiarEstado={setModal2} />,
        document.querySelector("#portal")
      )}
      

      {data?.map((group) => (
        
        <div className="mainRow" key={group._id}>
          <div className="ContentImgCargos">
            <img src={group.logo} alt={group.nombre} className="imgCargos" />
          </div>


          <div className="mainListados">
            
           {
            //Ciclo que trae todos los usuarios del sistema 
           data1?.map((payroll)=>(

            <div className="cnt-turno" key={payroll._id}>
                <div className="algo"></div>
              {
                   payroll.grupoID == group._id && payroll.activo == true ?  exist(payroll._id): null
              
              }
            </div>
            
          ))
          
           }
            
            <div className="separador2"></div>
          </div>

          


        </div>

      ))}

      <div className="semanasPasadas">
        {globalDomingos + " Semanas"}
      </div>

     <div className="sectionSave">
      <div className="disket">
        <img src={savedOk} alt="disket" className='savedNull'/>
      </div>
        <div className={saved ? "circleSaved" : "circle"} onClick={save}>
        {saved ? "Rotations" : "Prog"} 
        </div>
      </div>

     

      <div className="pr">
           <div className="prueba">{/*Prueba context {String(auxiliar)}*/}</div>
        {

          new Date(fechaBarra).getDay() == 1 ? "Lunes " + new Date(fechaBarra).getDate()  + " de " + mes(new Date(fechaBarra).getMonth()) + " del " + new Date(fechaBarra).getFullYear() 

          : new Date(fechaBarra).getDay() == 2 ? "Martes " + new Date(fechaBarra).getDate() + " de " + mes(new Date(fechaBarra).getMonth()) + " del " + new Date(fechaBarra).getFullYear() 

          : new Date(fechaBarra).getDay() == 3 ? "Miercoles " + new Date(fechaBarra).getDate() + " de " + mes(new Date(fechaBarra).getMonth()) + " del " + new Date(fechaBarra).getFullYear() 

          : new Date(fechaBarra).getDay() == 4 ? "Jueves " + new Date(fechaBarra).getDate() + " de " + mes(new Date(fechaBarra).getMonth()) + " del " + new Date(fechaBarra).getFullYear() 

          : new Date(fechaBarra).getDay() == 5 ? "Viernes " + new Date(fechaBarra).getDate() + " de " + mes(new Date(fechaBarra).getMonth()) + " del " + new Date(fechaBarra).getFullYear() 

          : new Date(fechaBarra).getDay() == 6 ? "Sábado " + new Date(fechaBarra).getDate() + " de " + mes(new Date(fechaBarra).getMonth()) + " del " + new Date(fechaBarra).getFullYear() 

          : new Date(fechaBarra).getDay() == 0 ? "Domingo " + new Date(fechaBarra).getDate() + " de " + mes(new Date(fechaBarra).getMonth()) + " del " + new Date(fechaBarra).getFullYear() 

          : null
          
        }
        
      </div>

      
      
    </>
  );
}
