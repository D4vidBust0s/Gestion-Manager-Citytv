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

/* Dependencias */
import axios from "axios";

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
      //console.log("LA FECHA DEL NUEVO PERIODO ESTA DESACTUALIZADA");

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

// **************************************************************************************************************

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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App
