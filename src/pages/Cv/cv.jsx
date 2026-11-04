/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1';
import CvContent from '../../pages/Cv/CvContent';

/* IMAGENES */
import poster from '../../assets/cv.jpg'

//-------------------------------------------------------------------------------------------------------------------

const Cv = () => {
  return (
   <>
      <div className='mainContainer'>
       <BaseOperations1 titulo="Hoja de Vida"  urlposter={poster}  content = {<CvContent/>}/>
    </div>
    </>
  )
}

export default Cv
