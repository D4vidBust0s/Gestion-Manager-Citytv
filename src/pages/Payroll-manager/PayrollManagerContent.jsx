/* ESTILOS */
import './PayrollManagerContent.css'

/* DEPENDENCIAS */
import {useState,useEffect} from 'react';
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

/* VARIABLES */
let idGroupGlobal = "";


export default function PayrollManagerContent() {

   
// estado para la ventana modal de agregar usuario
  const [modal1, setModal1] = useState(false); 

  //Estados para los grupos
  const [data, setData] = useState([]);

  //Estado para el payroll completo
   //Estados para los grupos
   const [data2, setData2] = useState([]);

  //Estados para recuperar la informacion de un trabajador
  const [data3, setData3] = useState([]);

  //Estado para la persona seleccionada
  const [selectPerson, setSelectPerson] = useState("-----");

  //Estado para guardar el id de la persona seleccionada, para usarlo en el momento de actualizacion o eliminacion
  const [selectPersonId, setSelectPersonId] = useState();

  //Estado para guardar el id del grupo de  la persona seleccionada,
  const [selectPersonIdgroup, setSelectPersonIdgroup] = useState();

  //Estado para definir si se va a agregar editar o eliminar
  const [operation, setOperation]= useState("0");

  
  //FUNCIONES
  //Funcion que obtiene la data de la api - listado de grupos
  const obtenerListadoGrupos = async () => {
    return await axios
      .get("http://localhost:3000/api/groups")
      .then((response) => setData(response.data));
  };

 //Funcion para obtener la data de  la persona
 const obtenerSinglePayroll = async () => {
  return await axios
    .get("http://localhost:3000/api/payroll/"+selectPersonId)
    .then((response) => setData3(response.data))
  };


 //Funcion para actualizar el Usuario seleccionado en el label de la parte inferior
 const operationPerson = (id,name, apellido,idGroup,e) =>{
   setSelectPerson(name + " " + apellido);
   setSelectPersonId(id);
   setSelectPersonIdgroup(idGroup);


    //Aqui lo que hago es cambiar los estilos para el iems seleccionado;
    if (e.target.classList=="ListLI") 
    {

      let aux = document.getElementsByClassName("active2");

      for (let index = 0; index < aux.length; index++) 
      {
        aux[index].classList.remove("active2");
      }

      e.target.classList.add("active2");
    }
 };


  //Funcion que obtiene la data de la api - listado de grupos
  const showUsersGroup = async (groupID,e) => {

    //guardo el id de grupo en una variable global para posteriores usos
    idGroupGlobal = groupID;

    //reinicio el nombre del usuario previamente seleccionado
    setSelectPerson("-----");

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

//funcion que se ejecuta cuando se da click en el boton de agreagar
const addPerson = () =>{
  setOperation(0);
  setModal1(!modal1);
}


 //Funcion para editar el usuario seleccionado
 const EditPerson = () =>{

  if (selectPerson == "-----" ) {
    toast.error("Para editar una persona del listado, primero debe seleccionarla dando clic");
  } 

  else{
    if(selectPersonId)
        {
          setModal1(!modal1);
          obtenerSinglePayroll();
          setOperation(1);
        }
  }
   
 };

 //eliminar Registro completo en rotations manager
 const deleteFromRm = async ()=>{

    await axios.delete("http://localhost:3000/api/rotationsmanager/delsimplereg/" + selectPersonId);
 }

 //eliminar Registro completo en rotations manager fines de semana
 const deleteFromRmFS = async ()=>{

  await axios.delete("http://localhost:3000/api/rotationsmanager-fs/delsimplereg/" + selectPersonId);
}


//Funcion que al ser ejecutada me permite actualizar el nuevo numero de usuarios en rotationsmanager y rotationsmangerFS
const updateTotalGrupo = async ()=>{

  let totalGroupsActual = 0;
  
  data2?.map((rm)=>(
      String(rm.activo) == "true" ? totalGroupsActual ++ :null
     ));

     totalGroupsActual = totalGroupsActual-1;

      await axios.put("http://localhost:3000/api/rotationsmanager/uptdatetotalgroup/" + idGroupGlobal,{
        nuevovalor: totalGroupsActual,
      }); 

      await axios.put("http://localhost:3000/api/rotationsmanager-fs/uptdatetotalgroup/" + idGroupGlobal,{
        nuevovalor: totalGroupsActual,
      }); 
  
}


   //Eliminar grupo
   const deletePerson = async () => {
    if (selectPerson == "-----" || idGroupGlobal == "") {
      toast.error("Para eliminar una persona del listado, primero debe seleccionar un grupo y luego dar clic en el listado");
    } 
    else 
    {
      Swal.fire({
        title: "¿Realmente desea eliminar a "+selectPerson+"?",
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
          EliminarPerson();
          //Swal.fire("Registro eliminado del sistema", "", "success");
        }
      });
    }
  };

  const EliminarPerson = async ()=>{

    
    await axios.delete("http://localhost:3000/api/payroll/" + selectPersonId)
    .then((response) => obtenerListadoGrupos())
    .then((response) => setSelectPerson("-----"))
    .then((response) => obtenerListadoPayroll())
    .then((response) => deleteFromRm())
    .then((response) => deleteFromRmFS())
    .then((response) => updateTotalGrupo())
    .then((response) => toast.success("Usuario eliminado del sistema correctamente"))
    
     
  }

 


  





  useEffect(() => {
    obtenerListadoGrupos();
  }, []);
 
 
   //Funcion que obtiene la data de la api - listado todos los usurios del sistema
   const obtenerListadoPayroll = async () => {
     return await axios
       .get("http://localhost:3000/api/payroll")
       .then((response) => setData2(response.data));
   };
 
   useEffect(() => {
    obtenerListadoPayroll();
  }, []);

  return (
    <>
    <Toaster />
    {createPortal(<ModalBase1 estado={modal1} 
                              cambiarEstado={setModal1} 
                              title="Gestión del personal" 
                              content={<ModalPayrollManager 
                              id={selectPersonId} 
                              op={operation} 
                              idGrupo ={selectPersonIdgroup}/>}/>,document.querySelector('#portal'))}

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

         

           
          <div className="seccionButons">
          <div className="person">{selectPerson}</div>
                <div className="containerSingleButtom" onClick={() => addPerson()}>
                  <img src={Plus} alt="pencil" className='img-butons'/>
                </div>
                <div className="containerSingleButtom">
                 <img src={Edit} alt="plus" className='img-butons' onClick={()=>EditPerson()}/>
                </div>
                <div className="containerSingleButtomDel">
                 <img src={Delete} alt="trash" className='img-butons' onClick={()=>deletePerson()}/>
                </div>
              </div>
        </div>

        <div className="sectionListPayroll">
        <h3 className="subTitulo2">Listado de personas del grupo</h3>
          <ul className='ListUL'>

            {
               data2.map((payroll,index)=>(

                payroll.cargo != "USERBALANCER" ?
                <div className="sb" key={index}>
                  <div className="subGrupo">{payroll.subGrupo}</div>
                   <li className={payroll.activo==false?'ListLI2':'ListLI'} key={payroll._id} onClick={(e)=> operationPerson(payroll._id,payroll.nombres,payroll.apellidos,payroll.grupoID,e)}>{payroll.nombres} {payroll.apellidos}</li>
                </div>
                :null
               ))
            } 
          </ul>
        </div>
      </div>
    </>
  )
}
