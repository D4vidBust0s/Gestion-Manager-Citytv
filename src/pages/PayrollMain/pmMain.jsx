/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations2';
import Footer from '../../Components/Body-Section/Footer/Footer';
import PM from '../../pages/PayrollMain/PayrollMain';

/* DEPENDENCIAS */
import {useState} from 'react';

/* IMAGENES */


//-------------------------------------------------------------------------------------------------------------------

const Cv = () => {
    //Estados
    const [estadoFooter] = useState(false); 

  return (
   <>
      { <Footer estado={estadoFooter} />}
      <div className='mainContainer'>
       <BaseOperations1 titulo="Payroll Main"    content = {< PM/>}/>
    </div>
    </>
  )
}

export default Cv
