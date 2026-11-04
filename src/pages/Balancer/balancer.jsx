
/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations2';
import RecessContent from '../../pages/Balancer/balancerContent';

/* IMAGENES */
import poster from '../../assets/Break.jpg'

//-------------------------------------------------------------------------------------------------------------------

const Balancer = () => {
  return (
   <>
      <div className='mainContainer'>
       <BaseOperations1 titulo="Balancer"  urlposter={poster}  content = {<RecessContent/>}/>
    </div>
    </>
  )
}

export default Balancer
