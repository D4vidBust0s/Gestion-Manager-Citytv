/* ESTILOS */
import './Barra.css'

/* IMAGENES */
import tropa from '../../../../assets/tropa.png';
//import flecha from '../../../../assets/arrow.svg'

/* DEPENDENCIAS */
import {useState, useEffect} from 'react'
import { createPortal } from 'react-dom';
import axios from 'axios';
//import {Toaster, toast} from 'react-hot-toast'
import DatePicker from 'react-datepicker';

/* COMPONENTES MODALES*/
import ModalPlanner1 from "../../../Modals/ModalPlanner1";
import ModalPlanner3 from "../../../Modals/ModalPlanner3";

//Variables Globales
let permissions = 0;           // Permisos - Permissions         -- color Amarillo
let breaks = 0;                // Descansos - Breaks             -- color Verde
let incapacitado = 0;          // incapacidades - incapacity     -- color rojo 
let vacaciones = 0;            // Vacaciones - Recess            -- color naranja
let licensia = 0;              // Licensias - License            -- color azul 
          


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








export default function Barra() {
  
//estado para la ventana modal1 
 const [modal1, setModal1] = useState(false); 
 const [modal2, setModal2] = useState(false); 

 //Estados para la Data de groups
 const [startDate, setStartDate] = useState(new Date());
 const [data, setData] = useState([]);
 const [data1, setData1] = useState([]);
 const [data2, setData2] = useState([]);
 const [data3, setData3] = useState([]);
 const [data4, setData4] = useState([]);
 const [data5, setData5] = useState([]);
 const [data6, setData6] = useState([]);

 const [nombre, setNombre] = useState("");
 const [cargo, setCargo] = useState("");
 const [idUser, setIduser] = useState("");
 const [subGrupo, setSubgrupo] = useState(0);


 const [colorBorder, setColorBorder] = useState("#D9D9D9");
 const [tipoEvento, setTipoEvento] = useState("");







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

  const verificar = (pid,pn,pa,subgrupo,cargo)=>{

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
        idReg.Id_Empleado == pid && idReg.Año == startDate.getFullYear() && permissions == 1 ? verifyDescanso=1 : null
        //console.log("Permisos  "+verifyDescanso)
        
    ))

    data3?.map((idReg)=>(
      idReg.Id_Empleado == pid && idReg.Año == startDate.getFullYear() && incapacitado == 1 ? verifyIncapacitado=1 : null
      //console.log("Incapacidades  "+verifyIncapacitado)
      
    ))

    data4?.map((idReg)=>(
      idReg.Id_Empleado == pid && idReg.Año == startDate.getFullYear() && vacaciones == 1 ? verifyVacaciones=1 : null
      //console.log("Vacaciones  "+verifyVacaciones)
      
    ))

    data5?.map((idReg)=>(
      idReg.Id_Empleado == pid && idReg.Año == startDate.getFullYear() && licensia == 1 ? verifyLicensia=1 : null
      //console.log("Licencias  "+verifyLicensia)
      
    ))

    data6?.map((idReg)=>(
      idReg.Id_Empleado == pid && idReg.Año == startDate.getFullYear() && breaks == 1 ? verifyBreaks=1 : null
      //console.log("Licencias  "+verifyLicensia)
      
    ))
    
    
    if(verifyDescanso==1)
    {
      setNombre(pn+" "+pa) + setCargo(cargo) + setIduser(pid) + setSubgrupo(subgrupo) + setColorBorder("#E9BD1A") + setTipoEvento("PERMISO") + setModal2(!modal2)
      //console.log("ES.... PERMISO");
    
      
    }
    else if(verifyIncapacitado==1)
    {
      setNombre(pn+" "+pa) + setCargo(cargo) + setIduser(pid) + setSubgrupo(subgrupo) + setColorBorder("red") + setTipoEvento("INCAPACIDAD") + setModal2(!modal2)
        //console.log("ES.... INCAPACITADO");
       
    }

    else if(verifyVacaciones==1)
    {
      setNombre(pn+" "+pa) + setCargo(cargo) + setIduser(pid) + setSubgrupo(subgrupo) + setColorBorder("#dd6c21") + setTipoEvento("VACACIONES") + setModal2(!modal2)
        //console.log("ES.... VACACIONES");
      
    }

    else if(verifyLicensia==1)
    {
      setNombre(pn+" "+pa) + setCargo(cargo) + setIduser(pid) + setSubgrupo(subgrupo) + setColorBorder("#00094B") + setTipoEvento("LICENSIA") + setModal2(!modal2)
        //console.log("ES.... LICENSIA");
       
    }

    else if(verifyBreaks==1)
    {
      setNombre(pn+" "+pa) + setCargo(cargo) + setIduser(pid) + setSubgrupo(subgrupo) + setColorBorder("#2f800d") + setTipoEvento("DESCANSO") + setModal2(!modal2)
        //console.log("ES.... LICENSIA");
       
    }
    
    else{

      setNombre(pn+" "+pa) + setCargo(cargo) + setIduser(pid) + setSubgrupo(subgrupo) + setColorBorder("#DADADA")  + setModal1(!modal1)
      //console.log("Normal");
  
    }
    
    
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

 


  const exist = (pid,pg,gn,pn,cargo,pa,subgrupo) =>{


    testPermissions(pid)
    testIncapacitys(pid)
    testRecess(pid)
    testLicenses(pid)
    testBreaks(pid)


    return <ul className="ulMain" key={pid}>
      <li className={permissions == 1 ? "liMain-var1" :  incapacitado == 1 ? "liMain-var2" : licensia == 1 ? "liMain-var3" : vacaciones == 1 ? "liMain-var4" : breaks == 1 ? "liMain-var5" : "liMain"} key={pid} onClick={() => verificar(pid,pn,pa,subgrupo,cargo) }>
        {pn +" "+pa}
      </li>
    </ul>

  }
  


  //-------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    obtenerListadoGrupos();
  }, []);

  useEffect(() => {
    getPeople();
  }, []);


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




 

  return (
    <>

      

    
      {createPortal(
        <ModalPlanner1 estado={modal1} cambiarEstado={setModal1} nombres={nombre} cargo={cargo} fechaPlaner={startDate} iduser={idUser} subGrupo={subGrupo} color={colorBorder}/>,
        document.querySelector("#portal")
      )}

      {createPortal(
        <ModalPlanner3 estado={modal2} cambiarEstado={setModal2} nombres={nombre} cargo={cargo} fechaPlaner={startDate} iduser={idUser} subGrupo={subGrupo} color={colorBorder} tipo ={tipoEvento} />,
        document.querySelector("#portal")
      )} 

      <div className="barra">
      
        <img src={tropa} alt="tropa" className="imgTropa" />
        <div className="content-listado">
        <div className="calendar">
        <DatePicker
          className="picker"
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          showMonthDropdown
        />
      </div>
  
          {
            //Ciclo que trae el numero de grupos del sistema
            data?.map((group)=>(
              

                <div className="hola" key={group._id}>
                  {
                    
                    //Ciclo que trae todos los usuarios del sistema 
                    data1?.map((payroll)=>(
                    <div className="hol" key={payroll._id}>
                      {
                             
                           payroll.grupo == group.nombre ?  exist(payroll._id,payroll.group,group.nombre,payroll.nombres,payroll.cargo,payroll.apellidos,payroll.subGrupo) : null
                          
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
    </>
  );
}
