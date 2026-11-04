/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations2';
import Tareas from '../../pages/Tasks/TasksContent';

/* IMAGENES */


//-------------------------------------------------------------------------------------------------------------------

const Task = () => {
  return (
   <>
      <div className='mainContainer'>
       <BaseOperations1 titulo="Notas Personales"    content = {< Tareas/>}/>
    </div>
    </>
  )
}

export default Task
