/* eslint-disable react/prop-types */

import  './ModalPlanner1.css'

/* Import recursos */
import Anita from '../../assets/Anita.jpg'
import Calendar from '../../assets/calendar.webp'
import Clock from '../../assets/bx-time-five.svg'
import Pencil from '../../assets/pencil.svg'
import Plus from '../../assets/user-plus.svg'
import Trash from '../../assets/trash.svg'

/* Import dependencies */
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker'

function ModalPlanner1({estado,cambiarEstado}) {

  const [date, setDate] = useState()
  const [horaejemplo]= useState("4:00")
  const [valoremplo]= useState("Programa 1")

  /* estados para el datepicker */
  const [calendar, setCalendar] = useState(new Date());


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

  const [startHour, setStartHour] = useState(new Date());
  const [EndHour, setEndHour] = useState(new Date());

  return (
    <>
      {estado && (
        <div
          className="container-modal1"
          onDoubleClick={() => cambiarEstado(!estado)}
        >
          <div className="cabecera">
            <img src={Anita} alt="anita" className="img-Profile" />
            <h3 className="nombre">
              Anna Brenda Contreras
              <br />
              <span className="roll">Actríz y cantante</span>
            </h3>

            <h2 className="fecha">{date}</h2>
            <img src={Calendar} alt="calendar" className="img-calendar" onClick={showCalendar}/>
          </div>

          <div className="cuerpoModal">
            <div className="list-turnos">
              <div className="titulo">
                <h2>TURNOS PROGRAMADOS</h2>
              </div>
              <ul className="ulLista">
                <li className="liItem">
                  <span className="hInicio">4:00</span>Arriba Bogotá
                  <span className="hFinal">9:30</span>
                </li>
                <li className="liItem">
                  <span className="hInicio">11:00</span>Noticias
                  <span className="hFinal">13:00</span>
                </li>
                <li className="liItem">
                  <span className="hInicio">14:00</span>Comercial
                  <span className="hFinal">15:00</span>
                </li>
                <li className="liItem">
                  <span className="hInicio">15:30</span>Famosos con city
                  <span className="hFinal">16:00</span>
                </li>
                <li className="liItem">
                  <span className="hInicio">16:30</span>Bravissimo
                  <span className="hFinal">18:00</span>
                </li>
                <li className="liItem">
                  <span className="hInicio">20:00</span>Defensor del televidente
                  <span className="hFinal">21:00</span>
                </li>
              </ul>
            </div>

            <div className="acciones">
              <div className="titulo">
                <h2>ACCIONES</h2>
              </div>
              <div className="mainContainer">
                <h3 className="subTitulo">Programa evento o requerimiento</h3>
                <select name="turnoSeleccionado" className='selectedBox'>
                  <option value={horaejemplo} className='selecteItem'>{valoremplo}</option>
                  <option value={horaejemplo} className='selecteItem'>{valoremplo}</option>
                  <option value={horaejemplo} className='selecteItem'>{valoremplo}</option>
                </select>

                <h3 className="subTitulo">Horario</h3>
                <div className="container-datapickers">
                  <div className="contentGroup">
                    <img src={Clock} alt="reloj" className='clock'/>
                    <DatePicker
                    className='inputInicio'
                            selected={startHour}
                            onChange={(date) => setStartHour(date)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Start"
                            dateFormat="HH:mm aa"
                          />
                  </div>

                  <div className="contentGroup">
                    <img src={Clock} alt="reloj" className='clock'/>
                    <DatePicker
                    className='inputInicio'
                            selected={EndHour}
                            onChange={(date) => setEndHour(date)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="End"
                            dateFormat="HH:mm aa"
                          />
                  </div>
                </div>

                <h3 className="subTitulo">Observaciones</h3>
                <textarea name="observaciones" cols="30" rows="8" className='observaciones'></textarea>
              </div>

              <div className="seccionButons">
                <div className="containerSingleButtom">
                  <img src={Pencil} alt="pencil" className='img-butons'/>
                </div>
                <div className="containerSingleButtom">
                 <img src={Plus} alt="plus" className='img-butons'/>
                </div>
                <div className="containerSingleButtom">
                 <img src={Trash} alt="trash" className='img-butons'/>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalPlanner1
