/* IMPORT ESTILOS */
import './MenuAuxPlanner.css'

/* IMPORT ASSETS */


/* DEPENDENCIAS */
import {Link} from 'react-router-dom';
import axios from 'axios';
import {useState,useEffect} from 'react';


//-------------------------------------------------------------------------------------------------------------

// eslint-disable-next-line react/prop-types
export default function MenuAuxPlanner() {

  


  //FUNCIONES
  //Funcion que obtiene la data de la api - listado de grupos
  const obtenerListadoGrupos = async () => {
    return await axios
      .get("http://localhost:3000/api/groups")
      .then((response) => setData(response.data));
  };

  
  useEffect(() => {
    obtenerListadoGrupos();
  }, []);

  //Estados para la Data de groups
 const [data, setData] = useState([]);


  return (
    <>
      <div className="main-content-aux1">
        <div className="content-menu-aux">
          {data?.map((group) => (
            <div key={group._id} className="base-cuadro">
              <div className="notification">3</div>
              <Link to="/team1">
                <img src={group.logo} alt="" className="basecuadro-img"/>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
