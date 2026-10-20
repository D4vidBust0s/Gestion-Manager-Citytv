/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations2';
import Footer from '../../Components/Body-Section/Footer/Footer';
import Tareas from '../../pages/Tasks/TasksContent';

/* DEPENDENCIAS */
import {useState} from 'react';

/* IMAGENES */


//-------------------------------------------------------------------------------------------------------------------

const Task = () => {
    //Estados
    const [estadoFooter] = useState(false); 

  return (
   <>
      { <Footer estado={estadoFooter} />}
      <div className='mainContainer'>
       <BaseOperations1 titulo="Notas Personales"    content = {< Tareas/>}/>
    </div>
    </>
  )
}

export default Task
