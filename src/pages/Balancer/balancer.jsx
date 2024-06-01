
/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations2';
import Footer from '../../Components/Body-Section/Footer/Footer';
import RecessContent from '../../pages/Balancer/balancerContent';

/* DEPENDENCIAS */
import {useState} from 'react';

/* IMAGENES */
import poster from '../../assets/Break.jpg'

//-------------------------------------------------------------------------------------------------------------------

const Balancer = () => {
    //Estados
    const [estadoFooter] = useState(false); 

  return (
   <>
      { <Footer estado={estadoFooter} />}
      <div className='mainContainer'>
       <BaseOperations1 titulo="Balancer"  urlposter={poster}  content = {<RecessContent/>}/>
    </div>
    </>
  )
}

export default Balancer