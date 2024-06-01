import './App.css';
import {useEffect, useState} from 'react';
import {BrowserRouter,Routes,Route} from 'react-router-dom';


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

let fecha2;
let dayActual;
let mesActual;
let añoActual;

let aux;
let total;
let total2;



function App() {


  
/* estado para la ventana modal1 */
const [modal1, setModal1] = useState(false); 
const [data, setData] = useState([]);
const [ID,setId]= useState();




//FUNCIONES

//Traemos la fecha actual
fecha2 = new Date().setHours(0,0,0,0);
dayActual = new Date(fecha2).getDate();
mesActual = new Date(fecha2).getMonth();
añoActual = new Date(fecha2).getFullYear();


//Estas dos  funcion actualiza el dia clave para el resto de operaciones del sistema
const obtenerListadoRules = async () => {
  return await axios
    .get("http://localhost:3000/api/rules")
    .then((response) => setData(response.data));

};



const update= async () => {
    
  await axios.put("http://localhost:3000/api/rules/" + ID, {
    DiaPeriod: total2,
   
  });
}


const createBalancerData = ()=>{

  //Proceso para crear por primera vez la informacion que actualizara el balancer

}



data?.map((dato)=>{

 
 total = new Date(dato.DiaPeriod).setHours(0,0,0,0);
 total2 = new Date (total);
 total2.setDate(total2.getDate() + parseInt(dato.Dia) + 1)  // se trae la cantidad de dias definidas en rules
                                                            //  y se agrega un dia mas para que concuerde con el sabado que pasaria a ser el nuevo dia clave
 day = new Date(total2).getDate();
 mes = new Date(total2).getMonth();
 año = new Date(total2).getFullYear();



 //Operaciones para mantener actualizado el dia clave
  if(day==dayActual && mes == mesActual && año == añoActual)
  {
    //Procedemos a actualizar el dia clave en rules si 
    console.log("SEACTUALIZO LA NUEVA FECHA");
    aux = 1;
    
  }
  else{
    console.log("ACTUAL .. " + "dia actual " + dayActual + " Mes actual " + mesActual + " Año actual " + añoActual);
    console.log("------------------");
    console.log("META .. " + "dia meta " + day + " Mes meta " + mes + " Año meta " + año);

    console.log("------------------")
    console.log("DIA ES " + data[0].Dia)
  }

})

if(aux == 1)
{
   setId(data[0]._id);
   update();
}




//-**************************************************************************************************************

useEffect(()=>{
  obtenerListadoRules();
},[]);



  return (
    <BrowserRouter>
      <div className="Container">
        <Sidebar />
        <div className="content">
         <Modal1 estado={modal1} cambiarEstado={setModal1}/>
         <Top/>
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
