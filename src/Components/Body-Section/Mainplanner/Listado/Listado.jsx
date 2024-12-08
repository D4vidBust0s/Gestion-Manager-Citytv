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
//import DatePicker from 'react-datepicker';



export default function Listado() {
  /* estado para la ventana modal1 */
  const [modal2, setModal2] = useState(false);

  //Estados para la Data de groups
  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [saved, setSaved] = useState(0);



  //Variables 
  let DiaClave;
  let totalSche;
  let totalGP;
  let actual;
  

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


/* CONTEXTOS*/
const [fechaBarra,setFechaBarra] = useContext(FechaBarraContext); //Define un estado para la fecha de la barra

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
  return "Respuesta desde entre"
}

const antes = (FECHAINICIO,FECHAFINAL)=>{
  //para el antes debo contar cuantas semanas han pasado desde la registrada hasta la semana actual y hacer la operacion correcta
  //para dejar al dia la rotacion correcta de los turnos

  console.log("Entró a ANTES")
  return "Respuesta desde antes"
}


 const despues = (FECHAINICIO,FECHAFINAL,DIACLAVE,TOTALSCHEMA,TOTALGP,ACTUAL)=>{
  //para el despues tambien debo contar cuantas semanas han pasado y hacer la operacion correcta simplemete que no debo actualizar nada 
  //en la base de datos si no solo mostrar en que turno estaria el trabajador para esa fecha

  //OBTENGO LA DIFERENCIA EN DIAS DE LA FECHA FUTURA O ACTUAL Y EL DIA CLAVE
  let fechaInicio = new Date(new Date(DIACLAVE).getTime()).setHours(0,0,0,0);
  let fechaFin    = new Date(new Date().getTime()).setHours(0,0,0,0);

  let diff = fechaFin - fechaInicio;
  let diasPasados = diff/(1000*60*60*24) // (1000*60*60*24) --> milisegundos -> segundos -> minutos -> horas -> días
  console.log("Dias pasados "+diasPasados + " -- " + new Date(DIACLAVE).toDateString());  

  //ya que tengo los dias que han pasado, debo calcular cuantas semanas han pasado
  let Domingos = 0;

  for (let index = 1; index <= diasPasados; index++) 
  {
     let fecha = new Date (new Date(DIACLAVE).setHours(0,0,0,0)).setDate(new Date(DIACLAVE).getDate()+index)
     
     if(new Date(fecha).getUTCDay()==0)
     {
        Domingos++;
     }

  }

  console.log("Total Domingos... " + Domingos + " Total Schema.. " + TOTALSCHEMA + " Total Grupo... " + TOTALGP)

  //Por ultimo hagao las operaciones para saber en que turno estaria el trabajador en la fecha escogida

  //primero valido si el numero de grupos es igual al numero de schemas
  if(TOTALSCHEMA > 0 && TOTALGP > 0 && TOTALSCHEMA == TOTALGP )
  {
    //hago el pronostico 
    return "Pronostico " + ACTUAL;
  }
  
  else{
    return "Grupo sin esquemas asignados ";
  }

  
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


        //Ya obtenido las fechas de inicio y final de la semana segun el dia clave procedo a operar con la fecha actual según sea el caso "menor,actual,mayor"
        let fechaActual = new Date().setHours(0,0,0,0);

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
              
              console.log("La fecha actual es menor y entre semana " + new Date(fechaInicioSemana).toLocaleString() + "--" + new Date(fechaFinalSemana).toLocaleString()) 
              
              
            : 
              //Es MAYOR pero debo preguntar si es sabado o domingo para operar segun corresponda
              fechaActual > new Date(fechaFinalSemana).setHours(0,0,0,0)  
            &&
                new Date().getUTCDay() == 6 || new Date().getUTCDay() == 0 
                 ?
                   //console.log("La fecha actual es MAYOR y es fin de semana " +  new Date(fechaInicioSemana).toLocaleString() + "--" + new Date(fechaFinalSemana).toLocaleString())
                   respuesta = "ES FIN DE SEMANA Y ESTA OPERACION ESTA PENDIENTE POR IMPLEMENTAR"
                 : 
                     respuesta = despues(fechaInicioSemana,fechaFinalSemana,DiaClave,totalSche,totalGP,actual)


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
                    { /* "Arriba Bogotá  - "  + payrollNombres + " "+ payrollApellidos + " id = " + payrollId + " Grupo " + groupNombre */} 

                    {
                      data2?.map((rotationsManager)=>(
                        payrollId == rotationsManager.userId && saved == 0 ? Pronostico(payrollId)

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
                     
                   payroll.grupoID == group._id ?  exist(payroll._id,payroll.grupo,group.nombre,payroll.nombres, payroll.apellidos) : null
              
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
