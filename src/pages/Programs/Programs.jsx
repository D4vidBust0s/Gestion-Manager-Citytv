
/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations1'
import ProgramsContent from '../../pages/Programs/ProgramsContent'

/* IMAGENES */
import poster from '../../assets/program.jpg'

export default function Programs() {

  return (
   <>
      <div className='mainContainer'>
       <BaseOperations1 titulo="Programs"  urlposter={poster}  content = {<ProgramsContent/>}/>
    </div>
   </>
  )
}
