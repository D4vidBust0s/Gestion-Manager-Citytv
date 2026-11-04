/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1';
import IncapacityContent from '../../pages/Incapacity/IncapacityContent';

/* IMAGENES */
import poster from '../../assets/Enfermedad.jpg'

//-------------------------------------------------------------------------------------------------------------------

const Incapacity = () => {
  return (
   <>
      <div className='mainContainer'>
       <BaseOperations1 titulo="Incapacity"  urlposter={poster}  content = {<IncapacityContent/>}/>
    </div>
    </>
  )
}

export default Incapacity
