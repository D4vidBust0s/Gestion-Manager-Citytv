/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1';
import Footer from '../../Components/Body-Section/Footer/Footer';
import CvContent from '../../pages/Cv/CvContent';

/* DEPENDENCIAS */
import {useState} from 'react';

/* IMAGENES */
import poster from '../../assets/cv.jpg'

//-------------------------------------------------------------------------------------------------------------------

const Cv = () => {
    //Estados
    const [estadoFooter] = useState(false); 

  return (
   <>
      { <Footer estado={estadoFooter} />}
      <div className='mainContainer'>
       <BaseOperations1 titulo="Hoja de Vida"  urlposter={poster}  content = {<CvContent/>}/>
    </div>
    </>
  )
}

export default Cv
