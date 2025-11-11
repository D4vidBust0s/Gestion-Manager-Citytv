/* ESTILOS */
import './Barra.css'

/* IMAGENES */
import tropa from '../../../../assets/tropa.png';
import target from '../../../../assets/target.svg';
import note from '../../../../assets/document.svg';

import adds from '../../../../assets/Plus.svg';
import edit from '../../../../assets/pencil.svg';
import del from '../../../../assets/trash.svg';

/* DEPENDENCIAS */
import {useState, useEffect, useContext, useRef} from 'react'
import { createPortal } from 'react-dom';
import axios from 'axios';
//import {Toaster, toast} from 'react-hot-toast'
import DatePicker from 'react-datepicker';

/* COMPONENTES MODALES*/
import ModalPlanner1 from "../../../Modals/ModalPlanner1";
import ModalPlanner3 from "../../../Modals/ModalPlanner3";
import toast from 'react-hot-toast';
import { FechaBarraContext } from '../../../../context/FechaBarraProvider';
import { AuxSustitutions} from '../../../../context/AuxSustitutionsProvider';





//Variables Globales
let permissions = 0;           // Permisos - Permissions         -- color Amarillo
let breaks = 0;                // Descansos - Breaks             -- color Verde
let incapacitado = 0;          // incapacidades - incapacity     -- color rojo 
let vacaciones = 0;            // Vacaciones - Recess            -- color naranja
let licensia = 0;              // Licensias - License            -- color azul 

let IDUSERGLOBAL = "";
let NOMBRETRABAJADORGLOBAL = "";
let IDNOTAGLOBAL = "";
let CONTENTNOTAGLOBAL = "";
          


/*
let descanso = 0;           
let incapacitado = 0;       
let vacaciones = 0;         
let licensia = 0;           
let breaks = 0;             
*/

let verifyDescanso = 0;           //Permisos o descansos
let verifyIncapacitado = 0;       //Incapacidades
let verifyVacaciones = 0;         //Vacaciones o Recess
let verifyLicensia = 0;           //Licensias
let verifyBreaks = 0;             //Breaks

let auxi = 0;
let aux = "";



export default function Barra() {

  //REFERENCIAS
  const descripcionRef = useRef();

  //CONTEXTOS
  const [fechaBarra,setFechaBarra] = useContext(FechaBarraContext); //Este contexto hace referencia a la fecha que se selecciona 
                                                                    //en la barra del mainplanner

  const [Aux,setAux] = useContext(AuxSustitutions); //Este contexto referencia un estado que avisa si hubo un cambio
                                                                    //para volver a llamar las sustituciones nuevamente
  
//estado para la ventana modal1 
 const [modal1, setModal1] = useState(false); 
 const [modal2, setModal2] = useState(false); 

 //Estados para la Data de groups
 const [startDate, setStartDate] = useState(new Date(fechaBarra));
 const [data, setData] = useState([]);
 const [data1, setData1] = useState([]);
 const [data2, setData2] = useState([]);
 const [data3, setData3] = useState([]);
 const [data4, setData4] = useState([]);
 const [data5, setData5] = useState([]);
 const [data6, setData6] = useState([]);
 const [data7, setData7] = useState([]);
 const [data8, setData8] = useState([]);
 const [data9, setData9] = useState([]);
 const [data10, setData10] = useState([]);

 const [nombre, setNombre] = useState("");
 const [cargo, setCargo] = useState("");
 const [idUser, setIduser] = useState("");
 const [subGrupo, setSubgrupo] = useState(0);
 const [grupo, setGrupo] = useState("NONE");
 const [gpid, setGpid] = useState("");


 const [colorBorder, setColorBorder] = useState("#D9D9D9");
 const [tipoEvento, setTipoEvento] = useState("");
 const [isChecked, setIsChecked] = useState(false);

 const [nombreUserLista, setNombreUserLista] = useState("------");

/* Referencias */
const groupsRef = useRef();

 

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

  const getPermissions = async ()=>{
    return await axios
    .get("http://localhost:3000/api/permissions/")
    .then((response) => setData2(response.data));
  }

  const getBreaks = async ()=>{
    return await axios
    .get("http://localhost:3000/api/breaks/")
    .then((response) => setData6(response.data));
  }

  const getIncapacity = async ()=>{
    return await axios
    .get("http://localhost:3000/api/incapacitys")
    .then((response) => setData3(response.data));
  }

  const getRecess = async ()=>{
    return await axios
    .get("http://localhost:3000/api/recess")
    .then((response) => setData4(response.data));
  }

  const getLicenses = async ()=>{
    return await axios
    .get("http://localhost:3000/api/licenses")
    .then((response) => setData5(response.data));
  }

  const getRotationsmanager = async ()=>{
    return await axios
    .get("http://localhost:3000/api/rotationsmanager")
    .then((response) => setData7(response.data));
  }

  //Funcion que obtiene la data de la api - listado Substitutions
  const getSubstitutions = async () => {
  return await axios
    .get("http://localhost:3000/api/substitutions/")
    .then((response) => setData8(response.data));
};

const getPeopleOfGroup = async ()=>{
  return await axios
  .get("http://localhost:3000/api/payroll/people/"+aux)
  .then((response) => setData9(response.data));  

}


  const semanasAlDia = (ID_Usuario,Nombre,Apellido)=>{

   
    /* Itero sobre el arreglo de "rotationsManager" para el usuario actual
       y hago las respectivas operaciones */

    data7?.map((item)=>(
      item.userId == ID_Usuario && 
        
      //Valido si se ha asiganado turno en rotations o no
      item.totalGrupo == 0 && item.userId == ID_Usuario && toast.error("Para " + Nombre + " " +Apellido +" no se ha definido una rotación actual en ROTATIONS")

    ))

  }

  const verificar = (pid,pn,pa,subgrupo,cargo,pg,gid)=>{


      verifyDescanso = 0;
      verifyIncapacitado = 0;
      verifyVacaciones = 0;
      verifyLicensia = 0;
      verifyBreaks = 0;


      testPermissions(pid);
      testIncapacitys(pid);
      testRecess(pid);
      testLicenses(pid);
      testBreaks(pid);
    
    data2?.map((idReg)=>(
        idReg.Id_Empleado == pid && idReg.Año == startDate.getFullYear() && permissions == 1  && isChecked ? verifyDescanso=1 : null
        //console.log("Permisos  "+verifyDescanso)
        
    ))

    data3?.map((idReg)=>(
      idReg.Id_Empleado == pid && idReg.Año == startDate.getFullYear() && incapacitado == 1 && isChecked ? verifyIncapacitado=1 : null
      //console.log("Incapacidades  "+verifyIncapacitado)
      
    ))

    data4?.map((idReg)=>(
      idReg.Id_Empleado == pid && idReg.Año == startDate.getFullYear() && vacaciones == 1 && isChecked ? verifyVacaciones=1 : null
      //console.log("Vacaciones  "+verifyVacaciones)
      
    ))

    data5?.map((idReg)=>(
      idReg.Id_Empleado == pid && idReg.Año == startDate.getFullYear() && licensia == 1 && isChecked ? verifyLicensia=1 : null
      //console.log("Licencias  "+verifyLicensia)
      
    ))

    data6?.map((idReg)=>(
      idReg.Id_Empleado == pid && idReg.Año == startDate.getFullYear() && breaks == 1 && isChecked ? verifyBreaks=1 : null
      //console.log("Licencias  "+verifyLicensia)
      
    ))
    
    
    if(verifyDescanso==1)
    {
      setNombre(pn+" "+pa) + setCargo(cargo) + setIduser(pid) + setSubgrupo(subgrupo) + setColorBorder("#E9BD1A") + setTipoEvento("PERMISO") + setGrupo(pg) + setModal2(!modal2)
      //console.log("ES.... PERMISO");
    
      
    }
    else if(verifyIncapacitado==1)
    {
      setNombre(pn+" "+pa) + setCargo(cargo) + setIduser(pid) + setSubgrupo(subgrupo) + setColorBorder("red") + setTipoEvento("INCAPACIDAD") + setGrupo(pg) + setModal2(!modal2)
        //console.log("ES.... INCAPACITADO");
       
    }

    else if(verifyVacaciones==1)
    {
      setNombre(pn+" "+pa) + setCargo(cargo) + setIduser(pid) + setSubgrupo(subgrupo) + setColorBorder("#dd6c21") + setTipoEvento("VACACIONES") + setGrupo(pg) + setModal2(!modal2)
        //console.log("ES.... VACACIONES");
      
    }

    else if(verifyLicensia==1)
    {
      setNombre(pn+" "+pa) + setCargo(cargo) + setIduser(pid) + setSubgrupo(subgrupo) + setColorBorder("#00094B") + setTipoEvento("LICENSIA") + setGrupo(pg) + setModal2(!modal2)
        //console.log("ES.... LICENSIA");
       
    }

    else if(verifyBreaks==1)
    {
      setNombre(pn+" "+pa) + setCargo(cargo) + setIduser(pid) + setSubgrupo(subgrupo) + setColorBorder("#2f800d") + setTipoEvento("DESCANSO") + setGrupo(pg) + setModal2(!modal2)
        //console.log("ES.... LICENSIA");
       
    }
    
    else{

      setNombre(pn+" "+pa) + setCargo(cargo) + setIduser(pid) + setSubgrupo(subgrupo) + setColorBorder("#DADADA")  + setGrupo(pg) + setGpid(gid) + setModal1(!modal1)  
      //console.log("Normal");
  
    }


    //---------------------------------------------------------------------------------------------------------
    //Procedimiento para mantener al dia la semana de rotacion a todos los usuarios
    semanasAlDia(pid,pn,pa);

  }
  

  const testPermissions = (pid)=>{
      //Busco en el array de permisos si hay registros con el id del usuario 

      permissions=0;

      let std= new Date(startDate.setHours(0,0,0,0));
      let idregIni;
      let idregEnd;

      data2?.map((idReg)=>(
        
        idregIni = new Date (idReg.FechaInicio).setHours(0,0,0,0),
        idregEnd = new Date (idReg.FechaFinal).setHours(0,0,0,0),
        
        idReg.Id_Empleado == pid &&  std.toISOString() >= new Date (idregIni).toISOString()  && std.toISOString() <= new Date(idregEnd).toISOString()  ? permissions = 1  : null 
        
      ))

  }

  const testIncapacitys = (pid)=>{
    //Busco en el array de incapacidades si hay registros con el id del usuario 

    incapacitado=0;
    let std= new Date(startDate.setHours(0,0,0,0));
    let idregIni;
    let idregEnd;

    data3?.map((idReg)=>(
      
      idregIni = new Date (idReg.FechaInicio).setHours(0,0,0,0),
      idregEnd = new Date (idReg.FechaFinal).setHours(0,0,0,0),
      
      idReg.Id_Empleado == pid &&  std.toISOString() >= new Date (idregIni).toISOString()  && std.toISOString() <= new Date(idregEnd).toISOString()  ? incapacitado = 1 : null
      
    ))

}

const testRecess = (pid)=>{
  //Busco en el array de vacaciones si hay registros con el id del usuario 

  vacaciones=0;
  let std= new Date(startDate.setHours(0,0,0,0));
  let idregIni;
  let idregEnd;

  data4?.map((idReg)=>(
    
    idregIni = new Date (idReg.FechaInicio).setHours(0,0,0,0),
    idregEnd = new Date (idReg.FechaFinal).setHours(0,0,0,0),
    
    idReg.Id_Empleado == pid &&  std.toISOString() >= new Date (idregIni).toISOString()  && std.toISOString() <= new Date(idregEnd).toISOString()  ? vacaciones = 1 : null
    
  ))

}


const testLicenses = (pid)=>{
  //Busco en el array de licensias si hay registros con el id del usuario 

  licensia=0;
  let std= new Date(startDate.setHours(0,0,0,0));
  let idregIni;
  let idregEnd;

  data5?.map((idReg)=>(
    
    idregIni = new Date (idReg.FechaInicio).setHours(0,0,0,0),
    idregEnd = new Date (idReg.FechaFinal).setHours(0,0,0,0),
    
    idReg.Id_Empleado == pid &&  std.toISOString() >= new Date (idregIni).toISOString()  && std.toISOString() <= new Date(idregEnd).toISOString()  ? licensia = 1 : null
    
  ))

}


const testBreaks = (pid)=>{
  //Busco en el array de breaks si hay registros con el id del usuario 

  breaks=0;
  let std= new Date(startDate.setHours(0,0,0,0));
  let idregIni;
  let idregEnd;

  data6?.map((idReg)=>(
    
    idregIni = new Date (idReg.FechaInicio).setHours(0,0,0,0),
    idregEnd = new Date (idReg.FechaFinal).setHours(0,0,0,0),
    
    idReg.Id_Empleado == pid &&  std.toISOString() >= new Date (idregIni).toISOString()  && std.toISOString() <= new Date(idregEnd).toISOString()  ? breaks = 1 : null
    
  ))

}

const noExist = () =>{
  auxi++
  return <ul  key={auxi}>
      {
        data1.length == auxi &&  
        <>
          <li className="liMain2">----------</li>
          <li className="liMain2">----------</li>
          <li className="liMain2">----------</li>
        </>
      }
           
        </ul>
 }

 const traerRemplazo = (pid,grupoid) =>{
  let respuesta = " / ---------------";

  if(permissions == 1 || incapacitado == 1 || licensia == 1 || vacaciones == 1 || breaks == 1)
  {
    data8?.map(
      (sustituciones)=>(sustituciones.ID_grupo_der == grupoid && new Date(fechaBarra).toISOString() == sustituciones.Fecha_dia && sustituciones.ID_user_main == pid ? respuesta = " / " +sustituciones.NombreLeft : null)
      )
  } 

  else {
    respuesta = "";
  }


  return respuesta;

 }



  const exist = (pid,pg,gn,pn,cargo,pa,subgrupo,grupoid) =>{

  
    testPermissions(pid)
    testIncapacitys(pid)
    testRecess(pid)
    testLicenses(pid)
    testBreaks(pid)


    return <ul className="ulMain" key={pid}>
      <li className={permissions == 1 ? "liMain-var1" :  incapacitado == 1 ? "liMain-var2" : licensia == 1 ? "liMain-var3" : vacaciones == 1 ? "liMain-var4" : breaks == 1 ? "liMain-var5" : cargo == "USERBALANCER" ? "liMain-var6": "liMain"} key={pid}  onClick={() => verificar(pid,pn,pa,subgrupo,cargo,pg,grupoid) }>
        {
          data7?.map((rm)=>(
            rm.userId == pid && rm.fijo == true 
            ?

            <span key={rm._id}> 
              <img src={target} alt="fijo" className='target'/>
            </span> 
            
            : null
          ))
        }
        
        {pn +" "+pa + traerRemplazo(pid,grupoid)}
      </li>
    </ul>

  }

  const mostrar = ()=>{
    let elemento = document.getElementById("miAux");
    elemento.classList.toggle("mostrarAux2");
  }


  const programClick = () =>
  {

    //Funcion para obtener el nombre del grupo segun id y guardarlo en aux
    data?.map((grupos)=>(grupos._id==groupsRef.current.value?aux = grupos._id:null))


     //Traigo el personal del grupo con al id de grupo que recibi anteriormente
     getPeopleOfGroup();

     //limpio el textarea
     descripcionRef.current.value = "";
    
  }


  //Funcion que obtiene la data de la api - listado de anotaciones segun id y fecha especifica
  const obtenerListadoTurnos = async () => {
    return await axios
      .get("http://localhost:3000/api/notations/",
      {
        params:{
          id: IDUSERGLOBAL,
          fecha: new Date(fechaBarra).toISOString(),
        }
      })
      .then((response) => setData10(response.data));
  };


  //Funcion que agrega una anotacion
  const add = async () =>{

    if(descripcionRef.current.value == "" )
    {
      toast.error("El campo descripción no puede estar vacio");
    }

    else if(IDUSERGLOBAL == "" || NOMBRETRABAJADORGLOBAL == "")
    {
      toast.error("No se ha seleccionado un usuario de la lista al que se le agregara la anotacion");
    }

    else{
      return await axios
        .post("http://localhost:3000/api/notations/",{
          iduser: IDUSERGLOBAL,
          nombres: NOMBRETRABAJADORGLOBAL,
          estado: true,
          contenido: descripcionRef.current.value,
          fecha: fechaBarra,
      
        }),obtenerListadoTurnos(),
        
       
        
        toast.success("Anotación creada correctamente")
    }
  }

  const clicItem = (id,nombres,apellidos,e)=>{
      IDUSERGLOBAL = id;
      NOMBRETRABAJADORGLOBAL = nombres + " " +apellidos;
      setNombreUserLista(NOMBRETRABAJADORGLOBAL);
      obtenerListadoTurnos();
      descripcionRef.current.value = "";


      //Aqui lo que hago es cambiar los estilos para el iems seleccionado;
    if (e.target.classList=="usersRotations") 
    {

      let aux = document.getElementsByClassName("active2");

      for (let index = 0; index < aux.length; index++) 
      {
        aux[index].classList.remove("active2");
      }

      e.target.classList.add("active2");
    }
  }

  const mandar = (idAnotacion,idUser,contenido,e) =>{
      IDNOTAGLOBAL = idAnotacion != "" ? idAnotacion : "";
      CONTENTNOTAGLOBAL = contenido;
      descripcionRef.current.value = contenido;

      //Aqui lo que hago es cambiar los estilos para el iems seleccionado;
    if (e.target.classList=="li-resultados") 
    {

      let aux = document.getElementsByClassName("active3");

      for (let index = 0; index < aux.length; index++) 
      {
        aux[index].classList.remove("active3");
      }

      e.target.classList.add("active3");
    }

      
  }

  
  const editar = async () =>{
    if(descripcionRef.current.value == "" )
    {
      toast.error("Si desea editar, el campo descripción no puede estar vacio");
    }

    else if(IDNOTAGLOBAL == "")
    {
      toast.error("Para editar una anotación primero seleccionela");
    }

    else{

      return await axios
      .put("http://localhost:3000/api/notations/",{
        idnota: IDNOTAGLOBAL,
        contenido: descripcionRef.current.value,
    
      }),obtenerListadoTurnos(),
        toast.success("Anotación actualizada correctamente");

    }

  }

  const eliminar = async () =>{
    
    if(IDNOTAGLOBAL == "")
    {
      toast.error("Para eliminar una anotación primero seleccionela de los resultados");
    }

    else{

      return await axios
      .delete("http://localhost:3000/api/notations/",{

        params:{
          idnotation: IDNOTAGLOBAL
        }

      }),obtenerListadoTurnos(),
      IDNOTAGLOBAL = "",
      toast.success("Anotación Eliminada"),
      descripcionRef.current.value = ""
    }

  }

  


  //-------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    obtenerListadoGrupos();
  }, [Aux]);

  useEffect(() => {
    getPeople();
  }, [Aux]);


  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    getBreaks();
  }, []);

  useEffect(() => {
    getIncapacity();
  }, []);

  useEffect(() => {
    getRecess();
  }, []);


  useEffect(() => {
    getLicenses();
  }, []);


  useEffect(()=>{
    getRotationsmanager();
  },[])

  useEffect(()=>{
    getSubstitutions();
  },[Aux])

  useEffect(()=>{
    obtenerListadoTurnos();
    IDNOTAGLOBAL= "";
    descripcionRef.current.value = "";
  },[fechaBarra])


  
 

  return (
    <>
      
      {createPortal(
        <ModalPlanner1 estado={modal1} cambiarEstado={setModal1} nombres={nombre} cargo={cargo} fechaPlaner={startDate} iduser={idUser} subGrupo={subGrupo} color={colorBorder} gp={grupo} gpid={gpid}/>,
        document.querySelector("#portal")
      )}

      {createPortal(
        <ModalPlanner3 estado={modal2} cambiarEstado={setModal2} nombres={nombre} cargo={cargo} fechaPlaner={startDate} iduser={idUser} subGrupo={subGrupo} color={colorBorder} gp={grupo} tipo ={tipoEvento} />,
        document.querySelector("#portal")
      )} 

        
      <div className="barra">
        <img src={tropa} alt="tropa" className="imgTropa" onClick={()=> mostrar()}/>
        <div className="content-listado">
        <div className="calendar">
        
        <DatePicker
          className="picker"
          selected={startDate}
          onChange={(date) => setStartDate(date) + setFechaBarra(new Date(date).toDateString())}
          showMonthDropdown
        />
      </div>

        <input type="checkbox" className='showestados' checked={isChecked} onChange={() => setIsChecked(!isChecked) + (isChecked == false ? toast.success("Activa o desactiva esta opción si deseas ver en detalle información de los estados de ausencia") : null)}/>
      
  
          {
            //Ciclo que trae el numero de grupos del sistema
            data?.map((group)=>(
              auxi = 0,

                <div key={group._id}>
                  {
                    
                    //Ciclo que trae todos los usuarios del sistema 
                    data1?.map((payroll)=>(
                    <div className="hol" key={payroll._id}>
                      {
                             
                           payroll.grupoID == group._id && payroll.activo == true ?  exist(payroll._id,payroll.grupo,group.nombre,payroll.nombres,payroll.cargo,payroll.apellidos,payroll.subGrupo,payroll.grupoID) : noExist()
                          
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


      {/* SECCION AUXILIAR PARA MANEJO DE NOTAS EN LOS USUARIOS */}
      <div  id='miAux' style={{position: "fixed",  zIndex: "1000",padding: "1rem",width: "64.2%"}}>

        <div className="cabezal2">
          <img src={note} alt="logo" className='changeGroups_logo' />
          <h2 className='titular'>ANOTACIONES <span className='subt'>{new Date(fechaBarra).toDateString()}</span></h2>
        </div>
        <h3 className='cabezal2-sub'>{nombreUserLista}</h3>

        <div className="cuerpo">
              <div className="subTituloNew">
              <h3 className='textAuxi'>Grupos</h3>
              <select className="inputDirNew" onChange={()=> programClick()} ref={groupsRef}>
              <option  value={"none"}>{"-----------------------------------"}</option>
                {
                  data?.map((program)=>(
                    <option key={program._id} value={program._id}>{program.nombre}</option>
                  )) 
                }
              </select>
            </div>


            <div className="sectionmedia">
              <div className="listadoUsers">
                {
                  data9?.map((peoleOfGroup)=>(
                    <div className="asiganation_li2" key={peoleOfGroup._id}>
                      <span className={peoleOfGroup.cargo=="USERBALANCER" ? "usersRotations3":"usersRotations"}  onClick={(e) => clicItem(peoleOfGroup._id,peoleOfGroup.nombres,peoleOfGroup.apellidos,e)}>
                        {"- " + peoleOfGroup.nombres + " " + peoleOfGroup.apellidos}
                      </span>
                  </div>
                  ))
                }
              </div>

              <div className="agregar">
              <h3 className='textAuxi'>Descripción</h3>
                <textarea name="" id="" cols="30" rows="10" className='agregado' ref={descripcionRef}></textarea>
              </div>

              <div className="controles">
               <h3 className='textAuxi'>Acciones</h3>
               <div >
                  <img src={adds} alt="add"  className='add' onClick={add}/>
                  <img src={edit} alt="add"  className='edit' onClick={editar}/>
                  <img src={del} alt="add"  className='del' onClick={eliminar}/>
               </div>
            </div>

            </div>
            
            <div className="resultados">
              <h3 className='textAuxi'>Resultados...</h3>
              <ul>

                {
                  data10?.map((notation, index)=>(
                    <li className='li-resultados' key={notation._id} onClick={(e)=>mandar(notation._id,notation.ID_user,notation.Contenido,e)}>
                      <span className='li-resultados-numero'>{index +1}</span>
                      {notation.Contenido}
                    </li>
                  ))
                }
                

              </ul>
            </div>
        </div>

        
      </div>
    </>
  );
}
