/* ESTILOS */
import "./RotationsContent.css"

/* IMAGENES */
import dia from '../../assets/daily.png';
import Sunday from '../../assets/Sunday.png';
import Plus from '../../assets/Plus.svg';
import Edit from '../../assets/pencil.svg';
import Delete from '../../assets/trash.svg';
import Save from '../../assets/bxs-save.svg';
import Coffee from '../../assets/coffee.svg';

/* DEPENDENCIAS */ 
import DatePicker from 'react-datepicker';
import {useState, useEffect} from 'react';
import axios from 'axios'
import { useRef } from "react";
import {toast,Toaster} from 'react-hot-toast';
import Swal from "sweetalert2";

const RotationsContent = () => {

  /* Estados para los datepicker */
  const [startDate1, setStartDate1] = useState(new Date());
  const [endDate1, setEndDate1] = useState(new Date());
  const [startDate2, setStartDate2] = useState(new Date());
  const [endDate2, setEndDate2] = useState(new Date());
  const [data, setData] = useState([]);
  
  const [data4, setData4] = useState([]);
  const [data5, setData5] = useState([]);
  const [data6, setData6] = useState([]);
  const [data7, setData7] = useState([]);
  const [data8, setData8] = useState([]);

  const [coffeeES,setCoffeeES] = useState(false);
  const [coffeeFS,setCoffeeFS] = useState(false);

  


  const [titleDaily, setTitleDaily] = useState("------------------");
  const [titleFs, setTitleFs] = useState("------------------");

  const [newValueOne,setNweValueOne] = useState("");
  const [idRegES,setIdRegES] = useState();

  const [newValueTwo,setNweValueTwo] = useState("");
  const [idRegFS,setIdRegFS] = useState();

  const [order,setOrder] = useState(0);
  const [orderFS,setOrderFS] = useState(0);

  const [excluirES,setexcluirES]=useState(false);
  const [excluirFS,setexcluirFS]=useState(false);


  
  /* Variables */
  let aux = "";
  let contador = 0;
 

  /* Referencias */
  const groupsRef = useRef();
  const newEntresemana = useRef();
  const newFinsemana = useRef();
  const newOrder = useRef();
  const newOrderFS = useRef();
  const excluirESref = useRef();
  const excluirFSref = useRef();
  const pruebaRef = useRef();
  const descandoESref= useRef();
  const descandoFSref = useRef();

 
  
  //FUNCIONES
  //Funcion que obtiene la data de la api - listado de grupos
  const obtenerListadoGroups = async () => {
    return await axios
      .get("http://localhost:3000/api/groups")
      .then((response) => setData(response.data));
  };


  const obtenerListadoGroupsPorID = async ()=>{
    return await axios
    .get("http://localhost:3000/api/rotations/"+groupsRef.current.value)
    .then((response) => setData4(response.data));
  }

  const obtenerListadoGroupsPorIDFs = async ()=>{
    return await axios
    .get("http://localhost:3000/api/rotations/fs/"+groupsRef.current.value)
    .then((response) => setData5(response.data));
  }

  
  const getPeopleOfGroup = async ()=>{
    return await axios
    .get("http://localhost:3000/api/payroll/people/"+aux)
    .then((response) => setData6(response.data));  

  }

  //Traer todos los registros de los usuarios
const getAllPayroll= async () => {
    
  return await axios
    .get("http://localhost:3000/api/payroll/")
    .then((response) => setData7(response.data));
  
}

//Traer todos los registros de rotationsManager
const getAllRotationsManager= async () => {
    
  return await axios
    .get("http://localhost:3000/api/rotationsmanager/")
    .then((response) => setData8(response.data));
}

//Eliminar todos los registros de rotationsManager
const delAllRotationsManager= async () => {
    
  return await axios
    .delete("http://localhost:3000/api/rotationsmanager/")
}

  

   
  const agregar = async ()=>{
    
    //Validaciones

    if(groupsRef.current.value=="none")
    {
      toast.error("Antes de agregar un esquema seleccione un grupo de la lista");
      groupsRef.current.focus();
    }

    else if(newEntresemana.current.value=="")
    {
      toast.error("Debe especificar un nombre para el registro");
      newEntresemana.current.focus();
    }

    else if(newEntresemana.current.value=="------------------")
    {
      toast.error("Debe especificar un nombre valido para el nombre del esquema");
      newEntresemana.current.focus();
    }

    else if(groupsRef.current.value=="")
    {
      toast.error("Para agregar o editar un registro, primero debe seleccionar un grupo de la lista ");
      groupsRef.current.focus();
    }

    else if(startDate1== "")
    {
      startDate1.current.focus();
      toast.error("Debe especificar una hora de incio");
    }

    else if(endDate1== "")
    {
      endDate1.current.focus();
      toast.error("Debe especificar una hora final");
    }

    else if(newOrder.current.value== "")
    {
      newOrder.current.focus();
      toast.error("Debe especificar un número que defina el orden de la rotación");
    }

    else if(coffeeES == true && excluirES == true)
    {
      toast.error("¿Descanso Trasversal entres semana?")
    }

    else{

      
      await axios.post("http://localhost:3000/api/rotations/", {
        nombre: newEntresemana.current.value,
        hinicio: startDate1,
        hfin: endDate1,
        grupoid: groupsRef.current.value,
        tipo: "Entre Semana",
        order: parseInt(newOrder.current.value),
        excluir: excluirES,
        descanso: coffeeES

        /*
        programas: [
          {
            //"ID_Nombre":program1Ref.current.value,
          },
        ],
        */

       
      });

      obtenerListadoGroupsPorID();
      obtenerListadoGroupsPorIDFs();
      newEntresemana.current.value="";
      setOrder("");
      setNweValueOne("");
      setexcluirES(false);
      toast.success("Registro agregado correctamente");

    }
    
   
  }

  const agregarFS = async ()=>{
    
    //Validaciones

    if(groupsRef.current.value=="none")
    {
      toast.error("Antes de agregar un esquema seleccione un grupo de la lista");
      groupsRef.current.focus();
    }

    else if(newFinsemana.current.value=="")
    {
      toast.error("Debe especificar un nombre para el registro");
      newFinsemana.current.focus();
    }

    else if(newFinsemana.current.value=="------------------")
    {
      toast.error("Debe especificar un nombre valido para el nombre del esquema");
      newFinsemana.current.focus();
    }

    else if(groupsRef.current.value=="")
    {
      toast.error("Para agregar o editar un registro, primero debe seleccionar un grupo de la lista ");
      groupsRef.current.focus();
    }

    else if(startDate2== "")
    {
      startDate2.current.focus();
      toast.error("Debe especificar una hora de incio");
    }

    else if(endDate2== "")
    {
      endDate2.current.focus();
      toast.error("Debe especificar una hora final");
    }

    else if(newOrderFS.current.value== "")
    {
      newOrderFS.current.focus();
      toast.error("Debe especificar un número que defina el orden de la rotación para fines de semana");
    }

    else if(coffeeFS == true && excluirFS == true)
    {
      toast.error("¿Descanso Trasversal en Fin de semana?")
    }

    else{

      
      await axios.post("http://localhost:3000/api/rotations/", {
        nombre: newFinsemana.current.value,
        hinicio: startDate2,
        hfin: endDate2,
        grupoid: groupsRef.current.value,
        tipo: "Fin de Semana",
        order: parseInt(newOrderFS.current.value),
        excluir: excluirFS,
        descanso: coffeeFS
      });

      obtenerListadoGroupsPorID();
      obtenerListadoGroupsPorIDFs();
      newFinsemana.current.value="";
      newOrder.current.value="";
      setOrderFS("");
      setNweValueTwo("");
      setexcluirFS(false);
      toast.success("Registro agregado correctamente");

    }
    
   
  }

  const enviar = async (usNombre,usApellido,id,grupo,grupoid,scName,scID,ts,tg,ac)=>{

    await axios.post("http://localhost:3000/api/rotationsmanager/", {
  
        nombreusuario: usNombre +" "+usApellido,
        userid: id,
        groupname: grupo, 
        groupid: grupoid,
        schemaname: scName,
        schemaid: scID,
        totalschema: ts,
        totalgroup: tg,
        actual: ac
      });
  
      console.log("Agregado...");
      
  }

  


  const tarea = () =>{

    if(data7.length>0 && data8.length==0)
    {
      //procedemos a agregar por primera vez los usuarios del sistema dentro de ROTATIONSMANAGER en mongoDB
     
      data7?.map((item)=>(
        enviar(item.nombres,item.apellidos,item._id,item.grupo,item.grupoID,"NombreSchema","IDSCHEMA",0,0,0)
      ))

      toast.success("Se agregaron por primera vez los datos para el funcionamiento de las rotaciones semanales automáticas" + data7.length +"  "+ data8.length );
      getAllRotationsManager();
      
    }
    
    else if(data7.length>0 && data8.length<data7.length || data8.length>data7.length ){
      //Como es menor, es por que se agregaron nuevos usuarios y no estan actualizados en la coleccion ROTATIONSMANAGER
      //por tal razon procedo a borrar los datos de la tabla y a escribierlos nuevamente

      delAllRotationsManager();

      
      data7?.map((item)=>(
        enviar(item.nombres,item.apellidos,item._id,item.grupo,item.grupoID,"NombreSchema","IDSCHEMA",0,0,0)
      ))

      toast.custom("Se detectó un cambio en Payroll, Gestionmanager optimizó la base de datos " + data7.length +"  "+ data8.length);
      
    }

  }

  const programClick = () =>
  {

    obtenerListadoGroupsPorID();
    obtenerListadoGroupsPorIDFs();

    //Funcion para obtener el nombre del grupo segun id y guardarlo en aux
    data?.map((item)=>(item._id==groupsRef.current.value?aux = item._id:null))


    getPeopleOfGroup();
    setTitleDaily("------------------");
    setTitleFs("------------------");

    setNweValueOne("");
    setOrder("");
    setNweValueTwo("");
    setOrderFS("");
    setexcluirES(false);
    setexcluirFS(false);
    setCoffeeES(false);
    setCoffeeFS();
    
    tarea();
  }

  const callItem1 =  (Nombres,horaInicio,horaFinal,id,order,ex,descanso)=>{

    //Cambio el nombre del label
    setTitleDaily(Nombres);
    
    //seteamos la informacion en los estados de los controles de fecha;
    setStartDate1(new Date(horaInicio));
    setEndDate1(new Date(horaFinal))

    //Actualizo el id en un estado para usarlo posteriormente en actualizaciones
    setIdRegES(id); 
    setNweValueOne(Nombres);

    //actualizo el numero de Order
    setOrder(order);

    //actualizo excluir ES
    setexcluirES(ex)

    //actualizo descanso si lo es
    setCoffeeES(descanso);

  }

  const callItem2 =  (Nombres,horaInicio,horaFinal,id,order,ex,descanso)=>{

    //Cambio el nombre del label
    setTitleFs(Nombres);
    
    //seteamos la informacion en los estados de los controles de fecha;
    setStartDate2(new Date(horaInicio));
    setEndDate2(new Date(horaFinal))

    //Actualizo el id en un estado para usarlo posteriormente en actualizaciones
    setIdRegFS(id); 
    setNweValueTwo(Nombres);

    //actualizo el numero de Order
    setOrderFS(order);

    //actualizo excluir
    setexcluirFS(ex);

    //actualizo descanso si lo es
    setCoffeeFS(descanso);

  }


  const Cambiar = (e)=>{
    setNweValueOne(e.target.value)
  }

  const Cambiar2 = (e)=>{
    setNweValueTwo(e.target.value)
  }

  const Cambiar3 = (e)=>{
    setOrder(e.target.value)
  }

  const Cambiar4 = (e)=>{
    setOrderFS(e.target.value)
  }

  const Cambiar5 = ()=>{
    setexcluirES(!excluirES)
  }

  const Cambiar6 = ()=>{
    setexcluirFS(!excluirFS)
  }

  const cambiarDescansoES = ()=>{
    setCoffeeES(!coffeeES);
  }

  const cambiarDescansoFS = ()=>{
    setCoffeeFS(!coffeeFS);
  }

  const updateES = async ()=>{

    //Hago una validacion sencilla antes de actualizar
    if(newValueOne=="")
    {
      newEntresemana.current.focus();
      toast.error("Para actualizar la información, debe especificar un nombre para el Schema");
    }

    else if(newOrder.current.value== "")
    {
      newOrder.current.focus();
      toast.error("Debe especificar un número que defina el orden de la rotación");
    }

    else if(coffeeES == true && excluirES == true)
    {
      toast.error("¿Descanso Trasversal entre semana?")
    }

    else{

       /* Llamo la api y le envio la información para realizar la operacion de actualizacion */
        
       await axios.put("http://localhost:3000/api/rotations/", {
        id_registro: idRegES,
        nombreActual: titleDaily, 
        nuevaHoraInicio: startDate1,
        nuevaHoraFinal: endDate1,
        nuevoNombre: newValueOne,
        order: parseInt(newOrder.current.value),
        excluir: excluirES,
        descanso: coffeeES
    });

    

    obtenerListadoGroupsPorID();
    setNweValueOne("");
    setOrder("");
    setexcluirES(false);
    toast.success("Datos entre semana actualizados correctamente");
    }

    
  }

  const updateFS = async ()=>{

    //Hago una validacion sencilla antes de actualizar
    if(newValueTwo=="")
    {
      newFinsemana.current.focus();
      toast.error("Para actualizar la información, debe especificar un nombre para el Schema");
    }

    else if(newOrderFS.current.value== "")
    {
      newOrderFS.current.focus();
      toast.error("Debe especificar un número que defina el orden de la rotación para fines de semana");
    }

    else if(coffeeFS == true && excluirFS == true)
    {
      toast.error("¿Descanso Trasversal en Fin de semana?")
    }

    else{

       /* Llamo la api y le envio la información para realizar la operacion de actualizacion */
        
       await axios.put("http://localhost:3000/api/rotations/", {
        id_registro: idRegFS,
        nombreActual: titleFs, 
        nuevaHoraInicio: startDate2,
        nuevaHoraFinal: endDate2,
        nuevoNombre: newValueTwo,
        order: parseInt(newOrderFS.current.value),
        excluir: excluirFS,
        descanso: coffeeFS
        
    });

    obtenerListadoGroupsPorIDFs();
    setNweValueTwo("");
    setOrderFS("");
    setexcluirFS(false);
    toast.success("Datos de fin de semana actualizados correctamente");
    }

    
  }

  const deleteES = async ()=>{
    Swal.fire({
      title: "¿Realmente desea eliminar el esquema?",
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
        EliminarRegistro();
        //Swal.fire("Registro eliminado del sistema", "", "success");
      }
    });
  }

  const DefinirDescanso = ()=>{
    setCoffeeES(!coffeeES);
  }

  const DefinirDescansoFs = ()=>{
    setCoffeeFS(!coffeeFS);
  }

  const EliminarRegistro = async ()=>{

    //Simplemete elimino el registro con el id que ya conocemos
    await axios.put("http://localhost:3000/api/rotations/delete/", {
      idreg: idRegES,
      
    });

    obtenerListadoGroupsPorID();
    setNweValueOne("");
    setOrder("");
    setexcluirES(false);
  }

  const deleteFS = async ()=>{
    Swal.fire({
      title: "¿Realmente desea eliminar el esquema de fin de semana?",
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
        EliminarRegistro2();
        //Swal.fire("Registro eliminado del sistema", "", "success");
      }
    });
  }

  const save = async ()=>{
    toast.success("Aqui se deberia guardar");
  }

  const EliminarRegistro2 = async ()=>{

    //Simplemete elimino el registro con el id que ya conocemos
    await axios.put("http://localhost:3000/api/rotations/delete/", {
      idreg: idRegFS,
      
    });

    setNweValueTwo("");
    setOrderFS("");
    obtenerListadoGroupsPorIDFs();
    setexcluirFS(false);
  }

   const prueba = (id,nombre)=>{
    aux = nombre;
    return id;
   }


   const actualizar = ()=>{
    toast.success("Aqui se deberia guardar el item seleccionado para entre semana");
   }

   const actualizarFS = ()=>{
    toast.success("Aqui se deberia guardar el item seleccionado para FIN DE SEMANA");
   }

  //----------------------------------------------------------------------------------------------------------------------------------


  useEffect(() => {
    obtenerListadoGroups();
  }, []);

  useEffect(() => {
    getAllPayroll();
  }, []);

  useEffect(() => {
    getAllRotationsManager();
  }, []);


  

  /*
  useEffect(() => {
    obtenerHoraItemPorID();
  }, []);
*/
 

  return (
    <div className="contentRotations">
      <Toaster />
      <div className="asignations">
        <ul>
      {
        /*

            PARA LA PROXIMA
            -------------------------------------------------------------


           Ahora debo crear una coleccion que administre la rotacion de turnos y que se actualice automaticamente
           al igual que se deben llenar los combobox con los esquemas de cada grupo para que sea coherente la 
           informacion que se presenta al usuario.

           para ello antes de hacer algo aqui debo crear la operacion que lleve el turno que deberia
           llevar cada usuario, luego de eso simplemete seria traerlo y llenarlos en los combobox

           BENDICIOJNES PARA LA PROXIMA !!!!!!

      */

      }


          {
            data6?.map((item)=>(
              <li className="asiganation_li" key={item._id}>
              {item.nombres + " " + item.apellidos} 
              <span className="asiganations_option">
              
                <select className="asignation_select" onChange={() => actualizar()}>
                  
                    {
                      
                         data4?.map((item)=>(
                          <option key={item._id}>
                             {item.Nombre}
                          </option>
                        ))
                        
                      
                    }
                  
                </select>

                <select className="asignation_select" onChange={() => actualizarFS()}>
                {
                      
                      data5?.map((item)=>(
                       <option key={item._id}>
                          {item.Nombre}
                       </option>
                     ))
                     
                   
                 }
                </select>

                <span className="fijoSpan">Fijo</span><input type="checkbox"  className="checkFijo"/>
                
                
              </span>
              
          </li>
            ))
              
          }
          
        </ul>

       
      </div>

      
    
        
       
        
      


      <div className="subTitulo">
        Grupos
        <select className="inputDir" onChange={()=> programClick()} ref={groupsRef}>
        <option key={0} value={"none"}>{"-----------------------------------"}</option>
          {
            data?.map((program)=>(
              <option key={program._id} value={program._id}>{program.nombre}</option>
            )) 
          }
        </select>
      </div>
      
      <div className="sectionDaily">
        <img src={dia} alt="" className="imgDaily"/>
        <h2 className="seleccionadoDaily">{titleDaily}</h2>
        <div className="mainCajas">
          <div className="subTitulo">Esquema</div>
          <div className="caja1">
              {
                data4?.map((nombres)=>(
                  <p className="item" key={nombres._id} onClick={()=> callItem1(nombres.Nombre,nombres.HoraInicio,nombres.HoraFinal,nombres._id,nombres.Order,nombres.Excluir,nombres.Descanso)}>{nombres.Nombre}<span className="id">P : {nombres.Order}</span></p>
                  
                ))
              }
            
          </div>

        </div>

       
        <div className="mainCajas">
          <div className="subTitulo">Horario</div>
          <div className="caja2">
            <div className="horaIn">
            <DatePicker
            className ='input'
            selected={startDate1}
            onChange={(date) => setStartDate1(date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="H Inicio"
            dateFormat="h:mm aa"
            />
              <DatePicker
            className ='input'
            selected={endDate1}
            onChange={(date) => setEndDate1(date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="H Final"
            dateFormat="h:mm aa"
            />
            </div>
          </div>
        </div>
        
        <div className="mainCajas">
          <div className="subTitulo">Acciones</div>
          <div className="caja4">
            
          <div className="containerSingleButtom">
              <img
                src={Plus}
                alt="pencil"
                className="img-butons"
                onClick={agregar}
              />
            </div>
            <div className="containerSingleButtom">
              <img
                src={Edit}
                alt="plus"
                className="img-butons"
                onClick={updateES}
              />
            </div>
            <div className="containerDeleteButtom">
              <img
                src={Delete}
                alt="trash"
                className="img-butons"
                onClick={deleteES}
              />
            </div>

            <div className={coffeeES==true?"containerBreak2":"containerBreak"}>
              <img
                src={Coffee}
                alt="Break"
                className="img-butons"
                onClick={DefinirDescanso}
              />
            </div>

            <input type="checkbox" className="checkHidden" checked={coffeeES} onChange={cambiarDescansoES} ref={descandoESref}/>

          </div>
          <input type="text" name="nuevoEntre"  className="inputDir3" ref={newEntresemana} value={newValueOne} placeholder={titleDaily} onChange={Cambiar}/>
          <input type="text" name="nuevoEntre"  className="inputDir4" ref={newOrder} value={order} placeholder={titleDaily} onChange={Cambiar3}/>
          <span className="excluir">Turno transversal</span>
          <input className="check" ref={excluirESref} type="checkbox" checked={excluirES} onChange={Cambiar5}/>
        </div>

      </div>

      
      {/* ********************************************************************************************** */}



      <div className="sectionSunday">
        <img src={Sunday} alt="" className="imgSunday"/>
        <h2 className="seleccionadoSunday">{titleFs}</h2>
        <div className="mainCajas">
          <div className="subTitulo">Esquema</div>
          <div className="caja1">

             {
                data5?.map((nombres)=>(
                  <p className="item" key={nombres._id} onClick={()=> callItem2(nombres.Nombre,nombres.HoraInicio,nombres.HoraFinal,nombres._id,nombres.Order,nombres.Excluir,nombres.Descanso)}>{nombres.Nombre}<span className="id">P : {nombres.Order}</span></p>
                ))
              }
           
          </div>
        </div>

        <div className="mainCajas">
          <div className="subTitulo">Horario</div>
          <div className="caja2">
            <div className="horaIn">
            <DatePicker
            className ='input'
            selected={startDate2}
            onChange={(date) => setStartDate2(date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="H Inicio"
            dateFormat="h:mm aa"
            
            
             
            />
              <DatePicker
            className ='input'
            selected={endDate2}
            onChange={(date) => setEndDate2(date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="H Final"
            dateFormat="h:mm aa"

            />
            </div>
          </div>
        </div>

        

        <div className="mainCajas">
          <div className="subTitulo">Acciones</div>
          <div className="caja4">
            
          <div className="containerSingleButtom">
              <img
                src={Plus}
                alt="pencil"
                className="img-butons"
                onClick={agregarFS}
              />
            </div>
            <div className="containerSingleButtom">
              <img
                src={Edit}
                alt="plus"
                className="img-butons"
                onClick={updateFS}
              />
            </div>
            <div className="containerDeleteButtom">
              <img
                src={Delete}
                alt="trash"
                className="img-butons"
                onClick={deleteFS}
              />
            </div>

            <div className={coffeeFS==true?"containerBreak2":"containerBreak"}>
              <img
                src={Coffee}
                alt="Breaks"
                className="img-butons"
                onClick={DefinirDescansoFs}
              />
             <input type="checkbox" className="checkHidden" checked={coffeeFS} onChange={cambiarDescansoFS} ref={descandoFSref}/>
            </div>

          </div>
         <input type="text" name="nuevoFinde" className="inputDir3" value={newValueTwo} ref={newFinsemana} placeholder={titleFs} onChange={Cambiar2} />
          <input type="text" name="nuevoFinde"  className="inputDir4" ref={newOrderFS} value={orderFS} placeholder={titleDaily} onChange={Cambiar4}/>
          <span className="excluir">Turno transversal</span>
          <input className="check" ref={excluirFSref} type="checkbox" checked={excluirFS} onChange={Cambiar6}/>
        </div>

      </div>
    </div>
  )
}

export default RotationsContent
