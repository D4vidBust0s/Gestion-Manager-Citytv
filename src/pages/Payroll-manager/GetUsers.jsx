import { useEffect } from "react";
import { useActive } from "../../Custom_Hooks/useActive";
import { useFetch } from "../../Custom_Hooks/useFetch";
import toast from "react-hot-toast";
import axios from 'axios';


export const GetUsers = ({set}) => {

  //Peticiones HTTP 
   let BASE_URL = 'http://localhost:3000/api/groups';
   const type = 'GET';    
   const { data, loading, error } = useFetch(BASE_URL, type);

  //FUNCIONES
  //Actaulizar listado de usuarios del grupo seleccionado
  //const BASE_URL2  = "http://localhost:3000/api/payroll/idGroup/" + groupID;


  const showUsersGroup = async (id, e) => {

     //Aqui lo que hago es cambiar los estilos para el item seleccionado;
     useActive({e,classTarget:"contentForma",classActive:"activo"});

      //Funcion que obtiene la data de la api - listado todos los usurios del sistema
    return await axios
      .get("http://localhost:3000/api/payroll/idGroup/" + id)
      .then((response) => set(response.data));
  

  }

   

  return (
     <ul className="ulListado">
    
        {loading && <h3>Cargando...</h3>}
        {error && <h3>Algo Salió mal con la petición a la API: {error}</h3>}
        
        {data?.map((group) => (
              <li
                key={group._id}
                className="contentForma"
                onClick={(e) => showUsersGroup(group._id, e)}
              >
                <img src={group.logo} alt={group.nombre} className="img-cam" />
                {group.nombre}
              </li>
            ))}
      
    </ul>

  )
}







