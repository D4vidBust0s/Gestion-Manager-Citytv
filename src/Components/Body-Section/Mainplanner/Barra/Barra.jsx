/* ESTILOS */
import './Barra.css'

/* IMAGENES */
import tropa from '../../../../assets/tropa.png';
//import flecha from '../../../../assets/arrow.svg'

/* DEPENDENCIAS */
import {useState, useEffect} from 'react'
import { createPortal } from 'react-dom';
import axios from 'axios';
import {Toaster, toast} from 'react-hot-toast'
import DatePicker from 'react-datepicker';

/* COMPONENTES MODALES*/
import ModalPlanner1 from "../../../Modals/ModalPlanner1";

//Variables Globales


export default function Barra() {
  
//estado para la ventana modal1 
 const [modal1, setModal1] = useState(false); 

 //Estados para la Data de groups
 const [startDate, setStartDate] = useState(new Date());
 const [data, setData] = useState([]);
 const [data1, setData1] = useState([]);
 const [nombre, setNombre] = useState("");
 const [cargo, setCargo] = useState("");


 //variables globales
 //let idGroup;


 //FUNCIONES
  //Funcion que obtiene la data de la api - listado de grupos
  const obtenerListadoGrupos = async () => {
    return await axios
      .get("http://localhost:3000/api/groups")
      .then((response) => setData(response.data));
  };

  const getPeople = async ()=>{
    return await axios
    .get("http://localhost:3000/api/payroll")
    .then((response) => setData1(response.data));
  }

 


  const exist = (pid,pg,gn,pn,cargo,pa) =>{

    return <ul className="ulMain" key={pid}>
    <li className="liMain" key={pid} onClick={() => setModal1(!modal1) + setNombre(pn+" "+pa) + setCargo(cargo)}>
     {pn +" "+pa}
    </li>
</ul>

  }
  


  //-------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    obtenerListadoGrupos();
  }, []);

  useEffect(() => {
    getPeople();
  }, []);

 

  return (
    <>

      

    <Toaster />
      {createPortal(
        <ModalPlanner1 estado={modal1} cambiarEstado={setModal1} nombres={nombre} cargo={cargo} fechaPlaner={startDate} />,
        document.querySelector("#portal")
      )}

      <div className="barra">
      
        <img src={tropa} alt="tropa" className="imgTropa" />
        <div className="content-listado">
        <div className="calendar">
        <DatePicker
          className="picker"
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          showMonthDropdown
        />
      </div>
  
          {
            //Ciclo que trae el numero de grupos del sistema
            data?.map((group)=>(
              

                <div className="hola" key={group._id}>
                  {
                    //Ciclo que trae todos los usuarios del sistema 
                    data1?.map((payroll)=>(
                    <div className="hol" key={payroll._id}>
                      {
                             
                           payroll.grupo == group.nombre ?  exist(payroll.id,payroll.group,group.nombre,payroll.nombres,payroll.cargo,payroll.apellidos) : null
                         
                      
                      }
                    </div>
                  ))
                  }
                  <div className="separador"></div>
                </div>
                
            ))
            
            
          }

          

        </div>
      </div>
    </>
  );
}
