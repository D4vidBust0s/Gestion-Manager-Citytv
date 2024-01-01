/* eslint-disable react/prop-types */
import  './ModalPlanner2.css'

/* Import recursos */
import Anita from '../../assets/Anita.jpg'
import Calendar from '../../assets/calendar.webp'
import Clock from '../../assets/clock.svg'
import Pencil from '../../assets/pencil.svg'
import Adjust from '../../assets/adjust.svg'
import Trash from '../../assets/trash.svg'
import PaintRoll from '../../assets/paint-roll.svg'

/* Impor dependencies */
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker'

export default function ModalPlanner2({estado,cambiarEstado}) {

    const [date, setDate] = useState()
    const [turno] = useState("Noticias")

    /* Estados para datepickers */
    const [startHour, setStartHour] = useState(new Date());
    const [endtHour, setEndHour] = useState(new Date());
  
    useEffect(() => {
      const fecha =  Date.now();
        const hoy = new Date(fecha);
        setDate(hoy.toDateString());
    },[]);


  return (
    <>
      {estado && (
        <div
          className="container-modal2"
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
            <img src={Calendar} alt="calendar" className="img-calendar" />
          </div>

          <div className="cuerpoModa2">
            <div className="container-Observaciones">
              <h3 className="subTitulo">Observaciones</h3>
              <textarea
                name="observaciones"
                cols="90"
                rows="8"
                className="observaciones"
              ></textarea>
            </div>
          </div>

          <div className="container-turno">
            <ul className="ulLista">
              <li className="liItem">
                <img src={Clock} alt="reloj" className='imgclock1'/>
                
                         <DatePicker
                           className='hInicio'
                            selected={startHour}
                            onChange={(date) => setStartHour(date)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Start"
                            dateFormat="HH:mm aa"
                          />

                    <input type="text" className='inputTurno' placeholder='Turno seleccionado aqui' value={turno}/>
                
                    <DatePicker
                           className='hFinal'
                            selected={endtHour}
                            onChange={(date) => setEndHour(date)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="End"
                            dateFormat="HH:mm aa"
                          />

                <img src={Clock} alt="reloj" className='imgclock2'/>
              </li>
            </ul>

            <div className="seccionButons">
                <div className="containerSingleButtom">
                  <img src={Pencil} alt="pencil" className='img-butons'/>
                </div>
                <div className="containerSingleButtom">
                 <img src={Trash} alt="plus" className='img-butons'/>
                </div>
                <div className="containerSingleButtom">
                 <img src={PaintRoll} alt="paint" className='img-butons'/>
                </div>
                <div className="containerSingleButtom--active">
                 <img src={Adjust} alt="adjust" className='img-butons'/>
                </div>
              </div>
          </div>
        </div>
      )}
    </>
  );
}
