
/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1';
import Footer from '../../Components/Body-Section/Footer/Footer';
import PermissionsContent from '../../pages/Licenses/LicensesContent';

/* DEPENDENCIAS */
import {useState} from 'react';

/* IMAGENES */
import poster from '../../assets/license.jpg'

//-------------------------------------------------------------------------------------------------------------------
export default function Permisions() {

    //Estados
    const [estadoFooter] = useState(false); 

  return (
    <>
      { <Footer estado={estadoFooter} />}
      <div className='mainContainer'>
       <BaseOperations1 titulo="Licenses"  urlposter={poster}  content = {<PermissionsContent/>}/>
    </div>
    </>
  )
}

