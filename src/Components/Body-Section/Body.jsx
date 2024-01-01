import {BrowserRouter,Routes,Route} from 'react-router-dom'

/* Estilos */
import './Body.scss'

/* Componentes */

/*Pages */
import Dashboard from '../../pages/Dasboard/DashboardPage'
import Main from '../../pages/Main/MainPage'
import MainPlanner from '../../pages/MainPlanner/MainPlannerPage'
import NotFound from '../../pages/NotFound/NotFoundPage'


function Body() {

  return (
    <div className="mainContent">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/main" element={<Main />} />
          <Route path="/mainplanner" element={<MainPlanner />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default Body

