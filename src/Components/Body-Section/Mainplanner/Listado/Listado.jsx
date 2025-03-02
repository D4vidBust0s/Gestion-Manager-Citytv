/* ESTILOS */
import  './Listado.css'



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
  const [saved, setSaved] = useState(0);



  //Variables 
  let DiaClave;
  let DiaClaveFS;

  let totalSche;
  let totalScheFS;

  let totalGP;
  let totalGPFS;

  let actual;
  let actualFS;
  

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


/* CONTEXTOS*/
const [fechaBarra,setFechaBarra] = useContext(FechaBarraContext); //Define un estado para la fecha de la barra
const [pronosticoTurnos,setPronosticoTurnos] = useContext(PronosticoContext); //

//FUNCIONES
//----------------------------------------------------------------------------------------------------------------------------------------
const save = ()=>{
  toast.success("Maiplanner Guardado.. OPERACION PENDIENTE");
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
  

  return turno

}

const ciclo = (totalgrupo,actual,domingos,idGrupo)=>{

  let index = 0;
  let turno;

  //esta es la operacion que debe devolver el index del schema en el que deberia estar el trabajador
  for(let i=0; i<=domingos; i++ )
  {
    index = actual ++;

    if(index >= totalgrupo)
    {
      actual = 1;
    }

  }

  //Segun el index obtenido busco el nombre del schema y lo muestro 
  data4?.map((schemas)=>(
    idGrupo == schemas.Grupo_ID && schemas.Order == index && schemas.Tipo == "Entre Semana" &&
      (turno = schemas.Nombre)
    
  ))

  
  return turno + "  ----- " + domingos +  ( domingos == "1" ? " Semana" : " Semanas");
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
     }

  }


  //Por ultimo hagao las operaciones para saber en que turno estaria el trabajador en la fecha escogida
    let pronostico;
    
    //hago el pronostico 
    data2?.map((rotationsManager)=>(
      idUsuario==rotationsManager.userId && (
       pronostico=ciclo(rotationsManager.totalGrupo,rotationsManager.actual,Domingos,rotationsManager.groupId)
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





 const Pronostico = (PAYROLLID)=>{
  data2.map((rotationsManager)=>(
    PAYROLLID == rotationsManager.userId  &&  

      //TRAIGO LA INFORMACION NECESARIA PARA LUEGO USARLA
      //Traigo el dia clave
      (
        DiaClave = new Date(rotationsManager.dayKey).setHours(0,0,0,0),
        totalSche = rotationsManager.totalSchema,
        totalGP = rotationsManager.totalGrupo,
        actual = rotationsManager.actual
      ) 
      
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


  const exist = (payrollId,payrollGrupo,groupNombre,payrollNombres,payrollApellidos) =>{

    return <div className="contentListado">
      <Toaster />

      <ul className="ulEvent">
          <li className={saved == 0 ? "liEventTipe00" : "liEventTipe0"} onClick={() => setModal2(!modal2)}>
                  <a href="#" className="event"> 
                    {
                      data2?.map((rotationsManager)=>(
                        payrollId == rotationsManager.userId && saved == 0 
                        
                        ? Pronostico(payrollId)
                        :  payrollId == rotationsManager.userId && saved == 1 && rotationsManager.SchemaName
                        
                      ))
                    }
                  </a>
           </li>
      </ul>
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
  }, []);


  useEffect(() => {
    getRules();
  }, []);

  useEffect(() => {
    getPeople();
  }, []);

  useEffect(() => {
    getAllRotationsManager();
  }, []);

  useEffect(() => {
    getAllRotationsManagerFS();
  }, []);


  useEffect(() => {
    getRotations();
  }, []);

  useEffect(()=>{
    //alert("Exacto");
  },[fechaBarra])
  
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
            <div className="hol" key={payroll._id}>
              {
                     
                   payroll.grupoID == group._id && payroll.activo == true ?  exist(payroll._id,payroll.grupo,group.nombre,payroll.nombres, payroll.apellidos) : null
              
              }
            </div>
            
          ))
          
           }
            
            <div className="separador2"></div>
          </div>

          


        </div>
      ))}

     <div className="sectionSave">
        <div className={saved ? "circleSaved" : "circle"} onClick={save}>
          Save
        </div>
      </div>

     

      <div className="pr">
     
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
