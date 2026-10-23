/* Import hoja de estilos */
import '../Footer/Footer.css';

/* Import Dependencias */
import PropTypes from 'prop-types';
import { Routes, Route } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/* Import components */
import MenuAuxPlanner from './Menu-aux-planner/MenuAuxPlanner';
import BotonFlotante from '../../Biblioteca/botonFlotante';

function Footer() {
  const [estado, setEstado] = useState(false);
  const [totalNovelties, setTotalNovelties] = useState(0);

  // Función para consultar el conteo actual de novedades pendientes
  const actualizarConteoPendientes = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/novelties");
      const allNovelties = response.data;
      const pendientes = allNovelties.filter(n => n.estado === "Pendiente");
      setTotalNovelties(pendientes.length);
    } catch (error) {
      console.error("Error al actualizar el conteo de novedades en el footer:", error);
    }
  }, []);

  useEffect(() => {
    // Carga inicial al montar el footer
    actualizarConteoPendientes();

    // Escuchar el evento disparado al registrar, solucionar o eliminar novedades
    const handleNoveltyChange = () => {
      actualizarConteoPendientes();
    };

    window.addEventListener('noveltyStatusChanged', handleNoveltyChange);

    return () => {
      window.removeEventListener('noveltyStatusChanged', handleNoveltyChange);
    };
  }, [actualizarConteoPendientes]);

  return (
    <>
      {estado && (
        <div className="container-menu">
          <Routes>
            <Route 
              path="*" 
              element={
                <MenuAuxPlanner 
                  actual={estado} 
                  cambiar={setEstado} 
                />
              } 
            />
          </Routes>
        </div>
      )}
      
      <BotonFlotante 
        actual={estado} 
        cambio={setEstado} 
        totalNovelties={totalNovelties} 
      />
    </>
  );
}

Footer.propTypes = {
  mensaje: PropTypes.string,
  estado: PropTypes.bool,
}

export default Footer;