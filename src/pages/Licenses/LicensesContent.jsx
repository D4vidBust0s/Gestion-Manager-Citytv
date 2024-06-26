/* ESTILOS */
import '../Permissions/PermissionsContent.css';

/* DEPENDENCIAS */
import DatePicker from 'react-datepicker';
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import Swal from "sweetalert2";

/* IMAGENES */
import Avatar from '../../assets/avatar.webp';
import calendar from '../../assets/Calendar-withe.svg';
import Plus from '../../assets/Plus.svg';
import Edit from '../../assets/pencil.svg';
import Delete from '../../assets/trash.svg';
import Brush from '../../assets/brush.svg';

/* VARIABLES */
let idUsuario;
let auxAño;
let idRegistro;

//---------------------------------------------------------------------------------------------------

export default function PermissionsContent() {

/* ESTADOS */
const [data, setData] = useState([]);
const [data1, setData1] = useState([]);
const [data2, setData2] = useState([]);
const [startDate, setStartDate] = useState(new Date());
const [starIn, setStarIn] = useState(new Date());
const [starOut, setStarOut] = useState(new Date());
const [nameUser, setNameUser] = useState("-----------------------");
const [avatarUser, /*setAvatarUser*/] = useState(Avatar);
const [idUser, setIdUser] = useState();

/* REFERENCIAS */
const starInRef = useRef();
const starOutRef = useRef();
const namePermissionRef = useRef();
const fechaInicialRef = useRef();
const fechaFinalRef = useRef();
const observacionesRef = useRef();
const groupsRef = useRef();

//FUNCIONES
const groupChange = () =>
  {
    
    getPeopleOfGroup();
    setNameUser("-----------------------");
    limpiar();
    
  }

//Funcion que obtiene la data de la api - listado de grupos
const obtenerListadoGroups = async () => {
    return await axios
      .get("http://localhost:3000/api/groups")
      .then((response) => setData(response.data));
  };

  const getPeopleOfGroup = async ()=>{
    return await axios
    .get("http://localhost:3000/api/payroll/people/"+groupsRef.current.value)
    .then((response) => setData1(response.data));
  }

  const traerPermisosTrabajador = async ()=>{
    return await axios
    .get("http://localhost:3000/api/licenses/"+idUsuario,
    {
      params:{
        año: auxAño?.getFullYear(),
      }
    })
    .then((response) => setData2(response.data));
    
  }

  const clickUser = (id, nombre, apellido)=>{
    idUsuario = id;
    auxAño=startDate;
    setNameUser(nombre +" "+ apellido);
    setIdUser(id);
    traerPermisosTrabajador();

    //Dejamos limpios los campos del formulario
    namePermissionRef.current.value="";
    setStarIn(new Date());
    setStarOut(new Date());
    setStartDate(new Date());
    observacionesRef.current.value="";
    idRegistro="";
    setData2([]);
    
  }

const limpiar = ()=>{

  //Dejamos limpios los campos del formulario
  namePermissionRef.current.value="";
  namePermissionRef.current.focus();

  setStarIn(new Date());
  setStarOut(new Date());
  setStartDate(new Date());
  observacionesRef.current.value="";
  idRegistro="";
  setData2([]);
}

const agregar = async ()=>{

  //Validaciones
  if(nameUser=="-----------------------")
  {
    toast.error("para registrar una licencia a un trabajador, primero seleccionelo de la lista");
  }
  else if(namePermissionRef.current.value=="")
  {
    namePermissionRef.current.focus();
    toast.error("Debe especificar un nombre que describa el motivo de la licencia");
  }
  else if(fechaInicialRef.current.value=="")
  {
    fechaInicialRef.current.focus();
    toast.error("Debe especificar una fecha de inicio del periodo de licencia");
  }
  else if(fechaFinalRef.current.value=="")
  {
    fechaFinalRef.current.focus();
    toast.error("Debe especificar una fecha de finalización del periodo de licencia");
  }
  else if(observacionesRef.current.value=="")
  {
    observacionesRef.current.focus();
    toast.error("Debe especificar una obserbación o descripción del periodo de licencia");
  }

  else
  {
    await axios.post("http://localhost:3000/api/licenses/", {
      nombre: namePermissionRef.current.value,
      año:starIn.getFullYear().toString(),
      fechainicio: starIn,
      fechafinal: starOut,
      observacion: observacionesRef.current.value,
      estado: true,
      nombreempleado: nameUser,
      idempleado: idUser,
      });

      //limpiamos los campos
      namePermissionRef.current.value="";
      setStarIn(new Date());
      setStarOut(new Date());
      observacionesRef.current.value="";
      traerPermisosTrabajador();

      toast.success("Registro agregado correctamente");
  }

}

const eliminar = ()=>
{
  if(idRegistro)
  {
    Swal.fire({
      title: "¿Realmente desea eliminar el registro de licencia para " + nameUser + "?",
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
        EliminarPermiso();
        //Swal.fire("Registro eliminado del sistema", "", "success");
      }
    });
  }
  else{
    toast.error("No se ha seleccionado ningun registro de licencia para eliminar");
  }
  
}

const EliminarPermiso = async ()=>{
  await axios.delete("http://localhost:3000/api/licenses/" + idRegistro);
      
      traerPermisosTrabajador();
      
      //Dejamos limpios los campos del formulario
      namePermissionRef.current.value="";
      setStarIn(new Date());
      setStarOut(new Date());
      observacionesRef.current.value="";
      idRegistro="";

      toast.success("Registro eliminado  correctamente");
    
}

const llenarFormulario = (nombre,fechaIn,fechaOut,observacion,idReg,/*estado*/)=>{

  namePermissionRef.current.value=nombre;
  setStarIn(new Date(fechaIn));
  setStarOut( new Date(fechaOut));
  observacionesRef.current.value=observacion;

  idRegistro = idReg;
}

const traer2 = ()=>{

  setStarIn(new Date());
  setStarOut(new Date());
  observacionesRef.current.value="";
  traerPermisosTrabajador();

  //Dejamos limpios los campos del formulario
  namePermissionRef.current.value="";
  setStarIn(new Date());
  setStarOut(new Date());
  observacionesRef.current.value="";
  idRegistro="";
  
  
}

const editar = async ()=>{

 //Validaciones
 if(nameUser=="-----------------------")
 {
   toast.error("Para actualizar la información un trabajador, primero seleccionelo de la lista");
 }
 else if(namePermissionRef.current.value=="")
 {
   namePermissionRef.current.focus();
   toast.error("El campo nombre del registro de no puede estar vacio, seleccionelo de la lista de registros");
 }
 else if(fechaInicialRef.current.value=="")
 {
   fechaInicialRef.current.focus();
   toast.error("Debe especificar una fecha de inicio del periodo de licencia");
 }
 else if(fechaFinalRef.current.value=="")
 {
   fechaFinalRef.current.focus();
   toast.error("Debe especificar una fecha de finalización del periodo de licencia");
 }
 else if(observacionesRef.current.value=="")
 {
   observacionesRef.current.focus();
   toast.error("Debe especificar una obserbación o descripción del periodo de licencia");
 }

 else
 {
  
   await axios.put("http://localhost:3000/api/licenses/"+ idRegistro, {
     nombre: namePermissionRef.current.value,
     año:starIn.getFullYear().toString(),
     fechainicio: starIn,
     fechafinal: starOut,
     observacion: observacionesRef.current.value,
     estado: true,
     nombreempleado: nameUser,
     id_empleado: idUser,
     });

     traerPermisosTrabajador();
     toast.success("Registro actualizado correctamente");
 }
}

/* EFECTOS*/
//---------------------------------------------------------------------------------------------------------------------------------------
 useEffect(() => {
    obtenerListadoGroups();
  }, []);

  
 



  return (
    <div className="contentRotations">
      <Toaster />
      <div className="subTitulo">
        Grupos
        <select className="inputDir" onChange={()=> groupChange()} ref={groupsRef}>
        <option key={0} value={"none"}>{"-----------------------------------"}</option>
          {
            data?.map((group)=>(
              <option key={group._id} value={group.nombre} >{group.nombre}</option>
            ))
          }
        </select>
      </div>

      <div className="sectionDaily">
      <img src={avatarUser} alt="Permissions" className="imgAvatar"/>
        <h2 className="seleccionadoDaily">{nameUser}</h2>

        <div className="mainCajas">
          <div className="subTitulo">Personal del grupo</div>
          <div className="caja1">
              {
                
                data1?.map((nombres)=>(
                  <p className="item" key={nombres._id} onClick={()=> clickUser(nombres._id,nombres.nombres,nombres.apellidos)}>{nombres.nombres} {nombres.apellidos}</p>
                ))
                
              }
            
          </div>
        </div>

        <div className="mainCajas">
          <div className="subTitulo">Registro  de licencias en el año {startDate.getFullYear()}</div>
          <div className="yearSelect">
              <DatePicker className='picker'
                selected={startDate}
                onChange={(date) => {setStartDate(date),auxAño=(date),traer2()}}
                showYearPicker
                dateFormat="yyyy"
                ref={fechaInicialRef}
              />
        </div>
          <div className="cajaPermissions">
            <ul>

           
               {
                  
                  data2?.map((permisos)=>(
                    <li className='itemHover' key={permisos._id} onClick={()=>llenarFormulario(permisos.Nombre,permisos.FechaInicio,permisos.FechaFinal,permisos.Observacion,permisos._id,permisos.Estado)}
                    >- {permisos.Nombre}</li>
                  ))
                  
               }
            </ul>    
          </div>
        </div>

        


      </div>

      <div className="mainFloat">
          <div className="caja">
          <div className="contentCalendar">
          <DatePicker
            selected={starIn}
            onChange={(date) => setStartDate(date)}
            inline
            showWeekNumbers
            showMonthDropdown
            startDate={starIn}
            endDate={starOut}
            ref={fechaFinalRef}
          />
        </div>
            
          </div>
        </div>

      {/* ---------------------------------------------------------------------------------------------------------- */}

      <div className="sectionDetails">
      <div className="mainCajas2">

          <div className="caja1">
              <h5 className='titleDetail'>Nombre del periodo de licencia</h5>
              <input type="text" className='inputname' ref={namePermissionRef}/>
              <h5 className='titleCaducidad'>Caducidad</h5>

              <div className="contentControls">
                <img src={calendar} alt="In"className='imgCalendar'/>
                <DatePicker
                  className='inputIn'
                        selected={starIn}
                        onChange={(date) => setStarIn(date)}
                        showYearDropdown
                        dateFormatCalendar="MMMM"
                        yearDropdownItemNumber={50}
                        scrollableYearDropdown
                        ref={starInRef}
                  />

                <img src={calendar} alt="Out"className='imgCalendar'/>
                <DatePicker
                  className='inputOut'
                        selected={starOut}
                        onChange={(date) => setStarOut(date)}
                        showYearDropdown
                        dateFormatCalendar="MMMM"
                        yearDropdownItemNumber={50}
                        scrollableYearDropdown
                        ref={starOutRef}
                  />
              </div>
              
              <h5 className='titleCaducidad'>Observaciones o anotaciones</h5>
              <textarea type="text" className='inputObservaciones' ref={observacionesRef}/>

          </div>

          <div className="cajaControls">
          <div className="seccionButons">
          <div className="containerSingleButtom">
                  <img src={Brush} alt="pencil" className='img-butons' onClick={limpiar} />
                </div>
                <div className="containerSingleButtom">
                  <img src={Plus} alt="pencil" className='img-butons' onClick={agregar}/>
                </div>
                <div className="containerSingleButtom">
                 <img src={Edit} alt="plus" className='img-butons' onClick={editar}/>
                </div>
                <div className="containerDeleteButtom2">
                 <img src={Delete} alt="trash" className='img-butons' onClick={eliminar}/>

                </div>
              </div>
             
          </div>
          
        </div>
        
      </div>

    </div>
  )
}
