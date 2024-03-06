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

//Variables Globales
let descanso = 0;           //Permisos o descansos
let incapacitado = 0;       //Incapacidades
let vacaciones = 0;         //Vacaciones o Recess
let licensia = 0;           //Licensias



export default function Barra() {
  
//estado para la ventana modal1 
 const [modal1, setModal1] = useState(false); 

 //Estados para la Data de groups
 const [startDate, setStartDate] = useState(new Date());
 const [data, setData] = useState([]);
 const [data1, setData1] = useState([]);
 const [data2, setData2] = useState([]);
 const [data3, setData3] = useState([]);
 const [data4, setData4] = useState([]);
 const [data5, setData5] = useState([]);

 const [nombre, setNombre] = useState("");
 const [cargo, setCargo] = useState("");
 const [idUser, setIduser] = useState("");
 const [subGrupo, setSubgrupo] = useState(0);
 const [color, ] = useState("#00094B");



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

  const getDescansos = async ()=>{
    return await axios
    .get("http://localhost:3000/api/permissions/")
    .then((response) => setData2(response.data));
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
  

  const testDescansos = (pid)=>{
      //Busco en el array de permisos si hay registros con el id del usuario 

      descanso=0;
      let std= new Date(startDate.setHours(0,0,0,0));
      let idregIni;
      let idregEnd;

      data2?.map((idReg)=>(
        
        idregIni = new Date (idReg.FechaInicio).setHours(0,0,0,0),
        idregEnd = new Date (idReg.FechaFinal).setHours(0,0,0,0),
        
        idReg.Id_Empleado == pid &&  std.toISOString() >= new Date (idregIni).toISOString()  && std.toISOString() <= new Date(idregEnd).toISOString()  ? descanso = 1 : null
        
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

 


  const exist = (pid,pg,gn,pn,cargo,pa,subgrupo) =>{

    
    testDescansos(pid)
    testIncapacitys(pid)
    testRecess(pid)
    testLicenses(pid)
    

    return <ul className="ulMain" key={pid}>
      <li className={descanso == 1 ? "liMain-var1" :  incapacitado == 1 ? "liMain-var2" : licensia == 1 ? "liMain-var3" : vacaciones == 1 ? "liMain-var4" : "liMain"} key={pid} onClick={() =>  setNombre(pn+" "+pa) + setCargo(cargo) + setIduser(pid) + setSubgrupo(subgrupo) + setModal1(!modal1) } >
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
    getDescansos();
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
        <ModalPlanner1 estado={modal1} cambiarEstado={setModal1} nombres={nombre} cargo={cargo} fechaPlaner={startDate} iduser={idUser} subGrupo={subGrupo} color={color}/>,
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
