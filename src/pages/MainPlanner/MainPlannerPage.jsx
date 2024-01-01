import {useState} from 'react'

import './MainPlannerPage.scss'

/* import imagenes */

/* Componentes */
import TimeLine from '../../Components/Body-Section/Mainplanner/Timeline/Timeline'
import Barra from '../../Components/Body-Section/Mainplanner/Barra/Barra'
import Listado from '../../Components/Body-Section/Mainplanner/Listado/Listado'
import Footer from '../../Components/Body-Section/Footer/Footer'


export default function MainPlanner() {

  const [estadoFooter] = useState(true); 

  return (
    <>
    { <Footer estado={estadoFooter}  /> }

      <div className="mainContent">
        <div className="mainPlanner">
          <div className="cuadro cuadro1">
            <Barra />
          </div>
          <div className="cuadro cuadro2">
            <TimeLine />
            <Listado />
          </div>
        </div>
      </div>
    </>
  );
}
