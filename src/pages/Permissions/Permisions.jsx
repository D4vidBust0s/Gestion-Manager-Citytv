
/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1';
import Footer from '../../Components/Body-Section/Footer/Footer';
import PermissionsContent from '../../pages/Permissions/PermissionsContent';

/* DEPENDENCIAS */
import {useState} from 'react';

/* IMAGENES */
import poster from '../../assets/employee.webp'

//-------------------------------------------------------------------------------------------------------------------
export default function Permisions() {

    //Estados
    const [estadoFooter] = useState(false); 

  return (
    <>
      { <Footer estado={estadoFooter} />}
      <div className='mainContainer'>
       <BaseOperations1 titulo="Permissions"  urlposter={poster}  content = {<PermissionsContent/>}/>
    </div>
    </>
  )
}

