/* ESTILOS */

/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1'
import RotationsContent from '../../pages/Rotations/RotationsContent'

/* IMAGENES */
import poster from '../../assets/img-calendar.jpg'

export default function Rotations() {

  return (
   <>
      <div className='mainContainer'>
       <BaseOperations1 titulo="Rotations"  urlposter={poster}  content = {<RotationsContent/>}/>
    </div>
   </>
  )
}
