/* eslint-disable react/prop-types */

import  './ModalPlanner1.css'

/* Import recursos */
import Anita from '../../assets/Anita.jpg'
import Calendar from '../../assets/calendar.webp'
import Clock from '../../assets/bx-time-five.svg'
import Pencil from '../../assets/pencil.svg'
import Plus from '../../assets/user-plus.svg'
import Trash from '../../assets/trash.svg'

import Balanza from '../../assets/balanza.png'
import Regalo from '../../assets/regalo.svg'
import Calendario from '../../assets/calendario.png'

/* Import dependencies */
import { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import {Toaster, toast} from 'react-hot-toast';

/* VARIABLES */
let fullPermisions = 0;


function ModalPlanner1({estado,cambiarEstado,nombres,cargo,fechaPlaner,iduser,subGrupo,color}) {

  //Estados
  const [, setDate] = useState()
  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);

  const [startHour, setStartHour] = useState(new Date());
  const [EndHour, setEndHour] = useState(new Date());
  const [IDUSER, setIDUSER] = useState();
  const [FECHA, setFECHA] = useState();

  /* Estados para el datepicker */
  const [calendar, setCalendar] = useState(new Date());
  /* Estados para los controles del formulario de acciones */
  const [pgm, setPgm] = useState("---------------------------------");
  const [event, setEvent] = useState("---------------------------------");
  const [custom, setCustom] = useState("");
  const [obs, setObs] = useState("");

  //Referencias
  const pgmRef = useRef();
  const eventRef = useRef();
  const customRef = useRef();
  const startRef = useRef();
  const endRef = useRef();
  const observationRef = useRef();
 
  const pruebaRef = useRef();

  useEffect(() => {
    const fecha =  Date.now();
      const hoy = new Date(fecha);
      setDate(hoy.toDateString());
  },[]);

  useEffect(() => {
   setIDUSER(iduser);
   setFECHA(fechaPlaner);
  },[iduser,fechaPlaner]);

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

 

  //const [OB,setOB]= useState();


  //FUNCIONES
  //Funcion que obtiene la data de la api - listado de programs
  const obtenerListadoPrograms = async () => {
    return await axios
      .get("http://localhost:3000/api/programs")
      .then((response) => setData(response.data));
  };

   //Funcion que obtiene la data de la api - listado de turnos segun id y fecha especifica
   const obtenerListadoTurnos = async () => {
    return await axios
      .get("http://localhost:3000/api/shifts",
      {
        params:{
          id: IDUSER,
          fecha: fechaPlaner,
        }
      })
      .then((response) => setData1(response.data));
  };


   //Funcion que trae los datos o reglas de Rules
   const getRules = async () => {
    return await axios
      .get("http://localhost:3000/api/rules")
      .then((response) => setData2(response.data));
      
  };


  const traerPermisosTrabajador = async ()=>{
    return await axios
    .get("http://localhost:3000/api/permissions/")
    .then((response) => setData3(response.data));
    
  }


  const crear = async (ID_User,NombreUser,SubGrupo,FechaActiva,Start,End,Evento,Color,Tipo,Observacion)=>{

    await axios.post("http://localhost:3000/api/shifts/", {
      idUser: ID_User,
      nombreUser: NombreUser,
      subGrupo: SubGrupo,
      fechaActiva: FechaActiva,
      start: Start,
      end: End,
      evento: Evento,
      color: Color,
      tipo: Tipo,
      observacion: Observacion
    });

    obtenerListadoTurnos();

      //limpiamos los campos
      customRef.current.value="";
      observationRef.current.value="";

     
  }


  const add = ()=>{

    if(pgmRef.current.value!='none')
    {
      //Validacion para solo PGM
      if(eventRef.current.value=='none' && customRef.current.value == '')
      {
        crear(iduser,nombres,subGrupo,fechaPlaner,startHour,EndHour,pgmRef.current.value,color,"PROGRAMA",observationRef.current.value);
        toast.success("Programa agregado a los turnos");
      }
      else{
        toast.error("Si desea agregar un programa, la casilla Requerimiento y Custom no deben especificarse");
      }

    }


    if(eventRef.current.value!='none')
    {
      //Validacion para solo REQUERIMIENTO
      if(pgmRef.current.value=='none' && customRef.current.value == '')
      {
        crear(iduser,nombres,subGrupo,fechaPlaner,startHour,EndHour,eventRef.current.value,color,"REQUERIMIENTO",observationRef.current.value);
        toast.success("Requerimiento agregado a los turnos correctamente");
      }
      else{
        toast.error("Si desea agregar un Requerimiento, la casilla Programa y custom no deben especificarse");
      }
    }

    if(customRef.current.value!='')
    {
      //Validacion para solo CUSTOM
      if(pgmRef.current.value=='none' && eventRef.current.value == 'none')
      {
        crear(iduser,nombres,subGrupo,fechaPlaner,startHour,EndHour,customRef.current.value,color,"CUSTOM",observationRef.current.value);
        toast.success("Evento Custom agregado a los turnos correctamente");
      }
      else{
        toast.error("Si desea agregar un Custom , la casilla Programa y Requerimiento no deben especificarse");
      }
    }


    if(pgmRef.current.value=='none' && eventRef.current.value=='none' && customRef.current.value=='')
    {
        toast.error("Debe especificar una de los tres opciones, Programa - Requerimiento - Custom");
    }

     /* 
       
     
       3) AL HACER CLICK SOBRE EL EVENTO O PROGRAMA TRAER LA HORA DE INICIO Y FINAL
       3.1) AL HACER CLICK SOBRE EL TURNO ACTUALIZAR LA INFORMACION EN ACCIONES
       4) ORGANIZARLOS LOS TURNOS SEGUN LA HORA DE INICIO O START

     */
   
      
  }

  const edit = ()=>{

    toast.success("Turno actualizado");
  }

  const del = ()=>{

    if (confirm("¿Realmente desea eliminar el turno? presione aceptar para eliminarlo") == true) 
    {
      toast.success("Turno eliminado");
    } 
    
  }

  const turnoFree = ()=>{

  }


  const updateAcciones = (tipo,evento,obse,start,end,e)=>{

     //Actualizamos la info en el formulario

     setStartHour(new Date(start).getTime());
     setEndHour(new Date(end).getTime());
     
     observationRef.current.value=obse;

     if(tipo == "PROGRAMA")
     {
      pgmRef.current.value=evento;
     }

     else if(tipo == "REQUERIMIENTO")
     {
      eventRef.current.value = evento;
     }

     else if(tipo == "CUSTOM")
     {
      customRef.current.value = evento;
     }




      //Aqui lo que nhago es cambiar los estilos para el turno seleccionado;

    if (e.target.classList=="liItem") 
    {

      let aux = document.getElementsByClassName("hover");

      for (let index = 0; index < aux.length; index++) 
      {
        aux[index].classList.remove("hover");
      }

      e.target.classList.add("hover");
    }

     
  }

  const extraerHora = (fecha)=>{
    
    let hora = new Date(fecha);
    let horareal;

    if(hora.getMinutes()==0)
    {
      let minutosCorregidos = "00";
      horareal = hora.getHours()+":"+minutosCorregidos;
    }
    else{
      let minutosCorregidos = hora.getMinutes();
      horareal = hora.getHours()+":"+minutosCorregidos;
    }
    
    return horareal;
  }


  const reset1 = () =>{
   customRef.current.value="";
   


   data?.map((pgm)=>(
     pgmRef.current.value == pgm.nombre ? setStartHour(new Date(pgm.Start).getTime()) : null
  ))

  data?.map((pgm)=>(
    pgmRef.current.value == pgm.nombre ? setEndHour(new Date(pgm.End).getTime()) : null
 ))
  }

  const reset2 = () =>{
    customRef.current.value="";
  }

  /*
  const validate = ()=>{
    toast.success("Aqui se valida los turnos por defecto segun programaci'on");
  }

  */

  const validateMonts = (mont)=>{
    if(mont == 0)
    {
        return "Enero";
    }
    else if(mont == 1){
      return "Febrero";
    }

    else if(mont == 2){
      return "Marzo";
    }

    else if(mont == 3){
      return "Abril";
    }

    else if(mont == 4){
      return "Mayo";
    }

    else if(mont == 5){
      return "Junio";
    }

    else if(mont == 6){
      return "Julio";
    }

    else if(mont == 7){
      return "Agosto";
    }

    else if(mont == 8){
      return "Septiembre";
    }

    else if(mont == 9){
      return "Octubre";
    }

    else if(mont == 10){
      return "Noviembre";
    }

    else if(mont == 11){
      return "Diciembre";
    }
  }

  
  const sumaDias = (fecha,dias)=>{
    return new Date(new Date(fecha).setDate( new Date (fecha).getDate()+parseInt(dias))).getDate();
  }

  const sumaMes = (fecha,dias)=>{
    return new Date(new Date(fecha).setDate( new Date (fecha).getDate()+parseInt(dias))).getMonth();
  }

  const sumaAño = (fecha,dias)=>{
    return new Date(new Date(fecha).setDate( new Date (fecha).getDate()+parseInt(dias))).getFullYear();
  }

 
  const fullPermissionsUser = (idUser)=>{
    fullPermisions=0;

    data3?.map((item)=>(
     //item.Id_Empleado==idUser?fullPermisions++:null
     //item.Id_Empleado==idUser&&item.FechaInicio?fullPermisions++:null
     //console.log(new Date(item.FechaInicio).setHours(0,0,0,0).toString()+"----"+new Date().setHours(0,0,0,0))
     item.Id_Empleado == iduser && new Date(item.FechaInicio).setHours(0,0,0,0)< new Date().setHours(0,0,0,0)?console.log("es menor"):console.log("no es menor")
    ))

    return fullPermisions;
  }







  

  useEffect(() => {
    obtenerListadoPrograms();
  }, []);

  useEffect(()=> {
    obtenerListadoTurnos();
    setPgm("---------------------------------");
    setEvent("---------------------------------");
    setCustom("");
    setObs("");
  }, [IDUSER, FECHA]);

  useEffect(() => {
    getRules();
  }, []);

  
 useEffect(()=>{
  traerPermisosTrabajador();
 },[])



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
              <div className="actividad_title">
                Time Out
              </div>
              <div className="actividad_container">
              <div className="actividad_lista">
                  <ul>
                    <li className='liLista'>Permissions<span className='indicador'>
                      {
                       fullPermissionsUser(iduser)
                      }
                    </span><progress 
                      value={fullPermissionsUser(iduser)} 
                      max={20} 
                      className='progress'/>
                    </li>





                    <li className='liLista'>Breaks<span className='indicador'>0</span><progress value={0} max={10} className='progress'/></li>
                    <li className='liLista'>Incapacitys<span className='indicador'>0</span><progress value={0} max={100} className='progress'/></li>
                    <li className='liLista'>Recess<span className='indicador'>0</span><progress value={0} max={100} className='progress'/></li>
                    <li className='liLista'>Licenses<span className='indicador'>0</span><progress value={0} max={100} className='progress'/></li> 
                  </ul>
                </div>
              </div>

              <div className="periodo">
                <h5 className='periodo'>
                {data2?.map((item)=>(
              new Date (item.DiaPeriod).getDate() + " de " + validateMonts(new Date (item.DiaPeriod).getMonth()) + " de " + new Date (item.DiaPeriod).getFullYear() + " ---- " + sumaDias(item.DiaPeriod,item.Dia) + " de " + validateMonts(sumaMes(item.DiaPeriod,item.Dia)) + " de " + sumaAño(item.DiaPeriod,item.Dia)
          ))}
                </h5>
              </div>
            </div>

          <div className="cuerpoModal">
          <div className="close2" onClick={() => cambiarEstado(!estado)}>X</div>

          {/*SECCION # 1*/}
            <div className="list-turnos">
              <div className="titulo">
                <h2>INFORMACION</h2>
              </div>

             

              <div className="info1">
                <h6 className='titleBalancer'>Balancer</h6>
                <img src={Balanza} alt="balanza" className='balanza' />
                <div className="lista">
                  <ul>
                    <li className='liLista'>Feernando castillo <span className='indicador'>75</span><progress value={75} max={100} className='progress'/></li>
                    <li className='liLista'>David Bustos <span className='indicador'>15</span><progress value={15} max={100} className='progress'/></li>
                    <li className='liLista'>Erick Sierra <span className='indicador'>55</span><progress value={55} max={100} className='progress'/></li>
                    <li className='liLista'>Antoni Muñoz <span className='indicador'>30</span><progress value={30} max={100} className='progress'/></li> 
                    <li className='liLista'>Mateo Jimenez <span className='indicador'>0</span><progress value={null} max={100} className='progress'/></li>
                  </ul>
                </div>
              </div>

              <div className="info2">
                  <h6 className='titleBalancer'>Turnos según rotación</h6>
                  <img src={Calendario} alt="balanza" className='balanza' />
                  <div className="lista">
                  <ul>
                    <li className='liLista'>Feernando castillo <span className='indicador2'>Mañana</span></li>
                    <li className='liLista'>David Bustos <span className='indicador2'>Tarde</span></li>
                    <li className='liLista'>Erick Sierra <span className='indicador2'>Standby</span></li>
                    <li className='liLista'>Antoni Muñoz <span className='indicador2'>Transversal</span></li> 
                    <li className='liLista'>Mateo Jimenez <span className='indicador2'>standby</span></li>
                  </ul>
                </div>
              </div>

             
              
            </div>

           
            
            
            {/*SECCION # 2 */}
            <div className="acciones">
              <div className="titulo">
                <h2>ACCIONES</h2>
              </div>
              <div className="mainContainer">
                <h3 className="subTitulo">PROGRAMA - REQUERIMIENTO</h3>
                <h5 className='tipo'>Programa</h5>
                <select name="turnoSeleccionado" className='selectedBox' ref={pgmRef} onChange={reset1}>
                <option key="none" value="none" className='selecteItem' >{pgm}</option>
                  {
                    data?.map((pgm)=>(
                      <option key={pgm._id} value={pgm.nombre} className='selecteItem' ref={pgmRef}>{pgm.nombre}</option>
                    ))
                  }
                  
                </select>

                <h5 className='tipo'>Requerimiento</h5>
                <select name="turnoSeleccionado" className='selectedBox' ref={eventRef} id='pgm' onChange={reset2}>
                <option key="none" value="none" className='selecteItem'>{event}</option>
                  {
                    data?.map((pgm)=>(
                      <option key={pgm._id} value={pgm.nombre} className='selecteItem' ref={eventRef}>{pgm.nombre}</option>
                    ))
                  }
                  
                </select>

                <h5 className='tipo'>Custom</h5>
                <input type='text' className='selectedBox2' ref={customRef} id='custom' placeholder='---------------------------------' defaultValue={custom}/>
                
                
                

                <h3 className="subTitulo">HORARIO</h3>
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
                            ref={startRef}
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
                            ref={endRef}
                          />
                  </div>
                </div>


                <h3 className="subTitulo">OBSERVACIONES</h3>
                <textarea name="observaciones"  className='observaciones' ref={observationRef} defaultValue={obs}></textarea>
              </div>

              <div className="seccionButons">
                <div className="containerSingleButtom">
                  <img src={Pencil} alt="pencil" className='img-butons' onClick={edit}/>
                </div>
                <div className="containerSingleButtom">
                 <img src={Plus} alt="plus" className='img-butons' onClick={add}/>
                </div>
                <div className="containerSingleButtom">
                 <img src={Regalo} alt="plus" className='img-butons' onClick={turnoFree}/>
                </div>
                <div className="containerSingleButtomDel">
                 <img src={Trash} alt="trash" className='img-butons' onClick={del}/>
                </div>
              </div>
              {
                /*
                <div className='validar'>
                 <img src={Arrow} alt="trash" className='imgBtnValidate' onClick={validate}/>
                </div>
                */
              }
              
            </div>

            <div className="list-turnos">
              <div className="titulo">
                <h2>TURNOS PROGRAMADOS</h2>
              </div>
    
              <ul className="ulLista">

                { 
                  data1?.map((shift)=>(
                   
                    <li className="liItem" onClick={(e)=>updateAcciones(shift.Tipo,shift.Evento,shift.Observacion,shift.Start,shift.End,e)}  key={shift._id} ref={pruebaRef}>
                      <span className="hInicio">{extraerHora(shift.Start)}</span>
                        {shift.Evento}
                      <span className="hFinal">{extraerHora(shift.End)}</span>
                    </li>
                  ))
                }

              </ul>
            </div>

          </div>

          <div className='aux1'>
           <div className="aux1_title">
            Time Remating
           </div>
           <div className="aux1_label">
            120.5
           </div>
          </div>

          <div className="barraButom">
           <div className="inspectorContainer">

           <ul>
                    <li className='liInspector2'>
                      <span className='nameUS'></span>
                      <div className="cajaNumero">
                        <div className="cuadro201">S</div>
                        <div className="cuadro201">D</div>
                        <div className="cuadro201">L</div>
                        <div className="cuadro201">M</div>
                        <div className="cuadro201">M</div>
                        <div className="cuadro201">J</div>
                        <div className="cuadro201">V</div>
                        <div className="cuadro201">S</div>
                        <div className="cuadro201">D</div>
                        <div className="cuadro201">L</div>
                        <div className="cuadro201">M</div>
                        <div className="cuadro201">M</div>
                        <div className="cuadro201">J</div>
                        <div className="cuadro201">V</div>
                        <div className="cuadro201">S</div>
                        <div className="cuadro201">D</div>
                        <div className="cuadro201">L</div>
                        <div className="cuadro201">M</div>
                        <div className="cuadro201">M</div>
                        <div className="cuadro201">J</div>
                        <div className="cuadro201">V</div>
                      </div>
                    </li>
                  </ul>

                  <ul className='Separador'>
                    <li className='liInspector'>
                      <span className='nameUS'>Fernando castillo</span>
                      <div className="cajaNumero">
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                      </div>
                    </li>
                  </ul>

                  <ul>
                    <li className='liInspector'>
                      <span className='nameUS'>David Bustos</span>
                      <div className="cajaNumero">
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                      </div>
                    </li>
                  </ul>

                  <ul>
                    <li className='liInspector'>
                      <span className='nameUS'>Erik Sierra</span>
                      <div className="cajaNumero">
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                      </div>
                    </li>
                  </ul>

                  <ul>
                    <li className='liInspector'>
                      <span className='nameUS'>Antony Muñoz</span>
                      <div className="cajaNumero">
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                      </div>
                    </li>
                  </ul>

                  <ul>
                    <li className='liInspector'>
                      <span className='nameUS'>Mateo Jimenez</span>
                      <div className="cajaNumero">
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                      </div>
                    </li>
                  </ul>

                  <ul>
                    <li className='liInspector'>
                      <span className='nameUS'>David Bustos</span>
                      <div className="cajaNumero">
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                        <div className="cuadro20">10</div>
                      </div>
                    </li>
                  </ul>

                 
                
           </div>
          </div>

          <div className='aux2'>
          <div className="aux1_title">
            Full Time
           </div>
           <div className="aux1_label">
            07:30
           </div>
          </div>
        </div>
        
        

      )}
      
    </>
  );
}

export default ModalPlanner1
