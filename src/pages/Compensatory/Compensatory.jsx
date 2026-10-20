/* ESTILOS */

/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1'
import Footer from '../../Components/Body-Section/Footer/Footer'
import GroupsContent from '../../pages/Compensatory/CompensatoryContent'

/* DEPENDENCIAS */
import {useState} from 'react'

/* IMAGENES */
import poster from '../../assets/groups.jpg'

export default function Compensatory() {

    const [estadoFooter] = useState(false); 
  return (
   <>
     { <Footer estado={estadoFooter} />}
      <div className='mainContainer'>
       <BaseOperations1 titulo="Compensatory"  urlposter={poster}  content = {<GroupsContent/>}/>
    </div>
   </>
  )
}