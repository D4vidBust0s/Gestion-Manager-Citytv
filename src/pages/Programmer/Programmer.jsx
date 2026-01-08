/* ESTILOS */

/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1'
import Footer from '../../Components/Body-Section/Footer/Footer'
import ProgrammerContent from '../../pages/Programmer/ProgrammerContent'

/* DEPENDENCIAS */
import {useState} from 'react'

/* IMAGENES */
import poster from '../../assets/calendar-programmer.jpg'

export default function programmer() {

    const [estadoFooter] = useState(false); 
  return (
   <>
     { <Footer estado={estadoFooter} />}
      <div className='mainContainer'>
       <BaseOperations1 titulo="Programmer"  urlposter={poster}  content = {<ProgrammerContent/>}/>
    </div>
   </>
  )
}
