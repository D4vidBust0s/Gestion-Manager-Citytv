/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations2';
import Footer from '../../Components/Body-Section/Footer/Footer';
import GroupNoveltiesContent from './GroupNoveltiesContent';

/* DEPENDENCIAS */
import { useState } from 'react';

const GroupNoveltiesPage = () => {
    const [estadoFooter] = useState(false); 

  return (
    <>
      {<Footer estado={estadoFooter} />}
      <div className='mainContainer'>
       <BaseOperations1 titulo="Novedades Operativas" content={<GroupNoveltiesContent />} />
     </div>
    </>
  );
}

export default GroupNoveltiesPage;