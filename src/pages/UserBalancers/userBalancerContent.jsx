
/* ESTILOS */
import './userBalancer.css'

/* DEPENDENCIAS */
import {useState,useEffect} from 'react';
import axios from 'axios';
import {Toaster, toast} from 'react-hot-toast';
import Swal from "sweetalert2";

/* IMAGENES */
import Plus from '../../assets/Plus.svg';
import Menos from '../../assets/menos.svg'

const userBalancerContent = () => {

    //Estados para los grupos
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);

  
  const [GLOBALIDGRUPO, setGLOBALIDGRUPO] = useState([]);

//VARIABLES
let aux;
let idUserGlobal = "";
  


  //FUNCIONES
  //Funcion que obtiene la data de la api - listado de grupos
  const obtenerListadoGrupos = async () => {
    return await axios
      .get("http://localhost:3000/api/groups")
      .then((response) => setData(response.data));
  };

  //Funcion que obtiene la data de la api - listado de grupos
  const showUsersGroup = async (groupID,e) => {

    
    setGLOBALIDGRUPO(groupID);
   

     //Aqui lo que hago es cambiar los estilos para el iems seleccionado;
     if (e.target.classList=="contentForma") 
     {
 
       let aux = document.getElementsByClassName("activo");
 
       for (let index = 0; index < aux.length; index++) 
       {
         aux[index].classList.remove("activo");
       }
 
       e.target.classList.add("activo");
     }


    return await axios
      .get("http://localhost:3000/api/payroll/idGroup/"+groupID)
      .then((response) => setData2(response.data));
      
  };

   //Funcion que obtiene la data de la api - payroll
   const getPayroll = async () => {

    return await axios
      .get("http://localhost:3000/api/payroll/")
      .then((response) => setData2(response.data));
      
  };

  //Funcion que agrega un registro del usuario en rotations manager
  const enviar = async (iduser)=>{

    await axios.post("http://localhost:3000/api/rotationsmanager/", {
  
       nombreusuario: "UserBalancer",
       userid: iduser,
       groupname: GLOBALIDGRUPO,
       groupid: GLOBALIDGRUPO,
       schemaname:"------------",
       schemaid:"------------",
       totalschema:0,
       totalgroup:0,
       actual:0,
       dayKey: new Date().setHours(0,0,0,0)
      });
  }

  //Funcion que agrega un registro del usuario en rotations managerFS
  const enviarFS = async (iduser)=>{

    await axios.post("http://localhost:3000/api/rotationsmanager-fs/", {
  
       nombreusuario: "UserBalancer",
       userid: iduser,
       groupname: GLOBALIDGRUPO,
       groupid: GLOBALIDGRUPO,
       schemaname:"------------",
       schemaid:"------------",
       totalschema:0,
       totalgroup:0,
       actual:0,
       dayKey: new Date().setHours(0,0,0,0)
      });
  }

  //Funcion que agrega un usuario balancer a un grupo con su id de grupo respectivo
  const addUserBalancer = async ()=>
  {
    let contador = 0;

    if(GLOBALIDGRUPO!="")
    {
      await axios.post("http://localhost:3000/api/payroll/", {

      Nombres: "UserBalancer",
      Apellidos: "",
      Edad: "",
      FechaDeNacimiento: "",
      Genero: "",
      EstadoCivil: "",
      CelularPrioritario: "",
      CelularAux: "",
      TelefonoFijo: "",
      DireccionResidencia: "",
      Email: "",
      Cc: "",
      Pasaporte: "",
      TarjetaProfesional: "",
      Cargo: "USERBALANCER",
      Grupo: GLOBALIDGRUPO,
      GrupoID: GLOBALIDGRUPO,
      FechaIngreso: new Date(),
      RH: "",
      ContactoPrincipal: "",
      ContactoAux: "",
      Activo: true,
      Mainplanner: "",
      SubGrupo:0 
  })
  .then((response) => aux = response.data._id)
  .then(((response) => enviar(aux)))
  .then(((response) => enviarFS(aux)))
  .then(getPayroll); 
  
      
    }

    else{
      toast.error("No ha seleccionado un grupo. Para agregar user balancers al sistema, primero seleccione el grupo al que lo va a agregar");
    }
    
    
  }

  const eliminar =async ()=>{
   
     
        await axios.delete("http://localhost:3000/api/payroll/userbalancer/"+idUserGlobal)

        await axios.delete("http://localhost:3000/api/rotationsmanager/" + idUserGlobal);

        await axios.delete("http://localhost:3000/api/rotationsmanager-fs/"+idUserGlobal)
        .then(getPayroll); 
      

      
  }


  const delUserBalancer = async ()=>
  {

    if(idUserGlobal!="")
    {

    Swal.fire({
      title: "¿Realmente desea eliminar el userBalancer seleccionado?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "No estoy seguro",
      denyButtonText: `Confirmar`,
      footer: '<h6>Gestión Manager Citytv</h6>',
      
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        //Swal.fire("Saved!", "", "success");
      } else if (result.isDenied) 
      {
        eliminar();
        //Swal.fire("Registro eliminado del sistema", "", "success");
      }
    });
    
    }

    
    else{
      toast.error("Para eliminar un UserBalancer primero debe seleccionarlo");
   }
  }


 const changeID  = (idUser,e)=>{

    //Guardamos el id de usuario o del payroll en una variable global
     idUserGlobal=idUser;

     toast.success(idUserGlobal);

     //Aqui lo que hago es cambiar los estilos para el iems seleccionado;
     if (e.target.classList=="ListLI") 
     {
 
       let aux = document.getElementsByClassName("activo11");
 
       for (let index = 0; index < aux.length; index++) 
       {
         aux[index].classList.remove("activo11");
       }
 
       e.target.classList.add("activo11");
     }
 }
 

  

  useEffect(() => {
   obtenerListadoGrupos();
 }, []);

 


  return (
    <>
     <Toaster />
    <div className="contenPAYROLL">
    <h3 className="subTitulo1">Grupos o Áreas </h3>
      <div className="sectionAdd">
  
        <ul className='ulListado'>
            {
                data?.map((group)=>(
                  <li key={group._id} className="contentForma" onClick={(e)=>showUsersGroup(group._id,e)}>
                    <img src={group.logo} alt={group.nombre} className='img-cam'/>
                    {group.nombre}
                  </li>
                ))
            }

        </ul>

       

         
        
      </div>

      <div className="sectionListPayroll">
      <h3 className="subTitulo2">Usuarios inactivos o desactivados</h3>
        <ul className='ListUL2'>

          {
             data2.map((payroll,index)=>(
              payroll.activo==false ?
              <div className="sb" key={index} >
                <div className="subGrupo">{"*"}</div>
                 <li className='ListLI' key={payroll._id}> {payroll.nombres} {payroll.apellidos}</li>
              </div>
              : null
             ))
             
          } 
        </ul>

        <h3 className="subT">Usuarios para equilibrar el grupo</h3>
        <ul className='ListUL2'>
            
          {
             data2.map((payroll,index)=>(
              payroll.cargo=="USERBALANCER" && payroll.grupo == GLOBALIDGRUPO ?
              <div className="sb" key={index}>
                <div className="subGrupo">{"*"}</div>
                 <li className='ListLI' key={payroll._id}  onClick={(e)=> changeID(payroll._id,e)}>{payroll.nombres} {payroll.apellidos}</li>
              </div>
              :null
             ))
             
          } 
        </ul>
        
      </div>
    </div>
    <div className="btns">
        <div className="mas" onClick={()=>addUserBalancer()}><img src={Plus} alt="Plus" className='img-plus'/></div>
        <div className="menos" onClick={()=>delUserBalancer()}><img src={Menos} alt="Plus" className='img-plus'/></div>
    </div>
    </>
  )
}

export default userBalancerContent
