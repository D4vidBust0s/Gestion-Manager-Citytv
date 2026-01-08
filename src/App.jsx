import './App.css';
import {useEffect, useState} from 'react';
import {BrowserRouter,Routes,Route} from 'react-router-dom';
import Swal from "sweetalert2";

/*Componentes */
import Sidebar from '/src/Components/Sidebar-Section/Sidebar';
import Top from './Components/Body-Section/Top/Top';
import Footer from './Components/Body-Section/Footer/Footer';
import Modal1 from './Components/Modals/ModalPlanner1';
import Rules from './Components/Body-Section/Operations/Rules/Rules';
import Programs from './pages/Programs/Programs';
import PayrollManger from './pages/Payroll-manager/PayrollManager';
import Groups from './pages/Groups/Groups';
import Rotations from './pages/Rotations/Rotations';


/*Pages */
import Chat from '/src/pages/Chat/ChatPage';
import Tasks from '/src/pages/Tasks/TasksPage';
import Dashboard from '/src/pages/Dasboard/DashboardPage';
import Main from '/src/pages/Main/MainPage';
import MainPlanner from '/src/pages/MainPlanner/MainPlannerPage';
import NotFound from '/src/pages/NotFound/NotFoundPage';
import Permissions from '/src/pages/Permissions/Permisions';
import Incapacity from './pages/Incapacity/Incapacity';
import Recess from './pages/Recess/recess';
import Licenses from './pages/Licenses/Licenses';
import Breaks from './pages/Breaks/breaks';
import Balancer from './pages/Balancer/balancer';
import UserBalancer from './pages/UserBalancers/userBalancer';
import Programmer from './pages/Programmer/programmer';

/* Dependencias */
import axios from "axios";


/* Contextos */
import { FechaBarraProvider } from './context/FechaBarraProvider';
import { PronosticoTurnosProvider } from './context/PronosticoTurnosProvider';
import { AuxSustitutionsProvider } from './context/AuxSustitutionsProvider';

/* Variables */

let day;
let mes;
let año;

let fechaActual;
let dayActual;
let mesActual;
let añoActual;

let aux;
let fechaRules;
let total2;

let id;

let DiaClave;
let totalSche;
let totalGP;




function App() {


  
/* estado para la ventana modal1 */
const [modal1, setModal1] = useState(false); 
const [data, setData] = useState([]);
const [data1, setData1] = useState([]);
const [data2, setData2] = useState([]);


//----------------------------------------------------------------------------------------------------------------------------
// FUNCIONES
//----------------------------------------------------------------------------------------------------------------------------
//Estas dos  funcion actualiza el dia clave para el resto de operaciones del sistema

const obtenerListadoRules = async () => {
  return await axios
    .get("http://localhost:3000/api/rules")
    .then((response) => setData(response.data));

};

const update= async () => {
    
  await axios.put("http://localhost:3000/api/rules/" + id, {
    DiaPeriod: total2,
   
  });
}

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




//Traemos la fecha actual
fechaActual = new Date().setHours(0,0,0,0);
dayActual = new Date(fechaActual).getDate();        //Dia actual
mesActual = new Date(fechaActual).getMonth();       //Mes actual
añoActual = new Date(fechaActual).getFullYear();    //Año actual


//Traemos las configuraciones 
data?.map((dato)=>{

 fechaRules = new Date(dato.DiaPeriod).setHours(0,0,0,0);
 total2 = new Date (fechaRules);
 total2.setDate(total2.getDate() + parseInt(dato.Dia) ) // se trae la cantidad de dias definidas en rules
                                                            //  y se agrega un dia mas para que concuerde con el sabado que pasaria a ser el nuevo dia clave
 day = new Date(total2).getDate();
 mes = new Date(total2).getMonth();
 año = new Date(total2).getFullYear();


//------------------------------------------------------------------------------------------------------------------------
 // OPERACIONES PARA MANTENER ACTUALIZADO EL DIA CLAVE
//------------------------------------------------------------------------------------------------------------------------

  if(new Date(fechaRules).getDate()==dayActual && mes == mesActual && año == añoActual)
  {
    //Procedemos a actualizar el dia clave en rules si 
    console.log("MOMENTO DE ACTUALIZAR LA FECHA DEL NUEVO PERIODO");
    aux = 1;
  }
  else{
  
    /*
      console.log("NO ES TIEMPO DE ACTUALIZAR PERIODO");
      console.log("----------------------------------");
      console.log("Dia actual " + dayActual +" Dia meta " + new Date(fechaRules).getDate());
      console.log("Mes actual " + mesActual +" Mes meta " + mes);
      console.log("Año actual " + añoActual +" Año meta " + año);
      console.log("Dias Rules " + data[0].Dia);
    */

    if(mes < mesActual && añoActual == año)
    {
      

      Swal.fire({
      
        title: "La fecha de evaluación de periodo está desactualizada, por favor actualícela inmediatamente",
        //showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Ok la actualizaré",
        //denyButtonText: `Ok la actualizaré`,
        footer: '<h5>Gestión Manager Citytv</h5> <br> <h6>Mensajes del sistema</h6>',
        
        
      }).then((result) => {
        
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          //Swal.fire("Saved!", "", "success");
        } else if (result.isDenied) 
        {
          EliminarGP();
          //Swal.fire("Registro eliminado del sistema", "", "success");
        }
      });
      
    }

  }

})

if(aux == 1)
{
   id=data[0]._id;
   update();
}

//----------------------------------------------------------------------------------------------------------------------------
 // OPERACIONES PARA LA GESTION DE ROTACIONES DE TURNOS
//----------------------------------------------------------------------------------------------------------------------------

//Traigo todo el Payroll y opero 
//data2?.map((payroll)=>(
 // operaciones(payroll._id)
//))

// ************************************************************************************************************** FIN



useEffect(()=>{
  obtenerListadoRules();
},[]);

useEffect(()=>{
  getAllPayroll();
},[]);

useEffect(()=>{
  getAllRotationsManager();
},[]);



// ***************************************************************************************************************

  return (
    <AuxSustitutionsProvider>
    <PronosticoTurnosProvider>
    <FechaBarraProvider>
    <BrowserRouter>
      <div className="Container">
        <Sidebar />
        <div className="content">
         <Modal1 estado={modal1} cambiarEstado={setModal1}/>
         <Top />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
    </FechaBarraProvider>
    </PronosticoTurnosProvider>
    </AuxSustitutionsProvider>
  );
}

export default App
