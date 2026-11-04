
/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1';
import RecessContent from '../../pages/Breaks/breaksContent';

/* IMAGENES */
import poster from '../../assets/Break.jpg'

//-------------------------------------------------------------------------------------------------------------------

const Breaks = () => {
  return (
   <>
      <div className='mainContainer'>
       <BaseOperations1 titulo="Breaks"  urlposter={poster}  content = {<RecessContent/>}/>
    </div>
    </>
  )
}

export default Breaks
