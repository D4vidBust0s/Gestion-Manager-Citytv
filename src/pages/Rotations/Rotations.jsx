/* ESTILOS */

/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1'
import Footer from '../../Components/Body-Section/Footer/Footer'
import RotationsContent from '../../pages/Rotations/RotationsContent'

/* DEPENDENCIAS */
import {useState} from 'react'

/* IMAGENES */
import poster from '../../assets/img-calendar.jpg'

export default function Rotations() {

    const [estadoFooter] = useState(false); 
  return (
   <>
     { <Footer estado={estadoFooter} />}
      <div className='mainContainer'>
       <BaseOperations1 titulo="Rotations"  urlposter={poster}  content = {<RotationsContent/>}/>
    </div>
   </>
  )
}
