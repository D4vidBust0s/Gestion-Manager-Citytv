/* Import hoja de estilos */
import '../Footer/Footer.css';

/* Import Dependencias */
import { useState, useEffect, useCallback, useRef } from 'react';

/* Import components */
import MenuAuxPlanner from './Menu-aux-planner/MenuAuxPlanner';
import BotonFlotante from '../../Biblioteca/botonFlotante';

/* Servicios y tiempo real */
import { noveltiesApi } from '../../../api/novelties';
import { useNoveltyRealtime } from '../../../Custom_Hooks/useNoveltyRealtime';

function Footer() {
  const [estado, setEstado] = useState(false);
  const [totalNovelties, setTotalNovelties] = useState(0);
  const debounceRef = useRef(null);

  // Función para consultar el conteo actual de novedades pendientes
  const actualizarConteoPendientes = useCallback(async () => {
    try {
      const allNovelties = await noveltiesApi.getAll();
      const pendientes = (Array.isArray(allNovelties) ? allNovelties : [])
        .filter(n => n.estado === "Pendiente");
      setTotalNovelties(pendientes.length);
    } catch (error) {
      console.error("Error al actualizar el conteo de novedades en el footer:", error);
    }
  }, []);

  // Agrupa las ráfagas de eventos (socket + evento local) en una sola consulta
  const refrescar = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      actualizarConteoPendientes();
    }, 300);
  }, [actualizarConteoPendientes]);

  // Única fuente de verdad del panel: la instancia de Footer del layout
  const togglePanel = useCallback(() => {
    setEstado(prev => !prev);
  }, []);

  useEffect(() => {
    // Carga inicial al montar el footer
    actualizarConteoPendientes();

    // Escuchar el evento disparado al registrar, solucionar o eliminar novedades
    const handleNoveltyChange = () => {
      refrescar();
    };

    window.addEventListener('noveltyStatusChanged', handleNoveltyChange);

    return () => {
      window.removeEventListener('noveltyStatusChanged', handleNoveltyChange);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [actualizarConteoPendientes, refrescar]);

  // Cambios hechos desde otras sesiones (socket compartido del chat)
  useNoveltyRealtime({
    onCreated: refrescar,
    onResolved: refrescar,
    onDeleted: refrescar,
    onResync: refrescar,
  });

  return (
    <>
      {estado && (
        <div className="container-menu" id="menu-aux-planner">
          <MenuAuxPlanner />
        </div>
      )}

      <BotonFlotante
        actual={estado}
        onToggle={togglePanel}
        totalNovelties={totalNovelties}
      />
    </>
  );
}

export default Footer;
