/* ESTILOS */


/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1';
import UserBalancerContent from '../../pages/UserBalancers/userBalancerContent';

/* IMAGENES */
import poster from '../../assets/balancer.jpg'


export default function UserBalancer() {
  return (
    <>
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
