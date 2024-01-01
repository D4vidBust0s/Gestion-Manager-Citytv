/* ESTILOS */
import  './Listado.css'

/* IMAGENES */

/* COMPONENTES MODALES*/
import ModalPlanner2 from "../../../Modals/ModalPlanner2";

/* DEPENDENCIAS */
import {useState,useEffect} from 'react'
import { createPortal } from 'react-dom';
import axios from 'axios'



export default function Listado() {

   /* estado para la ventana modal1 */
 const [modal2, setModal2] = useState(false); 

  //Estados para la Data de groups
  const [data, setData] = useState([]);

//----------------------------------------------------------------------------------------------------------
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

  return (
    <>
      {createPortal(
        <ModalPlanner2 estado={modal2} cambiarEstado={setModal2} />,
        document.querySelector("#portal")
      )}

      {data?.map((group) => (
       <div className="mainRow" key={group._id}>
       <div className="ContentImgCargos">
         <img src={group.logo} alt={group.nombre} className="imgCargos" />
       </div>

       <div className="mainListados">
         <div className="contentListado">
           <ul className="ulEvent">
             <li className="liEventTipe0" onClick={() => setModal2(!modal2)}>
               <a href="#" className="event">
                 Arriba Bogotá
               </a>
             </li>

             <li className="liEventTipe1" onClick={() => setModal2(!modal2)}>
               <a href="#" className="event">
                 Avance
               </a>
             </li>

             <li className="liEventTipe2" onClick={() => setModal2(!modal2)}>
               <a href="#" className="event">
                 Noticias
               </a>
             </li>
           </ul>
         </div>

         <div className="contentListado">
           <ul className="ulEvent">
             <li className="liEvent">
               <a href="#" className="event">
                 Especial de navidad
               </a>
             </li>
           </ul>
         </div>

         <div className="contentListado">
           <ul className="ulEvent">
             <li className="liEvent">
               <a href="#" className="event">
                 Ciudad x
               </a>
             </li>
           </ul>
         </div>

         <div className="contentListado">
           <ul className="ulEvent">
             <li className="liEvent">
               <a href="#" className="event">
                 Comercial -Maleta led y flex-
               </a>
             </li>
           </ul>
         </div>

         <div className="contentListado">
           <ul className="ulEvent">
             <li className="liEvent">
               <a href="#" className="event">
                 Especial de navidad
               </a>
             </li>
           </ul>
         </div>
       </div>
     </div>
      ))}

      
    </>
  );
}
