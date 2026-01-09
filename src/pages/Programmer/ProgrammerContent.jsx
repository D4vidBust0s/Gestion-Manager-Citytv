/* ESTILOS */
import './ProgrammerContent.css'

/* DEPENDENCIAS */
import DatePicker from 'react-datepicker';
import {useState,useEffect,useRef} from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Toaster, toast } from "react-hot-toast";
import Swal from "sweetalert2";

/* COMPONENTES MODALES*/
import ModalBase1 from "../../Components/Modals/ModalBases/ModalBase1";
import ModalPayrollManager from '../../Components/Modals/ModalManagerPayroll'

/* IMAGENES */
import Plus from '../../assets/Plus.svg'
import Edit from '../../assets/pencil.svg'
import Delete from '../../assets/trash.svg'
import calendar from '../../assets/Calendar-withe.svg'
import clock from '../../assets/clock.svg'

/* VARIABLES */
let idProgrammer = "";


export default function ProgrammerContent() {

  //ESTADOS
  //const [star, setStar] = useState(new Date());
  const [starOut, setStarOut] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [startHour,setStartHour] = useState(new Date());
  const [endHour,setEndHour] = useState(new Date());
  const [starIn, setStarIn] = useState(new Date());
  const [color, setColor] = useState("#000000");

  //REFERENCIAS
  const nombreRef = useRef();
  const observacionRef = useRef();
  const fechaInicialRef = useRef();
  const starInRef = useRef();
  const starOutRef = useRef();
  const startRef = useRef();
  const endRef = useRef();
  const colorRef = useRef();

  const [data1, setData1] = useState([]);


  //FUNCIONES

  const formatera = (fecha)=>{
    let recibida = fecha;
    let nueva  = new Date(recibida).setHours(0,0,0,0);
    return new Date(nueva);
  }


  //Funcion que obtiene la data de la api - listado de programs
  const getProgrammers = async () => {
    
    return await axios
      .get("http://localhost:3000/api/programmer",
      {
        params:{
          fecha: formatera(startDate)
        }
      })
      .then((response) => setData1(response.data));
  };



  const crearProgrammer = async () =>{

    //Validaciones

    if(nombreRef.current.value == "")
    {
      toast.error("Debe ingresar un nombre para el evento");
      nombreRef.current.focus();
    }

    else if(colorRef.current.value == "")
    {
      toast.error("Debe ingresar seleccionar un color para el evento");
      colorRef.current.focus();
    }

    else{
        await axios.post("http://localhost:3000/api/programmer/", {
        nombre: nombreRef.current.value,
        observacion: observacionRef.current.value,
        fechaClave: formatera(startDate),
        fechaStart: formatera(startDate),
        fechaEnd: formatera(starOut),
        timeIn: new Date(startHour).getTime(),
        timeOut: new Date(endHour).getTime(),
        color: colorRef.current.value,

      })

      toast.success("Evento creado correctamente");
      getProgrammers();
      nombreRef.current.value="";
      observacionRef.current.value="";
      setColor("#000000");
      idProgrammer="";
    }
    
    
  }


  const traerInfo = (idEvent,nombre,observacion,fechaClave,fechaStart,fechaEnd,timeIn,timeOut,color) =>{
    nombreRef.current.value=nombre;
    observacionRef.current.value=observacion;
    setStartDate(new Date(fechaClave));
    setStarOut(new Date(fechaEnd));
    setStartHour(new Date(timeIn));
    setEndHour(new Date(timeOut));
    setColor(color);
    idProgrammer=idEvent;
  }


  const editProgrammer = async ()=>{

    if(idProgrammer=="")
    {
      toast.error("Para poder editar un evento, primero selecciónelo del listado dando clic.");
    }
    else{
      await axios.put("http://localhost:3000/api/programmer/"+idProgrammer, {
        nombre: nombreRef.current.value,
        observacion: observacionRef.current.value,
        fechaClave: new Date(startDate),
        fechaStart:new Date(startDate),
        fechaEnd: new Date(starOut),
        timeIn: new Date(startHour).getTime(),
        timeOut: new Date(endHour).getTime(),
        color: colorRef.current.value,

      })

      getProgrammers();
      toast.success("Evento Actualizado");
    }
    
  }



  const dellProgrammer = async ()=>{
    

    if(idProgrammer=="")
    {
      toast.error("Para poder eliminar un evento, primero selecciónelo del listado dando clic.");
    }
    else{
      await axios.delete("http://localhost:3000/api/programmer/"+idProgrammer, {
      })

      getProgrammers();
      idProgrammer="";
      toast.success("Evento Eliminado del sistema");
    }
    
  }

 

  /* *********************************************************************************************************************** */
     /* EFECTOS
   /* *********************************************************************************************************************** */
  

   useEffect(() => {
    getProgrammers();
  }, [startDate]);



  return (
    <div className='nuevoc'>
      <Toaster />
       <div className="contentCalendar">
       <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            inline
            showWeekNumbers
            showMonthDropdown
            startDate={startDate}
            ref={fechaInicialRef}
          />

          <div className="events">
            <p className='events-Title'>Eventos del dia</p>
            <ul className='events-ul'>
              {
                data1?.map((programmers)=>(
                  <li className='itemLI' key={programmers._id} onClick={()=> traerInfo(programmers._id,programmers.Nombre,programmers.Observacion,programmers.Fecha_clave,programmers.Fecha_start,programmers.Fecha_end,programmers.Time_in,programmers.Time_out,programmers.Color)}>{programmers.Nombre}</li>
                ))
              }
              
             
            </ul>
            
          </div>

           
       </div>

       <div className="event-description">
      
        <p className='event-description-p'>Valores del evento</p>

        <p className='event-description-label'>Nombre del evento</p>
        <input type="text" placeholder='Nombre del evento' className='event-input' ref={nombreRef}/>

        <p className='event-description-label'>Observaciones Globales "Opcional"</p>
        <textarea name="desc"  cols="30" rows="10" className='event-input-desc' ref={observacionRef}></textarea>

        <p className='event-description-label'>Caducidad del evento</p>

        <div className="auxContent">
        <div className="contentControls2"> Start
                <img src={calendar} alt="In"className='imgCalendar'/>
                <DatePicker
                  className='inputIn'
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        showYearDropdown
                        dateFormatCalendar="MMMM"
                        yearDropdownItemNumber={50}
                        scrollableYearDropdown
                        ref={starInRef}
                  />

                End
                <img src={calendar} alt="Out"className='imgCalendar'/>
                <DatePicker
                  className='inputIn'
                        selected={starOut}
                        onChange={(date) => setStarOut(date)}
                        showYearDropdown
                        dateFormatCalendar="MMMM"
                        yearDropdownItemNumber={50}
                        scrollableYearDropdown
                        ref={starOutRef}
                  />
          </div>


          <div className="contentControls3"> In
                <img src={clock} alt="In"className='imgCalendar'/>
                <DatePicker
                    className='inputIn'
                            selected={startHour}
                            onChange={(date) => setStartHour(date)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            timeCaption="In"
                            dateFormat="HH:mm aa"
                            ref={startRef}
                          />

                <span className='contenControsl3-span'>Out</span>
                <img src={clock} alt="Out"className='imgCalendar'/>
                <DatePicker
                    className='inputIn'
                            selected={endHour}
                            onChange={(date) => setEndHour(date)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            timeCaption="Out"
                            dateFormat="HH:mm aa"
                            ref={endRef}
                          />
          </div>

             
        </div>

        <p className='event-description-label-2'>Color</p>
        <input type="color" value={color} onChange={() => setColor(colorRef.current.value)} ref={colorRef}/>
        

       </div>

       <div className="content-btns">
                <div className="containerSingle">
                  <img src={Plus} alt="pencil" className='img-butons' onClick={crearProgrammer} />
                </div>
                <div className="containerSingle">
                 <img src={Edit} alt="plus" className='img-butons' onClick={editProgrammer}/>
                </div>
                <div className="containerDelete">
                 <img src={Delete} alt="trash" className='img-butons' onClick={dellProgrammer} />
                </div>
            </div>
      
    </div>
  )
}
