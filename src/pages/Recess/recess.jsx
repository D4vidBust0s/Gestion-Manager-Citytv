
/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1';
import RecessContent from '../../pages/Recess/recesContent';

/* IMAGENES */
import poster from '../../assets/vacaciones.jpg'

//-------------------------------------------------------------------------------------------------------------------

const Incapacity = () => {
  return (
   <>
      <div className='mainContainer'>
       <BaseOperations1 titulo="Recess"  urlposter={poster}  content = {<RecessContent/>}/>
    </div>
    </>
  )
}

export default Incapacity
