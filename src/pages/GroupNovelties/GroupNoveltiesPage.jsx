/* COMPONENTS */
import BaseOperations1 from '../../Components/Body-Section/Bases/BaseOperations2';
import GroupNoveltiesContent from './GroupNoveltiesContent';

const GroupNoveltiesPage = () => {
  return (
    <>
      <div className='mainContainer'>
       <BaseOperations1 titulo="Novedades Operativas" content={<GroupNoveltiesContent />} />
     </div>
    </>
  );
}

export default GroupNoveltiesPage;
