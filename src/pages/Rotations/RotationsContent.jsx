/* ESTILOS */
import "./RotationsContent.css"

/* IMAGENES */
import dia from '../../assets/daily.png';
import Sunday from '../../assets/Sunday.png';
import Plus from '../../assets/Plus.svg';
import Edit from '../../assets/pencil.svg';
import Delete from '../../assets/trash.svg';
import Brush from '../../assets/brush.svg';
import Coffee from '../../assets/coffee.svg';
import Up from '../../assets/up.svg';
import Down from '../../assets/down.svg';
import Arrow from '../../assets/arrow3.svg';

/* DEPENDENCIAS */ 
import DatePicker from 'react-datepicker';
import {useState, useEffect} from 'react';
import axios from 'axios'
import { useRef } from "react";
import {toast,Toaster} from 'react-hot-toast';
import Swal from "sweetalert2";
import { string } from "prop-types";

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
  const [data9, setData9] = useState([]);
  const [data10, setData10] = useState([]);
  const [data11, setData11] = useState([]);
  const [data12, setData12] = useState([]);
  const [data13, setData13] = useState([]);
  const [data14, setData14] = useState([]);
  const [data15, setData15] = useState([]);

  const [data16, setData16] = useState([]);
  const [data17, setData17] = useState([]);

  const [coffeeES,setCoffeeES] = useState(false);
  const [coffeeFS,setCoffeeFS] = useState(false);

  const [checkLunes, setCheckLunes] = useState(true);


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
  
  const [idItem,setIdItem]=useState([]); 

  const [titleDailyUniversal, setTitleDailyUniversal]=useState("------------");  
  const [idRegUniversal, setIdRegUniversal] = useState("");

  


  


  
  /* Variables */
  let aux = "";
  let aux2;
  let pg = [];
  let ID;
  let orderactual;
  let itemGlobal;
 

  /* Referencias */
  const groupsRef = useRef();
  const newEntresemana = useRef();
  const newFinsemana = useRef();
  const newOrder = useRef();
  const newOrderFS = useRef();
  const excluirESref = useRef();
  const excluirFSref = useRef();
  const descandoESref= useRef();
  const descandoFSref = useRef();
  const fijoRef = useRef();

  const progRef = useRef();
  const secondaryRef = useRef();
  const customRef = useRef();
  const labelRef = useRef();
  const nameStackRef = useRef();
  const timeOutRef = useRef();
  const itemLoadRef = useRef();
  const durationRef = useRef();

 
  
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

  //Trae todos los registros de rotations
  const getAllRotations = async ()=>{
    return await axios
    .get("http://localhost:3000/api/rotations/")
    .then((response) => setData9(response.data));  

  }

  //Funcion que obtiene la data de la api - listado de programs
  const obtenerListadoPrograms = async () => {
    return await axios
      .get("http://localhost:3000/api/programs")
      .then((response) => setData10(response.data));
  };

  //Funcion que obtiene la data de la api - programas primarios
  const obtenerListadoProgramsPrimary = async () => {
    return await axios
      .get("http://localhost:3000/api/programs/primary")
      .then((response) => setData12(response.data));
  };

  //Funcion que obtiene la data de la api - Programas secundarios
  const obtenerListadoProgramsSecondary = async () => {
    return await axios
      .get("http://localhost:3000/api/programs/secondary")
      .then((response) => setData11(response.data));
  };

  //Funcion que obtiene la data de la api - Stacks segun id de programa
  const obtenerStacksByIdEsquema = async (id) => {
    return await axios
      .get("http://localhost:3000/api/stacks/"+id)
      .then((response) => setData13(response.data));
  };

  //Funcion que obtiene la data de la api - Stacks segun id de programa
  const obtenerStacks= async () => {
    return await axios
      .get("http://localhost:3000/api/stacks/")
      .then((response) => setData14(response.data));
  };

   //Funcion que obtiene la data de la api - Stacks segun id de programa
   const obtenerStackSaved= async () => {
    return await axios
      .get("http://localhost:3000/api/stacks-saved/")
      .then((response) => setData15(response.data));
  };

  //Traer todos los registros de rotationsManager
const getAllRotationsManagerFS= async () => {
    
  return await axios
    .get("http://localhost:3000/api/rotationsmanager-fs/")
    .then((response) => setData16(response.data));
}


//Actualizar el index del turno actual y el nombre des schema en rotationsManager para un usuario
const updateIndex= async (idUs,nameSchema,Actual,IdSchema,TotalSchema,TotalGrupo) => {
    
  return await axios
    .put("http://localhost:3000/api/rotationsmanager/update/"+idUs,{
      nameschema:  nameSchema,
      actual: Actual,
      idschema: IdSchema,
      totalsc: parseInt(TotalSchema),
      totalgr: parseInt(TotalGrupo),
    })
    
}

//Actualizar el index del turno actual y el nombre des schema en rotationsManagerFS para un usuario
const updateIndexFS= async (idUs,nameSchema,Actual,idSchema,TotalSchema,TotalGrupo) => {
    
  return await axios
    .put("http://localhost:3000/api/rotationsmanager-fs/update/"+idUs,{
      nameschema:  nameSchema,
      actual: Actual,
      idschema: idSchema,
      totalsc: parseInt(TotalSchema),
      totalgr: parseInt(TotalGrupo),
    }),getAllRotationsManagerFS();
    
}



//-------------------------------------------------------------------------------------------------------------------------------


//Actualizar el dia clave de todo un grupo segun id de grupo en rotationsManager
const updateDayKeyGroup= async (idG) => {
    
  return await axios
    .put("http://localhost:3000/api/rotationsmanager/"+idG,{
      newDayKey: new Date().setHours(0,0,0,0),
      totalschema: data4.length,
      totalgrupo: data6.length
    })
}

//Actualizar el dia clave de todo un grupo segun id de grupo en rotationsManagerFS
const updateDayKeyGroupFS= async (idG) => {
    
  return await axios
    .put("http://localhost:3000/api/rotationsmanager-fs/"+idG,{
      newDayKey: new Date().setHours(0,0,0,0),
      totalschema: data4.length,
      totalgrupo: data6.length
    })
}


//Agregar al Stack un programa y recargar el estado
const addStack= async () => {
    
  return await axios
    .post("http://localhost:3000/api/stacks/",{
      idschema: idRegUniversal,
      type: "Programa",
      order:data13.length+1,
      idprograma: progRef.current.value
    }), obtenerStacksByIdEsquema(idRegUniversal)
}

//Agregar al Stack un Secondary event y recargar el estado
const addStack2= async () => {
    
  return await axios
    .post("http://localhost:3000/api/stacks/",{
      idschema: idRegUniversal,
      type: "Secondary",
      order:data13.length+1,
      idprograma: secondaryRef.current.value
    }), obtenerStacksByIdEsquema(idRegUniversal)
}

//Agregar al Stack un custom y recargar el estado
const addStack3= async () => {
    
  return await axios
    .post("http://localhost:3000/api/stacks/",{
      idschema: idRegUniversal,
      type: "Custom",
      order:data13.length+1,
      idprograma: customRef.current.value,
      duration:durationRef.current.value
    }), obtenerStacksByIdEsquema(idRegUniversal)
}

//Agregar al Stack un label y recargar el estado
const addStack4= async () => {
    
  return await axios
    .post("http://localhost:3000/api/stacks/",{
      idschema: idRegUniversal,
      type: "Label",
      order:data13.length+1,
      idprograma: labelRef.current.value
    }), obtenerStacksByIdEsquema(idRegUniversal)
}

//Agregar al Stack un null y recargar el estado
const addStack5= async () => {
    
  return await axios
    .post("http://localhost:3000/api/stacks/",{
      idschema: idRegUniversal,
      type: "Null",
      order:data13.length+1,
      idprograma: "Null-30"
    }), obtenerStacksByIdEsquema(idRegUniversal)
}

//Agregar al Stack un tiempo fuera y recargar el estado
const addStack6= async () => {
    
  return await axios
    .post("http://localhost:3000/api/stacks/",{
      idschema: idRegUniversal,
      type: "TimeOut",
      order:data13.length+1,
      idprograma: "TimeOut",
      valor: timeOutRef.current.value,
    }), obtenerStacksByIdEsquema(idRegUniversal),timeOutRef.current.value="0"
}

//Actualizar el valor fijo en rotationsManager para un usuario que tieno o no turno fijo
const updateFijo= async (fijo,idus) => {
    
  return await axios
    .put("http://localhost:3000/api/rotationsmanager/actfijo/"+idus,{
      fijo:fijo
    })
    
}

const getTotalSchemas = ()=>{

  let respuesta; groupsRef.current.value

  data8.map((rotationmanager)=>(
    rotationmanager.groupId == groupsRef.current.value ? respuesta = rotationmanager.totalSchema : null
  ))

  if(respuesta==0)
  {
    respuesta = 0;
  }

  else{
    respuesta = respuesta-1;
  }
  return respuesta;
}


const getTotalSchemasFS = ()=>{

  let respuesta; groupsRef.current.value

  data16.map((rotationmanagerFS)=>(
    rotationmanagerFS.groupId == groupsRef.current.value ? respuesta = rotationmanagerFS.totalSchema : null
  ))

  if(respuesta==0)
  {
    respuesta = 0;
  }

  else{
    respuesta = respuesta-1;
  }
  return respuesta;
}

//Actualizar los valores necesarios para dejar el documento como cuando se crea automaticamente por primera vez
//Tambien decremento el numero total de esquemas ya que estoy eliminando y el "totalSchema" de mongoDB debe ser actualizado

const actualizarTotalSchema = async (idgrupo) =>{

  return await axios
    .put("http://localhost:3000/api/rotationsmanager/actualizartotalschema/"+idgrupo,{
      total:getTotalSchemas()
    })
}

//Actualizar los valores necesarios para dejar el documento como cuando se crea automaticamente por primera vez
//Tambien decremento el numero total de esquemas ya que estoy eliminando y el "totalSchema" de mongoDB debe ser actualizado esto en rotations managerFS

const actualizarTotalSchemaFS = async (idgrupo) =>{

  return await axios
    .put("http://localhost:3000/api/rotationsmanager-fs/actualizartotalschema/"+idgrupo,{
      total:getTotalSchemasFS()
    })
}



const updatePostDel= async (id) => {
    
  return await axios
    .put("http://localhost:3000/api/rotationsmanager/actualizarpostdel/"+id)
}

const updatePostDelFS= async (id) => {
    
  return await axios
    .put("http://localhost:3000/api/rotationsmanager-fs/actualizarpostdel/"+id)
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
        descanso: coffeeES,
        stack: pg
       

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
      getAllRotations(); /* => esta fue la solucion a cuando eliminaba y no actualizaba en rotations */
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
        actual: ac,
        dayKey: new Date(),
      });
  
      
  }

  const enviarFS = async (usNombre,usApellido,id,grupo,grupoid,scName,scID,ts,tg,ac)=>{

    await axios.post("http://localhost:3000/api/rotationsmanager-fs/", {
  
        nombreusuario: usNombre +" "+usApellido,
        userid: id,
        groupname: grupo, 
        groupid: grupoid,
        schemaname: scName,
        schemaid: scID,
        totalschema: ts,
        totalgroup: tg,
        actual: ac,
        dayKey: new Date(),
      });
  
      
  }

  

  const programClick = () =>
  {

    obtenerListadoGroupsPorID();
    obtenerListadoGroupsPorIDFs();
    getAllRotationsManager();

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
    setCoffeeFS(false); 

    //Esto es para limpiar el estado que uso en los stack
    setIdRegES("");
    setData13([]);
    setIdItem("");
    
  }

  
  const callItem1 =  (Nombres,horaInicio,horaFinal,id,order,ex,descanso,e)=>{

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

    //traigo los registros que esten asociados al id del esquema
    obtenerStacksByIdEsquema(id);

    //pasamos el nombre del item a un estado global para ser compartido por ES y FS
    setTitleDailyUniversal(Nombres);
    setIdRegUniversal(id);
   

     //Aqui lo que hago es cambiar los estilos para el iems seleccionado;
     if (e.target.classList=="item") 
     {
 
       let aux = document.getElementsByClassName("activo1");
 
       for (let index = 0; index < aux.length; index++) 
       {
         aux[index].classList.remove("activo1");
       }
 
       e.target.classList.add("activo1");
     }

  }

  const callItem2 =  (Nombres,horaInicio,horaFinal,id,order,ex,descanso,e)=>{

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

    //traigo los registros que esten asociados al id del esquema
    obtenerStacksByIdEsquema(id);

    //pasamos el nombre del item a un estado global para ser compartido por ES y FS
    setTitleDailyUniversal(Nombres);
    setIdRegUniversal(id);

    //Aqui lo que hago es cambiar los estilos para el iems seleccionado;
    
    if (e.target.classList=="item") 
    {

      let aux = document.getElementsByClassName("activo2");

      for (let index = 0; index < aux.length; index++) 
      {
        aux[index].classList.remove("activo2");
      }

      e.target.classList.add("activo2");
    }

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

    //Tambien debo actualizar la informacion correspondiente en RotationsManager
    await axios.put("http://localhost:3000/api/rotationsmanager/setname/", {
        id_esquema: idRegES,
        nuevonombre: newValueOne
        
    }),getAllRotationsManager()

    

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

    if(titleDaily=="------------------")
    {
      toast.error("No se ha seleccionado un Esquema semanal para eliminar");
    }

    else{
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
    
  }

  const DefinirDescanso = ()=>{
    setCoffeeES(!coffeeES);
  }

  const DefinirDescansoFs = ()=>{
    setCoffeeFS(!coffeeFS);
  }

  const EliminarRegistro = async ()=>{

    //Simplemete elimino el registro en rotations con el id que ya conocemos
    await axios.put("http://localhost:3000/api/rotations/delete/", {
      idreg: idRegES,
      
    }); 

    //Tambien elimino todos los stacks que se hayan creado bajo este esquema
    cleanStack();

    //Tambien debo actualizar la informacion de schemaName,schemaId,totalschema,totalgrupo,actual en rotationsmanager
    //ya que como elimino el esquema, queda inutilizable pero no debo eliminarlo si no actualizarlo bajo el schemaId
    updatePostDel(idRegUniversal);

    //actualizo tambien el nuevo TotalSchema ya que como elimine se debe descontar 1 esquema
    actualizarTotalSchema(groupsRef.current.value);


    setTitleDaily("------------------");
    obtenerListadoGroupsPorID();
    setNweValueOne("");
    setOrder("");
    setexcluirES(false);
    
  }

  const deleteFS = async ()=>{

    if(titleFs=="------------------")
    {
      toast.error("No se ha seleccionado un Esquema de fin de semana para eliminar");
    }

    else{
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
    
  }

  const save = async ()=>{
    toast.success("Aqui se deberia guardar");
  }

  const EliminarRegistro2 = async ()=>{

    //Simplemete elimino el registro con el id que ya conocemos
    await axios.put("http://localhost:3000/api/rotations/delete/", {
      idreg: idRegFS,
      
    });

    //Tambien elimino todos los stacks que se hayan creado bajo este esquema
    cleanStack();

    //Tambien debo actualizar la informacion de schemaName,schemaId,totalschema,totalgrupo,actual en rotationsmanager
    //ya que como elimino el esquema, queda inutilizable pero no debo eliminarlo si no actualizarlo bajo el schemaId
    updatePostDelFS(idRegUniversal);

    //actualizo tambien el nuevo TotalSchema ya que como elimine se debe descontar 1 esquema EN FINES DE SEMANA
    actualizarTotalSchemaFS(groupsRef.current.value);

    setNweValueTwo("");
    setOrderFS("");
    obtenerListadoGroupsPorIDFs();
    setexcluirFS(false);
  }


   const corroborarNombre =  (idNuevoSchema)=>{
    
    let nombreSchema;
    
    data9?.map((rotations)=>(
      idNuevoSchema == rotations._id && (nombreSchema = rotations.Nombre)
    ))

    
    return nombreSchema;

   }


   const corroborarActual =  (idNuevoSchema)=>{

    let Actual;

    data9?.map((item)=>(
      idNuevoSchema == item._id && (Actual = item.Order)
    ))

    return Actual;

   }


   const actualizar = (idUser,e)=>{


    //Aqui se ejecuta el proceso para actualizar la informacion
    //en la coleccion rotationsManager
    
     let idSchema,idGrupo,totalSchema,totalGrupo,actual;
     let DiaClave,newName;
     let globalIDUser = idUser;
     let globalNameSchema = corroborarNombre(e.target.value); 
     let globalActual = corroborarActual(e.target.value);
     
       data8?.map((rm)=>(
        
          idUser == rm.userId && 

          //TRAEMOS LA INFO PARA OPERARLA
          //Traigo el id del Schema
          (idSchema = rm.schemaId) && 

          //Traigo el id de grupo
          (idGrupo = rm.groupName) &&

          //Traigo totalSchema
          (totalSchema = rm.totalSchema) +

          //Traigo total Grupo
          (totalGrupo = rm.totalGrupo) +

          //Traigo Actual
          (actual = rm.actual) +

          //Traigo el dia clave
          (DiaClave = new Date(rm.dayKey).setHours(0,0,0,0))

          
        ))
      
        
        console.log("Id user... " + idUser);
        console.log("Nuevo valor... " + e.target.value);
        console.log("SchemaID... " + idSchema);
        console.log("Id Grupo... " + idGrupo);
        console.log("Total Schema... " + totalSchema);
        console.log("Total Grupo... " + totalGrupo);
        console.log("Actual... " + actual);
        console.log("Dia clave... " + DiaClave);

        //Operacion para saber que semana esta y hacer las operaciones correspondientes

        //Fecha actual 
        let fechaHoy = new Date().setHours(0,0,0,0);

        //DayKey aumentado 8 dias, es decir una semana
        let daykeyPlus = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+8);

        //Traer cual es el nombre del dia "Lunes..martes.." del dayKey 
        let NombreDia = new Date(DiaClave).getUTCDay();

        //Traigo el dia "1,3,5" del dayKey
        let diaDayKey = new Date(DiaClave).getDate();

        //Traigo el mes "0,1,2 hasta 11 que es diciembre" del dayKey
        let mesDayKey = new Date(DiaClave).getMonth();

        //Traigo el año "0,1,2 hasta 11 que es diciembre" del dayKey
        let añoDayKey = new Date(DiaClave).getFullYear();

        //VALIDACION PARA SABER SI EL DIA DEL (diaclave) ESTA ENTRE SEMANA O FIN DE SEMANA
        //--------------------------------------------------------------------------
  

        //Defino la nueva fecha de inicio de semana segun DiaClave
        let fechaInicioSemana;
        let fechaFinalSemana;
     

        /*Esta instruccion define un dia entre semana, es decir de lunes a viernes*/
        NombreDia <= 5 && NombreDia >= 1 
        && NombreDia == 1 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+0) , fechaFinalSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+4)) :     //Lunes
          NombreDia == 2 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-1) , fechaFinalSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+3)) :     //Martes
          NombreDia == 3 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-2) , fechaFinalSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+2)) :     //Miercoles
          NombreDia == 4 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-3) , fechaFinalSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+1)) :     //Jueves
          NombreDia == 5 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-4) , fechaFinalSemana = new Date(DiaClave)): null                                         //Viernes

          
      
          
          
          //Aqui deberia implemetar el procedimiento pero para fines de semana
        //: toast.error("EL DIA NO ES UN DIA ENTRE SEMANA, SE DEBERIA EJECUTAR EN LA LOGICA DE FINES DE SEMANA");

        //toast.success(new Date(DiaClave).toDateString() +"--"+ (new Date (fechaHoy)).toDateString());
        //toast.success("dayKeyPlus es.. "+ new Date(daykeyPlus).toLocaleDateString());
        //toast.success("El dia es.. "+ Dia);
        //toast.success("Fecha de inicio es.. "+ new Date(fechaInicioSemana).toDateString());
        //toast.success("Fecha final es.. "+ new Date(fechaFinalSemana).toDateString());

        //console.log("Fecha de inicio es.. "+ new Date(fechaInicioSemana).toDateString());
        //console.log("Fecha final es.. "+ new Date(fechaFinalSemana).toDateString());


        //AHORA PROCEDO A ACTUALIZAR  LA INFORMACION DENTRO DE LA TABLA ROTATIONSMANAGER SEGUN CORRESPONDA
        //-------------------------------------------------------------------------------------------------------------

        /* Actualizo la fecha en todo el grupo a la fecha actual y adicionalmente el nuevo nombre de turno o nombre eschema para el usuario */
        

        /* Defino el totalSchema que es un numero entero que define cuantos schemas de grupo hay */
        let totalschema = data4.length;

        /* defino cuantos usuarios hay en el grupo ACTIVOS los inactivos no cuentan*/
        let totalG = data6.length;

        //Cuando no son iguales disparo la advertencia de que se debe equilibrar el sistema
        if(totalschema != totalG  )
        {
          Swal.fire({
            title: "<h6>El número de personas y de esquemas, no es el mismo. Corrija agregando Users Balancers o agregando o quitando esquemas para equilibrar el sistema y proceder a asignar un esquema al trabajador</h6>",
            showDenyButton: false,
            showCancelButton: false,
            confirmButtonText: "OK",
            //denyButtonText: `Confirmar`,
            footer: `<h4>Hay ${totalG} Personas activas y ${totalschema} Esquemas</h4>`,
            
          })
            
            
        }

        else{
          //como el numero de usuarios del grupo y el numero de esquemas es el mismo actualizo la informacion correspondiente
          updateDayKeyGroup(idGrupo);

          //actualizo el nombre des schema para el usuario al igual que el index del schema
          updateIndex(globalIDUser,globalNameSchema,globalActual,e.target.value,totalschema,totalG);

          //Envio un memsaje de notificacion de los cambios
          toast.success("Información actualizada");
          
        }
        
   }

   const actualizarFS = (idUser,e)=>{
    
    //Aqui se ejecuta el proceso para actualizar la informacion
    //en la coleccion rotationsManagerFS
    
    let idSchema,idGrupo,totalSchema,totalGrupo,actual;
    let DiaClave,newName;
    let globalIDUser = idUser;
    let globalNameSchema = corroborarNombre(e.target.value); 
    let globalActual = corroborarActual(e.target.value);

    data16?.map((rm)=>(
        
      idUser == rm.userId && 

      //TRAEMOS LA INFO PARA OPERARLA
      //Traigo el id del Schema
      (idSchema = rm.schemaId) && 

      //Traigo el id de grupo
      (idGrupo = rm.groupName) &&

      //Traigo totalSchema
      (totalSchema = rm.totalSchema) +

      //Traigo total Grupo
      (totalGrupo = rm.totalGrupo) +

      //Traigo Actual
      (actual = rm.actual) +

      //Traigo el dia clave
      (DiaClave = new Date(rm.dayKey).setHours(0,0,0,0))

      
    ))

        console.log("Id user... " + idUser);
        console.log("Nuevo valor... " + e.target.value);
        console.log("SchemaID... " + idSchema);
        console.log("Id Grupo... " + idGrupo);
        console.log("Total Schema... " + totalSchema);
        console.log("Total Grupo... " + totalGrupo);
        console.log("Actual... " + actual);
        console.log("Dia clave... " + DiaClave);

        //Operacion para saber que semana esta y hacer las operaciones correspondientes

        //Fecha actual 
        let fechaHoy = new Date().setHours(0,0,0,0);

        //DayKey aumentado 8 dias, es decir una semana
        let daykeyPlus = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+8);

        //Traer cual es el nombre del dia "Lunes..martes.." del dayKey 
        let NombreDia = new Date(DiaClave).getUTCDay();

        //Traigo el dia "1,3,5" del dayKey
        let diaDayKey = new Date(DiaClave).getDate();

        //Traigo el mes "0,1,2 hasta 11 que es diciembre" del dayKey
        let mesDayKey = new Date(DiaClave).getMonth();

        //Traigo el año "0,1,2 hasta 11 que es diciembre" del dayKey
        let añoDayKey = new Date(DiaClave).getFullYear();

        //VALIDACION PARA SABER SI EL DIA DEL (diaclave) ESTA ENTRE SEMANA O FIN DE SEMANA
        //--------------------------------------------------------------------------

        //Defino la nueva fecha de inicio de semana segun DiaClave
        let fechaInicioSemana;
        let fechaFinalSemana;
     

        /*Esta instruccion define un dia entre semana, es decir de lunes a viernes*/
        NombreDia <= 5 && NombreDia >= 1 
        && NombreDia == 1 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+0) , fechaFinalSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+4)) :    //Lunes
          NombreDia == 2 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-1) , fechaFinalSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+3)) :     //Martes
          NombreDia == 3 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-2) , fechaFinalSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+2)) :     //Miercoles
          NombreDia == 4 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-3) , fechaFinalSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+1)) :     //Jueves
          NombreDia == 5 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-4) , fechaFinalSemana = new Date(DiaClave))                                               //Viernes


        //Aqui deberia implemetar el procedimiento pero para fines de semana
        : null


         //AHORA PROCEDO A ACTUALIZAR  LA INFORMACION DENTRO DE LA TABLA ROTATIONSMANAGERFS SEGUN CORRESPONDA
        //-------------------------------------------------------------------------------------------------------------

        /* Defino el totalSchema que es un numero entero que define cuantos schemas de grupo hay en FS */
        let totalschema = data5.length;

        /* defino cuantos usuarios hay en el grupo */
        let totalG = data6.length;

       //Cuando no son iguales disparo la advertencia de que se debe equilibrar el sistema
       if(totalschema != totalG  )
       {
         Swal.fire({
           title: "<h6>El número de personas y de esquemas para fines de semana, no es el mismo. Corrija agregando Users Balancers o agregando o quitando esquemas para equilibrar el sistema y proceder a asignar un esquema al trabajador</h6>",
           showDenyButton: false,
           showCancelButton: false,
           confirmButtonText: "OK",
           //denyButtonText: `Confirmar`,
           footer: `<h4>Hay ${totalG} Personas activas y ${totalschema} Esquemas</h4>`,
           
         })
           
           
       }

        else{
          //como el numero de usuarios del grupo y el numero de turno es el mismo actualizo la informacion correspondiente
          updateDayKeyGroupFS(idGrupo);
        
          //actualizo el nombre de schema para el usuario al igual que el index del schema
          updateIndexFS(globalIDUser,globalNameSchema,globalActual,e.target.value,totalschema,totalG);

          //Envio un memsaje de notificacion de los cambios
          toast.success("Información actualizada");
          
        }

   }

   const setChangeFijo = (iduser,e,fj)=>{ 

    //Aqui debo actualizar en rotationsManager el valor de fijo que es true o false, y hacerlo segun su id de payroll
    updateFijo(e.target.checked,iduser)
    obtenerListadoGroupsPorID();
    obtenerListadoGroupsPorIDFs();
    getAllRotationsManager();
   
   }

  //Cambiamos estado para los check segun corresponda
  const handleOnChangeLunes = () => {
    setCheckLunes(!checkLunes);
  };

  const select2 = (actual,e)=>{
    //guardar en un estado el item seleccionado para poder borrarlo
    setIdItem(actual);

     //Aqui lo que hago es cambiar los estilos para el iems seleccionado;
     if (e.target.classList=="main1") 
     {
 
       let aux = document.getElementsByClassName("activo");
 
       for (let index = 0; index < aux.length; index++) 
       {
         aux[index].classList.remove("activo");
       }
 
       e.target.classList.add("activo");
     }
 
  }

  const select3 = (actual,e)=>{
    //guardar en un estado el item seleccionado para poder borrarlo
    setIdItem(actual);

     //Aqui lo que hago es cambiar los estilos para el iems seleccionado;
     if (e.target.classList=="main2") 
     {
 
       let aux = document.getElementsByClassName("activo");
 
       for (let index = 0; index < aux.length; index++) 
       {
         aux[index].classList.remove("activo");
       }
 
       e.target.classList.add("activo");
     }
 
  }

  const select4 = (actual,e)=>{
    //guardar en un estado el item seleccionado para poder borrarlo
    setIdItem(actual);

     //Aqui lo que hago es cambiar los estilos para el iems seleccionado;
     if (e.target.classList=="main3") 
     {
 
       let aux = document.getElementsByClassName("activo");
 
       for (let index = 0; index < aux.length; index++) 
       {
         aux[index].classList.remove("activo");
       }
 
       e.target.classList.add("activo");
     }
 
  }

  //FUNCIONES PARA LA PARTE DE LOS STACK
  //-------------------------------------------------------------------------------------------------------------------------

  const programa = ()=>{
    if(idRegUniversal=="" || idRegUniversal==undefined)
    {
      toast.error("Para agregar un programa al stack primeramente debe haber seleccionado un grupo y posteriormente un esquema");
    }

    else{
      addStack();
      toast.success("Program agregado al stack ");
      
    }

    
  }

  const SecondaryEvent = ()=>{
    if(idRegUniversal=="" || idRegUniversal==undefined)
    {
      toast.error("Para agregar un programa al stack primeramente debe haber seleccionado un grupo y posteriormente un esquema");
    }

    else{
      addStack2();
      toast.success("Secondary Event agregado al stack ");
      
    }
  }


  const custom = ()=>{
    if(idRegUniversal=="" || idRegUniversal==undefined)
    {
      toast.error("Para agregar un programa al stack primeramente debe haber seleccionado un grupo y posteriormente un esquema");
    }

    else if(durationRef.current.value=="")
    {
      toast.error("La duracion en minutos del Custom que quieres agregar no puede estar vacio");
      durationRef.current.focus();
    }

    else if(customRef.current.value == "")
    {
      toast.error("El evento Custom que quieres agregar no puede estar vacio");
      customRef.current.focus();
    }

    else{
      addStack3();
      toast.success("Custom agregado al stack ");
      
    }
  }

  const label = ()=>{
    if(idRegUniversal=="" || idRegUniversal==undefined)
    {
      toast.error("Para agregar un programa al stack primeramente debe haber seleccionado un grupo y posteriormente un esquema");
    }

    else{
      addStack4();
      toast.success("Label agregado al stack ");
      
    }
  }

  //Agregar al Stack un programa y recargar el estado
const addSt= async (tipo,orden,idPGM,valor,duracion) => {
    
  return await axios
    .post("http://localhost:3000/api/stacks/",{
      idschema: idRegUniversal,
      type: tipo,
      order:orden,
      idprograma: idPGM,
      duration:duracion

    }), obtenerStacksByIdEsquema(idRegUniversal)
    

    
}

  const llenar = ()=>{
    //debo traer la informacion del stack guardado y operar segun corresponda
    //para traer dicha informacion debo usar el id del stack guardado que esta en (itemLoadRef.current.value)

    data15?.map((stackSaved)=>(
      stackSaved._id == itemLoadRef.current.value && 
      
      stackSaved.Stack.map((stack)=>(
        addSt(stack.type,stack.order,stack.itemName,stack.Value,stack.Duration)
  
      ))
      

      
      
    ))

    
  }

  const loadStack = async ()=>{
    //hago la operacion para borrar todos los items que esten bajo el id del schema
    //despues y en la misma llamada asyncrona traigo los datos del stack y los actualizo en la DB
    return await axios
    .delete("http://localhost:3000/api/stacks/deleteall/"+idRegUniversal)
    .then((response) => setData14(response.data)), 
    //obtenerStacksByIdEsquema(idRegUniversal),
    llenar();
    
  }

  const load = ()=>{

     //primero valido que haya un grupo y us schema seleccionado para poder cargar el estado a un schema
     if(groupsRef.current.value == "none" || idRegUniversal == "")
     {
        toast.error("Para cargar unstack primero debe seleccionar un grupo y luego un esquema");
     }

     else{
    //Segundo advierto de la opcion que se ha seleccionado y procedo segun corresponda
      Swal.fire({
        title: "¿Realmente desea cargar el stack seleccionado?. El actual stack se perderá si no se ha guardado previamente",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "No",
        denyButtonText: `Si, Borra actual y cargar`,
        footer: '<h6>Gestión Manager Citytv</h6>',
        
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          //Swal.fire("Saved!", "", "success");
        } else if (result.isDenied) 
        {
          loadStack();
          Swal.fire("Stack cargado con exito", "", "success");
        }
      });
     }

  }

  const saveStack = async()=>{
    if(nameStackRef.current.value == "")
    {
      toast.error("No se puede guardar un stack sin proporcionar un nombre que lo defina");
      nameStackRef.current.focus();
    }
    else{
      //Procedemos a guardar el stack
      await axios.post("http://localhost:3000/api/stacks-saved/", {
        namestack: nameStackRef.current.value,
        stack: 
              
               data13?.map((item)=>(
                {
                  "itemID":item._id,
                  "itemName":item.ID_programa,
                  "order":item.Order,
                  "type":item.Type,
                  "Value":item.Value,
                  "Duration":item.Duration,
                }
               ))
              
    }),obtenerStackSaved(),
       nameStackRef.current.value="";

    toast.success("Stack con el nombre " + nameStackRef.current.value + " Guardado" );
    }
    
  }

  const null30 = ()=>{
    if(idRegES=="" || idRegES==undefined)
    {
      toast.error("Para agregar un Null al stack primeramente debe haber seleccionado un grupo y posteriormente un esquema");
    }

    else{
      addStack5();
      toast.success("Null agregado al stack ");
      
    }
  }

  const timeOut = ()=>{
    if(idRegES=="" || idRegES==undefined)
    {
      toast.error("Para agregar un TimeOut al stack primeramente debe haber seleccionado un grupo y posteriormente un esquema");
    }

    
    else if(timeOutRef.current.value=="" || timeOutRef.current.value==0)
    {
      toast.error("Debe especificar un tiempo en minutos");
      timeOutRef.current.focus();
    }

    else{

      addStack6();
      toast.success("Tiempo fuera agregado al stack ");
      
    }
  }

  const delItem = async () =>{
    return await axios
      .delete("http://localhost:3000/api/stacks/"+idItem)
      .then((response) => setData14(response.data)), obtenerStacksByIdEsquema(idRegUniversal);
  }

  const del = async ()=>{

    if(itemGlobal==null)
    {
        toast.error("Para eliminar un elemento del Stack primero debe seleccionarlo");
    }

    else{

      //Primero advierto de la opcion que se ha seleccionado y procedo segun corresponda
    Swal.fire({
      title: "¿Realmente desea eliminar el item del Stack?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "No",
      denyButtonText: `Si, Borrar`,
      footer: '<h6>Gestión Manager Citytv</h6>',
      
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        //Swal.fire("Saved!", "", "success");
      } else if (result.isDenied) 
      {
        delItem();
        Swal.fire("Item Eliminado", "", "success");
      }
    });

    }

    
    
    
  }

  const cleanStack = async ()=>{
     //hago la operacion para borrar todos los items que esten bajo el id del schema
    //despues y en la misma llamada asyncrona traigo los datos del stack y los actualizo en la DB
    return await axios
    .delete("http://localhost:3000/api/stacks/deleteall/"+idRegUniversal)
    .then((response) => setData14(response.data)) , obtenerStacksByIdEsquema(idRegUniversal);
  
  }

  const clean = () =>{
    //primero valido que haya un grupo y us schema seleccionado para poder cargar el estado a un schema
    if(groupsRef.current.value == "none" || idRegUniversal == "")
    {
       toast.error("Para limpiar unstack primero debe seleccionar un grupo y luego un esquema");
    }

    else{
   //Segundo advierto de la opcion que se ha seleccionado y procedo segun corresponda
     Swal.fire({
       title: "¿Realmente desea limpiar la lista del el stack seleccionado?.",
       showDenyButton: true,
       showCancelButton: false,
       confirmButtonText: "No",
       denyButtonText: `Si, Limpiar`,
       footer: '<h6>Gestión Manager Citytv</h6>',
       
     }).then((result) => {
       /* Read more about isConfirmed, isDenied below */
       if (result.isConfirmed) {
         //Swal.fire("Saved!", "", "success");
       } else if (result.isDenied) 
       {
         cleanStack();
         Swal.fire("Elementos del Stack eliminados", "", "success");
       }
     });
    }
  }

  const searchOrder = ()=>{

    data13?.map((stack)=>(
      stack._id == idItem && (orderactual = stack.Order)
    ))

    return orderactual;
  }

  const up = async ()=>{
    //Determino cuantos items tiene el Stack
    let count = data13.length;
    let actual = searchOrder();

    //Arreglo para saber a que numero actualizar
    if(parseInt(actual) > 0  && parseInt(actual) <= count)
    {
      actual = actual - 1;
    }


    return await axios
    .put("http://localhost:3000/api/stacks/"+idItem,{
      nuevo:  actual
    }),obtenerStacksByIdEsquema(idRegUniversal);
   
  
      

  }

  const down = async ()=>{
    //Determino cuantos items tiene el Stack
    let count = data13.length;
    let actual = searchOrder();

    //Arreglo para saber a que numero actualizar
    if(parseInt(actual) >= 0  && parseInt(actual) <= count)
    {
      actual = actual + 1;
    }

  
    

    return await axios
    .put("http://localhost:3000/api/stacks/"+idItem,{
      nuevo:  actual
    }),obtenerStacksByIdEsquema(idRegUniversal);
   
  }

  const delStackSaved = async ()=>{
    
    return await axios
      .delete("http://localhost:3000/api/stacks-saved/"+itemLoadRef.current.value)
      .then((response) => setData14(response.data)), obtenerStackSaved();
  }

 
  const delSaved = ()=>{

    if(itemLoadRef.current.value=="")
    {
      toast.error("Para eliminar un stack guardado primero debe seleccionarlo de la lista desplegable");
      itemLoadRef.current.focus();
    }

    else
    {
      //Segundo advierto de la opcion que se ha seleccionado y procedo segun corresponda
    Swal.fire({
      title: "¿Realmente desea eliminar el stack guardado?.",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "No",
      denyButtonText: `Si, Borrar`,
      footer: '<h6>Gestión Manager Citytv</h6>',
      
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        //Swal.fire("Saved!", "", "success");
      } else if (result.isDenied) 
      {
        delStackSaved();
        Swal.fire("Stack Borrado", "", "success");
      }
    });
    }
    
    
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
  }, [titleDaily]);

  useEffect(() => {
    getAllRotationsManagerFS();
  }, [titleFs]);

  useEffect(()=>{
    getAllRotations();
  },[]);
  
  useEffect(() => {
    obtenerListadoPrograms();
  }, []);

  useEffect(() => {
    obtenerListadoProgramsPrimary();
  }, []);

  useEffect(() => {
    obtenerListadoProgramsSecondary();
  }, []);

  useEffect(() => {
    obtenerStackSaved();
  }, []);


 

  return (
    <div className="contentRotations">
      <Toaster />
      <div className="asignations">
        <div>
          {
            data6?.map((peoleOfGroup)=>( 
              peoleOfGroup.activo==true ?
              <div className="asiganation_li" key={peoleOfGroup._id}>
                <span className={peoleOfGroup.cargo=="USERBALANCER" ? "usersRotations2":"usersRotations"}>
                {peoleOfGroup.nombres + " " + peoleOfGroup.apellidos}
                </span>
              
              <div className="asiganations_option" key={peoleOfGroup._id}>

              
                <select className="asignation_select"  onChange={(e) => actualizar(peoleOfGroup._id,e)}>
                  <option key={peoleOfGroup._id} > 
                    {
                        //item.nombres
                        data8?.map((rm)=>(
                          peoleOfGroup._id == rm.userId  && rm.SchemaName
                          
                        ))
                    }
                  </option>
                  {
                      
                      data4?.map((schemaname)=>(
                       <option key={schemaname._id}  value={schemaname._id}>
                          {schemaname.Nombre}
                       </option>
                     ))
                     
                   
                 }
                    
                  
                </select>

                <select className="asignation_select" onChange={(e) => actualizarFS(peoleOfGroup._id,e)}>

                <option key={peoleOfGroup._id} > 
                    {
                        //item.nombres
                        data16?.map((rmFS)=>(
                          peoleOfGroup._id == rmFS.userId  && rmFS.SchemaName
                          
                        ))
                    }
                  </option>
                {
                      
                      data5?.map((schemaname)=>(
                        <option key={schemaname._id}  value={schemaname._id}>
                        {schemaname.Nombre}
                     </option>
                     ))
                     
                   
                 }
                </select>

                <span className="fijoSpan">
                  Fijo
                 </span>

                    {
                       data8?.map((rm)=>(
                        peoleOfGroup._id == rm.userId &&
                        <input type="checkbox" ref={fijoRef}
                        checked={rm.fijo}
                        className="checkFijo" onChange={(e) =>  setChangeFijo(peoleOfGroup._id,e,rm.fijo)} 
                        key={rm.userId}/>
                        
                      ))
                    }
                   
                 </div>
              
          </div>
          :null
            ))
              
          }
          
        </div>

       
      </div>

      
    
        
       
        
      


      <div className="subTitulo">
        Grupos
        <select className="inputDir" onChange={()=> programClick()} ref={groupsRef}>
        <option  value={"none"}>{"-----------------------------------"}</option>
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
                  <p className="item" key={nombres._id} onClick={(e)=> callItem1(nombres.Nombre,nombres.HoraInicio,nombres.HoraFinal,nombres._id,nombres.Order,nombres.Excluir,nombres.Descanso,e)}>{nombres.Nombre}<span className="id">P : {nombres.Order}</span></p>
                  
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

      <div className="pgms1">
        <div className="pgms1_cabezal">
          Stack Programs {" " + titleDailyUniversal}
        </div>
        <div className="contenedorLista">
        <ul className="pgms">
            {
              
               data13?.map((pgms)=>(
              
                itemGlobal=pgms._id,
                 <li key={pgms._id} className="active" >
                  <img src={Arrow} className="arrow" />
                  {
                    
                    pgms.Type == "Programa" || pgms.Type == "Secondary"  || pgms.Type == "Label" ? 

                    data10?.map((prog)=>(
                      <p onClick={(e)=>select2(pgms._id,e) } className="main1" key={prog._id}>{prog._id == pgms.ID_programa && prog.nombre 
                        
                      }</p> 
                    )) 
                    
                    :  pgms.Type == "Custom" ? <p  onClick={(e)=>select3(pgms._id,e)} className="main2">{pgms.ID_programa !=undefined ? pgms.ID_programa + " ("+ pgms.Duration +" Minutos)" :""}</p>

                    : <p onClick={(e)=>select4(pgms._id,e)} className="main3">{pgms.ID_programa  + " " +  (pgms.Value !=undefined ? pgms.Value + " Minutos" : "")}</p>

                    
                  }
                </li>

                    ))
             }
             {
              pg.map((item)=>(item.id+"-"+item.pgm))
              // {//pg.push({id:pgmsRef.current.checked==true && pgms._id,pgm:pgms.nombre})}
             }
          </ul>
            <div className="levels">
              <p><img src={Up} className="levels-image" onClick={up}></img></p>
              <p><img src={Down} className="levels-image" onClick={down}></img></p>
            </div>

            <div className="pgms-actions">
              <div className="pgms-actions-clean" onClick={clean}>
                <img src={Brush} alt="limpiar" />
              </div>
              <div className="pgms-actions-del" onClick={del}>
              <img src={Delete} alt="eliminar" />
              </div>
            </div>
        </div>
          <div className="funciones">
            <div className="Title">
              Program
            </div>
            <select className="Title-program" ref={progRef}>
            {
              data12?.map((program)=>(
                <option key={program._id} value={program._id}>{program.nombre}</option>
              )) 
            }
            </select>
            <div className="pgm-bottom" onClick={programa}>
              Agregar
            </div>

            <div className="Title">
              Secondary Event
            </div>
            <select className="Title-program" ref={secondaryRef}>
            {
              data11?.map((program)=>(
                <option key={program._id} value={program._id}>{program.nombre}</option>
              )) 
            }
            </select>
            <div className="pgm-bottom" onClick={SecondaryEvent}>
              Agregar
            </div>

            <div className="Title">
              Custom
            </div>
            <input type="number" className="timeOutInput" ref={durationRef} /> Minutos
            <input type="text" className="custom" ref={customRef} placeholder="Especifique..."/>
            <div className="pgm-bottom" onClick={custom}>
              Agregar
            </div>


            <div className="Title">
              Label
            </div>
            <select className="Title-program" ref={labelRef}>
            {
              data10?.map((program)=>(
                <option key={program._id} value={program._id}>{program.nombre}</option>
              )) 
            }
            </select>
            <div className="pgm-bottom" onClick={label}>
              Agregar
            </div>

          
            <div className="Title">
              Load Stack
            </div>
            <select className="Title-program" ref={itemLoadRef}>
            {
              data15?.map((saved)=>(
                <option key={saved._id} value={saved._id}>{saved.NameStack}</option>
              )) 
            }
            </select>
            <div className="pgm-bottom" onClick={load}>
              Load..
            </div>
            <div className="pgm-bottom-del" onClick={delSaved}>
              Delete
            </div>


            <div className="Title">
              Save Stack
            </div>
            <input type="text" className="custom" ref={nameStackRef}/>
            <div className="pgm-bottom" onClick={saveStack}>
              Save
            </div>



            

            <div className="Title space">
              Time Out
            </div>

            <input type="number" className="timeOutInput" ref={timeOutRef} /> Minutos

            <div className="pgm-bottom-3" onClick={timeOut}>
              <label className="timeOutLb1">Time Out</label>
            </div>

            <div className="Title">
              Null
            </div>
            <div className="pgm-bottom-2" onClick={null30}>
              Null 30 Minutos
            </div>
            


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
                  <p className="item" key={nombres._id} onClick={(e)=> callItem2(nombres.Nombre,nombres.HoraInicio,nombres.HoraFinal,nombres._id,nombres.Order,nombres.Excluir,nombres.Descanso,e)}>{nombres.Nombre}<span className="id">P : {nombres.Order}</span></p>
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
