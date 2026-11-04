/* ESTILOS */

/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1'
import ProgrammerContent from '../../pages/Programmer/ProgrammerContent'

/* IMAGENES */
import poster from '../../assets/calendar-programmer.jpg'

export default function programmer() {

  return (
   <>
      <div className='mainContainer'>
       <BaseOperations1 titulo="Programmer"  urlposter={poster}  content = {<ProgrammerContent/>}/>
    </div>
   </>
  )
}
