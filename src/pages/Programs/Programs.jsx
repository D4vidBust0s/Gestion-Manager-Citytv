
/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1'
import Footer from '../../Components/Body-Section/Footer/Footer'
import ProgramsContent from '../../pages/Programs/ProgramsContent'

/* DEPENDENCIAS */
import {useState} from 'react'

/* IMAGENES */
import poster from '../../assets/program.jpg'

export default function Programs() {

    const [estadoFooter] = useState(false); 
  return (
   <>
     { <Footer estado={estadoFooter} />}
      <div className='mainContainer'>
       <BaseOperations1 titulo="Programs"  urlposter={poster}  content = {<ProgramsContent/>}/>
    </div>
   </>
  )
}
