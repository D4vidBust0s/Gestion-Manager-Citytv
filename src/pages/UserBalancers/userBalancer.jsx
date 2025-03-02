/* ESTILOS */


/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1';
import Footer from '../../Components/Body-Section/Footer/Footer';
import UserBalancerContent from '../../pages/UserBalancers/userBalancerContent';

/* DEPENDENCIAS */
import {useState} from 'react'

/* IMAGENES */
import poster from '../../assets/balancer.jpg'


export default function PayrollManager() {
  const [estadoFooter] = useState(false);

  return (
    <>
      {<Footer estado={estadoFooter} />}
      <div className="mainContainer">
        <BaseOperations1
          titulo="User Balancers"
          urlposter={poster}
          content={<UserBalancerContent />}
        />
      </div>
    </>
  );
}
