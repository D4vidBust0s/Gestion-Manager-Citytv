import {useState} from 'react';
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


import './App.css';


function App() {
  
/* estado para la ventana modal1 */
const [modal1, setModal1] = useState(false); 

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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App
