
/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1';
import PermissionsContent from '../../pages/Permissions/PermissionsContent';

/* IMAGENES */
import poster from '../../assets/employee.webp'

//-------------------------------------------------------------------------------------------------------------------
export default function Permisions() {

  return (
    <>
      <div className='mainContainer'>
       <BaseOperations1 titulo="Permissions"  urlposter={poster}  content = {<PermissionsContent/>}/>
    </div>
    </>
  )
}
