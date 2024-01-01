/* ESTILOS */


/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1'
import Footer from '../../Components/Body-Section/Footer/Footer'
import PayrollManagerContent from '../../pages/Payroll-manager/PayrollManagerContent'

/* DEPENDENCIAS */
import {useState} from 'react'

/* IMAGENES */
import poster from '../../assets/payroll2.jpg'


export default function PayrollManager() {
  const [estadoFooter] = useState(false);

  return (
    <>
      {<Footer estado={estadoFooter} />}
      <div className="mainContainer">
        <BaseOperations1
          titulo="Payroll Manager"
          urlposter={poster}
          content={<PayrollManagerContent />}
        />
      </div>
    </>
  );
}
