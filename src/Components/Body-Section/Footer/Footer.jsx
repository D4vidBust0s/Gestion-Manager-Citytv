/* Import hoja de estilos */
import '../Footer/Footer.css'

/* Import Dependencias */
import PropTypes from 'prop-types';
import {Routes,Route} from 'react-router-dom';



/* Import components */
import MenuAuxPlanner from './Menu-aux-planner/MenuAuxPlanner'
import { useState } from 'react';
import BotonFlotante from '../../Biblioteca/botonFlotante'




function Footer() {
  
  const [estado, setEstado] = useState(false);

  return (
    <>
  
    {estado && (
      <div className="container-menu">
      <Routes>
        <Route path="*" element={<MenuAuxPlanner actual={estado} cambiar={setEstado}/>} />
      </Routes>
    </div>
    )}
    
    <BotonFlotante actual={estado} cambio={setEstado}/>
    </>
  );
}

Footer.propTypes={
  mensaje: PropTypes.string,
  estado: PropTypes.bool,
}

export default Footer
