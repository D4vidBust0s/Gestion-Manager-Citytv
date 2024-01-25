/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1';
import Footer from '../../Components/Body-Section/Footer/Footer';
import IncapacityContent from '../../pages/Incapacity/IncapacityContent';

/* DEPENDENCIAS */
import {useState} from 'react';

/* IMAGENES */
import poster from '../../assets/Enfermedad.jpg'

//-------------------------------------------------------------------------------------------------------------------

const Incapacity = () => {
    //Estados
    const [estadoFooter] = useState(false); 

  return (
   <>
      { <Footer estado={estadoFooter} />}
      <div className='mainContainer'>
       <BaseOperations1 titulo="Incapacity"  urlposter={poster}  content = {<IncapacityContent/>}/>
    </div>
    </>
  )
}

export default Incapacity
