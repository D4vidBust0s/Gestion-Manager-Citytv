/* eslint-disable react/prop-types */

import  './ModalPlanner3.css'

/* Import recursos */
import Anita from '../../assets/Anita.jpg';
import Calendar from '../../assets/calendar.webp';



/* Import dependencies */
import { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import {Toaster, toast} from 'react-hot-toast';



function ModalPlanner1({estado,cambiarEstado,nombres,cargo,fechaPlaner,iduser}) {

  const [, setDate] = useState()
  const [data, setData] = useState([]);

  /* Estados para el datepicker */
  const [calendar, setCalendar] = useState(new Date());
  const [starIn, setStarIn] = useState(new Date());
  const [starOut, setStarOut] = useState(new Date());
 


  //Referencias


  useEffect(() => {
    const fecha =  Date.now();
      const hoy = new Date(fecha);
      setDate(hoy.toDateString());
  },[]);

 

  function showCalendar(){
    <DatePicker
    className='input-especial'
          selected={calendar}
          onChange={(date) => setCalendar(date)}
          showYearDropdown
          dateFormatCalendar="MMMM"
          yearDropdownItemNumber={15}
          scrollableYearDropdown
    />
  }




  //FUNCIONES
  //Funcion que obtiene la data de la api - listado de programs
  const obtenerListadoPrograms = async () => {
    return await axios
      .get("http://localhost:3000/api/programs")
      .then((response) => setData(response.data));
  };

  

  


  


  

  

  


  


  useEffect(() => {
    obtenerListadoPrograms();
  }, []);



  return (
    <>
    <Toaster />
      {estado && (
        <div 
          className="container-modal1"
        >
          
          {/*CABECERA */}
          <div className="cabecera">
            
            <img src={Anita} alt="anita" className="img-Profile" />
            <h3 className="nombre">
              {nombres}
              <br />
              <span className="roll">{cargo}</span>
            </h3>

            <h2 className="fecha">{fechaPlaner.toDateString()}</h2>
            <img src={Calendar} alt="calendar" className="img-calendar" onClick={showCalendar}/>
          </div>

          <div className="actividad">
              <div className="actividad_title2">
                PERMISO
              </div>
                <div className="actividad_container">
                    <div className="actividad_lista">
                        <p>Lorem ipsum dolor sit amet, consectetur ndae recusandae dolore, optio, incidunt nisi quas aut rerum a repellendus accusantium dicta nesciunt?</p>
                    </div> 
                </div>
        </div>

          <div className="cuerpoModal" style={{border: '#7ED957 2px solid'}}>
          <div className="close2" onClick={() => cambiarEstado(!estado)}>X</div>
            {/* Body */}

            <div className="body_container">
                <div className="body-left">
                    <h4 className='body_left_title'>Especificación de dias</h4>
        
                    <DatePicker
                        selected={calendar}
                        onChange={(date) => setCalendar(date)}
                        inline
                        showWeekNumbers
                        showMonthDropdown
                        startDate={starIn}
                        endDate={starOut}
                    />
                </div>

                <div className="body-right">
                    <h4 className='body-right-title'>Información general</h4>
                    
                    <h4 className='body-right-description'>Descripción:</h4>
                    <p className='body-right-parrafo'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iae, aspernatur laudantium ea nobis
                         mollitia modi ducimus officia libero dolores eius, corrupti enim repellat sequi.</p>

                    <h4 className='body-right-description'>Fecha de inicio:</h4>
                    <p className='body-right-parrafo'>
                        sabado 20 de marzo de 2024
                    </p>

                    <h4 className='body-right-description'>Fecha final:</h4>
                    <p className='body-right-parrafo'>
                        sabado 28 de marzo de 2024
                    </p>

                    <h4 className='body-right-description'>Autorizado por:</h4>
                    <p className='body-right-parrafo'>
                        Jose David Vivas Betaba
                    </p>

                    <h4 className='body-right-description'>Permisos en este año:</h4>
                   <ul className='ulListado'>
                    <li className='liListado'>- Nombre permiso 1 - fecha inicio: 25 de febrero de 2024 Fecha ---- final: 30 de marzo de 2024</li>
                    <li className='liListado'>- Nombre permiso 2 - fecha inicio: 25 de febrero de 2024 Fecha ---- final: 30 de marzo de 2024</li>
                    <li className='liListado'>- Nombre permiso 3 - fecha inicio: 25 de febrero de 2024 Fecha ---- final: 30 de marzo de 2024</li>
                    <li className='liListado'>- Nombre permiso 4 - fecha inicio: 25 de febrero de 2024 Fecha ---- final: 30 de marzo de 2024</li>
                    <li className='liListado'>- Nombre permiso 5 - fecha inicio: 25 de febrero de 2024 Fecha ---- final: 30 de marzo de 2024</li>
                    <li className='liListado'>- Nombre permiso 6 - fecha inicio: 25 de febrero de 2024 Fecha ---- final: 30 de marzo de 2024</li>
                    <li className='liListado'>- Nombre permiso 7 - fecha inicio: 25 de febrero de 2024 Fecha ---- final: 30 de marzo de 2024</li>
                    <li className='liListado'>- Nombre permiso 8 - fecha inicio: 25 de febrero de 2024 Fecha ---- final: 30 de marzo de 2024</li>
                   </ul>

                </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default ModalPlanner1
