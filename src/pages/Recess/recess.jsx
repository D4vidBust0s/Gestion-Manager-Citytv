

/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1';
import Footer from '../../Components/Body-Section/Footer/Footer';
import RecessContent from '../../pages/Recess/recesContent';

/* DEPENDENCIAS */
import {useState} from 'react';

/* IMAGENES */
import poster from '../../assets/vacaciones.jpg'

//-------------------------------------------------------------------------------------------------------------------

const Incapacity = () => {
    //Estados
    const [estadoFooter] = useState(false); 

  return (
   <>
      { <Footer estado={estadoFooter} />}
      <div className='mainContainer'>
       <BaseOperations1 titulo="Recess"  urlposter={poster}  content = {<RecessContent/>}/>
    </div>
    </>
  )
}

export default Incapacity

