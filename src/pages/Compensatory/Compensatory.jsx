/* ESTILOS */

/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1'
import GroupsContent from '../../pages/Compensatory/CompensatoryContent'

/* IMAGENES */
import poster from '../../assets/groups.jpg'

export default function Compensatory() {

  return (
   <>
      <div className='mainContainer'>
       <BaseOperations1 titulo="Compensatory"  urlposter={poster}  content = {<GroupsContent/>}/>
    </div>
   </>
  )
}
