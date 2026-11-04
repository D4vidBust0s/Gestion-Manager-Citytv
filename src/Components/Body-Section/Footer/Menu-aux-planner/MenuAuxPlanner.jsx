/* IMPORT ESTILOS */
import './MenuAuxPlanner.css';

/* DEPENDENCIAS */
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';

/* SERVICIOS Y TIEMPO REAL */
import { groupsApi } from '../../../../api/groups';
import { noveltiesApi } from '../../../../api/novelties';
import { useNoveltyRealtime } from '../../../../Custom_Hooks/useNoveltyRealtime';

//-------------------------------------------------------------------------------------------------------------

export default function MenuAuxPlanner() {
  const [data, setData] = useState([]);
  const [noveltiesCountByGroup, setNoveltiesCountByGroup] = useState({});
  const debounceRef = useRef(null);

  const fetchMenuData = useCallback(async () => {
    try {
      // 1. Obtener listado de grupos
      const groups = await groupsApi.getAll();
      setData(Array.isArray(groups) ? groups : []);

      // 2. Obtener todas las novedades para los contadores individuales de los cuadros
      const allNovelties = await noveltiesApi.getAll();

      const counts = {};
      (Array.isArray(allNovelties) ? allNovelties : []).forEach(novelty => {
        if (novelty.estado === "Pendiente") {
          const gId = novelty.grupoID;
          counts[gId] = (counts[gId] || 0) + 1;
        }
      });

      setNoveltiesCountByGroup(counts);
    } catch (error) {
      console.error("Error al cargar datos en el menú auxiliar:", error);
    }
  }, []);

  // Agrupa las ráfagas de eventos (socket + evento local) en una sola consulta
  const refrescar = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      fetchMenuData();
    }, 300);
  }, [fetchMenuData]);

  useEffect(() => {
    fetchMenuData();

    // Escuchar el evento global para actualizar los contadores de los logos en tiempo real
    const handleNoveltyChange = () => {
      refrescar();
    };

    window.addEventListener('noveltyStatusChanged', handleNoveltyChange);

    return () => {
      window.removeEventListener('noveltyStatusChanged', handleNoveltyChange);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchMenuData, refrescar]);

  // Cambios hechos desde otras sesiones (socket compartido del chat)
  useNoveltyRealtime({
    onCreated: refrescar,
    onResolved: refrescar,
    onDeleted: refrescar,
    onResync: refrescar,
  });

  return (
    <>
      <div className="main-content-aux1">
        <div className="content-menu-aux">
          {data?.map((group) => {
            const pendingCount = noveltiesCountByGroup[group._id] || 0;

            return (
              <div key={group._id} className="base-cuadro">
                {/* Solo muestra el badge si hay 1 o más novedades pendientes en este grupo */}
                {pendingCount > 0 && (
                  <div className="notification">{pendingCount}</div>
                )}

                <Link to={`/group-novelties/${group._id}`}>
                  <img src={group.logo} alt={group.nombre || "grupo"} className="basecuadro-img"/>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
