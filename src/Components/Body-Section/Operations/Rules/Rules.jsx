/* ESTILOS */
import './Rules.css'

/* COMPONENTS */
import BaseOperations1 from '../../Bases/BaseOperations1/'
import Footer from '../../Footer/Footer'
import RulesContent from '../Rules/RulesContent'

/* DEPENDENCIAS */  
import {useState} from 'react'

/* IMAGENES */
import poster from '../../../../assets/cameraman.jpg'

export default function Rules() {
    const [estadoFooter] = useState(false); 


  return (

    <>
    { <Footer estado={estadoFooter} />}
      <div className='mainContainer'>
       <BaseOperations1 titulo="Rules"  urlposter={poster}  content = {< RulesContent/>}/>
    </div>
    </>
  
  )
}

