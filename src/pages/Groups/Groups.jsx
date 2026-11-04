/* ESTILOS */

/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1'
import GroupsContent from '../../pages/Groups/GroupsContent'

/* IMAGENES */
import poster from '../../assets/groups.jpg'

export default function Programs() {

  return (
   <>
      <div className='mainContainer'>
       <BaseOperations1 titulo="Goups"  urlposter={poster}  content = {<GroupsContent/>}/>
    </div>
   </>
  )
}
