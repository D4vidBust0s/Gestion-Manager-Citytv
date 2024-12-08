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
  const [data9, setData9] = useState([]);
  const [data10, setData10] = useState([]);

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
  let aux2;
 

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
  
  //Trae todos los registros de rotations
  const getAllRotations = async ()=>{
    return await axios
    .get("http://localhost:3000/api/rotations/")
    .then((response) => setData9(response.data));  

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

//Actualizar el dia clave de todo un grupo segun id de grupo en rotationsManager
const updateDayKeyGroup= async (idG) => {
    
  return await axios
    .put("http://localhost:3000/api/rotationsmanager/"+idG,{
      newDayKey: new Date().setHours(0,0,0,0),
      totalschema: data4.length,
      totalgrupo: data6.length
    })
}

//Actualizar el index del turno actual y el nombre des schema en rotationsManager para un usuario
const updateIndex= async (idUs,nameSchema,Actual,idSchema) => {
    
  return await axios
    .put("http://localhost:3000/api/rotationsmanager/update/"+idUs,{
      nameschema:  nameSchema,
      actual: Actual,
      idschema: idSchema
    })
    
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
        actual: ac,
        dayKey: new Date(),
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

   const corroborarNombre =  (idNuevoSchema)=>{

    let nombreSchema;

    data9?.map((item)=>(
      idNuevoSchema == item._id && (nombreSchema = item.Nombre)
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
        ? NombreDia == 1 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+0) , fechaFinalSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+4)) :     //Lunes
          NombreDia == 2 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-1) , fechaFinalSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+3)) :     //Martes
          NombreDia == 3 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-2) , fechaFinalSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+2)) :     //Miercoles
          NombreDia == 4 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-3) , fechaFinalSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()+1)) :     //Jueves
          NombreDia == 5 ? (fechaInicioSemana = new Date(DiaClave).setDate(new Date(DiaClave).getDate()-4) , fechaFinalSemana = new Date(DiaClave)): null                                         //Viernes

          
      
          
          
          //Aqui deberia implemetar el procedimiento pero para fines de semana
        : toast.error("EL DIA NO ES UN DIA ENTRE SEMANA, SE DEBERIA EJECUTAR EN LA LOGICA DE FINES DE SEMANA");

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

        /* defino cuantos usuarios hay en el grupo */
        let totalG = data6.length;

        

        if(totalschema != totalG  )
        {
            toast.error("El número de personas y de esquemas, no es el mismo, corrija para poder asignar un esquema al usuario");
            toast.custom("Esquemas = "+ totalschema + " --- " + "Personas = "+totalG);
        }

        else{
          //como el numero de usuarios del grupo y el numero de turno es el mismo actualizo la informacion correspondiente
          updateDayKeyGroup(idGrupo);

        


          //actualizo el nombre des schema para el usuario al igual que el index del schema
          updateIndex(globalIDUser,globalNameSchema,globalActual,e.target.value);

          //console.log("---------------------------------------")
          //console.log(" e.target.value " + e.target.value)

          //Envio un memsaje de notificacion de los cambios
          toast.success("Información actualizada");
          getAllRotationsManager();
        }
        
   }







   const actualizarFS = ()=>{
    toast.success("Aqui se deberia guardar el item seleccionado para FIN DE SEMANA");
   }

   const setChangeFijo = ()=>{
    toast.error("Fijo esta pendiente por ser implementado, recordar que es válido solo para turnos entre semana");
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

  useEffect(()=>{
    getAllRotations();
  },[]);
  

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
            data6?.map((peoleOfGroup)=>(
              <li className="asiganation_li" key={peoleOfGroup._id}>
              {peoleOfGroup.nombres + " " + peoleOfGroup.apellidos} 
              <span className="asiganations_option">
              
                <select className="asignation_select"  onChange={(e) => actualizar(peoleOfGroup._id,e)}>
                  <option> 
                    {
                        //item.nombres
                        data8?.map((rm)=>(
                          peoleOfGroup._id == rm.userId && rm.schemaId && rm.SchemaName
                          
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

                <select className="asignation_select" onChange={() => actualizarFS()}>
                {
                      
                      data5?.map((item)=>(
                       <option key={item._id}>
                          {item.Nombre}
                       </option>
                     ))
                     
                   
                 }
                </select>

                <span className="fijoSpan">Fijo</span><input type="checkbox"  className="checkFijo" onChange={setChangeFijo}/>
                
                
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
