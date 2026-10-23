/* IMPORT ESTILOS */
import './MenuAuxPlanner.css';

/* DEPENDENCIAS */
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';

//-------------------------------------------------------------------------------------------------------------

export default function MenuAuxPlanner() {
  const [data, setData] = useState([]);
  const [noveltiesCountByGroup, setNoveltiesCountByGroup] = useState({});

  const fetchMenuData = useCallback(async () => {
    try {
      // 1. Obtener listado de grupos
      const groupsRes = await axios.get("http://localhost:3000/api/groups");
      setData(groupsRes.data);

      // 2. Obtener todas las novedades para los contadores individuales de los cuadros
      const noveltiesRes = await axios.get("http://localhost:3000/api/novelties");
      const allNovelties = noveltiesRes.data;

      const counts = {};
      allNovelties.forEach(novelty => {
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

  useEffect(() => {
    fetchMenuData();

    // Escuchar el evento global para actualizar los contadores de los logos en tiempo real
    const handleNoveltyChange = () => {
      fetchMenuData();
    };

    window.addEventListener('noveltyStatusChanged', handleNoveltyChange);

    return () => {
      window.removeEventListener('noveltyStatusChanged', handleNoveltyChange);
    };
  }, [fetchMenuData]);

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