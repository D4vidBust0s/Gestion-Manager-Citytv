import BaseOperations2 from '../../Components/Body-Section/Bases/BaseOperations2'
import ProgrammerContent from './ProgrammerContent'

/**
 * Requerimientos manuales (Journal → Programmer).
 *
 * El mismo registro se usa como requerimiento y como evento de ModalPlanner1
 * mientras no está desarrollado el sistema de Requirements.
 */
export default function Programmer() {
  return (
    <div className='mainContainer'>
      <BaseOperations2 titulo="Programmer" content={<ProgrammerContent />} />
    </div>
  )
}
