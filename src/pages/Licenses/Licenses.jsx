
/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1';
import PermissionsContent from '../../pages/Licenses/LicensesContent';

/* IMAGENES */
import poster from '../../assets/license.jpg'

//-------------------------------------------------------------------------------------------------------------------
export default function Permisions() {

  return (
    <>
      <div className='mainContainer'>
       <BaseOperations1 titulo="Licenses"  urlposter={poster}  content = {<PermissionsContent/>}/>
    </div>
    </>
  )
}
