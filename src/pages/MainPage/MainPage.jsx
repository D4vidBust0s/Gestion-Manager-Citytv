/* eslint-disable no-unused-vars */
import './MainPage.css';
import {useEffect, useState} from 'react';
import {BrowserRouter,Routes,Route} from 'react-router-dom';
import PropTypes from "prop-types";

/*Componentes */
import Sidebar from '/src/Components/Sidebar-Section/Sidebar';
import Top from '../../Components/Body-Section/Top/Top';   
import Footer from '../../Components/Body-Section/Footer/Footer';
import Modal1 from '../../Components/Modals/ModalPlanner1';
import Rules from '../../Components/Body-Section/Operations/Rules/Rules';
import Programs from '../../pages/Programs/Programs';
import PayrollManger from '../../pages/Payroll-manager/PayrollManager';
import Groups from '../../pages/Groups/Groups';
import Rotations from '../../pages/Rotations/Rotations';


/*Pages */
import Chat from '/src/pages/Chat/ChatPage';
import Dashboard from '/src/pages/Dasboard/DashboardPage';
import Main from '/src/pages/Main/MainPage';
import MainPlanner from '/src/pages/MainPlanner/MainPlannerPage';
import NotFound from '/src/pages/NotFound/NotFoundPage';
import Permissions from '/src/pages/Permissions/Permisions';
import Incapacity from '../../pages/Incapacity/Incapacity';
import Recess from '../../pages/Recess/recess';
import Licenses from '../../pages/Licenses/Licenses';
import Breaks from '../../pages/Breaks/breaks';
import Balancer from '../../pages/Balancer/balancer';
import UserBalancer from '../../pages/UserBalancers/userBalancer';
import Programmer from '../../pages/Programmer/programmer';
import Cv from '../../pages/Cv/cv';
import Pm from '../../pages/PayrollMain/pmMain';
import GroupNoveltiesPage from '../../pages/GroupNovelties/GroupNoveltiesPage';
import Tasks from '../../pages/Tasks/Task';
import Compensatory from '../../pages/Compensatory/Compensatory';
import Rutas from '../../pages/Routes/Routes';

/* Dependencias */
import axios from "axios";


/* Contextos */
//import { FechaBarraProvider } from './context/FechaBarraProvider';
import { FechaBarraProvider } from '../../context/FechaBarraProvider';
import { PronosticoTurnosProvider } from '../../context/PronosticoTurnosProvider';
import { AuxSustitutionsProvider } from '../../context/AuxSustitutionsProvider';
import { ChatProvider } from '../../context/ChatContext';

/* Variables */

let DiaClave;
let totalSche;
let totalGP;




function MainPage({ onLogout }) {


  
/* estado para la ventana modal1 */
const [modal1, setModal1] = useState(false); 
const [data1, setData1] = useState([]);
const [data2, setData2] = useState([]);

/* Estado de la sidebar: expandida (15%) o colapsada como riel de iconos */
const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
  try {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  } catch {
    /* Almacenamiento no disponible: se usa el valor por defecto */
    return false;
  }
});

// Alterna entre la sidebar completa y el riel de iconos
const handleToggleSidebar = () => setSidebarCollapsed((prev) => !prev);


//----------------------------------------------------------------------------------------------------------------------------
// FUNCIONES
//----------------------------------------------------------------------------------------------------------------------------

//Traer todos los registros de rotationsManager
const getAllRotationsManager= async () => {
    
  return await axios
    .get("http://localhost:3000/api/rotationsmanager/")
    .then((response) => setData1(response.data));
}

//Traer todos los registros de los usuarios
const getAllPayroll= async () => {
    
  return await axios
    .get("http://localhost:3000/api/payroll/")
    .then((response) => setData2(response.data));
  
}

/*
const entre = (idUsuario,FECHAINICIO,FECHAFINAL)=>{
  console.log("LA FECHA ACTUAL CORRESPONDE A LA SEMANA ACTUAL " + new Date(FECHAINICIO).toDateString() + " ---- " + new Date(FECHAFINAL).toDateString())
}

const antes = (FECHAINICIO,FECHAFINAL)=>{
  //para el antes debo contar cuantas semanas han pasado desde la registrada hasta la semana actual y hacer la operacion correcta
  //para dejar al dia la rotacion correcta de los turnos

  console.log("Entró a ANTES")
}

const despues = (FECHAINICIO,FECHAFINAL,DIACLAVE,TOTALSCHEMA,TOTALGP)=>{
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

  //primero valido  
}

*/



/*
const operaciones = (payrollID)=>{
  
  data1.map((rotationsManager)=>(
    payrollID == rotationsManager.userId  &&  

      //TRAIGO LA INFORMACION NECESARIA PARA LUEGO USARLA
      //Traigo el dia clave
      (
        DiaClave = new Date(rotationsManager.dayKey).setHours(0,0,0,0),totalSche = rotationsManager.totalSchema,totalGP = rotationsManager.totalGrupo
      ) 
      
  ))

  //OPERACIONES PARA DETERMINAR LOS RANGOS DE LA SEMANA EN QUE SE ENCUENTRA EL TRABAJADOR
  //***************************************************************************************

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

         //Esta instruccion define un dia entre semana, es decir de lunes a viernes
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
            entre(payrollID,fechaInicioSemana,fechaFinalSemana)
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
                   console.log("La fecha actual es MAYOR y es fin de semana " +  new Date(fechaInicioSemana).toLocaleString() + "--" + new Date(fechaFinalSemana).toLocaleString())
              
                 : 
                    despues(fechaInicioSemana,fechaFinalSemana,DiaClave,totalSche,totalGP)

          
            
}




*/

//**************************************************************************************************************************** 




//----------------------------------------------------------------------------------------------------------------------------
 // OPERACIONES PARA LA GESTION DE ROTACIONES DE TURNOS
//----------------------------------------------------------------------------------------------------------------------------

//Traigo todo el Payroll y opero 
//data2?.map((payroll)=>(
 // operaciones(payroll._id)
//))

// ************************************************************************************************************** FIN



useEffect(()=>{
  getAllPayroll();
},[]);

useEffect(()=>{
  getAllRotationsManager();
},[]);

/* Guarda la preferencia de la sidebar para conservarla entre sesiones */
useEffect(()=>{
  try {
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
  } catch {
    /* Sin persistencia: el estado sigue funcionando en memoria */
  }
},[sidebarCollapsed]);



// ***************************************************************************************************************

  return (
    <AuxSustitutionsProvider>
    <PronosticoTurnosProvider>
    <FechaBarraProvider>
    <ChatProvider>
    <BrowserRouter>
      <div className={`Container${sidebarCollapsed ? ' Container--sidebar-collapsed' : ''}`}>
        <Sidebar
          onLogout={onLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={handleToggleSidebar}
        />
        <div className="content">
         <Modal1 estado={modal1} cambiarEstado={setModal1}/>
         <Top sidebarCollapsed={sidebarCollapsed} onToggleSidebar={handleToggleSidebar} />
        <Footer/>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/main" element={<Main />} />
            <Route path="/mainplanner/*" element={<MainPlanner />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/payroll-manager" element={<PayrollManger />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/rotation" element={<Rotations />} />
            <Route path="/permissions" element={<Permissions />} />
            <Route path="/incapacity" element={<Incapacity />} />
            <Route path="/recess" element={<Recess />} />
            <Route path="/licenses" element={<Licenses />} />
            <Route path="/breaks" element={<Breaks />} />
            <Route path="/balancer" element={<Balancer />} />
            <Route path="/user-balancers" element={<UserBalancer />} />
            <Route path="/programmer" element={<Programmer />} />
            <Route path="/cv" element={<Cv />} />
            <Route path="/payroll-main" element={<Pm />} />
            <Route path="/routes" element={<Rutas />} />
            <Route path="/compensatory" element={<Compensatory />} />
            <Route path="/group-novelties/:id/*" element={<GroupNoveltiesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
    </ChatProvider>
    </FechaBarraProvider>
    </PronosticoTurnosProvider>
    </AuxSustitutionsProvider>
  );
}

export default MainPage

MainPage.propTypes = {
  onLogout: PropTypes.func,
};
