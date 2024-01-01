/* ESTILOS */
import './ProgramsContent.css'

/* DEPENDENCIAS */
import DatePicker from 'react-datepicker';
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import Swal from "sweetalert2";

/* IMAGENES */
import Clock from '../../assets/bx-time-five.svg'
import Plus from '../../assets/Plus.svg'
import Edit from '../../assets/pencil.svg'
import Delete from '../../assets/trash.svg'

 

//---------------------------------------------------------------------------------------------------




export default function ProgramsContent() {

  /* Estados para los datepicker */
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  //Estados para los programs
  const [data, setData] = useState([]);

  /* Estados para los dias de la semana */
  const [checkLunes, setCheckLunes] = useState(false);
  const [checkMartes, setCheckMartes] = useState(false);
  const [checkMiercoles, setCheckMiercoles] = useState(false);
  const [checkJueves, setCheckJueves] = useState(false);
  const [checkLViernes, setCheckViernes] = useState(false);
  const [checkSabado, setCheckSabado] = useState(false);
  const [checkDomingo, setCheckDomingo] = useState(false);

   //Estados para los controles HTML
   const [nameProgram, setNameProgram] = useState("Default");
   const [description, setDescription] = useState("Description default Program");
   const [ID, setId] = useState(null);
  

  //Referencias
  const refName = useRef();
  const refLunes = useRef();
  const refMartes = useRef();
  const refMiercoles = useRef();
  const refJueves = useRef();
  const refViernes = useRef();
  const refSabado = useRef();
  const refDomingo = useRef();
  const refStart = useRef();
  const refEnd = useRef();
  const refDescripcion = useRef();

  //FUNCIONES
  //Funcion que obtiene la data de la api - listado de programs
  const obtenerListadoPrograms = async () => {
    return await axios
      .get("http://localhost:3000/api/programs")
      .then((response) => setData(response.data));
  };

  //Cambiamos estado para los check segun corresponda
  const handleOnChangeLunes = () => {
    setCheckLunes(!checkLunes);
  };

  const handleOnChangeMartes = () => {
    setCheckMartes(!checkMartes);
  };

  const handleOnChangeMiercoles = () => {
    setCheckMiercoles(!checkMiercoles);
  };

  const handleOnChangeJueves = () => {
    setCheckJueves(!checkJueves);
  };

  const handleOnChangeViernes = () => {
    setCheckViernes(!checkLViernes);
  };

  const handleOnChangeSabado = () => {
    setCheckSabado(!checkSabado);
  };

  const handleOnChangeDomingo = () => {
    setCheckDomingo(!checkDomingo);
  };

  useEffect(() => {
    obtenerListadoPrograms();
  }, []);


  //Habilitamos la escritura de los controles HTML
  const cambiarNombre = (e) => {
    setNameProgram(e.target.value);
  };

  const cambiarDescription = (e) => {
    setDescription(e.target.value);
  };


  //Funcion para traer y actualizar la informacion al dar click sobre el grupo
  const grupoClick = async (id) => {
    await axios
      .get("http://localhost:3000/api/programs/" + id)
      .then(
        (response) =>
          setNameProgram(response.data.nombre) +
          setDescription(response.data.descripcion) +
          setCheckLunes(response.data.lunes) +
          setCheckMartes(response.data.Martes) +
          setCheckMiercoles(response.data.Miercoles) +
          setCheckJueves(response.data.Jueves) +
          setCheckViernes(response.data.Viernes) +
          setCheckSabado(response.data.Sabado) +
          setCheckDomingo(response.data.Domingo) +
          
          setStartDate(new Date(response.data.Start)) +
          setEndDate(new Date(response.data.End)) +

          setDescription(response.data.descripcion)
      );
    setId(id);
    console.log("start:"+startDate);
    console.log("end:"+endDate);
  };


  //-------------------------------------------------------------------------------------------------------

  //Agregar Program
  const agregarProgram = async () => {
    if (refName.current.value == "") {
      toast.error("El campo Programa o evento no puede estar vacio");
    } else if (refStart.current.value == "") {
      toast.error("El campo Start no esta definido");
    } else if (refEnd.current.value == "") {
      toast.error("El campo End no esta definido");
    } else if (refDescripcion.current.value == "") {
      toast.error("El campo Descripción no debe estar vacio");
      
    } else {
      await axios.post("http://localhost:3000/api/programs/", {
        nombre: nameProgram,
        lunes: checkLunes,
        martes: checkMartes,
        miercoles: checkMiercoles,
        jueves: checkJueves,
        viernes: checkLViernes,
        sabado: checkSabado,
        domingo: checkDomingo,
        descripcion: description,
        start: startDate,
        end: endDate
      });

      obtenerListadoPrograms();

      toast.success("Programa agregado");
      setNameProgram("");
      setDescription("");

      setStartDate(new Date());
      setEndDate(new Date());

      setCheckLunes(false);
      setCheckMartes(false);
      setCheckMiercoles(false);
      setCheckJueves(false);
      setCheckViernes(false);
      setCheckSabado(false);
      setCheckDomingo(false);
    }
  };

  //Eliminar program
  const eliminarProgram = async () => {
    if (refName.current.value == "" || ID == null) {
      toast.error("No ha seleccionado ningun programa para eliminar");
    } 
    else {
      Swal.fire({
        title: "¿Realmente desea eliminar el Programa?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "No",
        denyButtonText: `Confirmar`,
        footer: '<h6>Gestión Manager Citytv</h6>',
        
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          //Swal.fire("Saved!", "", "success");
        } else if (result.isDenied) 
        {
          EliminarProg();
          //Swal.fire("Registro eliminado del sistema", "", "success");
        }
      });
    }
  };

  const EliminarProg = async ()=>{
    await axios.delete("http://localhost:3000/api/programs/" + ID);

        obtenerListadoPrograms();

        toast.error("Programa eliminado");
        setNameProgram("");
        setDescription("");

        setStartDate(new Date());
        setEndDate(new Date());

        setCheckLunes(false);
        setCheckMartes(false);
        setCheckMiercoles(false);
        setCheckJueves(false);
        setCheckViernes(false);
        setCheckSabado(false);
        setCheckDomingo(false);
  }

   //Actualizar program
   const updateProgram = async () => {
    console.log(refStart.current.input.value);
    
    
    if (refName.current.value == "") {
      toast.error("El campo nombre del programa o evento no puede estar vacio");
    } else if (refStart.current.input.value == "") {
      toast.error("El campo hora inicio no esta definido");
    } else if (refEnd.current.input.value == "") {
      toast.error("El campo hora final no esta definido");
    } else if (refDescripcion.current.value == "") {
      toast.error("Debe especificar una descripción");
    }
    else {
      await axios.put("http://localhost:3000/api/programs/" + ID, {
        nombre: nameProgram,
        lunes: checkLunes,
        Martes: checkMartes,
        Miercoles: checkMiercoles,
        Jueves: checkJueves,
        Viernes: checkLViernes,
        Sabado: checkSabado,
        Domingo: checkDomingo,
        descripcion: description,
        Start: startDate,
        End: endDate,
      });

      obtenerListadoPrograms();

      toast.success("Programa actualizado");
      setNameProgram("");
      setDescription("");

      setStartDate(new Date());
      setEndDate(new Date());

      setCheckLunes(false);
      setCheckMartes(false);
      setCheckMiercoles(false);
      setCheckJueves(false);
      setCheckViernes(false);
      setCheckSabado(false);
      setCheckDomingo(false);
      
    }
  };
  

  return (
    <>
    <div><Toaster /></div>
      <div className="contenPGM">
        <div className="sectionAdd">
          <h3 className="subTitulo">Programa o evento fijo</h3>
          <input type="text" ref={refName} className="inputName" value={nameProgram} onChange={cambiarNombre}/>

          <h3 className="subTitulo">Horario</h3>

          <div className="horarios">
            <ul className='ulHorarios'>
              <li><input type="checkbox" ref={refLunes} name='lunes' id='1' checked={checkLunes} onChange={handleOnChangeLunes}/> Lunes</li>
              <li><input type="checkbox" ref={refMartes} name='Martes' id='2' checked={checkMartes} onChange={handleOnChangeMartes}/> Martes</li>
              <li><input type="checkbox" ref={refMiercoles} name='Miercoles' id='3' checked={checkMiercoles} onChange={handleOnChangeMiercoles}/> Miércoles</li>
              <li><input type="checkbox" ref={refJueves} name='Jueves' id='4' checked={checkJueves} onChange={handleOnChangeJueves}/> Jueves</li>
              <li><input type="checkbox" ref={refViernes} name='Viernes' id='5' checked={checkLViernes} onChange={handleOnChangeViernes}/> Viernes</li>
              <li><input type="checkbox" ref={refSabado} name='Sabado' id='6' checked={checkSabado} onChange={handleOnChangeSabado}/> Sábado</li>
              <li><input type="checkbox" ref={refDomingo} name='Domingo' id='7' checked={checkDomingo} onChange={handleOnChangeDomingo}/> Domingo</li>
             
            </ul>
          </div>
          <div className="contentSectionTime">
            <img src={Clock} alt="Clock Start" className="imgTime" />
            <DatePicker
            className ='inputHour'
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={5}
              timeCaption="Inicio"
              dateFormat="HH:mm"
              ref={refStart}
            />

            <img src={Clock} alt="Clock End" className="imgTime" />
            <DatePicker
            className ='inputHour'
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={5}
              timeCaption="Final"
              dateFormat="HH:mm"
              ref={refEnd}
            />
          </div>

          <h3 className="subTitulo">Descripción del programa o evento</h3>
          <textarea className='area' ref={refDescripcion} value={description} onChange={cambiarDescription}></textarea>

          <div className="seccionButons">
                <div className="containerSingleButtom">
                  <img src={Plus} alt="pencil" className='img-butons' onClick={agregarProgram}/>
                </div>
                <div className="containerSingleButtom">
                 <img src={Edit} alt="plus" className='img-butons' onClick={updateProgram}/>
                </div>
                <div className="containerSingleButtomDelete">
                 <img src={Delete} alt="trash" className='img-butons' onClick={eliminarProgram}/>
                </div>
              </div>
        </div>

        
        <div className="sectionList">
          <ul className='ListUL'>
          {data?.map((prog) => (
             <li key={prog._id} className='ListLI' onClick={() => grupoClick(prog._id)}>{prog.nombre}</li>
            ))
          }
          </ul>
        </div>
      </div>
    </>
  );
}
