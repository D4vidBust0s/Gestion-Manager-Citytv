/* ESTILOS */
import  './Listado.css'

/* IMAGENES */

/* COMPONENTES MODALES*/
import ModalPlanner2 from "../../../Modals/ModalPlanner2";

/* DEPENDENCIAS */
import {useState,useEffect} from 'react'
import { createPortal } from 'react-dom';
import axios from 'axios';
//import DatePicker from 'react-datepicker';



export default function Listado() {
  /* estado para la ventana modal1 */
  const [modal2, setModal2] = useState(false);

  //Estados para la Data de groups
  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);

  //Estados para el datepicker
  //const [startDate, setStartDate] = useState(new Date());

  //----------------------------------------------------------------------------------------------------------
  //FUNCIONES
  //Funcion que obtiene la data de la api - listado de grupos
  const obtenerListadoGrupos = async () => {
    return await axios
      .get("http://localhost:3000/api/groups")
      .then((response) => setData(response.data));
  };

  //Funcion que obtiene la data de la api - todos los usuario
  const getPeople = async ()=>{
    return await axios
    .get("http://localhost:3000/api/payroll")
    .then((response) => setData1(response.data));
  };

  const exist = (payrollId,payrollGrupo,groupNombre,payrollNombres) =>{

    return <div className="contentListado">
      <ul className="ulEvent">
      <li className="liEventTipe0" onClick={() => setModal2(!modal2)}>
                  <a href="#" className="event">
                    Arriba Bogotá
                  </a>
                </li>
      </ul>
    </div>
    
    
  

  };

 

  useEffect(() => {
    obtenerListadoGrupos();
  }, []);

  useEffect(() => {
    getPeople();
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
            
           {
            //Ciclo que trae todos los usuarios del sistema 
           data1?.map((payroll)=>(
            <div className="hol" key={payroll._id}>
              {
                     
                   payroll.grupo == group.nombre ?  exist(payroll._id,payroll.grupo,group.nombre,payroll.nombres) : null
              
              }
            </div>
            
          ))
          
           }
            

            

            <div className="separador2"></div>
          </div>

          


        </div>
      ))}
    </>
  );
}
