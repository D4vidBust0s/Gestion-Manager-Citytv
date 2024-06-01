/*  ESTILOS*/
import './RulesContent.css'

/* IMAGENES */
import Calendar from '../../../../assets/bxs-calendar.svg'
import Sun from '../../../../assets/bx-sun.svg'
import Moon from '../../../../assets/bx-moon.svg'
import Cake from '../../../../assets/bx-cake.svg'
import Save from '../../../../assets/bxs-save.svg'
import Period from '../../../../assets/period.svg'

/* DEPENDENCIAS */
import {useState,useRef, useEffect} from 'react';
import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";


/* COMPONENTS */
import ModalBase1 from '../../../Modals/ModalBases/ModalBase1'
import ModalFestivos from '../../../Modals/ModalDiasFestivos'

export default function RulesContent() {

  const [modal1, setModal1] = useState(false); 

  //Estados
  const [DiaInicio, setDiaInicio] = useState();
  const [startDateDiurno, setStartDateDiurno] = useState(new Date());
  const [endDateDiurno, setEndDateDiurno] = useState(new Date());
  const [startDateNocturno, setStartDateNocturno] = useState(new Date());
  const [endDateNocturno, setEndDateNocturno] = useState(new Date());
  const [data, setData] = useState([]);
  const [validador,setValidador] = useState(0);
  const [ID,setId]= useState();
  
  const [dias, setDias]= useState();
  const [startDate, setStartDate] = useState(new Date());
 
  /* Referencias */
  const diaRef = useRef();
  const inDiurnoRef = useRef();
  const endDiurnoRef = useRef();
  const inNocturnoRef = useRef();
  const endNocturnoRef = useRef();
  const periodRef = useRef();
  const diasRef = useRef();


  //FUNCIONES

  //Actualizar grupo
  const updateGrupo = async () => {
    
    await axios.put("http://localhost:3000/api/rules/" + ID, {
      InDiaDeLaSemana: DiaInicio,
      InLaboralDiurna: startDateDiurno,
      EndLaboralDiurna: endDateDiurno,
      InLaboralNocturna: startDateNocturno,
      EndLaboralNocturna: endDateNocturno,
      DiaPeriod: startDate,
      Dia:dias

    });

    obtenerListadoRules();

    toast.success("Información Actualizada");
  }

  //Agregar registro
  const saveRules = async () =>{
    
    /*Validaciones */
    if(diaRef.current.value=="")
    {
      toast.error("El campo Dia de la semana de inicio, no debe estar vacio");
    }

    else if(inDiurnoRef.current.value=="")
    {
      toast.error("El campo hora de inicio de la hora laborar diurna, no debe estar vacio");
    }

    else if(endDiurnoRef.current.value=="")
    {
      toast.error("El campo hora final de la hora laborar diurna, no debe estar vacio");
    }

    else if (inNocturnoRef.current.value=="")
    {
      toast.error("El campo hora inicio de la hora laborar nocturna, no debe estar vacio");
    }

    else if (endNocturnoRef.current.value=="")
    {
      toast.error("El campo hora final de la hora laborar nocturna, no debe estar vacio");
    }

    else if(periodRef.current.value=="")
    {
      toast.error("El campo que especifica el dia de inicio del periodo, no debe estar vacio");
    }

    else{
      if(validador == 0)
      {
        await axios.post("http://localhost:3000/api/rules/", {
        inDiaDeLaSemana: DiaInicio,
        inLaboralDiurna: startDateDiurno,
        endLaboralDiurna: endDateDiurno,
        inLaboralNocturna: startDateNocturno,
        endLaboralNocturna: endDateNocturno,
        diaPeriod: startDate,
        dia: dias,
      });

      setValidador(1);
      toast.success("Datos agregados correctamente");
      }

      else if(validador == 1)
      {
        updateGrupo();
      }
      
    }
  }

  const setDia = () =>{
    setDiaInicio(diaRef.current.value);
  }

  const setDays= () =>{
    setDias(diasRef.current.value);
  }

  

  
  //Funcion que obtiene la data de la api - listado de de rules
  const obtenerListadoRules = async () => {
    return await axios
      .get("http://localhost:3000/api/rules")
      .then((response) => setData(response.data));

  };


  //Funcion para validar si hay registro
  const hayRegistro = ()=>{
   if(data.length > 0)
   {
    setValidador(1);
   }
  }

  

  //-------------------------------------------------------------------------------------
  //HOOCKS

  useEffect(()=>{
    setDia();
  });
  
  useEffect(()=>{
    obtenerListadoRules();
  },[]);

  useEffect(()=>{
    data?.map((rule) => {
      setDiaInicio(rule.InDiaDeLaSemana);
      setId(rule._id);
      setStartDateDiurno(Date.parse(rule.InLaboralDiurna));
      setEndDateDiurno(Date.parse(rule.EndLaboralDiurna));
      setStartDateNocturno(Date.parse(rule.InLaboralNocturna));
      setEndDateNocturno(Date.parse(rule.EndLaboralNocturna));
      setStartDate(Date.parse (rule.DiaPeriod));
      setDias(rule.Dia);
      diasRef.current.value=rule.Dia;
    });
  },[data]);

  useEffect(()=>{
    hayRegistro();
  });

  return (

    <>
    <div><Toaster /></div>
      {createPortal(<ModalBase1 estado={modal1} cambiarEstado={setModal1} title="Dias festivos del año"  content={<ModalFestivos/>}/>,document.querySelector('#portal'))}

     <div className="mainContentRules">
      <div className="filaContentRules">
        <div className="fila_img">
          <img src={Calendar} alt="Calendar" />
        </div>
        <div className="texto">La semana empieza el dia</div>
        <div className="controls">
          <select name="turnoSeleccionado" className="selectedBox" ref={diaRef} onChange={setDia}>
            <option value={DiaInicio} className="selecteItem">
              {DiaInicio}
            </option>
            <option value={"Lunes"} className="selecteItem">
              {"Lunes"}
            </option>
            <option value={"Martes"} className="selecteItem">
              {"Martes"}
            </option>
            <option value={"Miercoles"} className="selecteItem">
              {"Miercoles"}
            </option>
            <option value={"Jueves"} className="selecteItem">
              {"Jueves"}
            </option>
            <option value={"Viernes"} className="selecteItem">
              {"Viernes"}
            </option>
            <option value={"Sábado"} className="selecteItem">
              {"Sábado"}
            </option>
            <option value={"Domingo"} className="selecteItem">
              {"Domingo"}
            </option>
          </select>
        </div>
      </div>

      <div className="filaContentRules">
        <div className="fila_img">
          <img src={Sun} alt="Calendar" />
        </div>
        <div className="texto">Jornada Laboral Diurna </div>
        <div className="controls">
          
        <DatePicker
            className ='selectedBox'
              selected={startDateDiurno}
              onChange={(date) => setStartDateDiurno(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={5}
              timeCaption="Inicio"
              dateFormat="HH:mm"
              ref={inDiurnoRef}
            />

        <DatePicker
            className ='selectedBox'
              selected={endDateDiurno}
              onChange={(date) => setEndDateDiurno(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={5}
              timeCaption="Inicio"
              dateFormat="HH:mm"
              ref={endDiurnoRef}
            />
  
          
        </div>
      </div>

      <div className="filaContentRules">
        <div className="fila_img">
          <img src={Moon} alt="Calendar" />
        </div>
        <div className="texto">Jornada Laboral Nocturna</div>
        <div className="controls">

          
        <DatePicker
            className ='selectedBox'
              selected={startDateNocturno}
              onChange={(date) => setStartDateNocturno(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={5}
              timeCaption="Inicio"
              dateFormat="HH:mm"
              ref={inNocturnoRef}
            />

        <DatePicker
            className ='selectedBox'
              selected={endDateNocturno}
              onChange={(date) => setEndDateNocturno(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={5}
              timeCaption="Inicio"
              dateFormat="HH:mm"
              ref={endNocturnoRef}
            />

        </div>
      </div>

     
      <div className="filaContentRules">
        <div className="fila_img">
          <img src={Cake} alt="Calendar" />
        </div>
        <div className="texto">Dias festivos del año</div>
        <div className="controls">
         <button className='selectedBTN' onClick={() => setModal1(!modal1)}>ADMINISTRAR</button>
        </div>
      </div>

     
      <div className="filaContentRules">
        <div className="fila_img">
          <img src={Period} alt="Calendar" />
        </div>
        <div className="texto">Periodo de evaluación</div>
        <div className="controls">
          <input type="text" className='inputRules' placeholder='dias' ref={diasRef} onChange={setDays}/>
          <DatePicker
            className='day'
            ref={periodRef}
            showIcon
            selected={startDate}
            onChange={(date) => setStartDate(date) }
         />
        </div>
      </div>

    </div>

    

    {/* ACTIONS */}
    <div className="contentActions">
      ACTIONS
      <div className="contentImg">
        <img src={Save} alt="Save" className='contentIMG__save' onClick={saveRules}/>
      </div>
    </div>
    </>
   
  );
}
