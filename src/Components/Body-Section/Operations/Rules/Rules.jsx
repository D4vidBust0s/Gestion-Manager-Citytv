/* ESTILOS */
import './Rules.css'

/* COMPONENTS */
import BaseOperations1 from '../../Bases/BaseOperations1/'
import RulesContent from '../Rules/RulesContent'

/* IMAGENES */
import poster from '../../../../assets/cameraman.jpg'

export default function Rules() {

  return (

    <>
      <div className='mainContainer'>
       <BaseOperations1 titulo="Rules"  urlposter={poster}  content = {< RulesContent/>}/>
    </div>
    </>
  
  )
}
