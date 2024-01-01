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

/* COMPONENTS */



export default function PayrollManagerContent() {

// estado para la ventana modal de agregar usuario
  const [modal1, setModal1] = useState(false); 

  //Estados para los grupos
  const [data, setData] = useState([]);

  //Estado para el payroll completo
   //Estados para los grupos
   const [data2, setData2] = useState([]);

  //Estado para la persona seleccionada
  const [selectPerson, setSelectPerson] = useState("-----");

  //Estado para guardar el id de la persona seleccionada, para usarlo en el momento de actualizacion o eliminacion
  const [selectPersonId, setSelectPersonId] = useState();

  //Estado para definir si se va a agregar editar o eliminar
  const [operation, setOperation]= useState("0");
 
  //FUNCIONES
  //Funcion que obtiene la data de la api - listado de grupos
  const obtenerListadoGrupos = async () => {
    return await axios
      .get("http://localhost:3000/api/groups")
      .then((response) => setData(response.data));
  };

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


 //Funcion para actualizar el Usuario seleccionado en el label de la parte inferior

 const operationPerson = async (id,name, apellido) =>{
   setSelectPerson(name + " " + apellido);
   setSelectPersonId(id);
 };

//funcion que se ejecuta cuando se da click en el boton de agreagar
const addPerson = () =>{
  setOperation(0);
  setModal1(!modal1);
}


 //Funcion para editar el usuario seleccionado
 const EditPerson = () =>{
   //alert(selectPersonId);
   if(selectPersonId)
   {
    setModal1(!modal1);
    setOperation(1);
   }
 };


   //Eliminar grupo
   const deletePerson = async () => {
    if (selectPerson == "-----" || selectPerson == "") {
      toast.error("Para eliminar una persona del listado, primero debe seleccionarla dando clic");
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

    await axios.delete("http://localhost:3000/api/payroll/" + selectPersonId);
      toast.error("No ha seleccionado ninguna persona para eliminar");

      obtenerListadoGrupos();

      toast.error("Usuario eliminado del sistema correctamente");
      obtenerListadoPayroll();
      setSelectPerson("");
  }

  //Funcion que obtiene la data de la api - listado de grupos
  const showUsersGroup = async (name_group) => {
    return await axios
      .get("http://localhost:3000/api/payroll/show/"+name_group)
      .then((response) => setData2(response.data));
  };



  return (
    <>
    <Toaster />
    {createPortal(<ModalBase1 estado={modal1} cambiarEstado={setModal1} title="Gestión del personal" content={<ModalPayrollManager id={selectPersonId} op={operation}/>}/>,document.querySelector('#portal'))}

      <div className="contenPAYROLL">
      <h3 className="subTitulo1">Grupos o Áreas </h3>
        <div className="sectionAdd">

         {
            data?.map((group)=>(
               <div className="contentForma" key={group._id} onClick={()=>showUsersGroup(group.nombre)}>
              <img src={group.logo} alt={group.nombre} className='img-cam'/>
              <div className="nameGroup" key={group._id}>{group.nombre}</div>
           </div>
            ))
         }

           
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
               data2.map((payroll)=>(
                <li className='ListLI' key={payroll._id} onClick={()=> operationPerson(payroll._id,payroll.nombres,payroll.apellidos)}>{payroll.nombres} {payroll.apellidos}</li>
               ))
            } 
          </ul>
        </div>
      </div>
    </>
  )
}
