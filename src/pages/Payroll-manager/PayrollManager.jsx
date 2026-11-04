/* ESTILOS */


/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1'
import PayrollManagerContent from '../../pages/Payroll-manager/PayrollManagerContent'

/* IMAGENES */
import poster from '../../assets/payroll2.jpg'


export default function PayrollManager() {
  return (
    <>
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
