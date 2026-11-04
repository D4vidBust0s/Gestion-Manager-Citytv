/* ESTILOS */

/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations2'
import RoutesContent from '../../pages/Routes/RoutesContent'

/* IMAGENES */
import poster from '../../assets/img-calendar.jpg'

export default function Rotations() {

  return (
   <>
      <div className='mainContainer'>
       <BaseOperations1 titulo="Routes"  urlposter={poster}  content = {<RoutesContent/>}/>
    </div>
   </>
  )
}
