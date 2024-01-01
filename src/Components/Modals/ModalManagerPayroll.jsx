/* eslint-disable react/prop-types */


/* ESTILOS */
import './ModalManagerPayroll.css'

/* IMAGENES */
import Face from '../../assets/face.svg'
import Calendar from '../../assets/Calendar-withe.svg'
import Mobile from '../../assets/mobile-withe.svg'
import Documents from '../../assets/document-withe.svg'
import Enterprise from '../../assets/enterprise.svg'
import Pulse from '../../assets/Pulse.svg'
import Annita from '../../assets/Anita.jpg'
import Pencil from '../../assets/pencil.svg'
import Save from '../../assets/bxs-save.svg'


/* Import dependencies */
import {useState, useRef, useEffect} from 'react';
import DatePicker from 'react-datepicker';
import { Toaster, toast } from "react-hot-toast";
import axios from 'axios';

let aux = 0;
let aux2 = 0;
//------------------------------------------------------------------------------------------------------------------------------------

export default function ModalManagerPayroll({id,op}) {
  
 

  /* estados para el datepicker */
  const [startDateNacimiento, setStartDateNacimiento] = useState(new Date());
  const [startDateIngreso, setStartDateIngreso] = useState(new Date());

   //Estados para la data de grupos - api
   const [data, setData] = useState([]);

   //Estados para la data de grupos - api
   const [dataDos, setDataDos] = useState([]);

   //Estado para la palabra activo o inactivo segun el estado
   const [estado, setEstado] = useState("Activo");

  

  /* Referencias */
  const nombresRef = useRef();
  const apellidosRef = useRef();
  const edadRef = useRef();
  const nacimientoRef = useRef();
  const generoRef = useRef();
  const civilRef = useRef();
  const celPrioritarioRef = useRef();
  const celAuxReF = useRef();
  const fijoRef = useRef();
  const dirReF = useRef();
  const emailReF = useRef();
  const ccReF = useRef();
  const pasaporteReF = useRef();
  const profesionalReF = useRef();
  const cargoReF = useRef();
  const grupoReF = useRef();
  const ingresoReF = useRef();
  const rhReF = useRef();
  const contactoPrincipalReF = useRef();
  const contactoSecundarioReF = useRef();
  const estadoReF = useRef();
  const mainplannerRef = useRef();

  

  //-------------------------------------------------------------------------------------------------------

  //FUNCIONES
  const enviarFormulario = async () => {

    /* VALIDACIONES */
    if(nombresRef.current.value=="")
    {
      toast.error("El campo nombres no puede estar vacio");
      nombresRef.current.focus();
    }

    else if(apellidosRef.current.value=="")
    {
      toast.error("El campo apellidos no puede estar vacio");
      apellidosRef.current.focus();
    }

    else if(edadRef.current.value=="")
    {
      toast.error("El campo edad no puede estar vacio");
      edadRef.current.focus();
    }

    else if(nacimientoRef.current.input.value=="")
    {
      toast.error("El campo fecha de nacimiento no puede estar vacio");
      nacimientoRef.current.input.focus();
    }

    else if(celPrioritarioRef.current.value=="")
    {
      toast.error("Debe especificar un número celular prioritario");
      celPrioritarioRef.current.focus();
    }

    else if(celAuxReF.current.value=="")
    {
      toast.error("Debe especificar un número celular auxiliar");
      celAuxReF.current.focus();
    }

    else if(dirReF.current.value=="")
    {
      toast.error("Debe especificar una dirección de domicilio");
      dirReF.current.focus();
    }

    else if(emailReF.current.value=="")
    {
      toast.error("Debe especificar una dirección de correo electrónico");
      emailReF.current.focus();
    }

    else if(ccReF.current.value=="")
    {
      toast.error("Debe especificar un número de documento");
      ccReF.current.focus();
    }
   
    else if(cargoReF.current.value=="")
    {
      toast.error("Debe especificar el cargo del empleado");
      cargoReF.current.focus();
    }
    
    else if(rhReF.current.value=="")
    {
      toast.error("Debe especificar el RH del empleado");
      rhReF.current.focus();
    }

    else if(contactoPrincipalReF.current.value=="")
    {
      toast.error("Debe especificar la información de contácto de alguien para contactárlo en caso de emergencia");
      contactoPrincipalReF.current.focus();
    }

    else if(contactoSecundarioReF.current.value=="")
    {
      toast.error("Debe especificar la información de un contácto auxiliar para contactárlo en caso de emergencia");
      contactoSecundarioReF.current.focus();
    }

    else{

      //evaluamos que operacion se debe hacer si agregar o eliminar
      if(op == 0)
      {
        //Se envia la informacion validada al api

        await axios.post("http://localhost:3000/api/payroll/", {

          Nombres: nombresRef.current.value,
          Apellidos: apellidosRef.current.value,
          Edad: edadRef.current.value,
          FechaDeNacimiento: nacimientoRef.current.input.value,
          Genero: generoRef.current.value,
          EstadoCivil: civilRef.current.value,
          CelularPrioritario: celPrioritarioRef.current.value,
          CelularAux: celAuxReF.current.value,
          TelefonoFijo: fijoRef.current.value,
          DireccionResidencia: dirReF.current.value,
          Email: emailReF.current.value,
          Cc: ccReF.current.value,
          Pasaporte: pasaporteReF.current.value,
          TarjetaProfesional: profesionalReF.current.value,
          Cargo: cargoReF.current.value,
          Grupo: grupoReF.current.value,
          FechaIngreso: ingresoReF.current.input.value,
          RH: rhReF.current.value,
          ContactoPrincipal: contactoPrincipalReF.current.value,
          ContactoAux: contactoSecundarioReF.current.value,
          Activo: estadoReF.current.value,
          Mainplanner: mainplannerRef.current.value,
      });

      toast.success("Usuario agregado correctamente");


      }

      else if (op == 1)
      {
        //Proceso de actualizacion en la api
        await axios.put("http://localhost:3000/api/payroll/" + id, {

          nombres: nombresRef.current.value,
          apellidos: apellidosRef.current.value,
          edad: edadRef.current.value,
          fechaDeNacimiento: nacimientoRef.current.input.value,
          genero: generoRef.current.value,
          estadoCivil: civilRef.current.value,
          celularPrioritario: celPrioritarioRef.current.value,
          celularAux: celAuxReF.current.value,
          telefonoFijo: fijoRef.current.value,
          direccionResidencia: dirReF.current.value,
          email: emailReF.current.value,
          cc: ccReF.current.value,
          pasaporte: pasaporteReF.current.value,
          tarjetaProfesional: profesionalReF.current.value,
          cargo: cargoReF.current.value,
          grupo: grupoReF.current.value,
          fechaIngreso: ingresoReF.current.input.value,
          RH: rhReF.current.value,
          contactoPrincipal: contactoPrincipalReF.current.value,
          contactoAux: contactoSecundarioReF.current.value,
          activo: estadoReF.current.value,
          mainplanner: mainplannerRef.current.value,

        });

        toast.success("Usuario en actualizado correctamente");
        obtenerSinglePayroll();
      }
      

    }


  }

  //FUNCIONES
  //Funcion que obtiene la data de la api - listado de grupos
  const obtenerListadoGrupos = async () => {
    return await axios
      .get("http://localhost:3000/api/groups")
      .then((response) => setData(response.data));
  };


  //Funcion para modificar el estado activo o inactivo del usuario
  
  const modifyEstate = () =>{

    if(estadoReF.current.value=="true")
    {
      setEstado("Activo");
    }

    else if(estadoReF.current.value=="false")
    {
      setEstado("Inactivo");
    }
   
  }
  


  //Funcion que obtiene la data de una persona por id
 
  //Funcion reset formulario
  const reset =() =>{
   
      nombresRef.current.value="";
      apellidosRef.current.value="";
      edadRef.current.value="";
      nacimientoRef.current.input.value="";
      generoRef.current.value="";
      civilRef.current.value="";
      celPrioritarioRef.current.value="";
      celAuxReF.current.value="";
      fijoRef.current.value="";
      dirReF.current.value="";
      emailReF.current.value="";
      ccReF.current.value="";
      pasaporteReF.current.value="";
      profesionalReF.current.value="";
      cargoReF.current.value="";
      grupoReF.current.value="";
      ingresoReF.current.input.value="";
      rhReF.current.value="";
      contactoPrincipalReF.current.value="";
      contactoSecundarioReF.current.value="";
      //estadoReF.current.value="";
      //setEstado(estadoReF.current.value="Activo");
      //mainplannerRef.current.value="";
      
  }

   const manipulador1 = (date) =>{
    aux = 1;
    setStartDateNacimiento(date)
   }

   const manupulador2 = (date)=>{
    aux2 = 1;
    setStartDateIngreso(date);
   }


   //Funcion para obtener la data de  la persona
   
    const obtenerSinglePayroll = async () => {
      return await axios
        .get("http://localhost:3000/api/payroll/"+id)
        .then((response) => setDataDos(response.data));
    };
 
//--------------------------------------------------------------------------------------------------------------------------------------------

  useEffect(() => {
   obtenerListadoGrupos();
 }, []);

 useEffect(() => {
  
  if(id){
    const obtenerSinglePayroll = async () => {
      return await axios
        .get("http://localhost:3000/api/payroll/"+id)
        .then((response) => setDataDos(response.data));
    };
  
    obtenerSinglePayroll();

  }

}, [id]);

useEffect(()=>{
  nombresRef.current.value=dataDos["nombres"];
  apellidosRef.current.value=dataDos["apellidos"];
  edadRef.current.value=dataDos["edad"];
  nacimientoRef.current.input.value=new Date(dataDos["fechaDeNacimiento"]).toLocaleDateString();
  setStartDateNacimiento(Date.parse(dataDos["fechaDeNacimiento"]));
  generoRef.current.value=dataDos["genero"];
  civilRef.current.value=dataDos["estadoCivil"];
  celPrioritarioRef.current.value=dataDos["celularPrioritario"];
  celAuxReF.current.value=dataDos["celularAux"];
  fijoRef.current.value=dataDos["telefonoFijo"];
  dirReF.current.value=dataDos["direccionResidencia"];
  emailReF.current.value=dataDos["email"];
  ccReF.current.value=dataDos["cc"];
  pasaporteReF.current.value=dataDos["pasaporte"];
  profesionalReF.current.value=dataDos["tarjetaProfesional"];
  cargoReF.current.value=dataDos["cargo"];
  grupoReF.current.value=dataDos["grupo"];
  ingresoReF.current.input.value=new Date(dataDos["fechaIngreso"]).toLocaleDateString();
  setStartDateIngreso(Date.parse(dataDos["fechaIngreso"]));
  rhReF.current.value=dataDos["RH"];
  contactoPrincipalReF.current.value=dataDos["contactoPrincipal"];
  contactoSecundarioReF.current.value=dataDos["contactoAux"];
  estadoReF.current.value=dataDos["activo"];
  setEstado((estadoReF.current.value=dataDos["activo"])==true?"Activo":"Inactivo");
  mainplannerRef.current.value=dataDos["mainplanner"];
  aux = 0;
  aux2 = 0;

},[dataDos]);

useEffect(()=>{
  if(op==0 && aux == 0 && aux2 == 0)
  {
    reset();
  }
  
});



  return (
    <>
     <Toaster />
      <div className="containerGestionPersonal">
        <div className="cuerpoModalPayroll">
            <div className="column1">
                <div className="sbTitle">
                  <img src={Face} alt="face" className='img-sbTitle' />
                  Información Personal
                </div>
                <div className="row">
                  <div className="columA">
                     Nombres
                  </div>
                  <div className="columB">
                  <input type="text" name="Nombres" className='input-normal' ref={nombresRef} />
                  </div>
                </div>

                <div className="row">
                  <div className="columA">
                     Apellidos
                  </div>
                  <div className="columB">
                  <input type="text" name="Apellidos" className='input-normal' ref={apellidosRef} />
                  </div>
                </div>

                <div className="row">
                  <div className="columA">
                     Edad
                  </div>
                  <div className="columB">
                  <input type="text" name="Edad" className='input-normal' ref={edadRef} />
                  </div>
                </div>

                <div className="row">
                  <div className="columA">
                     Fecha de Nacimiento
                  </div>
                  <div className="columB">
                  <DatePicker
                  className='input-especial'
                        selected={startDateNacimiento}
                        onChange={(date) => manipulador1(date)}
                        showYearDropdown
                        dateFormatCalendar="MMMM"
                        yearDropdownItemNumber={50}
                        scrollableYearDropdown
                        ref={nacimientoRef}
                  />
                  <img src={Calendar} alt="Calendar" className='img-Calendar' />
                  </div>
                </div>

                <div className="row">
                  <div className="columA">
                     Género
                  </div>
                  <div className="columB">
                  <select name="Genero" className='input-normal' ref={generoRef}>
                      <option value={"Femenino"}>Femenino</option>
                      <option value={"Masculino"}>Masculino</option>
                      <option value={"Otro"}>Otro</option>
                  </select>
                  </div>
                </div>

                <div className="row">
                  <div className="columA">
                     Estado Civil
                  </div>
                  <div className="columB">
                  <select name="EstadoCivil" className='input-normal' ref={civilRef}>
                      <option value={"Soltero"}>Soltero</option>
                      <option value={"Casado"}>Casado</option>
                      <option value={"Otro"}>Otro</option>
                  </select>
                  </div>
                </div>

                <br />

                <div className="sbTitle">
                  <img src={Mobile} alt="face" className='img-sbTitle' />
                  Contácto
                </div>

                <div className="row">
                  <div className="columA">
                     Celular Prioritario
                  </div>
                  <div className="columB">
                  <input type="text" name="celularP" className='input-normal' ref={celPrioritarioRef}/>
                  </div>
                </div>

                <div className="row">
                  <div className="columA">
                     Celular Auxiliar
                  </div>
                  <div className="columB">
                  <input type="text" name="celularAux" className='input-normal' ref={celAuxReF}/>
                  </div>
                </div>

                <div className="row">
                  <div className="columA">
                     Teléfono Fijo
                  </div>
                  <div className="columB">
                  <input type="text" name="e-telFijo" className='input-normal' ref={fijoRef}/>
                  </div>
                </div>

                <div className="row">
                  <div className="columA">
                     Dirección Residencia
                  </div>
                  <div className="columB">
                  <textarea name="direccion" className='input-normal-texbloc' ref={dirReF}></textarea>
                  </div>
                </div>

                <div className="row">
                  <div className="columA">
                     E-mail
                  </div>
                  <div className="columB">
                  <input type="text" name="e-mail" className='input-normal' ref={emailReF}/>
                  </div>
                </div>


            </div>

            <div className="column2">
            <div className="sbTitle">
                  <img src={Documents} alt="face" className='img-sbTitle' />
                  Documentos
                </div>

                <div className="row">
                  <div className="columA">
                     C.C 
                  </div>
                  <div className="columB">
                  <input type="text" name="c.c" className='input-normal' ref={ccReF}/>
                  </div>
                </div>

                <div className="row">
                  <div className="columA">
                     Pasaporte 
                  </div>
                  <div className="columB">
                  <input type="text" name="pasaporte" className='input-normal' ref={pasaporteReF}/>
                  </div>
                </div>

                <div className="row">
                  <div className="columA">
                     Tarjete Profesional 
                  </div>
                  <div className="columB">
                  <input type="text" name="tarjetaProfesional" className='input-normal' ref={profesionalReF}/>
                  </div>
                </div>

                <br />

                <div className="sbTitle">
                  <img src={Enterprise} alt="face" className='img-sbTitle' />
                  Empresa
                </div>

                <div className="row">
                  <div className="columA">
                     Cargo o Función
                  </div>
                  <div className="columB">
                  <input type="text" name="cargo" className='input-normal' ref={cargoReF}/>
                  </div>
                </div>

                <div className="row">
                  <div className="columA">
                     Grupo o Área
                  </div>
                  <div className="columB">
                  <select name="Grupo" className='input-normal' ref={grupoReF}>

                    {
                      data?.map((group)=>(
                        <option value={group.nombre} key={group._id}>{group.nombre}</option>
                      ))
                    }
                      
                  </select>
                  </div>
                </div>

                <div className="row">
                  <div className="columA">
                     Fecha de Ingreso
                  </div>
                  <div className="columB">
                  <DatePicker
                  className='input-especial'
                        selected={startDateIngreso}
                        onChange={(date) => manupulador2(date)}
                        showYearDropdown
                        dateFormatCalendar="MMMM"
                        yearDropdownItemNumber={50}
                        scrollableYearDropdown
                        ref={ingresoReF}
                  />
                  <img src={Calendar} alt="Calendar" className='img-Calendar' />
                  </div>
                </div>

                <br />

                <div className="sbTitle">
                  <img src={Pulse} alt="face" className='img-sbTitle' />
                  Emergencia
                </div>

                <div className="row">
                  <div className="columA">
                     RH
                  </div>
                  <div className="columB">
                  <input type="text" name="RH" className='input-normal' ref={rhReF}/>
                  </div>
                </div>

                <div className="row">
                  <div className="columA">
                     Contácto Principal
                  </div>
                  <div className="columB">
                  <textarea name="emergenciaPrincipal" className='input-normal-texbloc' ref={contactoPrincipalReF}></textarea>
                  </div>
                </div>

                <div className="row">
                  <div className="columA">
                     Contácto Secundario
                  </div>
                  <div className="columB">
                  <textarea name="emergenciaSecundario" className='input-normal-texbloc' ref={contactoSecundarioReF}></textarea>
                  </div>
                </div>
            </div>


            <div className="column3">
                <img src={Annita} alt="User" className='img-user'/>
                <img src={Pencil} alt="User" className='img-editPhoto'/>
                <h3>Anna Brenda Contreras</h3>
                <div className="estadoUp">
                  {estado}
                </div>

                <div className="row2">
                  <div className="columB">
                  <select name="Estado" className='input-normal2' ref={estadoReF} onChange={modifyEstate} >
                      <option value={true}>Activo</option>
                      <option value={false}>Inactivo</option>
                  </select>
                  </div>
                </div>

                <div className="etiqueta">
                  Mainplanner
                </div>
                <div className="row2">
                  <div className="columB">
                  <select name="Estado" className='input-normal2' ref={mainplannerRef} onChange={modifyEstate} >
                      <option value={"Main planner 1"}>Main planner 1</option>
                      <option value={"Main planner 2"}>Main planner 2</option>
                  </select>
                  </div>
                </div>

                <div className="seccionButons2">
                <div className="containerSingleButtom">
                  <img src={Save} alt="save" className='img-butom-save' onClick={enviarFormulario}/>
                </div>
              </div>
            </div>
        </div>
      </div>
    </>
  );
}
